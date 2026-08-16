/* Модуль «Дира бе-ханаха». Логика в замыкании, ни одной зашитой цифры. */
(function () {
  "use strict";

  var DATA = null, root = null;
  var archMode = "easy";   /* easy | hard */

  function $(s, c) { return (c || root).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); }
  function el(t, cls, txt) {
    var n = document.createElement(t);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function he(t) {
    var n = el("span", null, t);
    n.setAttribute("dir", "rtl"); n.setAttribute("lang", "he");
    return n;
  }
  function nf(n) {
    if (n == null || !isFinite(n)) return "\u2014";
    return Number(n).toLocaleString("ru-RU");
  }
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
  function pluralRu(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }
  function fmtDate(iso) {
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    return p[2] + "." + p[1] + "." + p[0];
  }

  /* ---------- определение фазы ---------- */

  /* Возвращает идентификатор состояния по датам и сегодняшнему дню */
  function detectPhase(dates, today) {
    var d = function (k) { return dates[k] ? new Date(dates[k]) : null; };
    var open = d("registration_opened"), closed = d("registration_closed");
    var draw = d("draw_date"), notify = d("notifications_started"), end = d("results_phase_ends");
    if (end && today > end) return "done";
    if (notify && today >= notify) return "notify";
    if (draw && today >= draw) return "draw";
    if (closed && today >= closed) return "closed";
    if (open && today >= open) return "open";
    return "before";
  }

  /* Состояние отдельного шага ленты */
  function stepState(dateStr, today) {
    var dd = new Date(dateStr);
    var diff = daysBetween(today, dd);
    if (diff < 0) return { cls: "past", tail: Math.abs(diff) + " " + pluralRu(Math.abs(diff), "день", "дня", "дней") + " назад" };
    if (diff === 0) return { cls: "now", tail: "сегодня" };
    return { cls: "next", tail: "через " + diff + " " + pluralRu(diff, "день", "дня", "дней") };
  }

  /* ---------- отрисовка ---------- */

  function renderStatus() {
    var st = DATA.status;
    var today = new Date();
    var phase = detectPhase(st.dates, today);
    var info = st.states[phase] || st.states.done;

    var b = $("#dh-beacon");
    if (b) b.className = "dh-beacon dh-beacon--" + info.tone;
    var t = $("#dh-st-title"); if (t) t.textContent = info.title;
    var bd = $("#dh-st-body"); if (bd) bd.textContent = info.body;
    var tg = $("#dh-st-tag"); if (tg) tg.textContent = st.lottery_name;

    /* цифры */
    var box = $("[data-render='figs']");
    if (box) {
      var n = st.numbers;
      var items = [
        { n: nf(n.units), c: "квартир разыграно" },
        { n: nf(n.settlements), c: "населённых пунктов" },
        { n: nf(n.sub_lotteries), c: "отдельных розыгрышей" },
        { n: nf(n.households), c: "семей подали заявки" }
      ];
      box.innerHTML = "";
      items.forEach(function (x) {
        var c = el("div", "dh-fig");
        c.appendChild(el("div", "dh-fig__n", x.n));
        c.appendChild(el("div", "dh-fig__c", x.c));
        box.appendChild(c);
      });
    }

    /* лента */
    var line = $("[data-render='line']");
    if (line) {
      line.innerHTML = "";
      st.phases.forEach(function (p) {
        var ds = st.dates[p.date_key];
        if (!ds) return;
        var s = stepState(ds, today);
        var row = el("div", "dh-step dh-step--" + s.cls);
        var h = el("div", "dh-step__h");
        h.appendChild(el("span", "dh-step__d", fmtDate(ds)));
        h.appendChild(el("span", "dh-step__l", p.label));
        h.appendChild(el("span", "dh-step__t", s.tail));
        row.appendChild(h);
        row.appendChild(el("div", "dh-step__x", p.desc));
        line.appendChild(row);
      });
    }
  }

  function renderLive() {
    var box = $("[data-render='live']");
    if (!box) return;
    var f = DATA.future;
    var counts = {
      open: DATA.live.open_projects != null ? DATA.live.open_projects : 0,
      closed: DATA.live.closed_projects != null ? DATA.live.closed_projects : 0,
      future: f.total_projects
    };
    var tone = { open: "go", closed: "wait", future: "future" };
    box.innerHTML = "";
    DATA.live.cards.forEach(function (c) {
      var card = el("div", "dh-live__c dh-live__c--" + tone[c.id]);
      card.appendChild(el("div", "dh-live__n", nf(counts[c.id])));
      card.appendChild(el("div", "dh-live__u", c.unit));
      card.appendChild(el("div", "dh-live__l", c.label));
      card.appendChild(el("div", "dh-live__h", c.hint));
      box.appendChild(card);
    });
  }

  function renderFuture() {
    var body = $("[data-render='future']");
    if (!body) return;
    body.innerHTML = "";
    DATA.future.cities.forEach(function (c) {
      var tr = el("tr");
      tr.appendChild(el("td", "dh-city", c.city));
      tr.appendChild(el("td", "dh-num", nf(c.units)));
      tr.appendChild(el("td", "dh-num", nf(c.projects)));
      var td = el("td");
      if (c.developer_chosen > 0) {
        td.appendChild(el("span", "dh-tag dh-tag--dev", "застройщик выбран"));
      } else {
        td.appendChild(el("span", "dh-tag", "на стадии подготовки"));
      }
      tr.appendChild(td);
      tr.appendChild(el("td", "dh-num", c.price_per_meter ? nf(c.price_per_meter) : "\u2014"));
      body.appendChild(tr);
    });
  }

  function heatColor(v, min, max) {
    var t = (v - min) / (max - min || 1);
    if (t < 0) t = 0; if (t > 1) t = 1;
    var h = 145 - t * 145;                   /* зелёный -> красный */
    return "hsl(" + Math.round(h) + ",62%,44%)";
  }

  function renderArchive() {
    var body = $("[data-render='archive']");
    if (!body) return;
    var list = DATA.archive.cities.slice();
    list.sort(function (a, b) {
      return archMode === "easy" ? a.per_unit - b.per_unit : b.per_unit - a.per_unit;
    });
    list = list.slice(0, 15);
    var vals = DATA.archive.cities.map(function (c) { return c.per_unit; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    body.innerHTML = "";
    list.forEach(function (c) {
      var tr = el("tr");
      tr.appendChild(el("td", "dh-city", c.city));
      var td = el("td");
      var wrap = el("span", "dh-heat");
      var bar = el("span", "dh-heat__b");
      var fill = el("span", "dh-heat__f");
      var pct = Math.max(4, Math.min(100, (Math.log(c.per_unit) / Math.log(max)) * 100));
      fill.style.width = pct + "%";
      fill.style.background = heatColor(Math.log(c.per_unit), Math.log(min), Math.log(max));
      bar.appendChild(fill);
      wrap.appendChild(bar);
      wrap.appendChild(el("span", null, nf(c.per_unit)));
      td.appendChild(wrap);
      tr.appendChild(td);
      tr.appendChild(el("td", "dh-num", nf(c.units)));
      tr.appendChild(el("td", "dh-num", c.price_per_meter ? nf(c.price_per_meter) : "\u2014"));
      body.appendChild(tr);
    });
  }

  function renderYears() {
    var box = $("[data-render='years']");
    if (!box) return;
    box.innerHTML = "";
    DATA.archive.years.forEach(function (y) {
      var c = el("div", "dh-year");
      c.appendChild(el("div", "dh-year__y", String(y.year)));
      c.appendChild(el("div", "dh-year__n", nf(y.per_unit)));
      c.appendChild(el("div", "dh-year__c", "заявок на квартиру"));
      c.appendChild(el("div", "dh-year__c", nf(y.units) + " квартир"));
      box.appendChild(c);
    });
  }

  function renderNext() {
    var box = $("[data-render='prepare']");
    if (box) {
      box.innerHTML = "";
      DATA.next.prepare.forEach(function (t) { box.appendChild(el("li", null, t)); });
    }
    var cb = $("#dh-next-cities");
    if (cb) cb.textContent = DATA.next.expected_cities.join(", ");
  }

  function renderLinks() {
    var box = $("[data-render='links']");
    if (!box) return;
    box.innerHTML = "";
    DATA.official.links.forEach(function (l) {
      var a = el("a", "dh-link" + (l.primary ? " dh-link--primary" : ""));
      a.href = l.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      var d = el("div");
      d.appendChild(el("div", "dh-link__t", l.name));
      d.appendChild(el("div", "dh-link__u", l.url.replace(/^https?:\/\//, "")));
      a.appendChild(d);
      a.appendChild(el("span", "dh-link__a", "\u2197"));
      box.appendChild(a);
    });
  }

  function renderGlossary() {
    var box = $("[data-render='glossary']");
    if (!box) return;
    box.innerHTML = "";
    DATA.glossary.forEach(function (g) {
      var d = el("div", "dh-gl");
      var l = el("div");
      l.appendChild(el("span", "dh-gl__ru", g.ru));
      var h = el("span", "dh-gl__he", "(" + g.he + ")");
      h.setAttribute("dir", "rtl"); h.setAttribute("lang", "he");
      l.appendChild(h);
      d.appendChild(l);
      d.appendChild(el("span", "dh-gl__d", g.desc));
      box.appendChild(d);
    });
  }

  function renderSources() {
    var box = $("[data-render='sources']");
    if (!box) return;
    box.innerHTML = "";
    DATA.sources.forEach(function (s) {
      var li = el("li");
      li.appendChild(document.createTextNode(s.name));
      li.appendChild(el("span", null, s.note));
      box.appendChild(li);
    });
  }

  function bind() {
    $$("[data-arch]").forEach(function (b) {
      b.addEventListener("click", function () {
        archMode = b.getAttribute("data-arch");
        $$("[data-arch]").forEach(function (x) {
          x.setAttribute("aria-pressed", x.getAttribute("data-arch") === archMode ? "true" : "false");
        });
        renderArchive();
      });
    });
  }

  function boot(data) {
    DATA = data;
    root = document.querySelector(".dh-root");
    if (!root) return;
    fillAll();
    renderStatus();
    renderLive();
    renderFuture();
    renderArchive();
    renderYears();
    renderNext();
    renderLinks();
    renderGlossary();
    renderSources();
    bind();
  }

  function init() {
    var inline = document.getElementById("dh-data");
    if (inline) { try { boot(JSON.parse(inline.textContent)); return; } catch (e) {} }
    if (window.fetch) {
      fetch("data/dira.json").then(function (r) { return r.json(); }).then(boot).catch(function () {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { detectPhase: detectPhase, stepState: stepState, pluralRu: pluralRu,
                       daysBetween: daysBetween, fmtDate: fmtDate, heatColor: heatColor };
  }
})();