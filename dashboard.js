const user = JSON.parse(localStorage.getItem("currentUser"));
document.getElementById("welcome").textContent =
  `Welcome, ${user.name} (${user.role})`;

const professorPanel = document.getElementById("professorPanel");
const studentPanel = document.getElementById("studentPanel");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

if (user.role === "professor") {
  studentPanel.style.display = "none";
  renderTasks();
} else {
  professorPanel.style.display = "none";
  renderStudentTasks();
}

function addTask() {
  const task = document.getElementById("taskInput").value;
  if (!task) return;

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
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
  window.location.href = "index.html";
}

