#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Переписывает статичный текст блока «Выплаты» на главной странице (index.html)
данными из data/payments.json — чтобы поисковый робот видел актуальные даты
сразу в HTML, а не только после выполнения JS.

В отличие от avtala_prerender.py / arnona_prerender.py (которые работают по
атрибуту data-fill), здесь чинится набор конкретных заранее известных id —
формат блока другой, поэтому и подход попроще: точечная замена содержимого
между открывающим и закрывающим тегом нужного id.

Идемпотентно: повторный запуск с теми же данными не меняет файл.
"""

import json
import os
import re
import sys
from datetime import date

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(BASE, "index.html")
DATA = os.path.join(BASE, "data", "payments.json")

MONTHS_RU = [
    "январе", "феврале", "марте", "апреле", "мае", "июне",
    "июле", "августе", "сентябре", "октябре", "ноябре", "декабре",
]

# id в HTML -> ключ в payments.json
FIELD_MAP = {
    "pay-children": "children",
    "pay-unemployment": "unemployment",
    "pay-self-employed": "self_employed",
    "pay-long-term": "long_term",
}


def dd_mm(iso):
    """'2026-08-20' -> '20.08'"""
    if not iso:
        return None
    y, m, d = iso.split("-")
    return "%s.%s" % (d, m)


def replace_span_text(html, span_id, new_text):
    """
    Заменяет текст внутри <span ... id="span_id" ...>СТАРЫЙ ТЕКСТ</span>
    на новый, не трогая остальные атрибуты тега.
    """
    pattern = re.compile(
        r'(<span\b[^>]*\bid="%s"[^>]*>)([^<]*)(</span>)' % re.escape(span_id)
    )
    new_html, count = pattern.subn(
        lambda m: m.group(1) + new_text + m.group(3), html, count=1
    )
    return new_html, count


def main():
    with open(DATA, encoding="utf-8") as fh:
        data = json.load(fh)
    with open(HTML, encoding="utf-8") as fh:
        html = fh.read()

    before = len(html)
    changed = 0

    for span_id, key in FIELD_MAP.items():
        val = dd_mm(data.get(key))
        if not val:
            continue
        # для длинных пособий сохраняем звёздочку-сноску, если она была
        suffix = "*" if span_id == "pay-long-term" else ""
        html, count = replace_span_text(html, span_id, val + suffix)
        changed += count

    month_label = data.get("month_label")
    if month_label:
        y, m = month_label.split("-")
        label_text = "в %s %s" % (MONTHS_RU[int(m) - 1], y)
        html, count = replace_span_text(html, "pay-month-label", label_text)
        changed += count

    with open(HTML, "w", encoding="utf-8") as fh:
        fh.write(html)

    print("  заменено полей: %d" % changed)
    print("  размер разметки: %d -> %d" % (before, len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
