import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVIKrHFHLEAR-km4zaFmBAbtLDT4sAnXE",
  authDomain: "sahaayak-938a3.firebaseapp.com",
  projectId: "sahaayak-938a3",
  storageBucket: "sahaayak-938a3.firebasestorage.app",
  messagingSenderId: "747548710034",
  appId: "1:747548710034:web:4b6b88543b3451bea8c24b",
  measurementId: "G-L7V9L7K4BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, auth, firestore };
