// js/dashboard.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⏳ inactivity logout
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
let lastActivity = Date.now();

function touch() {
  lastActivity = Date.now();
}
document.addEventListener("click", touch);
document.addEventListener("keydown", touch);

setInterval(async () => {
  if (auth.currentUser && Date.now() - lastActivity > SESSION_TIMEOUT) {
    alert("Session expired due to inactivity. Please log in again.");
    await signOut(auth);
    window.location.href = "index.html";
  }
}, 15 * 1000);

// Tabs
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => showSection(btn.dataset.section));
});

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Render helpers
function renderList(listEl, items) {
  listEl.innerHTML = "";
  items.forEach(i => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${i.title}</strong>${i.subtitle ? ` <span style="color:#b3b3b3">(${i.subtitle})</span>` : ""}<br><span style="color:#cfcfcf">${i.body}</span>`;
    listEl.appendChild(li);
  });
}

// Live feeds from Firestore
function bindFeed(type) {
  const listEl = document.getElementById(`${type}List`);
  const q = query(collection(db, type), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => d.data());
    renderList(listEl, items);
  });
}

bindFeed("tasks");
bindFeed("announcements");
bindFeed("projects");
bindFeed("quizzes");

// Auth gate + role load
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // 🔒 Lock dashboard if not logged in
    window.location.href = "index.html";
    return;
  }

  const profileSnap = await getDoc(doc(db, "users", user.uid));
  if (!profileSnap.exists()) {
    alert("Profile missing.");
    await signOut(auth);
    window.location.href = "index.html";
    return;
  }

  const profile = profileSnap.data();
  document.getElementById("welcome").textContent = `Welcome, ${profile.name} (${profile.role})`;

  const roleNote = document.getElementById("roleNote");
  roleNote.innerHTML = `<p style="color:#b3b3b3;margin:0;">Role-based access is enabled. Professors can publish content. Students can view content.</p>`;

  // Show professor tools
  const profCreate = document.getElementById("profCreate");
  if (profile.role === "professor") profCreate.style.display = "block";

  // Professor publish
  const postBtn = document.getElementById("postBtn");
  postBtn.addEventListener("click", async () => {
    if (profile.role !== "professor") return alert("Access denied.");

    const type = document.getElementById("postType").value;
    const title = document.getElementById("postTitle").value.trim();
    const subtitle = document.getElementById("postSubtitle").value.trim();
    const body = document.getElementById("postBody").value.trim();

    if (!title || !body) return alert("Title and details are required.");

    await addDoc(collection(db, type), {
      title,
      subtitle,
      body,
      createdAt: Date.now(),
      postedBy: profile.email
    });

    document.getElementById("postTitle").value = "";
    document.getElementById("postSubtitle").value = "";
    document.getElementById("postBody").value = "";

    alert("Published successfully.");
  });
});
