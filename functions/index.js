const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Initialize Twilio client using environment variables (.env file in functions/)
function getTwilioClient() {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_TOKEN;
  const twilio = require("twilio");
  return twilio(accountSid, authToken);
}

function getTwilioPhone() {
  return process.env.TWILIO_PHONE;
}

/**
 * Send an SMS via Twilio. Logs and swallows errors so one failure
 * doesn't stop processing the remaining promises.
 */
async function sendSMS(to, body) {
  try {
    const client = getTwilioClient();
    const from = getTwilioPhone();
    console.log(`Sending SMS to ${to}: ${body}`);
    const message = await client.messages.create({ body, from, to });
    console.log(`SMS sent successfully. SID: ${message.sid}`);
    return true;
  } catch (err) {
    console.error(`Failed to send SMS to ${to}:`, err.message);
    return false;
  }
}

/**
 * Look up the business owner's phone number for escalation.
 * Path: promises doc → businessId → businesses doc → ownerId → users doc → phone
 */
async function getBusinessOwnerPhone(businessId) {
  try {
    const businessDoc = await db.collection("businesses").doc(businessId).get();
    if (!businessDoc.exists) {
      console.warn(`Business ${businessId} not found`);
      return null;
    }
    const ownerId = businessDoc.data().ownerId;
    if (!ownerId) {
      console.warn(`Business ${businessId} has no ownerId`);
      return null;
    }
    const userDoc = await db.collection("users").doc(ownerId).get();
    if (!userDoc.exists) {
      console.warn(`Owner user ${ownerId} not found`);
      return null;
    }
    const phone = userDoc.data().phone;
    if (!phone) {
      console.warn(`Owner ${ownerId} has no phone number`);
      return null;
    }
    return phone;
  } catch (err) {
    console.error(`Error fetching owner phone for business ${businessId}:`, err.message);
    return null;
  }
}

/**
 * Look up the phone number of the user who created the promise.
 */
async function getCreatorPhone(createdBy) {
  try {
    const userDoc = await db.collection("users").doc(createdBy).get();
    if (!userDoc.exists) {
      console.warn(`Creator user ${createdBy} not found`);
      return null;
    }
    const phone = userDoc.data().phone;
    if (!phone) {
      console.warn(`Creator ${createdBy} has no phone number`);
      return null;
    }
    return phone;
  } catch (err) {
    console.error(`Error fetching creator phone for ${createdBy}:`, err.message);
    return null;
  }
}

/**
 * Format a Firestore Timestamp into a human-readable string.
 */
function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "unknown date";
  return timestamp.toDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Scheduled function: runs every 15 minutes ──────────────────────────
exports.checkPromises = onSchedule("every 15 minutes", async (event) => {
    console.log("checkPromises: starting run at", new Date().toISOString());

    const now = new Date();
    const nowMs = now.getTime();

    // Query all open / overdue promises (anything not "done")
    let snapshot;
    try {
      snapshot = await db
        .collection("promises")
        .where("status", "in", ["open", "overdue"])
        .get();
    } catch (err) {
      console.error("Failed to query promises:", err.message);
      return null;
    }

    console.log(`checkPromises: found ${snapshot.size} non-done promises`);

    const updates = [];

    for (const docSnap of snapshot.docs) {
      try {
        const promise = docSnap.data();
        const promiseId = docSnap.id;
        const dueDate = promise.dueDate;

        if (!dueDate || !dueDate.toDate) {
          console.warn(`Promise ${promiseId} has no valid dueDate, skipping`);
          continue;
        }

        const dueDateMs = dueDate.toDate().getTime();
        const msUntilDue = dueDateMs - nowMs;
        const msSinceDue = nowMs - dueDateMs;
        const description = promise.description || "something";
        const customerName = promise.customerName || "a customer";
        const formattedDue = formatDate(dueDate);

        // ── 30-minute reminder (before due) ──────────────────────
        if (
          msUntilDue > 0 &&
          msUntilDue <= 30 * 60 * 1000 &&
          !promise.reminderSent
        ) {
          console.log(`Promise ${promiseId}: sending 30-min reminder`);
          const creatorPhone = await getCreatorPhone(promise.createdBy);
          if (creatorPhone) {
            const msg =
              `Reminder: You promised to ${description} for ${customerName}` +
              ` by ${formattedDue}. Please handle it or mark it done in Promise Tracker.`;
            await sendSMS(creatorPhone, msg);
          }
          updates.push(
            docSnap.ref.update({ reminderSent: true })
          );
        }

        // ── 1-hour escalation (after due) ────────────────────────
        if (
          msSinceDue >= 60 * 60 * 1000 &&
          !promise.escalated
        ) {
          console.log(`Promise ${promiseId}: 1-hour escalation`);
          const ownerPhone = await getBusinessOwnerPhone(promise.businessId);
          if (ownerPhone) {
            const msg =
              `ESCALATION: ${customerName} was promised ${description}` +
              ` by ${formattedDue} and nobody has handled it. Please check Promise Tracker.`;
            await sendSMS(ownerPhone, msg);
          }
          updates.push(
            docSnap.ref.update({ status: "overdue", escalated: true })
          );
        }

        // ── 24-hour second escalation ────────────────────────────
        if (
          msSinceDue >= 24 * 60 * 60 * 1000 &&
          !promise.escalatedTwice
        ) {
          console.log(`Promise ${promiseId}: 24-hour second escalation`);
          const ownerPhone = await getBusinessOwnerPhone(promise.businessId);
          if (ownerPhone) {
            const msg =
              `ESCALATION: ${customerName} was promised ${description}` +
              ` by ${formattedDue} and nobody has handled it. Please check Promise Tracker.`;
            await sendSMS(ownerPhone, msg);
          }
          updates.push(
            docSnap.ref.update({ escalatedTwice: true })
          );
        }
      } catch (err) {
        console.error(`Error processing promise ${docSnap.id}:`, err.message);
        // Continue with remaining promises
      }
    }

    // Wait for all Firestore updates to complete
    if (updates.length > 0) {
      try {
        await Promise.all(updates);
        console.log(`checkPromises: applied ${updates.length} updates`);
      } catch (err) {
        console.error("Error applying batch updates:", err.message);
      }
    }

    console.log("checkPromises: finished run");
    return null;
  });
