/* Виджет «Проверь продукт на отзыв» для вашего сайта.
   ПОДКЛЮЧЕНИЕ НА ОСНОВНОМ САЙТЕ (GitHub Pages, другой репозиторий — CORS открыт у Pages):
   <div id="otzyvy-widget"></div>
   <script src="/js/otzyvy-widget.js"
           data-src="https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО_БОТА/otzyvy.json"
           data-base="https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО_БОТА/"
           data-bot="https://t.me/otzyv_israel"></script>
   data-src  — URL к otzyvy.json (публикуется ботом автоматически)
   data-base — URL каталога карточек
   data-bot  — ссылка на бота (необязательно)
   Свой домен: добавьте в site/CNAME поддомен (например otzyvy.vashsite.ru) + CNAME-запись в DNS */
(function () {
  var s = document.currentScript;
  var dataUrl = s.getAttribute('data-src') || 'otzyvy.json';
  var base = s.getAttribute('data-base') || '';
  var bot = s.getAttribute('data-bot') || '';
  var host = document.getElementById('otzyvy-widget');
  if (!host) { host = document.createElement('div'); (s.parentNode || document.body).insertBefore(host, s); }
  host.style.cssText = 'max-width:680px;margin:18px 0;font-family:inherit;';

  function el(t, st, tx) { var e = document.createElement(t); e.style.cssText = st; if (tx) e.textContent = tx; return e; }

  var box = el('div', 'background:#fff;border:2px solid #1d4ed8;border-radius:14px;padding:16px;box-sizing:border-box;');
  box.appendChild(el('div', 'font-size:18px;font-weight:700;margin-bottom:4px;', '🚨 Проверьте продукт на отзыв'));
  box.appendChild(el('div', 'font-size:13px;color:#5a6b7c;margin-bottom:10px;',
    'Введите название или штрих-код с упаковки. База отзывов Израиля на русском, обновляется автоматически.'));
  var input = el('input', 'width:100%;box-sizing:border-box;font-size:16px;padding:10px 12px;border:2px solid #cbd5e1;border-radius:10px;');
  input.type = 'search';
  input.placeholder = 'например: нутрилон, тхина, 7290019056096';
  box.appendChild(input);
  var out = el('div', 'margin-top:10px;');
  box.appendChild(out);
  var foot = el('div', 'font-size:12px;color:#5a6b7c;margin-top:8px;');
  box.appendChild(foot);
  host.appendChild(box);

  var DATA = null;
  fetch(dataUrl).then(function (r) { return r.json(); }).then(function (d) {
    DATA = d;
    foot.innerHTML = 'В базе отзывов: <b>' + d.length + '</b>' + (bot ? ' · <a href="' + bot + '" style="color:#1d4ed8;">подписаться на пуши в Telegram</a>' : '');
    if (input.value) filter();
  }).catch(function () {
    foot.textContent = 'База временно недоступна.';
  });

  function filter() {
    var q = input.value.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!q || !DATA) { out.innerHTML = ''; return; }
    var hits = DATA.filter(function (c) {
      var hay = (c.title + ' ' + c.product + ' ' + c.brands + ' ' + c.reason).toLowerCase();
      if (hay.indexOf(q) >= 0) return true;
      var digits = q.replace(/\D/g, '');
      if (digits.length >= 8) {
        for (var i = 0; i < c.barcodes.length; i++) if (c.barcodes[i].indexOf(digits) >= 0) return true;
      }
      return false;
    }).slice(0, 8);
    if (!hits.length) {
      out.innerHTML = '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:10px 12px;font-size:14px;">✅ По запросу «' + q + '» отзывов в базе нет. Если продукт куплен давно, сверьте партию/срок по ссылке в карточках.</div>';
      return;
    }
    var h = '';
    hits.forEach(function (c) {
      h += '<div style="border-bottom:1px solid #e8edf2;padding:8px 2px;font-size:14px;">'
        + (c.baby ? '👶 ' : '🚨 ') + '<b>' + c.title + '</b>'
        + '<div style="color:#5a6b7c;font-size:12.5px;margin-top:2px;">' + c.reason + ' · ' + c.date + ' · ' + c.source + '</div>'
        + (base ? '<a href="' + base + c.file + '" style="color:#1d4ed8;font-size:13px;">подробнее →</a>' : '')
        + '</div>';
    });
    out.innerHTML = '<div style="background:#fff1f0;border:1px solid #fca5a5;border-radius:10px;padding:6px 12px;">' + h + '</div>';
  }
  input.addEventListener('input', filter);
})();
