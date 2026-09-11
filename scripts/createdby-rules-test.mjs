// Batch B rules test for promises.createdBy pinning — follows scripts/tenant-test.mjs.
// Signs in as ONE test user (own4), creates/updates/deletes only its own promises, signs out.
// Never touches existing docs. Every doc id created and deleted is printed.
//
// Usage (PowerShell):
//   $env:PT_TEST_EMAIL='jobbli.xor+own4@gmail.com'; $env:PT_TEST_PASSWORD='...'
//   node scripts/createdby-rules-test.mjs
// Usage (bash):
//   PT_TEST_EMAIL=... PT_TEST_PASSWORD=... node scripts/createdby-rules-test.mjs
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "../src/config/firebase.js";

const { PT_TEST_EMAIL, PT_TEST_PASSWORD } = process.env;
const missing = Object.entries({ PT_TEST_EMAIL, PT_TEST_PASSWORD }).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}. Set them and re-run.`);
  process.exit(2);
}

// A real user in a DIFFERENT business than own4 (inv13 manager, business 8aDr4oRGmMpJBFJuIi6r)
const FOREIGN_USER_EMAIL = "jobbli.xor+inv13@gmail.com";
// Far-future due date so no reminder logic can ever touch these docs
const FAR_FUTURE = Timestamp.fromDate(new Date("2027-01-01T12:00:00Z"));

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });
const isDenied = (e) => e?.code === "permission-denied";
const created = []; // ids this run created
const deleted = []; // ids this run deleted

function mixCase(s) {
  // alternate upper/lower on letters so the value differs from the stored email but matches case-insensitively
  let i = 0;
  return s.replace(/[a-z]/gi, (c) => (i++ % 2 === 0 ? c.toUpperCase() : c.toLowerCase()));
}

function promiseDoc(overrides) {
  return {
    customerName: "Batch B rules test",
    customerPhone: "",
    description: "Batch B createdBy rules test — safe to delete",
    dueDate: FAR_FUTURE,
    status: "open",
    createdAt: serverTimestamp(),
    completedAt: null,
    source: "web",
    ...overrides,
  };
}

let signedIn = false;
let t1Id = null;
let t2Id = null;

try {
  const cred = await signInWithEmailAndPassword(auth, PT_TEST_EMAIL, PT_TEST_PASSWORD);
  signedIn = true;
  const uid = cred.user.uid;
  const tokenEmail = cred.user.email;
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) throw new Error(`users/${uid} does not exist`);
  const usersDocEmail = userSnap.data().email;
  const businessId = userSnap.data().businessId;
  console.log(`Signed in uid=${uid}`);
  console.log(`  auth token email : ${tokenEmail}`);
  console.log(`  users-doc email  : ${usersDocEmail}`);
  console.log(`  businessId       : ${businessId}`);
  if (!businessId) throw new Error("users doc has no businessId");

  // ---- T1: create with createdBy = own users-doc email exactly -> ALLOWED ----
  try {
    const ref = await addDoc(collection(db, "promises"), promiseDoc({ createdBy: usersDocEmail, businessId }));
    t1Id = ref.id; created.push(t1Id);
    record("T1 create createdBy = own email (exact)", true, `ALLOWED as expected — promises/${t1Id}`);
  } catch (e) {
    record("T1 create createdBy = own email (exact)", false, `expected ALLOWED, got: ${e.code || e.message}`);
  }

  // ---- T2: create with createdBy = own email in mixed case -> ALLOWED ----
  const mixed = mixCase(usersDocEmail);
  try {
    const ref = await addDoc(collection(db, "promises"), promiseDoc({ createdBy: mixed, businessId }));
    t2Id = ref.id; created.push(t2Id);
    record("T2 create createdBy = own email (mixed case)", true, `ALLOWED as expected — promises/${t2Id} (createdBy "${mixed}")`);
  } catch (e) {
    record("T2 create createdBy = own email (mixed case)", false, `expected ALLOWED, got: ${e.code || e.message} (createdBy "${mixed}")`);
  }

  // ---- T3: create with createdBy = a real user in a DIFFERENT business -> DENIED ----
  try {
    const ref = await addDoc(collection(db, "promises"), promiseDoc({ createdBy: FOREIGN_USER_EMAIL, businessId }));
    created.push(ref.id);
    record("T3 create createdBy = foreign user", false, `NOT denied — created promises/${ref.id}. RULES GAP.`);
  } catch (e) {
    if (isDenied(e)) record("T3 create createdBy = foreign user", true, "DENIED as expected (permission-denied)");
    else record("T3 create createdBy = foreign user", false, `denied, but with unexpected error: ${e.code || e.message}`);
  }

  // ---- T4: partial update of T1 without createdBy -> ALLOWED ----
  if (t1Id) {
    try {
      await updateDoc(doc(db, "promises", t1Id), { status: "done", completedAt: serverTimestamp() });
      record("T4 update T1 {status:'done'} (no createdBy)", true, "ALLOWED as expected");
    } catch (e) {
      record("T4 update T1 {status:'done'} (no createdBy)", false, `expected ALLOWED, got: ${e.code || e.message}`);
    }
  } else {
    record("T4 update T1 {status:'done'} (no createdBy)", false, "skipped — T1 was not created");
  }

  // ---- T5: rewrite createdBy on T1 -> DENIED ----
  if (t1Id) {
    try {
      await updateDoc(doc(db, "promises", t1Id), { createdBy: "attacker@example.com" });
      record("T5 update T1 {createdBy:'attacker@example.com'}", false, "NOT denied — createdBy was rewritten. RULES GAP.");
    } catch (e) {
      if (isDenied(e)) record("T5 update T1 {createdBy:'attacker@example.com'}", true, "DENIED as expected (permission-denied)");
      else record("T5 update T1 {createdBy:'attacker@example.com'}", false, `denied, but with unexpected error: ${e.code || e.message}`);
    }
  } else {
    record("T5 update T1 {createdBy:'attacker@example.com'}", false, "skipped — T1 was not created");
  }
} catch (e) {
  record("setup / sign-in", false, `${e.code || e.message}`);
} finally {
  // ---- T6: delete everything this run created -> ALLOWED ----
  if (signedIn) {
    let allOk = created.length > 0;
    for (const id of created) {
      try {
        await deleteDoc(doc(db, "promises", id));
        deleted.push(id);
      } catch (e) {
        allOk = false;
        console.error(`  delete FAILED for promises/${id}: ${e.code || e.message}`);
      }
    }
    if (created.length === 0) record("T6 delete created promises", false, "nothing was created to delete");
    else record("T6 delete created promises", allOk, allOk ? `ALLOWED as expected — deleted ${deleted.length}/${created.length}` : `deleted ${deleted.length}/${created.length} — see errors above`);
    await signOut(auth);
  }

  const width = Math.max(...results.map((r) => r.name.length));
  console.log("\n==================== RESULTS ====================");
  for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
  console.log("=================================================");
  console.log(`created : ${created.length ? created.join(", ") : "(none)"}`);
  console.log(`deleted : ${deleted.length ? deleted.join(", ") : "(none)"}`);
  const leftover = created.filter((id) => !deleted.includes(id));
  if (leftover.length) console.log(`LEFTOVER (clean up manually): ${leftover.join(", ")}`);
  const failed = results.filter((r) => !r.pass).length;
  console.log(failed === 0 ? "ALL 6 CASES PASSED — createdBy pinning holds." : `${failed} case(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}
