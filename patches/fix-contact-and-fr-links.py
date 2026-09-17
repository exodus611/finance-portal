#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Два независимых исправления:

1) contact.html (RU): форма сейчас отправляет на заглушку formspree.io/f/ВСТАВЬ_СЮДА_СВОЙ_ID_ФОРМЫ
   и молча падает — человек пишет сообщение и теряет его. Добавляем настройку в одном месте
   и три режима: Formspree → e-mail → копирование текста + Telegram. Ничего не «молчит».

2) fr/*.html: ссылки ведут на русские страницы, даже когда французская версия существует
   (../salary.html, ../slovar.html, ../contact.html и т.д.). Переписываем на локальные FR-страницы,
   но только если файл fr/<имя>.html реально есть.

Запускать из корня репозитория: python3 patches/fix-contact-and-fr-links.py
"""
import glob, io, os, re

RU_SCRIPT = """<script>
/* ============ НАСТРОЙКА: одна строка ============
   1) ID формы Formspree (formspree.io, бесплатно): например 'mqkrwabc' — форма заработает сразу.
   2) либо e-mail: форма будет открывать почтовый клиент посетителя.
   3) если пусто — текст копируется в буфер, и предлагается Telegram.
   Пока не заполнено, форма не «молчит»: сообщение пользователя не теряется.
   =============================================== */
var CONTACT_FORMSPREE = '';
var CONTACT_EMAIL     = '';
var CONTACT_TELEGRAM  = 'https://t.me/recall_Israel';

(function(){
  var form = document.getElementById('feedback-form');
  if(!form) return;
  var fbBox = document.getElementById('fallback-box');
  var fbText = document.getElementById('fallback-text');
  var tg = document.getElementById('fallback-tg');
  if(tg && CONTACT_TELEGRAM){ tg.href = CONTACT_TELEGRAM; }

  function value(name){
    var el = form.querySelector('[name="'+name+'"]');
    return el ? el.value.trim() : '';
  }
  function compose(){
    return [
      'Тема: ' + value('topic'),
      value('name')  ? 'Имя: ' + value('name') : '',
      value('email') ? 'Email: ' + value('email') : '',
      'Страница: ' + (document.referrer || location.href),
      '',
      value('message')
    ].filter(Boolean).join('\\n');
  }
  function copy(text){
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).catch(function(){}); }
    else{
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try{ document.execCommand('copy'); }catch(e){}
      document.body.removeChild(t);
    }
  }
  function showFallback(msg){
    if(msg && fbText){ fbText.textContent = msg; }
    if(fbBox){ fbBox.style.display = 'block'; fbBox.scrollIntoView({behavior:'smooth', block:'center'}); }
  }

  form.addEventListener('submit', function(e){
    /* 1) Formspree настроен — отправляем по-настоящему */
    if(CONTACT_FORMSPREE){
      e.preventDefault();
      var data = new FormData(form);
      fetch('https://formspree.io/f/' + CONTACT_FORMSPREE, {method:'POST', body:data, headers:{'Accept':'application/json'}})
        .then(function(r){
          if(r.ok){ form.style.display = 'none'; document.getElementById('success-box').classList.add('show'); }
          else { showFallback('Отправка не удалась. Текст не потерян: скопируйте его и отправьте в Telegram.'); }
        })
        .catch(function(){ showFallback('Нет связи. Текст не потерян: скопируйте его и отправьте в Telegram.'); });
      return;
    }
    /* 2) указан e-mail — открываем почтовый клиент */
    if(CONTACT_EMAIL){
      e.preventDefault();
      location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent('[Сайт] ' + value('topic')) +
        '&body=' + encodeURIComponent(compose());
      return;
    }
    /* 3) ничего не настроено — копируем текст и предлагаем Telegram */
    e.preventDefault();
    copy(compose());
    if(CONTACT_TELEGRAM){ window.open(CONTACT_TELEGRAM, '_blank', 'noopener'); }
    showFallback('Ваш текст скопирован в буфер обмена: вставьте его в открывшемся Telegram.');
  });
})();
</script>"""

FALLBACK_BOX_RU = """<div id="fallback-box" class="note" style="display:none;background:#fff9e9;border-left:4px solid var(--gold);border-radius:12px;padding:14px 16px;font-size:13px">
  <b>Текст скопирован в буфер обмена.</b>
  <span id="fallback-text">Форма пока не подключена к сервису отправки — вставьте текст в наш Telegram, мы увидим сразу.</span>
  <div style="margin-top:8px"><a class="btn-ghost" id="fallback-tg" href="https://t.me/recall_Israel" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:9px 13px;font-size:13px;font-weight:800;text-decoration:none;color:var(--green)">Открыть Telegram →</a></div>
</div>
"""


def fix_ru_contact(path='contact.html'):
    s = io.open(path, encoding='utf-8').read()
    before = len(s)

    # 1) заменить обработчик отправки (он ломается на заглушке)
    blocks = [m for m in re.finditer(r'<script(?![^>]*src)[^>]*>([\s\S]*?)</script>', s) if 'feedback-form' in m.group(1)]
    if not blocks:
        print('!! не найден обработчик формы')
        return
    m = blocks[-1]
    s = s[:m.start()] + RU_SCRIPT + s[m.end():]

    # 2) блок-подстраховка после формы
    if 'fallback-box' not in s:
        anchor = '<p class="privacy-note">'
        i = s.find(anchor)
        if i > 0:
            s = s[:i] + FALLBACK_BOX_RU + s[i:]
        else:
            print('!! не найден якорь для блока-подстраховки')

    # 3) честная сноска про данные
    old_note = 'Форма работает через сторонний сервис Formspree. Мы не храним ваши данные на своей стороне — сообщение просто пересылается нам на почту.'
    new_note = 'Сообщение уходит либо через сервис отправки форм, либо открывается в вашем почтовом клиенте, либо копируется в буфер обмена с подсказкой, куда его отправить. Данные на нашей стороне не хранятся.'
    if old_note in s:
        s = s.replace(old_note, new_note)

    io.open(path, 'w', encoding='utf-8').write(s)
    print('contact.html: %d -> %d байт' % (before, len(s)))


def fix_fr_links():
    fr_pages = {os.path.basename(p) for p in glob.glob('fr/*.html')}
    total = 0
    for p in sorted(glob.glob('fr/*.html')):
        s = io.open(p, encoding='utf-8').read()
        orig = s
        # ../name.html  ->  name.html, если французская страница существует
        for name in sorted(fr_pages):
            s = s.replace('href="../' + name + '"', 'href="' + name + '"')
            s = s.replace('href="../' + name + '#', 'href="' + name + '#')
        # ссылки на переводы, которых пока нет, помечаем «(en russe)» один раз на ссылку
        def mark(m):
            href, text = m.group(1), m.group(2)
            if 'en russe' in text or 'RU' in text:
                return m.group(0)
            target = os.path.basename(href)
            if href.startswith('../') and target not in fr_pages:
                return m.group(0).replace('>' + text + '<', '>' + text + ' <i style="font-style:normal;font-weight:600;opacity:.7">(en russe)</i><')
            return m.group(0)
        s = re.sub(r'<a[^>]+href="(\.\./[^"#]+\.html)"[^>]*>([^<]{2,70})</a>', mark, s)
        if s != orig:
            io.open(p, 'w', encoding='utf-8').write(s)
            total += 1
    print('FR-страниц обновлено по ссылкам:', total)


if __name__ == '__main__':
    fix_ru_contact()
    fix_fr_links()
