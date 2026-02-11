// js/dashboard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   1) INACTIVITY LOGOUT
   ========================= */
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
    try { await signOut(auth); } catch (e) {}
    window.location.href = "index.html";
  }
}, 15 * 1000);

/* =========================
   2) TABS (DASHBOARD)
   ========================= */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showSection(btn.dataset.section);
  });
});

// Default tab
showSection("tasks");

/* =========================
   3) LOGOUT BUTTON
   ========================= */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

/* =========================
   4) UPLOADCARE ATTACHMENT
   (Projects / Quizzes / Resources)
   ========================= */
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const postAttachmentUrlEl = document.getElementById("postAttachmentUrl");

// Stores latest uploaded URL
let uploadedAttachmentUrl = "";

function setUploadStatus(msg) {
  if (uploadStatus) uploadStatus.textContent = msg || "";
}

if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    if (typeof uploadcare === "undefined") {
      alert("Uploadcare is not loaded. Check your Uploadcare script + PUBLIC KEY in dashboard.html.");
      return;
    }

    setUploadStatus("Opening uploader...");

    const dialog = uploadcare.openDialog(null, {
      multiple: false,
      imagesOnly: false
    });

    dialog.done((file) => {
      setUploadStatus("Uploading...");
      file.promise()
        .then((info) => {
          uploadedAttachmentUrl = info.cdnUrl; // ✅ public URL
          if (postAttachmentUrlEl) postAttachmentUrlEl.value = uploadedAttachmentUrl;
          setUploadStatus(`Attached: ${info.name}`);
        })
        .catch(() => setUploadStatus("Upload failed. Try again."));
    });
  });
}

/* =========================
   5) CATEGORY-SPECIFIC UI
   ========================= */
function esc(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[m]));
}

// Download/Open attachment button
function attachmentButtons(i) {
  if (!i.attachmentUrl) return "";

  // NOTE: "download" may not force download for every file type (browser-dependent),
  // but it will still allow students to open + download from the new tab.
  return `
    <div class="card-actions">
      <a class="btn-link" href="${esc(i.attachmentUrl)}" target="_blank" rel="noopener noreferrer">Open File</a>
      <a class="btn-link" href="${esc(i.attachmentUrl)}" download>Download</a>
    </div>
  `;
}

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
      <div class="card-meta">${esc(i.subtitle || "Update")}</div>
      <div class="card-body">${esc(i.body)}</div>
    </div>
  `;
}

function templateProject(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Project</span></div>
      <div class="card-meta">${esc(i.subtitle || "Project")}</div>
      <div class="card-body">${esc(i.body)}</div>
      ${attachmentButtons(i)}
    </div>
  `;
}

function templateQuiz(i) {
  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Quiz</span></div>
      <div class="card-meta">${esc(i.subtitle || "Assessment")}</div>
      <div class="card-body">${esc(i.body)}</div>
      ${attachmentButtons(i)}
    </div>
  `;
}

function templateResource(i) {
  const linkBtn = i.link
    ? `<a class="btn-link" href="${esc(i.link)}" target="_blank" rel="noopener noreferrer">Open Link</a>`
    : "";

  const fileBtns = i.attachmentUrl
    ? `
      <a class="btn-link" href="${esc(i.attachmentUrl)}" target="_blank" rel="noopener noreferrer">Open File</a>
      <a class="btn-link" href="${esc(i.attachmentUrl)}" download>Download</a>
    `
    : "";

  const actions = (linkBtn || fileBtns)
    ? `<div class="card-actions">${linkBtn}${fileBtns}</div>`
    : "";

  return `
    <div class="card">
      <div class="card-title">${esc(i.title)} <span class="badge">Resource</span></div>
      <div class="card-meta">${esc(i.subtitle || "Material")}</div>
      <div class="card-body">${esc(i.body)}</div>
      ${actions}
    </div>
  `;
}

function renderItems(container, items, type) {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<div class="card"><div class="card-body" style="opacity:.8;">No items yet.</div></div>`;
    return;
  }

  const map = {
    tasks: templateTask,
    announcements: templateAnnouncement,
    projects: templateProject,
    quizzes: templateQuiz,
    resources: templateResource
  };

  const tpl = map[type] || templateAnnouncement;
  container.innerHTML = items.map(tpl).join("");
}

/* =========================
   6) LIVE FEEDS (FIRESTORE)
   ========================= */
function bindFeed(type) {
  const container = document.getElementById(`${type}List`);
  const q = query(collection(db, type), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => d.data());
    renderItems(container, items, type);
  });
}

bindFeed("tasks");
bindFeed("announcements");
bindFeed("projects");
bindFeed("quizzes");
bindFeed("resources");

/* =========================
   7) AUTH GATE + ROLE + PUBLISH
   ========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
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

  const welcome = document.getElementById("welcome");
  if (welcome) welcome.textContent = `Welcome, ${profile.name} (${profile.role})`;

  const roleNote = document.getElementById("roleNote");
  if (roleNote) {
    roleNote.innerHTML = `<p style="color:#b3b3b3;margin:0;">Role-based access is enabled. Professors can publish content. Students can view content.</p>`;
  }

  // Show professor tools
  const profCreate = document.getElementById("profCreate");
  if (profCreate && profile.role === "professor") profCreate.style.display = "block";

  // Publish button
  const postBtn = document.getElementById("postBtn");
  if (!postBtn) return;

  postBtn.addEventListener("click", async () => {
    if (profile.role !== "professor") return alert("Access denied.");

    const type = document.getElementById("postType")?.value || "tasks";
    const title = document.getElementById("postTitle")?.value.trim() || "";
    const subtitle = document.getElementById("postSubtitle")?.value.trim() || "";
    const body = document.getElementById("postBody")?.value.trim() || "";

    const linkEl = document.getElementById("postLink");
    const link = linkEl ? linkEl.value.trim() : "";

    if (!title || !body) return alert("Title and details are required.");

    // Link validation (only when provided)
    if (type === "resources" && link && !/^https?:\/\//i.test(link)) {
      return alert("Resource link must start with http:// or https://");
    }

    const allowAttachment = ["projects", "quizzes", "resources"].includes(type);

    // ✅ Use whichever has the URL (variable OR hidden input)
    const attachmentUrl = allowAttachment
      ? (uploadedAttachmentUrl || (postAttachmentUrlEl ? postAttachmentUrlEl.value.trim() : ""))
      : "";

    // Resources must have either link OR attachment
    if (type === "resources" && !link && !attachmentUrl) {
      return alert("Resources must include either a link OR an uploaded file.");
    }

    await addDoc(collection(db, type), {
      title,
      subtitle,
      body,
      link: type === "resources" ? (link || "") : "",
      attachmentUrl: attachmentUrl || "",
      createdAt: Date.now(),
      postedBy: profile.email
    });

    // Clear form
    const t = document.getElementById("postTitle");
    const s = document.getElementById("postSubtitle");
    const b = document.getElementById("postBody");
    if (t) t.value = "";
    if (s) s.value = "";
    if (b) b.value = "";
    if (linkEl) linkEl.value = "";

    // Clear upload state
    uploadedAttachmentUrl = "";
    if (postAttachmentUrlEl) postAttachmentUrlEl.value = "";
    setUploadStatus("");

    alert("Published successfully.");
  });
});

/* =========================
   8) NEWS SIDEBAR TABS (SYNC LEFT + RIGHT)
   Requires:
   LEFT:  fb-page1, fb-page2, fb-page3
   RIGHT: fbR-page1, fbR-page2, fbR-page3
   ========================= */
function setNews(pageKey) {
  // Buttons (left + right)
  document.querySelectorAll(".news-left .newsTab").forEach(b => {
    b.classList.toggle("active", b.dataset.page === pageKey);
  });
  document.querySelectorAll(".news-right .newsTab").forEach(b => {
    b.classList.toggle("active", b.dataset.page === pageKey);
  });

  // Panels (left)
  document.querySelectorAll(".news-left .fbWrap").forEach(w => w.classList.remove("active"));
  const leftPanel = document.getElementById(`fb-${pageKey}`);
  if (leftPanel) leftPanel.classList.add("active");

  // Panels (right)
  document.querySelectorAll(".news-right .fbWrap").forEach(w => w.classList.remove("active"));
  const rightPanel = document.getElementById(`fbR-${pageKey}`);
  if (rightPanel) rightPanel.classList.add("active");

  // Re-render FB plugin after switching
  if (window.FB && window.FB.XFBML) {
    window.FB.XFBML.parse(document.querySelector(".news-left"));
    window.FB.XFBML.parse(document.querySelector(".news-right"));
  }
}

// Click on any newsTab (either column)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".newsTab");
  if (!btn) return;
  setNews(btn.dataset.page);
});

// Default: STEM
setNews("page1");
