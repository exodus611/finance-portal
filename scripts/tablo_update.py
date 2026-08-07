#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Обновление табло «Экономика Израиля сегодня».

Источники — только официальные и открытые, все проверены:
  • Банк Израиля, SDMX-API      — учётная ставка (прайм = ставка + 1,5%)
  • ЦБС (Ламас), открытый API   — ИПЦ (120010) и индекс строительства (200010)
  • data.gov.il / Битуах Леуми  — минимальная зарплата (XLSX)
  • ExchangeRate-API            — рыночные курсы
  • Банк Израиля, PublicApi     — официальный курс валют

ВАЖНО: к API Банка Израиля нельзя обращаться с заголовком Origin — вернёт 404.
Поэтому запросы идут отсюда, а не из браузера.

Каждый источник в своём try: падение одного не мешает остальным.
Значения проходят проверку на разумность — мусор в прод не попадёт.
"""

import datetime
import json
import pathlib
import re
import sys
import urllib.request

BASE = pathlib.Path(__file__).resolve().parent.parent
DATA = BASE / "data" / "tablo.json"

UA = {"User-Agent": "tablo-databot/1.0 (+https://exodus611.github.io/finance-portal/tablo.html; open data, 1 request per day)"}

BOI_SDMX = ("https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/"
            "BOI.STATISTICS/BR/1.0?lastNPeriods=1&format=sdmx-json")
BOI_FX = "https://boi.org.il/PublicApi/GetExchangeRates?asJson=true"
CBS_CPI = "https://api.cbs.gov.il/index/data/price?id=120010&format=json&download=false&last=1"
CBS_CONSTR = "https://api.cbs.gov.il/index/data/price?id=200010&format=json&download=false&last=1"
CBS_HOUSING = "https://api.cbs.gov.il/index/data/price?id=40010&format=json&download=false&last=1"
MARKET_FX = "https://open.er-api.com/v6/latest/ILS"
MIN_WAGE = "https://www.btl.gov.il/Mediniyut/GeneralData/Documents/sharminimum.xlsx?Web=1"

notes, warnings = [], []


def fetch(url, timeout=60, binary=False):
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=timeout).read()
    return raw if binary else raw.decode("utf-8", "replace")


def upd_boi_rate(d):
    j = json.loads(fetch(BOI_SDMX, 90))
    st = j["data"]["structure"]
    sd = st["dimensions"]["series"]
    tp = st["dimensions"]["observation"][0]["values"]
    for key, val in j["data"]["dataSets"][0]["series"].items():
        idx = [int(x) for x in key.split(":")]
        if "nominal" not in str(sd[0]["values"][idx[0]].get("name", "")).lower():
            continue
        obs = val["observations"]
        last = max(obs, key=lambda x: int(x))
        if obs[last][0] is None:
            continue
        rate = float(obs[last][0]) / 100.0
        if not (0 <= rate <= 0.25):
            raise ValueError("ставка вне разумного диапазона: %s" % rate)
        old = d["boi"]["rate"]
        if abs(rate - old) > 1e-9:
            d["boi"]["prev_rate"] = old
            d["boi"]["changed"] = datetime.date.today().isoformat()
            notes.append("Ставка БИ: %.2f%% → %.2f%%" % (old * 100, rate * 100))
        d["boi"]["rate"] = rate
        d["boi"]["prime"] = round(rate + 0.015, 4)
        d["boi"]["asof"] = tp[int(last)].get("id")
        return
    raise ValueError("номинальная ставка не найдена")


def upd_cbs(d, url, key):
    j = json.loads(fetch(url, 45))
    rec = j["month"][0]["date"][0]
    val = rec["currBase"]["value"]
    if not (50 <= val <= 300):
        raise ValueError("индекс вне диапазона: %s" % val)
    d[key].update({
        "value": val,
        "yoy": round(rec["percentYear"] / 100.0, 4),
        "mom": round(rec["percent"] / 100.0, 4),
        "period": "%s-%02d" % (rec["year"], rec["month"]),
    })
    notes.append("%s: %.1f%% годовых (%s)" % (key, rec["percentYear"], d[key]["period"]))


def upd_market_fx(d):
    j = json.loads(fetch(MARKET_FX, 45))
    rates = j.get("rates") or {}
    out = {}
    for c in ("USD", "EUR", "RUB", "UAH", "GBP"):
        v = rates.get(c)
        if v and v > 0:
            out[c] = round(1 / v, 4)      # шекелей за единицу
    if "USD" not in out or not (2 < out["USD"] < 6):
        raise ValueError("курс USD подозрителен: %s" % out.get("USD"))
    d["fx"]["prev"] = dict(d["fx"].get("market") or {})
    d["fx"]["market"] = out
    notes.append("Рыночные курсы обновлены (USD %.4f)" % out["USD"])


def upd_official_fx(d):
    j = json.loads(fetch(BOI_FX, 45))
    out = {}
    for r in j["exchangeRates"]:
        unit = r.get("unit") or 1
        out[r["key"]] = round(r["currentExchangeRate"] / unit, 4)
    if not out.get("USD"):
        raise ValueError("нет USD в ответе БИ")
    d["fx"]["official"] = out
    d["fx"]["official_date"] = j["exchangeRates"][0]["lastUpdate"][:10]
    notes.append("Официальный курс БИ на %s" % d["fx"]["official_date"])


def upd_min_wage(d):
    raw = fetch(MIN_WAGE, 90, binary=True)
    tmp = pathlib.Path("/tmp/_mw.xlsx")
    tmp.write_bytes(raw)
    import openpyxl
    ws = openpyxl.load_workbook(tmp, data_only=True).worksheets[0]
    for row in ws.iter_rows(min_row=4, max_row=8, values_only=True):
        if not row or not row[0]:
            continue
        m = re.match(r"(\d{1,2})\.(\d{2})\.(\d{4})", str(row[0]).strip())
        if not m:
            continue
        monthly, hourly = float(row[5]), float(row[4])
        if not (4000 <= monthly <= 12000):
            raise ValueError("минималка вне диапазона: %s" % monthly)
        since = "%s-%s-%02d" % (m.group(3), m.group(2), int(m.group(1)))
        if abs(monthly - d["wage"]["min_monthly"]) > 0.01:
            notes.append("Минималка: %.2f → %.2f ₪ (с %s)"
                         % (d["wage"]["min_monthly"], monthly, since))
        d["wage"].update({"min_monthly": monthly, "min_hourly": hourly, "since": since})
        return
    raise ValueError("не нашёл строку с данными")


def main():
    d = json.loads(DATA.read_text(encoding="utf-8"))

    for label, fn in (
        ("ставка Банка Израиля", lambda: upd_boi_rate(d)),
        ("ИПЦ", lambda: upd_cbs(d, CBS_CPI, "cpi")),
        ("индекс строительства", lambda: upd_cbs(d, CBS_CONSTR, "construction")),
        ("индекс цен на жильё", lambda: upd_cbs(d, CBS_HOUSING, "housing")),
        ("рыночные курсы", lambda: upd_market_fx(d)),
        ("официальный курс БИ", lambda: upd_official_fx(d)),
        ("минимальная зарплата", lambda: upd_min_wage(d)),
    ):
        try:
            fn()
        except Exception as e:
            warnings.append("%s: недоступно (%s), сохранено прежнее значение" % (label, e))

    d["updated"] = datetime.date.today().isoformat()
    d["updated_by"] = "auto"
    d["auto"] = {
        "last_run": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "ok": not warnings,
        "notes": notes,
        "warnings": warnings,
    }
    DATA.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("=== ОБНОВЛЕНО ===")
    for n in notes:
        print("  •", n)
    if warnings:
        print("=== ПРЕДУПРЕЖДЕНИЯ ===")
        for w in warnings:
            print("  !", w)
    return 1 if len(warnings) >= 5 else 0


if __name__ == "__main__":
    sys.exit(main())