/* Блок «Внеочередные и разовые выплаты» на страницах payments.html (RU) и fr/payments.html (FR).
 *
 * Данные: data/payments_extra.json. Их САМИ обновляет workflow update-payments-extra.yml
 * (scripts/update_payments_extra.py); руками ничего править не нужно (docs/README-payments-extra.md).
 * Язык берётся из <html lang>. Одна и та же функция render() рисует блок в браузере и при сборке
 * (scripts/build_payments_extra.js вставляет готовую разметку в страницу для поисковых роботов и
 * режима без JavaScript), поэтому расхождений между ними нет.
 *
 * Жизненный цикл карточки считается здесь, по часам посетителя, без ручных правок:
 *   ожидается (дата впереди) → сегодня → [срок прошёл, 14 дней «проверьте счёт»] → следующая выплата в
 *   таком-то месяце следующего года. Если Битуах Леуми назвал точную дату, после неё сразу «выплачено».
 * Тесты: scripts/test_payments_extra.js
 */
(function () {
  "use strict";

  var DAY = 86400000;
  var GRACE_DAYS = 14;

  var I18N = {
    ru: {
      months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
      monthsNom: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
      monthsPrep: ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"],
      labels: { amount: "Сколько", when: "Когда", who: "Кому", why: "За что", how: "Как получить", source: "Источник" },
      colon: ": ",
      tags: { seniors: "Пожилым", victims: "Пострадавшим от терактов", workers: "Работающим", families: "Семьям с детьми", disabled: "Людям с инвалидностью" },
      expected: "ожидается",
      today: "сегодня",
      tomorrow: "завтра",
      thisMonth: "в этом месяце",
      open: "приём заявлений открыт",
      empty: "Сейчас нет объявленных внеочередных выплат. Следите за новостями на",
      newsLabel: "сайте Битуах Леуми",
      verified: "Проверено по сайту Битуах Леуми: ",
      scheduledNote: "Дата, сумма и условия — по официальным сообщениям Битуах Леуми. Право в вашем случае определяет Битуах Леуми."
    },
    fr: {
      months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      monthsNom: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      monthsPrep: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      labels: { amount: "Combien", when: "Quand", who: "Pour qui", why: "Pourquoi", how: "Comment l’obtenir", source: "Source" },
      colon: "\u00a0: ",
      tags: { seniors: "Seniors", victims: "Victimes d’actes hostiles", workers: "Salariés", families: "Familles avec enfants", disabled: "Personnes en situation de handicap" },
      expected: "attendu le",
      today: "aujourd’hui",
      tomorrow: "demain",
      thisMonth: "ce mois-ci",
      open: "demandes ouvertes",
      empty: "Aucun versement exceptionnel annoncé pour le moment. Suivez les annonces sur le",
      newsLabel: "site du Bitouah Leumi",
      verified: "Vérifié sur le site du Bitouah Leumi : ",
      scheduledNote: "Date, montant et conditions : d’après les communiqués officiels du Bitouah Leumi. Votre droit est fixé par le Bitouah Leumi."
    }
  };

  var NEWS_URL = "https://www.btl.gov.il/About/news/Pages/default.aspx";
  var STALE_DAYS = 60;

  // ---------------------------------------------------------------- мелкие помощники

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Ссылки только https: всё остальное (javascript:, data: и т. п.) отбрасывается.
  function safeUrl(u) {
    u = String(u == null ? "" : u);
    return /^https:\/\//i.test(u) ? u : "";
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // «2026-10-28» → локальная полночь; неверные даты вроде 2026-02-31 → null
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY); }

  function fmtShort(d) { return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear(); }

  function fmtLong(d, lang) {
    var T = I18N[lang];
    var day = (lang === "fr" && d.getDate() === 1) ? "1er" : String(d.getDate());
    return day + " " + T.months[d.getMonth()] + " " + d.getFullYear();
  }

  function cap(s) { s = String(s || ""); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function tx(obj, lang) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] != null ? obj[lang] : (obj.ru != null ? obj.ru : "");
  }

  function inDays(n, lang) {
    if (lang === "fr") return "dans " + n + " jours";
    var d10 = n % 10, d100 = n % 100;
    if (d10 === 1 && d100 !== 11) return "через " + n + " день";
    if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return "через " + n + " дня";
    return "через " + n + " дней";
  }

  // ---------------------------------------------------------------- состояние выплаты

  // Ближайшее повторение ежегодной выплаты: месяц из recurs.month, год — текущий или следующий,
  // но всегда позже уже известной даты last (иначе сразу после выплаты «следующей» стал бы тот же месяц).
  function nextOccurrence(rec, today, last) {
    var m0 = rec.month - 1;
    var y = today.getFullYear() + (m0 < today.getMonth() ? 1 : 0);
    if (last && y * 12 + m0 <= last.getFullYear() * 12 + last.getMonth()) y = last.getFullYear() + 1;
    return { month0: m0, year: y };
  }

  function withNext(st, item, today) {
    var r = item.recurs;
    if (r && typeof r.month === "number" && r.month >= 1 && r.month <= 12) st.next = nextOccurrence(r, today, st.date);
    return st;
  }

  // rank задаёт порядок на странице: ближайшие по дате → месяц → приём заявлений → срок прошёл →
  // выплачено → цикл закончен (ждём следующего года)
  function stateOf(item, today) {
    var d, n;
    var grace = item.recurs && typeof item.recurs.grace_days === "number" ? item.recurs.grace_days : GRACE_DAYS;
    var recurring = !!item.recurs;

    if (item.paid_on) {
      d = parseISO(item.paid_on);
      if (d) return withNext({ kind: "paid", date: d, rank: 4 }, item, today);
    }
    if (item.date) {
      d = parseISO(item.date);
      if (d) {
        n = daysBetween(today, d);
        if (n > 0) return { kind: "upcoming", date: d, days: n, rank: 0 };
        if (n === 0) return { kind: "today", date: d, days: 0, rank: 0 };
        // дату назвал сам Битуах Леуми — после неё деньги считаются выплаченными
        if (item.date_precision !== "expected") return withNext({ kind: "paid", date: d, rank: 4 }, item, today);
        if (-n <= grace || !recurring) return withNext({ kind: "due", date: d, rank: 3 }, item, today);
        return withNext({ kind: "cycle", date: d, rank: 5 }, item, today);
      }
    }
    if (item.month) {
      var mm = /^(\d{4})-(\d{2})$/.exec(String(item.month));
      if (mm) {
        var y = +mm[1], mo = +mm[2] - 1;
        var cur = today.getFullYear() * 12 + today.getMonth(), tgt = y * 12 + mo;
        d = new Date(y, mo, 1);
        if (tgt > cur) return { kind: "month", date: d, month: mo, year: y, current: false, rank: 1 };
        if (tgt === cur) return { kind: "month", date: d, month: mo, year: y, current: true, rank: 1 };
        var end = new Date(y, mo + 1, 0);
        var base = { date: d, month: mo, year: y, monthOnly: true };
        if (daysBetween(end, today) <= grace || !recurring) { base.kind = "due"; base.rank = 3; }
        else { base.kind = "cycle"; base.rank = 5; }
        return withNext(base, item, today);
      }
    }
    return { kind: "open", date: null, rank: 2 };
  }

  function monthLabel(next, lang) {
    var T = I18N[lang];
    return T.monthsNom[next.month0] + " " + next.year;
  }

  // Текст и цвет плашки статуса. В статичном режиме (для поисковиков) отсчёта дней нет:
  // он «замёрз» бы в момент сборки.
  function badge(st, item, lang, staticMode) {
    var T = I18N[lang];
    var fr = lang === "fr";
    var exp = item.date_precision === "expected";
    var text, cls;
    if (st.kind === "upcoming" || st.kind === "today") {
      text = (exp ? T.expected + " " : "") + fmtShort(st.date);
      if (!staticMode) {
        text += " · " + (st.kind === "today" ? T.today : (st.days === 1 ? T.tomorrow : inDays(st.days, lang)));
      }
      cls = exp ? "b-exp" : "b-up";
    } else if (st.kind === "month") {
      text = fr
        ? "attendu en " + T.monthsPrep[st.month] + " " + st.year
        : T.expected + " в " + T.monthsPrep[st.month] + " " + st.year;
      if (!staticMode && st.current) text += " · " + T.thisMonth;
      cls = "b-exp";
    } else if (st.kind === "open") {
      text = T.open;
      cls = "b-open";
    } else if (st.kind === "due") {
      text = fr
        ? "échéance : " + fmtShort(st.date) + " — vérifiez votre compte"
        : "срок выплаты: " + fmtShort(st.date) + " — проверьте счёт";
      cls = "b-due";
    } else if (st.kind === "cycle") {
      var last = st.monthOnly ? cap(T.monthsNom[st.month]) + " " + st.year : fmtShort(st.date);
      text = (fr ? "en " + st.date.getFullYear() + " : " : "в " + st.date.getFullYear() + " г.: ") + last;
      if (st.next) text += " · " + (fr ? "prochaine : " : "следующая: ") + monthLabel(st.next, lang);
      cls = "b-paid";
    } else { // paid
      text = (fr ? "versé le " : "выплачено ") + (st.date ? fmtShort(st.date) : "");
      cls = "b-paid";
    }
    return { text: text, cls: cls };
  }

  function nextLine(st, item, lang) {
    var manual = tx(item.next, lang);
    if (manual) return manual;
    if (!st.next || (st.kind !== "paid" && st.kind !== "due" && st.kind !== "cycle")) return "";
    var T = I18N[lang];
    return lang === "fr"
      ? "Prochain versement attendu en " + T.monthsPrep[st.next.month0] + " " + st.next.year + "."
      : "Следующая выплата ожидается в " + T.monthsPrep[st.next.month0] + " " + st.next.year + " года.";
  }

  // Сумма прошлого года на следующий цикл: честно говорим, что новая будет объявлена в январе.
  function amountNote(st, item, lang) {
    if (!st.next || !item.amount_since || (st.kind !== "paid" && st.kind !== "due" && st.kind !== "cycle")) return "";
    var s = parseISO(item.amount_since);
    if (!s || s.getFullYear() >= st.next.year) return "";
    return lang === "fr"
      ? "Montant de " + s.getFullYear() + " ; le montant de " + st.next.year + " est annoncé en janvier."
      : "Это сумма " + s.getFullYear() + " года; на " + st.next.year + " год Битуах Леуми объявляет новую сумму в январе.";
  }

  function whenText(item, st, lang) {
    var T = I18N[lang];
    var note = tx(item.when_note, lang);
    var base = "";
    if (item.paid_on && st.date) base = fmtLong(st.date, lang);
    else if (item.date && st.date) {
      base = fmtLong(st.date, lang);
      if (item.date_precision === "expected" && (st.kind === "upcoming" || st.kind === "today" || st.kind === "due")) {
        base += lang === "fr" ? " (date attendue)" : " (ожидаемая дата)";
      }
    } else if (item.month && st.date) {
      base = cap(T.monthsNom[st.date.getMonth()]) + " " + st.date.getFullYear();
    }
    var out = base ? (note ? base + " — " + note : base) : cap(note);
    return { main: out, next: nextLine(st, item, lang) };
  }

  // ---------------------------------------------------------------- разметка

  // Краткая сумма для свёрнутой карточки: поле amount_short; если его нет — первое предложение полного текста
  // без скобок («664 ₪ на семью (с 1 января 2026). Если…» → «664 ₪ на семью»).
  function deriveShort(text) {
    text = String(text || "");
    var m = /[.!?]\s+[A-ZА-ЯЁÀ-Ý]/.exec(text);
    var first = m ? text.slice(0, m.index + 1) : text;
    first = first.replace(/\s*\([^)]*\)/g, "").replace(/\s+,/g, ",").replace(/\s{2,}/g, " ").replace(/[.\s]+$/, "");
    if (first.length > 90) first = first.slice(0, 87).replace(/[\s,;:]+\S*$/, "") + "…";
    return first;
  }

  function shortAmount(item, lang) {
    return tx(item.amount_short, lang) || deriveShort(tx(item.amount, lang));
  }

  // Ссылка вида #extra-heating-elderly раскрывает нужную карточку (можно делиться ссылкой на конкретную выплату)
  function openFromHash(doc, hash) {
    var id = String(hash || "").replace(/^#/, "");
    if (!id || !doc || !doc.getElementById) return false;
    var el = doc.getElementById(id);
    if (el && el.tagName === "DETAILS" && /(^|\s)x-item(\s|$)/.test(el.className)) { el.open = true; return true; }
    return false;
  }

  function row(icon, label, inner) {
    return '<div class="x-r"><dt><span aria-hidden="true">' + icon + "</span> " + esc(label) + "</dt><dd>" + inner + "</dd></div>";
  }

  // Карточка — раскрывающийся блок (<details>): свёрнутой видно название, статус с датой, краткую сумму и «кому»;
  // подробности (когда, кому, за что, как получить, источник) открываются по клику.
  function card(item, st, lang, staticMode) {
    var T = I18N[lang];
    var b = badge(st, item, lang, staticMode);
    var w = whenText(item, st, lang);
    var h = [];

    var tags = "";
    var tg = item.tags || [];
    for (var i = 0; i < tg.length; i++) {
      if (T.tags[tg[i]]) tags += '<span class="x-tag">' + esc(T.tags[tg[i]]) + "</span>";
    }
    var short = shortAmount(item, lang);

    h.push('<details class="x-item x-' + esc(st.kind) + '" id="extra-' + esc(item.id) + '">');
    h.push('<summary><span class="x-ico" aria-hidden="true">' + esc(item.icon || "💶") + "</span>");
    h.push('<span class="x-ttl"><b>' + esc(tx(item.title, lang)) + "</b>");
    if (item.he) h.push('<span class="x-he" lang="he" dir="rtl">' + esc(item.he) + "</span>");
    h.push('<span class="x-sum"><span class="x-badge ' + esc(b.cls) + '">' + esc(b.text) + "</span>");
    if (short) h.push('<span class="x-short"><span aria-hidden="true">💰</span> ' + esc(short) + "</span>");
    h.push("</span>");
    if (tags) h.push('<span class="x-tags">' + tags + "</span>");
    h.push("</span></summary>");

    h.push('<div class="x-body"><dl class="x-dl">');

    var amountHtml = esc(tx(item.amount, lang));
    var an = amountNote(st, item, lang);
    if (an) amountHtml += '<div class="x-next">' + esc(an) + "</div>";
    h.push(row("💰", T.labels.amount, amountHtml));

    var whenHtml = esc(w.main);
    if (w.next) whenHtml += '<div class="x-next">' + esc(w.next) + "</div>";
    h.push(row("📅", T.labels.when, whenHtml));

    var whoList = (item.who && (item.who[lang] || item.who.ru)) || [];
    var ul = "";
    for (var j = 0; j < whoList.length; j++) ul += "<li>" + esc(whoList[j]) + "</li>";
    if (ul) h.push(row("👤", T.labels.who, '<ul class="x-ul">' + ul + "</ul>"));

    h.push(row("❓", T.labels.why, esc(tx(item.why, lang))));

    var howHtml = esc(tx(item.how, lang));
    var links = "";
    var au = item.action && safeUrl(item.action.url);
    if (au) links += '<a class="x-btn" href="' + esc(au) + '" target="_blank" rel="noopener noreferrer">' + esc(tx(item.action.label, lang)) + " →</a>";
    if (item.internal && item.internal.href && !/^[a-z]+:/i.test(item.internal.href)) {
      links += '<a class="x-link" href="' + esc(item.internal.href) + '">' + esc(tx(item.internal.label, lang)) + " →</a>";
    }
    if (links) howHtml += '<div class="x-links">' + links + "</div>";
    h.push(row("📝", T.labels.how, howHtml));

    h.push("</dl>");
    var su = item.source && safeUrl(item.source.url);
    if (su) {
      h.push('<div class="x-foot">' + esc(T.labels.source + T.colon) + '<a href="' + esc(su) + '" target="_blank" rel="noopener noreferrer">' + esc(tx(item.source.label, lang) || "btl.gov.il") + "</a></div>");
    }
    var sd = item.auto && parseISO(item.auto.source_date);
    if (sd) {
      h.push('<div class="x-auto">' + esc(lang === "fr"
        ? "🤖 Ajouté automatiquement d’après l’annonce du Bitouah Leumi du " + fmtShort(sd) + ". Vérifiez les conditions via le lien source."
        : "🤖 Добавлено автоматически из объявления Битуах Леуми от " + fmtShort(sd) + ". Сверьте условия по ссылке-источнику.") + "</div>");
    }
    h.push("</div></details>");
    return h.join("");
  }

  function verifiedAgeDays(data, today) {
    var v = parseISO(data && data.verified);
    return v ? daysBetween(v, today) : null;
  }

  // opts.static — режим сборки: без отсчёта дней и без «давно не проверялось»
  function render(data, lang, today, opts) {
    opts = opts || {};
    lang = I18N[lang] ? lang : "ru";
    var T = I18N[lang];
    today = startOfDay(today || new Date());
    var items = (data && data.items) || [];
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || !it.id) continue;
      var sf = it.show_from ? parseISO(it.show_from) : null;
      var ha = it.hide_after ? parseISO(it.hide_after) : null;
      if (sf && today < sf) continue;
      if (ha && today > ha) continue;
      rows.push({ it: it, st: stateOf(it, today), idx: i });
    }
    rows.sort(function (a, b) {
      if (a.st.rank !== b.st.rank) return a.st.rank - b.st.rank;
      var da = a.st.date ? a.st.date.getTime() : 0, db = b.st.date ? b.st.date.getTime() : 0;
      if (da !== db) return (a.st.kind === "paid" || a.st.kind === "cycle") ? db - da : da - db;
      return a.idx - b.idx;
    });

    var html = [];
    var i2;
    for (i2 = 0; i2 < rows.length; i2++) html.push(card(rows[i2].it, rows[i2].st, lang, !!opts.static));
    if (!rows.length) {
      html.push('<p class="x-empty">' + esc(T.empty) + ' <a href="' + NEWS_URL + '" target="_blank" rel="noopener noreferrer">' + esc(T.newsLabel) + "</a>.</p>");
    }

    var age = verifiedAgeDays(data, today);
    if (!opts.static && age !== null && age > STALE_DAYS) {
      var stale = lang === "fr"
        ? "Cette liste a été vérifiée il y a " + age + " jours : consultez le site du Bitouah Leumi pour les versements en cours."
        : "Список проверялся " + age + " дн. назад. Актуальные выплаты смотрите на сайте Битуах Леуми.";
      html.push('<div class="note n-warn x-stale">' + esc(stale) + ' <a href="' + NEWS_URL + '" target="_blank" rel="noopener noreferrer">btl.gov.il</a></div>');
    }
    var v = parseISO(data && data.verified);
    if (v) html.push('<p class="x-meta">' + esc(T.verified + fmtShort(v)) + ". " + esc(T.scheduledNote) + "</p>");

    return {
      html: html.join(""),
      count: rows.length,
      order: rows.map(function (r) { return r.it.id; }),
      states: rows.map(function (r) { return r.st.kind; })
    };
  }

  // ---------------------------------------------------------------- браузер

  function init() {
    var box = document.getElementById("extra-items");
    if (!box || typeof fetch !== "function") return;
    var lang = String(document.documentElement.getAttribute("lang") || "ru").toLowerCase().slice(0, 2);
    if (!I18N[lang]) lang = "ru";
    var url = (lang === "fr" ? "../" : "") + "data/payments_extra.json";
    fetch(url, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("http " + r.status)); })
      .then(function (data) { box.innerHTML = render(data, lang, new Date()).html; openFromHash(document, location.hash); })
      .catch(function () { /* остаётся готовая разметка из сборки */ });
    openFromHash(document, location.hash);
    window.addEventListener("hashchange", function () { openFromHash(document, location.hash); });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      render: render, stateOf: stateOf, badge: badge, parseISO: parseISO, daysBetween: daysBetween,
      esc: esc, safeUrl: safeUrl, inDays: inDays, fmtShort: fmtShort, fmtLong: fmtLong, I18N: I18N,
      STALE_DAYS: STALE_DAYS, GRACE_DAYS: GRACE_DAYS, nextOccurrence: nextOccurrence,
      deriveShort: deriveShort, shortAmount: shortAmount, openFromHash: openFromHash
    };
  } else if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
