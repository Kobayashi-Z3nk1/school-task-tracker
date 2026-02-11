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

/* =========================
   PASSWORD VALIDATION
   ========================= */
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

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "Google User",
      email: user.email || "",
      role: "student",
      provider: "google",
      createdAt: Date.now()
    });
  }
}

// Google Login button
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

// Google Signup button
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
   (Press Enter works)
   ========================= */
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent page reload

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password) {
      alert("All fields are required.");
      return;
    }

    if (!isStrongPassword(password)) {
      alert("Password must be at least 8 characters, include 1 uppercase letter and 1 number.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

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
   (Press Enter works)
   ========================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent refresh

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Enter email and password.");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        alert("Profile not found. Please contact admin.");
        return;
      }

      window.location.href = "dashboard.html";

    } catch (e) {
      alert("Invalid email or password.");
    }
  });
}
