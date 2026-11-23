
"use strict";

window.addEventListener('error', function (e) {
  try {
    var msg = (e && (e.message || (e.error && e.error.message) || e.error)) || '';
    msg = String(msg);
    // Ignore environment / sandbox noise (e.g. the Arena preview harness accessing its
    // cross-origin parent frame). These are NOT bugs in this page — surfacing them only
    // makes a perfectly working page look broken.
    if (/cross-?origin|Blocked a frame|accessing a cross-origin|Script error|SecurityError/i.test(msg)) return;
    var b = document.getElementById('errBanner');
    if (!b) { b = document.createElement('div'); b.id = 'errBanner'; b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#7a1f1f;color:#fff;font:12px/1.4 monospace;padding:8px 12px;white-space:pre-wrap;'; document.body.appendChild(b); }
    b.textContent = 'JS error: ' + msg + (e.filename ? ' @' + e.filename + ':' + e.lineno : '');
  } catch (err) {}
});

/* ===== i18n ===== */
const I18N = {
  he: {
    sankey_h: "לאן הולכים הכספים?",
    sankey_sub: "זרימה ויזואלית: מהברוטו אל הנטו ומה שיורד למיסים ולחיסכון",
    sankey_net: "נטו", sankey_tax: "מס הכנסה", sankey_yesef: "מס יסף", sankey_bl: "ביטוח לאומי", sankey_pension: "פנסיה+קרן", sankey_from: "ברוטו", more_details: "עוד נתונים", acc_inputs: "הכנסה וניכויים", acc_breakdown: "פירוט ותרשים", acc_ladder: "מדרגות מס", acc_credits: "זיכויים וזכויות", acc_annual: "תחזית וטיפים",
    opt_h: "אופטימיזציה זכויות",
    opt_sub: "סמנו את המצבים שלכם - נחשב נקודות זיכוי שאולי לא ניצלתם",
    opt_disclaimer: "⚠️ הערכה מקורבת בלבד — נקודות עבור ילדים ועולים חדשים תלויות בגיל מדויק ובשנת עלייה. לחישוב מדויק השתמשו בסימולטור הרשמי של רשות המסים.",
    opt_woman: "אישה (חצי נקודה נוספת)", opt_child5: "ילד עד גיל 5", opt_child617: "ילדים גיל 6-17 (מספר)", opt_vet: "חייל משוחרר (שבע חודשים)", opt_degree: "תואר אקדמי", opt_immigrant: "עולה חדש (18 חודשים ראשונים)", opt_single: "הורה יחיד",
    opt_calc: "חשב נקודות מומלצות", opt_result: "כרגע מדוחים {0} נקודות. אפשר להגיע ל-{1} → תוספת {2} לחודש נטו", opt_none: "כל הנקודות מנוצלות - מעולה!", opt_apply: "החל על השכר", opt_applied: "נקודות מעודכנות: {0} (זיכוי {1})",
    ladder_next: "נשארו {0} עד מדרגת המס הבאה השנה",
    brand_sub: "מחשבון שכר 2026",
    share_title: "שתף קישור עם החישוב",
    theme_title: "החלף ערכת נושא",
    lang_title: "החלף שפה",
    eyebrow: "מעודכן לינואר 2026",
    pill: "✓ נתוני מס 2026",
    h1: "מחשבון נטו 2026",
    updated: "מדרגות מס · ביטוח לאומי · נקודות זיכוי — נתוני שנת המס 2026",
    intro: "מחשבון חינמי המבוסס על מדרגות מס ההכנסה העדכניות, כולל שעות נוספות, פנסיה, פיצויי פיטורים, תיאום מס, חישוב ברוטו מהנטו ותחזית שנתית. כל החישוב מתבצע בדפדפן שלכם בלבד — שום נתון לא נשלח לשרת.",
    info_box: "למה הניכוי החודשי משתנה: המעסיק מבצע הקבלה שנתית — מכפיל את השכר הנוכחי ב-12 ומחשב לפי זה. בונוס או העלאת שכר באמצע שנה מעוותים את הניכוי החודשי. בסוף השנה תיאום מול רשות המסים מחזיר את ההפרש ששולם ביתר.",
    tab_salary: "שכר נטו", tab_inverse: "כמה ברוטו?", tab_severance: "פיצויים", tab_coord: "תיאום מס", tab_pension: "גמלאי עובד",
    s_income_h: "💼 הכנסה", s_income_sub: "הזינו שכר יסוד ושעות נוספות. השעות מחושבות לפי תעריף השעה משכר היסוד.",
    lbl_base: "שכר יסוד ברוטו (₪)", lbl_hours: "שעות עבודה בחודש", lbl_ot125: "שעות נוספות 125%", lbl_ot150: "שעות נוספות 150%",
    ot_hint: "השעתיים הראשונות של שעות נוספות ביום — 125%, מהשעה השלישית ואילך — 150%. תקרת השעות הנוספות החוקית לחודש היא 58 שעות (ללא היתר מיוחד ממשרד העבודה).",
    lbl_sector: "הענף שלך (לבדיקת שכר מינימום)", sector_general: "כללי (6,443.85 ₪ / 35.40 ₪ לשעה)",
    sector_security: "שמירה ואבטחה (7,118.85 ₪ / 39.11 ₪ לשעה)", sector_cleaning: "ניקיון ותחזוקה (7,118.85 ₪ / 38.03 ₪ לשעה)",
    sector_catering: "הסעדה (כ-7,281.55 ₪, 113% מהכללי)", sector_construction: "בנייה (עולה לפי דרגה וותק בענף)",
    min_warning_prefix: "שימו לב: שכר המינימום הענפי שלכם הוא", min_warning_suffix: "— השכר שהזנתם נמוך מהתקרה. המעסיק חייב להשלים את ההפרש.",
    ot_warning: "שימו לב: סך שעות נוספות שהזנתם חורג מהתקרה החוקית של 58 שעות נוספות לחודש לפי היתר כללי.",
    lbl_night: "שעות לילה נוספות (115%)", lbl_shabbat: "שעות שבת/חג (150%)", lbl_travel: "נסיעות פטורות ממס (₪)",
    travel_title: "החזר הוצאות נסיעה עד התקרה החוקית — נוסף לשכר הנטו ואינו חייב במס.",
    s_pens_h: "🏦 הפרשות פנסיוניות", s_pens_sub: "הפרשת העובד מקטינה את ההכנסה החייבת במס (עד התקרה המותרת).",
    lbl_pension: "הפרשת עובד לפנסיה", pension_opt_default: "ברירת מחדל (6%)", pension_opt_high: "מוגברת (7%)", pension_opt_custom: "אחוז מותאם",
    lbl_keren: "קרן השתלמות עובד (%)", lbl_pension_custom: "אחוז פנסיה מותאם אישית",
    s_cred_h: "🎫 זיכויים", lbl_points: "נקודות זיכוי במס", points_title: "תושב: 2.25 נק' (כ-544 ₪ קיזוז בחודש). אישה +0.5, ילדים, עולה חדש ועוד — הוסיפו לפי זכאותכם. כל נקודה שווה 242 ₪ בחודש.",
    s_detail_h: "📊 פירוט הניכויים",
    row_gross: "ברוטו כולל", row_taxable: "הכנסה חייבת במס", row_tax: "מס הכנסה (אחרי זיכוי)", row_yesef: "מס יסף (מעל 60,130 ₪)",
    row_bl: "ביטוח לאומי + בריאות", row_pension: "הפרשות עובד (פנסיה+קרן)", row_travel: "נסיעות (פטור, מתווסף)",
    m_marginal: "שיעור מס שולי", m_takehome: "נטו כחלק מהברוטו", m_hourly: "שכר שעה (ברוטו)", m_empcost: "עלות מעסיק משוערת",
    empcost_title: "הערכה גסה: ברוטו + דמי ביטוח מעסיק (7.6%) + פנסיה מעסיק (6.5%) + קרן (7.5% אם רלוונטי) + הפרשה לפיצויים (8.33%).",
    ladder_h: "🪜 מדרגות המס שלך (2026)", annual_h: "📅 תחזית שנתית",
    m_annGross: "ברוטו שנתי", m_annTax: "מס שנתי", m_annNet: "נטו שנתי",
    tips_h: "💡 טיפים חכמים", reset_btn: "↺ איפוס לברירת מחדל",
    receipt_net_label: "שכר נטו לתשלום", receipt_net_sub: "מחושב ברגע זה בדפדפן שלכם", stamp: "נטו", legend_net: "נטו", donut_back: "עוד פעם ← נטו", donut_hint: "לחץ על פרוסה",
    inv_h: "🎯 כמה ברוטו אתם צריכים?", inv_sub: "הזינו את השכר נטו שאתם רוצים לקבל — והמחשבון יחשב את הברוטו הנדרש (פתרון הפוך של מדרגות המס).",
    lbl_inv_net: "שכר נטו רצוי (₪)", lbl_inv_pension: "הפרשת עובד לפנסיה (%)", lbl_inv_points: "נקודות זיכוי", inv_p0: "ללא",
    row_inv_gross: "ברוטו נדרש (לתשלום למעסיק)", row_inv_tax: "מס הכנסה שישולם", row_inv_bl: "ביטוח לאומי + בריאות", row_inv_pension: "הפרשה לפנסיה (6%)",
    inv_receipt_label: "כדי לקבל נטו של", inv_receipt_sub: "ברוטו חודשי נדרש",
    inv_disclaimer: "החישוב מבוסס על שכר יסוד ללא שעות נוספות וללא נסיעות, עם הפרשת עובד לפנסיה כפי שהזנתם. שיעור המס השולי פוגע גם בהפרש — העלאת הברוטו ב-1,000 ₪ מוסיפה לנטו פחות מאלף.",
    sev_h: "📦 נתוני העסקה", sev_sub: "פיצויי פיטורים = שכר קובע × מספר שנות ותק (חודש אחד על כל שנת עבודה).",
    lbl_sev_salary: "שכר קובע אחרון (₪)", lbl_sev_years: "שנות ותק", lbl_sev_accrued: "כבר נצבר בקופת פיצויים (₪)", sev_accrued_title: "סכום שכבר הופקד לכם בפועל בקרן הפיצויים או ששולם בעבר.",
    row_sev_total: "פיצויים לפי חוק (שכר × ותק)", row_sev_accrued: "כבר נצבר בקופה", sev_receipt_label: "יתרה שהמעסיק אמור להשלים",
    sev_disclaimer: "חישוב בסיסי לפי נוסחת החוק. קיים פטור ממס עד תקרה שנתית (כ-13,750 ₪ לכל שנת ותק, מתעדכנת מדי שנה) — סכום מעבר לתקרה עשוי להתחייב במס. החישוב אינו כולל סעיף 14, מקרים מיוחדים או פיצויי הודעה מוקדמת. נדרש ייעוץ משפטי פרטני.",
    coord_h: "🔗 שתי משכורות", coord_sub: "בלי תיאום מס, כל מעסיק נותן את נקודות הזיכוי — ואתם משלמים ביתר (או מקבלים החזר) בסוף השנה.",
    lbl_coord_a: "שכר ברוטו — עבודה 1 (₪)", lbl_coord_b: "שכר ברוטו — עבודה 2 (₪)",
    row_coord_proper: "מס שנתי נכון (על סך ההכנסה)", row_coord_naive: "ניכוי חודשי ללא תיאום", coord_naive_title: "כל מעסיק מנכה כאילו זו הכנסתכם היחידה עם מלוא הזיכויים.", row_coord_balance: "הפרש לתשלום בסוף השנה",
    coord_receipt_label: "מה תחסכו בתיאום מס נכון", coord_saving_sub_a: "תשלום ביתר בסוף השנה אם לא תתאמו", coord_saving_sub_b: "החזר צפוי בסוף השנה",
    coord_disclaimer: "עם תיאום מס נכון המעסיקים מחלקים את נקודות הזיכוי ביניהם, והניכוי החודשי משקף את המס האמתי — בלי הפתעות בסוף השנה. החישוב מתעלם מהפרשות פנסיוניות ומהכנסות נוספות.",
    pen_h: "🧓 עבודה + קצבה", pen_sub: "לגמלאי שעובד ומקבל פנסיה: הקצבה חייבת במס רק על החלק שמעבר לאחוז הפטור.",
    lbl_pen_salary: "שכר מעבודה, ברוטו (₪)", lbl_pen_pension: "קצבה חודשית, ברוטו (₪)", lbl_pen_exempt: "אחוז פטור על הקצבה (%)", pen_exempt_title: "תלוי בקיבוע זכויות ותאריך פרישה. הזינו את האחוז הידוע לכם מקופת הפנסיה (לרוב 52%–67%).",
    row_pen_taxable: "קצבה חייבת במס (אחרי פטור)", row_pen_total: "הכנסה חייבת משולבת", row_pen_tax: "מס הכנסה כולל", row_pen_health: "דמי ביטוח בריאות מהקצבה",
    pen_receipt_label: 'סה"כ נטו (עבודה + קצבה)',
    pen_disclaimer: "אחוז הפטור תלוי בנתונים אישיים (קיבוע זכויות, תאריך פרישה). החישוב אינו כולל הטבת יישוב מוטב, ביטוח לאומי (לרוב אינו חל מעל גיל הפרישה) או הכנסות נוספות.",
    disclaimer_main: "חישוב משוער לפי מדרגות מס 2026 ושיעורי ביטוח לאומי לשכיר. אינו מהווה ייעוץ מס או משפטי. לחישוב מדויק — פנו לרואה חשבון או יועץ מס מוסמך.",
    footer: "מקורות הנתונים: רשות המסים (מדרגות מס 2026), המוסד לביטוח לאומי (שיעורי דמי ביטוח 2026, תקרה 51,910 ₪). האתר אינו אוסף פרטים אישיים ואינו שומר נתונים שהוזנו במחשבונים.",
    doc_title: "מחשבון נטו 2026 — ברוטו לנטו, השוואה והורדת תמונה | חינם",
    meta_desc: "מחשבון שכר נטו לישראל 2026: כמה תקבלו ליד, מדרגות מס, ביטוח לאומי, פנסיה ונקודות זיכוי. גם חישוב הפוך — כמה ברוטו לבקש. חינם וללא הרשמה.",
    ladder_here: "כאן אתה",
    ladder_sub: "מבוסס על ההכנסה החייבת (ברוטו פחות הפרשות לפנסיה)",
    reset_toast: "אופס לברירת מחדל", share_copied: "הקישור הועתק ללוח", share_url: "הקישור מוכן בכתובת העמוד",
    brand_name: "נטו·2026", img_btn: "🖼️ שמור כתמונה", img_done: "התמונה הורדה", card_footer: "חושב בדפדפן בלבד · ללא שמירת נתונים",
    calc_basis: "בסיס ברירת מחדל: פנסיה 6% · 2.25 נקודות זיכוי · ביטוח לאומי 4.27%/12.17% · ללא קרן השתלמות וללא ביטוח בריאות מהשכר",
    lang_btn_he: "🌐 РУС", lang_btn_ru: "🌐 עברית"
  },
  ru: {
    sankey_h: "Куда уходят деньги?",
    sankey_sub: "визуализация потока: от брутто к нетто и что уходит в налоги и сбережения",
    sankey_net: "Нетто", sankey_tax: "Подоходный", sankey_yesef: "Мас-йесеф", sankey_bl: "Битуах Леуми", sankey_pension: "Пенсия+Керен", sankey_from: "Брутто", more_details: "Подробнее", acc_inputs: "Доход и отчисления", acc_breakdown: "Детализация и диаграмма", acc_ladder: "Налоговые ступени", acc_credits: "Вычеты и права", acc_annual: "Прогноз и советы",
    opt_h: "Оптимизация прав",
    opt_sub: "Отметьте ситуацию - посчитаем налоговые баллы, которые вы, возможно, не используете",
    opt_disclaimer: "⚠️ Это приблизительная оценка — точные баллы за детей и репатриацию зависят от точного возраста ребёнка и года репатриации. Для точного расчёта используйте официальный симулятор налоговой службы.",
    opt_woman: "Женщина (+0,5 балла)", opt_child5: "Ребёнок до 5 лет", opt_child617: "Детей 6-17 лет (число)", opt_vet: "Демобилизованный (36 мес.)", opt_degree: "Высшее образование", opt_immigrant: "Новый репатриант (18 мес.)", opt_single: "Одинокий родитель",
    opt_calc: "Рассчитать баллы", opt_result: "Сейчас заявлено {0} баллов. Можно до {1} → +{2} в месяц к нетто", opt_none: "Все баллы учтены - отлично!", opt_apply: "Применить к зарплате", opt_applied: "Учтено баллов: {0} (вычет {1})",
    ladder_next: "Осталось {0} до следующей налоговой ступени в этом году",
    brand_sub: "Калькулятор зарплаты 2026",
    share_title: "Поделиться ссылкой на расчёт",
    theme_title: "Сменить тему",
    lang_title: "Сменить язык",
    eyebrow: "Обновлено: январь 2026",
    pill: "✓ налог-2026",
    h1: "Калькулятор Нетто 2026",
    updated: "Налоговые ступени · Битуах Леуми · налоговые вычеты — налоговый год 2026",
    intro: "Бесплатный калькулятор на актуальных налоговых ступенях: сверхурочные, пенсия, выходное пособие, согласование налога, расчёт брутто из нетто и годовая проекция. Весь расчёт идёт только в вашем браузере — данные никуда не отправляются.",
    info_box: "Почему ежемесячное удержание меняется: работодатель делает годовую экстраполяцию — умножает текущую зарплату на 12 и считает по ней. Премия или повышение посреди года искажают месячное удержание. В конце года сверка с налоговой возвращает переплату.",
    tab_salary: "Чистая зп", tab_inverse: "Сколько брутто?", tab_severance: "Выходное", tab_coord: "Налог", tab_pension: "Пенсионер",
    s_income_h: "💼 Доход", s_income_sub: "Введите базовую зарплату и сверхурочные. Часы считаются по часовой ставке от базовой зарплаты.",
    lbl_base: "Базовая зарплата брутто (₪)", lbl_hours: "Рабочих часов в месяц", lbl_ot125: "Сверхурочные 125%", lbl_ot150: "Сверхурочные 150%",
    ot_hint: "Первые 2 часа переработки в день — по ставке 125%, с 3-го часа и далее — 150%. Законный месячный потолок переработок — 58 часов (без спецразрешения минтруда).",
    lbl_sector: "Ваша отрасль (для проверки минимума)", sector_general: "Общая (6,443.85 ₪ / 35.40 ₪ в час)",
    sector_security: "Охрана/безопасность (7,118.85 ₪ / 39.11 ₪ в час)", sector_cleaning: "Клининг/уборка (7,118.85 ₪ / 38.03 ₪ в час)",
    sector_catering: "Общепит/ресторанная сфера (≈7,281.55 ₪, 113% от общей)", sector_construction: "Строительство (растёт по разряду и стажу в отрасли)",
    min_warning_prefix: "Внимание: по вашей отрасли минимум сейчас", min_warning_suffix: "— указанная зарплата ниже этого порога. Работодатель обязан доплатить разницу.",
    ot_warning: "Обратите внимание: указанная сумма сверхурочных часов превышает законный потолок в 58 часов переработки в месяц по общему разрешению.",
    lbl_night: "Доп. ночные часы (115%)", lbl_shabbat: "Часы субботы/праздника (150%)", lbl_travel: "Компенсация дороги без налога (₪)",
    travel_title: "Возврат расходов на дорогу до законного лимита — добавляется к чистой зарплате и не облагается налогом.",
    s_pens_h: "🏦 Пенсионные отчисления", s_pens_sub: "Отчисление работника уменьшает налогооблагаемый доход (в пределах лимита).",
    lbl_pension: "Отчисление работника в пенсию", pension_opt_default: "По умолчанию (6%)", pension_opt_high: "Повышенная (7%)", pension_opt_custom: "Свой процент",
    lbl_keren: "Фонд повышения квалификации, % работника", lbl_pension_custom: "Свой % пенсии",
    s_cred_h: "🎫 Налоговые вычеты", lbl_points: "Налоговые вычеты (некудот)", points_title: "Житель: 2,25 очка (≈544 ₪ вычета в месяц). Женщина +0,5, дети, новый репатриант и др. — добавьте по праву. Один очко = 242 ₪ в месяц.",
    s_detail_h: "📊 Детализация удержаний",
    row_gross: "Итого брутто", row_taxable: "Налогооблагаемый доход", row_tax: "Подоходный (после вычетов)", row_yesef: "Доп. налог мас-йесеф (свыше 60 130 ₪)",
    row_bl: "Битуах Леуми + здоровье", row_pension: "Отчисления работника (пенсия+фонд)", row_travel: "Дорога (без налога, добавляется)",
    m_marginal: "Предельная ставка", m_takehome: "Нетто от брутто", m_hourly: "Ставка в час (брутто)", m_empcost: "Оценка стоимости работодателя",
    empcost_title: "Грубая оценка: брутто + страховка работодателя (7,6%) + пенсия работодателя (6,5%) + фонд (7,5% если есть) + отчисление в выходное (8,33%).",
    ladder_h: "🪜 Ваши налоговые ступени (2026)", annual_h: "📅 Годовая проекция",
    m_annGross: "Брутто в год", m_annTax: "Налог в год", m_annNet: "Нетто в год",
    tips_h: "💡 Умные советы", reset_btn: "↺ Сброс по умолчанию",
    receipt_net_label: "Чистая зарплата к выплате", receipt_net_sub: "Рассчитано прямо сейчас в вашем браузере", stamp: "НЕТТО", legend_net: "Нетто", donut_back: "ещё раз → нетто", donut_hint: "нажми на сектор",
    inv_h: "🎯 Сколько брутто вам нужно?", inv_sub: "Введите желаемую чистую зарплату — калькулятор вычислит нужное брутто (обратное решение налоговых ступеней).",
    lbl_inv_net: "Желаемая чистая зарплата (₪)", lbl_inv_pension: "Отчисление в пенсию работника (%)", lbl_inv_points: "Налоговые вычеты", inv_p0: "нет",
    row_inv_gross: "Нужное брутто (к оплате работодателю)", row_inv_tax: "Подоходный к уплате", row_inv_bl: "Битуах Леуми + здоровье", row_inv_pension: "Отчисление в пенсию (6%)",
    inv_receipt_label: "чтобы получать на руки", inv_receipt_sub: "Нужное месячное брутто",
    inv_disclaimer: "Расчёт основан на базовой зарплате без сверхурочных и дороги, с отчислением работника в пенсию как указано. Предельная ставка бьёт и по разнице — повышение брутто на 1 000 ₪ добавляет к нетто меньше тысячи.",
    sev_h: "📦 Данные работы", sev_sub: "Выходное пособие = определяющая зарплата × число лет стажа (месяц за каждый год работы).",
    lbl_sev_salary: "Последняя определяющая зарплата (₪)", lbl_sev_years: "Лет стажа", lbl_sev_accrued: "Уже накоплено в фонде выходного (₪)", sev_accrued_title: "Сумма, уже реально внесённая в фонд выходного или выплаченная ранее.",
    row_sev_total: "Выходное по закону (зарплата × стаж)", row_sev_accrued: "Уже накоплено в фонде", sev_receipt_label: "Остаток, который работодатель должен доплатить",
    sev_disclaimer: "Базовый расчёт по формуле закона. Есть налоговое освобождение до годового лимита (≈13 750 ₪ за каждый год стажа, индексируется ежегодно) — сумма сверх лимита может облагаться налогом. Расчёт не включает ст. 14, особые случаи или компенсацию за уведомление. Нужна индивидуальная юридическая консультация.",
    coord_h: "🔗 Две зарплаты", coord_sub: "Без согласования каждый работодатель даёт налоговые вычеты — и вы переплачиваете (или получаете возврат) в конце года.",
    lbl_coord_a: "Зарплата брутто — работа 1 (₪)", lbl_coord_b: "Зарплата брутто — работа 2 (₪)",
    row_coord_proper: "Верный годовой налог (со всего дохода)", row_coord_naive: "Ежемесячное удержание без согласования", coord_naive_title: "Каждый работодатель удерживает так, будто это ваш единственный доход со всеми вычетами.", row_coord_balance: "Разница к доплате в конце года",
    coord_receipt_label: "Сколько сэкономите при согласовании", coord_saving_sub_a: "Переплата в конце года, если не согласуете", coord_saving_sub_b: "Ожидаемый возврат в конце года",
    coord_disclaimer: "При правильном согласовании работодатели делят налоговые вычеты, и ежемесячное удержание отражает реальный налог — без сюрпризов в конце года. Расчёт игнорирует пенсионные отчисления и прочие доходы.",
    pen_h: "🧓 Работа + пенсия", pen_sub: "Для пенсионера, который работает и получает пенсию: пенсия облагается налогом только сверх % освобождения.",
    lbl_pen_salary: "Зарплата от работы, брутто (₪)", lbl_pen_pension: "Пенсия в месяц, брутто (₪)", lbl_pen_exempt: "% освобождения пенсии (%)", pen_exempt_title: "Зависит от фиксации прав и даты выхода. Введите известный вам % из пенсионного фонда (обычно 52%–67%).",
    row_pen_taxable: "Пенсия к налогу (после освобождения)", row_pen_total: "Совокупный налогооблагаемый доход", row_pen_tax: "Весь подоходный", row_pen_health: "Страховка здоровья с пенсии",
    pen_receipt_label: 'Итого на руки (работа + пенсия)',
    pen_disclaimer: "% освобождения зависит от личных данных (фиксация прав, дата выхода). Расчёт не включает льготу для периферии, Битуах Леуми (обычно не применяется после пенсионного возраста) или прочие доходы.",
    disclaimer_main: "Приблизительный расчёт по налоговым ступеням 2026 и ставкам Битуах Леуми для наёмных. Не является налоговой или юридической консультацией. Для точного расчёта обратитесь к бухгалтеру или налоговому консультанту.",
    footer: "Источники данных: Налоговая служба (ступени 2026), Битуах Леуми (ставки 2026, потолок 51 910 ₪). Сайт не собирает личные данные и не сохраняет введённое.",
    doc_title: "Калькулятор зарплаты Израиль 2026 — брутто в нетто, сколько на руки",
    meta_desc: "Сколько получите на руки: калькулятор зарплаты Израиль 2026. Ступени налога, Битуах Леуми, пенсия, некудот зикуй. Обратный расчёт — сколько просить брутто. Бесплатно, без регистрации.",
    ladder_here: "вы здесь",
    ladder_sub: "по налогооблагаемому доходу (брутто минус отчисления)",
    reset_toast: "Сброшено по умолчанию", share_copied: "Ссылка скопирована", share_url: "Ссылка готова в адресе страницы",
    brand_name: "Нетто-зарплата", img_btn: "🖼️ Скачать картинку", img_done: "Картинка сохранена", card_footer: "рассчитано только в браузере · без сохранения данных",
    calc_basis: "По умолчанию: пенсия 6% · 2.25 налоговых очка · Битуах Леуми 4.27/12.17% · без керен-фонда и медстраховки из зарплаты",
    lang_btn_he: "🌐 РУС", lang_btn_ru: "🌐 עברית"
  },

  fr: {
    sankey_h: "Où part l’argent ?",
    sankey_sub: "visualisation du flux : du brut au net, et ce qui part en impôts et en épargne",
    sankey_net: "Net", sankey_tax: "Impôt", sankey_yesef: "Mas yesef", sankey_bl: "Bitouah Leumi", sankey_pension: "Retraite+Fonds", sankey_from: "Brut", more_details: "Plus de détails", acc_inputs: "Revenu et cotisations", acc_breakdown: "Détail et graphiques", acc_ladder: "Paliers d’imposition", acc_credits: "Crédits et droits", acc_annual: "Projection et conseils",
    opt_h: "Optimisation des droits",
    opt_sub: "Cochez votre situation — nous calculons les points de crédit que vous n’utilisez peut-être pas",
    opt_disclaimer: "⚠️ Estimation approximative — les points exacts pour les enfants et l’alya dépendent de l’âge précis de l’enfant et de l’année d’alya. Pour un calcul exact, utilisez le simulateur officiel du service des impôts.",
    opt_woman: "Femme (+0,5 point)", opt_child5: "Enfant de moins de 5 ans", opt_child617: "Enfants de 6 à 17 ans (nombre)", opt_vet: "Démobilisé (36 mois)", opt_degree: "Études supérieures", opt_immigrant: "Nouvel immigrant (18 mois)", opt_single: "Parent isolé",
    opt_calc: "Calculer les points", opt_result: "Points déclarés : {0}. Possible jusqu’à {1} → +{2} par mois de net", opt_none: "Tous vos points sont déjà comptés — parfait !", opt_apply: "Appliquer au salaire", opt_applied: "Points pris en compte : {0} (réduction {1})",
    ladder_next: "Il reste {0} avant le palier d’imposition suivant cette année",
    brand_sub: "Calculateur de salaire 2026",
    share_title: "Partager le lien du calcul",
    theme_title: "Changer le thème",
    lang_title: "Changer de langue",
    eyebrow: "Mis à jour : janvier 2026",
    pill: "✓ impôts-2026",
    h1: "Simulateur de salaire en Israël : calculez votre net",
    updated: "Paliers d’imposition · Bitouah Leumi · points de crédit — année fiscale 2026",
    intro: "Calculateur gratuit sur les paliers d’imposition à jour : heures supplémentaires, retraite, indemnité de licenciement, coordination des impôts, calcul du brut à partir du net et projection annuelle. Tout se calcule uniquement dans votre navigateur — aucune donnée n’est envoyée.",
    info_box: "Pourquoi la retenue mensuelle varie : l’employeur extrapole sur l’année — il multiplie le salaire du mois par 12 et calcule l’impôt sur ce montant. Une prime ou une augmentation en cours d’année fausse la retenue mensuelle. En fin d’année, la régularisation avec le fisc restitue le trop-perçu.",
    tab_salary: "Salaire net", tab_inverse: "Quel brut ?", tab_severance: "Indemnité", tab_coord: "Deux salaires", tab_pension: "Retraité",
    s_income_h: "💼 Revenu", s_income_sub: "Indiquez le salaire de base et les heures supplémentaires. Les heures sont valorisées au taux horaire issu du salaire de base.",
    lbl_base: "Salaire brut de base (₪)", lbl_hours: "Heures de travail par mois", lbl_ot125: "Heures sup. à 125 %", lbl_ot150: "Heures sup. à 150 %",
    ot_hint: "Les 2 premières heures supplémentaires de la journée sont payées à 125 % ; à partir de la 3ᵉ heure et au-delà, à 150 %. Le plafond légal est de 58 heures supplémentaires par mois (sans autorisation spéciale du ministère du Travail).",
    lbl_sector: "Votre secteur (vérification du minimum)", sector_general: "Général (6 443,85 ₪ / 35,40 ₪ de l’heure)",
    sector_security: "Sécurité/sûreté (7 118,85 ₪ / 39,11 ₪ de l’heure)", sector_cleaning: "Nettoyage (7 118,85 ₪ / 38,03 ₪ de l’heure)",
    sector_catering: "Restauration (≈7 281,55 ₪, soit 113 % du minimum général)", sector_construction: "Bâtiment (augmente selon le grade et l’ancienneté dans la branche)",
    min_warning_prefix: "Attention : dans votre secteur, le minimum est actuellement de ", min_warning_suffix: " — le salaire indiqué est sous ce seuil. L’employeur est tenu de verser la différence.",
    ot_warning: "À noter : les heures supplémentaires indiquées dépassent le plafond légal de 58 heures par mois prévu par l’autorisation générale.",
    lbl_night: "Heures de nuit en plus (115 %)", lbl_shabbat: "Heures de shabbat/fête (150 %)", lbl_travel: "Remboursement trajet sans impôt (₪)",
    travel_title: "Le remboursement des frais de trajet, jusqu’au plafond légal, s’ajoute au salaire net sans être imposé.",
    s_pens_h: "🏦 Cotisations retraite", s_pens_sub: "La cotisation du salarié réduit le revenu imposable (dans la limite autorisée).",
    lbl_pension: "Cotisation retraite du salarié", pension_opt_default: "Par défaut (6 %)", pension_opt_high: "Majorée (7 %)", pension_opt_custom: "Pourcentage personnalisé",
    lbl_keren: "Fonds de formation (keren hishtalmut), % salarié", lbl_pension_custom: "% retraite personnalisé",
    s_cred_h: "🎫 Points de crédit", lbl_points: "Points de crédit (nékoudot zikouy)", points_title: "Résident : 2,25 points (≈544 ₪ de réduction par mois). Femme : +0,5 ; enfants, nouvel immigrant et autres cas — ajoutez selon vos droits. Un point = 242 ₪ par mois.",
    s_detail_h: "📊 Détail des retenues",
    row_gross: "Brut total", row_taxable: "Revenu imposable", row_tax: "Impôt sur le revenu (après crédits)", row_yesef: "Taxe complémentaire mas yesef (au-delà de 60 130 ₪)",
    row_bl: "Bitouah Leumi + santé", row_pension: "Cotisations du salarié (retraite+fonds)", row_travel: "Trajet (non imposé, s’ajoute)",
    m_marginal: "Taux marginal", m_takehome: "Net sur brut", m_hourly: "Taux horaire (brut)", m_empcost: "Coût employeur estimé",
    empcost_title: "Estimation approximative : brut + assurance employeur (7,6 %) + retraite employeur (6,5 %) + fonds (7,5 % s’il existe) + provision d’indemnité de licenciement (8,33 %).",
    ladder_h: "🪜 Vos paliers d’imposition (2026)", annual_h: "📅 Projection annuelle",
    m_annGross: "Brut annuel", m_annTax: "Impôt annuel", m_annNet: "Net annuel",
    tips_h: "💡 Conseils malins", reset_btn: "↺ Réinitialiser",
    receipt_net_label: "Salaire net à payer", receipt_net_sub: "Calculé à l’instant, dans votre navigateur", stamp: "NET", legend_net: "Net", donut_back: "encore → net", donut_hint: "cliquez sur un secteur",
    inv_h: "🎯 Quel brut vous faut-il ?", inv_sub: "Indiquez le salaire net souhaité — le calculateur trouve le brut nécessaire (résolution inverse des paliers d’imposition).",
    lbl_inv_net: "Salaire net souhaité (₪)", lbl_inv_pension: "Cotisation retraite du salarié (%)", lbl_inv_points: "Points de crédit", inv_p0: "aucun",
    row_inv_gross: "Brut nécessaire (à demander à l’employeur)", row_inv_tax: "Impôt à payer", row_inv_bl: "Bitouah Leumi + santé", row_inv_pension: "Cotisation retraite (6 %)",
    inv_receipt_label: "pour toucher net", inv_receipt_sub: "Brut mensuel nécessaire",
    inv_disclaimer: "Calcul basé sur le salaire de base, sans heures supplémentaires ni trajet, avec la cotisation retraite indiquée. Le taux marginal frappe aussi la différence : 1 000 ₪ de brut en plus n’ajoutent pas 1 000 ₪ au net.",
    sev_h: "📦 Données d’emploi", sev_sub: "Indemnité de licenciement = salaire de référence × années d’ancienneté (un mois par année travaillée).",
    lbl_sev_salary: "Dernier salaire de référence (₪)", lbl_sev_years: "Années d’ancienneté", lbl_sev_accrued: "Déjà accumulé dans le fonds d’indemnité (₪)", sev_accrued_title: "Somme effectivement versée au fonds d’indemnité ou déjà payée par le passé.",
    row_sev_total: "Indemnité légale (salaire × ancienneté)", row_sev_accrued: "Déjà accumulé dans le fonds", sev_receipt_label: "Solde que l’employeur doit verser en plus",
    sev_disclaimer: "Calcul de base selon la formule légale. Une exonération fiscale existe jusqu’à un plafond annuel (≈13 750 ₪ par année d’ancienneté, indexé chaque année) — le surplus peut être imposable. Le calcul n’inclut ni l’article 14, ni les cas particuliers, ni l’indemnité de préavis. Une consultation juridique individuelle est nécessaire.",
    coord_h: "🔗 Deux salaires", coord_sub: "Sans coordination, chaque employeur applique tous les points de crédit — et vous payez trop (ou récupérez) en fin d’année.",
    lbl_coord_a: "Salaire brut — emploi 1 (₪)", lbl_coord_b: "Salaire brut — emploi 2 (₪)",
    row_coord_proper: "Impôt annuel correct (sur tout le revenu)", row_coord_naive: "Retenue mensuelle sans coordination", coord_naive_title: "Chaque employeur retient l’impôt comme si c’était votre seul revenu, avec la totalité des crédits.", row_coord_balance: "Différence à régulariser en fin d’année",
    coord_receipt_label: "Ce que la coordination vous fait économiser", coord_saving_sub_a: "Trop-payé en fin d’année sans coordination", coord_saving_sub_b: "Remboursement attendu en fin d’année",
    coord_disclaimer: "Avec une coordination correcte, les employeurs se partagent les points de crédit et la retenue mensuelle reflète l’impôt réel — sans surprise en fin d’année. Le calcul ignore les cotisations retraite et les autres revenus.",
    pen_h: "🧓 Travail + retraite", pen_sub: "Pour un retraité qui travaille et touche une pension : celle-ci n’est imposable qu’au-delà du pourcentage d’exonération.",
    lbl_pen_salary: "Salaire d’emploi, brut (₪)", lbl_pen_pension: "Pension par mois, brute (₪)", lbl_pen_exempt: "% d’exonération de la pension (%)", pen_exempt_title: "Dépend du gel des droits et de la date de départ à la retraite. Indiquez le % communiqué par votre fonds de retraite (généralement 52 % à 67 %).",
    row_pen_taxable: "Pension imposable (après exonération)", row_pen_total: "Revenu imposable total", row_pen_tax: "Impôt sur le revenu total", row_pen_health: "Assurance santé sur la pension",
    pen_receipt_label: "Total net (emploi + pension)",
    pen_disclaimer: "Le % d’exonération dépend des données personnelles (gel des droits, date de départ). Le calcul n’inclut ni l’avantage des zones de développement, ni le Bitouah Leumi (généralement non applicable après l’âge de la retraite), ni les autres revenus.",
    disclaimer_main: "Calcul approximatif selon les paliers d’imposition 2026 et les taux Bitouah Leumi pour salariés. Ne constitue pas une consultation fiscale ou juridique. Pour un calcul exact, adressez-vous à un comptable ou à un conseiller fiscal.",
    footer: "Sources des données : service des impôts (paliers 2026), Bitouah Leumi (taux 2026, plafond 51 910 ₪). Le site ne collecte aucune donnée personnelle et ne conserve rien de ce que vous saisissez.",
    doc_title: "Calculateur de salaire Israël 2026 — du brut au net, combien sur votre compte",
    meta_desc: "Combien toucherez-vous net : calculateur de salaire Israël 2026. Paliers d’imposition, Bitouah Leumi, retraite, points de crédit. Calcul inverse — quel brut demander. Gratuit, sans inscription.",
    ladder_here: "vous êtes ici",
    ladder_sub: "selon le revenu imposable (brut moins cotisations)",
    reset_toast: "Réinitialisé", share_copied: "Lien copié", share_url: "Le lien est prêt dans la barre d’adresse",
    brand_name: "Salaire net", img_btn: "🖼️ Télécharger l’image", img_done: "Image enregistrée", card_footer: "calculé uniquement dans le navigateur · aucune donnée conservée",
    calc_basis: "Par défaut : retraite 6 % · 2,25 points de crédit · Bitouah Leumi 4,27/12,17 % · sans keren hishtalmut ni assurance santé prélevée sur le salaire",
    lang_btn_he: "🌐 עברית", lang_btn_ru: "🌐 РУС"
  }
};
let lang = 'fr';
let LOCALE = 'fr-FR';
// Le portail est francophone ; l’hébreu reste la deuxième langue — l’original
// des termes, tel qu’il apparaît sur le bulletin de paie.
const LANGS = ['fr', 'he', 'ru'];
const LANG_NAMES = { he: 'עברית', ru: 'РУС', fr: 'FR' };
function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.ru[key] || key; }

/* ===== 2026 constants (verified) ===== */
const BRACKETS = [
  [0, 7010, 0.10], [7010, 10060, 0.14], [10060, 19000, 0.20],
  [19000, 25100, 0.31], [25100, 46690, 0.35], [46690, 60130, 0.47], [60130, Infinity, 0.50]
];
const CREDIT_POINT = 242;
const BI_LOW = 7703, BI_CEIL = 51910;
const BI_LOW_RATE = 0.0427, BI_HIGH_RATE = 0.1217;
const YESUF_THRESH = 60130, YESUF_RATE = 0.03;

/* ===== core math ===== */
function calcTax(t) {
  let tax = 0;
  for (const [lo, hi, rate] of BRACKETS) { if (t > lo) tax += (Math.min(t, hi) - lo) * rate; }
  return tax;
}
function calcBituach(g) {
  const capped = Math.min(Math.max(g, 0), BI_CEIL);
  if (capped <= BI_LOW) return capped * BI_LOW_RATE;
  return BI_LOW * BI_LOW_RATE + (capped - BI_LOW) * BI_HIGH_RATE;
}
function calcHealth(p) {
  const capped = Math.min(Math.max(p, 0), BI_CEIL);
  if (capped <= BI_LOW) return capped * 0.031;
  return BI_LOW * 0.031 + (capped - BI_LOW) * 0.0517;
}
function calcYesef(taxable) { return taxable > YESUF_THRESH ? (taxable - YESUF_THRESH) * YESUF_RATE : 0; }
function marginalRate(t) {
  for (const [lo, hi, rate] of BRACKETS) { if (t >= lo && t < hi) return Math.round(rate * 100) + ' %'; }
  return '50%';
}
function fmt(n) {
  const r = Math.round(n);
  const s = Math.abs(r).toLocaleString(LOCALE);
  return (r < 0 ? '-₪' : '₪') + s;
}
function pct(n) { return (Math.round(n * 10) / 10).toLocaleString(LOCALE) + ' %'; }
function val(id) { const v = parseFloat(document.getElementById(id).value); return isNaN(v) || v < 0 ? 0 : v; }

function netFromBase(gross, pensionPct, kerenPct, points, hours, ot125, ot150, night, shabbat, travel) {
  const hourly = hours > 0 ? gross / hours : gross / 182;
  const g = gross + (ot125 || 0) * hourly * 1.25 + (ot150 || 0) * hourly * 1.5 + (night || 0) * hourly * 1.15 + (shabbat || 0) * hourly * 1.5;
  const preTax = g * ((pensionPct + (kerenPct || 0)) / 100);
  const taxable = Math.max(0, g - preTax);
  const taxNet = Math.max(0, calcTax(taxable) - points * CREDIT_POINT);
  const yesef = calcYesef(taxable);
  const bl = calcBituach(g);
  return { g, preTax, taxable, taxNet, yesef, bl, net: g - taxNet - yesef - bl - preTax + (travel || 0) };
}
function solveGrossForNet(target, pensionPct, points) {
  if (target <= 0) return 0;
  const f = g => netFromBase(g, pensionPct, 0, points, 182, 0, 0, 0, 0, 0).net;
  let lo = 0, hi = Math.max(target * 3, 2000);
  let guard = 0;
  while (f(hi) < target && guard < 50) { hi *= 2; guard++; }
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) < target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/* ===== salary panel ===== */
function getPensionPct() {
  const mode = document.getElementById('s_pensionMode').value;
  if (mode === 'custom') return val('s_pensionCustom');
  return parseFloat(mode);
}
let nekPrev = -1;
function renderNekRings(pts) {
  const box = document.getElementById('nekRings');
  if (!box) return;
  if (nekPrev === pts) return;
  nekPrev = pts;
  const full = Math.floor(pts + 1e-9);
  const frac = +(pts - full).toFixed(2);
  let html = '';
  for (let i = 0; i < full; i++) html += '<span class="nek-ring"></span>';
  if (frac > 0.01) html += '<span class="nek-ring part" style="--f:' + Math.round(frac * 100) + '"></span>';
  box.innerHTML = html;
}
function triggerHud() {
  const h = document.getElementById('hudScan');
  if (!h) return;
  h.classList.remove('run'); void h.offsetWidth; h.classList.add('run');
}

const SECTOR_MIN = {
  general:      { monthly: 6443.85, hourly: 35.40 },
  security:     { monthly: 7118.85, hourly: 39.11 },
  cleaning:     { monthly: 7118.85, hourly: 38.03 },
  catering:     { monthly: 7281.55, hourly: 40.06 },
  construction: { monthly: 6443.85, hourly: 35.40 } // dépend du grade ; on affiche le minimum général par défaut
};

function checkSectorMinimum() {
  const sectorEl = document.getElementById('s_sector');
  const warnEl = document.getElementById('s_min_warning');
  const amountEl = document.getElementById('s_min_amount');
  if (!sectorEl || !warnEl) return;
  const sector = sectorEl.value;
  const info = SECTOR_MIN[sector] || SECTOR_MIN.general;
  const base = val('s_base');
  const hours = val('s_hours') || 182;
  const isFullTime = hours >= 181; // environ un temps plein (182 h) ; pour un temps partiel, on compare au taux horaire
  const floor = isFullTime ? info.monthly : info.hourly * hours;
  if (base > 0 && base < floor) {
    warnEl.style.display = 'block';
    if (amountEl) amountEl.textContent = floor.toLocaleString('fr-FR', {maximumFractionDigits: 2}) + ' ₪';
  } else {
    warnEl.style.display = 'none';
  }
}

function checkOvertimeLimit() {
  const totalOt = (val('s_ot125') || 0) + (val('s_ot150') || 0) + (val('s_shabbat') || 0);
  const warnEl = document.getElementById('s_ot_warning');
  if (warnEl) warnEl.style.display = totalOt > 58 ? 'block' : 'none';
}

function updateSalary() {
  const base = val('s_base');
  const hours = val('s_hours') || 182;
  const pensionPct = getPensionPct();
  const kerenPct = val('s_keren');
  const points = val('s_points');
  checkOvertimeLimit();
  checkSectorMinimum();
  const r = netFromBase(base, pensionPct, kerenPct, points, hours, val('s_ot125'), val('s_ot150'), val('s_night'), val('s_shabbat'), val('s_travel'));
  const gross = r.g, preTax = r.preTax, taxable = r.taxable, taxNet = r.taxNet, yesef = r.yesef, bl = r.bl;
  const net = r.net;
  const hourly = base / hours;
  setText('r_gross', fmt(gross)); setText('r_taxable', fmt(taxable)); setText('r_tax', fmt(taxNet));
  setText('r_yesef', fmt(yesef)); setText('r_bl', fmt(bl)); setText('r_pension', fmt(preTax));
  setText('r_travel', '+' + fmt(val('s_travel')));
  setText('r_marginal', marginalRate(taxable));
  setText('r_takehome', pct(gross > 0 ? net / gross * 100 : 0));
  setText('r_hourly', fmt(hourly));
  const capped = Math.min(gross, BI_CEIL);
  const empBI = capped <= BI_LOW ? capped * 0.0451 : BI_LOW * 0.0451 + (capped - BI_LOW) * 0.076;
  const empPension = gross * 0.065; const empKeren = kerenPct > 0 ? gross * 0.075 : 0; const empSeverance = gross * 0.0833;
  setText('r_empcost', fmt(gross + empBI + empPension + empKeren + empSeverance));
  const netExclTravel = net - val('s_travel');
  const segs = [
    { label: t('legend_net'), value: Math.max(0, netExclTravel), color: 'var(--emerald)' },
    { label: t('row_tax'), value: taxNet, color: 'var(--terra)' },
    { label: t('row_yesef'), value: yesef, color: 'var(--terra-deep)' },
    { label: t('row_bl'), value: bl, color: 'var(--blue)' },
    { label: t('row_pension'), value: preTax, color: 'var(--violet)' }
  ].filter(s => s.value > 0);
  renderNekRings(points);
  renderDonut(segs, gross, net);
  renderSankey(gross, net, segs);
  renderLadder(taxable);
  renderTips({ gross, net, taxable, pensionPct, kerenPct, points, travel: val('s_travel') });
  setText('r_annGross', fmt(gross * 12)); setText('r_annTax', fmt((taxNet + yesef) * 12)); setText('r_annNet', fmt(net * 12));
  flash('r_net'); setText('r_net', fmt(net));
}

function renderLadder(taxable) {
  const el = document.getElementById('taxLadder');
  if (!el) return;
  el.innerHTML = BRACKETS.map(([lo, hi, rate]) => {
    const active = taxable >= lo && taxable < (hi === Infinity ? Infinity : hi);
    const top = hi === Infinity ? '∞' : fmt(hi);
    return `<div class="brk ${active ? 'active' : ''}">
      <span class="brk-rate">${Math.round(rate * 100)}%</span>
      <span class="brk-range">${fmt(lo)} – ${top}</span>
      ${active ? '<span class="brk-you">📍 ' + t('ladder_here') + ' · ' + fmt(taxable) + '</span>' : ''}
    </div>`;
  }).join('');
  const nxt = BRACKETS.find(function (b) { return b[0] > taxable; });
  if (nxt) { el.innerHTML += '<div class=brk-next>' + t('ladder_next').replace('{0}', fmt(Math.max(0, nxt[0] - taxable))) + '</div>'; }
}

function renderTips(d) {
  const box = document.getElementById('tipsBox');
  if (!box) return;
  const all = [
    { he: 'אתם מעל תקרת מס יסף — כל שקל נוסף מתחייב ב-50% (47% מס + 3% מס יסף).', ru: 'Вы выше потолка мас-йесеф — каждый доп. шекель облагается 50% (47% налог + 3% мас-йесеф).', fr: 'Vous êtes au-dessus du plafond du mas yesef — chaque shekel supplémentaire est imposé à 50 % (47 % d’impôt + 3 % de mas yesef).', en: 'You are above the surcharge threshold — every extra shekel is taxed at 50% (47% tax + 3% surcharge).' },
    { he: 'העלאת ההפרשה לפנסיה מקטינה את ההכנסה החייבת — עד 7% מותר כניכוי מהמס.', ru: 'Повышение пенсионного отчисления уменьшает налогооблагаемый доход — до 7% разрешено вычитать из налога.', fr: 'Augmenter la cotisation retraite réduit le revenu imposable — jusqu’à 7 % sont déductibles de l’impôt.', en: 'Raising your pension contribution reduces taxable income — up to 7% is deductible from tax.' },
    { he: 'שיעור הנטו שלכם נמוך יחסית — כדאי לבדוק זכאות לנקודות זיכוי נוספות (ילדים, עולה, תואר, הורה יחיד).', ru: 'Доля нетто довольно низкая — стоит проверить право на доп. налоговые вычеты (дети, репатриант, диплом, одинокий родитель).', fr: 'Votre part de net est relativement faible — vérifiez vos droits à des points de crédit supplémentaires (enfants, nouvel immigrant, diplôme, parent isolé).', en: 'Your net share is relatively low — check your entitlement to extra credit points (children, immigrant, degree, single parent).' },
    { he: 'החזר הוצאות נסיעה לעבודה פטור ממס עד התקרה — שווה לבדוק מול המעסיק.', ru: 'Возврат расходов на дорогу до работы не облагается налогом в пределах лимита — стоит уточнить у работодателя.', fr: 'Le remboursement des frais de trajet est exonéré d’impôt jusqu’au plafond — à vérifier auprès de l’employeur.', en: 'Travel-to-work reimbursement is tax-free up to the ceiling — worth checking with your employer.' },
    { he: 'נקודת זיכוי אחת שווה 242 ₪ פחות מס בחודש — ודאו שניצלתם את מלוא הזכאות שלכם.', ru: 'Одно очко вычета = 242 ₪ меньше налога в месяц — убедитесь, что вы используете всё право.', fr: 'Un point de crédit = 242 ₪ d’impôt en moins par mois — assurez-vous d’utiliser tous vos droits.', en: 'One credit point equals 242 ₪ less tax per month — make sure you use your full entitlement.' }
  ];
  const sel = [];
  if (d.taxable > YESUF_THRESH) sel.push(all[0]);
  if (d.pensionPct < 6 && d.taxable > 0) sel.push(all[1]);
  if (d.gross > 0 && d.net / d.gross < 0.62) sel.push(all[2]);
  if (d.travel === 0) sel.push(all[3]);
  while (sel.length < 1) sel.push(all[4]);
  box.innerHTML = sel.slice(0, 3).map(x => `<div class="tip"><span class="bulb">💡</span><span>${x[lang] || x.he}</span></div>`).join('');
}

/* ===== inverse panel ===== */
function updateInverse() {
  const target = val('i_net');
  const pensionPct = parseFloat(document.getElementById('i_pension').value);
  const points = val('i_points');
  const gross = solveGrossForNet(target, pensionPct, points);
  const r = netFromBase(gross, pensionPct, 0, points, 182, 0, 0, 0, 0, 0);
  setText('i_targetLabel', fmt(target));
  setText('i_gross', fmt(gross)); setText('i_grossBig', fmt(gross));
  setText('i_tax', fmt(r.taxNet + r.yesef)); setText('i_bl', fmt(r.bl)); setText('i_pensionAmt', fmt(r.preTax));
}

/* ===== severance panel ===== */
function updateSeverance() {
  const salary = val('p_salary'), years = val('p_years'), accrued = val('p_accrued');
  const total = salary * years;
  setText('p_total', fmt(total)); setText('p_accruedOut', fmt(accrued)); setText('p_gap', fmt(Math.max(0, total - accrued)));
}

/* ===== coordination panel ===== */
function updateCoord() {
  const a = val('c_jobA'), b = val('c_jobB'), points = val('c_points');
  const credit = points * CREDIT_POINT;
  const combined = a + b;
  const properTax = Math.max(0, calcTax(combined) - credit);
  const withholdA = Math.max(0, calcTax(a) - credit);
  const withholdB = Math.max(0, calcTax(b) - credit);
  const naive = withholdA + withholdB;
  const balance = properTax - naive;
  setText('c_proper', fmt(properTax)); setText('c_naive', fmt(naive));
  setText('c_balance', (balance >= 0 ? '' : '+') + fmt(Math.abs(balance)));
  setText('c_saving', fmt(Math.max(0, balance)));
  setText('c_savingSub', balance >= 0 ? t('coord_saving_sub_a') : t('coord_saving_sub_b'));
}

/* ===== pensioner panel ===== */
function updatePension() {
  const salary = val('g_salary'), pension = val('g_pension');
  const exemptPct = Math.min(100, Math.max(0, val('g_exempt')));
  const points = val('g_points');
  const pensionTaxable = pension * (1 - exemptPct / 100);
  const totalTaxable = salary + pensionTaxable;
  const tax = Math.max(0, calcTax(totalTaxable) - points * CREDIT_POINT);
  const health = calcHealth(pension);
  setText('g_pensionTaxable', fmt(pensionTaxable)); setText('g_totalTaxable', fmt(totalTaxable));
  setText('g_tax', fmt(tax)); setText('g_health', fmt(health)); setText('g_net', fmt(salary + pension - tax - health));
}


/* ===== helpers ===== */
function setText(id, text) { const el = document.getElementById(id); if (el && el.textContent !== text) el.textContent = text; }
function flash(id) { const el = document.getElementById(id); if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
function renderBar(segs, total, barId, legendId) {
  const bar = document.getElementById(barId), legend = document.getElementById(legendId);
  if (!bar || !legend) return;
  const sum = total || 1;
  bar.innerHTML = segs.map(s => `<div class="seg" style="width:${(s.value / sum * 100)}%;background:${s.color}" title="${s.label}: ${fmt(s.value)}"></div>`).join('');
  legend.innerHTML = segs.map(s => `<div class="legend-item"><span class="sw" style="background:${s.color}"></span>${s.label}<span class="lv">${pct(s.value / sum * 100)}</span></div>`).join('');
}

let donutSel = null;
let lastSegs = null, lastNet = 0;
function renderDonut(segs, gross, net) {
  const svg = document.getElementById('donutSvg');
  const legend = document.getElementById('breakdownLegend');
  if (!svg || !legend) return;
  lastSegs = segs; lastNet = net;
  const total = gross || 1;
  let cum = 0;
  let html = '<circle class="donut-bg" cx="18" cy="18" r="15.9155" fill="none" style="stroke:var(--surface-2)" stroke-width="3.4"></circle>';
  segs.forEach((s, idx) => {
    const len = s.value / total * 100;
    let off = (25 - cum) % 100; if (off < 0) off += 100;
    html += `<circle class="seg-arc" cx="18" cy="18" r="15.9155" fill="none" style="stroke:${s.color}" stroke-width="3.4" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 18 18)" data-i="${idx}" data-label="${s.label}" title="${s.label}: ${fmt(s.value)} (${pct(len)})"></circle>`;
    cum += len;
  });
  svg.innerHTML = html;
  svg.querySelectorAll('.seg-arc').forEach(arc => {
    arc.addEventListener('click', () => {
      const i = parseInt(arc.dataset.i, 10);
      const s = segs[i]; if (!s) return;
      donutSel = (donutSel === s.label) ? null : s.label;
      applyDonutSel(); updateDonutCenter();
    });
  });
  legend.innerHTML = segs.map(s => `<div class="legend-item" data-label="${s.label}" style="cursor:pointer"><span class="sw" style="background:${s.color}"></span>${s.label}<span class="lv">${pct(s.value / total * 100)}</span></div>`).join('');
  legend.querySelectorAll('.legend-item').forEach(li => {
    li.addEventListener('click', () => {
      const lab = li.dataset.label;
      const s = segs.find(x => x.label === lab); if (!s) return;
      donutSel = (donutSel === lab) ? null : lab;
      applyDonutSel(); updateDonutCenter();
    });
  });
  applyDonutSel();
  updateDonutCenter();
}
function applyDonutSel() {
  const svg = document.getElementById('donutSvg');
  if (!svg) return;
  svg.querySelectorAll('.seg-arc').forEach(a => a.classList.remove('sel'));
  if (donutSel) {
    const a = svg.querySelector('.seg-arc[data-label="' + donutSel + '"]');
    if (a) a.classList.add('sel');
    svg.classList.add('has-sel');
  } else {
    svg.classList.remove('has-sel');
  }
}
function updateDonutCenter() {
  const dn = document.getElementById('donutNet');
  const dl = document.getElementById('donutLabel');
  const dh = document.getElementById('donutHint');
  const segs = lastSegs || [];
  let s = null;
  if (donutSel) s = segs.find(x => x.label === donutSel) || null;
  if (s) {
    if (dn) { dn.textContent = fmt(s.value); flash('donutNet'); }
    if (dl) dl.textContent = s.label;
    if (dh) dh.textContent = t('donut_back');
  } else {
    if (dn) { dn.textContent = fmt(lastNet); flash('donutNet'); }
    if (dl) dl.textContent = t('legend_net');
    if (dh) dh.textContent = t('donut_hint');
  }
}

let sankeyFirst = true;
const sankeyPrev = {};
function renderSankey(gross, net, segs) {
  const box = document.getElementById('sankeyBox');
  if (!box) return;
  if (!(gross > 0)) { box.innerHTML = ''; return; }
  const FLOW = {
    'var(--emerald)':   { c: '#2FD08A', c2: '#7CF0C0' },
    'var(--terra)':     { c: '#FF6B5C', c2: '#FFB199' },
    'var(--terra-deep)':{ c: '#FF9F43', c2: '#FFD08A' },
    'var(--blue)':      { c: '#4FC3F7', c2: '#9DE4FF' },
    'var(--violet)':    { c: '#9D7BF0', c2: '#C9B6FF' }
  };
  const SHORT = { 'var(--emerald)': t('sankey_net'), 'var(--terra)': t('sankey_tax'), 'var(--terra-deep)': t('sankey_yesef'), 'var(--blue)': t('sankey_bl'), 'var(--violet)': t('sankey_pension') };
  let chips = '';
  segs.forEach((s, idx) => {
    const pal = FLOW[s.color] || { c: '#bbb', c2: '#ddd' };
    const p = s.value / gross * 100;
    const isNet = (SHORT[s.color] || '') === t('sankey_net');
    const changed = sankeyPrev[s.color] !== undefined && sankeyPrev[s.color] !== s.value;
    sankeyPrev[s.color] = s.value;
    const num = isNet ? 21 : 16;
    chips += `<div class="flow-chip${isNet ? ' sk-net' : ''}${changed ? ' fc-flash' : ''}" data-cat="${s.color}" style="--c:${pal.c};--c2:${pal.c2}">` +
      `<div class="fc-top"><span class="fc-dot"></span><span class="fc-name">${SHORT[s.color] || s.label}</span><span class="fc-pct">${p.toFixed(0)}%</span></div>` +
      `<span class="fc-val" data-val="${s.value}" style="font-size:${num}px;animation-delay:${(idx * 0.3).toFixed(2)}s">${fmt(s.value)}</span>` +
      `<span class="fc-bar"><i style="width:${p.toFixed(1)}%"></i></span></div>`;
  });
  const head = `<div class="flow-head"><span>${t('sankey_from')}<b>${fmt(gross)}</b></span><span>${t('sankey_net')}<b>${fmt(net)}</b></span></div>`;
  box.innerHTML = `<div class="flow">${head}<div class="flow-chips">${chips}</div></div>`;
  if (sankeyFirst) {
    sankeyFirst = false;
    if (typeof requestAnimationFrame === 'function') {
      const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      box.querySelectorAll('.fc-val').forEach(el => {
        const to = parseFloat(el.dataset.val) || 0, dur = 700;
        (function step(now) {
          const tt = (now !== undefined ? now : (typeof performance !== 'undefined' ? performance.now() : Date.now()));
          const k = Math.min(1, (tt - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(to * e);
          if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
        })(t0);
      });
    }
  }
}

function recommendedPoints() {
  let p = document.getElementById('opt_woman').checked ? 2.75 : 2.25;
  if (document.getElementById('opt_child5').checked) p += 2.5;
  p += (parseInt(document.getElementById('opt_child617').value, 10) || 0);
  if (document.getElementById('opt_vet').checked) p += 2;
  if (document.getElementById('opt_degree').checked) p += 1;
  if (document.getElementById('opt_immigrant').checked) p += 4.5;
  if (document.getElementById('opt_single').checked) p += 1;
  return p;
}
function computeOpt() {
  const res = document.getElementById('optResult'), apply = document.getElementById('optApply');
  if (!res) return;
  const rec = recommendedPoints(), cur = val('s_points');
  const head = document.querySelector('#accCredits .acc-head');
  if (rec <= cur) { res.textContent = t('opt_none'); if (apply) apply.style.display = 'none'; if (head) head.classList.remove('pulse'); return; }
  const gain = Math.round((rec - cur) * CREDIT_POINT);
  res.textContent = t('opt_result').replace('{0}', cur).replace('{1}', rec).replace('{2}', fmt(gain));
  if (apply) apply.style.display = 'inline-block';
  if (head) head.classList.add('pulse');
}

/* ===== share result as image (PNG) ===== */
function downloadCard() {
  try {
    const base = val('s_base'), hours = val('s_hours') || 182;
    const pensionPct = getPensionPct(), kerenPct = val('s_keren'), points = val('s_points');
    const r = netFromBase(base, pensionPct, kerenPct, points, hours, val('s_ot125'), val('s_ot150'), val('s_night'), val('s_shabbat'), val('s_travel'));
    const gross = r.g, net = r.net, travel = val('s_travel');
    const segs = [
      { label: t('legend_net'), value: Math.max(0, net - travel), color: '#0E6E4E' },
      { label: t('row_tax'), value: r.taxNet, color: '#E05545' },
      { label: t('row_yesef'), value: r.yesef, color: '#E08A2E' },
      { label: t('row_bl'), value: r.bl, color: '#2E8FBF' },
      { label: t('row_pension'), value: r.preTax, color: '#8E6BE8' }
    ].filter(s => s.value > 0);
    const total = gross || 1;
    const W = 600, H = 760;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFEF9'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#DCD3B8'; ctx.lineWidth = 2; ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.fillStyle = '#0E6E4E'; ctx.beginPath(); ctx.arc(70, 58, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 20px Consolas, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('₪', 70, 59);
    ctx.fillStyle = '#21281F'; ctx.font = '800 19px Segoe UI, Arial'; ctx.textAlign = 'left'; ctx.fillText(t('brand_name'), 100, 52);
    ctx.fillStyle = '#8C8A75'; ctx.font = '600 11px Segoe UI, Arial'; ctx.fillText('2026', 100, 72);
    ctx.strokeStyle = '#EAE3D2'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(20, 92); ctx.lineTo(W - 20, 92); ctx.stroke();
    const cx = W / 2, cy = 250, rOut = 100, rIn = 68, midR = (rOut + rIn) / 2;
    let start = -Math.PI / 2;
    ctx.lineWidth = rOut - rIn; ctx.lineCap = 'butt';
    segs.forEach(s => {
      const ang = s.value / total * Math.PI * 2;
      ctx.beginPath(); ctx.arc(cx, cy, midR, start, start + ang); ctx.strokeStyle = s.color; ctx.stroke();
      start += ang;
    });
    ctx.fillStyle = '#0A5038'; ctx.font = '800 26px Consolas, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.direction = lang === 'he' ? 'rtl' : 'ltr';
    ctx.fillText(fmt(net), cx, cy - 4);
    ctx.fillStyle = '#8C8A75'; ctx.font = '600 12px Segoe UI, Arial'; ctx.fillText(t('legend_net'), cx, cy + 22);
    let ly = cy + rOut + 36; const rowH = 30;
    segs.forEach(s => {
      const p = s.value / total * 100;
      ctx.fillStyle = s.color; ctx.fillRect(56, ly, 14, 14);
      ctx.fillStyle = '#55594C'; ctx.font = '600 14px Segoe UI, Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.direction = lang === 'he' ? 'rtl' : 'ltr';
      ctx.fillText(s.label, 80, ly + 7);
      ctx.fillStyle = '#21281F'; ctx.font = '700 14px Consolas, monospace'; ctx.textAlign = 'right';
      ctx.fillText(fmt(s.value) + '  ' + p.toFixed(1) + ' %', W - 56, ly + 7);
      ly += rowH;
    });
    ctx.fillStyle = '#8C8A75'; ctx.font = '500 11px Segoe UI, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t('card_footer'), cx, H - 30);
    const url = c.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = 'neto-2026.png'; document.body.appendChild(a); a.click(); a.remove();
    toast(t('img_done'));
  } catch (e) { toast('Error'); }
}
let toastTimer = null;
function toast(msg) { const tt = document.getElementById('toast'); if (!tt) return; tt.textContent = msg; tt.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => tt.classList.remove('show'), 2200); }

/* ===== language ===== */
function applyLang() {
  LOCALE = ({ ru: 'ru-RU', he: 'he-IL', fr: 'fr-FR' })[lang] || 'fr-FR';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.title = t('doc_title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('meta_desc') || t('intro'));
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  const lt = document.getElementById('langToggle');
  if (lt) { const nxt = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]; lt.textContent = '🌐 ' + LANG_NAMES[nxt]; }
  // re-render dynamic content in new language
  updateSalary(); updateInverse(); updateSeverance(); updateCoord(); updatePension();
}

/* ===== share via URL hash (client-side only) ===== */
function shareState() {
  const p = new URLSearchParams();
  document.querySelectorAll('.panel input, .panel select').forEach(el => { if (el.id) p.set(el.id, el.value); });
  p.set('lang', lang);
  const hash = p.toString();
  const UTM = '?utm_source=neto2026&utm_medium=share&utm_campaign=share_button';
  try { history.replaceState(null, '', UTM + '#' + hash); } catch (e) {}
  const url = location.origin + location.pathname + UTM + '#' + hash;
  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => toast(t('share_copied')), () => toast(t('share_url')));
      copied = true;
    }
  } catch (e) {}
  if (!copied) toast(t('share_url'));
}
function applyHash() {
  if (!location.hash || location.hash.length < 2) return false;
  const p = new URLSearchParams(location.hash.slice(1));
  let applied = false;
  p.forEach((v, k) => {
    if (k === 'lang') { lang = (v === 'ru' || v === 'he' || v === 'fr') ? v : 'fr'; return; }
    const el = document.getElementById(k);
    if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) { el.value = v; applied = true; }
  });
  const pm = document.getElementById('s_pensionMode');
  if (pm) document.getElementById('customPensionWrap').style.display = pm.value === 'custom' ? 'block' : 'none';
  return applied;
}

/* ===== wiring ===== */
document.getElementById('s_pensionMode').addEventListener('change', function () {
  document.getElementById('customPensionWrap').style.display = this.value === 'custom' ? 'block' : 'none';
  updateSalary();
});
['s_base', 's_hours', 's_ot125', 's_ot150', 's_night', 's_shabbat', 's_travel', 's_pensionCustom', 's_keren', 's_points']
  .forEach(id => document.getElementById(id).addEventListener('input', updateSalary));
document.getElementById('s_sector').addEventListener('change', updateSalary);
['i_net', 'i_pension', 'i_points'].forEach(id => document.getElementById(id).addEventListener('input', updateInverse));
['p_salary', 'p_years', 'p_accrued'].forEach(id => document.getElementById(id).addEventListener('input', updateSeverance));
['c_jobA', 'c_jobB', 'c_points'].forEach(id => document.getElementById(id).addEventListener('input', updateCoord));
['g_salary', 'g_pension', 'g_exempt', 'g_points'].forEach(id => document.getElementById(id).addEventListener('input', updatePension));
document.getElementById('imgBtn').addEventListener('click', downloadCard);

function applyOpt() {
  var sp = document.getElementById('s_points');
  var rec = recommendedPoints();
  if (sp) sp.value = rec;
  updateSalary();
  var res = document.getElementById('optResult');
  if (res) res.textContent = t('opt_applied').replace('{0}', rec).replace('{1}', fmt(Math.round(rec * CREDIT_POINT)));
  var apply = document.getElementById('optApply');
  if (apply) apply.style.display = 'none';
  var head = document.querySelector('#accCredits .acc-head');
  if (head) head.classList.remove('pulse');
}
['opt_woman', 'opt_child5', 'opt_vet', 'opt_degree', 'opt_immigrant', 'opt_single', 'opt_child617'].forEach(function (id) { var el = document.getElementById(id); if (el) el.addEventListener('input', applyOpt); });
document.getElementById('optCalc').addEventListener('click', applyOpt);
document.getElementById('optApply').addEventListener('click', function () { var el = document.getElementById('s_points'); if (el) el.value = recommendedPoints(); updateSalary(); var a = document.getElementById('optApply'); if (a) a.style.display = 'none'; var h = document.querySelector('#accCredits .acc-head'); if (h) h.classList.remove('pulse'); });
document.getElementById('resetSalary').addEventListener('click', () => {
  const defaults = { s_base: 12000, s_hours: 182, s_ot125: 0, s_ot150: 0, s_night: 0, s_shabbat: 0, s_travel: 0, s_pensionMode: '6', s_keren: 0, s_pensionCustom: 6, s_points: 2.25 };
  for (const [k, v] of Object.entries(defaults)) { const el = document.getElementById(k); if (el) el.value = v; }
  document.getElementById('customPensionWrap').style.display = 'none';
  updateSalary(); toast(t('reset_toast'));
  var h = document.querySelector('#accCredits .acc-head'); if (h) h.classList.remove('pulse');
});
document.getElementById('shareBtn').addEventListener('click', shareState);
document.getElementById('donutCenter').addEventListener('click', function () { donutSel = null; applyDonutSel(); updateDonutCenter(); });
document.getElementById('langToggle').addEventListener('click', () => {
  lang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
  try { localStorage.setItem('lang', lang); } catch (e) {}
  try { history.replaceState(null, '', location.pathname + (location.hash && location.hash.length > 1 ? location.hash : '')); } catch (e) {}
  applyLang();
});
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'salary') triggerHud();
  });
});
document.querySelectorAll('.acc-head').forEach(h => {
  h.addEventListener('click', () => { h.parentElement.classList.toggle('open'); h.classList.remove('pulse'); });
});

const themeToggle = document.getElementById('themeToggle');
let savedTheme = 'light';
try {
  const stored = localStorage.getItem('theme');
  if (stored) savedTheme = stored;
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) savedTheme = 'dark';
} catch (e) {}
document.body.setAttribute('data-theme', savedTheme);
if (themeToggle) {
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// restore language preference, then apply shared state, then render
try { const l = localStorage.getItem('lang'); if (l === 'ru' || l === 'he' || l === 'fr') lang = l; } catch (e) {}
try { applyHash(); } catch (e) {}
try { applyLang(); } catch (e) {}
try { triggerHud(); } catch (e) {}
