#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Автообновление раздела «Официальная хроника предупреждений о мошенничестве и кибербезопасности».
Источник: официальный Telegram-канал Национального управления кибербезопасности
Израиля (מערך הסייבר הלאומי - 119) — https://t.me/s/Israel_Cyber (открытое web-превью, без API-ключа).
Скрипт собирает ВСЕ сообщения подряд в хронологическом порядке и сохраняет в память (data/scams.json).
"""

import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import date

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE, "data", "scams.json")
CHANNEL_URL = "https://t.me/s/Israel_Cyber"

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 "
        "(+https://exodus611.github.io/; info-aggregator)"
    )
}

CALL_MARKERS = ["שיחה", "התקשר", "טלפון", "קול", "מתקשר"]
SMS_MARKERS = ["SMS", "הודעת טקסט", "מסרון", "הודעה", "הודעות"]
WEB_MARKERS = ["אתר", "אימייל", "מייל", "קישור", 'דוא"ל', "SharePoint", "WordPress", "LockBit", "פישינג"]

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")

def extract_posts(html_content):
    """
    Разбор web-превью Telegram (https://t.me/s/Israel_Cyber).
    Извлекает ID поста, дату публикации из тега <time> и чистый ивритский текст.
    Забирает ВСЕ посты подряд без исключения в хронологическом порядке.
    """
    posts = []
    chunks = html_content.split('data-post="Israel_Cyber/')
    for chunk in chunks[1:]:
        m_id = re.match(r"(\d+)\"", chunk)
        if not m_id:
            continue
        post_id = int(m_id.group(1))

        # Извлекаем дату из <time datetime="2026-08-05T...">
        date_match = re.search(r'<time[^>]*datetime="(\d{4}-\d{2}-\d{2})', chunk)
        post_date = date_match.group(1) if date_match else None

        # Извлекаем текст сообщения
        text_match = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', chunk, re.S)
        if text_match:
            raw_text = text_match.group(1)
            text = re.sub(r"<br\s*/?>", "\n", raw_text)
            text = re.sub(r"<[^>]+>", "", text)
            text = html.unescape(text).strip()
            if text:
                posts.append({"id": post_id, "date": post_date, "text_he": text})
    return posts

def guess_type(text_he):
    if any(m in text_he for m in CALL_MARKERS):
        return "call"
    if any(m in text_he for m in SMS_MARKERS):
        return "sms"
    if any(m in text_he for m in WEB_MARKERS):
        return "web"
    return "web"

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

ANALYSIS_PROMPT = """Ты помогаешь русскоязычному порталу об Израиле объяснять предупреждения о мошенничестве и киберугрозах.
Вот текст официального поста от Национального управления кибербезопасности Израиля на иврите:
---
{text_he}
---
Ответь СТРОГО в формате JSON, без пояснений вокруг, с полями:
{{
  "title": "короткий заголовок по-русски, до 90 символов, суть предупреждения",
  "ru_translation": "точный перевод текста на русский",
  "summary": "краткое изложение сути в 1-2 предложениях по-русски",
  "what_to_notice": "конкретный анализ: что именно в этом случае должно насторожить человека — какие признаки подделки, приёмы обмана, детали уязвимости. Не общие советы, а именно про ЭТОТ случай.",
  "type": "call, sms или web — в зависимости от того, о каком канале атаки идёт речь"
}}"""

def analyze_with_deepseek(text_he):
    if not DEEPSEEK_API_KEY:
        return None
    try:
        body = json.dumps({
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": ANALYSIS_PROMPT.format(text_he=text_he)}],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }).encode("utf-8")
        req = urllib.request.Request(
            DEEPSEEK_URL, data=body, method="POST",
            headers={
                "Authorization": "Bearer " + DEEPSEEK_API_KEY,
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        content = payload["choices"][0]["message"]["content"]
        content = content.replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
        required = {"title", "ru_translation", "summary", "what_to_notice"}
        if not required.issubset(result.keys()):
            return None
        return result
    except Exception as exc:
        print("  вызов DeepSeek не удался:", exc)
        return None

def translate_urllib(text_he):
    """Бесплатный перевод через публичный API Google Translate без внешних библиотек."""
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=iw&tl=ru&dt=t&q=" + urllib.parse.quote(text_he)
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=15) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            translated = "".join(x[0] for x in res[0] if x[0])
            return translated if translated.strip() else None
    except Exception as exc:
        print("  ошибка urllib-перевода:", exc)
        return None

def translate(text_he):
    try:
        from deep_translator import GoogleTranslator
        chunks = [text_he[i:i + 4500] for i in range(0, len(text_he), 4500)]
        translated = [GoogleTranslator(source="iw", target="ru").translate(c) for c in chunks]
        result = " ".join(t for t in translated if t)
        if result and result.strip():
            return result
    except Exception:
        pass
    # Фолбэк на встроенный urllib
    return translate_urllib(text_he)

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

def guess_what_to_notice(text_ru, text_he):
    """Аналитическое объяснение сути атаки/уловки при локальном анализе без DeepSeek."""
    combined = (text_ru or "") + " " + (text_he or "")
    if "SharePoint" in combined or "מסמך פיננסי" in combined:
        return (
            "В чём состоит скам/угроза: мошенники рассылают фишинговые ссылки под видом приглашения "
            "к совместному доступу к финансовому документу в Microsoft SharePoint. Ссылка может приходить "
            "со взломанного легитимного ящика и вести на страницу кражи учетных данных Microsoft 365."
        )
    if "LockBit" in combined or "כופרה" in combined:
        return (
            "В чём состоит скам/угроза: злоумышленники пытаются атаковать корпоративные и частные сети "
            "с использованием программы-вымогателя LockBit. Основные векторы — незащищённые RDP-сервера, "
            "утечки паролей и отсутствие многофакторной аутентификации."
        )
    if "WordPress" in combined or "השחתת אתרי" in combined:
        return (
            "В чём состоит скам/угроза: массовый взлом и дефейс (подмена главной страницы) сайтов "
            "на платформе WordPress из-за уязвимостей в устаревших плагинах или слабых паролей администратора."
        )
    if "GOV.IL" in combined or "דיוג" in combined:
        return (
            "В чём состоит скам/угроза: фишинговые SMS-сообщения, маскирующиеся под официальный правительственный "
            "портал GOV.IL с требованием срочно оплатить задолженность, пошлину или штраф по поддельной ссылке."
        )
    if "משחק" in combined or "מטבעות" in combined or "онлайн-игр" in combined.lower():
        return (
            "В чём состоит скам/угроза: предложения бесплатного внутриигрового подарка, игровой валюты или "
            "бонусов по ссылке, предназначенные для кражи паролей, платежных данных родителей и личной информации."
        )
    return (
        "В чём состоит скам/угроза: злоумышленники используют методы социальной инженерии, поддельные ссылки "
        "или маскировку под официальные организации. Обращайте внимание на адрес отправителя, не переходите "
        "по ссылкам и проверяйте информацию через официальные каналы."
    )

DEFAULT_ACTIONS = [
    "Не переходить по ссылкам и не открывать вложения из подозрительных сообщений",
    "Не сообщать пароли, коды подтверждения или данные карты по телефону/в сообщении",
    "Проверять любые начисления и требования оплаты напрямую через официальный сайт или приложение",
    "При подозрении на мошенничество — обратиться на горячую линию 119 Национального управления кибербезопасности Израиля (מערך הסייבר הלאומי)",
]

def esc(text):
    if text is None:
        return None
    return html.escape(text, quote=False)

def build_entry(post):
    text_he = post["text_he"]
    he_short = text_he if len(text_he) <= 600 else text_he[:597] + "…"
    ai = analyze_with_deepseek(text_he)
    if ai:
        return {
            "id": post["id"],
            "date": post.get("date"),
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

    text_ru = translate(text_he)
    title = make_title(text_ru, text_he)
    summary = make_summary(text_ru)
    what_notice = guess_what_to_notice(text_ru, text_he)
    return {
        "id": post["id"],
        "date": post.get("date"),
        "type": guess_type(text_he),
        "title": esc(title),
        "summary": esc(summary),
        "he_original": esc(he_short),
        "ru_translation": esc(text_ru),
        "needs_manual_translation": text_ru is None,
        "what_to_notice": esc(what_notice),
        "what_not_to_do": DEFAULT_ACTIONS,
        "source_url": "https://t.me/Israel_Cyber/%d" % post["id"],
        "auto_added": True,
        "ai_analyzed": False,
    }

def main():
    if not os.path.exists(DATA_PATH):
        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        data = {"warnings": [], "updated": None}
    else:
        with open(DATA_PATH, encoding="utf-8") as fh:
            data = json.load(fh)

    existing_ids = set()
    for w in data.get("warnings", []):
        src = w.get("source_url", "")
        m = re.search(r"/(\d+)$", src)
        if m:
            existing_ids.add(int(m.group(1)))

    print("Уже в файле:", len(existing_ids), "предупреждений с ID из Telegram")
    try:
        html_content = fetch(CHANNEL_URL)
    except Exception as exc:
        print("Не удалось получить канал:", exc)
        return 0

    posts = extract_posts(html_content)
    print("Постов на странице:", len(posts))

    new_entries = []
    # Забираем ВСЕ посты подряд без исключения (никакого фильтра is_relevant)
    for post in posts:
        if post["id"] in existing_ids:
            continue
        entry = build_entry(post)
        new_entries.append(entry)
        print("  новая запись:", entry["id"], "-", entry["title"][:60])

    if not new_entries:
        print("Новых сообщений нет — файл не меняем.")
        return 0

    # Объединяем с существующими и сортируем ВСЕ записи строго по хронологии (от новых к старым по убыванию ID)
    all_warnings = new_entries + data.get("warnings", [])
    all_warnings.sort(key=lambda x: x["id"], reverse=True)

    data["warnings"] = all_warnings
    data["updated"] = date.today().isoformat()

    with open(DATA_PATH, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

    print("Добавлено новых записей:", len(new_entries))
    print("Всего в базе сохранено записей:", len(all_warnings))
    return 0

if __name__ == "__main__":
    sys.exit(main())
