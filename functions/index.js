const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// SMS provider: Vonage Messages API

admin.initializeApp();
const db = admin.firestore();

// Initialize Gmail SMTP transporter
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Format a phone number to E.164-ish format required by Vonage: "1XXXXXXXXXX"
 * (no +, no dashes/spaces/parens, country code 1 prepended if only 10 digits)
 */
function formatPhoneForVonage(phone) {
  // Strip everything except digits
  const digits = phone.replace(/\D/g, '');
  // Prepend country code 1 if we only have 10 digits
  return digits.length === 10 ? `1${digits}` : digits;
}

/**
 * Send an SMS via Vonage Messages API. Logs and swallows errors so one failure
 * doesn't stop processing the remaining promises.
 */
async function sendSMS(to, message) {
  try {
    const formattedTo = formatPhoneForVonage(to);
    console.log(`Sending SMS via Vonage to ${formattedTo}: ${message}`);

    const credentials = Buffer.from(
      `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`
    ).toString('base64');

    const response = await fetch('https://api.nexmo.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        to: formattedTo,
        from: process.env.VONAGE_FROM_NUMBER,
        channel: 'sms',
        message_type: 'text',
        text: message
      })
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`SMS sent successfully via Vonage. message_uuid: ${result.message_uuid}`);
      return true;
    } else {
      console.log(`Vonage SMS failed:`, JSON.stringify(result));
      return false;
    }
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
 * createdBy is an email address, so we query by the email field.
 */
async function getCreatorPhone(createdBy) {
  try {
    console.log(`[getCreatorPhone] Querying users collection where email == "${createdBy}"`);
    const userSnap = await db.collection("users").where("email", "==", createdBy).limit(1).get();
    console.log(`[getCreatorPhone] Query returned ${userSnap.size} doc(s) for email "${createdBy}"`);
    if (userSnap.empty) {
      console.warn(`Creator user with email ${createdBy} not found`);
      return null;
    }
    const phone = userSnap.docs[0].data().phone;
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
 * Look up the email address of the user who created the promise.
 * createdBy is an email address, so we query by the email field.
 */
async function getCreatorEmail(createdBy) {
  try {
    console.log(`[getCreatorEmail] Querying users collection where email == "${createdBy}"`);
    const userSnap = await db.collection("users").where("email", "==", createdBy).limit(1).get();
    console.log(`[getCreatorEmail] Query returned ${userSnap.size} doc(s) for email "${createdBy}"`);
    if (userSnap.empty) {
      console.warn(`Creator user with email ${createdBy} not found`);
      return null;
    }
    const email = userSnap.docs[0].data().email;
    if (!email) {
      console.warn(`Creator ${createdBy} has no email`);
      return null;
    }
    return email;
  } catch (err) {
    console.error(`Error fetching creator email for ${createdBy}:`, err.message);
    return null;
  }
}

/**
 * Look up the business owner's email address for escalation.
 */
async function getBusinessOwnerEmail(businessId) {
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
    const email = userDoc.data().email;
    if (!email) {
      console.warn(`Owner ${ownerId} has no email`);
      return null;
    }
    return email;
  } catch (err) {
    console.error(`Error fetching owner email for business ${businessId}:`, err.message);
    return null;
  }
}

/**
 * Send an email via Gmail SMTP. Logs and swallows errors so one failure
 * doesn't stop processing the remaining promises.
 */
async function sendEmail(to, subject, htmlBody) {
  try {
    console.log(`Sending email to ${to}: ${subject}`);
    const info = await gmailTransporter.sendMail({
      from: '"Promise Tracker" <support@promisetracker.app>',
      to,
      subject,
      html: htmlBody,
    });
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return false;
  }
}

/**
 * Build a styled HTML email body.
 */
function buildEmailHTML(headline, bodyLines, ctaText) {
  const linesHTML = bodyLines
    .map((line) => `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#4b5563;">${line}</p>`)
    .join("\n            ");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #d1d5db;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px 32px;border-bottom:1px solid #d1d5db;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;">
                    <img src="https://promisetracker.app/logo.jpeg" alt="P" width="32" height="32" style="display:block;border-radius:8px;" />
                  </td>
                  <td style="padding-left:12px;font-size:18px;font-weight:700;color:#111827;">Promise Tracker</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 20px 0;font-size:20px;font-weight:700;color:#111827;">${headline}</h1>
              ${linesHTML}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background-color:#22c55e;border-radius:8px;">
                    <a href="https://promisetracker.app/dashboard" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${ctaText || "View Dashboard"}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #d1d5db;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Promise Tracker &mdash; <a href="mailto:support@promisetracker.app" style="color:#16a34a;text-decoration:none;">support@promisetracker.app</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Owner Notification Constants ────────────────────────────────────
const OWNER_EMAIL = "promisetrackermvp@gmail.com";
const OWNER_PHONE = process.env.OWNER_PHONE;

/**
 * Send a notification to the app owner (Zackary) via email + SMS.
 * Failures are logged but never thrown so the caller is unaffected.
 */
async function sendOwnerNotification(subject, body, smsText) {
  console.log(`[OwnerNotify] START — subject="${subject}", smsText="${smsText}"`);

  // Email
  try {
    const html = buildOwnerEmailHTML(subject, body);
    await sendEmail(OWNER_EMAIL, subject, html);
    console.log("[OwnerNotify] Email sent successfully");
  } catch (err) {
    console.error("[OwnerNotify] Email FAILED:", err.message);
  }

  // SMS
  console.log(`[OwnerNotify] SMS section reached — OWNER_PHONE="${OWNER_PHONE}" (truthy: ${!!OWNER_PHONE})`);
  try {
    if (OWNER_PHONE) {
      const smsMessage = smsText || subject;
      console.log(`[OwnerNotify] Calling sendSMS to ${OWNER_PHONE}: "${smsMessage}"`);
      const smsResult = await sendSMS(OWNER_PHONE, smsMessage);
      console.log(`[OwnerNotify] sendSMS returned: ${smsResult}`);
    } else {
      console.warn("[OwnerNotify] OWNER_PHONE not set — skipping owner SMS");
    }
  } catch (err) {
    console.error("[OwnerNotify] SMS FAILED with exception:", err.message);
  }

  console.log("[OwnerNotify] END");
}

/**
 * Build a dark-themed HTML email for owner notifications.
 */
function buildOwnerEmailHTML(headline, bodyText) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #d1d5db;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px 32px;border-bottom:1px solid #d1d5db;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;">
                    <img src="https://promisetracker.app/logo.jpeg" alt="P" width="32" height="32" style="display:block;border-radius:8px;" />
                  </td>
                  <td style="padding-left:12px;font-size:18px;font-weight:700;color:#111827;">Promise Tracker — Owner Alert</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 20px 0;font-size:20px;font-weight:700;color:#16a34a;">${headline}</h1>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#4b5563;">${bodyText}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #d1d5db;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Promise Tracker Owner Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Look up the business's timezone from Firestore.
 */
async function getBusinessTimezone(businessId) {
  try {
    const businessDoc = await db.collection("businesses").doc(businessId).get();
    if (businessDoc.exists && businessDoc.data().timezone) {
      return businessDoc.data().timezone;
    }
  } catch (err) {
    console.error(`Error fetching timezone for business ${businessId}:`, err.message);
  }
  return "America/New_York";
}

/**
 * Format a Firestore Timestamp into a human-readable string.
 */
function formatDate(timestamp, timezone) {
  if (!timestamp || !timestamp.toDate) return "unknown date";
  return timestamp.toDate().toLocaleString("en-US", {
    timeZone: timezone || "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Scheduled function: runs every 5 minutes ──────────────────────────
exports.checkPromises = onSchedule("every 5 minutes", async (event) => {
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
        const minutesUntilDue = msUntilDue / (60 * 1000);
        const minutesSinceDue = msSinceDue / (60 * 1000);
        const description = promise.description || "something";
        const customerName = promise.customerName || "a customer";
        const businessTimezone = await getBusinessTimezone(promise.businessId);
        const formattedDue = formatDate(dueDate, businessTimezone);

        // Logging for debugging
        console.log(`[Promise ${promiseId}] Current time: ${now.toISOString()}, Due: ${dueDate.toDate().toISOString()}`);
        console.log(`[Promise ${promiseId}] Minutes until due: ${minutesUntilDue.toFixed(2)}, Minutes since due: ${minutesSinceDue.toFixed(2)}`);
        console.log(`[Promise ${promiseId}] Flags - reminderSent: ${promise.reminderSent}, escalated: ${promise.escalated}`);

        // Check most severe condition first, then work down

        // ── Daily urgent reminder (24+ hours overdue, fires every 24h) ──────
        if (
          msSinceDue >= 24 * 60 * 60 * 1000 &&
          promise.escalated === true &&
          (
            !promise.lastRecurringEscalation ||
            nowMs - promise.lastRecurringEscalation.toDate().getTime() >= 24 * 60 * 60 * 1000
          )
        ) {
          const daysOverdue = Math.floor(msSinceDue / (24 * 60 * 60 * 1000));
          console.log(`[Promise ${promiseId}] ✓ PASSED daily urgent check — ${customerName} is ${daysOverdue} day(s) overdue`);

          const ownerPhone = await getBusinessOwnerPhone(promise.businessId);
          if (ownerPhone) {
            const msg = `URGENT: The promise for ${customerName} to ${description} is still unresolved (${daysOverdue} days overdue). Please check Promise Tracker immediately.`;
            await sendSMS(ownerPhone, msg);
          }

          const ownerEmail = await getBusinessOwnerEmail(promise.businessId);
          if (ownerEmail) {
            const subject = `URGENT: ${customerName} follow-up still unresolved (${daysOverdue} days overdue)`;
            const html = buildEmailHTML(
              `URGENT: ${customerName} follow-up still unresolved (${daysOverdue} days overdue)`,
              [
                `The promise for <strong>${customerName}</strong> to <strong>${description}</strong> is now <strong>${daysOverdue} days overdue</strong> and still has not been resolved.`,
                `This is an automated daily reminder that will continue until the promise is marked as done.`,
              ],
              "View Dashboard"
            );
            await sendEmail(ownerEmail, subject, html);
          }

          updates.push(
            docSnap.ref.update({ lastRecurringEscalation: admin.firestore.Timestamp.now() })
          );
        }
        // ── 1-hour escalation (after due) ────────────────────────
        else if (
          msSinceDue >= 60 * 60 * 1000 &&
          promise.escalated !== true
        ) {
          console.log(`[Promise ${promiseId}] ✓ PASSED 1-hour escalation check (${minutesSinceDue.toFixed(2)} min overdue)`);

          // SMS to owner with escalation message (BUG FIX 3)
          const ownerPhone = await getBusinessOwnerPhone(promise.businessId);
          if (ownerPhone) {
            const msg = `ESCALATION: ${customerName} was promised ${description} by ${formattedDue} and it has not been handled. Please check Promise Tracker.`;
            await sendSMS(ownerPhone, msg);
          }

          // Email to owner
          if (!promise.escalationEmailSent) {
            const ownerEmail = await getBusinessOwnerEmail(promise.businessId);
            if (ownerEmail) {
              const subject = `ESCALATION: ${customerName} follow-up overdue`;
              const html = buildEmailHTML(
                `ESCALATION: ${customerName} follow-up overdue`,
                [
                  `A promise to <strong>${customerName}</strong> &mdash; <strong>${description}</strong> &mdash; was due at <strong>${formattedDue}</strong> and has not been completed.`,
                  `This was created by <strong>${promise.createdBy}</strong>. Please check Promise Tracker immediately.`,
                ],
                "View Dashboard"
              );
              await sendEmail(ownerEmail, subject, html);
            }
          }

          updates.push(
            docSnap.ref.update({ status: "overdue", escalated: true, escalationEmailSent: true })
          );
        }
        // ── 2-hour early reminder (before due) ────────────────────
        else if (
          minutesUntilDue >= 115 &&
          minutesUntilDue <= 125 &&
          promise.earlyReminderSent !== true
        ) {
          console.log(`[Promise ${promiseId}] ✓ PASSED 2-hour early reminder check (${minutesUntilDue.toFixed(2)} min until due)`);

          const earlyCreatorPhone = await getCreatorPhone(promise.createdBy);
          if (earlyCreatorPhone) {
            const msg = `Reminder: You promised ${customerName} you'd ${description}. Due in about 2 hours (${formattedDue}). Text LIST to see all promises.`;
            await sendSMS(earlyCreatorPhone, msg);
          }

          if (!promise.earlyReminderEmailSent) {
            const earlyCreatorEmail = await getCreatorEmail(promise.createdBy);
            if (earlyCreatorEmail) {
              const subject = `Upcoming: ${customerName} promise due in 2 hours`;
              const html = buildEmailHTML(
                `Upcoming: ${customerName} promise due in 2 hours`,
                [
                  `Hi, this is an early reminder that you promised to <strong>${description}</strong> for <strong>${customerName}</strong>.`,
                  `It's due at <strong>${formattedDue}</strong> — about 2 hours from now.`,
                  `Please prepare to handle it or mark it done in Promise Tracker.`,
                ],
                "View Dashboard"
              );
              await sendEmail(earlyCreatorEmail, subject, html);
            }
          }

          updates.push(
            docSnap.ref.update({ earlyReminderSent: true, earlyReminderEmailSent: true })
          );
        }
        // ── 30-minute reminder (before due) ──────────────────────
        else if (
          msUntilDue > 0 &&
          msUntilDue <= 30 * 60 * 1000 &&
          promise.reminderSent !== true
        ) {
          console.log(`[Promise ${promiseId}] ✓ PASSED 30-min reminder check (${minutesUntilDue.toFixed(2)} min until due)`);

          // SMS to creator with reminder message (BUG FIX 3)
          const creatorPhone = await getCreatorPhone(promise.createdBy);
          if (creatorPhone) {
            const msg = `Reminder: The promise for ${customerName} to ${description} is due in 30 minutes. Please check Promise Tracker.`;
            await sendSMS(creatorPhone, msg);
          }

          // Email to creator
          if (!promise.reminderEmailSent) {
            const creatorEmail = await getCreatorEmail(promise.createdBy);
            if (creatorEmail) {
              const subject = `Reminder: Follow up with ${customerName}`;
              const html = buildEmailHTML(
                `Reminder: Follow up with ${customerName}`,
                [
                  `Hi, this is a reminder that you promised to <strong>${description}</strong> for <strong>${customerName}</strong> by <strong>${formattedDue}</strong>.`,
                  `Please handle it or mark it done in Promise Tracker.`,
                ],
                "View Dashboard"
              );
              await sendEmail(creatorEmail, subject, html);
            }
          }

          updates.push(
            docSnap.ref.update({ reminderSent: true, reminderEmailSent: true })
          );
        }
        else {
          console.log(`[Promise ${promiseId}] ✗ FAILED all checks - no action taken`);
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

// ─── Stripe Integration ──────────────────────────────────────────────

function getStripe() {
  const stripe = require("stripe");
  return stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Callable function: creates a Stripe Checkout Session for subscription.
 */
exports.createCheckoutSession = onCall(async (request) => {
  const { businessId, userId } = request.data;

  if (!businessId || !userId) {
    throw new Error("Missing businessId or userId");
  }

  // Look up the user's email
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  const email = userDoc.data().email;

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url:
      "https://promisetracker.app/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://promisetracker.app/pricing",
    client_reference_id: businessId,
    customer_email: email,
    metadata: {
      businessId,
      userId,
    },
  });

  return { url: session.url };
});

/**
 * HTTP endpoint: receives Stripe webhook events.
 */
exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];

  // ── DEBUG LOGGING (remove after diagnosing) ──────────────────────────────
  console.log("[stripe-webhook-debug] req.rawBody exists:", req.rawBody != null);
  console.log("[stripe-webhook-debug] req.rawBody type:", typeof req.rawBody, req.rawBody instanceof Buffer ? "(Buffer)" : "");
  console.log("[stripe-webhook-debug] req.rawBody length:", req.rawBody ? req.rawBody.length : "N/A");
  console.log("[stripe-webhook-debug] req.body exists:", req.body != null);
  console.log("[stripe-webhook-debug] req.body type:", typeof req.body);
  console.log("[stripe-webhook-debug] stripe-signature header (first 50):", sig ? sig.substring(0, 50) : "(missing)");
  console.log("[stripe-webhook-debug] STRIPE_WEBHOOK_SECRET set:", !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log("[stripe-webhook-debug] STRIPE_WEBHOOK_SECRET first 10:", process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10) : "(missing)");
  console.log("[stripe-webhook-debug] content-type:", req.headers["content-type"]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!sig) {
    res.status(400).send("Webhook Error: No stripe-signature header");
    return;
  }

  // Firebase Functions v2 sets req.rawBody as a Buffer via
  // @google-cloud/functions-framework (production Cloud Run).
  // The firebase-functions v7 bin does NOT configure body-parser, so rawBody
  // may be undefined in the Firebase Emulator or other non-production paths.
  // In those cases, fall back to reading the raw bytes directly from the stream.
  let rawBody = req.rawBody;
  if (!rawBody) {
    console.log("[stripe-webhook-debug] req.rawBody missing — reading from stream");
    rawBody = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
    console.log("[stripe-webhook-debug] stream read complete, bytes:", rawBody.length);
  }

  if (!rawBody || rawBody.length === 0) {
    console.error("Stripe webhook received with empty body");
    res.status(400).send("Webhook Error: Empty request body");
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe-webhook-debug] rawBody as string (first 200):", rawBody.toString("utf8").substring(0, 200));
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const businessId =
          session.client_reference_id || session.metadata?.businessId;
        if (businessId) {
          const updatePayload = {
            plan: "pro",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            paymentFailed: false,
          };
          // Fetch subscription to get current period end
          try {
            if (session.subscription) {
              const sub = await stripe.subscriptions.retrieve(session.subscription);
              if (sub.current_period_end) {
                updatePayload.currentPeriodEnd = admin.firestore.Timestamp.fromMillis(sub.current_period_end * 1000);
              }
            }
          } catch (subErr) {
            console.error("Failed to retrieve subscription for period end:", subErr.message);
          }
          await db
            .collection("businesses")
            .doc(businessId)
            .update(updatePayload);
          console.log(`Business ${businessId} upgraded to pro`);

          // Notify app owner of new subscriber
          try {
            const bizDoc = await db.collection("businesses").doc(businessId).get();
            const bizName = bizDoc.exists && bizDoc.data().name ? bizDoc.data().name : businessId;
            let ownerEmail = "unknown";
            if (bizDoc.exists && bizDoc.data().ownerId) {
              const ownerDoc = await db.collection("users").doc(bizDoc.data().ownerId).get();
              if (ownerDoc.exists && ownerDoc.data().email) ownerEmail = ownerDoc.data().email;
            }
            await sendOwnerNotification(
              `New Subscriber: ${bizName}`,
              `${ownerEmail} (${bizName}) just subscribed to Pro at $39/month`,
              `New subscriber: ${bizName} - ${ownerEmail} - $39/mo`
            );
          } catch (err) {
            console.error("Owner notification failed (new subscriber):", err.message);
          }
          // Commission tracking for referred customers
          try {
            const bizDocForRef = await db.collection("businesses").doc(businessId).get();
            if (bizDocForRef.exists && bizDocForRef.data().ownerId) {
              const ownerId = bizDocForRef.data().ownerId;
              const ownerDocForRef = await db.collection("users").doc(ownerId).get();
              if (ownerDocForRef.exists) {
                const ownerData = ownerDocForRef.data();
                const refCode = ownerData.referralCode;
                if (refCode) {
                  const affiliateSnap = await db
                    .collection("affiliates")
                    .where("code", "==", refCode)
                    .where("active", "==", true)
                    .limit(1)
                    .get();
                  if (!affiliateSnap.empty) {
                    const affiliateDoc = affiliateSnap.docs[0];
                    const affiliateData = affiliateDoc.data();
                    const paymentAmount = session.amount_total || 0;
                    if (paymentAmount > 0) {
                      const commissionRate = affiliateData.commissionRate || 0.30;
                      const commissionAmount = Math.round(paymentAmount * commissionRate);
                      await db.collection("commissionEvents").add({
                        affiliateCode: refCode,
                        affiliateName: affiliateData.name || "",
                        customerId: ownerId,
                        customerEmail: ownerData.email || "",
                        stripePaymentId: session.payment_intent || session.id,
                        paymentAmount,
                        commissionAmount,
                        commissionRate,
                        eventDate: admin.firestore.FieldValue.serverTimestamp(),
                        paid: false,
                        paidDate: null,
                      });
                      console.log(`Commission event created: ${commissionAmount} cents for affiliate ${refCode}`);
                    }
                  } else {
                    console.log(`Referral code ${refCode} not found or inactive — skipping commission`);
                  }
                }
              }
            }
          } catch (err) {
            console.error("Commission tracking failed (checkout.session.completed):", err.message);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        // Find business by stripeSubscriptionId
        const snap = await db
          .collection("businesses")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get();
        for (const doc of snap.docs) {
          await doc.ref.update({ plan: "expired" });
          console.log(`Business ${doc.id} plan set to expired`);

          // Notify app owner of cancellation
          try {
            const bizName = doc.data().name || doc.id;
            let ownerEmail = "unknown";
            if (doc.data().ownerId) {
              const ownerDoc = await db.collection("users").doc(doc.data().ownerId).get();
              if (ownerDoc.exists && ownerDoc.data().email) ownerEmail = ownerDoc.data().email;
            }
            await sendOwnerNotification(
              `Subscription Cancelled: ${bizName}`,
              `${ownerEmail} (${bizName}) cancelled their subscription`,
              `Cancelled: ${bizName} - ${ownerEmail}`
            );
          } catch (err) {
            console.error("Owner notification failed (subscription cancelled):", err.message);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const snap = await db
          .collection("businesses")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get();
        for (const doc of snap.docs) {
          const newPlan =
            subscription.status === "active" ? "pro" : "expired";
          const updateData = { plan: newPlan };
          if (subscription.current_period_end) {
            updateData.currentPeriodEnd = admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000);
          }
          await doc.ref.update(updateData);
          console.log(
            `Business ${doc.id} subscription updated to ${newPlan}`,
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const snap = await db
          .collection("businesses")
          .where("stripeCustomerId", "==", customerId)
          .get();
        for (const doc of snap.docs) {
          await doc.ref.update({ paymentFailed: true });
          console.log(`Business ${doc.id} flagged with paymentFailed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err.message);
  }

  res.status(200).json({ received: true });
});

// ─── Email Verification ──────────────────────────────────────────────

/**
 * Callable function: cancels a Stripe subscription at period end.
 */
exports.cancelSubscription = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Authentication required");
  }

  const uid = request.auth.uid;

  // Look up user to get businessId
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  const userData = userDoc.data();
  const businessId = userData.businessId;
  if (!businessId) {
    throw new Error("No business associated with this user");
  }

  // Verify user is the owner
  if (userData.role !== "owner") {
    throw new Error("Only the business owner can cancel the subscription");
  }

  // Look up business doc
  const bizDoc = await db.collection("businesses").doc(businessId).get();
  if (!bizDoc.exists) {
    throw new Error("Business not found");
  }
  const bizData = bizDoc.data();

  if (!bizData.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  const stripe = getStripe();

  // Cancel at period end (don't cut off immediately)
  const subscription = await stripe.subscriptions.update(bizData.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  // Update business doc
  const cancelUpdate = { cancelAtPeriodEnd: true };
  if (subscription.current_period_end) {
    cancelUpdate.currentPeriodEnd = admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000);
  }
  await db.collection("businesses").doc(businessId).update(cancelUpdate);

  // Notify app owner of cancellation
  try {
    const bizName = bizData.name || businessId;
    let ownerEmail = "unknown";
    if (bizData.ownerId) {
      const ownerDoc = await db.collection("users").doc(bizData.ownerId).get();
      if (ownerDoc.exists && ownerDoc.data().email) ownerEmail = ownerDoc.data().email;
    }
    await sendOwnerNotification(
      `Subscription Cancelled: ${bizName}`,
      `${ownerEmail} (${bizName}) cancelled their subscription`,
      `Cancelled: ${bizName} - ${ownerEmail}`
    );
  } catch (err) {
    console.error("Owner notification failed (cancel subscription):", err.message);
  }

  return {
    success: true,
    currentPeriodEnd: subscription.current_period_end,
  };
});

/**
 * Callable function: reactivates a Stripe subscription that was set to cancel at period end.
 */
exports.reactivateSubscription = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Authentication required");
  }

  const uid = request.auth.uid;

  // Look up user to get businessId
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  const userData = userDoc.data();
  const businessId = userData.businessId;
  if (!businessId) {
    throw new Error("No business associated with this user");
  }

  // Verify user is the owner
  if (userData.role !== "owner") {
    throw new Error("Only the business owner can reactivate the subscription");
  }

  // Look up business doc
  const bizDoc = await db.collection("businesses").doc(businessId).get();
  if (!bizDoc.exists) {
    throw new Error("Business not found");
  }
  const bizData = bizDoc.data();

  if (!bizData.stripeSubscriptionId) {
    throw new Error("No subscription found");
  }

  const stripe = getStripe();

  // Reactivate by removing cancel_at_period_end
  await stripe.subscriptions.update(bizData.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // Update business doc
  await db.collection("businesses").doc(businessId).update({
    cancelAtPeriodEnd: false,
  });

  return { success: true };
});

/**
 * Callable function: generates a 6-digit verification code, stores it in Firestore,
 * and sends it to the user's email via Gmail SMTP.
 */
exports.sendVerificationCode = onCall(async (request) => {
  const { email, userId } = request.data;

  if (!email || !userId) {
    throw new Error("Missing email or userId");
  }

  // Generate a random 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  // Store the code in Firestore
  await db.collection("verificationCodes").add({
    code,
    email,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
  });

  // Send the email
  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #d1d5db;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px 32px;border-bottom:1px solid #d1d5db;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;">
                    <img src="https://promisetracker.app/logo.jpeg" alt="P" width="32" height="32" style="display:block;border-radius:8px;" />
                  </td>
                  <td style="padding-left:12px;font-size:18px;font-weight:700;color:#111827;">Promise Tracker</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;text-align:center;">
              <h1 style="margin:0 0 20px 0;font-size:20px;font-weight:700;color:#111827;">Verify your email</h1>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#4b5563;">Enter this code in Promise Tracker to verify your email address:</p>
              <div style="display:inline-block;padding:16px 40px;background-color:#f3f4f6;border-radius:12px;border:1px solid #d1d5db;margin-bottom:24px;">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#16a34a;">${code}</span>
              </div>
              <p style="margin:0;font-size:13px;color:#9ca3af;">This code expires in 15 minutes.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #d1d5db;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Promise Tracker &mdash; <a href="mailto:support@promisetracker.app" style="color:#16a34a;text-decoration:none;">support@promisetracker.app</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(email, "Your Promise Tracker verification code", htmlBody);

  // Notify app owner of new signup
  try {
    let businessName = "Unknown";
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists && userDoc.data().businessId) {
      const bizDoc = await db.collection("businesses").doc(userDoc.data().businessId).get();
      if (bizDoc.exists && bizDoc.data().name) {
        businessName = bizDoc.data().name;
      }
    }
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    console.log(`[sendVerificationCode] About to call sendOwnerNotification for ${email}`);
    await sendOwnerNotification(
      `New Signup: ${email}`,
      `${email} just created an account for business '${businessName}' at ${timestamp}`,
      `New signup: ${businessName} - ${email}`
    );
    console.log(`[sendVerificationCode] sendOwnerNotification completed for ${email}`);
  } catch (err) {
    console.error("Owner notification failed (new signup):", err.message);
  }

  return { success: true };
});

/**
 * Callable function: deletes the authenticated user's Firestore doc
 * and their Firebase Auth account.
 */
exports.deleteAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Authentication required");
  }

  const uid = request.auth.uid;

  // Look up user info before deletion for owner notification
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  const userEmail = userDoc.exists ? userDoc.data().email || "unknown" : "unknown";

  // Delete user doc from Firestore
  if (userDoc.exists) {
    await userRef.delete();
  }

  // Delete user from Firebase Auth
  await admin.auth().deleteUser(uid);

  // Notify app owner of account deletion
  try {
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    let deletedBusinessName = "Unknown";
    const deletedBusinessId = userDoc.exists ? userDoc.data().businessId : null;
    if (deletedBusinessId) {
      const bizDoc = await db.collection("businesses").doc(deletedBusinessId).get();
      if (bizDoc.exists && bizDoc.data().name) deletedBusinessName = bizDoc.data().name;
    }
    console.log(`[deleteAccount] About to call sendOwnerNotification for ${userEmail}`);
    await sendOwnerNotification(
      `Account Deleted: ${deletedBusinessName} - ${userEmail}`,
      `${userEmail} (${deletedBusinessName}) deleted their account at ${timestamp}`,
      `Account deleted: ${deletedBusinessName} - ${userEmail}`
    );
    console.log(`[deleteAccount] sendOwnerNotification completed for ${userEmail}`);
  } catch (err) {
    console.error("Owner notification failed (account deleted):", err.message);
  }

  return { success: true };
});

// ─── SMS Command Router ───────────────────────────────────────────────

/**
 * Normalize a phone number down to its last 10 digits for comparison.
 */
function normalizeLast10(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.slice(-10);
}

/**
 * Find a Firestore user doc whose phone field matches the last 10 digits
 * of rawPhone. Returns { uid, ...userData } or null.
 */
async function findUserByPhone(rawPhone) {
  const incoming10 = normalizeLast10(rawPhone);
  if (!incoming10) return null;

  const usersSnap = await db.collection('users').get();
  for (const doc of usersSnap.docs) {
    const stored = doc.data().phone;
    if (!stored) continue;
    if (normalizeLast10(stored) === incoming10) {
      return { uid: doc.id, ...doc.data() };
    }
  }
  return null;
}

/**
 * Format a Firestore Timestamp as a short date string (e.g. "Jun 22, 2026").
 */
function formatDueShort(timestamp) {
  if (!timestamp || !timestamp.toDate) return '?';
  return timestamp.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Individual SMS Command Handlers ─────────────────────────────────

async function handleListCommand(userId, userPhone, userData) {
  console.log(`[SMS LIST] userId=${userId}`);
  const businessId = userData.businessId;
  console.log(`[SMS LIST] businessId=${businessId}`);
  if (!businessId) {
    await sendSMS(userPhone, 'Your account is not linked to a business. Please complete setup at promisetracker.app');
    return;
  }

  console.log(`[SMS LIST] Querying promises where businessId==${businessId} AND status in [open,overdue] ORDER BY dueDate asc`);
  const snapshot = await db.collection('promises')
    .where('businessId', '==', businessId)
    .where('status', 'in', ['open', 'overdue'])
    .orderBy('dueDate', 'asc')
    .get();

  console.log(`[SMS LIST] Query returned ${snapshot.size} doc(s)`);

  if (snapshot.empty) {
    await sendSMS(userPhone, 'No open promises. Nice work! 🎉');
    return;
  }

  const allDocs = snapshot.docs;
  const showDocs = allDocs.slice(0, 5);
  // Store promise IDs in display order so DONE 1, DONE 2, etc. resolve correctly
  const promiseIds = showDocs.map(d => d.id);

  await db.collection('smsListMappings').doc(userId).set({
    promiseIds,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const nowMs = Date.now();
  const lines = showDocs.map((doc, i) => {
    const p = doc.data();
    const customerName = p.customerName || '?';
    const description = p.description || '(no description)';
    let dueStr;
    if (p.status === 'overdue' && p.dueDate && p.dueDate.toDate) {
      const daysOverdue = Math.max(1, Math.floor((nowMs - p.dueDate.toDate().getTime()) / (24 * 60 * 60 * 1000)));
      dueStr = `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`;
    } else {
      dueStr = formatDueShort(p.dueDate);
    }
    return `${i + 1}) ${customerName} - ${description} - ${dueStr}`;
  });

  let msg = 'Your promises:\n' + lines.join('\n');
  if (allDocs.length > 5) {
    msg += `\nShowing 5 of ${allDocs.length}. Reply MORE for rest.`;
  }
  msg += '\nReply DONE # or DELETE #';

  await sendSMS(userPhone, msg);
}

async function handleDoneCommand(userId, userPhone, userData, messageText) {
  console.log(`[SMS DONE] userId=${userId} text="${messageText}"`);
  const businessId = userData.businessId;
  if (!businessId) {
    await sendSMS(userPhone, 'Your account is not linked to a business.');
    return;
  }

  const afterDone = messageText.replace(/^done\s*/i, '').trim();
  let promiseId = null;
  let promiseDoc = null;

  if (/^\d+$/.test(afterDone)) {
    // Number-based lookup via smsListMappings
    const mappingDoc = await db.collection('smsListMappings').doc(userId).get();
    if (mappingDoc.exists) {
      const idx = parseInt(afterDone, 10) - 1;
      const ids = mappingDoc.data().promiseIds || [];
      if (idx >= 0 && idx < ids.length) {
        promiseId = ids[idx];
        const pd = await db.collection('promises').doc(promiseId).get();
        if (pd.exists) promiseDoc = pd;
      }
    }
  }

  if (!promiseDoc && afterDone) {
    // Freeform substring match on description or customerName (include overdue)
    const openSnap = await db.collection('promises')
      .where('businessId', '==', businessId)
      .where('status', 'in', ['open', 'overdue'])
      .get();
    const term = afterDone.toLowerCase();
    for (const doc of openSnap.docs) {
      const d = doc.data();
      if ((d.description || '').toLowerCase().includes(term) ||
          (d.customerName || '').toLowerCase().includes(term)) {
        promiseDoc = doc;
        promiseId = doc.id;
        break;
      }
    }
  }

  if (!promiseDoc) {
    await sendSMS(userPhone, "Couldn't find that promise. Reply LIST to see your open promises.");
    return;
  }

  await db.collection('promises').doc(promiseId).update({
    status: 'done',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('smsListMappings').doc(userId).delete().catch(() => {});

  // Count remaining non-completed promises
  const remainingSnap = await db.collection('promises')
    .where('businessId', '==', businessId)
    .where('status', 'in', ['open', 'overdue'])
    .get();

  const desc = promiseDoc.data().description || '(no description)';
  const remaining = remainingSnap.size;
  await sendSMS(userPhone, `✅ Done: '${desc}'. ${remaining} promise${remaining !== 1 ? 's' : ''} remaining.`);
}

async function handleDeleteCommand(userId, userPhone, userData, messageText) {
  console.log(`[SMS DELETE] userId=${userId} text="${messageText}"`);
  const businessId = userData.businessId;
  if (!businessId) {
    await sendSMS(userPhone, 'Your account is not linked to a business.');
    return;
  }

  const afterDelete = messageText.replace(/^delete\s*/i, '').trim();
  let promiseId = null;
  let promiseDoc = null;

  if (/^\d+$/.test(afterDelete)) {
    const mappingDoc = await db.collection('smsListMappings').doc(userId).get();
    if (mappingDoc.exists) {
      const idx = parseInt(afterDelete, 10) - 1;
      const ids = mappingDoc.data().promiseIds || [];
      if (idx >= 0 && idx < ids.length) {
        promiseId = ids[idx];
        const pd = await db.collection('promises').doc(promiseId).get();
        if (pd.exists) promiseDoc = pd;
      }
    }
  }

  if (!promiseDoc && afterDelete) {
    const openSnap = await db.collection('promises')
      .where('businessId', '==', businessId)
      .where('status', 'in', ['open', 'overdue'])
      .get();
    const term = afterDelete.toLowerCase();
    for (const doc of openSnap.docs) {
      const d = doc.data();
      if ((d.description || '').toLowerCase().includes(term) ||
          (d.customerName || '').toLowerCase().includes(term)) {
        promiseDoc = doc;
        promiseId = doc.id;
        break;
      }
    }
  }

  if (!promiseDoc) {
    await sendSMS(userPhone, "Couldn't find that promise. Reply LIST to see your open promises.");
    return;
  }

  const desc = promiseDoc.data().description || '(no description)';

  // Store pending-delete state so the next message can confirm
  const convoId = `${userId}_delete`;
  await db.collection('smsConversations').doc(convoId).set({
    userId,
    state: 'awaiting_delete_confirm',
    pendingDeleteId: promiseId,
    pendingDeleteDesc: desc,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await sendSMS(userPhone, `Delete '${desc}'? Reply YES to confirm.`);
}

async function handleDeleteConfirmation(convoDoc, userId, userPhone, messageText, user) {
  console.log(`[SMS DELETE CONFIRM] userId=${userId} text="${messageText}"`);
  const convoData = convoDoc.data();
  const promiseId = convoData.pendingDeleteId;
  const upper = messageText.trim().toUpperCase();
  const kw = (messageText.split(/\s+/)[0] || '').toUpperCase();
  const validCommands = ['LIST', 'STATUS', 'DONE', 'DELETE', 'HELP', 'STOP', 'START'];

  if (upper === 'YES') {
    await db.collection('smsConversations').doc(convoDoc.id).update({
      state: 'idle',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await db.collection('promises').doc(promiseId).delete();
    await db.collection('smsListMappings').doc(userId).delete().catch(() => {});
    console.log(`[SMS DELETE CONFIRM] Deleted promise ${promiseId}`);
    await sendSMS(userPhone, '🗑️ Deleted.');
    console.log(`[SMS DELETE CONFIRM] YES branch complete — returning to caller`);
  } else if (upper === 'CANCEL' || upper === 'NO') {
    await db.collection('smsConversations').doc(convoDoc.id).update({
      state: 'idle',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await sendSMS(userPhone, 'Delete cancelled.');
    console.log(`[SMS DELETE CONFIRM] CANCEL/NO branch complete — returning to caller`);
  } else if (validCommands.includes(kw)) {
    await db.collection('smsConversations').doc(convoDoc.id).update({
      state: 'idle',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    switch (kw) {
      case 'LIST':
      case 'STATUS':
        await handleListCommand(userId, userPhone, user);
        break;
      case 'DONE':
        await handleDoneCommand(userId, userPhone, user, messageText);
        break;
      case 'DELETE':
        await handleDeleteCommand(userId, userPhone, user, messageText);
        break;
      case 'HELP':
        await handleHelpCommand(userPhone);
        break;
      case 'STOP':
        await handleStopCommand(userId, userPhone);
        break;
      case 'START':
        await handleStartCommand(userId, userPhone);
        break;
    }
    console.log(`[SMS DELETE CONFIRM] validCommand="${kw}" branch complete — returning to caller`);
  } else {
    await sendSMS(userPhone, 'Reply YES to delete or CANCEL to keep it.');
    console.log(`[SMS DELETE CONFIRM] unrecognized input — prompted for YES/CANCEL — returning to caller`);
  }
}

async function handleHelpCommand(userPhone) {
  console.log(`[SMS HELP] userPhone=${userPhone}`);
  await sendSMS(
    userPhone,
    "PT Commands:\nLIST - see open promises\nDONE # - complete a promise\nDELETE # - remove a promise\nCANCEL - cancel current action\nSTOP/START - unsub/resub\nHELP - this msg\nOr text a promise to log it"
  );
}

async function handleStopCommand(userId, userPhone) {
  console.log(`[SMS STOP] userId=${userId}`);
  await db.collection('users').doc(userId).update({ smsEnabled: false });
  await sendSMS(userPhone, "You've been unsubscribed from Promise Tracker texts. Reply START to resubscribe.");
}

async function handleStartCommand(userId, userPhone) {
  console.log(`[SMS START] userId=${userId}`);
  await db.collection('users').doc(userId).update({ smsEnabled: true });
  await sendSMS(userPhone, "Welcome back! You're resubscribed to Promise Tracker texts. Reply HELP for commands.");
}

// ─── GPT Promise Parser ───────────────────────────────────────────────

/**
 * Build the confirmation message from a parsed promise object.
 */
function buildConfirmMessage(parsed) {
  const text = parsed.promise_text;
  const customer = parsed.customer_name;
  const dateStr = parsed.due_date_readable;

  if (customer && dateStr) {
    return `Logging: '${text}' for ${customer} - due ${dateStr}. Reply YES to confirm, EDIT to change, or CANCEL.`;
  } else if (customer && !dateStr) {
    return `Logging: '${text}' for ${customer} - no due date set. Reply YES to confirm, EDIT to change, or CANCEL.`;
  } else {
    return `Logging: '${text}' - due ${dateStr || 'no date set'}. Reply YES to confirm, EDIT to change, or CANCEL.`;
  }
}

/**
 * Call GPT-4o-mini to extract structured promise data from a natural language message.
 */
async function parsePromiseText(messageText, timezone = 'America/New_York') {
  try {
    const now = new Date();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const todayStr = dayNames[now.getUTCDay()] + ', ' + monthNames[now.getUTCMonth()] + ' ' + now.getUTCDate() + ', ' + now.getUTCFullYear();
    const systemPrompt =
      `You are a promise parser for Promise Tracker. Extract structured data from a short text message describing a promise or commitment a contractor made to a customer. Return ONLY valid JSON, no markdown, no backticks: {"promise_text": "the action the user committed to", "customer_name": "customer name if mentioned, or null", "due_date": "ISO 8601 datetime if mentioned, or null", "due_date_readable": "human-friendly date like 'Tuesday 5pm' or null", "confidence": "high" | "medium" | "low"}. Today is ` + todayStr + `. The user is in the ${timezone} timezone. All dates and times you return should be in this timezone. Include the timezone offset in the ISO 8601 string, e.g. '2026-06-26T17:00:00-04:00'. CRITICAL — NEVER SKIP WEEKENDS: Contractors work every day including Saturday and Sunday. 'Tomorrow' ALWAYS means the next calendar day. When no day is specified, default to tomorrow (the next calendar day). If today is Saturday, tomorrow is Sunday — NOT Monday. If today is Friday, tomorrow is Saturday — NOT Monday. Do not apply any business-day or work-week logic whatsoever. When the user says 'Tuesday' they mean the next upcoming Tuesday. When they say 'tomorrow' they mean tomorrow. If the user says 'morning', use 9:00 AM. If they say 'afternoon', use 1:00 PM. If they say 'evening', use 6:00 PM. If they say 'end of day' or 'EOD', use 5:00 PM. When 'am' or 'AM' appears after a day name (e.g., 'wed am', 'Thursday AM', 'sat am'), it means morning — return 9:00 AM for the time. If no time is mentioned at all, default to 12:00 PM noon. When times are written as words instead of numbers (e.g., 'by three', 'around two thirty', 'at noon', 'by twelve', 'call back at four'), convert them to numeric times. Examples: 'three' = 3:00 PM, 'two thirty' = 2:30 PM, 'twelve' = 12:00 PM, 'eight fifty' = 8:50 AM, 'four o'clock' = 4:00 PM. For ambiguous single numbers 1-7, assume PM (work hours). For 8-12, use context (morning vs afternoon) or default to AM for 8-11 and PM for 12. Always include the numeric time in the ISO 8601 due_date. When the user says 'end of the week', they mean Friday. When they say 'next week', they mean the nearest upcoming Monday (if today is Saturday, next week's Monday is just 2 days away — do NOT skip ahead a full week). Make sure the day of the week name in due_date_readable matches the actual calendar date. Double check this. EVERY promise MUST have a due_date. If the user mentions a specific date or time, use that. If the user implies urgency (asap, soon, need to, gotta, owe, call back, get back to), set due_date to tomorrow at 12:00 PM noon. If no date or urgency is mentioned at all, STILL set due_date to tomorrow at 12:00 PM noon. The user can always change it with EDIT. Never return due_date as null. IMPORTANT: Extract the customer name even when it appears as the direct object of a verb. Examples: 'Call Mike' → customer_name='Mike'. 'Follow up with Dave' → customer_name='Dave'. 'call tony back' → customer_name='Tony'. 'Order parts for the Smith job' → customer_name='Smith'. The customer name is ANY proper noun referring to a person in the message. Always preserve honorifics like Mr, Mrs, Ms, Miss, Dr, and Prof when they appear with a customer name (e.g., 'Mrs Johnson' -> customer_name='Mrs Johnson', NOT just 'Johnson'). Always extract it to customer_name, even if it also appears in the promise_text. When the message references 'the [Name] job' or 'the [Name] place' or 'the [Name] house' or 'the [Name] project', ALWAYS extract [Name] as the customer_name. Examples: 'the anderson job' → customer_name='Anderson'. 'the garcia place' → customer_name='Garcia'. 'the smith house' → customer_name='Smith'. This takes priority over pronoun detection — if a message says 'told her about the anderson job', the customer is 'Anderson' (from 'the anderson job'), NOT 'her' (which is a pronoun). If the user writes 'n' between two names (like 'mike n sarah'), expand it to 'and' in customer_name (e.g. 'Mike and Sarah'). NEVER extract personal pronouns as customer names. The words 'em', ''em', 'her', 'him', 'them', 'she', 'he', 'us', 'we', 'they', 'me', and 'I' are pronouns, NOT customer names. Examples: 'told em I'd be there' — 'em' means 'them', not a person named Em. 'told her id have it done' — 'her' is a pronoun, not a customer. Look for actual proper nouns (names, addresses, job references) elsewhere in the message instead. Common contractor abbreviations in customer references: 'cust' means 'customer'. When 'cust' is followed by a location (e.g., 'cust on elm st', 'cust at 4th ave'), expand it and include the location in the customer name: customer_name='Customer on Elm St'. The location context is critical for the contractor to identify which customer the promise is about. Include relevant context and details in promise_text. Do NOT strip important information. Examples: 'mr and mrs johnson want new cabinets call em back tmrw' → promise_text='Call back about new cabinets'. 'roof inspection for chen family wednesday afternoon' → promise_text='Roof inspection for Chen family'. 'ac install 4th street house finish by end of week' → promise_text='Finish AC install at 4th street house'. The promise text should contain enough detail that the user knows exactly what they promised when they get the reminder. If you cannot determine what the promise is, return: {"promise_text": null, "error": "Could not understand the promise"} IMPORTANT date parsing rules: 1. If a day name appears in a past-tense context — after verbs like 'sent', 'called', 'did', 'went', 'talked', 'had', 'was', 'finished', 'completed', or after 'last' or 'since' (e.g. 'I sent Monday', 'called last Tuesday', 'since Wednesday', 'I talked to them Thursday') — do NOT use it as the due date. It refers to when something already happened. Return null for due_date so the JavaScript post-processor applies the default (tomorrow 12pm). Default to tomorrow at the default time instead. 2. If a time reference describes delivery/arrival of materials or items (e.g. 'should be here in two weeks', 'parts arriving Friday', 'ordered and it takes 3 days'), do NOT use it as the promise due date. The promise is to order/handle it NOW. Default to tomorrow at the default time. 3. For messages that describe self-introductions ('this is Dave from X'), the speaker is NOT the customer. Extract the customer as the implied recipient if mentioned, otherwise return customer_name as null. 4. When a time window is given ('between 8 and 10', '8 to 10'), use the START of the window as the due time.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageText },
        ],
        temperature: 0,
      }),
    });

    const data = await response.json();
    console.log('[parsePromiseText] raw response:', JSON.stringify(data));

    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return { promise_text: null, error: 'Could not parse promise' };

    const parsed = JSON.parse(raw);
    if (parsed.promise_text) {
      parsed.promise_text = parsed.promise_text.charAt(0).toUpperCase() + parsed.promise_text.slice(1);
    }
    if (parsed.customer_name) {
      parsed.customer_name = parsed.customer_name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      // Lowercase conjunctions/prepositions in names
      parsed.customer_name = parsed.customer_name
        .replace(/ And /g, ' and ')
        .replace(/ Or /g, ' or ')
        .replace(/ Of /g, ' of ')
        .replace(/ The /g, ' the ')
        .replace(/ On /g, ' on ')
        .replace(/ In /g, ' in ')
        .replace(/ At /g, ' at ')
        .replace(/ For /g, ' for ');
    }

    // Guard against pronouns being extracted as customer name
    if (parsed.customer_name) {
      const lcName = parsed.customer_name.toLowerCase().trim();
      const pronouns = ['em', "'em", 'her', 'him', 'them', 'she', 'he', 'us', 'we', 'they', 'me', 'i'];
      if (pronouns.includes(lcName)) {
        parsed.customer_name = null;
      }
    }

    // --- Post-process: override GPT dates for common relative references ---
    const lowerText = messageText.toLowerCase();
    const userTz = timezone || 'America/New_York';

    // Helper: get current date/time in user's timezone
    function getLocalNow() {
      const str = new Date().toLocaleString('en-US', { timeZone: userTz });
      return new Date(str);
    }

    const localNow = getLocalNow();

    // Helper: build timezone-aware ISO string
    function toLocalISO(date, tzOffset) {
      const pad = (n) => String(n).padStart(2, '0');
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':00' + tzOffset;
    }

    // Compute offset from localNow vs real now
    const realNow = new Date();
    const diffMs = localNow.getTime() - realNow.getTime();
    const offsetHours = Math.round(diffMs / 3600000);
    const tzOffset = (offsetHours >= 0 ? '+' : '-') + String(Math.abs(offsetHours)).padStart(2, '0') + ':00';

    // Default times for time-of-day keywords
    const formatTime = (h, m) => {
      m = m || 0;
      const suffix = h >= 12 ? 'pm' : 'am';
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      if (m > 0) return displayH + ':' + String(m).padStart(2, '0') + suffix;
      return displayH + suffix;
    };
    let overrideHour = 12; // default 12pm noon
    let overrideMinute = 0;
    if (lowerText.includes('first thing')) overrideHour = 9;
    else if (lowerText.includes('morning')) overrideHour = 9;
    else if (lowerText.includes('afternoon')) overrideHour = 13;
    else if (lowerText.includes('evening')) overrideHour = 18;
    else if (lowerText.includes('eod') || lowerText.includes('end of day')) overrideHour = 17;

    // "am" after a day name means morning (9am) — e.g. "wed am", "Thursday AM"
    if (/\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+am\b/i.test(lowerText)) {
      overrideHour = 9;
    }

    // Convert word-based times to digits for the regex to catch
    // e.g. "by three" → "by 3", "around two thirty" → "around 2:30"
    const wordToNum = { 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10', 'eleven': '11', 'twelve': '12' };
    const minuteWords = { 'thirty': '30', 'fifteen': '15', 'forty five': '45', 'forty-five': '45', 'twenty': '20', 'ten': '10', 'fifty': '50', 'five': '05' };
    let processedText = lowerText;
    // Replace "X thirty" / "X fifteen" etc. patterns first (e.g. "two thirty" → "2:30")
    for (const [hourWord, hourNum] of Object.entries(wordToNum)) {
      for (const [minWord, minNum] of Object.entries(minuteWords)) {
        const pattern = new RegExp('\\b' + hourWord + '\\s+' + minWord + '\\b', 'gi');
        processedText = processedText.replace(pattern, hourNum + ':' + minNum);
      }
    }
    // Replace standalone hour words after time prepositions (e.g. "by three" → "by 3")
    for (const [word, num] of Object.entries(wordToNum)) {
      const pattern = new RegExp('(at|by|before|around|after)\\s+' + word + '\\b', 'gi');
      processedText = processedText.replace(pattern, '$1 ' + num);
    }
    // Remove "o'clock" / "oclock" (e.g. "three o'clock" already converted to "3", just clean up)
    processedText = processedText.replace(/\s*o['']?clock\b/gi, '');

    // Override with explicit time if present (e.g. "at 3", "by 3pm", "at 3:30")
    const timeMatch = processedText.match(/(?:at|by|before|around)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      overrideMinute = minutes;
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
      if (ampm === 'pm' && hour < 12) hour += 12;
      else if (ampm === 'am' && hour === 12) hour = 0;
      else if (!ampm && hour >= 1 && hour <= 7) hour += 12; // assume PM for 1-7 without am/pm
      overrideHour = hour;
    }

    // Override with "noon"
    if (lowerText.match(/\bnoon\b/i)) {
      overrideHour = 12;
    }

    // Override with "between X and Y" time window — use start of window
    const windowMatch = lowerText.match(/between\s+(\d{1,2})\s+and\s+(\d{1,2})/i);
    if (windowMatch) {
      let startHour = parseInt(windowMatch[1]);
      if (startHour >= 1 && startHour <= 7) startHour += 12; // assume PM for 1-7
      overrideHour = startHour;
    }

    let skipFinalRollover = false;
    // Check for "tonight" — must come BEFORE generic "today" check
    if (lowerText.includes('tonight')) {
      overrideHour = 20;
      const d = new Date(localNow);
      d.setHours(overrideHour, overrideMinute, 0, 0);
      parsed.due_date = toLocalISO(d, tzOffset);
      parsed.due_date_readable = 'Tonight ' + formatTime(overrideHour, overrideMinute);
      skipFinalRollover = true;
    }
    // Check for "end of day" / "eod" — implies TODAY
    else if (lowerText.includes('end of day') || lowerText.includes('eod')) {
      const d = new Date(localNow);
      d.setHours(overrideHour, overrideMinute, 0, 0);
      parsed.due_date = toLocalISO(d, tzOffset);
      parsed.due_date_readable = dayNames[d.getDay()] + ' ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
    }
    // Check for "today"
    else if (lowerText.includes('today')) {
      const d = new Date(localNow);
      d.setHours(overrideHour, overrideMinute, 0, 0);
      parsed.due_date = toLocalISO(d, tzOffset);
      parsed.due_date_readable = dayNames[d.getDay()] + ' ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
    }
    // Check for "tomorrow" / "tmrw"
    else if (lowerText.includes('tomorrow') || lowerText.includes('tmrw')) {
      const d = new Date(localNow);
      d.setDate(d.getDate() + 1);
      d.setHours(overrideHour, overrideMinute, 0, 0);
      parsed.due_date = toLocalISO(d, tzOffset);
      parsed.due_date_readable = dayNames[d.getDay()] + ' ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
    }
    else {
      // Check for "this week" — set to this coming Friday (or today if already Friday)
      if (lowerText.includes('this week')) {
        const d = new Date(localNow);
        const currentDay = d.getDay();
        if (currentDay === 5) {
          // Already Friday — "this week" = today
          d.setHours(overrideHour, overrideMinute, 0, 0);
          parsed.due_date = toLocalISO(d, tzOffset);
          parsed.due_date_readable = 'Friday ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
        } else if (currentDay !== 6) {
          // Not Saturday — set to this coming Friday
          const daysUntilFri = 5 - currentDay;
          d.setDate(d.getDate() + daysUntilFri);
          d.setHours(overrideHour, overrideMinute, 0, 0);
          parsed.due_date = toLocalISO(d, tzOffset);
          parsed.due_date_readable = 'Friday ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
        }
        // Saturday: this week already passed, leave GPT's result as-is
      }
      // Check for "before the weekend" — this Friday
      else if (lowerText.includes('before the weekend')) {
        const d = new Date(localNow);
        const currentDay = d.getDay();
        if (currentDay >= 5) {
          // Already Friday/Saturday/Sunday — next Friday
          let daysUntilFri = 5 - currentDay;
          if (daysUntilFri <= 0) daysUntilFri += 7;
          d.setDate(d.getDate() + daysUntilFri);
        } else {
          // Set to this Friday
          const daysUntilFri = 5 - currentDay;
          d.setDate(d.getDate() + daysUntilFri);
        }
        d.setHours(overrideHour, overrideMinute, 0, 0);
        parsed.due_date = toLocalISO(d, tzOffset);
        parsed.due_date_readable = 'Friday ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
      }
      // Check for "end of week" / "end of the week" — priority over generic day-name match
      else if (lowerText.includes('end of week') || lowerText.includes('end of the week')) {
        const d = new Date(localNow);
        const currentDay = d.getDay();
        if (currentDay === 5) {
          // Already Friday — use today
          d.setHours(overrideHour, overrideMinute, 0, 0);
        } else {
          let daysUntil = 5 - currentDay;
          if (daysUntil <= 0) daysUntil += 7;
          d.setDate(d.getDate() + daysUntil);
          d.setHours(overrideHour, overrideMinute, 0, 0);
        }
        parsed.due_date = toLocalISO(d, tzOffset);
        parsed.due_date_readable = 'Friday ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
      }
      // Check for "next week" — nearest upcoming Monday (never skip weekends)
      else if (lowerText.includes('next week')) {
        const d = new Date(localNow);
        const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
        let daysUntilMonday = (1 - dayOfWeek + 7) % 7;
        if (daysUntilMonday <= 1) daysUntilMonday += 7; // if today IS Monday or Sunday, "next week" = next Monday
        d.setDate(d.getDate() + daysUntilMonday);
        d.setHours(overrideHour, overrideMinute, 0, 0);
        parsed.due_date = toLocalISO(d, tzOffset);
        parsed.due_date_readable = 'Monday ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
      } else {
        // Check for day-of-week references — full names first, then abbreviations (longest match wins)
        const dayPatterns = [
          { pattern: 'wednesday', num: 3 },
          { pattern: 'thursday', num: 4 },
          { pattern: 'saturday', num: 6 },
          { pattern: 'tuesday', num: 2 },
          { pattern: 'sunday', num: 0 },
          { pattern: 'monday', num: 1 },
          { pattern: 'friday', num: 5 },
          { pattern: 'thurs', num: 4 },
          { pattern: 'tues', num: 2 },
          { pattern: 'weds', num: 3 },
          { pattern: 'thur', num: 4 },
          { pattern: 'wed', num: 3 },
          { pattern: 'thu', num: 4 },
          { pattern: 'tue', num: 2 },
          { pattern: 'sat', num: 6 },
          { pattern: 'fri', num: 5 },
          { pattern: 'sun', num: 0 },
          { pattern: 'mon', num: 1 },
        ];
        const fullDayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        let matchedDay = null;
        // Past-tense guard: skip day-of-week override if the day name is in a past-tense context
        const pastTensePattern = /\b(sent|called|did|went|talked|had|was|last|since|from)\b.{0,30}\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/i;
        if (!pastTensePattern.test(lowerText)) {
          for (const { pattern, num } of dayPatterns) {
            const regex = new RegExp('\\b' + pattern + '\\b', 'i');
            if (regex.test(lowerText)) {
              matchedDay = { name: pattern, num };
              break;
            }
          }
        }
        if (matchedDay) {
          const d = new Date(localNow);
          const currentDay = d.getDay();
          let daysUntil = matchedDay.num - currentDay;
          if (daysUntil <= 0) daysUntil += 7; // always go to NEXT occurrence
          d.setDate(d.getDate() + daysUntil);
          d.setHours(overrideHour, overrideMinute, 0, 0);
          parsed.due_date = toLocalISO(d, tzOffset);
          parsed.due_date_readable = fullDayNames[matchedDay.num] + ' ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
        } else {
          // No date keyword matched — default to tomorrow at 12pm noon (no weekend skipping)
          const d = new Date(localNow);
          d.setDate(d.getDate() + 1);
          d.setHours(overrideHour, overrideMinute, 0, 0);
          parsed.due_date = toLocalISO(d, tzOffset);
          parsed.due_date_readable = dayNames[d.getDay()] + ' ' + monthNames[d.getMonth()].substring(0, 3) + ' ' + d.getDate() + ', ' + formatTime(overrideHour, overrideMinute);
        }
      }
    }

    // FINAL PASS: if due date is in the past, roll forward 1 calendar day (keep same time, no weekend skipping)
    // Exception: "tonight" is never rolled forward — if it's past due, that's intentional
    if (parsed.due_date && !skipFinalRollover) {
      const isoMatch = parsed.due_date.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (isoMatch) {
        const dueLocal = new Date(
          parseInt(isoMatch[1]),
          parseInt(isoMatch[2]) - 1,
          parseInt(isoMatch[3]),
          parseInt(isoMatch[4]),
          parseInt(isoMatch[5]),
          0, 0
        );
        const nowLocal = new Date(
          localNow.getFullYear(), localNow.getMonth(), localNow.getDate(),
          localNow.getHours(), localNow.getMinutes(), 0, 0
        );
        if (dueLocal < nowLocal) {
          dueLocal.setDate(dueLocal.getDate() + 1);
          parsed.due_date = toLocalISO(dueLocal, tzOffset);
          parsed.due_date_readable = dayNames[dueLocal.getDay()] + ' ' + monthNames[dueLocal.getMonth()].substring(0, 3) + ' ' + dueLocal.getDate() + ', ' + formatTime(dueLocal.getHours(), dueLocal.getMinutes());
        }
      }
    }
    // --- End post-process ---

    return parsed;
  } catch (err) {
    console.error('[parsePromiseText] error:', err.message);
    return { promise_text: null, error: 'Could not parse promise' };
  }
}

/**
 * Handle the awaiting_confirm conversation state.
 */
async function handleConfirmConversation(convoDoc, userId, userPhone, messageText, user) {
  console.log(`[SMS CONFIRM] userId=${userId} text="${messageText}"`);
  const convoData = convoDoc.data();
  const pendingParse = convoData.pendingParse;
  const upper = messageText.trim().toUpperCase();
  const kw = (messageText.split(/\s+/)[0] || '').toUpperCase();
  const validCommands = ['LIST', 'STATUS', 'DONE', 'DELETE', 'HELP', 'STOP', 'START'];

  const resetConvo = () =>
    db.collection('smsConversations').doc(convoDoc.id).update({
      state: 'idle',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  if (upper === 'YES') {
    const promiseData = {
      customerName: (pendingParse.customer_name && pendingParse.customer_name.toLowerCase() !== 'null') ? pendingParse.customer_name : '',
      customerPhone: '',
      description: pendingParse.promise_text,
      status: 'open',
      createdBy: user.email,
      businessId: user.businessId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      source: 'sms'
    };
    if (pendingParse.due_date) {
      promiseData.dueDate = admin.firestore.Timestamp.fromDate(new Date(pendingParse.due_date));
    } else {
      promiseData.dueDate = null;
    }
    await db.collection('promises').add(promiseData);
    await resetConvo();
    await sendSMS(userPhone, 'Promise logged! Reminders are set.');
    console.log(`[SMS CONFIRM] YES — promise created for userId=${userId}`);
  } else if (upper === 'EDIT') {
    await db.collection('smsConversations').doc(convoDoc.id).update({
      state: 'awaiting_promise',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await sendSMS(userPhone, "Send your updated promise and I'll re-parse it.");
    console.log(`[SMS CONFIRM] EDIT — moved to awaiting_promise for userId=${userId}`);
  } else if (upper === 'CANCEL') {
    await resetConvo();
    await sendSMS(userPhone, 'Cancelled. No promise logged.');
    console.log(`[SMS CONFIRM] CANCEL for userId=${userId}`);
  } else if (validCommands.includes(kw)) {
    // Cancel silently, then route to that command
    await resetConvo();
    switch (kw) {
      case 'LIST':
      case 'STATUS':
        await handleListCommand(userId, userPhone, user);
        break;
      case 'DONE':
        await handleDoneCommand(userId, userPhone, user, messageText);
        break;
      case 'DELETE':
        await handleDeleteCommand(userId, userPhone, user, messageText);
        break;
      case 'HELP':
        await handleHelpCommand(userPhone);
        break;
      case 'STOP':
        await handleStopCommand(userId, userPhone);
        break;
      case 'START':
        await handleStartCommand(userId, userPhone);
        break;
    }
    console.log(`[SMS CONFIRM] validCommand="${kw}" — routed after silent cancel for userId=${userId}`);
  } else {
    const timezone = (user && user.timezone) || 'America/New_York';
    const newParsed = await parsePromiseText(messageText, timezone);
    if (newParsed.promise_text) {
      await db.collection('smsConversations').doc(convoDoc.id).update({
        pendingParse: newParsed,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const confirmMsg = buildConfirmMessage(newParsed);
      await sendSMS(userPhone, confirmMsg);
      console.log(`[SMS CONFIRM] replaced pending confirmation with new parse for userId=${userId}`);
    } else {
      await sendSMS(userPhone, 'Reply YES to confirm, EDIT to change, or CANCEL.');
      console.log(`[SMS CONFIRM] unrecognized input — reprompted for userId=${userId}`);
    }
  }
}

/**
 * Handle the awaiting_promise conversation state (after EDIT).
 */
async function handleAwaitingPromise(convoDoc, userId, userPhone, messageText, userData) {
  console.log(`[SMS AWAITING_PROMISE] userId=${userId} text="${messageText}"`);
  const timezone = (userData && userData.timezone) || 'America/New_York';
  const parsed = await parsePromiseText(messageText, timezone);
  if (!parsed.promise_text) {
    await sendSMS(userPhone, "I couldn't understand that. Try something like: 'Quote for John by Friday' or type HELP for commands.");
    // Stay in awaiting_promise state
    return;
  }

  await db.collection('smsConversations').doc(convoDoc.id).update({
    state: 'awaiting_confirm',
    pendingParse: parsed,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const confirmMsg = buildConfirmMessage(parsed);
  await sendSMS(userPhone, confirmMsg);
  console.log(`[SMS AWAITING_PROMISE] re-parsed — moved to awaiting_confirm for userId=${userId}`);
}

// ─── Main Inbound SMS Handler ─────────────────────────────────────────

exports.handleInboundSMS = onRequest({ minInstances: 1 }, async (req, res) => {
  try {
    const senderPhone = req.body && req.body.from;
    const messageText = ((req.body && req.body.text) || '').trim();
    const messageUuid = req.body && req.body.message_uuid;

    console.log(`[SMS INBOUND] from=${senderPhone} text="${messageText}"`);

    // Dedup: skip Vonage retries that reuse the same message_uuid
    if (messageUuid) {
      const dedupRef = db.collection('processedMessages').doc(messageUuid);
      const dedupSnap = await dedupRef.get();
      if (dedupSnap.exists) {
        console.log(`[SMS INBOUND] Duplicate message_uuid=${messageUuid} — skipping`);
        return res.status(200).send('OK');
      }
      await dedupRef.set({ processedAt: admin.firestore.FieldValue.serverTimestamp() });
      // Note: processedMessages docs are tiny and can be cleaned up periodically (e.g. after 7 days)
    }

    if (!senderPhone) {
      console.warn('[SMS INBOUND] No sender phone in payload — ignoring');
      return;
    }

    // Short-circuit HELP before doing a user lookup — HELP is generic text anyone can receive
    if (messageText.trim().toUpperCase() === 'HELP') {
      await handleHelpCommand(senderPhone);
      res.status(200).send('OK');
      return;
    }

    // Identify the user by matching last 10 digits of phone number
    const user = await findUserByPhone(senderPhone);
    if (!user) {
      console.log(`[SMS INBOUND] No user found for phone ${senderPhone}`);
      await sendSMS(
        senderPhone,
        "This number isn't linked to a Promise Tracker account. Sign up at promisetracker.app"
      );
      return;
    }

    const userId = user.uid;
    console.log(`[SMS INBOUND] Matched userId=${userId}`);

    // Resolve timezone from the business doc (timezone is stored on businesses, not users)
    let userTimezone = 'America/New_York';
    if (user.businessId) {
      const bizDoc = await db.collection('businesses').doc(user.businessId).get();
      if (bizDoc.exists && bizDoc.data().timezone) {
        userTimezone = bizDoc.data().timezone;
      }
    }
    user.timezone = userTimezone;

    // Check for an active multi-turn conversation (e.g. awaiting delete confirmation)
    const convoId = `${userId}_delete`;
    const convoDoc = await db.collection('smsConversations').doc(convoId).get();
    if (convoDoc.exists && convoDoc.data().state !== 'idle') {
      const state = convoDoc.data().state;
      console.log(`[SMS INBOUND] Active conversation state="${state}" for userId=${userId}`);
      if (state === 'awaiting_delete_confirm') {
        await handleDeleteConfirmation(convoDoc, userId, senderPhone, messageText, user);
        // NOTE: bare return; would exit the function BEFORE the final res.status(200).send('OK'),
        // causing Vonage to never receive a response and triggering 504 retries.
        res.status(200).send('OK');
        return;
      }
    }

    // Check for an active confirm/edit conversation (GPT promise parser flow)
    const confirmConvoId = `${userId}_confirm`;
    const confirmConvoDoc = await db.collection('smsConversations').doc(confirmConvoId).get();
    if (confirmConvoDoc.exists && confirmConvoDoc.data().state !== 'idle') {
      const confirmState = confirmConvoDoc.data().state;
      console.log(`[SMS INBOUND] Active confirm conversation state="${confirmState}" for userId=${userId}`);
      if (confirmState === 'awaiting_confirm') {
        await handleConfirmConversation(confirmConvoDoc, userId, senderPhone, messageText, user);
        res.status(200).send('OK');
        return;
      }
      if (confirmState === 'awaiting_promise') {
        await handleAwaitingPromise(confirmConvoDoc, userId, senderPhone, messageText, user);
        res.status(200).send('OK');
        return;
      }
    }

    // Route message: exact single-word commands or keyword+number only.
    // Any keyword followed by natural language text goes to GPT parser.
    const fullTextUpper = messageText.trim().toUpperCase();
    const keyword = (messageText.split(/\s+/)[0] || '').toUpperCase();
    const afterKeyword = messageText.trim().substring(keyword.length).trim();
    console.log(`[SMS INBOUND] Routing fullTextUpper="${fullTextUpper}" keyword="${keyword}" afterKeyword="${afterKeyword}"`);

    if (fullTextUpper === 'LIST' || fullTextUpper === 'STATUS') {
      await handleListCommand(userId, senderPhone, user);
    } else if (fullTextUpper === 'HELP') {
      await handleHelpCommand(senderPhone);
    } else if (fullTextUpper === 'STOP') {
      await handleStopCommand(userId, senderPhone);
    } else if (fullTextUpper === 'START') {
      await handleStartCommand(userId, senderPhone);
    } else if (fullTextUpper === 'CANCEL') {
      const cancelConvoId = `${userId}_delete`;
      const cancelConvoDoc = await db.collection('smsConversations').doc(cancelConvoId).get();
      if (cancelConvoDoc.exists && cancelConvoDoc.data().state !== 'idle') {
        await db.collection('smsConversations').doc(cancelConvoId).update({
          state: 'idle',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await sendSMS(senderPhone, 'Cancelled.');
      } else {
        await sendSMS(senderPhone, 'Nothing to cancel.');
      }
    } else if (keyword === 'DONE' && /^\d+$/.test(afterKeyword)) {
      await handleDoneCommand(userId, senderPhone, user, messageText);
    } else if (keyword === 'DELETE' && /^\d+$/.test(afterKeyword)) {
      await handleDeleteCommand(userId, senderPhone, user, messageText);
    } else {
      console.log(`[SMS INBOUND] GPT parse — text="${messageText}"`);
      const timezone = user.timezone || 'America/New_York';
      const parsed = await parsePromiseText(messageText, timezone);
      if (!parsed.promise_text) {
        await sendSMS(senderPhone, "I couldn't understand that. Try something like: 'Quote for John by Friday' or type HELP for commands.");
      } else {
        const newConfirmConvoId = `${userId}_confirm`;
        await db.collection('smsConversations').doc(newConfirmConvoId).set({
          userId,
          state: 'awaiting_confirm',
          pendingParse: parsed,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const confirmMsg = buildConfirmMessage(parsed);
        await sendSMS(senderPhone, confirmMsg);
      }
    }
  } catch (err) {
    console.error('[SMS INBOUND] Unhandled error:', err.message, err.stack);
    // Best-effort error SMS — never throw from here
    try {
      const senderPhone = req.body && req.body.from;
      if (senderPhone) {
        await sendSMS(senderPhone, 'Something went wrong. Please try again or reply HELP.');
      }
    } catch (smsErr) {
      console.error('[SMS INBOUND] Failed to send error SMS:', smsErr.message);
    }
  }
  // ALWAYS send 200 at the very end so Vonage doesn't retry
  res.status(200).send('OK');
});

// ─── Scheduled function: morning daily briefing at 7 AM ─────────────────────
exports.morningBriefing = onSchedule("every 5 minutes", async (event) => {
  console.log("morningBriefing: starting run at", new Date().toISOString());

  let businessesSnap;
  try {
    businessesSnap = await db.collection("businesses").get();
  } catch (err) {
    console.error("morningBriefing: failed to query businesses:", err.message);
    return null;
  }

  const nowMs = Date.now();

  for (const bizDoc of businessesSnap.docs) {
    try {
      const businessId = bizDoc.id;
      const bizData = bizDoc.data();
      const bizTimezone = bizData.timezone || "America/New_York";

      // Check if it's 7:00–7:04 AM in this business's timezone
      const localTime = new Date().toLocaleString('en-US', { timeZone: bizTimezone });
      const localDate = new Date(localTime);
      const localHour = localDate.getHours();
      const localMinute = localDate.getMinutes();

      if (!(localHour === 7 && localMinute < 5)) {
        continue; // Not in the 7:00–7:04 AM window for this business
      }

      console.log(`morningBriefing: in window for business ${businessId} (${bizTimezone})`);

      // Build today's date key: YYYY-MM-DD in business's local timezone
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const todayKey = `${year}-${month}-${day}`;

      // Prevent duplicate sends — check if briefing already sent today
      const briefingDocId = `${businessId}_${todayKey}`;
      const briefingDocRef = db.collection("morningBriefings").doc(briefingDocId);
      const briefingDocSnap = await briefingDocRef.get();
      if (briefingDocSnap.exists) {
        console.log(`morningBriefing: already sent for ${businessId} on ${todayKey} — skipping`);
        continue;
      }

      // Query all open/overdue promises for this business
      const promisesSnap = await db.collection("promises")
        .where("businessId", "==", businessId)
        .where("status", "in", ["open", "overdue"])
        .get();

      if (promisesSnap.empty) {
        // Mark as checked so we don't re-query during the 7:00–7:04 window
        await briefingDocRef.set({
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          noPromises: true,
        });
        continue;
      }

      // Boundaries for "today" in the business's local timezone
      const todayStart = new Date(localDate);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(localDate);
      todayEnd.setHours(23, 59, 59, 999);

      const todayDuePromises = [];
      const overduePromises = [];

      for (const pDoc of promisesSnap.docs) {
        const p = pDoc.data();
        if (!p.dueDate || !p.dueDate.toDate) continue;

        const dueDateMs = p.dueDate.toDate().getTime();
        const dueDateLocalStr = p.dueDate.toDate().toLocaleString('en-US', { timeZone: bizTimezone });
        const dueDateLocal = new Date(dueDateLocalStr);

        if (dueDateLocal >= todayStart && dueDateLocal <= todayEnd) {
          // Due today in this timezone
          todayDuePromises.push(p);
        } else if (dueDateMs < nowMs) {
          // Past due from a previous day
          overduePromises.push({ ...p, dueDateMs });
        }
        // Future promises beyond today are not included in the morning briefing
      }

      if (todayDuePromises.length === 0 && overduePromises.length === 0) {
        await briefingDocRef.set({
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          noRelevantPromises: true,
        });
        continue;
      }

      // Sort today's promises by due time ascending
      todayDuePromises.sort((a, b) => a.dueDate.toDate().getTime() - b.dueDate.toDate().getTime());
      // Sort overdue by most overdue first
      overduePromises.sort((a, b) => a.dueDateMs - b.dueDateMs);

      // Build consolidated SMS
      const smsLines = ["Good morning! Here's your day:"];

      if (todayDuePromises.length > 0) {
        smsLines.push("DUE TODAY:");
        todayDuePromises.forEach((p, i) => {
          const timeStr = p.dueDate.toDate().toLocaleTimeString('en-US', {
            timeZone: bizTimezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          smsLines.push(`${i + 1}) ${p.customerName || 'Customer'} - ${p.description || '?'} - ${timeStr}`);
        });
      }

      if (overduePromises.length > 0) {
        smsLines.push("OVERDUE:");
        overduePromises.forEach((p, i) => {
          const daysOverdue = Math.max(1, Math.floor((nowMs - p.dueDateMs) / (24 * 60 * 60 * 1000)));
          smsLines.push(`${i + 1}) ${p.customerName || 'Customer'} - ${p.description || '?'} - ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`);
        });
      }

      smsLines.push("Reply LIST for full details.");
      const smsMessage = smsLines.join("\n");

      // Send to all users in this business who haven't opted out
      const usersSnap = await db.collection("users")
        .where("businessId", "==", businessId)
        .get();

      let smsSentCount = 0;
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (userData.smsEnabled === false) continue; // Explicitly opted out
        const phone = userData.phone;
        if (!phone) continue;
        await sendSMS(phone, smsMessage);
        smsSentCount++;
      }

      // Record that the briefing was sent to prevent duplicate sends
      await briefingDocRef.set({
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        todayCount: todayDuePromises.length,
        overdueCount: overduePromises.length,
        smsSentCount,
      });

      console.log(`morningBriefing: sent for ${businessId} on ${todayKey} — today: ${todayDuePromises.length}, overdue: ${overduePromises.length}, sms sent: ${smsSentCount}`);
    } catch (err) {
      console.error(`morningBriefing: error processing business ${bizDoc.id}:`, err.message);
    }
  }

  console.log("morningBriefing: finished run");
  return null;
});
