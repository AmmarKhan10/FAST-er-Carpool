import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1qZxV24HJTnayKPolbfMVeOWKOW5Qoj8",
  authDomain: "fast-er-carpool.firebaseapp.com",
  projectId: "fast-er-carpool",
  storageBucket: "fast-er-carpool.appspot.com",
  messagingSenderId: "744987299958",
  appId: "1:744987299958:web:44000b3b36954eca460f57",
  measurementId: "G-27GSQ0Z5DQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);