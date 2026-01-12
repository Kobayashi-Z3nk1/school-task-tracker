const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function signup() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!name || !email || !password) {
    alert("All fields are required.");
    return;
  }

  // 🔒 Prevent duplicate emails
  if (localStorage.getItem(email)) {
    alert("Email already exists. Please use another email.");
    return;
  }

  // 🔐 Strong password check
  const strongPassword =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  if (!strongPassword) {
    alert(
      "Password must be at least 8 characters long, include a number and an uppercase letter."
    );
    return;
  }

  const user = { name, email, password, role };

  localStorage.setItem(email, JSON.stringify(user));
  alert("Account created successfully.");
  window.location.href = "index.html";
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const user = JSON.parse(localStorage.getItem(email));

  if (!user || user.password !== password) {
    alert("Invalid email or password.");
    return;
  }

  // Save logged-in user + timestamp
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("lastActivity", Date.now());

  window.location.href = "dashboard.html";
}
