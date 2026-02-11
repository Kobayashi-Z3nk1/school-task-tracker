// js/news.js

function setActiveButtons(pageKey) {
  // Left
  document.querySelectorAll(".news-left .newsTab").forEach(b => {
    b.classList.toggle("active", b.dataset.page === pageKey);
  });
  // Right
  document.querySelectorAll(".news-right .newsTab").forEach(b => {
    b.classList.toggle("active", b.dataset.page === pageKey);
  });
}

function showFeeds(pageKey) {
  // Left panels
  document.querySelectorAll(".news-left .fbWrap").forEach(w => w.classList.remove("active"));
  const leftTarget = document.getElementById(`fb-${pageKey}`);
  if (leftTarget) leftTarget.classList.add("active");

  // Right panels
  document.querySelectorAll(".news-right .fbWrap").forEach(w => w.classList.remove("active"));
  const rightTarget = document.getElementById(`fbR-${pageKey}`);
  if (rightTarget) rightTarget.classList.add("active");

  // Re-render FB embeds (important)
  if (window.FB && window.FB.XFBML) {
    window.FB.XFBML.parse(document.querySelector(".news-left"));
    window.FB.XFBML.parse(document.querySelector(".news-right"));
  }
}

function switchNews(pageKey) {
  setActiveButtons(pageKey);
  showFeeds(pageKey);
}

// Handle clicks on either left OR right buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".newsTab");
  if (!btn) return;
  switchNews(btn.dataset.page);
});

// Default
switchNews("page1");
