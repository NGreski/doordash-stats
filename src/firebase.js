// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- Add this
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBJfaASu6i_ERxiEvg8LrvgEvgW8_hhZug",
    authDomain: "doordash-stats.firebaseapp.com",
    projectId: "doordash-stats",
    storageBucket: "doordash-stats.firebasestorage.app",
    messagingSenderId: "1039029778487",
    appId: "1:1039029778487:web:a370016c3a0632d11927b2",
    measurementId: "G-ZQPS5V4MGV"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // <-- Firestore DB instance

export { db };

