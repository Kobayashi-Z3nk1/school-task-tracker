const taskList = document.getElementById("taskList");

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const task = taskInput.value.trim();

    if (!task) return;

    const li = document.createElement("li");
    li.textContent = task;

    li.onclick = () => {
        li.style.textDecoration = "line-through";
        li.style.color = "#777";
    };

    taskList.appendChild(li);
    taskInput.value = "";
}
