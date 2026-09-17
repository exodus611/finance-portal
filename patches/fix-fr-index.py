#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Патч французской главной (fr/index.html):
1) живой календарь решений и выплат на французском (даты «31 août 2026», «dans 3 jours»),
   раньше даты и «dans 11 j.» были вписаны статично и врали (12.09 уже прошло);
2) карточки «Banque d'Israël / Essence / Inflation» — из данных, а не из разметки;
   убран статичный бейдж «🔺 +0,16 ₪ (+2,0 %)», который противоречил «7,75 ₪ (−0,50 ₪)»;
3) убраны 4 копии одного и того же скрипта;
4) исправлена русская строка в футере французской страницы
   («🇷🇺 Доступно и по-русски: полная версия сайта» → по-французски).
Запускать из корня репозитория: python3 patches/fix-fr-index.py
"""
import re, io, os

HERE = os.path.dirname(os.path.abspath(__file__))
FR_JS = io.open(os.path.join(HERE, 'fr-live-home.js'), encoding='utf-8').read()


def main(path='fr/index.html'):
    s = io.open(path, encoding='utf-8').read()
    before = len(s)

    # 1) четыре дубля -> один живой скрипт
    blocks = [m for m in re.finditer(r'<script(?![^>]*src)[^>]*>([\s\S]*?)</script>', s) if 'dec-boi-val' in m.group(1)]
    print('найдено дублей скрипта:', len(blocks))
    for m in reversed(blocks):
        s = s[:m.start()] + (FR_JS if m is blocks[0] else '') + s[m.end():]

    # 2) статичные строки календаря -> пустой контейнер
    marker = 'id="dec-calendar-list"'
    i = s.find(marker)
    assert i > 0, 'не найден контейнер календаря'
    open_end = s.find('>', i) + 1
    last_row = s.find('19.10.2026', open_end)
    assert last_row > 0, 'не найдена последняя статичная строка календаря'
    close_div = s.find('</div>', last_row) + len('</div>')
    s = s[:open_end] + '</div>' + s[close_div:]

    # 3) id для динамических частей карточек
    subs = [
        ('<span style="font-size:12px;font-weight:850;color:var(--ink)">🏦 Banque d’Israël (31.08)</span>',
         '<span style="font-size:12px;font-weight:850;color:var(--ink)" id="dec-boi-label">🏦 Banque d’Israël</span>'),
        ('<span style="font-size:9px;font-weight:800;color:var(--green);background:var(--green-light);padding:1px 5px;border-radius:4px">📉 BAISSÉE DE 0,25%</span>',
         '<span id="dec-boi-badge" style="font-size:9px;font-weight:800;color:var(--green);background:var(--green-light);padding:1px 5px;border-radius:4px">—</span>'),
        ('<span style="font-size:12px;font-weight:850;color:var(--ink)">⛽ Essence 95 (dès le 07.09)</span>',
         '<span style="font-size:12px;font-weight:850;color:var(--ink)" id="dec-fuel-label">⛽ Essence 95</span>'),
        # бейдж бензина: в исходнике внутри «+0,16 ₪ (+2,0 %)» стоят неразрывные пробелы — ловим регэкспом
        (None, None),
        ('<span style="font-size:9px;font-weight:800;color:#b45309;background:#fef3c7;padding:1px 5px;border-radius:4px">JUILLET</span>',
         '<span id="dec-cpi-badge" style="font-size:9px;font-weight:800;color:#b45309;background:#fef3c7;padding:1px 5px;border-radius:4px">—</span>'),
        # русская строка на французской странице
        ('<i style="font-style:normal">Доступно и по-русски:</i>', '<i style="font-style:normal">Aussi en russe :</i>'),
        ('>полная версия сайта</a>', '>version complète du site</a>'),
    ]
    for a, b in subs:
        if a is None:
            continue
        if a in s:
            s = s.replace(a, b)
        else:
            print('  (пропуск, не найдено):', a[:80])

    # бейдж бензина (внутри неразрывные пробелы \xa0)
    s2, n = re.subn(r'<span[^>]*>🔺[^<]*₪[^<]*</span>',
                    '<span id="dec-fuel-badge" style="font-size:9px;font-weight:800;color:var(--green);background:#eaf6f0;padding:1px 5px;border-radius:4px">—</span>', s)
    if n:
        s = s2
    else:
        print('  (пропуск): бейдж бензина не найден')

    io.open(path, 'w', encoding='utf-8').write(s)
    print('fr/index.html: %d -> %d байт (дельта %+d)' % (before, len(s), len(s) - before))

    # 4) локаль чисел в fr/salary.html (там оставался ru-RU)
    try:
        sp = 'fr/salary.html'
        t = io.open(sp, encoding='utf-8').read()
        if "toLocaleString('ru-RU'" in t:
            t = t.replace("toLocaleString('ru-RU'", "toLocaleString('fr-FR'")
            io.open(sp, 'w', encoding='utf-8').write(t)
            print('fr/salary.html: формат чисел переведён на fr-FR (запятая в десятичных, пробел в тысячах)')
    except IOError:
        pass


if __name__ == '__main__':
    main()
