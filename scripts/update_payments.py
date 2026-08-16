#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Автообновление дат выплат Битуах леуми на текущий месяц.

Источник: официальная страница расписания выплат
https://www.btl.gov.il/Pages/BenefitsPaymentDates.aspx

Страница даёт три строки на текущий месяц:
  - מועד דיווח ותשלום דמי ביטוח (взносы для самозанятых/работодателей)
  - קצבת ילדים (пособие на детей)
  - קצבאות ארוכות מועד (старость, инвалидность и другие "длинные" пособия)

Дмей автала (пособие по безработице) на этой странице отдельной строкой
не публикуется — по официальному правилу выплачивается 12-го числа или
рядом с этим числом, поэтому вычисляется отдельно с переносом на более
ранний будний день, если 12-е выпадает на пятницу/субботу.
"""

import json
import os
import re
import sys
import urllib.request
from datetime import date, timedelta

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "data", "payments.json")

URL = "https://www.btl.gov.il/Pages/BenefitsPaymentDates.aspx"
UA = {
    "User-Agent": (
        "finance-portal-payments-bot/1.0 "
        "(+https://exodus611.github.io/finance-portal/; "
        "informational aggregator of official Bituach Leumi payment dates, 1 request per day)"
    )
}

LABELS = {
    "self_employed": "דיווח ותשלום דמי ביטוח",
    "children": "קצבת ילדים",
    "long_term": "קצבאות ארוכות מועד",
}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_tags(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def extract_date_after(text, label):
    """
    Ищет label, а после него ближайшее вхождение "מועד התשלום: DD/MM/YYYY"
    в пределах разумного окна символов (страница может менять вёрстку).
    """
    idx = text.find(label)
    if idx == -1:
        return None
    window = text[idx: idx + 200]
    m = re.search(r"מועד התשלום:?\s*(\d{2})/(\d{2})/(\d{4})", window)
    if not m:
        m = re.search(r"(\d{2})/(\d{2})/(\d{4})", window)
    if not m:
        return None
    d, mo, y = m.groups()
    return "%s-%s-%s" % (y, mo, d)


def compute_unemployment_date(year, month):
    """12-е число, с переносом на более ранний будний день при выходных."""
    d = date(year, month, 12)
    while d.weekday() in (4, 5):  # 4=пятница, 5=суббота
        d -= timedelta(days=1)
    return d.isoformat()


def main():
    today = date.today()

    try:
        html = fetch(URL)
    except Exception as exc:
        print("Не удалось получить страницу Битуах леуми:", exc)
        return 0  # не роняем весь workflow из-за сетевого сбоя

    text = strip_tags(html)

    result = {}
    for key, label in LABELS.items():
        d = extract_date_after(text, label)
        if d:
            result[key] = d
            print("  %s -> %s" % (key, d))
        else:
            print("  %s -> не найдено на странице" % key)

    # Если не удалось найти ни одной даты — вероятно, страница сменила
    # структуру. Не перезаписываем старые данные плейсхолдерами.
    if not result:
        print("Не удалось разобрать ни одной даты — файл не трогаем.")
        return 0

    result["unemployment"] = compute_unemployment_date(today.year, today.month)
    result["month_label"] = today.strftime("%Y-%m")
    result["updated"] = today.isoformat()
    result["source_url"] = URL

    with open(DATA_PATH, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)

    print("Записано в", DATA_PATH)
    return 0


if __name__ == "__main__":
    sys.exit(main())
