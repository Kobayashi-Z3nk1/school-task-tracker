// js/news.js

function showFeed(pageKey) {
  // hide all facebook panels in the LEFT sidebar
  document.querySelectorAll(".news-left .fbWrap").forEach(w => w.classList.remove("active"));

  // show the selected one
  const target = document.getElementById(`fb-${pageKey}`);
  if (target) target.classList.add("active");

  // re-render FB plugin when switching (important)
  if (window.FB && window.FB.XFBML) {
    window.FB.XFBML.parse(target || document.querySelector(".news-left"));
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".news-left .newsTab");
  if (!btn) return;

  // highlight the active button
  document.querySelectorAll(".news-left .newsTab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // switch feed
  showFeed(btn.dataset.page);
});

// default feed
showFeed("page1");
