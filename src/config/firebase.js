import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDptnFOEW7ZP68Q5PXachAYKXxCEt-8Kis",
  authDomain: "promise-tracker-mvp.firebaseapp.com",
  projectId: "promise-tracker-mvp",
  storageBucket: "promise-tracker-mvp.firebasestorage.app",
  messagingSenderId: "682807332484",
  appId: "1:682807332484:web:4049f67a2ebf4d40bbfcd1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
