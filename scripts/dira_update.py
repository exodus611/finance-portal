#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Обновление данных модуля «Дира бе-ханаха».

Источники, оба государственные и с машинным доступом:
  A. Реестр проектов министерства строительства (карта проектов).
     Даёт: города, число квартир, цены за метр, стадию проекта, даты записи.
  B. Сводка розыгрышей на портале открытых данных.
     Даёт: архив результатов, число заявок и квартир по каждому розыгрышу.

Если источник недоступен, прежние данные сохраняются, страница не ломается.
Даты текущего розыгрыша ведутся вручную в файле данных: в открытых
источниках их нет.
"""

import datetime
import json
import os
import sys
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "data", "dira.json")

# Заголовок только латиницей: кириллица роняет запрос
UA = {"User-Agent": "finance-portal-bot/1.0 (+https://exodus611.github.io/finance-portal/)"}

ARCGIS = ("https://services6.arcgis.com/I08Ekaykft5ELucH/arcgis/rest/services/"
          "GIS_Dira/FeatureServer/2/query")
CKAN = "https://data.gov.il/api/3/action/datastore_search"
RES_LOTTERIES = "7c8255d0-49ef-49db-8904-4cf917586031"

STATUS_RESULTS = "התפרסמו תוצאות הגרלה"
STATUS_CLOSED = "ההרשמה נסגרה"
STATUS_SOON_DEV = "טרם נפתחה הרשמה - נבחר יזם"
STATUS_SOON_NODEV = "טרם נפתחה הרשמה - טרם נבחר יזם"

ARCHIVE_YEARS = 5
MIN_UNITS_FOR_CITY = 150   # города с меньшим числом квартир в сводку не берём

RU_MONTHS = {1: "января", 2: "февраля", 3: "марта", 4: "апреля", 5: "мая", 6: "июня",
             7: "июля", 8: "августа", 9: "сентября", 10: "октября", 11: "ноября", 12: "декабря"}


def log(msg):
    print("  " + msg, flush=True)


def get(url, timeout=90):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def num(v):
    """Число из значения, которое может прийти строкой с запятыми."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    try:
        return float(str(v).replace(",", "").strip())
    except ValueError:
        return None


def to_date(ms):
    if not ms:
        return None
    try:
        return datetime.datetime.fromtimestamp(ms / 1000, datetime.UTC).strftime("%Y-%m-%d")
    except Exception:
        return None


# --------------------------------------------------------------------------
# Источник A: реестр проектов
# --------------------------------------------------------------------------

def fetch_projects():
    rows, offset = [], 0
    fields = ("ActiveProjectId,ProjectName,LamasName,Neighborhood,HousingUnits,"
              "PriceForMeter,GrantAmount,MarketingStatus,MarketingMethod,"
              "StartSignupDate,EndSignupDate,LotteryId,ProviderName")
    while True:
        url = ("%s?where=1%%3D1&outFields=%s&f=json&resultRecordCount=1000&resultOffset=%d"
               % (ARCGIS, fields, offset))
        data = json.loads(get(url))
        feats = data.get("features", [])
        rows += [f["attributes"] for f in feats]
        if len(feats) < 1000:
            break
        offset += 1000
    if not rows:
        raise ValueError("реестр проектов вернул пустой список")
    return rows


def build_future(rows, ru_names):
    """Города, где проекты ещё не выходили на запись."""
    soon = [r for r in rows if r.get("MarketingStatus") in (STATUS_SOON_DEV, STATUS_SOON_NODEV)]
    agg = {}
    for r in soon:
        city = (r.get("LamasName") or "").strip()
        if not city:
            continue
        a = agg.setdefault(city, {"projects": 0, "units": 0.0, "dev": 0, "prices": []})
        a["projects"] += 1
        a["units"] += num(r.get("HousingUnits")) or 0
        if r["MarketingStatus"] == STATUS_SOON_DEV:
            a["dev"] += 1
        price = num(r.get("PriceForMeter"))
        if price:
            a["prices"].append(price)

    out = []
    for city, a in agg.items():
        if a["units"] <= 0:
            continue
        out.append({
            "city": ru_names.get(city, city),
            "city_he": city,
            "projects": a["projects"],
            "units": int(a["units"]),
            "developer_chosen": a["dev"],
            "price_per_meter": round(sum(a["prices"]) / len(a["prices"])) if a["prices"] else None,
        })
    out.sort(key=lambda x: -x["units"])
    return out


def count_live(rows, today):
    """Сколько проектов сейчас на приёме заявок и сколько ждут розыгрыша."""
    open_now = 0
    for r in rows:
        start, end = to_date(r.get("StartSignupDate")), to_date(r.get("EndSignupDate"))
        if start and end and start <= today <= end:
            open_now += 1
    closed = [r for r in rows if r.get("MarketingStatus") == STATUS_CLOSED]
    closed_units = int(sum(num(r.get("HousingUnits")) or 0 for r in closed))
    return open_now, len(closed), closed_units


# --------------------------------------------------------------------------
# Источник B: сводка розыгрышей
# --------------------------------------------------------------------------

def fetch_lotteries():
    rows, offset = [], 0
    while True:
        url = "%s?resource_id=%s&limit=1000&offset=%d" % (CKAN, RES_LOTTERIES, offset)
        result = json.loads(get(url))["result"]
        rows += result["records"]
        offset += 1000
        if offset >= result["total"]:
            break
    if not rows:
        raise ValueError("сводка розыгрышей вернула пустой список")
    return rows


def build_archive(rows, ru_names, today):
    """Сводка по городам и годам за последние несколько лет."""
    # включаем ARCHIVE_YEARS полных прошлых лет плюс текущий
    first_year = int(today[:4]) - ARCHIVE_YEARS
    by_city, by_year = {}, {}

    for r in rows:
        date = r.get("LotteryExecutionDate")
        if not (isinstance(date, str) and len(date) >= 4):
            continue
        year = int(date[:4])
        if year < first_year:
            continue

        units = num(r.get("LotteryHousingUnits")) or 0
        subs = num(r.get("Subscribers")) or 0
        price = num(r.get("PriceForMeter"))
        city = (r.get("LamasName") or "").strip()

        y = by_year.setdefault(year, {"lotteries": 0, "units": 0.0, "apps": 0.0, "cities": set()})
        y["lotteries"] += 1
        y["units"] += units
        y["apps"] += subs
        if city:
            y["cities"].add(city)

        if city:
            c = by_city.setdefault(city, {"lotteries": 0, "units": 0.0, "apps": 0.0, "prices": []})
            c["lotteries"] += 1
            c["units"] += units
            c["apps"] += subs
            if price:
                c["prices"].append(price)

    cities = []
    for city, a in by_city.items():
        if a["units"] < MIN_UNITS_FOR_CITY:
            continue
        cities.append({
            "city": ru_names.get(city, city),
            "city_he": city,
            "lotteries": a["lotteries"],
            "units": int(a["units"]),
            "applications": int(a["apps"]),
            "per_unit": round(a["apps"] / a["units"]) if a["units"] else None,
            "price_per_meter": round(sum(a["prices"]) / len(a["prices"])) if a["prices"] else None,
        })
    cities.sort(key=lambda x: x["per_unit"] or 10 ** 9)

    years = []
    for year in sorted(by_year):
        a = by_year[year]
        years.append({
            "year": year,
            "lotteries": a["lotteries"],
            "units": int(a["units"]),
            "applications": int(a["apps"]),
            "per_unit": round(a["apps"] / a["units"]) if a["units"] else None,
            "cities": len(a["cities"]),
        })
    return cities, years


# --------------------------------------------------------------------------
# Сборка
# --------------------------------------------------------------------------

def main():
    log("читаем файл данных")
    with open(DATA_PATH, encoding="utf-8") as fh:
        data = json.load(fh)

    # словарь названий городов накапливается в самом файле данных
    ru_names = data.get("_city_names", {})
    today = datetime.date.today().isoformat()
    notes, warnings = [], []

    # источник A
    try:
        projects = fetch_projects()
        log("реестр проектов: %d записей" % len(projects))
        future = build_future(projects, ru_names)
        open_now, closed_n, closed_u = count_live(projects, today)
        data["future"]["cities"] = future
        data["future"]["total_units"] = sum(c["units"] for c in future)
        data["future"]["total_projects"] = sum(c["projects"] for c in future)
        data["future"]["total_cities"] = len(future)
        data["live"]["open_projects"] = open_now
        data["live"]["closed_projects"] = closed_n
        data["live"]["closed_units"] = closed_u
        notes.append("Реестр проектов: %d записей, %d городов в подготовке."
                     % (len(projects), len(future)))
    except Exception as exc:
        warnings.append("Реестр проектов недоступен (%s). Прежние данные сохранены." % exc)
        log("реестр проектов недоступен: %s" % exc)

    # источник B
    try:
        lotteries = fetch_lotteries()
        log("сводка розыгрышей: %d записей" % len(lotteries))
        cities, years = build_archive(lotteries, ru_names, today)
        if cities:
            data["archive"]["cities"] = cities
        if years:
            data["archive"]["years"] = years
        notes.append("Сводка розыгрышей: %d записей, %d городов в архиве."
                     % (len(lotteries), len(cities)))
    except Exception as exc:
        warnings.append("Сводка розыгрышей недоступна (%s). Прежние данные сохранены." % exc)
        log("сводка розыгрышей недоступна: %s" % exc)

    d = datetime.date.today()
    data["meta"]["updated"] = today
    data["meta"]["updated_human"] = "%d %s %d" % (d.day, RU_MONTHS[d.month], d.year)
    data["_run"] = {
        "last_run": datetime.datetime.now().isoformat(timespec="seconds"),
        "ok": not warnings,
        "notes": notes,
        "warnings": warnings,
    }

    with open(DATA_PATH, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)

    log("готово. предупреждений: %d" % len(warnings))
    for w in warnings:
        log("  " + w)
    return 0


if __name__ == "__main__":
    sys.exit(main())