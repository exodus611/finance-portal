/* CyberShield archive: renders ALL warnings from data/scams.json (RU canonical)
   with EN/FR translations from data/scams_i18n.json. Shared by cyber.html,
   en/cyber.html, fr/cyber.html. Language comes from <html lang>, the data path
   prefix from <body data-base> ("" at root, "../" in locale folders). */
(function () {
  "use strict";
  var lang = (document.documentElement.lang || "ru").slice(0, 2);
  if (["ru", "en", "fr"].indexOf(lang) < 0) lang = "ru";
  var base = (document.body && document.body.dataset.base) || "";

  var STR = {
    ru: { search_ph: "Поиск по предупреждениям…", all: "Все", sms: "SMS / ссылки", call: "Звонки", web: "Сайты и фишинг", found: "Найдено предупреждений", more: "Показать ещё", show: "Разбор", hide: "Свернуть", notice: "На что обратить внимание", todo: "Что не делать", original: "Оригинал сообщения (иврит)", translation: "Перевод на русский", source: "Оригинал в Telegram ↗", pending: "Перевод скоро появится, пока текст на русском", failed: "Не удалось загрузить предупреждения. Обновите страницу.", archive_h: "Архив предупреждений" },
    en: { search_ph: "Search warnings…", all: "All", sms: "SMS / links", call: "Calls", web: "Web & phishing", found: "Warnings found", more: "Show more", show: "Breakdown", hide: "Hide", notice: "What to watch for", todo: "What not to do", original: "Original message (Hebrew)", translation: "Translation (Russian)", source: "Original on Telegram ↗", pending: "Translation coming soon — showing the Russian text", failed: "Could not load the warnings. Please reload the page.", archive_h: "Warnings archive" },
    fr: { search_ph: "Rechercher dans les alertes…", all: "Toutes", sms: "SMS / liens", call: "Appels", web: "Web et phishing", found: "Alertes trouvées", more: "Afficher plus", show: "Analyse", hide: "Masquer", notice: "À quoi faire attention", todo: "À ne pas faire", original: "Message original (hébreu)", translation: "Traduction (russe)", source: "Original sur Telegram ↗", pending: "Traduction bientôt disponible — texte russe affiché", failed: "Impossible de charger les alertes. Rechargez la page.", archive_h: "Archive des alertes" }
  };
  var L = STR[lang];
  var KIND = { sms: "📲", call: "📞", web: "🌐" };
  var PAGE = 12;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    var p = String(iso || "").split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : String(iso || "");
  }

  var state = { items: [], i18n: {}, todoMap: {}, type: "all", q: "", shown: PAGE };

  function loc(item) {
    if (lang === "ru") {
      return { t: item.title, s: item.summary, n: item.what_to_notice, localized: true };
    }
    var tr = state.i18n[String(item.id)];
    if (tr) return { t: tr.t, s: tr.s, n: tr.n, localized: true };
    return { t: item.title, s: item.summary, n: item.what_to_notice, localized: false };
  }
  function todoList(item) {
    var list = Array.isArray(item.what_not_to_do) ? item.what_not_to_do : [String(item.what_not_to_do || "")];
    if (lang === "ru") return list;
    var key = list.join("\n");
    var tr = state.todoMap[key];
    return tr || list;
  }
  function filtered() {
    return state.items.filter(function (item) {
      if (state.type !== "all" && item.type !== state.type) return false;
      if (!state.q) return true;
      var l = loc(item);
      var hay = (l.t + " " + l.s + " " + l.n + " " + item.title + " " + item.summary).toLowerCase();
      return hay.indexOf(state.q) >= 0;
    });
  }

  function card(item, open) {
    var l = loc(item);
    var todos = todoList(item).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    var id = "w" + String(item.id);
    var html = '<article class="scam-card" id="' + esc(id) + '">'
      + '<div class="scam-head"><span class="scam-badge badge-' + esc(item.type) + '">' + (KIND[item.type] || "⚠️") + " " + esc(L[item.type] || item.type) + "</span>"
      + '<span class="scam-date">' + esc(fmtDate(item.date)) + "</span></div>"
      + "<h3>" + esc(l.t) + "</h3>"
      + '<p class="scam-sum">' + esc(l.s) + "</p>"
      + (l.localized ? "" : '<p class="scam-pending">' + esc(L.pending) + "</p>")
      + '<button type="button" class="scam-toggle" data-toggle="' + esc(id) + '" aria-expanded="' + (open ? "true" : "false") + '">' + esc(open ? L.hide : L.show) + " ▾</button>"
      + '<div class="scam-detail"' + (open ? "" : " hidden") + ">"
      + '<div class="detail-block"><h4>' + esc(L.notice) + '</h4><p>' + esc(l.n) + "</p></div>"
      + '<div class="detail-block todo"><h4>' + esc(L.todo) + "</h4><ul>" + todos + "</ul></div>";
    if (lang === "ru" && item.ru_translation) {
      html += '<div class="detail-block"><h4>' + esc(L.translation) + '</h4><p>' + esc(item.ru_translation) + "</p></div>";
    }
    if (item.he_original) {
      html += '<div class="detail-block"><h4>' + esc(L.original) + '</h4><div class="quote-box" dir="rtl" lang="he">' + esc(item.he_original) + "</div></div>";
    }
    if (item.source_url) {
      html += '<p class="scam-src"><a href="' + esc(item.source_url) + '" target="_blank" rel="noopener">' + esc(L.source) + "</a></p>";
    }
    return html + "</div></article>";
  }

  function render() {
    var list = filtered();
    var box = document.getElementById("scam-feed");
    var count = document.getElementById("scam-count");
    var more = document.getElementById("scam-more");
    if (!box) return;
    box.innerHTML = list.slice(0, state.shown).map(function (it) { return card(it, state.openId === "w" + String(it.id)); }).join("");
    if (count) count.textContent = L.found + ": " + list.length;
    if (more) more.style.display = list.length > state.shown ? "" : "none";
  }

  function renderChips() {
    var counts = { all: state.items.length, sms: 0, call: 0, web: 0 };
    state.items.forEach(function (i) { if (counts[i.type] != null) counts[i.type]++; });
    var wrap = document.getElementById("scam-filters");
    if (!wrap) return;
    wrap.innerHTML = ["all", "sms", "call", "web"].map(function (t) {
      return '<button type="button" class="filter-btn' + (state.type === t ? " active" : "") + '" data-type="' + t + '">' + esc(L[t]) + " · " + counts[t] + "</button>";
    }).join("");
  }

  function ensureVisible(idStr) {
    state.type = "all"; state.q = "";
    var search = document.getElementById("scam-search");
    if (search) search.value = "";
    var idx = state.items.findIndex(function (i) { return "w" + String(i.id) === idStr; });
    if (idx >= 0) state.shown = Math.max(state.shown, idx + 1);
    state.openId = idStr;
    renderChips(); render();
    var el = document.getElementById(idStr);
    if (el) setTimeout(function () { el.scrollIntoView({ block: "start" }); el.classList.add("scam-flash"); }, 60);
  }

  function init() {
    var h = document.getElementById("archive-h");
    if (h) h.textContent = L.archive_h;
    Promise.all([
      fetch(base + "data/scams.json").then(function (r) { return r.json(); }),
      fetch(base + "data/scams_i18n.json").then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (res) {
      var data = res[0], i18n = res[1] || {};
      state.items = (data.warnings || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      state.i18n = i18n[lang] || {};
      state.todoMap = i18n["todo_" + lang] || {};
      var search = document.getElementById("scam-search");
      if (search) {
        search.placeholder = L.search_ph;
        search.addEventListener("input", function () { state.q = search.value.trim().toLowerCase(); state.shown = PAGE; render(); });
      }
      var filters = document.getElementById("scam-filters");
      if (filters) filters.addEventListener("click", function (e) {
        var b = e.target.closest("[data-type]"); if (!b) return;
        state.type = b.dataset.type; state.shown = PAGE; renderChips(); render();
      });
      var feed = document.getElementById("scam-feed");
      if (feed) feed.addEventListener("click", function (e) {
        var b = e.target.closest("[data-toggle]"); if (!b) return;
        var art = document.getElementById(b.dataset.toggle);
        var det = art && art.querySelector(".scam-detail");
        if (!det) return;
        var willOpen = det.hidden;
        det.hidden = !willOpen;
        b.setAttribute("aria-expanded", String(willOpen));
        b.textContent = (willOpen ? L.hide : L.show) + " ▾";
      });
      var more = document.getElementById("scam-more");
      if (more) more.addEventListener("click", function () { state.shown += PAGE; render(); });
      renderChips(); render();
      if (location.hash && location.hash.indexOf("#w") === 0) ensureVisible(location.hash.slice(1));
    }).catch(function () {
      var box = document.getElementById("scam-feed");
      if (box) box.innerHTML = '<p class="scam-pending">' + esc(L.failed) + "</p>";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
