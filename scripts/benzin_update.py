#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Обновление данных модуля «Цена на бензин».

Порядок источников, от главного к запасному:
  1. Расчёт из открытых данных: цена завода + акциз + маржа, всё умножить на НДС.
     Работает, когда набор данных уже содержит нужный месяц.
  2. Разбор публичной страницы с ежемесячным обзором (через читалку).
     Нужен, потому что набор данных отстаёт на несколько дней.
  3. Сохранённые значения из файла данных. Ничего не ломается, просто
     остаются прежние цифры и прежняя дата.

Никаких ключей и регистраций не нужно.
"""

import json
import os
import re
import sys
import datetime
import urllib.parse
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "data", "benzin.json")

# Заголовок только латиницей: кириллица роняет запрос
UA = {"User-Agent": "finance-portal-bot/1.0 (+https://exodus611.github.io/finance-portal/)"}

CKAN = "https://data.gov.il/api/3/action/datastore_search"
RES_CIF = "aaa40832-ac82-4c86-bac6-0d05c83f576f"   # цены на выходе завода
RES_BLO = "bdce45e7-9fe9-473e-bd51-cef1d787a951"   # акциз

NAME_CIF = "בנזין 95 אוקטן נטול עופרת במכלית"
PREFIX_BLO = "בלו בנזין ("

VAT = 0.18

HE_MONTHS = {
    1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל", 5: "מאי", 6: "יוני",
    7: "יולי", 8: "אוגוסט", 9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר",
}
RU_MONTHS = {
    1: "января", 2: "февраля", 3: "марта", 4: "апреля", 5: "мая", 6: "июня",
    7: "июля", 8: "августа", 9: "сентября", 10: "октября", 11: "ноября", 12: "декабря",
}


def log(msg):
    print("  " + msg, flush=True)


def get(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


# --------------------------------------------------------------------------
# Источник 1: открытые данные
# --------------------------------------------------------------------------

def fetch_dataset(resource_id, limit=200):
    url = "%s?resource_id=%s&limit=%d&sort=_id%%20desc" % (CKAN, resource_id, limit)
    return json.loads(get(url))["result"]["records"]


def latest_by(records, test):
    rows = [r for r in records if test(r.get("מוצר", ""))]
    rows.sort(key=lambda r: r.get("תאריך", ""), reverse=True)
    return rows[0] if rows else None


def from_open_data(target_month):
    """Считает цену по формуле. Возвращает словарь или None."""
    try:
        cif_rows = fetch_dataset(RES_CIF)
        blo_rows = fetch_dataset(RES_BLO)
    except Exception as exc:
        log("открытые данные недоступны: %s" % exc)
        return None

    cif = latest_by(cif_rows, lambda p: p == NAME_CIF)
    blo = latest_by(blo_rows, lambda p: p.startswith(PREFIX_BLO))
    if not cif or not blo:
        log("нужные строки в наборе данных не найдены")
        return None

    have_month = cif["תאריך"][:7]
    if have_month != target_month:
        log("набор данных отстаёт: есть %s, нужен %s" % (have_month, target_month))
        return None

    return {
        "cif": round(cif["מחיר"] / 1000.0, 4),
        "blo": round(blo["מחיר"] / 1000.0, 4),
        "month": have_month,
    }


# --------------------------------------------------------------------------
# Источник 2: публичная страница месячного обзора
# --------------------------------------------------------------------------

def from_monthly_page(year, month):
    """Берёт объявленную цену со страницы обзора. Возвращает словарь или None."""
    slug = "עדכון-מחירי-הדלק-לחודש-%s-%d" % (HE_MONTHS[month], year)
    url = "https://r.jina.ai/https://www.autocom.co.il/%s/" % urllib.parse.quote(slug)
    try:
        text = get(url, timeout=90)
    except Exception as exc:
        log("страница обзора недоступна: %s" % exc)
        return None

    if len(text) < 500:
        log("страница обзора вернула слишком мало текста")
        return None

    nums = [float(x) for x in re.findall(r"\b(\d\.\d\d)\b", text)]
    if not nums:
        log("на странице обзора не нашлось чисел нужного вида")
        return None

    # Первое число на странице — предельная цена при самообслуживании.
    price = nums[0]
    if not (4.0 <= price <= 15.0):
        log("первое число %s не похоже на цену литра" % price)
        return None

    # Второе число — цена в Эйлате без налога, она всегда ниже основной.
    eilat = None
    for cand in nums[1:4]:
        if 3.0 <= cand < price:
            eilat = cand
            break

    # Составляющие: акциз узнаём по совпадению с известным значением.
    parts = {}
    for cand in nums:
        if 3.5 <= cand <= 3.7:
            parts["blo"] = cand
            break

    return {"self": price, "eilat_self": eilat, "parts": parts, "url": url}


# --------------------------------------------------------------------------
# Сборка
# --------------------------------------------------------------------------

def target_period(today=None):
    """Какой месяц должен быть показан сейчас."""
    today = today or datetime.date.today()
    return "%04d-%02d" % (today.year, today.month), today.year, today.month


def build(data, today=None):
    period, year, month = target_period(today)
    log("нужный период: %s" % period)

    price_block = data["price"]
    prev_price = price_block["self"]

    result = {"source": None, "self": None, "eilat_self": None, "cif": None, "blo": None}

    # 1. открытые данные
    calc = from_open_data(period)
    if calc:
        log("открытые данные: цена завода %.4f, акциз %.4f" % (calc["cif"], calc["blo"]))
        result["cif"] = calc["cif"]
        result["blo"] = calc["blo"]
        result["source"] = "открытые данные"

    # 2. страница обзора
    page = from_monthly_page(year, month)
    if page:
        log("страница обзора: цена %.2f, Эйлат %s" % (page["self"], page["eilat_self"]))
        result["self"] = page["self"]
        result["eilat_self"] = page["eilat_self"]
        if page["parts"].get("blo") and not result["blo"]:
            result["blo"] = page["parts"]["blo"]
        if result["source"]:
            result["source"] += " и страница обзора"
        else:
            result["source"] = "страница обзора"

    # 3. ничего не вышло
    if result["self"] is None:
        log("новых значений нет, оставляем прежние")
        data.setdefault("_run", {})
        data["_run"]["last_try"] = str(today or datetime.date.today())
        data["_run"]["status"] = "прежние значения"
        return data, False

    # обновляем блок цены
    new_self = result["self"]
    if abs(new_self - prev_price) < 0.001:
        log("цена не изменилась: %.2f" % new_self)
        changed = False
    else:
        changed = True
        price_block["prev"] = prev_price
        price_block["diff"] = round(new_self - prev_price, 2)
        price_block["diff_pct"] = round((new_self / prev_price - 1) * 100, 1)

    price_block["self"] = new_self
    price_block["full"] = round(new_self + price_block["full_add"], 2)
    if result["eilat_self"]:
        price_block["eilat_self"] = result["eilat_self"]

    # разбор литра
    if result["cif"] and result["blo"]:
        cif, blo = result["cif"], result["blo"]
        vat = round(new_self - new_self / (1 + VAT), 2)
        marg = round(new_self / (1 + VAT) - cif - blo, 2)
        items = data["breakdown"]["items"]
        vals = [round(cif, 2), round(blo, 2), vat, marg]
        for item, val in zip(items, vals):
            item["val"] = val
            item["pct"] = int(round(val / new_self * 100))
        gov = round(vals[1] + vals[2], 2)
        data["breakdown"]["gov_total"] = gov
        data["breakdown"]["gov_pct"] = int(round(gov / new_self * 100))
        data["breakdown"]["gov_note"] = (
            "Из каждого литра государству уходит %s шекеля — это %d процентов цены."
            % (("%.2f" % gov).replace(".", ","), data["breakdown"]["gov_pct"])
        )

    # даты
    d = today or datetime.date.today()
    data["meta"]["updated"] = str(d)
    data["meta"]["updated_human"] = "%d %s %d" % (d.day, RU_MONTHS[d.month], d.year)

    nxt = datetime.date(year + (month == 12), (month % 12) + 1, 1) - datetime.timedelta(days=2)
    price_block["next_update"] = "около %d %s" % (nxt.day, RU_MONTHS[nxt.month])

    data.setdefault("_run", {})
    data["_run"]["last_try"] = str(d)
    data["_run"]["status"] = "обновлено"
    data["_run"]["source"] = result["source"]
    return data, changed


def main():
    log("читаем файл данных")
    with open(DATA_PATH, encoding="utf-8") as fh:
        data = json.load(fh)

    data, changed = build(data)

    with open(DATA_PATH, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)

    log("цена сейчас: %.2f" % data["price"]["self"])
    log("изменилось: %s" % ("да" if changed else "нет"))
    return 0


if __name__ == "__main__":
    sys.exit(main())