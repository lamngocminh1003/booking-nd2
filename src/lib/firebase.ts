import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAB7b6Wic5zGrTkhrmtIqX0GzzPKNyd6Kw",
  authDomain: "patient-booking-nd2.firebaseapp.com",
  projectId: "patient-booking-nd2",
  storageBucket: "patient-booking-nd2.firebasestorage.app",
  messagingSenderId: "273988104826",
  appId: "1:273988104826:web:034d4fb9c66be1756dc1c3",
  measurementId: "G-ZKHL69WXSB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

// Configure Apple provider
appleProvider.addScope("email");
appleProvider.addScope("name");

export default app;
