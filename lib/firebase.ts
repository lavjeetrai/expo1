import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAP_m2VE9yrQeKSUXLVoLM7XP-PiVwEPF4",
  authDomain: "agent-vinod-6979d.firebaseapp.com",
  projectId: "agent-vinod-6979d",
  storageBucket: "agent-vinod-6979d.firebasestorage.app",
  messagingSenderId: "380176636034",
  appId: "1:380176636034:web:481234d441ec7ef343bc9b",
  measurementId: "G-FSMZFL1DGR"
};

// Initialize Firebase, compatible with SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Optional: force prompt to select account each time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, googleProvider };
