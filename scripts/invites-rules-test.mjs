// Batch E rules test for owner-only invites list/create — follows scripts/createdby-rules-test.mjs.
// Signs in as ONE user, runs the same cases, and expects ALLOWED or DENIED from that user's role
// (owner -> list/create allowed; anything else -> denied). Never touches existing docs.
// The only doc it can create is one test invite (owner run); clients cannot delete invites
// (rule: delete false), so cleanup is a REST DELETE with a Google OAuth token if GCLOUD_TOKEN is
// set, otherwise the id is printed as LEFTOVER for a manual REST delete.
//
// Usage (bash):
//   PT_TEST_EMAIL=... PT_TEST_PASSWORD=... [GCLOUD_TOKEN=$(gcloud auth print-access-token)] node scripts/invites-rules-test.mjs
// Usage (PowerShell):
//   $env:PT_TEST_EMAIL='...'; $env:PT_TEST_PASSWORD='...'; $env:GCLOUD_TOKEN=(gcloud auth print-access-token); node scripts/invites-rules-test.mjs
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../src/config/firebase.js";

const { PT_TEST_EMAIL, PT_TEST_PASSWORD, GCLOUD_TOKEN } = process.env;
const missing = Object.entries({ PT_TEST_EMAIL, PT_TEST_PASSWORD }).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}. Set them and re-run.`);
  process.exit(2);
}

const PROJECT = "promise-tracker-mvp";
// Two real businesses; whichever is NOT the signed-in user's is used as the foreign businessId.
const KNOWN_BUSINESSES = ["8aDr4oRGmMpJBFJuIi6r", "FTEADnejdpahvkM9nesq"];
const TEST_INVITE_EMAIL = "batch-e-rules-test@notreal.xyz";

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });
const isDenied = (e) => e?.code === "permission-denied";
const created = [];
const deleted = [];

function inviteDoc(businessId, businessName, uid, overrides) {
  return {
    email: TEST_INVITE_EMAIL,
    role: "tech",
    phone: "",
    businessId,
    businessName: businessName || "Batch E rules test",
    invitedBy: uid,
    createdAt: serverTimestamp(),
    status: "pending",
    ...overrides,
  };
}

// Expect helper: runs fn; passes when the outcome matches `expectAllowed`.
async function expect(name, expectAllowed, fn, onAllowed) {
  try {
    const out = await fn();
    if (expectAllowed) record(name, true, `ALLOWED as expected${onAllowed ? " — " + onAllowed(out) : ""}`);
    else record(name, false, `NOT denied${onAllowed ? " — " + onAllowed(out) : ""}. RULES GAP.`);
    return out;
  } catch (e) {
    if (isDenied(e)) record(name, !expectAllowed, expectAllowed ? "expected ALLOWED, got permission-denied" : "DENIED as expected (permission-denied)");
    else record(name, false, `unexpected error: ${e.code || e.message}`);
    return null;
  }
}

async function restDelete(id) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/invites/${id}`;
  const h = { Authorization: `Bearer ${GCLOUD_TOKEN}`, "X-Goog-User-Project": PROJECT };
  const del = await fetch(url, { method: "DELETE", headers: h });
  if (!del.ok) throw new Error(`REST DELETE HTTP ${del.status}: ${(await del.text()).slice(0, 200)}`);
  const chk = await fetch(url, { headers: h });
  if (chk.status !== 404) throw new Error(`post-delete GET expected 404, got ${chk.status}`);
}

let signedIn = false;
let role = null;
let ownerRun = false;
let createdId = null;

try {
  const cred = await signInWithEmailAndPassword(auth, PT_TEST_EMAIL, PT_TEST_PASSWORD);
  signedIn = true;
  const uid = cred.user.uid;
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) throw new Error(`users/${uid} does not exist`);
  const { businessId, businessName } = userSnap.data();
  role = userSnap.data().role;
  ownerRun = role === "owner";
  const foreignBusinessId = KNOWN_BUSINESSES.find((b) => b !== businessId) || KNOWN_BUSINESSES[0];
  console.log(`Signed in uid=${uid}`);
  console.log(`  email      : ${cred.user.email}`);
  console.log(`  role       : ${role}  -> expecting list/create ${ownerRun ? "ALLOWED" : "DENIED"}`);
  console.log(`  businessId : ${businessId}`);
  console.log(`  foreign    : ${foreignBusinessId}`);
  if (!businessId) throw new Error("users doc has no businessId");

  // ---- T1: list pending invites for own business (the Team page query) ----
  await expect("T1 list invites (own business, pending)", ownerRun, async () => {
    const snap = await getDocs(query(collection(db, "invites"), where("businessId", "==", businessId), where("status", "==", "pending")));
    return snap.size;
  }, (n) => `${n} pending invite(s) visible`);

  // ---- T2: create a tech invite for own business ----
  const ref = await expect("T2 create invite (own business, role tech)", ownerRun, async () => {
    const r = await addDoc(collection(db, "invites"), inviteDoc(businessId, businessName, uid));
    created.push(r.id);
    return r;
  }, (r) => `invites/${r.id}`);
  if (ref) createdId = ref.id;

  // ---- T3: create with role 'owner' -> DENIED for everyone (allowlist regression) ----
  await expect("T3 create invite (own business, role owner)", false, async () => {
    const r = await addDoc(collection(db, "invites"), inviteDoc(businessId, businessName, uid, { role: "owner" }));
    created.push(r.id);
    return r;
  }, (r) => `created invites/${r.id}`);

  // ---- T4: create for a foreign business -> DENIED for everyone ----
  await expect("T4 create invite (foreign business)", false, async () => {
    const r = await addDoc(collection(db, "invites"), inviteDoc(foreignBusinessId, "foreign", uid));
    created.push(r.id);
    return r;
  }, (r) => `created invites/${r.id}`);

  // ---- T5: client delete of the created invite -> DENIED (delete rule is false) ----
  if (createdId) {
    await expect("T5 client delete created invite", false, async () => {
      await deleteDoc(doc(db, "invites", createdId));
      deleted.push(createdId);
    });
  } else {
    record("T5 client delete created invite", !ownerRun, ownerRun ? "skipped — T2 created nothing" : "n/a — nothing created (non-owner run)");
  }
} catch (e) {
  record("setup / sign-in", false, `${e.code || e.message}`);
} finally {
  if (signedIn) await signOut(auth);

  // ---- T6: REST cleanup of anything created (OAuth token bypasses rules) ----
  const leftover = created.filter((id) => !deleted.includes(id));
  if (leftover.length === 0) {
    record("T6 REST cleanup", true, ownerRun ? "nothing left to delete" : "nothing created");
  } else if (!GCLOUD_TOKEN) {
    record("T6 REST cleanup", false, `GCLOUD_TOKEN not set — LEFTOVER: ${leftover.join(", ")}`);
  } else {
    let ok = true;
    for (const id of leftover) {
      try { await restDelete(id); deleted.push(id); }
      catch (e) { ok = false; console.error(`  REST delete FAILED for invites/${id}: ${e.message}`); }
    }
    record("T6 REST cleanup", ok, ok ? `deleted ${leftover.length}/${leftover.length} via REST, 404 confirmed` : "see errors above");
  }

  const width = Math.max(...results.map((r) => r.name.length));
  console.log("\n==================== RESULTS ====================");
  for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
  console.log("=================================================");
  console.log(`role    : ${role}`);
  console.log(`created : ${created.length ? created.join(", ") : "(none)"}`);
  console.log(`deleted : ${deleted.length ? deleted.join(", ") : "(none)"}`);
  const still = created.filter((id) => !deleted.includes(id));
  if (still.length) console.log(`LEFTOVER (delete via REST): ${still.join(", ")}`);
  const failed = results.filter((r) => !r.pass).length;
  console.log(failed === 0 ? `ALL ${results.length} CASES PASSED for role=${role}.` : `${failed} case(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}
