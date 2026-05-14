import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkS2POqtexOXPmA3ZpMZRk5sh80igJbbc",
  authDomain: "xapbanhang.firebaseapp.com",
  projectId: "xapbanhang",
  storageBucket: "xapbanhang.firebasestorage.app",
  messagingSenderId: "558519536591",
  appId: "1:558519536591:web:37c93e7826bfc2a4a9e0ba",
  measurementId: "G-QF9V3LF59M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
