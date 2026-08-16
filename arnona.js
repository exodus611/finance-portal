/* Модуль «Скидка на арнону» — вся логика в замыкании, ни одной зашитой цифры */
(function () {
  "use strict";

  var DATA = null;
  var root = null;

  /* ---------- утилиты ---------- */

  function $(sel, ctx) { return (ctx || root).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function money(n) {
    if (!isFinite(n)) return "—";
    return Math.round(n).toLocaleString("ru-RU") + " \u20AA";
  }

  function pluralRu(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }

  /* достаёт значение по пути «a.b.0.c» */
  function pick(obj, path) {
    var parts = String(path).split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  /* заполняет все data-fill из JSON */
  function fillAll() {
    $$("[data-fill]").forEach(function (node) {
      var v = pick(DATA, node.getAttribute("data-fill"));
      if (v == null) return;
      node.textContent = String(v);
    });
  }

  /* ---------- отрисовка блоков ---------- */

  function renderLevels() {
    var box = $("[data-render='levels']");
    if (!box) return;
    box.innerHTML = "";
    DATA.hierarchy.levels.forEach(function (lv) {
      var c = el("div", "arn-level");
      c.appendChild(el("span", "arn-level__n", lv.n));
      c.appendChild(el("div", "arn-level__kind", lv.kind));
      c.appendChild(el("div", "arn-level__name", lv.name_ru));
      var he = el("div", "arn-level__he", lv.name_he);
      he.setAttribute("dir", "rtl");
      he.setAttribute("lang", "he");
      c.appendChild(he);
      c.appendChild(el("span", "arn-level__art", lv.article));
      c.appendChild(el("p", "arn-level__what", lv.what));
      box.appendChild(c);
    });
  }

  function badgeClass(effort) {
    if (effort === "один документ") return "arn-badge arn-badge--easy";
    if (effort === "комиссия") return "arn-badge arn-badge--hard";
    return "arn-badge arn-badge--mid";
  }

  function renderCategories() {
    var body = $("[data-render='categories']");
    if (!body) return;
    body.innerHTML = "";
    DATA.categories.forEach(function (c) {
      var card = el("div", "arn-cat-card");

      var top = el("div", "arn-cat-card__top");
      top.appendChild(el("span", "arn-art", c.article));
      top.appendChild(el("span", "arn-ceil", c.ceiling));
      card.appendChild(top);

      var who = el("div", "arn-cat-card__who");
      who.appendChild(document.createTextNode(c.who));
      if (c.term_ru) {
        var t = el("span", "arn-term");
        t.appendChild(document.createTextNode(" " + c.term_ru));
        if (c.term_he) {
          var h = el("span", "arn-he-inline", "(" + c.term_he + ")");
          h.setAttribute("dir", "rtl");
          h.setAttribute("lang", "he");
          t.appendChild(h);
        }
        who.appendChild(t);
      }
      card.appendChild(who);

      if (c.note) {
        card.appendChild(el("div", "arn-term", c.note));
      }
      if (c.limits) {
        card.appendChild(el("div", "arn-cat-card__limits", c.limits));
      }

      var eff = el("span", badgeClass(c.effort), c.effort);
      card.appendChild(eff);

      body.appendChild(card);
    });
  }

  function renderLegend() {
    var box = $("[data-render='legend']");
    if (!box) return;
    box.innerHTML = "";
    DATA.effort_legend.forEach(function (l) {
      var d = el("div", "arn-legend__item");
      d.appendChild(el("span", badgeClass(l.id), l.label));
      d.appendChild(el("p", null, l.desc));
      box.appendChild(d);
    });
  }

  function renderDocs() {
    var box = $("[data-render='ole-docs']");
    if (box) {
      box.innerHTML = "";
      DATA.ole.documents.forEach(function (t) { box.appendChild(el("li", null, t)); });
    }
    var st = $("[data-render='ole-start']");
    if (st) {
      st.innerHTML = "";
      DATA.ole.start_from.forEach(function (t) { st.appendChild(el("li", null, t)); });
    }
  }

  function renderIncome() {
    var body = $("[data-render='income']");
    if (!body) return;
    body.innerHTML = "";
    DATA.income_table.rows.forEach(function (r) {
      var tr = el("tr");
      tr.appendChild(el("td", null, r.people));
      tr.appendChild(el("td", "arn-ceil", r.income));
      body.appendChild(tr);
    });
  }

  function renderCommonRules() {
    var box = $("[data-render='rules']");
    if (!box) return;
    box.innerHTML = "";
    DATA.common_rules.forEach(function (r) {
      var c = el("div", "arn-card");
      var h = el("h4");
      h.appendChild(document.createTextNode(r.title));
      if (r.article && r.article !== "—") {
        var a = el("span", "arn-art", "статья " + r.article);
        a.style.marginInlineStart = "8px";
        h.appendChild(a);
      }
      c.appendChild(h);
      if (r.name_ru) {
        var nm = el("p");
        nm.style.margin = "0 0 6px";
        nm.style.fontSize = "14px";
        nm.style.color = "var(--arn-muted)";
        nm.appendChild(document.createTextNode(r.name_ru + " "));
        if (r.name_he) {
          var hh = el("span", "arn-he-inline", "(" + r.name_he + ")");
          hh.setAttribute("dir", "rtl");
          hh.setAttribute("lang", "he");
          nm.appendChild(hh);
        }
        c.appendChild(nm);
      }
      var p = el("p", null, r.body);
      p.style.marginBottom = "0";
      c.appendChild(p);
      box.appendChild(c);
    });
  }

  function renderSteps() {
    var box = $("[data-render='steps']");
    if (!box) return;
    box.innerHTML = "";
    DATA.steps.items.forEach(function (s) {
      var li = el("li", "arn-step");
      li.appendChild(el("span", "arn-step__n", s.n));
      var d = el("div");
      d.appendChild(el("div", "arn-step__t", s.title));
      d.appendChild(el("p", "arn-step__b", s.body));
      li.appendChild(d);
      box.appendChild(li);
    });
  }

  function renderAppeal() {
    var box = $("[data-render='appeal']");
    if (!box) return;
    box.innerHTML = "";
    DATA.appeal.steps.forEach(function (s) {
      var d = el("div", "arn-appeal__item");
      d.appendChild(el("span", "arn-appeal__n", s.n));
      var b = el("div");
      var t = el("div", "arn-appeal__t");
      t.appendChild(document.createTextNode(s.title));
      if (s.name_ru) {
        t.appendChild(document.createTextNode(" — " + s.name_ru + " "));
        var hh = el("span", "arn-he-inline", "(" + s.name_he + ")");
        hh.setAttribute("dir", "rtl");
        hh.setAttribute("lang", "he");
        t.appendChild(hh);
      }
      b.appendChild(t);
      b.appendChild(el("div", "arn-appeal__d", s.days));
      d.appendChild(b);
      box.appendChild(d);
    });
  }

  function renderFaq() {
    var box = $("[data-render='faq']");
    if (!box) return;
    box.innerHTML = "";
    DATA.faq.forEach(function (f) {
      var d = el("details");
      var s = el("summary", null, f.q);
      d.appendChild(s);
      var a = el("div", "arn-faq__a");
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
      var d = el("div", "arn-gloss__item");
      var line = el("div");
      line.appendChild(el("span", "arn-gloss__ru", g.ru));
      var h = el("span", "arn-gloss__he", "(" + g.he + ")");
      h.setAttribute("dir", "rtl");
      h.setAttribute("lang", "he");
      line.appendChild(h);
      d.appendChild(line);
      d.appendChild(el("span", "arn-gloss__d", g.desc));
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
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      li.appendChild(a);
      if (s.he) {
        var h = el("span", "arn-he-inline", s.he);
        h.setAttribute("dir", "rtl");
        h.setAttribute("lang", "he");
        li.appendChild(h);
      }
      box.appendChild(li);
    });
  }

  function renderPeriods() {
    var sel = $("#arn-period");
    if (!sel) return;
    sel.innerHTML = "";
    DATA.calc.period_options.forEach(function (o) {
      var op = el("option", null, o.label);
      op.value = String(o.months);
      sel.appendChild(op);
    });
    sel.value = "2";
  }

  /* ---------- расчёты ---------- */

  /* Доля счёта, приходящаяся на льготируемую площадь */
  function areaShare(areaTotal, areaLimit) {
    if (!isFinite(areaTotal) || areaTotal <= 0) return 1;
    if (!isFinite(areaLimit) || areaLimit <= 0) return 1;
    if (areaTotal <= areaLimit) return 1;
    return areaLimit / areaTotal;
  }

  /* Верхняя граница экономии за год */
  function calcYear(billSum, monthsInBill, ceilingPct, share, monthsBenefit) {
    if (!isFinite(billSum) || billSum <= 0) return null;
    if (!isFinite(monthsInBill) || monthsInBill <= 0) return null;
    var perMonth = billSum / monthsInBill;
    var eligible = perMonth * share;
    var saveMonth = eligible * (ceilingPct / 100);
    return {
      perMonth: perMonth,
      eligiblePerMonth: eligible,
      saveMonth: saveMonth,
      savePeriod: saveMonth * monthsBenefit,
      payMonth: perMonth - saveMonth,
      months: monthsBenefit
    };
  }

  /* Сколько месяцев льготы осталось от даты алии */
  function monthsLeft(aliyaDateStr, today, windowMonths, benefitMonths) {
    var d = new Date(aliyaDateStr);
    if (isNaN(d.getTime())) return null;
    var now = today || new Date();
    var passed = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (now.getDate() < d.getDate()) passed -= 1;
    if (passed < 0) return { state: "future", passed: passed, left: benefitMonths, windowLeft: windowMonths };
    var windowLeft = windowMonths - passed;
    if (windowLeft <= 0) return { state: "expired", passed: passed, left: 0, windowLeft: 0 };
    return {
      state: "active",
      passed: passed,
      windowLeft: windowLeft,
      left: Math.min(benefitMonths, windowLeft)
    };
  }

  /* ---------- поведение ---------- */

  function updateCalc() {
    var sumEl = $("#arn-sum"), periodEl = $("#arn-period"), areaEl = $("#arn-area");
    var outSave = $("#arn-out-save"), outMonth = $("#arn-out-month"),
        outPay = $("#arn-out-pay"), outBase = $("#arn-out-base");
    if (!sumEl || !periodEl) return;

    var sum = parseFloat(sumEl.value);
    var months = parseFloat(periodEl.value);
    var area = parseFloat(areaEl && areaEl.value);
    var limit = DATA.ole.area_limit_m2;
    var ceiling = DATA.ole.ceiling_percent;
    var benefit = DATA.ole.months_benefit;

    var share = areaShare(area, limit);
    var r = calcYear(sum, months, ceiling, share, benefit);

    if (!r) {
      [outSave, outMonth, outPay, outBase].forEach(function (n) { if (n) n.textContent = "—"; });
      return;
    }
    if (outSave) outSave.textContent = money(r.savePeriod);
    if (outMonth) outMonth.textContent = money(r.saveMonth);
    if (outPay) outPay.textContent = money(r.payMonth);
    if (outBase) outBase.textContent = money(r.perMonth);

    var shareNote = $("#arn-share-note");
    if (shareNote) {
      if (share < 1) {
        shareNote.textContent = "Квартира больше " + limit + " м², поэтому расчёт сделан только для части счёта, приходящейся на первые " + limit + " м².";
        shareNote.style.display = "";
      } else {
        shareNote.style.display = "none";
      }
    }
  }

  function updateTimer() {
    var input = $("#arn-aliya");
    var valEl = $("#arn-timer-val"), capEl = $("#arn-timer-cap"), barEl = $("#arn-timer-bar");
    if (!input || !valEl) return;
    if (!input.value) {
      valEl.textContent = "—";
      if (capEl) capEl.textContent = "Укажите дату, чтобы увидеть, сколько времени остаётся";
      if (barEl) barEl.style.width = "0%";
      return;
    }
    var w = DATA.ole.months_window, b = DATA.ole.months_benefit;
    var res = monthsLeft(input.value, new Date(), w, b);
    if (!res) { valEl.textContent = "—"; return; }

    if (res.state === "expired") {
      valEl.textContent = "Срок прошёл";
      if (capEl) capEl.textContent = "С даты регистрации прошло больше " + w + " месяцев. Посмотрите другие основания в таблице ниже — всё решаемо.";
      if (barEl) barEl.style.width = "100%";
      return;
    }
    if (res.state === "future") {
      valEl.textContent = "—";
      if (capEl) capEl.textContent = "Дата указана в будущем, проверьте её.";
      if (barEl) barEl.style.width = "0%";
      return;
    }
    var m = res.windowLeft;
    valEl.textContent = m + " " + pluralRu(m, "месяц", "месяца", "месяцев");
    if (capEl) {
      capEl.textContent = "остаётся, чтобы обратиться. Скидку дают на " + b +
        " " + pluralRu(b, "месяц", "месяца", "месяцев") + " из " + w + ", а прошло уже " +
        res.passed + " " + pluralRu(res.passed, "месяц", "месяца", "месяцев") + ".";
    }
    if (barEl) barEl.style.width = Math.max(0, Math.min(100, (res.passed / w) * 100)) + "%";
  }

  function bind() {
    ["#arn-sum", "#arn-period", "#arn-area"].forEach(function (s) {
      var n = $(s);
      if (n) { n.addEventListener("input", updateCalc); n.addEventListener("change", updateCalc); }
    });
    var a = $("#arn-aliya");
    if (a) { a.addEventListener("input", updateTimer); a.addEventListener("change", updateTimer); }
  }

  /* ---------- запуск ---------- */

  function boot(data) {
    DATA = data;
    root = document.querySelector(".arn-root");
    if (!root) return;
    fillAll();
    renderLevels();
    renderCategories();
    renderLegend();
    renderDocs();
    renderIncome();
    renderCommonRules();
    renderSteps();
    renderAppeal();
    renderFaq();
    renderGlossary();
    renderSources();
    renderPeriods();
    bind();
    updateCalc();
    updateTimer();
  }

  function init() {
    var inline = document.getElementById("arn-data");
    if (inline) {
      try { boot(JSON.parse(inline.textContent)); return; } catch (e) {}
    }
    if (window.fetch) {
      fetch("data/arnona.json")
        .then(function (r) { return r.json(); })
        .then(boot)
        .catch(function () {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* экспорт для тестов */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { areaShare: areaShare, calcYear: calcYear, monthsLeft: monthsLeft, pluralRu: pluralRu };
  }
})();