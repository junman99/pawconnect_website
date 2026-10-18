// PawConnect website. No dependencies. Everything here is an enhancement: with scripts off, every section still reads and every picture shows.
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOff = reduce;           // the visitor's device asks for less motion, or they pressed "Pause motion"
  var lang = (doc.lang || "en").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  var say = { pause: { en: "Pause motion", zh: "暂停动画" }, play: { en: "Play motion", zh: "恢复动画" }, on: { en: "Captions on", zh: "字幕：开" }, off: { en: "Captions off", zh: "字幕：关" } };

  // ---- language: remember an explicit choice (the first-visit choice is made by a tiny script in the head) ----
  Array.prototype.forEach.call(document.querySelectorAll("a[data-lang]"), function (a) {
    a.addEventListener("click", function () { try { localStorage.setItem("pc-lang", a.getAttribute("data-lang")); } catch (e) {} });
  });

  // ---- header gets a line once the page has moved ----
  var header = document.querySelector(".site-header");
  if (header) { var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); }; onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); }

  // ---- reveals: CSS scroll-driven animation where the browser has it, an observer where it does not ----
  var cssTimeline = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!reduce && !cssTimeline && "IntersectionObserver" in window && reveals.length) {
    doc.classList.add("js-reveal");
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { rio.observe(el); });
  }

  // ---- muted screen recordings: loaded when near, played only while on screen and active ----
  function loadVideo(v) { if (!v.getAttribute("src") && v.getAttribute("data-src")) v.setAttribute("src", v.getAttribute("data-src")); }
  function playVideo(v) {
    if (motionOff) return;
    loadVideo(v);
    var p = v.play(); if (p && p.then) p.then(function () { v.classList.add("playing"); }, function () {});
  }
  function stopVideo(v) { v.pause(); }
  var clips = Array.prototype.slice.call(document.querySelectorAll("video[data-src]"));
  clips.forEach(function (v) { v.addEventListener("playing", function () { v.classList.add("playing"); }); });
  if ("IntersectionObserver" in window) {
    var near = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting && pageLoaded && !e.target.closest(".hero")) loadVideo(e.target); }); }, { rootMargin: "100% 0px" });
    clips.forEach(function (v) { near.observe(v); });
  }

  // hero clip plays while the hero is on screen
  var heroClip = document.querySelector(".hero video[data-src]");
  var pageLoaded = document.readyState === "complete";
  window.addEventListener("load", function () { setTimeout(function () { pageLoaded = true; if (heroClip && heroVisible) playVideo(heroClip); }, 1200); });
  var heroVisible = false;
  if (heroClip && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { entries.forEach(function (e) { heroVisible = e.isIntersecting; if (e.isIntersecting) { if (pageLoaded) playVideo(heroClip); } else stopVideo(heroClip); }); }, { threshold: 0.25 }).observe(heroClip);
  }

  // ---- the story stage: one phone, the screen follows the text ----
  var stage = document.querySelector(".stage");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var layers = stage ? Array.prototype.slice.call(stage.querySelectorAll(".layer")) : [];
  var dots = stage ? Array.prototype.slice.call(stage.querySelectorAll(".stage__dots li")) : [];
  var current = "";
  function setActive(name) {
    if (!stage || name === current) return;
    current = name;
    layers.forEach(function (l) {
      var on = l.getAttribute("data-screen") === name;
      l.classList.toggle("on", on);
      var v = l.querySelector("video");
      if (v) { if (on) { try { v.currentTime = 0; } catch (e) {} playVideo(v); } else stopVideo(v); }
    });
    steps.forEach(function (s, i) { if (dots[i]) dots[i].classList.toggle("on", s.getAttribute("data-screen") === name); });
  }
  var stepObserver;
  function watchSteps() {
    if (!("IntersectionObserver" in window) || !steps.length) return;
    if (stepObserver) stepObserver.disconnect();
    var wide = window.matchMedia("(min-width: 900px)").matches;
    stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.getAttribute("data-screen")); });
    }, { rootMargin: wide ? "-46% 0px -46% 0px" : "-56% 0px -26% 0px", threshold: 0 });
    steps.forEach(function (s) { stepObserver.observe(s); });
  }
  if (stage) {
    // first screen before anything has scrolled
    setActive(steps.length ? steps[0].getAttribute("data-screen") : "");
    watchSteps();
    if (window.matchMedia) window.matchMedia("(min-width: 900px)").addEventListener("change", watchSteps);
    // the stage only plays while the story is on screen
    var story = document.getElementById("story");
    if (story && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = stage.querySelector(".layer.on video");
          if (!v) return;
          if (e.isIntersecting) playVideo(v); else stopVideo(v);
        });
      }, { threshold: 0 }).observe(story);
    }
  }

  // ---- pause motion (everything that moves by itself can be stopped) ----
  var toggles = Array.prototype.slice.call(document.querySelectorAll(".motion-toggle"));
  function paintToggle() {
    toggles.forEach(function (b) { b.textContent = motionOff ? say.play[lang] : say.pause[lang]; b.setAttribute("aria-pressed", motionOff ? "true" : "false"); });
    if (motionOff) doc.setAttribute("data-paused", ""); else doc.removeAttribute("data-paused");
  }
  toggles.forEach(function (b) {
    b.addEventListener("click", function () {
      motionOff = !motionOff;
      paintToggle();
      clips.forEach(function (v) { if (motionOff) v.pause(); });
      if (!motionOff) { var v = stage && stage.querySelector(".layer.on video"); if (v) playVideo(v); if (heroClip) playVideo(heroClip); }
    });
  });
  paintToggle();
  document.addEventListener("visibilitychange", function () { if (document.hidden) clips.forEach(function (v) { v.pause(); }); });

  // ---- the creator's video: the file keeps its leading silence, so the player starts just before the first word and stops after the last ----
  var intro = document.getElementById("intro");
  var capBox = document.getElementById("cap");
  if (intro) {
    var START = 1.5, END = 48.3;
    intro.addEventListener("play", function () { if (intro.currentTime < START) intro.currentTime = START; });
    intro.addEventListener("timeupdate", function () { if (intro.currentTime >= END && !intro.paused) intro.pause(); });
    // captions: an overlay drawn by the page (no box behind the words) that follows the same cues as the native caption track
    var track = null;
    Array.prototype.forEach.call(intro.textTracks, function (t) { if ((t.language || "").toLowerCase().indexOf(lang) === 0) track = t; });
    var capButton = document.getElementById("capToggle");
    var capOn = true;
    function paintCap() {
      if (!capButton) return;
      capButton.textContent = capOn ? say.on[lang] : say.off[lang];
      capButton.setAttribute("aria-pressed", capOn ? "true" : "false");
    }
    function showCue() {
      if (!capBox) return;
      var cue = track && track.activeCues && track.activeCues[0];
      if (!capOn || !cue) { capBox.classList.remove("on"); return; }
      capBox.textContent = "";
      cue.text.split("\n").forEach(function (line, i) { if (i) capBox.appendChild(document.createElement("br")); capBox.appendChild(document.createTextNode(line)); });
      capBox.classList.add("on");
    }
    if (track) {
      Array.prototype.forEach.call(intro.textTracks, function (t) { t.mode = "disabled"; });
      track.mode = "hidden";                       // hidden: the cues load and fire, the browser draws nothing; the overlay draws them
      track.addEventListener("cuechange", showCue);
      // iPhone full screen shows only the browser's own captions: give it the real track while full screen is open
      intro.addEventListener("webkitbeginfullscreen", function () { if (capOn) track.mode = "showing"; });
      intro.addEventListener("webkitendfullscreen", function () { track.mode = "hidden"; showCue(); });
    }
    if (capButton) { capButton.addEventListener("click", function () { capOn = !capOn; paintCap(); showCue(); }); paintCap(); }
    intro.addEventListener("pause", function () { if (capBox && intro.currentTime >= END) capBox.classList.remove("on"); });
  }
})();
