// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Your Firebase Web App config (from your screenshot)
const firebaseConfig = {
  apiKey: "AIzaSyAjXo3Zx8P0ZQexAnmgEghI7Q9D5wy1IpQ",
  authDomain: "school-based-task-tracker.firebaseapp.com",
  projectId: "school-based-task-tracker",
  storageBucket: "school-based-task-tracker.firebasestorage.app",
  messagingSenderId: "940703711004",
  appId: "1:940703711004:web:80082005103547740104d9",
  measurementId: "G-MXXREFFY59"
};

// Initialize
const app = initializeApp(firebaseConfig);

// Export Auth + Firestore for other files to use
export const auth = getAuth(app);
export const db = getFirestore(app);
