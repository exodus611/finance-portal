#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Автообновление раздела «Официальная хроника предупреждений о мошенничестве».

Источник: официальный Telegram-канал Национального управления кибербезопасности
Израиля — https://t.me/s/Israel_Cyber (открытое web-превью, без API-ключа).

Логика:
  1. Скачивает страницу web-превью канала.
  2. Разбирает отдельные посты (виджеты сообщений).
  3. Отбирает те, что похожи на предупреждение о мошенничестве/фишинге —
     по ивритским маркерам в тексте.
  4. Переводит текст на русский (с защитой от сбоя переводчика).
  5. Добавляет новые записи в data/scams.json поверх уже существующих,
     без дублей по id поста. Существующие записи не трогает.
  6. Если новых подходящих постов нет — файл не меняет (нет лишнего коммита).
"""

import json
import os
import re
import sys
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "data", "scams.json")

CHANNEL_URL = "https://t.me/s/Israel_Cyber"
UA = {
    "User-Agent": (
        "finance-portal-scam-bot/1.0 "
        "(+https://exodus611.github.io/finance-portal/; "
        "informational aggregator of official warnings, 1 request per day)"
    )
}

# Раньше отбирали по узкому списку слов — сейчас наоборот: забираем ВСЁ,
# кроме явно корпоративных/технических новостей (взлом сайтов организаций,
# вирусы-вымогатели для бизнеса, конференции агентства и т.п.), которые не
# относятся напрямую к обычному человеку. Список специально короткий и грубый —
# лучше по ошибке взять что-то не совсем нужное, чем упустить важное для людей.
CORPORATE_MARKERS = [
    "כנס הסייבר", "וובינר למקצוענים", "לוקביט", "LockBit",
    "כופרה על ארגון", "עסקים וארגונים", "מנהלי מערכות",
    "אבטחת ענן ארגונית", "השבתת שרתים ארגונית",
]

# Маркеры типа предупреждения (для поля type)
CALL_MARKERS = ["שיחה", "התקשר", "טלפון", "קול", "מתקשר"]
SMS_MARKERS = ["SMS", "הודעת טקסט", "מסרון"]
WEB_MARKERS = ["אתר", "אימייל", "מייל", "קישור", "דוא\"ל"]


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_posts(html):
    """
    Грубый, но устойчивый разбор web-превью Telegram без внешних HTML-парсеров.
    Каждый пост обёрнут в data-post="Israel_Cyber/<id>".

    Важно: захватываем текст ДО следующего data-post (то есть до начала
    следующего поста целиком), а не до первого </div> — потому что внутри
    поста могут быть вложенные <div> (форматирование, превью ссылок), и
    более узкий захват мог обрезать или вовсе пропускать часть постов.
    Лишние теги внутри всё равно вычищаются ниже, так что взять с запасом
    безопаснее, чем недобрать.
    """
    posts = []
    matches = list(re.finditer(r'data-post="Israel_Cyber/(\d+)"', html))
    for i, m in enumerate(matches):
        post_id = int(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(html)
        block = html[start:end]

        text_match = re.search(
            r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)'
            r'(?:<div class="tgme_widget_message_(?:footer|info)|$)',
            block, re.S,
        )
        if not text_match:
            continue
        raw_text = text_match.group(1)
        text = re.sub(r"<br\s*/?>", "\n", raw_text)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"&nbsp;", " ", text)
        text = re.sub(r"&amp;", "&", text)
        text = re.sub(r"&quot;", '"', text)
        text = text.strip()
        if text:
            posts.append({"id": post_id, "text_he": text})
    return posts


def is_relevant(text_he):
    """
    ВРЕМЕННО: фильтр полностью отключён для диагностики — берём вообще все
    посты подряд, чтобы понять, реально ли проблема была в фильтрации,
    или дело в чём-то другом (сеть, разбор HTML, дедупликация).
    """
    return True


def guess_type(text_he):
    if any(m in text_he for m in CALL_MARKERS):
        return "call"
    if any(m in text_he for m in SMS_MARKERS):
        return "sms"
    if any(m in text_he for m in WEB_MARKERS):
        return "web"
    return "sms"


DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

ANALYSIS_PROMPT = """Ты помогаешь русскоязычному порталу об Израиле объяснять предупреждения о мошенничестве.
Вот текст официального поста от Национального управления кибербезопасности Израиля на иврите:

---
{text_he}
---

Ответь СТРОГО в формате JSON, без пояснений вокруг, с полями:
{{
  "title": "короткий заголовок по-русски, до 90 символов, суть предупреждения",
  "ru_translation": "точный перевод текста на русский",
  "summary": "краткое изложение сути в 1-2 предложениях по-русски",
  "what_to_notice": "конкретный анализ: что именно в этом случае должно насторожить человека — какие признаки подделки, приёмы обмана, детали. Не общие советы, а именно про ЭТОТ случай.",
  "type": "call, sms или web — в зависимости от того, о каком канале атаки идёт речь"
}}"""


def analyze_with_deepseek(text_he):
    """
    Отправляет текст в DeepSeek — просит и перевод, и содержательный анализ
    «на что обратить внимание» именно для этого сообщения (не общие фразы).
    Возвращает dict с полями title/ru_translation/summary/what_to_notice/type,
    либо None при любом сбое — вызывающий код тогда честно откатывается
    на упрощённый вариант, а не выдаёт частичный/сломанный результат.
    """
    if not DEEPSEEK_API_KEY:
        print("  DEEPSEEK_API_KEY не задан — пропускаем анализ через ИИ")
        return None
    try:
        import urllib.request as ur
        body = json.dumps({
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": ANALYSIS_PROMPT.format(text_he=text_he)}],
            "temperature": 0.3,
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
        required = {"title", "ru_translation", "summary", "what_to_notice"}
        if not required.issubset(result.keys()):
            print("  ответ DeepSeek неполный, пропускаем")
            return None
        return result
    except Exception as exc:
        print("  вызов DeepSeek не удался:", exc)
        return None


def translate(text_he):
    """
    Запасной путь без содержательного анализа — простой перевод через
    deep-translator. Используется только если DeepSeek недоступен
    (нет ключа или сбой запроса), чтобы запись не осталась совсем без перевода.
    """
    try:
        from deep_translator import GoogleTranslator
        chunks = [text_he[i:i + 4500] for i in range(0, len(text_he), 4500)]
        translated = [GoogleTranslator(source="iw", target="ru").translate(c) for c in chunks]
        result = " ".join(t for t in translated if t)
        return result if result.strip() else None
    except Exception as exc:
        print("  запасной перевод тоже не удался:", exc)
        return None


def make_title(text_ru, text_he):
    src = text_ru or text_he
    first_line = src.split("\n")[0].strip()
    if len(first_line) > 90:
        first_line = first_line[:87].rstrip() + "…"
    return first_line


def make_summary(text_ru):
    if not text_ru:
        return "Перевод временно недоступен — смотрите оригинал на иврите ниже."
    words = text_ru.split()
    short = " ".join(words[:28])
    return short + ("…" if len(words) > 28 else "")


DEFAULT_ACTIONS = [
    "Не переходить по ссылкам и не открывать вложения из подозрительных сообщений",
    "Не сообщать пароли, коды подтверждения или данные карты по телефону/в сообщении",
    "Проверять любые начисления и требования оплаты напрямую через официальный сайт или приложение",
    "При подозрении на мошенничество — обратиться на горячую линию 119 Национального управления кибербезопасности",
]


import html as html_module


def esc(text):
    if text is None:
        return None
    return html_module.escape(text, quote=False)


def build_entry(post, discovery_date):
    text_he = post["text_he"]
    he_short = text_he if len(text_he) <= 600 else text_he[:597] + "…"

    ai = analyze_with_deepseek(text_he)
    if ai:
        return {
            "id": post["id"],
            "date": discovery_date,
            "type": ai.get("type") or guess_type(text_he),
            "title": esc(ai["title"]),
            "summary": esc(ai["summary"]),
            "he_original": esc(he_short),
            "ru_translation": esc(ai["ru_translation"]),
            "needs_manual_translation": False,
            "what_to_notice": esc(ai["what_to_notice"]),
            "what_not_to_do": DEFAULT_ACTIONS,
            "source_url": "https://t.me/Israel_Cyber/%d" % post["id"],
            "auto_added": True,
            "ai_analyzed": True,
        }

    # Запасной путь: DeepSeek недоступен — только перевод, без анализа
    text_ru = translate(text_he)
    title = make_title(text_ru, text_he)
    summary = make_summary(text_ru)
    return {
        "id": post["id"],
        "date": discovery_date,
        "type": guess_type(text_he),
        "title": esc(title),
        "summary": esc(summary),
        "he_original": esc(he_short),
        "ru_translation": esc(text_ru),
        "needs_manual_translation": text_ru is None,
        "what_to_notice": None,
        "what_not_to_do": DEFAULT_ACTIONS,
        "source_url": "https://t.me/Israel_Cyber/%d" % post["id"],
        "auto_added": True,
        "ai_analyzed": False,
    }


def main():
    from datetime import date
    today_iso = date.today().isoformat()

    with open(DATA_PATH, encoding="utf-8") as fh:
        data = json.load(fh)

    existing_ids = set()
    repaired = 0
    for w in data.get("warnings", []):
        src = w.get("source_url", "")
        m = re.search(r"/(\d+)$", src)
        if m:
            existing_ids.add(int(m.group(1)))
        # Самолечение: если у более ранней автоматической записи дата
        # так и осталась пустой (например, из-за более старой версии
        # скрипта) — проставляем дату обнаружения задним числом, чтобы
        # сортировка на сайте больше не топила такие записи вниз.
        if w.get("auto_added") and not w.get("date"):
            w["date"] = today_iso
            repaired += 1
    if repaired:
        print("Починено записей с пустой датой:", repaired)

    print("Уже в файле:", len(existing_ids), "предупреждений с ID из Telegram")

    try:
        html = fetch(CHANNEL_URL)
    except Exception as exc:
        print("Не удалось получить канал:", exc)
        return 0  # не считаем сбой сети фатальной ошибкой всего workflow

    print("Размер полученной страницы (символов):", len(html))

    posts = extract_posts(html)
    print("Постов на странице:", len(posts))
    if posts:
        print("Найденные ID (для диагностики):", sorted(p["id"] for p in posts))
    else:
        print("ВНИМАНИЕ: не найдено ни одного поста — вероятно, изменилась структура HTML страницы Telegram.")

    new_entries = []
    for post in posts:
        if post["id"] in existing_ids:
            continue
        if not is_relevant(post["text_he"]):
            continue
        # Точной даты публикации в веб-превью Telegram нет без доп. запроса,
        # поэтому честно используем дату, когда МЫ обнаружили пост — этого
        # достаточно для правильной сортировки "сначала новые" на сайте.
        entry = build_entry(post, today_iso)
        new_entries.append(entry)
        print("  новая запись:", entry["id"], "-", entry["title"][:60])

    if not new_entries and not repaired:
        print("Новых релевантных предупреждений нет — файл не меняем.")
        return 0

    if new_entries:
        data["warnings"] = new_entries + data.get("warnings", [])
    from datetime import date
    data["updated"] = date.today().isoformat()

    with open(DATA_PATH, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

    print("Добавлено новых записей:", len(new_entries))
    return 0


if __name__ == "__main__":
    sys.exit(main())
