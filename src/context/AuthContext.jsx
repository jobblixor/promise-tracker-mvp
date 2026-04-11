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
import { auth, db } from '../config/firebase';
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

  /**
   * Run anti-abuse fingerprint checks BEFORE creating the Firebase Auth account.
   * Throws with a user-facing message if any check fails.
   */
  const runAbuseChecks = async (phone) => {
    // 1. Phone number check
    const phoneSnap = await getDocs(
      query(collection(db, 'registeredPhones'), where('phone', '==', phone))
    );
    if (!phoneSnap.empty) {
      throw new Error('This phone number is already associated with an account');
    }

    // 2. Browser fingerprint check
    const fingerprint = getBrowserFingerprint();
    const fpSnap = await getDocs(
      query(collection(db, 'fingerprints'), where('browserFingerprint', '==', fingerprint))
    );
    if (!fpSnap.empty) {
      throw new Error('Unable to create account. Please contact support@promisetracker.app');
    }

    // 3. IP address check (allow up to 3)
    const ip = await getIpAddress();
    if (ip) {
      const ipSnap = await getDocs(
        query(collection(db, 'fingerprints'), where('ipAddress', '==', ip))
      );
      if (ipSnap.size >= 3) {
        throw new Error('Unable to create account. Please contact support@promisetracker.app');
      }
    }

    // 4. Device ID check
    const deviceId = getDeviceId();
    const deviceSnap = await getDocs(
      query(collection(db, 'fingerprints'), where('visitorId', '==', deviceId))
    );
    if (!deviceSnap.empty) {
      // Check if the existing account's trial has expired
      for (const d of deviceSnap.docs) {
        const data = d.data();
        if (data.businessId) {
          const bizDoc = await getDoc(doc(db, 'businesses', data.businessId));
          if (bizDoc.exists()) {
            const biz = bizDoc.data();
            const isPro = biz.plan === 'pro';
            const trialActive = biz.plan === 'trial' && biz.trialEndDate?.toDate() > new Date();
            if (!isPro && !trialActive) {
              throw new Error('Unable to create account. Please contact support@promisetracker.app');
            }
          }
        }
      }
    }

    return { fingerprint, ip, deviceId };
  };

  /**
   * Store fingerprint data and register the phone number after successful signup.
   */
  const storeFingerprint = async ({ fingerprint, ip, deviceId, phone, email, userId, businessId }) => {
    await addDoc(collection(db, 'fingerprints'), {
      visitorId: deviceId,
      browserFingerprint: fingerprint,
      ipAddress: ip,
      phone,
      email,
      userId,
      businessId,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'registeredPhones'), {
      phone,
      userId,
      createdAt: serverTimestamp(),
    });
  };

  const signup = async (email, password, businessName, phone) => {
    // Run abuse checks BEFORE creating the auth account
    const { fingerprint, ip, deviceId } = await runAbuseChecks(phone);

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Create the business doc with trial fields
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 21);

    const businessRef = await addDoc(collection(db, 'businesses'), {
      name: businessName,
      ownerId: uid,
      plan: 'trial',
      trialStartDate: serverTimestamp(),
      trialEndDate: Timestamp.fromDate(trialEnd),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: serverTimestamp(),
    });

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
    await storeFingerprint({ fingerprint, ip, deviceId, phone, email, userId: uid, businessId: businessRef.id });

    setUser({
      uid,
      email,
      phone,
      businessName,
      businessId: businessRef.id,
      role: 'owner',
    });
  };

  const inviteSignup = async (email, password, phone, invite) => {
    // Run abuse checks BEFORE creating the auth account
    const { fingerprint, ip, deviceId } = await runAbuseChecks(phone);

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

    // Store fingerprint data
    await storeFingerprint({ fingerprint, ip, deviceId, phone, email, userId: uid, businessId: invite.businessId });

    setUser({
      uid,
      email,
      phone,
      businessName: invite.businessName,
      businessId: invite.businessId,
      role: invite.role,
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
    <AuthContext.Provider value={{ user, login, signup, inviteSignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
