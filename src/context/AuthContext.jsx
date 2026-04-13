import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
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

  /**
   * Run anti-abuse fingerprint checks BEFORE creating the Firebase Auth account.
   * Never blocks account creation — only determines free-trial eligibility.
   */
  const runAbuseChecks = async (phone) => {
    const fingerprint = getBrowserFingerprint();
    const ip = await getIpAddress();
    const deviceId = getDeviceId();
    let eligibleForTrial = true;

    // Check if phone was used by an account that had a trial
    const phoneSnap = await getDocs(
      query(collection(db, 'fingerprints'), where('phone', '==', phone))
    );
    if (phoneSnap.docs.some((d) => d.data().trialUsed === true)) {
      eligibleForTrial = false;
    }

    // Check browser fingerprint
    if (eligibleForTrial) {
      const fpSnap = await getDocs(
        query(collection(db, 'fingerprints'), where('browserFingerprint', '==', fingerprint))
      );
      if (fpSnap.docs.some((d) => d.data().trialUsed === true)) {
        eligibleForTrial = false;
      }
    }

    // Check IP address
    if (eligibleForTrial && ip) {
      const ipSnap = await getDocs(
        query(collection(db, 'fingerprints'), where('ipAddress', '==', ip))
      );
      if (ipSnap.docs.some((d) => d.data().trialUsed === true)) {
        eligibleForTrial = false;
      }
    }

    // Check device ID
    if (eligibleForTrial) {
      const deviceSnap = await getDocs(
        query(collection(db, 'fingerprints'), where('visitorId', '==', deviceId))
      );
      if (deviceSnap.docs.some((d) => d.data().trialUsed === true)) {
        eligibleForTrial = false;
      }
    }

    return { canCreateAccount: true, eligibleForTrial, fingerprint, ip, deviceId };
  };

  /**
   * Store fingerprint data and register the phone number after successful signup.
   */
  const storeFingerprint = async ({ fingerprint, ip, deviceId, phone, email, userId, businessId, trialUsed }) => {
    await addDoc(collection(db, 'fingerprints'), {
      visitorId: deviceId,
      browserFingerprint: fingerprint,
      ipAddress: ip,
      phone,
      email,
      userId,
      businessId,
      trialUsed,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'registeredPhones'), {
      phone,
      userId,
      createdAt: serverTimestamp(),
    });
  };

  const signup = async (email, password, businessName, phone, timezone) => {
    const { eligibleForTrial, fingerprint, ip, deviceId } = await runAbuseChecks(phone);

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Create the business doc — trial or trial_expired based on eligibility
    const businessData = {
      name: businessName,
      ownerId: uid,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      timezone: timezone || 'America/New_York',
      createdAt: serverTimestamp(),
    };

    if (eligibleForTrial) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 21);
      businessData.plan = 'trial';
      businessData.trialStartDate = serverTimestamp();
      businessData.trialEndDate = Timestamp.fromDate(trialEnd);
    } else {
      businessData.plan = 'trial_expired';
      businessData.trialStartDate = null;
      businessData.trialEndDate = null;
    }

    const businessRef = await addDoc(collection(db, 'businesses'), businessData);

    // Create the user doc with businessId
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      phone,
      businessName,
      businessId: businessRef.id,
      role: 'owner',
      createdAt: serverTimestamp(),
    });

    // Store fingerprint data
    await storeFingerprint({
      fingerprint, ip, deviceId, phone, email,
      userId: uid, businessId: businessRef.id,
      trialUsed: eligibleForTrial,
    });

    // Send verification code email
    try {
      const functions = getFunctions(app);
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');
      await sendVerificationCode({ email, userId: uid });
    } catch (err) {
      console.error('Failed to send verification code:', err);
    }

    setUser({
      uid,
      email,
      phone,
      businessName,
      businessId: businessRef.id,
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

    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      phone,
      businessName: invite.businessName,
      businessId: invite.businessId,
      role: invite.role,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });

    // Store fingerprint data (trialUsed false — invited user doesn't consume a trial)
    await storeFingerprint({
      fingerprint, ip, deviceId, phone, email,
      userId: uid, businessId: invite.businessId,
      trialUsed: false,
    });

    // Send verification code email
    try {
      const functions = getFunctions(app);
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');
      await sendVerificationCode({ email, userId: uid });
    } catch (err) {
      console.error('Failed to send verification code:', err);
    }

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
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
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
    <AuthContext.Provider value={{ user, login, signup, inviteSignup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
