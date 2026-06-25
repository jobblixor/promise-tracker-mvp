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
  if (!businessId) {
    await sendSMS(userPhone, 'Your account is not linked to a business. Please complete setup at promisetracker.app');
    return;
  }

  const snapshot = await db.collection('promises')
    .where('businessId', '==', businessId)
    .where('status', '==', 'open')
    .orderBy('dueDate', 'asc')
    .get();

  if (snapshot.empty) {
    await sendSMS(userPhone, 'No open promises. Nice work! 🎉');
    return;
  }

  const allDocs = snapshot.docs;
  const showDocs = allDocs.slice(0, 5);
  const promiseIds = showDocs.map(d => d.id);

  // Store number-to-promiseId mapping so DONE/DELETE by number work
  await db.collection('smsListMappings').doc(userId).set({
    promiseIds,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const lines = showDocs.map((doc, i) => {
    const p = doc.data();
    const due = formatDueShort(p.dueDate);
    return `${i + 1}) ${p.description || '(no description)'} - ${p.customerName || '?'} - ${due}`;
  });

  let msg = 'Your promises:\n' + lines.join('\n');
  if (allDocs.length > 5) {
    msg += '\nShowing 5 soonest. Reply MORE for next page.';
  }

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
    // Freeform substring match on description or customerName
    const openSnap = await db.collection('promises')
      .where('businessId', '==', businessId)
      .where('status', '==', 'open')
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
    status: 'completed',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Count remaining open promises
  const remainingSnap = await db.collection('promises')
    .where('businessId', '==', businessId)
    .where('status', '==', 'open')
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
      .where('status', '==', 'open')
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

async function handleDeleteConfirmation(convoDoc, userId, userPhone, messageText) {
  console.log(`[SMS DELETE CONFIRM] userId=${userId} text="${messageText}"`);
  const convoData = convoDoc.data();
  const promiseId = convoData.pendingDeleteId;
  const desc = convoData.pendingDeleteDesc || '(no description)';

  // Reset conversation state regardless of outcome
  await db.collection('smsConversations').doc(convoDoc.id).update({
    state: 'idle',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (messageText.trim().toUpperCase() === 'YES') {
    await db.collection('promises').doc(promiseId).delete();
    console.log(`[SMS DELETE CONFIRM] Deleted promise ${promiseId}`);
    await sendSMS(userPhone, '🗑️ Deleted.');
  } else {
    await sendSMS(userPhone, 'Cancelled. Promise kept.');
  }
}

async function handleHelpCommand(userPhone) {
  console.log(`[SMS HELP] userPhone=${userPhone}`);
  await sendSMS(
    userPhone,
    "Promise Tracker SMS Commands:\n" +
    "• Text any promise to log it (e.g. 'Quote for John by Friday')\n" +
    "• LIST — see your open promises\n" +
    "• DONE # — mark a promise complete\n" +
    "• DELETE # — remove a promise\n" +
    "• HELP — this message\n" +
    "• STOP — unsubscribe from texts"
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

// ─── Main Inbound SMS Handler ─────────────────────────────────────────

exports.handleInboundSMS = onRequest({ minInstances: 1 }, async (req, res) => {
  try {
    const senderPhone = req.body && req.body.from;
    const messageText = ((req.body && req.body.text) || '').trim();

    console.log(`[SMS INBOUND] from=${senderPhone} text="${messageText}"`);

    if (!senderPhone) {
      console.warn('[SMS INBOUND] No sender phone in payload — ignoring');
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

    // Check for an active multi-turn conversation (e.g. awaiting delete confirmation)
    const convoId = `${userId}_delete`;
    const convoDoc = await db.collection('smsConversations').doc(convoId).get();
    if (convoDoc.exists && convoDoc.data().state !== 'idle') {
      const state = convoDoc.data().state;
      console.log(`[SMS INBOUND] Active conversation state="${state}" for userId=${userId}`);
      if (state === 'awaiting_delete_confirm') {
        await handleDeleteConfirmation(convoDoc, userId, senderPhone, messageText);
        return;
      }
    }

    // Route by the first word (keyword), case-insensitive
    const keyword = (messageText.split(/\s+/)[0] || '').toUpperCase();
    console.log(`[SMS INBOUND] Routing keyword="${keyword}"`);

    switch (keyword) {
      case 'LIST':
      case 'STATUS':
        await handleListCommand(userId, senderPhone, user);
        break;
      case 'DONE':
        await handleDoneCommand(userId, senderPhone, user, messageText);
        break;
      case 'DELETE':
        await handleDeleteCommand(userId, senderPhone, user, messageText);
        break;
      case 'HELP':
        await handleHelpCommand(senderPhone);
        break;
      case 'STOP':
        await handleStopCommand(userId, senderPhone);
        break;
      case 'START':
        await handleStartCommand(userId, senderPhone);
        break;
      default:
        console.log(`[SMS INBOUND] Unrecognized keyword="${keyword}"`);
        await sendSMS(senderPhone, 'Command not recognized. Reply HELP for available commands.');
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
