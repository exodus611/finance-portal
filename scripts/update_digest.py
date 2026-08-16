#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Еженедельный дайджест «Что изменилось на этой неделе».

Собирает уже проверенные нами данные (табло + последние предупреждения
о мошенничестве) и просит DeepSeek связать их в один короткий, живой абзац
на русском — не выдумывая новых фактов, только пересказывая то, что мы
и так знаем и уже проверили.

Если DeepSeek недоступен (нет ключа, сбой сети) — файл digest.json просто
не обновляется в этот раз, старый дайджест остаётся на сайте. Никакой
"заглушки" вместо живого текста не публикуется.
"""

import json
import os
import sys
from datetime import date

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLO_PATH = os.path.join(BASE, "data", "tablo.json")
SCAMS_PATH = os.path.join(BASE, "data", "scams.json")
DIGEST_PATH = os.path.join(BASE, "data", "digest.json")

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

PROMPT = """Ты пишешь короткий еженедельный дайджест для русскоязычного финансового портала об Израиле.
Вот проверенные факты за эту неделю (используй ТОЛЬКО их, ничего не выдумывай и не добавляй):

{facts}

Напиши связный абзац на русском, 3-5 предложений, живым человеческим языком (не сухим перечислением).
Не давай советов и рекомендаций — только честно перескажи, что произошло. Тон — нейтральный, спокойный, без кликбейта.
Ответь СТРОГО в формате JSON: {{"digest": "текст абзаца"}}"""


def load_json(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception as exc:
        print("  не удалось прочитать %s: %s" % (path, exc))
        return {}


def collect_facts():
    tablo = load_json(TABLO_PATH)
    scams = load_json(SCAMS_PATH)

    lines = []
    boi = tablo.get("boi", {})
    if boi.get("rate") is not None:
        lines.append("Ставка Банка Израиля: %.2f%%" % (boi["rate"] * 100))
    cpi = tablo.get("cpi", {})
    if cpi.get("yoy") is not None:
        lines.append("Мадад (годовая инфляция): %.1f%%" % (cpi["yoy"] * 100))
    fuel = tablo.get("fuel", {})
    if fuel.get("price_95") is not None and fuel.get("prev_price") is not None:
        diff = fuel["price_95"] - fuel["prev_price"]
        lines.append("Цена бензина 95: %.2f ₪/л (изменение с прошлого месяца: %+.2f ₪)" % (fuel["price_95"], diff))
    fx = tablo.get("fx", {}).get("market", {})
    if fx.get("USD") is not None:
        lines.append("Курс доллара: %.4f ₪" % fx["USD"])

    warnings = scams.get("warnings", [])
    if warnings:
        latest = warnings[0]
        lines.append("Последнее предупреждение о мошенничестве: «%s»" % latest.get("title", ""))

    return "\n".join("- " + l for l in lines)


def call_deepseek(facts):
    if not DEEPSEEK_API_KEY:
        print("  DEEPSEEK_API_KEY не задан — дайджест не обновляем в этот раз")
        return None
    try:
        import urllib.request as ur
        body = json.dumps({
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": PROMPT.format(facts=facts)}],
            "temperature": 0.4,
            "response_format": {"type": "json_object"},
        }).encode("utf-8")
        req = ur.Request(
            DEEPSEEK_URL, data=body, method="POST",
            headers={
                "Authorization": "Bearer " + DEEPSEEK_API_KEY,
                "Content-Type": "application/json",
            },
        )
        with ur.urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        content = payload["choices"][0]["message"]["content"]
        result = json.loads(content)
        return result.get("digest")
    except Exception as exc:
        print("  вызов DeepSeek не удался:", exc)
        return None


def main():
    facts = collect_facts()
    if not facts.strip():
        print("Нет данных для дайджеста — пропускаем.")
        return 0

    print("Собранные факты:\n" + facts)

    digest_text = call_deepseek(facts)
    if not digest_text:
        print("Дайджест не сгенерирован — файл не трогаем.")
        return 0

    data = {
        "digest": digest_text,
        "updated": date.today().isoformat(),
        "facts_used": facts,
    }
    with open(DIGEST_PATH, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

    print("Записано в", DIGEST_PATH)
    print("Текст:", digest_text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
