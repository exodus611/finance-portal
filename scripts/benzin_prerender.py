#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Вставляет значения из файла данных прямо в разметку, между парными
маркерами. Нужно, чтобы поисковый робот видел цифры сразу, не дожидаясь
исполнения сценариев.

Замена идёт только по точным маркерам, поэтому повторный запуск даёт
тот же результат и файл не растёт.
"""

import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(BASE, "benzin.html")
DATA = os.path.join(BASE, "data", "benzin.json")


def pick(obj, path):
    cur = obj
    for part in path.split("."):
        if cur is None:
            return None
        cur = cur[part] if not part.isdigit() else cur[int(part)]
    return cur


def main():
    with open(DATA, encoding="utf-8") as fh:
        data = json.load(fh)
    with open(HTML, encoding="utf-8") as fh:
        html = fh.read()

    before = len(html)
    count = 0

    def repl(match):
        nonlocal count
        path = match.group(1)
        value = pick(data, path)
        if value is None:
            return match.group(0)
        count += 1
        return '<!--pr:%s-->%s<!--/pr-->' % (path, value)

    # Уже размеченные места обновляем по существующим маркерам
    html = re.sub(r'<!--pr:([a-zA-Z0-9_.]+)-->.*?<!--/pr-->', repl, html, flags=re.S)

    # Атрибуты, которые ещё не размечены, оборачиваем один раз
    def wrap(match):
        nonlocal count
        whole, attr, path = match.group(0), match.group(1), match.group(2)
        if "<!--pr:" in whole:
            return whole
        value = pick(data, path)
        if value is None:
            return whole
        count += 1
        return '%s<!--pr:%s-->%s<!--/pr-->' % (whole, path, value)

    html = re.sub(r'(<[a-z0-9]+[^>]*data-fill="([a-zA-Z0-9_.]+)"[^>]*>)(?!<!--pr:)', wrap, html)

    with open(HTML, "w", encoding="utf-8") as fh:
        fh.write(html)

    print("  подставлено значений: %d" % count)
    print("  размер разметки: %d -> %d" % (before, len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())