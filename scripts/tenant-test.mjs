// TEMPORARY tenant-isolation test for Firestore rules — DELETE after running.
// Read-only: signs in, runs queries, signs out. No writes, no deploys.
//
// Usage (PowerShell):
//   $env:OWNER_EMAIL='...'; $env:OWNER_PASSWORD='...'; $env:NONOWNER_EMAIL='...'; $env:NONOWNER_PASSWORD='...'
//   node scripts/tenant-test.mjs
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../src/config/firebase.js";

const MAIN_BUSINESS_ID = "8aDr4oRGmMpJBFJuIi6r";

const { OWNER_EMAIL, OWNER_PASSWORD, NONOWNER_EMAIL, NONOWNER_PASSWORD } = process.env;
const missing = Object.entries({ OWNER_EMAIL, OWNER_PASSWORD, NONOWNER_EMAIL, NONOWNER_PASSWORD })
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}. Set them and re-run.`);
  process.exit(2);
}

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });
const isDenied = (e) => e?.code === "permission-denied";

async function countByBusiness(coll, businessId) {
  const snap = await getDocs(query(collection(db, coll), where("businessId", "==", businessId)));
  return snap.size;
}

try {
  // ---- Case 1: OWNER reads own business's promises (positive control) ----
  let ownerOk = false;
  try {
    await signInWithEmailAndPassword(auth, OWNER_EMAIL, OWNER_PASSWORD);
    ownerOk = true;
  } catch (e) {
    record("Case 1: owner reads own promises", false, `owner sign-in failed (${e.code || e.message})`);
  }
  if (ownerOk) {
    try {
      const n = await countByBusiness("promises", MAIN_BUSINESS_ID);
      record("Case 1: owner reads own promises", true, `ALLOWED as expected — ${n} doc(s) returned`);
    } catch (e) {
      record("Case 1: owner reads own promises", false, `expected ALLOWED, got error: ${e.code || e.message}`);
    }
    await signOut(auth);
  }

  // ---- Sign in as NON-OWNER for cases 2–4 ----
  let nonOwnerUid = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, NONOWNER_EMAIL, NONOWNER_PASSWORD);
    nonOwnerUid = cred.user.uid;
  } catch (e) {
    const why = `non-owner sign-in failed (${e.code || e.message})`;
    record("Case 2: non-owner reads owner's promises", false, why);
    record("Case 3: non-owner reads owner's contacts", false, why);
    record("Case 4: non-owner reads own promises", false, why);
  }

  if (nonOwnerUid) {
    // ---- Case 2: NON-OWNER queries the owner's promises → must be denied ----
    try {
      const n = await countByBusiness("promises", MAIN_BUSINESS_ID);
      record("Case 2: non-owner reads owner's promises", false, `NOT denied — query succeeded and returned ${n} doc(s). RULES LEAK.`);
    } catch (e) {
      if (isDenied(e)) record("Case 2: non-owner reads owner's promises", true, "DENIED as expected (permission-denied)");
      else record("Case 2: non-owner reads owner's promises", false, `denied, but with unexpected error: ${e.code || e.message}`);
    }

    // ---- Case 3: NON-OWNER queries the owner's contacts → must be denied ----
    try {
      const n = await countByBusiness("contacts", MAIN_BUSINESS_ID);
      record("Case 3: non-owner reads owner's contacts", false, `NOT denied — query succeeded and returned ${n} doc(s). RULES LEAK.`);
    } catch (e) {
      if (isDenied(e)) record("Case 3: non-owner reads owner's contacts", true, "DENIED as expected (permission-denied)");
      else record("Case 3: non-owner reads owner's contacts", false, `denied, but with unexpected error: ${e.code || e.message}`);
    }

    // ---- Case 4: NON-OWNER queries their OWN business's promises (positive control) ----
    try {
      const userSnap = await getDoc(doc(db, "users", nonOwnerUid));
      const ownBusinessId = userSnap.data()?.businessId;
      if (!ownBusinessId) {
        record("Case 4: non-owner reads own promises", false, "non-owner users doc has no businessId");
      } else if (ownBusinessId === MAIN_BUSINESS_ID) {
        record("Case 4: non-owner reads own promises", false, "non-owner belongs to the MAIN business — cases 2/3 are invalid; use a different account");
      } else {
        const n = await countByBusiness("promises", ownBusinessId);
        record("Case 4: non-owner reads own promises", true, `ALLOWED as expected — ${n} doc(s) from own business ${ownBusinessId}`);
      }
    } catch (e) {
      record("Case 4: non-owner reads own promises", false, `expected ALLOWED, got error: ${e.code || e.message}`);
    }

    await signOut(auth);
  }
} finally {
  const width = Math.max(...results.map((r) => r.name.length));
  console.log("\n==================== RESULTS ====================");
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
  }
  const failed = results.filter((r) => !r.pass).length;
  console.log("=================================================");
  console.log(failed === 0 ? "ALL 4 CASES PASSED — tenant isolation holds." : `${failed} case(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}
