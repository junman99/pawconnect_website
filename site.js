// PawConnect website. No dependencies. Everything here is an enhancement: with scripts off, every section still reads and every picture shows.
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOff = reduce;           // the visitor's device asks for less motion, or they pressed the pause button on a phone
  var lang = (doc.lang || "en").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  var say = {
    toDark: { en: "Switch to the dark theme", zh: "切换到深色主题" }, toLight: { en: "Switch to the light theme", zh: "切换到浅色主题" }
  };

  // ---- theme: follows the system until the visitor presses the sun/moon button; the choice is kept in this browser only (localStorage) ----
  var themeButton = document.querySelector(".theme-toggle");
  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function effectiveTheme() { var t = doc.getAttribute("data-theme"); return t === "light" || t === "dark" ? t : (darkQuery && darkQuery.matches ? "dark" : "light"); }
  function paintTheme() {
    var dark = effectiveTheme() === "dark";
    if (themeButton) { themeButton.setAttribute("aria-label", dark ? say.toLight[lang] : say.toDark[lang]); themeButton.setAttribute("aria-pressed", dark ? "true" : "false"); }
    Array.prototype.forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) { m.setAttribute("content", dark ? "#171211" : "#FFF8F4"); m.removeAttribute("media"); });
  }
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem("pc-theme", next); } catch (e) {}
      paintTheme();
    });
    if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener("change", paintTheme);
    paintTheme();
  }

  // ---- the small menu on phones: closes on a choice, on Escape and when the page is tapped elsewhere ----
  var menu = document.querySelector(".menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".menu__panel a")) menu.removeAttribute("open"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.hasAttribute("open")) { menu.removeAttribute("open"); var sum = menu.querySelector("summary"); if (sum) sum.focus(); } });
    document.addEventListener("click", function (e) { if (menu.hasAttribute("open") && !menu.contains(e.target)) menu.removeAttribute("open"); });
  }

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
    var near = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting && pageLoaded && !e.target.closest(".hero") && !e.target.closest(".appx")) loadVideo(e.target); }); }, { rootMargin: "100% 0px" });
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

  // ---- the app page: a tab picks the feature; the phone's screen and the words change together (no long scroll) ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panels [role="tabpanel"]'));
  var layers = Array.prototype.slice.call(document.querySelectorAll(".appx .layer"));
  var current = "";
  function select(name, moveFocus, remember) {
    var tab = tabs.filter(function (t) { return t.getAttribute("data-screen") === name; })[0];
    if (!tab || name === current) { if (tab && moveFocus) tab.focus(); return; }
    current = name;
    tabs.forEach(function (t) { var on = t === tab; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; });
    panels.forEach(function (p) { if (p.getAttribute("data-screen") === name) p.removeAttribute("hidden"); else p.setAttribute("hidden", ""); });
    layers.forEach(function (l) {
      var on = l.getAttribute("data-screen") === name;
      l.classList.toggle("on", on);
      var v = l.querySelector("video");
      if (v) { if (on) { try { v.currentTime = 0; } catch (e) {} playVideo(v); } else stopVideo(v); }
    });
    if (moveFocus) tab.focus();
    if (remember && history.replaceState) { try { history.replaceState(null, "", "#" + name); } catch (e) {} }
    if (tab.scrollIntoView && tab.parentNode && tab.parentNode.scrollWidth > tab.parentNode.clientWidth) { try { tab.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
  }
  if (tabs.length) {
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t.getAttribute("data-screen"), false, true); });
      t.addEventListener("keydown", function (e) {
        var j = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") j = 0; else if (e.key === "End") j = tabs.length - 1;
        if (j >= 0) { e.preventDefault(); select(tabs[j].getAttribute("data-screen"), true, true); }
      });
    });
    var fromHash = function () { var h = (location.hash || "").replace("#", ""); if (h) select(h, false, false); };
    current = tabs[0].getAttribute("data-screen");
    fromHash();
    window.addEventListener("hashchange", fromHash);
    // the recording in the phone plays while the page is visible
    var phoneVideo = function () { return document.querySelector(".appx .layer.on video"); };
    var firstVideo = phoneVideo();
    window.addEventListener("load", function () { setTimeout(function () { pageLoaded = true; var v = phoneVideo(); if (v) playVideo(v); }, 800); });
  }

  // ---- pause (WCAG 2.2.2): the recordings in the phones play by themselves, so each phone carries a small pause/play button; one switch stops everything that moves ----
  var toggles = Array.prototype.slice.call(document.querySelectorAll(".pause-btn"));
  function paintToggle() {
    toggles.forEach(function (b) { b.setAttribute("aria-label", b.getAttribute(motionOff ? "data-play" : "data-pause")); b.setAttribute("aria-pressed", motionOff ? "true" : "false"); });
    if (motionOff) doc.setAttribute("data-paused", ""); else doc.removeAttribute("data-paused");
  }
  toggles.forEach(function (b) {
    b.addEventListener("click", function () {
      motionOff = !motionOff;
      paintToggle();
      clips.forEach(function (v) { if (motionOff) v.pause(); });
      if (!motionOff) { var v = document.querySelector(".appx .layer.on video"); if (v) playVideo(v); if (heroClip) playVideo(heroClip); }
    });
  });
  paintToggle();
  document.addEventListener("visibilitychange", function () { if (document.hidden) clips.forEach(function (v) { v.pause(); }); });

  // ---- the creator's video: it never plays by itself; captions are always drawn (an overlay without a box), from the same cues as the native caption track ----
  var intro = document.getElementById("intro");
  var capBox = document.getElementById("cap");
  if (intro) {
    var track = null;
    Array.prototype.forEach.call(intro.textTracks, function (t) { if ((t.language || "").toLowerCase().indexOf(lang) === 0) track = t; });
    function showCue() {
      if (!capBox) return;
      var cue = track && track.activeCues && track.activeCues[0];
      if (!cue) { capBox.classList.remove("on"); return; }
      capBox.textContent = "";
      cue.text.split("\n").forEach(function (line, i) { if (i) capBox.appendChild(document.createElement("br")); capBox.appendChild(document.createTextNode(line)); });
      capBox.classList.add("on");
    }
    if (track) {
      // hidden: the cues load and fire, the browser draws nothing; the overlay draws them. The native track carries the "default" flag, which can
      // switch it to "showing" after this script ran, so the setting is applied again when the video loads and plays.
      var fullscreen = false;
      var settle = function () {
        Array.prototype.forEach.call(intro.textTracks, function (t) { t.mode = t === track ? (fullscreen ? "showing" : "hidden") : "disabled"; });
      };
      settle();
      intro.addEventListener("loadedmetadata", settle);
      intro.addEventListener("play", settle);
      Array.prototype.forEach.call(intro.querySelectorAll("track"), function (el) { el.addEventListener("load", settle); });
      track.addEventListener("cuechange", showCue);
      // iPhone full screen shows only the browser's own captions: give it the real track while full screen is open
      intro.addEventListener("webkitbeginfullscreen", function () { fullscreen = true; settle(); });
      intro.addEventListener("webkitendfullscreen", function () { fullscreen = false; settle(); showCue(); });
    }
    intro.addEventListener("ended", function () { if (capBox) capBox.classList.remove("on"); });
  }
})();
