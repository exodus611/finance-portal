#!/usr/bin/env python3
"""
Обновляет data/rates.json актуальными ставками для калькуляторов портала.

Источники:
  - Ставка Банка Израиля:  https://boi.org.il/PublicApi/GetInterest
  - Индекс потребительских цен (мадад): https://api.cbs.gov.il/index/data/price
  - Курсы валют: https://boi.org.il/PublicApi/GetExchangeRates

Правила (важно не нарушать):
  1. При сбое источника — НЕ затираем старые данные, оставляем предыдущее значение
     и пишем причину в data['errors'].
  2. Блок data['manual'] (средние ставки по машкантам и т.п.) НИКОГДА не перезаписывается
     автоматикой — только через setdefault, если поля вообще не было.
  3. Падаем с ошибкой (exit code != 0) только если недоступны все источники СРАЗУ
     и при этом нет старого файла, на который можно опереться.
  4. Каждое поле, обновлённое автоматически, получает свою метку времени.
     Поля из data['manual'] хранят отдельную дату ручной проверки (data['manual']['_checked']).
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

RATES_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'rates.json')
TIMEOUT = 15

BOI_INTEREST_URL = 'https://boi.org.il/PublicApi/GetInterest'
BOI_FX_URL = 'https://boi.org.il/PublicApi/GetExchangeRates?asJson=true'
CBS_CPI_URL = 'https://api.cbs.gov.il/index/data/price?id=120010&format=json&download=false&last=1'

PRIME_SPREAD = 1.5  # прайм = ставка БИ + 1.5, устойчивое правило рынка


def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'finance-portal-rates-bot/1.0 (+https://exodus611.github.io/finance-portal/; informational, non-commercial, daily update)'})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read()
    return json.loads(raw)


def load_existing():
    if os.path.exists(RATES_PATH):
        try:
            with open(RATES_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def main():
    data = load_existing()
    data.setdefault('manual', {})
    data.setdefault('errors', {})
    errors = {}
    now_iso = datetime.now(timezone.utc).isoformat()

    ok_count = 0
    total_sources = 3

    # 1. Ставка Банка Израиля + прайм
    try:
        j = fetch_json(BOI_INTEREST_URL)
        boi_rate = float(j['currentInterest'])
        data['boi_rate'] = boi_rate
        data['prime'] = round(boi_rate + PRIME_SPREAD, 2)
        data['next_interest_date'] = j.get('nextInterestDate')
        data['boi_rate_updated'] = now_iso
        ok_count += 1
    except Exception as e:
        errors['boi_rate'] = f'{type(e).__name__}: {e}'

    # 2. Индекс потребительских цен (мадад)
    try:
        j = fetch_json(CBS_CPI_URL)
        month = j['month'][0]['date'][0]
        data['cpi_index'] = month.get('currBase', {}).get('value')
        data['cpi_annual_pct'] = month.get('percentYear')
        data['cpi_updated'] = now_iso
        ok_count += 1
    except Exception as e:
        errors['cpi'] = f'{type(e).__name__}: {e}'

    # 3. Курсы валют
    try:
        j = fetch_json(BOI_FX_URL)
        # Банк Израиля отдаёт объект вида {"exchangeRates":[...]}, а не голый список.
        # Старый код перебирал сам объект — получал строку 'exchangeRates' и падал
        # с AttributeError, из-за чего курсы в файле не обновлялись вообще.
        items = j.get('exchangeRates', j) if isinstance(j, dict) else j
        fx = {}
        for item in items:
            if not isinstance(item, dict):
                continue
            key = item.get('key') or item.get('Key')
            rate = item.get('currentExchangeRate') or item.get('CurrentExchangeRate')
            # unit=100 у иены и т.п. — приводим к «шекелей за 1 единицу валюты»
            unit = item.get('unit') or item.get('Unit') or 1
            if key and rate is not None:
                fx[key] = round(float(rate) / float(unit), 6)
        if fx:
            data['fx'] = fx
            data['fx_updated'] = now_iso
            ok_count += 1
        else:
            errors['fx'] = 'Пустой или неожиданный формат ответа'
    except Exception as e:
        errors['fx'] = f'{type(e).__name__}: {e}'

    if ok_count == 0 and not os.path.exists(RATES_PATH):
        print('КРИТИЧНО: ни один источник не ответил, и нет старого файла для отката.', file=sys.stderr)
        sys.exit(1)

    data['errors'] = errors
    data['updated'] = now_iso
    data['updated_sources_ok'] = f'{ok_count}/{total_sources}'

    os.makedirs(os.path.dirname(RATES_PATH), exist_ok=True)
    with open(RATES_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'Готово. Источников успешно: {ok_count}/{total_sources}.')
    if errors:
        print('Ошибки (старые значения сохранены для этих полей):')
        for k, v in errors.items():
            print(f'  - {k}: {v}')


if __name__ == '__main__':
    main()
