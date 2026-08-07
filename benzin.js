/* Модуль «Цена на бензин». Логика в замыкании, ни одной зашитой цифры. */
(function () {
  "use strict";

  var DATA = null, root = null;
  var COLORS = ["#1f5fa9", "#b4471f", "#1f7a4d", "#8a5a00", "#6b4d9e", "#0f7d8c", "#a03a6b", "#5b6472"];
  var unitMode = "ils";      // ils | eur
  var hidden = {};           // скрытые ряды графика

  function $(s, c) { return (c || root).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); }
  function el(t, cls, txt) {
    var n = document.createElement(t);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function svgEl(t, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", t);
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }
  function num(n, d) {
    if (!isFinite(n)) return "\u2014";
    return n.toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function ils(n, d) { return num(n, d == null ? 2 : d) + " \u20AA"; }
  function pick(o, p) {
    var a = String(p).split("."), c = o, i;
    for (i = 0; i < a.length; i++) { if (c == null) return undefined; c = c[a[i]]; }
    return c;
  }
  function fillAll() {
    $$("[data-fill]").forEach(function (n) {
      var v = pick(DATA, n.getAttribute("data-fill"));
      if (v != null) n.textContent = String(v);
    });
  }

  /* ---------- расчёты ---------- */

  function tankCost(volume, pricePerLiter) {
    if (!isFinite(volume) || volume <= 0) return null;
    if (!isFinite(pricePerLiter) || pricePerLiter <= 0) return null;
    return volume * pricePerLiter;
  }

  function govShare(volume, breakdown) {
    if (!isFinite(volume) || volume <= 0) return null;
    var per = 0;
    breakdown.items.forEach(function (it) { if (it.gov) per += it.val; });
    return volume * per;
  }

  function yearCost(volume, perMonth, pricePerLiter) {
    var one = tankCost(volume, pricePerLiter);
    if (one == null || !isFinite(perMonth) || perMonth <= 0) return null;
    return one * perMonth * 12;
  }

  function diffVsPrev(volume, cur, prev) {
    if (!isFinite(volume) || volume <= 0) return null;
    return volume * (cur - prev);
  }

  /* ---------- отрисовка ---------- */

  function renderPanel() {
    var p = DATA.price, b = DATA.breakdown;

    var priceEl = $("#bz-price");
    if (priceEl) priceEl.textContent = num(p.self, 2);

    var d = $("#bz-delta");
    if (d) {
      var up = p.diff > 0;
      d.className = "bz-panel__delta " + (up ? "bz-panel__delta--up" : "bz-panel__delta--down");
      d.textContent = (up ? "\u25B2 +" : "\u25BC ") + num(Math.abs(p.diff), 2) +
        " \u20AA к прошлому месяцу, это " + (up ? "+" : "\u2212") + num(Math.abs(p.diff_pct), 1) + "%";
    }

    /* полоса состава */
    var stack = $("#bz-stack");
    if (stack) {
      stack.innerHTML = "";
      var kinds = ["fuel", "blo", "vat", "marg"];
      b.items.forEach(function (it, i) {
        var seg = el("div", "bz-stack__seg");
        seg.setAttribute("data-kind", kinds[i] || "marg");
        seg.style.width = it.pct + "%";
        seg.textContent = it.pct + "%";
        seg.title = it.name + ": " + num(it.val, 2) + " \u20AA";
        stack.appendChild(seg);
      });
    }
    var lg = $("#bz-stack-legend");
    if (lg) {
      lg.innerHTML = "";
      var dots = ["fuel", "blo", "vat", "marg"];
      b.items.forEach(function (it, i) {
        var w = el("span", "bz-legend__i");
        w.appendChild(el("span", "bz-dot bz-dot--" + (dots[i] || "marg")));
        w.appendChild(document.createTextNode(it.name + " " + num(it.val, 2) + " \u20AA"));
        lg.appendChild(w);
      });
    }
  }

  function renderTiles() {
    var box = $("[data-render='tiles']");
    if (!box) return;
    var p = DATA.price;
    var t = [
      { cap: "Полное обслуживание", val: ils(p.full), sub: "доплата " + ils(p.full_add) },
      { cap: "Эйлат, самообслуживание", val: ils(p.eilat_self), sub: "без налога на добавленную стоимость" },
      { cap: "Было в прошлом месяце", val: ils(p.prev), sub: "изменение " + (p.diff > 0 ? "+" : "") + num(p.diff, 2) + " \u20AA" },
      { cap: "Максимум за всю историю", val: ils(p.record), sub: p.record_when }
    ];
    box.innerHTML = "";
    t.forEach(function (x) {
      var c = el("div", "bz-tile");
      c.appendChild(el("div", "bz-tile__cap", x.cap));
      c.appendChild(el("div", "bz-tile__val", x.val));
      c.appendChild(el("div", "bz-tile__sub", x.sub));
      box.appendChild(c);
    });
  }

  function renderParts() {
    var box = $("[data-render='parts']");
    if (!box) return;
    box.innerHTML = "";
    var dots = ["fuel", "blo", "vat", "marg"];
    DATA.breakdown.items.forEach(function (it, i) {
      var r = el("div", "bz-part");
      r.appendChild(el("span", "bz-dot bz-dot--" + (dots[i] || "marg")));
      var mid = el("div");
      mid.appendChild(el("span", "bz-part__name", it.name));
      mid.appendChild(el("span", "bz-part__note", it.note));
      r.appendChild(mid);
      var v = el("div", "bz-part__val", num(it.val, 2) + " \u20AA");
      v.appendChild(el("span", "bz-part__pct", it.pct + "%"));
      r.appendChild(v);
      box.appendChild(r);
    });
  }

  function renderBars() {
    var box = $("[data-render='bars']");
    if (!box) return;
    var rows = DATA.europe.rows;
    var max = 0;
    rows.forEach(function (r) { var v = unitMode === "ils" ? r.ils : r.eur; if (v > max) max = v; });
    box.innerHTML = "";
    rows.forEach(function (r) {
      var v = unitMode === "ils" ? r.ils : r.eur;
      var cls = "bz-bar" + (r.self ? " bz-bar--self" : "") + (r.code === "EU" ? " bz-bar--eu" : "");
      var row = el("div", cls);
      row.appendChild(el("div", "bz-bar__name", r.name));
      var track = el("div", "bz-bar__track");
      var fill = el("div", "bz-bar__fill");
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el("div", "bz-bar__val", unitMode === "ils" ? num(v, 2) + " \u20AA" : num(v, 3) + " \u20AC"));
      box.appendChild(row);
      /* ширина ставится после вставки, чтобы сработал переход */
      window.setTimeout(function () { fill.style.width = (max ? (v / max) * 100 : 0) + "%"; }, 20);
    });
  }

  function renderChart() {
    var host = $("[data-render='chart']");
    if (!host) return;
    var c = DATA.chart;
    var W = 720, H = 300, padL = 44, padR = 12, padT = 14, padB = 28;
    var n = c.dates.length;

    var lo = Infinity, hi = -Infinity;
    c.series.forEach(function (s, i) {
      if (hidden[s.code]) return;
      s.values.forEach(function (v) {
        if (typeof v === "number") { if (v < lo) lo = v; if (v > hi) hi = v; }
      });
    });
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    var pad = (hi - lo) * 0.12 || 0.1;
    lo -= pad; hi += pad;

    function X(i) { return padL + (i / (n - 1)) * (W - padL - padR); }
    function Y(v) { return padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB); }

    host.innerHTML = "";
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    svg.setAttribute("aria-label", "График цены бензина по странам");

    /* сетка */
    var ticks = 4, i, gy, v;
    for (i = 0; i <= ticks; i++) {
      v = lo + (hi - lo) * (i / ticks);
      gy = Y(v);
      svg.appendChild(svgEl("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#e6eaf0", "stroke-width": 1 }));
      var lab = svgEl("text", { x: padL - 7, y: gy + 4, "text-anchor": "end", "font-size": 11, fill: "#8a93a1" });
      lab.textContent = num(v, 2);
      svg.appendChild(lab);
    }

    /* подписи по оси времени */
    var step = Math.max(1, Math.floor(n / 6));
    for (i = 0; i < n; i += step) {
      var tx = svgEl("text", { x: X(i), y: H - 8, "text-anchor": "middle", "font-size": 11, fill: "#8a93a1" });
      tx.textContent = c.dates[i];
      svg.appendChild(tx);
    }

    /* линии */
    c.series.forEach(function (s, si) {
      if (hidden[s.code]) return;
      var dstr = "", started = false;
      s.values.forEach(function (val, i2) {
        if (typeof val !== "number") return;
        dstr += (started ? " L" : "M") + X(i2).toFixed(1) + " " + Y(val).toFixed(1);
        started = true;
      });
      if (!dstr) return;
      var isEu = s.code === "EU";
      svg.appendChild(svgEl("path", {
        d: dstr, fill: "none", stroke: COLORS[si % COLORS.length],
        "stroke-width": isEu ? 3 : 2,
        "stroke-dasharray": isEu ? "6 4" : "",
        "stroke-linejoin": "round", "stroke-linecap": "round"
      }));
    });

    host.appendChild(svg);

    /* легенда-переключатель */
    var lg = el("div", "bz-chart__legend");
    c.series.forEach(function (s, si) {
      var it = el("span", "bz-chart__li");
      it.setAttribute("data-off", hidden[s.code] ? "1" : "0");
      it.setAttribute("role", "button");
      it.setAttribute("tabindex", "0");
      var sw = el("span", "bz-chart__sw");
      sw.style.background = COLORS[si % COLORS.length];
      it.appendChild(sw);
      it.appendChild(document.createTextNode(s.name));
      function toggle() { hidden[s.code] = !hidden[s.code]; renderChart(); }
      it.addEventListener("click", toggle);
      it.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
      lg.appendChild(it);
    });
    host.appendChild(lg);
  }

  function renderDrivers() {
    var box = $("[data-render='drivers']");
    if (!box) return;
    box.innerHTML = "";
    DATA.drivers.items.forEach(function (d) {
      var c = el("div", "bz-driver");
      c.appendChild(el("span", "bz-driver__n", d.n));
      var b = el("div");
      b.appendChild(el("div", "bz-driver__name", d.name));
      b.appendChild(el("p", "bz-driver__body", d.body));
      b.appendChild(el("p", "bz-driver__now", d.now));
      c.appendChild(b);
      box.appendChild(c);
    });
  }

  function renderFaq() {
    var box = $("[data-render='faq']");
    if (!box) return;
    box.innerHTML = "";
    DATA.faq.forEach(function (f) {
      var d = el("details");
      d.appendChild(el("summary", null, f.q));
      var a = el("div", "bz-faq__a");
      a.appendChild(el("p", null, f.a));
      d.appendChild(a);
      box.appendChild(d);
    });
  }

  function renderGlossary() {
    var box = $("[data-render='glossary']");
    if (!box) return;
    box.innerHTML = "";
    DATA.glossary.forEach(function (g) {
      var d = el("div", "bz-gloss__i");
      var l = el("div");
      l.appendChild(el("span", "bz-gloss__ru", g.ru));
      var h = el("span", "bz-gloss__he", "(" + g.he + ")");
      h.setAttribute("dir", "rtl"); h.setAttribute("lang", "he");
      l.appendChild(h);
      d.appendChild(l);
      d.appendChild(el("span", "bz-gloss__d", g.desc));
      box.appendChild(d);
    });
  }

  function renderSources() {
    var box = $("[data-render='sources']");
    if (!box) return;
    box.innerHTML = "";
    DATA.sources.forEach(function (s) {
      var li = el("li");
      var a = el("a", null, s.name);
      a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      li.appendChild(a);
      box.appendChild(li);
    });
  }

  /* ---------- калькулятор ---------- */

  function updateTank() {
    var vol = parseFloat(($("#bz-vol") || {}).value);
    var per = parseFloat(($("#bz-freq") || {}).value);
    var p = DATA.price;
    var one = tankCost(vol, p.self);
    var gov = govShare(vol, DATA.breakdown);
    var yr = yearCost(vol, per, p.self);
    var dif = diffVsPrev(vol, p.self, p.prev);

    var set = function (id, txt) { var n = $(id); if (n) n.textContent = txt; };
    if (one == null) {
      ["#bz-t-one", "#bz-t-gov", "#bz-t-year", "#bz-t-diff"].forEach(function (i) { set(i, "\u2014"); });
      return;
    }
    set("#bz-t-one", ils(one));
    set("#bz-t-gov", ils(gov));
    set("#bz-t-year", yr == null ? "\u2014" : ils(yr));
    set("#bz-t-diff", (dif >= 0 ? "+" : "\u2212") + ils(Math.abs(dif)));
  }

  function bind() {
    ["#bz-vol", "#bz-freq"].forEach(function (s) {
      var n = $(s);
      if (n) { n.addEventListener("input", updateTank); n.addEventListener("change", updateTank); }
    });
    $$("[data-unit]").forEach(function (b) {
      b.addEventListener("click", function () {
        unitMode = b.getAttribute("data-unit");
        $$("[data-unit]").forEach(function (x) {
          x.setAttribute("aria-pressed", x.getAttribute("data-unit") === unitMode ? "true" : "false");
        });
        renderBars();
      });
    });
  }

  /* ---------- запуск ---------- */

  function boot(data) {
    DATA = data;
    root = document.querySelector(".bz-root");
    if (!root) return;
    fillAll();
    renderPanel();
    renderTiles();
    renderParts();
    renderBars();
    renderChart();
    renderDrivers();
    renderFaq();
    renderGlossary();
    renderSources();
    var v = $("#bz-vol"), f = $("#bz-freq");
    if (v && !v.value) v.value = DATA.tank.default_volume;
    if (f && !f.value) f.value = DATA.tank.default_per_month;
    bind();
    updateTank();
  }

  function init() {
    var inline = document.getElementById("bz-data");
    if (inline) { try { boot(JSON.parse(inline.textContent)); return; } catch (e) {} }
    if (window.fetch) {
      fetch("data/benzin.json").then(function (r) { return r.json(); }).then(boot).catch(function () {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { tankCost: tankCost, govShare: govShare, yearCost: yearCost, diffVsPrev: diffVsPrev };
  }
})();