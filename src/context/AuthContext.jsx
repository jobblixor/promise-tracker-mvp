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
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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

  const signup = async (email, password, businessName, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Create the business doc
    const businessRef = await addDoc(collection(db, 'businesses'), {
      name: businessName,
      ownerId: uid,
      plan: 'free',
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
