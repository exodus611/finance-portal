#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Подставляет значения из файла данных прямо в разметку, между парными
маркерами, чтобы поисковый робот видел цифры сразу.

Замена идёт только по точным маркерам, поэтому повторный запуск даёт
тот же результат и файл не растёт.
"""

import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(BASE, "dira.html")
DATA = os.path.join(BASE, "data", "dira.json")


def pick(obj, path):
    cur = obj
    for part in path.split("."):
        if cur is None:
            return None
        cur = cur[int(part)] if part.isdigit() else cur.get(part)
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
        value = pick(data, match.group(1))
        if value is None:
            return match.group(0)
        count += 1
        return "<!--pr:%s-->%s<!--/pr-->" % (match.group(1), value)

    html = re.sub(r"<!--pr:([a-zA-Z0-9_.]+)-->.*?<!--/pr-->", repl, html, flags=re.S)

    def wrap(match):
        nonlocal count
        whole, path = match.group(0), match.group(2)
        if "<!--pr:" in whole:
            return whole
        value = pick(data, path)
        if value is None:
            return whole
        count += 1
        return "%s<!--pr:%s-->%s<!--/pr-->" % (whole, path, value)

    html = re.sub(r'(<[a-z0-9]+[^>]*data-fill="([a-zA-Z0-9_.]+)"[^>]*>)(?!<!--pr:)', wrap, html)

    with open(HTML, "w", encoding="utf-8") as fh:
        fh.write(html)

    print("  подставлено значений: %d" % count)
    print("  размер разметки: %d -> %d" % (before, len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())