import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { auth, db } from '../config/firebase';
import app from '../config/firebase';
import { getBrowserFingerprint, getDeviceId, getIpAddress } from '../utils/fingerprint';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    const userData = await fetchUserData(auth.currentUser.uid);
    if (userData) {
      setUser({
        uid: auth.currentUser.uid,
        email: userData.email,
        phone: userData.phone,
        businessName: userData.businessName,
        businessId: userData.businessId,
        role: userData.role,
        emailVerified: userData.emailVerified || false,
      });
    }
  };

  const signup = async (email, password, businessName, phone, timezone, hearAboutUs) => {
    console.log('[SIGNUP DEBUG] === SIGNUP START ===');

    // Read referral: prefer the ?ref= URL param, fall back to the pt_ref cookie
    const urlRef = new URLSearchParams(window.location.search).get('ref');
    const refMatch = document.cookie.match(/(?:^|;\s*)pt_ref=([^;]+)/);
    const referralCode = urlRef || (refMatch ? decodeURIComponent(refMatch[1]) : null);
    if (referralCode) {
      console.log('[SIGNUP DEBUG] Referral code found in cookie:', referralCode);
    }
    
    // Create auth account FIRST so we're authenticated for Firestore queries.
    // If the email already has an account, this may be a retry of an unfinished
    // signup — sign in with the same credentials and resume; the server-side
    // business creation is idempotent, so completing the flow again is safe.
    // A wrong password means it isn't their account: surface the original error.
    console.log('[SIGNUP DEBUG] Step 1: createUserWithEmailAndPassword...');
    let cred;
    let isNewAccount = true;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code !== 'auth/email-already-in-use') throw err;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch {
        throw err;
      }
      isNewAccount = false;
      // Resume is ONLY for unfinished signups — a users doc means signup
      // already completed (owner or invited member), and proceeding would
      // overwrite it (and detach a member from their team's business). Those
      // accounts get the original email-already-in-use error instead.
      const priorDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (priorDoc.exists()) {
        await signOut(auth);
        throw err;
      }
      console.log('[SIGNUP DEBUG] Step 1: unfinished signup, resuming as uid:', cred.user.uid);
    }
    const uid = cred.user.uid;
    console.log('[SIGNUP DEBUG] Step 1 OK - uid:', uid, 'auth.currentUser:', auth.currentUser?.uid);

    // Duplicate phone check — server-side callable; the excluded uid comes from the
    // auth token, so it must run after auth creation. If the phone is already in use,
    // surface a clear error so the caller can show it to the user. Only an account
    // created by THIS call is rolled back — a resumed account predates this attempt
    // (and may already own a business), so it must survive. A callable error is NOT
    // treated as "no duplicate": it propagates and aborts signup.
    if (phone) {
      const functions = getFunctions(app);
      const checkDuplicatePhone = httpsCallable(functions, 'checkDuplicatePhone');
      const dupResult = await checkDuplicatePhone({ phone });
      if (dupResult.data.isDuplicate) {
        if (isNewAccount) {
          await cred.user.delete();
        } else {
          await signOut(auth);
        }
        throw new Error('This phone number is already linked to another account.');
      }
    }

    // Server-side business creation: the callable owns trial eligibility and
    // the businesses, fingerprints, and registeredPhones docs. Idempotent — a
    // retry returns the existing business instead of creating a duplicate.
    console.log('[SIGNUP DEBUG] Step 2: createBusinessForSignup...');
    const browserFingerprint = getBrowserFingerprint();
    const ipAddress = await getIpAddress();
    const visitorId = getDeviceId();
    let businessId;
    try {
      const functions = getFunctions(app);
      const createBusinessForSignup = httpsCallable(functions, 'createBusinessForSignup');
      const result = await createBusinessForSignup({
        businessName,
        phone,
        timezone,
        referralCode,
        hearAboutUs,
        browserFingerprint,
        visitorId,
        ipAddress,
      });
      businessId = result.data.businessId;
    } catch (err) {
      // No users doc may point at a business that doesn't exist. The auth
      // account is left in place — retrying signup resumes and completes it.
      console.error('[SIGNUP DEBUG] Step 2 FAILED - createBusinessForSignup:', err.code, err.message);
      throw new Error("We couldn't finish setting up your account. Please try signing up again.");
    }
    console.log('[SIGNUP DEBUG] Step 2 OK - businessId:', businessId);

    // The users doc is now created server-side by createBusinessForSignup
    // (create-if-missing), including referralCode/hearAboutUs — the payload
    // above already carries them. The client no longer writes users/{uid};
    // app state below is built from in-scope values instead.

    // Send verification code email (fingerprints and registeredPhones are now
    // written server-side by createBusinessForSignup)
    console.log('[SIGNUP DEBUG] Step 4: sendVerificationCode...');
    try {
      const functions = getFunctions(app);
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');
      await sendVerificationCode({ email, userId: uid });
    } catch (err) {
      console.error('Failed to send verification code:', err);
    }

    // Reset the inactivity timer so a stale localStorage value from a previous
    // session cannot trigger an immediate logout the moment setUser fires.
    localStorage.setItem('pt_last_activity', Date.now().toString());
    setUser({
      uid,
      email,
      phone,
      businessName,
      businessId,
      role: 'owner',
      emailVerified: false,
    });
  };

  const inviteSignup = async (email, password, phone, invite) => {
    // Collect fingerprint data (no trial eligibility check needed for invite signups)
    const fingerprint = getBrowserFingerprint();
    const ip = await getIpAddress();
    const deviceId = getDeviceId();

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Duplicate phone check — server-side callable (the excluded uid comes from the
    // auth token). Roll back auth if phone already in use. A callable error is NOT
    // treated as "no duplicate": it propagates and aborts signup.
    if (phone) {
      const functions = getFunctions(app);
      const checkDuplicatePhone = httpsCallable(functions, 'checkDuplicatePhone');
      const dupResult = await checkDuplicatePhone({ phone });
      if (dupResult.data.isDuplicate) {
        await cred.user.delete();
        throw new Error('This phone number is already linked to another account.');
      }
    }

    // Server-side fingerprint AND users-doc write. The callable requires the invite
    // to still be 'pending', so it must run BEFORE the status flip below — and the
    // status flip's rule reads users/{uid} (myBusinessId()), so the users doc this
    // callable creates must exist before the flip. It derives email and businessId
    // server-side; only the invite id and fingerprint inputs go up. Idempotent — if
    // it fails here, the invite stays pending and a retry is safe.
    try {
      const functions = getFunctions(app);
      const registerInviteSignup = httpsCallable(functions, 'registerInviteSignup');
      await registerInviteSignup({
        inviteId: invite.id,
        phone,
        browserFingerprint: fingerprint,
        visitorId: deviceId,
        ipAddress: ip,
      });
    } catch (err) {
      console.error('[SIGNUP DEBUG] registerInviteSignup FAILED:', err.code, err.message);
      throw new Error("We couldn't finish setting up your account. Please try again.");
    }

    await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });

    // Send verification code email
    try {
      const functions = getFunctions(app);
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');
      await sendVerificationCode({ email, userId: uid });
    } catch (err) {
      console.error('Failed to send verification code:', err);
    }

    // Reset the inactivity timer so a stale localStorage value from a previous
    // session cannot trigger an immediate logout the moment setUser fires.
    localStorage.setItem('pt_last_activity', Date.now().toString());
    setUser({
      uid,
      email,
      phone,
      businessName: invite.businessName,
      businessId: invite.businessId,
      role: invite.role,
      emailVerified: false,
    });
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Reset the inactivity timestamp on explicit login so ActivityTracker
    // doesn't immediately sign the user out due to a stale timestamp.
    localStorage.setItem('pt_last_activity', Date.now().toString());
    const userData = await fetchUserData(cred.user.uid);
    if (userData) {
      setUser({
        uid: cred.user.uid,
        email: userData.email,
        businessName: userData.businessName,
        businessId: userData.businessId,
        role: userData.role,
        emailVerified: userData.emailVerified || false,
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AUTH DEBUG] onAuthStateChanged fired - uid:', firebaseUser?.uid);
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        console.log('[AUTH DEBUG] fetchUserData result:', userData ? 'found' : 'not found');
        if (userData) {
          setUser({
            uid: firebaseUser.uid,
            email: userData.email,
            businessName: userData.businessName,
            businessId: userData.businessId,
            role: userData.role,
            emailVerified: userData.emailVerified || false,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, inviteSignup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
