<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Dashboard | School Portal</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="background-layer"></div>

  <div class="container">
    <img src="images/logo.png" alt="School Logo" class="logo">
    <h1 id="welcome">Dashboard</h1>

    <div class="dashboard-tabs">
      <button class="tabBtn" data-section="tasks">Tasks</button>
      <button class="tabBtn" data-section="announcements">Announcements</button>
      <button class="tabBtn" data-section="projects">Projects</button>
      <button class="tabBtn" data-section="quizzes">Quizzes</button>
    </div>

    <div class="panel" id="roleNote"></div>

    <!-- PROFESSOR CREATE PANEL (shown only to professors) -->
    <div class="panel" id="profCreate" style="display:none;">
      <h2>Professor Tools</h2>

      <label>Post to:</label>
      <select id="postType">
        <option value="tasks">Tasks</option>
        <option value="announcements">Announcements</option>
        <option value="projects">Projects</option>
        <option value="quizzes">Quizzes</option>
      </select>

      <input type="text" id="postTitle" placeholder="Title" />
      <input type="text" id="postSubtitle" placeholder="Subject/Class (optional)" />
      <textarea id="postBody" placeholder="Details / Instructions" rows="4" style="width:100%;margin-top:10px;border-radius:6px;padding:10px;border:none;"></textarea>

      <button id="postBtn">Publish</button>
    </div>

    <!-- CONTENT SECTIONS -->
    <div class="panel section active" id="tasks">
      <h2>Tasks</h2>
      <ul id="tasksList" class="list"></ul>
    </div>

    <div class="panel section" id="announcements">
      <h2>Announcements</h2>
      <ul id="announcementsList" class="list"></ul>
    </div>

    <div class="panel section" id="projects">
      <h2>Projects</h2>
      <ul id="projectsList" class="list"></ul>
    </div>

    <div class="panel section" id="quizzes">
      <h2>Quizzes</h2>
      <ul id="quizzesList" class="list"></ul>
    </div>

    <button id="logoutBtn">Logout</button>
  </div>

  <script type="module" src="js/dashboard.js"></script>
</body>
</html>
