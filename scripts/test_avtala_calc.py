#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тесты расчёта пособия. Гоняются в CI на каждый коммит.
Эталон — официальный пример Коль Зхут и данные ynet за 2026 год.
"""

import json
import pathlib
import sys

D = json.loads((pathlib.Path(__file__).resolve().parent.parent /
                "data" / "avtala.json").read_text(encoding="utf-8"))


def daily(avg, under28):
    prev = total = 0.0
    for b in D["brackets"]:
        if avg <= prev:
            break
        part = min(avg, b["upto"]) - prev
        total += part * (b["rate_under28"] if under28 else b["rate_28plus"])
        prev = b["upto"]
    return total


def max_days(age, dep):
    for r in D["days_table"]:
        if r["age_from"] <= age < r["age_to"] and dep >= r["dependents_min"]:
            return r["days"]
    return D["days_table"][-1]["days"]


def capped(avg, under28, first_period=True):
    c = D["caps"]["daily_first_period"] if first_period else D["caps"]["daily_after_125"]
    return min(daily(avg, under28), c)


FAILED = []


def check(name, got, want, tol=0.02):
    ok = abs(got - want) <= tol
    print(("  ✓ " if ok else "  ✗ ") + name + ": получено %.2f, ожидалось %.2f" % (got, want))
    if not ok:
        FAILED.append(name)


def check_eq(name, got, want):
    ok = got == want
    print(("  ✓ " if ok else "  ✗ ") + name + ": получено %s, ожидалось %s" % (got, want))
    if not ok:
        FAILED.append(name)


print("ЭТАЛОННЫЙ ПРИМЕР (Коль Зхут: 35 лет, 500 ₪/день)")
# 207.5*0.8 + 103.5*0.5 + 104*0.45 + 85*0.3 = 166 + 51.75 + 46.8 + 25.5
check("дневное пособие", daily(500, False), 290.05)

print("\nСВЕРКА С ynet (28+, месячные суммы при 25 рабочих днях)")
check("зарплата 20 000 ₪/мес", capped(20000 / 25, False) * 25, 9501.25, tol=2)
check("зарплата 25 000 ₪/мес", capped(25000 / 25, False) * 25, 11001.25, tol=2)
check("потолок достигается при 34 225 ₪/мес", capped(34225 / 25, False), 550.75, tol=0.02)
check("выше потолка не растёт (60 000 ₪/мес)", capped(60000 / 25, False), 550.76)

print("\nПОНИЖЕННЫЕ СТАВКИ ДО 28 ЛЕТ")
# 207.5*0.6 + 103.5*0.4 + 104*0.35 + 85*0.25 = 124.5 + 41.4 + 36.4 + 21.25
check("25 лет, 500 ₪/день", daily(500, True), 223.55)
assert daily(500, True) < daily(500, False), "младше 28 должно быть меньше"
print("  ✓ до 28 лет ставка ниже, чем после")

print("\nСНИЖЕНИЕ ПОСЛЕ 125-го ДНЯ")
check("высокая зарплата, первые 125 дней", capped(2000, False, True), 550.76)
check("высокая зарплата, после 125 дней", capped(2000, False, False), 367.17)

print("\nЧИСЛО ДНЕЙ ПО ВОЗРАСТУ И ИЖДИВЕНЦАМ")
check_eq("22 года, без иждивенцев", max_days(22, 0), 50)
check_eq("22 года, трое иждивенцев", max_days(22, 3), 138)
check_eq("26 лет, без иждивенцев", max_days(26, 0), 67)
check_eq("30 лет, без иждивенцев", max_days(30, 0), 100)
check_eq("30 лет, трое иждивенцев", max_days(30, 3), 138)
check_eq("40 лет, без иждивенцев", max_days(40, 0), 138)
check_eq("40 лет, трое иждивенцев", max_days(40, 3), 175)
check_eq("50 лет, без иждивенцев", max_days(50, 0), 175)

print("\nГРАНИЧНЫЕ СЛУЧАИ")
check("нулевая зарплата", daily(0, False), 0)
check("очень маленький заработок 100 ₪/день", daily(100, False), 80.0)
check_eq("демобилизованный — дней", D["special_cases"]["discharged_soldier_days"], 70)

print("\nЦЕЛОСТНОСТЬ ДАННЫХ")
edges = [b["upto"] for b in D["brackets"]]
assert edges == sorted(edges), "границы ступеней должны возрастать"
print("  ✓ границы ступеней возрастают")
for b in D["brackets"]:
    assert b["rate_under28"] <= b["rate_28plus"], "ставка до 28 не должна превышать ставку после"
print("  ✓ ставки до 28 лет не выше ставок после 28")
assert D["caps"]["daily_after_125"] < D["caps"]["daily_first_period"], "второй потолок ниже первого"
print("  ✓ потолок после 125 дней ниже начального")

print()
if FAILED:
    print("ПРОВАЛЕНО ТЕСТОВ: %d — %s" % (len(FAILED), ", ".join(FAILED)))
    sys.exit(1)
print("ВСЕ ТЕСТЫ ПРОЙДЕНЫ")