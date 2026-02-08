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
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    // remove active from all tabs
    document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
    // set active on clicked tab
    btn.classList.add("active");
    // show correct section
    showSection(btn.dataset.section);
  });
});

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===== CATEGORY-SPECIFIC RENDERING =====
function esc(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[m]));
}

// Templates per category
function templateTask(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Task</span></div>
      <div class="card-meta">${esc(i.subtitle || "General")}</div>
      <div class="card-body">${esc(i.body)}</div>
    </div>
  `;
}

function templateAnnouncement(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Announcement</span></div>
      <div class="card-body">${esc(i.body)}</div>
    </div>
  `;
}

function templateProject(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Project</span></div>
      <div class="card-body">${esc(i.body)}</div>
    </div>
  `;
}

function templateQuiz(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Quiz</span></div>
      <div class="card-body">${esc(i.body)}</div>
    </div>
  `;
}

function templateResource(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Resource</span></div>
      <div class="card-body">${esc(i.body)}</div>
      ${i.link ? `<a class="btn-link" href="${esc(i.link)}" target="_blank">Open Resource</a>` : ""}
    </div>
  `;
}

function renderItems(container, items, type) {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<div class="card"><div class="card-body">No items yet.</div></div>`;
    return;
  }

  const map = {
    tasks: templateTask,
    announcements: templateAnnouncement,
    projects: templateProject,
    quizzes: templateQuiz,
    resources: templateResource
  };

  container.innerHTML = items.map(map[type]).join("");
}

function bindFeed(type) {
  const container = document.getElementById(`${type}List`);
  const q = query(collection(db, type), orderBy("createdAt", "desc"));

  onSnapshot(q, snap => {
    const items = snap.docs.map(d => d.data());
    renderItems(container, items, type);
  });
}

// Bind all feeds
bindFeed("tasks");
bindFeed("announcements");
bindFeed("projects");
bindFeed("quizzes");
bindFeed("resources");

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
    const linkEl = document.getElementById("postLink");
    const link = linkEl ? linkEl.value.trim() : "";

    if (!title || !body) return alert("Title and details are required.");

    if (type === "resources") {
      if (!link || !/^https?:\/\//i.test(link)) {
        return alert("Resources must include a valid link starting with http:// or https://");
    }
  }

      await addDoc(collection(db, type), {
    title,
    subtitle,
    body,
    link: type === "resources" ? link : "",
    createdAt: Date.now(),
    postedBy: profile.email
  });

    document.getElementById("postTitle").value = "";
    document.getElementById("postSubtitle").value = "";
    document.getElementById("postBody").value = "";

    alert("Published successfully.");
  });
});

// Default active on load
showSection("tasks");
