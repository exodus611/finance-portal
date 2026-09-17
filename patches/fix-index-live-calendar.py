#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Патч главной страницы finance-portal:
1) живой календарь решений и выплат (раньше даты и «через N дн.» были вписаны статично и врали);
2) живые карточки «Банк Израиля / Бензин / Инфляция» из data/tablo.json и data/benzin.json
   (раньше значения и бейджи были статичными и противоречили друг другу: −0.50 ₪ и «+0.16 ₪ (+2.0%)» одновременно);
3) убраны 4 дублирующихся скрипта (оставлен один);
4) убрана meta-заглушка google-site-verification и обращение «ты» в тексте;
5) cyber.html: второй <h1> -> <h2> (два H1 на странице ломают SEO).
Запускать из корня репозитория: python3 patches/fix-index-live-calendar.py
"""
import re, sys, io, os

def patch_index(path='index.html'):
    s = io.open(path, encoding='utf-8').read()
    before = len(s)

    new_script = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'live-home.js'), encoding='utf-8').read()

    # 1) дублирующиеся скрипты с карточками: первый заменяем на живой, остальные удаляем
    blocks = [m for m in re.finditer(r'<script(?![^>]*src)[^>]*>([\s\S]*?)</script>', s) if 'dec-boi-val' in m.group(1)]
    if len(blocks) < 1:
        print('!! скрипты с dec-boi-val не найдены — патч, возможно, уже применён')
    for m in reversed(blocks):
        repl = new_script if m is blocks[0] else ''
        s = s[:m.start()] + repl + s[m.end():]

    # 2) статичные строки календаря -> пустой контейнер (наполняется из data/*.json)
    marker = 'id="dec-calendar-list"'
    i = s.find(marker)
    assert i > 0, 'не найден контейнер календаря'
    open_tag_end = s.find('>', i) + 1
    last_row = s.find('<b>19.10.2026', open_tag_end)
    assert last_row > 0, 'не найдена последняя статичная строка календаря'
    close_div = s.find('</div>', last_row) + len('</div>')
    s = s[:open_tag_end] + '</div>' + s[close_div:]

    # 3) id для динамических частей карточек
    subs = [
        ('<span style="font-size:12px;font-weight:850;color:var(--ink)">🏦 Банк Израиля (31.08)</span>',
         '<span style="font-size:12px;font-weight:850;color:var(--ink)" id="dec-boi-label">🏦 Банк Израиля</span>'),
        ('<span style="font-size:9px;font-weight:800;color:var(--green);background:var(--green-light);padding:1px 5px;border-radius:4px">📉 СНИЖЕНА НА 0.25%</span>',
         '<span id="dec-boi-badge" style="font-size:9px;font-weight:800;color:var(--green);background:var(--green-light);padding:1px 5px;border-radius:4px">—</span>'),
        ('<span style="font-size:12px;font-weight:850;color:var(--ink)">⛽ Бензин 95 (с 07.09)</span>',
         '<span style="font-size:12px;font-weight:850;color:var(--ink)" id="dec-fuel-label">⛽ Бензин 95</span>'),
        ('<span style="font-size:9px;font-weight:800;color:#c15045;background:#fdeeee;padding:1px 5px;border-radius:4px">🔺 +0.16 ₪ (+2.0%)</span>',
         '<span id="dec-fuel-badge" style="font-size:9px;font-weight:800;color:var(--green);background:#eaf6f0;padding:1px 5px;border-radius:4px">—</span>'),
        ('<span style="font-size:9px;font-weight:800;color:#b45309;background:#fef3c7;padding:1px 5px;border-radius:4px">ИЮЛЬ</span>',
         '<span id="dec-cpi-badge" style="font-size:9px;font-weight:800;color:#b45309;background:#fef3c7;padding:1px 5px;border-radius:4px">—</span>'),
        ('  <meta name="google-site-verification" content="ТВОЙ_КОД_ОТ_GOOGLE" />\n', ''),
        ('без твоего участия', 'без вашего участия'),
    ]
    for a, b in subs:
        if a in s:
            s = s.replace(a, b)
        else:
            print('  (пропуск, не найдено):', a[:70])

    io.open(path, 'w', encoding='utf-8').write(s)
    print('index.html: %d -> %d байт (дельта %+d), живых скриптов: %d'
          % (before, len(s), len(s) - before,
             len([1 for m in re.finditer(r'<script(?![^>]*src)[^>]*>', s) if 'dec-calendar-list' in s[m.start():m.start()+6000]])))


def patch_cyber(path='cyber.html'):
    s = io.open(path, encoding='utf-8').read()
    h1s = [m for m in re.finditer(r'<h1([^>]*)>', s)]
    if len(h1s) > 1:
        m = h1s[1]
        s = s[:m.start()] + '<h2' + m.group(1) + '>' + s[m.end():]
        idx = s.find('</h1>', m.start())
        s = s[:idx] + '</h2>' + s[idx + 5:]
        io.open(path, 'w', encoding='utf-8').write(s)
    print('cyber.html: H1 =', len(re.findall(r'<h1', s)), '| H2 =', len(re.findall(r'<h2', s)))


if __name__ == '__main__':
    patch_index()
    patch_cyber()
