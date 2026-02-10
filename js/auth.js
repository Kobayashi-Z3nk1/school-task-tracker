// js/auth.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function isStrongPassword(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
}

/* =========================
   GOOGLE AUTH (Login + Signup)
   ========================= */
const googleProvider = new GoogleAuthProvider();

async function ensureUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // If no profile exists (first time Google sign-in), create one
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "Google User",
      email: user.email || "",
      role: "student",          // default role
      provider: "google",
      createdAt: Date.now()
    });
  }
}

// Google button on Login page
const googleBtn = document.getElementById("googleBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
      window.location.href = "dashboard.html";
    } catch (e) {
      alert(e.message);
    }
  });
}

// Google button on Signup page
const googleSignUpBtn = document.getElementById("googleSignUpBtn");
if (googleSignUpBtn) {
  googleSignUpBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
      window.location.href = "dashboard.html";
    } catch (e) {
      alert(e.message);
    }
  });
}

/* =========================
   EMAIL/PASSWORD SIGNUP
   ========================= */
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password) return alert("All fields are required.");
    if (!isStrongPassword(password)) {
      return alert("Password must be at least 8 characters, include 1 uppercase letter and 1 number.");
    }

    try {
      // Firebase prevents duplicate emails automatically
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Store profile + role in Firestore (cross-device)
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role,
        provider: "password",
        createdAt: Date.now()
      });

      alert("Account created successfully. Please log in.");
      window.location.href = "index.html";
    } catch (e) {
      alert(e.message);
    }
  });
}

/* =========================
   EMAIL/PASSWORD LOGIN
   ========================= */
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return alert("Enter email and password.");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Verify user profile exists
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        return alert("Profile not found. Please contact admin.");
      }

      window.location.href = "dashboard.html";
    } catch (e) {
      alert("Invalid email or password.");
    }
  });
}
