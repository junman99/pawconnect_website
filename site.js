// PawConnect website. No dependencies. Everything here is an enhancement: the page works without it.
(function () {
  "use strict";

  // 1. The creator's video: the file has 1.8 s of silence at the start and 1.5 s at the end. The captions are timed to the whole file, so the file
  // is not cut: the player starts at 1.6 s (just before the first word at 1.79 s) and stops at 48.3 s (after the last caption ends at 47.95 s).
  var intro = document.getElementById("intro");
  if (intro) {
    var START = 1.6, END = 48.3;
    intro.addEventListener("play", function () {
      if (intro.currentTime < START) intro.currentTime = START;
    });
    intro.addEventListener("timeupdate", function () {
      if (intro.currentTime >= END && !intro.paused) { intro.pause(); }
    });
  }

  // 2. The Zoomies: muted clips, loaded only when they come near the screen, paused when they leave it, and never started for people who ask
  // their device for less motion (they get the first frame and can press play with the button).
  var box = document.getElementById("zoomies");
  var pauseButton = document.getElementById("zoomiePause");
  if (box) {
    var clips = Array.prototype.slice.call(box.querySelectorAll("video"));
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var userPaused = reduce;
    function label() {
      if (!pauseButton) return;
      pauseButton.textContent = userPaused ? "Play the videos" : "Pause the videos";
      pauseButton.setAttribute("aria-pressed", userPaused ? "true" : "false");
    }
    function load(video) {
      if (!video.getAttribute("src") && video.dataset.src) video.setAttribute("src", video.dataset.src);
    }
    function sync(video, visible) {
      if (visible && !userPaused) { load(video); var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    }
    var visibility = new Map();
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visibility.set(e.target, e.isIntersecting); sync(e.target, e.isIntersecting); });
      }, { rootMargin: "120px", threshold: 0.2 });
      clips.forEach(function (v) { io.observe(v); });
    }
    if (pauseButton) {
      pauseButton.addEventListener("click", function () {
        userPaused = !userPaused;
        label();
        clips.forEach(function (v) { sync(v, userPaused ? false : (visibility.get(v) !== false)); });
      });
      label();
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clips.forEach(function (v) { v.pause(); });
      else clips.forEach(function (v) { sync(v, visibility.get(v) === true); });
    });
  }
})();
