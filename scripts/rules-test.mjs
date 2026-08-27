// TEMPORARY rules verification script — safe to delete.
// Verifies the LIVE deployed Firestore rules on the `businesses` collection
// using the client SDK with real auth (never the Admin SDK).
//
// Credentials come from env vars only — nothing is hardcoded:
//   OWNER_EMAIL, OWNER_PASSWORD       (owner of the business under test; its id is
//                                      read from users/{owner uid}.businessId)
//   NONOWNER_EMAIL, NONOWNER_PASSWORD (any account that is NOT that owner)

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDptnFOEW7ZP68Q5PXachAYKXxCEt-8Kis",
  authDomain: "promise-tracker-mvp.firebaseapp.com",
  projectId: "promise-tracker-mvp",
  storageBucket: "promise-tracker-mvp.firebasestorage.app",
  messagingSenderId: "682807332484",
  appId: "1:682807332484:web:4049f67a2ebf4d40bbfcd1",
};

const CREATE_TEST_DOC_ID = "zz-rules-test-DELETEME";

const { OWNER_EMAIL, OWNER_PASSWORD, NONOWNER_EMAIL, NONOWNER_PASSWORD } = process.env;
for (const [k, v] of Object.entries({ OWNER_EMAIL, OWNER_PASSWORD, NONOWNER_EMAIL, NONOWNER_PASSWORD })) {
  if (!v) {
    console.error(`Missing env var ${k}`);
    process.exit(2);
  }
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Runs an op that SHOULD be blocked by rules. Returns {denied, error}.
async function attempt(fn) {
  try {
    await fn();
    return { denied: false, error: null };
  } catch (e) {
    return { denied: e.code === "permission-denied", error: e };
  }
}

const results = [];
function record(caseNo, label, pass, detail = "") {
  results.push({ caseNo, label, pass, detail });
}

try {
  // ---- Sign in as OWNER ----
  const owner = await signInWithEmailAndPassword(auth, OWNER_EMAIL, OWNER_PASSWORD);
  const ownerUid = owner.user.uid;
  console.log(`Signed in as owner: ${OWNER_EMAIL} (uid ${ownerUid})`);

  // Resolve the business under test from the owner's user doc
  const userSnap = await getDoc(doc(db, "users", ownerUid));
  const businessId = userSnap.exists() ? userSnap.get("businessId") : undefined;
  if (!businessId) {
    throw new Error(`users/${ownerUid} is missing a businessId field — cannot determine which business to test`);
  }
  console.log(`Business under test: businesses/${businessId}`);
  const bizRef = doc(db, "businesses", businessId);

  const snap = await getDoc(bizRef);
  if (!snap.exists()) throw new Error(`Business doc ${businessId} not found`);
  const originalName = snap.get("name");
  const docOwnerId = snap.get("ownerId");
  console.log(`Business "${originalName}", ownerId ${docOwnerId}`);
  if (docOwnerId !== ownerUid) {
    console.warn("WARNING: signed-in account is NOT the ownerId on this business doc — owner cases will not test what you intend.");
  }

  // ---- Case 2: owner updates name to its CURRENT value -> expect success (no-op) ----
  {
    const r = await attempt(() => updateDoc(bizRef, { name: originalName }));
    if (!r.error) {
      const after = await getDoc(bizRef);
      const unchanged = after.get("name") === originalName;
      record(2, "owner updateDoc {name:<current>}", true, unchanged ? "allowed; name unchanged (no-op confirmed)" : "allowed but name readback differs!");
    } else {
      record(2, "owner updateDoc {name:<current>}", false, `blocked: ${r.error.code || r.error.message}`);
    }
  }

  // ---- Case 4: owner creates businesses doc with plan 'pro' -> expect permission-denied ----
  {
    const createRef = doc(db, "businesses", CREATE_TEST_DOC_ID);
    const r = await attempt(() => setDoc(createRef, { ownerId: ownerUid, name: "x", plan: "pro" }));
    if (r.denied) {
      record(4, "owner create businesses doc {plan:'pro'}", true, "denied as expected");
    } else if (!r.error) {
      const exists = (await getDoc(createRef)).exists();
      record(4, "owner create businesses doc {plan:'pro'}", false,
        `CREATE SUCCEEDED — doc businesses/${CREATE_TEST_DOC_ID} ${exists ? "EXISTS and must be deleted manually" : "was created (existence check inconclusive)"}`);
    } else {
      record(4, "owner create businesses doc {plan:'pro'}", false, `unexpected error: ${r.error.code || r.error.message}`);
    }
  }

  // ---- Sign in as NON-OWNER ----
  await signOut(auth);
  const nonOwner = await signInWithEmailAndPassword(auth, NONOWNER_EMAIL, NONOWNER_PASSWORD);
  console.log(`Signed in as non-owner: ${NONOWNER_EMAIL} (uid ${nonOwner.user.uid})`);
  if (nonOwner.user.uid === docOwnerId) {
    console.warn("WARNING: 'non-owner' account IS the business owner — case 3 is invalid.");
  }

  // ---- Case 1: non-owner attempts a REAL plan change on THEIR OWN business -> expect permission-denied ----
  // Exercises the owner-only + field-whitelist update rule ('plan' is not in the whitelist), not a no-op.
  {
    const nonOwnerUid = nonOwner.user.uid;
    const noUserSnap = await getDoc(doc(db, "users", nonOwnerUid));
    const nonOwnerBusinessId = noUserSnap.exists() ? noUserSnap.get("businessId") : undefined;
    if (!nonOwnerBusinessId) {
      throw new Error(`users/${nonOwnerUid} is missing a businessId field — cannot run Case 1`);
    }
    const noBizRef = doc(db, "businesses", nonOwnerBusinessId);
    const noBizSnap = await getDoc(noBizRef);
    if (!noBizSnap.exists()) throw new Error(`Business doc ${nonOwnerBusinessId} not found — cannot run Case 1`);
    const currentPlan = noBizSnap.get("plan");
    console.log(`Case 1 target: businesses/${nonOwnerBusinessId}, current plan: ${currentPlan}`);
    if (currentPlan === "pro") {
      console.warn("WARNING: target business plan is already 'pro' — Case 1 is INCONCLUSIVE (a denied write is indistinguishable from a no-op success).");
    }
    const label = `non-owner updateDoc {plan:'pro'} on businesses/${nonOwnerBusinessId}`;
    const r = await attempt(() => updateDoc(noBizRef, { plan: "pro" }));
    if (r.denied) record(1, label, true, "denied as expected");
    else if (!r.error) record(1, label, false, `UPDATE SUCCEEDED — plan changed from '${currentPlan}' to 'pro'! Restore manually.`);
    else record(1, label, false, `unexpected error: ${r.error.code || r.error.message}`);
  }

  // ---- Case 3: non-owner updates name -> expect permission-denied ----
  {
    const r = await attempt(() => updateDoc(bizRef, { name: "hacked" }));
    if (r.denied) {
      record(3, "non-owner updateDoc {name:'hacked'}", true, "denied as expected");
    } else if (!r.error) {
      record(3, "non-owner updateDoc {name:'hacked'}", false, "UPDATE SUCCEEDED — restoring original name as owner...");
      await signOut(auth);
      await signInWithEmailAndPassword(auth, OWNER_EMAIL, OWNER_PASSWORD);
      await updateDoc(bizRef, { name: originalName });
      console.log(`Restored business name to "${originalName}".`);
    } else {
      record(3, "non-owner updateDoc {name:'hacked'}", false, `unexpected error: ${r.error.code || r.error.message}`);
    }
  }
} catch (e) {
  console.error("ABORTED:", e.code || "", e.message);
  process.exit(1);
}

console.log("\n===== RESULTS =====");
for (const r of results.sort((a, b) => a.caseNo - b.caseNo)) {
  console.log(`Case ${r.caseNo} [${r.pass ? "PASS" : "FAIL"}] ${r.label} — ${r.detail}`);
}
process.exit(results.every((r) => r.pass) ? 0 : 1);
