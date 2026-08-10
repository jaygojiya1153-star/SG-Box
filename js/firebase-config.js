// =========================================================
// FIREBASE CONFIG
// 1. Go to https://console.firebase.google.com → Create Project (free)
// 2. Add a Web App → copy the config object it gives you
// 3. Paste your real values below, replacing the placeholders
// 4. Enable "Firestore Database" (start in production mode) in the console
// 5. Enable "Authentication" → Sign-in method → Email/Password
// Full steps are in README.md
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ---- Business settings used across the site ----
export const BUSINESS = {
  name: "SG92 Box Cricket Arena",
  whatsappNumber: "919999999999", // country code + number, no + or spaces
  defaultWhatsappMessage: "Hi! I'd like to check slot availability at SG92 Box Cricket Arena."
};

export function waLink(message) {
  const text = encodeURIComponent(message || BUSINESS.defaultWhatsappMessage);
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${text}`;
}
