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

  // ---- the header follows the scroll on the home page (batch WEB3): the item of the part in view is marked (aria-current="location"); the app story marks "The app", and its first step, PawAI, marks "PawAI" ----
  (function () {
    if (!document.getElementById("app") || !document.getElementById("pawai")) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"], .menu__panel a[href^="#"]'));
    if (!links.length) return;
    var targets = { app: document.getElementById("app"), pawai: document.getElementById("pawai"), about: document.getElementById("about"), questions: document.getElementById("questions") };
    var pending = false, now = null;
    function top(el) { return el.getBoundingClientRect().top; }
    function measure() {
      pending = false;
      var line = Math.max(120, window.innerHeight * 0.4), cur = null;
      if (top(targets.app) <= line) cur = "app";
      if (top(targets.pawai) <= line && targets.pawai.getBoundingClientRect().bottom > line) cur = "pawai";
      if (targets.about && top(targets.about) <= line) cur = "about";
      if (targets.questions && top(targets.questions) <= line) cur = "questions";
      var closing = document.getElementById("get-app");
      if (closing && top(closing) <= line) cur = null;
      if (cur === now) return;
      now = cur;
      links.forEach(function (a) {
        if (a.getAttribute("href") === "#" + cur) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    }
    function schedule() { if (!pending) { pending = true; requestAnimationFrame(measure); } }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
  })();

  // ---- the Back pill (batch WEB2): the previous page when the visitor came from this site, else the parent in its href; never a loop ----
  var pill = document.querySelector("[data-back]");
  function norm(path) { return path.replace(/^\/zh(?=\/|$)/, "").replace(/index\.html$/, "").replace(/\/+$/, "") || "/"; }
  function backGoes() {
    var ref = document.referrer, a;
    if (!ref) return "href";
    try { a = new URL(ref); } catch (e) { return "href"; }
    if (a.origin !== location.origin) return "href";                       // a search engine, another site, a mail link
    if (norm(a.pathname) === norm(location.pathname)) return "href";       // this page again, or its language twin (the EN / 中文 switch)
    var from = null; try { from = sessionStorage.getItem("pc-back-from"); } catch (e) {}
    if (from && from === a.pathname) { try { sessionStorage.removeItem("pc-back-from"); } catch (e) {} return "href"; }   // we left that page with this pill: going back again would bounce
    return history.length > 1 ? "history" : "href";
  }
  if (pill) {
    pill.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      if (backGoes() === "history") { e.preventDefault(); try { sessionStorage.setItem("pc-back-from", location.pathname); } catch (x) {} history.back(); }
    });
  }

  // ---- the question lists: one component for the whole site; the answer opens and closes smoothly (native details when motion is off or there is no script) ----
  Array.prototype.forEach.call(document.querySelectorAll(".acc details"), function (d) {
    var sum = d.querySelector("summary"), body = d.querySelector(".acc__body");
    if (!sum || !body || !body.animate) return;
    var anim = null;
    sum.addEventListener("click", function (e) {
      if (motionOff) return;
      e.preventDefault();
      if (anim) anim.cancel();
      var ease = "cubic-bezier(.2,.7,.1,1)";
      if (!d.open) {
        d.classList.remove("is-closing"); d.open = true;
        var h = body.offsetHeight;
        anim = body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 300, easing: ease });
        anim.onfinish = anim.oncancel = function () { anim = null; };
      } else {
        d.classList.add("is-closing");
        anim = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 240, easing: ease });
        anim.onfinish = function () { d.open = false; d.classList.remove("is-closing"); anim = null; };
        anim.oncancel = function () { anim = null; };
      }
    });
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
    // a recording that has not started after 3.5 s is asked once more (a slow or interrupted load on a phone must not leave a frozen picture)
    clearTimeout(v._rescue);
    v._rescue = setTimeout(function () { if (!v.paused && v.readyState < 3 && !v._retried) { v._retried = true; v.load(); var q = v.play(); if (q && q.catch) q.catch(function () {}); } }, 3500);
  }
  function stopVideo(v) { v.pause(); }
  var clips = Array.prototype.slice.call(document.querySelectorAll("video[data-src]"));
  clips.forEach(function (v) { v.addEventListener("playing", function () { v.classList.add("playing"); }); });
  if ("IntersectionObserver" in window) {
    var near = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting && pageLoaded && !e.target.closest(".hero") ) loadVideo(e.target); }); }, { rootMargin: "100% 0px" });
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
    var story = document.getElementById("app");
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

  // ---- the PawAI page (batch AI6): each example's recording plays only while it is on screen, and can be paused with the button on its phone ----
  var exVisible = [];
  var exClips = Array.prototype.slice.call(document.querySelectorAll(".ex video[data-src]"));
  if (exClips.length && "IntersectionObserver" in window) {
    var exWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = exVisible.indexOf(e.target);
        if (e.isIntersecting) { if (i < 0) exVisible.push(e.target); try { e.target.currentTime = 0; } catch (x) {} playVideo(e.target); }
        else { if (i >= 0) exVisible.splice(i, 1); stopVideo(e.target); }
      });
    }, { threshold: 0.45 });
    exClips.forEach(function (v) { exWatch.observe(v); });
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
      if (!motionOff) { var v = (stage && stage.querySelector(".layer.on video")); if (v) playVideo(v); if (heroClip) playVideo(heroClip); exVisible.forEach(function (c) { playVideo(c); }); }
    });
  });
  paintToggle();
  document.addEventListener("visibilitychange", function () { if (document.hidden) clips.forEach(function (v) { v.pause(); }); });

  // ---- the Today carousel (batch WEB2): real pictures of the Today feed; changes every 3.5 s while on screen (never under reduced motion or while paused), on a tap, a swipe or a dot ----
  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (box) {
    var slides = Array.prototype.slice.call(box.querySelectorAll(".slide"));
    var phonebox = box.closest(".phonebox");
    var dots = phonebox ? Array.prototype.slice.call(phonebox.querySelectorAll(".carousel__dots button")) : [];
    var i = 0, timer = null, visible = false, startX = null, swiped = false;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
      dots.forEach(function (d, k) { if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    }
    function layerOn() { var l = box.closest(".layer"); return !l || l.classList.contains("on"); }
    function restart() { clearInterval(timer); timer = setInterval(function () { if (!motionOff && visible && layerOn() && !document.hidden) show(i + 1); }, 3500); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (entries) { entries.forEach(function (e) { visible = e.isIntersecting; }); }, { threshold: 0.25 }).observe(box); else visible = true;
    dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); restart(); }); });
    box.addEventListener("click", function () { if (swiped) { swiped = false; return; } show(i + 1); restart(); });
    box.addEventListener("pointerdown", function (e) { startX = e.clientX; swiped = false; });
    box.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 35) { swiped = true; show(i + (dx < 0 ? 1 : -1)); restart(); }
    });
    box.addEventListener("pointercancel", function () { startX = null; });
    restart();
  });

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
    // the cue is also looked up as the time moves, so a cue that became active while the track was still loading is never missed
    intro.addEventListener("timeupdate", showCue);
    intro.addEventListener("ended", function () { if (capBox) capBox.classList.remove("on"); });
  }
})();
