import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuLnhHNDQcaMCblGYqaSRVumbNenWrzTE",
  authDomain: "favifont-2a87b.firebaseapp.com",
  projectId: "favifont-2a87b",
  storageBucket: "favifont-2a87b.firebasestorage.app",
  messagingSenderId: "747549037963",
  appId: "1:747549037963:web:4b9edc56d94ee69e4e4b8e",
  measurementId: "G-4W6J84HSTE"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signInWithGoogleProvider = new GoogleAuthProvider();
