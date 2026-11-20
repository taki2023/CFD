/* TakiCFD website: mobile menu, table-of-contents highlighting, and the hero flow (particles in the flow past a
   cylinder: potential flow plus a shed vortex street, Strouhal number ≈ 0.2). No libraries. */
(function () {
  "use strict";

  // ---------- mobile menu
  var tog = document.querySelector(".nav-toggle"), nav = document.querySelector(".nav");
  if (tog && nav) {
    tog.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      tog.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ---------- table of contents: mark the section being read
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.classList.remove("active"); });
          map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // ---------- hero flow
  var cv = document.getElementById("flow");
  if (!cv) return;
  var ctx = cv.getContext("2d");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W, H, dpr, R, cx, cy, U, parts = [], vort = [], tShed = 0, sign = 1, running = true, last = 0;
  var BG = "11, 33, 64";

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(26, Math.min(W, H) * 0.075);
    cx = W > 760 ? W * 0.64 : W * 0.35; cy = H * 0.5;
    U = Math.max(40, W * 0.07);                     // free-stream speed, px/s
    var n = Math.round(Math.min(1500, W * H / 900));
    parts = []; for (var i = 0; i < n; i++) parts.push(spawn(true));
    vort = []; ctx.fillStyle = "rgb(" + BG + ")"; ctx.fillRect(0, 0, W, H);
  }

  function spawn(anywhere) {
    var p = { x: anywhere ? Math.random() * W : -Math.random() * 40, y: Math.random() * H, age: 0, life: 4 + Math.random() * 6 };
    var dx = p.x - cx, dy = p.y - cy;
    if (dx * dx + dy * dy < R * R * 1.1) p.x = cx - R * 2 - Math.random() * R * 2;
    return p;
  }

  function vel(x, y) {
    var dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy;
    var a2 = R * R, r4 = r2 * r2 || 1e-9;
    var u = U * (1 - a2 * (dx * dx - dy * dy) / r4), v = -U * 2 * a2 * dx * dy / r4;
    if (dx > 0) {                                   // velocity deficit of the wake, widening downstream
      var bw = R * (0.9 + 0.12 * dx / R), ramp = 1 - Math.exp(-dx / R);
      u -= U * 0.55 * ramp * Math.exp(-dy * dy / (bw * bw)) * Math.max(0.25, 1 - dx / (W * 0.9));
    }
    for (var k = 0; k < vort.length; k++) {
      var w = vort[k], ex = x - w.x, ey = y - w.y, q = ex * ex + ey * ey + 1e-6;
      var f = w.g / (2 * Math.PI * q) * (1 - Math.exp(-q / (w.rc * w.rc))) * w.s;
      u += -f * ey; v += f * ex;
    }
    return [u, v];
  }

  function colour(s) {       // speed / U → deep blue · cyan · ice · warm
    var t = Math.min(1, s / (1.9 * U));
    var stops = [[36, 86, 150], [52, 160, 220], [170, 225, 250], [255, 214, 140]];
    var x = t * 3, i = Math.min(2, Math.floor(x)), f = x - i, a = stops[i], b = stops[i + 1];
    return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * f) + "," + Math.round(a[1] + (b[1] - a[1]) * f) + "," + Math.round(a[2] + (b[2] - a[2]) * f) + ")";
  }

  function shed(dt) {
    tShed += dt;
    var period = (2 * R) / (0.2 * U) / 2;          // one vortex every half shedding period
    if (tShed > period) {
      tShed = 0; sign = -sign;
      vort.push({ x: cx + R * 1.25, y: cy + sign * R * 0.42, g: 3.6 * U * R, rc: R * 0.6, s: -sign, born: 0 });
    }
    for (var k = vort.length - 1; k >= 0; k--) {
      var w = vort[k]; w.born += dt;
      w.x += U * 0.7 * dt; w.rc += R * 0.02 * dt;
      w.s *= Math.pow(0.985, dt);
      if (w.x > W + 4 * R) vort.splice(k, 1);
    }
  }

  function step(dt) {
    shed(dt);
    ctx.fillStyle = "rgba(" + BG + ",0.09)"; ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1.3; ctx.lineCap = "round";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], v = vel(p.x, p.y);
      var nx = p.x + v[0] * dt, ny = p.y + v[1] * dt;
      p.age += dt;
      var dx = nx - cx, dy = ny - cy;
      if (nx > W + 10 || ny < -10 || ny > H + 10 || p.age > p.life || dx * dx + dy * dy < R * R) { parts[i] = spawn(false); if (Math.random() < 0.5) { parts[i].x = Math.random() * W; } continue; }
      ctx.strokeStyle = colour(Math.sqrt(v[0] * v[0] + v[1] * v[1]));
      ctx.globalAlpha = Math.min(1, p.age * 2, (p.life - p.age) * 2) * 0.8;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
    }
    ctx.globalAlpha = 1;
    cylinder();
  }

  function cylinder() {
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = "#e9eef5"; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.stroke();
  }

  function streamlines() {   // reduced motion: a still picture of the same flow
    ctx.fillStyle = "rgb(" + BG + ")"; ctx.fillRect(0, 0, W, H);
    for (var k = 0; k < 6; k++) { tShed = 1e9; shed(0); for (var j = 0; j < 40; j++) shed(0.05); }
    ctx.lineWidth = 1.2;
    for (var y0 = 4; y0 < H; y0 += 9) {
      var x = 0, y = y0;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (var s = 0; s < 900 && x < W; s++) {
        var v = vel(x, y), m = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1;
        x += v[0] / m * 3; y += v[1] / m * 3;
        var dx = x - cx, dy = y - cy; if (dx * dx + dy * dy < R * R) break;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(90,170,230,.55)"; ctx.stroke();
    }
    cylinder();
  }

  function frame(t) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
    step(dt);
    requestAnimationFrame(frame);
  }

  function start() { if (!running && !still) { running = true; last = 0; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  size();
  if (still) { running = false; streamlines(); }
  else requestAnimationFrame(frame);

  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (still) streamlines(); }, 150); });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(cv);
  }
})();
