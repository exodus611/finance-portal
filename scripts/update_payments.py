#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Автообновление дат выплат Битуах леуми на текущий месяц.

Источник: официальная страница расписания выплат
https://www.btl.gov.il/Pages/BenefitsPaymentDates.aspx

Страница даёт четыре даты на текущий месяц:
  - דמי אבטלה והבטחת הכנסה      — пособие по безработице и гарантия дохода
  - מועד דיווח ותשלום דמי ביטוח  — взносы для самозанятых и работодателей
  - קצבת ילדים                   — пособие на детей
  - קצבאות ארוכות מועד           — «длинные» пособия одной датой, внутри 11 видов:
      אזרח ותיק, שארים, נכות, ילד נכה, שירותים מיוחדים, ניידות,
      נפגעי עבודה, מזונות, שיקום, סיעוד, אסירי ציון

Раньше дата авталы вычислялась формулой (12-е с переносом назад), хотя она
есть прямо на странице отдельной строкой. Теперь читаем её из источника,
а формула осталась только как запасной вариант, если строку не нашли.

Правило безопасности: если не удалось разобрать ни одной даты — старый файл
не трогаем, чтобы не затереть верные данные мусором.
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

# Ключ -> ивритская подпись на официальной странице
LABELS = {
    "unemployment": "דמי אבטלה והבטחת הכנסה",
    "self_employed": "דיווח ותשלום דמי ביטוח",
    "children": "קצבת ילדים",
    "long_term": "קצבאות ארוכות מועד",
}

# Что именно входит в «длинные пособия» — их платят одной датой.
# Нужно, чтобы на сайте показать человеку конкретно его пособие, а не
# абстрактную строчку «длинные пособия».
LONG_TERM_ITEMS = [
    {"ru": "Пособие по старости", "he": "קצבת אזרח ותיק"},
    {"ru": "Пособие по потере кормильца", "he": "קצבת שארים"},
    {"ru": "Пособие по инвалидности", "he": "קצבת נכות"},
    {"ru": "Пособие на ребёнка-инвалида", "he": "קצבת ילד נכה"},
    {"ru": "Особые услуги для тяжёлых инвалидов", "he": "שירותים מיוחדים"},
    {"ru": "Пособие на передвижение", "he": "קצבת ניידות"},
    {"ru": "Пострадавшим на производстве", "he": "נפגעי עבודה"},
    {"ru": "Алименты", "he": "מזונות"},
    {"ru": "Реабилитация", "he": "שיקום"},
    {"ru": "Уход (сиюд)", "he": "סיעוד"},
    {"ru": "Узники Сиона", "he": "אסירי ציון"},
]


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_tags(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&nbsp;|&#160;", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def data_block(text):
    """
    Отрезает служебную часть страницы (меню, навигация, скрипты) и оставляет
    только блок с датами текущего месяца. Без этого поиск подписей цеплялся
    за пункты бокового меню, которые идут раньше по коду, и даты терялись.
    """
    idx = text.find("נתונים עבור חודש")
    if idx == -1:
        return text
    return text[idx: idx + 1200]


def extract_date_after(text, label):
    """Ищет подпись, а сразу после неё — дату вида DD/MM/YYYY."""
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
    """Запасной расчёт: 12-е число, с переносом на более ранний будний день."""
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

    text = data_block(strip_tags(html))

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

    # Автала есть на странице отдельной строкой; формула — только запасной путь.
    if "unemployment" not in result:
        result["unemployment"] = compute_unemployment_date(today.year, today.month)
        print("  unemployment -> посчитано формулой (на странице не нашли)")

    result["long_term_items"] = LONG_TERM_ITEMS
    result["month_label"] = today.strftime("%Y-%m")
    result["updated"] = today.isoformat()
    result["source_url"] = URL

    with open(DATA_PATH, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)

    print("Записано в", DATA_PATH)
    return 0


if __name__ == "__main__":
    sys.exit(main())
