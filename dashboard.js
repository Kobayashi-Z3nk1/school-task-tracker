const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const user = JSON.parse(localStorage.getItem("currentUser"));
const lastActivity = localStorage.getItem("lastActivity");

// 🚫 Block access if not logged in
if (!user || !lastActivity) {
  window.location.href = "index.html";
}

// ⏳ Auto logout if inactive
if (Date.now() - lastActivity > SESSION_TIMEOUT) {
  alert("Session expired. Please log in again.");
  logout();
}

document.getElementById("welcome").textContent =
  `Welcome, ${user.name} (${user.role})`;

const professorPanel = document.getElementById("professorPanel");
const studentPanel = document.getElementById("studentPanel");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Role-based UI
if (user.role === "professor") {
  studentPanel.style.display = "none";
  renderProfessorTasks();
} else {
  professorPanel.style.display = "none";
  renderStudentTasks();
}

// Update activity timestamp
document.addEventListener("click", updateActivity);
document.addEventListener("keydown", updateActivity);

function updateActivity() {
  localStorage.setItem("lastActivity", Date.now());
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const task = taskInput.value.trim();
  if (!task) return;

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskInput.value = "";
  renderProfessorTasks();
}

function renderProfessorTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });
}

function renderStudentTasks() {
  const list = document.getElementById("studentTasks");
  list.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("lastActivity");
  window.location.href = "index.html";
}
