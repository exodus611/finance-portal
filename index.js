/* ═══════════════════════════════════════════════
   ShekelPRO — логика + i18n (RU / FR / EN)
   Свой набор SVG-иконок: рендер одинаков везде
   ═══════════════════════════════════════════════ */
window.__SHEKEL_BOOTED__ = true;
const BASE = 'https://exodus611.github.io/finance-portal/';
let curLang = 'ru';
const FR_OK = new Set(['arnona','ashlamat-ahnasa','auto','avtahat-ahnasa','avtala','havraa','hisahon-yeled','keren-hishtalmut','kredit','maanak-avoda','mas-rehisha','mas-shevach','mashkanta','nekudot-zikuy','payments','pension-gap','pension-calc','salary','siud','slovar','tablo','valuta']);
const u = f => {
  const s = String(f);
  if (s.includes('/') || !/\.html$/.test(s)) return BASE + s;
  const name = s.replace(/\.html$/, '');
  if (curLang === 'en') return BASE + 'en/' + s;
  if (curLang === 'fr' && FR_OK.has(name)) return BASE + 'fr/' + s;
  return BASE + s;
};
const P = {
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  flame:'<path d="M12 21c-3.9 0-7-3-7-6.8C5 10 8 6.5 12 3c4 3.5 7 7 7 11.2 0 3.8-3.1 6.8-7 6.8z"/><path d="M12 21c-1.8 0-3-1.4-3-3.1 0-1.9 1.4-3.4 3-4.9 1.6 1.5 3 3 3 4.9 0 1.7-1.2 3.1-3 3.1z"/>',
  briefcase:'<rect x="3" y="8" width="18" height="12" rx="3"/><path d="M9 8V6a3 3 0 0 1 3-3 3 3 0 0 1 3 3v2M3 13h18"/>',
  wallet:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 15h2"/>',
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  car:'<path d="M5 16l1.5-5a2 2 0 0 1 1.9-1.5h7.2a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><circle cx="7.5" cy="20" r="1.4"/><circle cx="16.5" cy="20" r="1.4"/>',
  card:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>',
  scale:'<path d="M12 4v16M5 7h14"/><path d="M5 7l-2.5 5a3 3 0 0 0 5 0z"/><path d="M19 7l-2.5 5a3 3 0 0 0 5 0z"/><path d="M8 20h8"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 3v4h-4"/>',
  gem:'<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M12 20L8 9l4-5 4 5z"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2.5 2.5M14 9l2 2"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
  tag:'<path d="M3 11l9-8h7a2 2 0 0 1 2 2v7l-9 8z"/><circle cx="16" cy="8" r="1.6"/>',
  doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  plus:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  life:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M5.8 5.8l3.9 3.9M14.3 14.3l3.9 3.9M18.2 5.8l-3.9 3.9M9.7 14.3l-3.9 3.9"/>',
  heart:'<path d="M12 20.5C7 16.5 3 13 3 9.5A4.5 4.5 0 0 1 7.5 5c1.9 0 3.6 1 4.5 2.6A4.5 4.5 0 0 1 16.5 5 4.5 4.5 0 0 1 21 9.5c0 3.5-4 7-9 11z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>',
  grad:'<path d="M2 9l10-4.5L22 9l-10 4.5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v5"/>',
  star:'<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9z"/>',
  calculator:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"/>',
  swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.7 2.3 4 5.2 4 8.5s-1.3 6.2-4 8.5c-2.7-2.3-4-5.2-4-8.5s1.3-6.2 4-8.5z"/>',
  fuel:'<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M4 21h12M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9.8L19.5 7"/><path d="M7.5 7h6v4h-6z"/>',
  book:'<path d="M12 6c-1.8-1.6-4.2-2-7-2v14c2.8 0 5.2.4 7 2 1.8-1.6 4.2-2 7-2V4c-2.8 0-5.2.4-7 2z"/><path d="M12 6v14"/>',
  shield:'<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  badge:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5H4.5z"/><path d="M10 21a2.5 2.5 0 0 0 4 0"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 7l9 6 9-6"/>',
  sun:'<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  moon:'<path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z"/>',
  phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  bank:'<path d="M3 21h18M4 18h16M5 18v-7M9 18v-7M15 18v-7M19 18v-7M3 8l9-5 9 5z"/>',
  chart:'<path d="M3 20h18M5 20V10M10 20v-6M15 20v-9M20 20V7"/>',
  pie:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12h8.5"/>',
  dollar:'<path d="M12 3v18M16.5 7.5c0-1.9-2-3-4.5-3s-4.5 1.1-4.5 3S9.5 10.4 12 11s4.5 1.6 4.5 3.5-2 3-4.5 3-4.5-1.1-4.5-3"/>',
  euro:'<path d="M17 5.5A7 7 0 0 0 7 12a7 7 0 0 0 10 6.5M4.5 10h8M4.5 14h7"/>',
  percent:'<path d="M19 5L5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  chartdown:'<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  baby:'<circle cx="12" cy="9" r="4.5"/><path d="M10.5 9h.01M13.5 9h.01M10.5 11.5c.9.8 2.1.8 3 0"/><path d="M4.5 21c1-3.5 4-5.5 7.5-5.5s6.5 2 7.5 5.5"/>',
  msg:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  play:'<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
  up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
  chevron:'<path d="M6 9l6 6 6-6"/>'
};
function ico(name, size = 20, cls = ''){
  const s = size || 20;
  return `<svg class="ic ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.grid}</svg>`;
}
function initIcons(){
  document.querySelectorAll('[data-ico]').forEach(el => {
    el.innerHTML = ico(el.dataset.ico, el.dataset.size || 20);
  });
}
const I18N = {
  meta_title: { ru:'Финансы Израиля 2026: калькуляторы зарплаты, машканты и пенсии — ShekelPRO', fr:"ShekelPRO — les finances en Israël en premium : calculateurs, mashkanta, retraite | 2026", en:"ShekelPRO — Personal finance in Israel, the premium way | 2026" },
  brand_tag: { ru:'финансы Израиля', fr:"finances d'Israël", en:'Israel finance' },
  nav_calc: { ru:'Калькуляторы', fr:'Calculateurs', en:'Calculators' },
  nav_tablo: { ru:'Табло', fr:'Tableau', en:'Dashboard' },
  nav_pay: { ru:'Даты выплат', fr:'Dates de versement', en:'Payment dates' },
  nav_cyber: { ru:'Киберщит', fr:'CyberBouclier', en:'Cyber Shield' },
  nav_slovar: { ru:'Словарь', fr:'Glossaire', en:'Glossary' },
  nav_valuta: { ru:'Курс валют', fr:'Taux de change', en:'Exchange rates' },
  hdr_all: { ru:'Все калькуляторы', fr:'Catalogue', en:'All calculators' },
  lang_title: { ru:'Язык', fr:'Langue', en:'Language' },
  theme_title: { ru:'Светлая / тёмная тема', fr:'Thème clair / sombre', en:'Light / dark theme' },
  hero_badge: { ru:'Проверка данных: {date}', fr:'Vérification des données : {date}', en:'Data checked: {date}' },
  hero_partial: { ru:'Проверка: {date} · часть источников недоступна', fr:'Vérification : {date} · certaines sources indisponibles', en:'Checked: {date} · some sources unavailable' },
  hero_unavailable: { ru:'Дата проверки недоступна · показаны сохранённые данные', fr:'Date de vérification indisponible · données enregistrées', en:'Check date unavailable · showing saved data' },
  cyber_alert_new: { ru:'Киберщит: новое предупреждение', fr:'CyberBouclier : nouvelle alerte', en:'Cyber Shield: new warning' },
  cyber_alert_close: { ru:'Закрыть', fr:'Fermer', en:'Close' },
  sp_h: { ru:'Smart Prompt для вашего ИИ — умный запрос для любого поиска', fr:'Smart Prompt pour votre IA — une demande intelligente pour toute recherche', en:'Smart Prompt for your AI — a smart request for any search' },
  sp_s: { ru:'Напишите обычными словами, что нужно, — найти специалиста, товар, отель, работу или информацию, объяснить сложную тему — или чтобы нейросеть сама что-то сделала: дизайн, текст, план, сайт. Соберём точный умный запрос и вставим его в вашу нейросеть (ChatGPT, Gemini, Claude): она найдёт варианты по реальным источникам, а для специалистов ещё и проверит лицензию по официальным реестрам.', fr:'Écrivez avec vos mots ce qu’il vous faut — trouver un spécialiste, un produit, un hôtel, un emploi ou une information, expliquer un sujet compliqué — ou demander à l’IA de faire quelque chose elle-même : un design, un texte, un plan, un site. Nous composons une demande intelligente précise pour votre IA (ChatGPT, Gemini, Claude) : elle trouvera des options dans des sources réelles et, pour les spécialistes, vérifiera aussi la licence dans les registres officiels.', en:'Write in your own words what you need — to find a specialist, a product, a hotel, a job or information, to explain a hard topic — or to have the AI make something itself: a design, a text, a plan, a website. We will build a precise smart request for your AI (ChatGPT, Gemini, Claude): it will find options from real sources and, for specialists, also verify the licence in official registries.' },
  sp_only: { ru:'★ Только у нас', fr:'★ Exclusif', en:'★ Only here' },
  sp_ph: { ru:'например: детский стоматолог в Тель-Авиве, русскоговорящий\nили: недорогой отель во Флоренции на 3 ночи\nили: сравнить цены на телефон с хорошей камерой\nили: объясни простыми словами, что такое кэрен иштальмут\nили: сделай редизайн моего сайта услуг', fr:'ex. : dentiste pour enfants à Tel-Aviv, russophone\nou : hôtel pas cher à Florence pour 3 nuits\nou : comparer les prix d’un téléphone avec un bon appareil photo\nou : explique simplement ce qu’est un keren hishtalmut\nou : fais la refonte de mon site de services', en:'e.g.: children’s dentist in Tel Aviv, Russian-speaking\nor: cheap hotel in Florence for 3 nights\nor: compare prices of a phone with a good camera\nor: explain in simple words what a keren hishtalmut is\nor: redesign my services website' },
  sp_copy: { ru:'🧠 Собрать и скопировать запрос', fr:'🧠 Composer et copier la demande', en:'🧠 Build & copy the request' },
  sp_clear: { ru:'Очистить поле', fr:'Effacer', en:'Clear the field' },
  sp_gemini: { ru:'Gemini — в 2 шага', fr:'Gemini — en 2 étapes', en:'Gemini — in 2 steps' },
  sp_step2: { ru:'✓ Скопировано! Теперь открыть Gemini', fr:'✓ Copié ! Ouvrir Gemini', en:'✓ Copied! Now open Gemini' },
  sp_copied: { ru:'✓ Запрос скопирован! Вставьте его в чат со своей нейросетью — кнопки ChatGPT и Claude выше подставят его сами, для Gemini нажмите её кнопку ещё раз.', fr:'✓ Demande copiée ! Collez-la dans votre IA — ChatGPT et Claude ci-dessus l’insèrent automatiquement ; pour Gemini, cliquez encore son bouton.', en:'✓ Request copied! Paste it into your AI chat — ChatGPT and Claude above insert it automatically; for Gemini, click its button once more.' },
  sp_note: { ru:'⚠️ Отвечает ваша нейросеть, не наш сайт: проверяйте факты, цены и лицензии по ссылкам на источники из ответа — нейросеть может ошибаться. Тип поиска определяется автоматически по тексту, но можно выбрать кнопками выше.', fr:'⚠️ C’est votre IA qui répond, pas notre site : vérifiez les faits, les prix et les licences via les liens sources de la réponse — une IA peut se tromper. Le type de recherche est détecté automatiquement, ou choisi avec les boutons ci-dessus.', en:'⚠️ Your AI answers, not our site: check facts, prices and licences via the source links in its answer — an AI can make mistakes. The search type is detected automatically, or pick it with the buttons above.' },
  sp_manual: { ru:'А лицензию специалиста можно проверить вручную по официальным реестрам →', fr:'Et la licence d’un spécialiste peut être vérifiée manuellement dans les registres officiels →', en:'And a specialist’s licence can be checked manually in the official registries →' },
  hero_h1_a: { ru:'Финансы Израиля —', fr:'Les finances en Israël —', en:'Israel’s finances —' },
  hero_h1_b: { ru:'просто, честно, красиво', fr:'simples, honnêtes, élégantes', en:'simple, honest, beautiful' },
  hero_sub: { ru:'32 бесплатных калькулятора, живое табло экономики и словарь, который объясняет банкиров лучше банкиров. Считаем в вашем браузере — ничего не отправляем и не сохраняем.', fr:"32 calculateurs gratuits, un tableau de bord économique en direct et un glossaire qui explique les banquiers mieux qu'eux-mêmes. Tout se calcule dans votre navigateur — rien n'est envoyé ni stocké.", en:'32 free calculators, a live economic dashboard and a glossary that explains bankers better than bankers. Everything runs in your browser — nothing is sent or stored.' },
  cta_calc: { ru:'Выбрать калькулятор', fr:'Choisir un calculateur', en:'Pick a calculator' },
  cta_tablo: { ru:'Табло экономики', fr:"Tableau de l'économie", en:'Economic dashboard' },
  cta_goal: { ru:'Финансовая цель', fr:'Objectif financier', en:'Financial goal' },
  stat1: { ru:'калькулятора', fr:'calculateurs', en:'calculators' },
  stat2: { ru:'комбинаций машканты', fr:'combinaisons de mashkanta', en:'mashkanta combinations' },
  stat3: { ru:'валют в конвертере', fr:'devises dans le convertisseur', en:'currencies in the converter' },
  stat4: { ru:'кибер-предупреждений разобрано', fr:'alertes cyber décortiquées', en:'cyber alerts explained' },
  chip1_l: { ru:'ставка Банка Израиля', fr:'taux de Bank Israel', en:'Bank of Israel rate' },
  chip2_l: { ru:'бензин 95', fr:'essence 95', en:'petrol 95' },
  chip3_l: { ru:'USD/₪', fr:'USD/₪', en:'USD/₪' },
  trust1: { ru:'Независимый проект — не банк и не брокер', fr:'Projet indépendant — ni banque ni courtier', en:'Independent project — not a bank or broker' },
  trust2: { ru:'Расчёты только в вашем браузере', fr:'Calculs uniquement dans votre navigateur', en:'Calculations run only in your browser' },
  trust3: { ru:'Бесплатно и без регистрации', fr:'Gratuit et sans inscription', en:'Free, no sign-up' },
  trust4: { ru:'Данные из официальных источников', fr:'Données de sources officielles', en:'Data from official sources' },
  sec_dash_h: { ru:'Экономика Израиля <span class="grad-gold">сегодня</span>', fr:"L'économie israélienne <span class=\"grad-gold\">aujourd'hui</span>", en:'Israel’s economy <span class="grad-gold">today</span>' },
  sec_dash_s: { ru:'Восемь показателей обновляются каждый день без вашего участия — такого нет ни у одного другого русскоязычного сайта об Израиле.', fr:'Huit indicateurs mis à jour chaque jour, sans que vous ayez rien à faire — aucun autre site sur Israël ne le propose.', en:'Eight indicators refresh every single day on their own — no other site about Israel does this.' },
  btn_more: { ru:'Подробнее →', fr:'En savoir plus →', en:'Learn more →' },
  sec_pay_kicker: { ru:'Календарь', fr:'Calendrier', en:'Calendar' },
  sec_pay_h: { ru:'Когда придут <span class="grad-gold">деньги</span>', fr:'Quand arrivent <span class="grad-gold">les fonds</span>', en:'When your <span class="grad-gold">money</span> arrives' },
  sec_pay_s: { ru:'Даты подтягиваются автоматически с расписания выплат Битуах леуми. Если дата прошла — показываем следующий месяц.', fr:"Les dates sont synchronisées automatiquement avec le calendrier de la Bitoua'h Leoumi. Si une date est passée, celle du mois suivant s'affiche.", en:'Dates sync automatically with the National Insurance schedule. If a date has passed, we show the next month.' },
  btn_calendar: { ru:'Полный календарь →', fr:'Calendrier complet →', en:'Full calendar →' },
  pay_remind_hint: { ru:'Нажмите «Напомнить» — дата откроется в вашем календаре.', fr:'Cliquez sur « Rappel » — la date s’ouvre dans votre agenda.', en:'Click “Remind me” — the date opens in your calendar.' },
  btn_details: { ru:'Подробнее', fr:'Détails', en:'Details' },
  btn_remind: { ru:'Напомнить', fr:'Rappel', en:'Remind me' },
  sec_calc_kicker: { ru:'Каталог', fr:'Catalogue', en:'Catalog' },
  sec_calc_h: { ru:'Выберите <span class="grad-gold">калькулятор</span>', fr:'Choisissez votre <span class="grad-gold">calculateur</span>', en:'Choose your <span class="grad-gold">calculator</span>' },
  calc_count: { ru:'{n} бесплатных калькулятора и справочника — считается прямо в браузере, без регистрации', fr:'{n} calculateurs et guides gratuits — les calculs se font dans le navigateur, sans inscription', en:'{n} free calculators and guides — everything is computed right in your browser, no sign-up' },
  search_ph: { ru:'Найти: машканта, пенсия, арнона…', fr:'Rechercher : mashkanta, retraite, arnona…', en:'Search: mashkanta, pension, arnona…' },
  hero_search_ph: { ru:'Что нужно посчитать? Например: зарплата нетто, машканта, пособие…', fr:'Que calculer ? Par ex. : salaire net, mashkanta, allocation…', en:'What do you need to calculate? E.g. net salary, mashkanta, benefits…' },
  chart_data_summary: { ru:'Данные графика таблицей (24 месяца)', fr:'Données du graphique en tableau (24 mois)', en:'Chart data as a table (24 months)' },
  chart_col_period: { ru:'Месяц', fr:'Mois', en:'Month' },
  chart_col_rate: { ru:'Ставка, %', fr:'Taux, %', en:'Rate, %' },
  btn_plan2: { ru:'Мой финансовый план', fr:'Mon plan financier', en:'My financial plan' },
  empty_note: { ru:'Ничего не нашлось. Попробуйте другое слово — например «пенсия» или «бензин».', fr:'Aucun résultat. Essayez un autre mot, par exemple « retraite » ou « essence ».', en:'Nothing found. Try another word — e.g. “pension” or “petrol”.' },
  calc_go: { ru:'Открыть →', fr:'Ouvrir →', en:'Open →' },
  calcs_more: { ru:'Показать все 32 калькулятора', fr:'Voir les 32 calculateurs', en:'Show all 32 calculators' },
  calcs_less: { ru:'Свернуть каталог', fr:'Réduire le catalogue', en:'Collapse catalog' },
  acc_chart: { ru:'График ставки за 24 месяца', fr:'Le taux : 24 mois de décisions', en:'Rate chart: 24 months of decisions' },
  acc_plan: { ru:'Финансовая цель — планировщик накоплений', fr:'Objectif financier — planificateur', en:'Financial goal — savings planner' },
  acc_cyber: { ru:'Киберщит: свежие предупреждения и разборы', fr:'CyberBouclier : alertes et analyses', en:'CyberShield: latest alerts & breakdowns' },
  acc_guide: { ru:'Гиды: банковская система и машканта', fr:'Guides : système bancaire et mashkanta', en:'Guides: banking system & mashkanta' },
  sec_plan_kicker: { ru:'Планировщик', fr:'Planificateur', en:'Planner' },
  sec_plan_h: { ru:'Финансовая <span class="grad-gold">цель</span>', fr:'Objectif <span class="grad-gold">financier</span>', en:'A <span class="grad-gold">financial goal</span>' },
  sec_plan_s: { ru:'Выберите цель, сумму в месяц и срок — покажем, сколько накопится к концу срока, с учётом льгот и налогов.', fr:'Choisissez un objectif, un montant mensuel et une durée — le total à l’échéance, avantages fiscaux et impôts inclus.', en:'Pick a goal, a monthly amount and a term — see the total at maturity, benefits and taxes included.' },
  plan_goal: { ru:'Цель', fr:'Objectif', en:'Goal' },
  plan_month: { ru:'Сумма в месяц', fr:'Montant mensuel', en:'Monthly amount' },
  plan_years: { ru:'Срок', fr:'Durée', en:'Term' },
  goal1: { ru:'Керен хишталмут — льгота через 6 лет', fr:'Keren hishtalmut — avantage après 6 ans', en:'Keren hishtalmut — tax-free after 6 years' },
  goal2: { ru:'Пикадон — депозит', fr:'Pikadon — dépôt', en:'Pikadon — deposit' },
  plan_pik_rate: {ru:'Годовая ставка депозита, %', fr:'Taux annuel du dépôt, %', en:'Annual deposit rate, %'},
  plan_pik_help: {ru:'Введите ставку вашего банка. Расчёт предполагает фиксированную номинальную ставку и налог 15% на проценты; условия банка могут отличаться.', fr:'Saisissez le taux de votre banque. Le calcul suppose un taux nominal fixe et 15 % d’impôt sur les intérêts ; les conditions peuvent varier.', en:'Enter your bank’s rate. The estimate assumes a fixed nominal rate and 15% tax on interest; bank terms may differ.'},
  plan_pik_error: {ru:'Укажите годовую ставку от 0 до 100%.', fr:'Saisissez un taux annuel entre 0 et 100 %.', en:'Enter an annual rate between 0 and 100%.'},
  goal3: { ru:'Накопления ребёнку к 18 годам', fr:'Épargne enfant jusqu’à 18 ans', en:'Savings for your child by age 18' },
  goal4: { ru:'Оздоровительные — максимальная доплата', fr:'Convalescence — montant maximal', en:'Convalescence pay — maximum top-up' },
  r_months: { ru:'мес', fr:'mois', en:'mo' },
  r_deposit: { ru:'внесёте', fr:'vous déposerez', en:'you deposit' },
  r_income: { ru:'доход ≈', fr:'gain ≈', en:'earnings ≈' },
  r_tip: { ru:'Совет:', fr:'Conseil :', en:'Tip:' },
  sec_sol_kicker: { ru:'Разбор недели', fr:'Analyse de la semaine', en:'This week’s takeaways' },
  sec_sol_h: { ru:'Что изменилось и <span class="grad-gold">что это значит для вас</span>', fr:'Ce qui change et <span class="grad-gold">ce que cela signifie pour vous</span>', en:'What changed and <span class="grad-gold">what it means for you</span>' },
  sec_cyber_h: { ru:'Киберщит: мошенники не спят', fr:'CyberBouclier : les fraudeurs ne dorment pas', en:'Cyber Shield: scammers never sleep' },
  sec_cyber_s: { ru:'Официальные предупреждения Национального управления кибербезопасности — с переводом и разбором. Обновляется автоматически с официального канала.', fr:'Alertes officielles du Commandement national de cybersécurité — traduites et expliquées. Mise à jour automatique depuis le canal officiel.', en:'Official alerts from Israel’s National Cyber Directorate — translated and explained. Auto-updated from the official channel.' },
  btn_cyber_all: { ru:'Все 61 →', fr:'Les 61 →', en:'All 61 →' },
  cyber_note: { ru:'Сообщить о мошенничестве: 119 · portal.cyber.gov.il · обновлено 19 ноября', fr:'Signaler une fraude : 119 · portal.cyber.gov.il · mis à jour le 19 novembre', en:'Report fraud: 119 · portal.cyber.gov.il · updated Nov 19' },
  sec_guide_kicker: { ru:'База знаний', fr:'Base de connaissances', en:'Knowledge base' },
  sec_guide_h: { ru:'Понять, прежде чем <span class="grad-gold">подписывать</span>', fr:'Comprendre avant de <span class="grad-gold">signer</span>', en:'Understand before you <span class="grad-gold">sign</span>' },
  g1_h: { ru:'Как устроена банковская система Израиля', fr:'Comment fonctionne le système bancaire israélien', en:'How Israel’s banking system works' },
  g1_p: { ru:'Прайм, овердрафт, Битуах Леуми — коротко о главном. Ставка Банка Израиля определяет «Прайм» — базу для процентов почти на всё: ипотеку, кредиты, минус на счету.', fr:'Prime, découvert, Bitoua’h Leoumi — l’essentiel en bref. Le taux de la Banque d’Israël détermine le « Prime », la base de presque tous les intérêts : prêt immobilier, crédits, compte à découvert.', en:'Prime, overdraft, Bituach Leumi — the essentials in brief. The Bank of Israel rate sets “Prime”, the base for interest on almost everything: mortgages, loans, overdrafts.' },
  g1_b1: { ru:'Открыть словарь →', fr:'Ouvrir le glossaire →', en:'Open the glossary →' },
  g1_b2: { ru:'Посчитать зарплату', fr:'Calculer mon salaire', en:'Calculate your salary' },
  g2_h: { ru:'Что на самом деле значит «купить квартиру»', fr:'Ce que « acheter un appartement » veut vraiment dire', en:'What “buying an apartment” really means' },
  g2_p: { ru:'Свой капитал от 25%, машканта-«тамхиль» из 2–4 треков, стресс-тест +1% к Прайму — и налоги, которые часто забывают заложить в бюджет.', fr:'Un apport d’au moins 25 %, une mashkanta de 2 à 4 tranches, un test de résistance +1 % sur le Prime — et des taxes qu’on oublie souvent de budgéter.', en:'Equity from 25%, a mashkanta mix of 2–4 tracks, a +1% Prime stress test — plus taxes people forget to budget.' },
  g2_b1: { ru:'Калькулятор машканты →', fr:'Calculateur de mashkanta →', en:'Mashkanta calculator →' },
  g2_b2: { ru:'Мас рехиша', fr:'Mas rechicha', en:'Purchase tax' },
  tip1: { ru:'Автоподбор перебирает свыше 67 000 комбинаций треков', fr:'Le sélectionneur automatique teste plus de 67 000 combinaisons de tranches', en:'Auto-pick sifts through 67,000+ track combinations' },
  tip2: { ru:'Первая квартира: банк финансирует до 75% стоимости', fr:'Premier appartement : la banque finance jusqu’à 75 % du prix', en:'First home: the bank funds up to 75% of the price' },
  tip3: { ru:'Мас рехиша, адвокат и оценщик — сверх цены жилья', fr:'Mas rechicha, avocat et expert — en sus du prix du logement', en:'Purchase tax, lawyer and appraiser — on top of the price' },
  a1_t: { ru:'Минус на счету', fr:'Compte à découvert', en:'In the red' },
  a1_s: { ru:'Почему овердрафт — самая дорогая ссуда и как из него выйти', fr:'Pourquoi le découvert est le crédit le plus cher et comment en sortir', en:'Why overdraft is the costliest loan — and how to get out' },
  a2_t: { ru:'4 дыры в бюджете', fr:'4 fuites dans le budget', en:'4 budget leaks' },
  a2_s: { ru:'Комиссии, забытые платежи, связь и электричество', fr:'Commissions, paiements oubliés, télécoms et électricité', en:'Fees, forgotten payments, telecoms and electricity' },
  faq_h: { ru:'Частые <span class="grad-gold">вопросы</span>', fr:'Questions <span class="grad-gold">fréquentes</span>', en:'Frequently asked <span class="grad-gold">questions</span>' },
  faq_q1: { ru:'Калькуляторы точные или это просто оценка?', fr:'Les calculateurs sont-ils exacts ou c’est une estimation ?', en:'Are the calculators exact, or just an estimate?' },
  faq_a1: { ru:'Это модельные расчёты по стандартным формулам (аннуитет, налоговые ступени и т.д.) — они показывают общую картину и правильный порядок цифр. Фактические условия зависят от вашей ситуации, банка, даты расчёта и действующего законодательства.', fr:'Ce sont des calculs modèles basés sur des formules standard (annuités, tranches d’imposition, etc.) : ils donnent la tendance et le bon ordre de grandeur. Les conditions réelles dépendent de votre situation, de la banque, de la date et de la législation en vigueur.', en:'These are model calculations using standard formulas (annuity, tax brackets, etc.) — they show the big picture and the right order of magnitude. Actual terms depend on your situation, the bank, the date and current law.' },
  faq_q2: { ru:'Нужна ли регистрация, чтобы посчитать?', fr:'Faut-il s’inscrire pour calculer ?', en:'Do I need to sign up to use them?' },
  faq_a2: { ru:'Нет. Все расчёты происходят прямо в браузере, без отправки данных на сервер и без сохранения где-либо.', fr:'Non. Tous les calculs se font dans votre navigateur : rien n’est envoyé à un serveur ni stocké.', en:'No. All calculations happen right in your browser — nothing is sent to a server or stored anywhere.' },
  faq_q3: { ru:'Это сайт банка или финансового советника?', fr:'Est-ce le site d’une banque ou d’un conseiller financier ?', en:'Is this a bank’s or an advisor’s website?' },
  faq_a3: { ru:'Нет. Это независимый информационный проект — мы не аффилированы ни с одним банком, брокером или советником и не получаем комиссий за то, что вы что-то оформите.', fr:'Non. C’est un projet d’information indépendant : nous ne sommes affiliés à aucune banque, courtier ou conseiller et ne touchons aucune commission sur vos souscriptions.', en:'No. This is an independent information project — we are affiliated with no bank, broker or advisor, and earn no commission on anything you sign.' },
  faq_q4: { ru:'Что такое «автоподбор» в калькуляторе машканты?', fr:'Qu’est-ce que la « sélection automatique » du calculateur de mashkanta ?', en:'What is “auto-pick” in the mashkanta calculator?' },
  faq_a4: { ru:'Алгоритм перебирает свыше 67 000 комбинаций долей и сроков треков и находит вариант, оптимальный под вашу цель, — вместо ручного подбора пропорций.', fr:'L’algorithme passe au crible plus de 67 000 combinaisons de parts et de durées et trouve la solution optimale pour votre objectif — au lieu d’ajuster les proportions à la main.', en:'The algorithm sifts through 67,000+ combinations of track shares and terms to find the optimal mix for your goal — instead of you tuning proportions by hand.' },
  faq_q5: { ru:'Почему термины на русском и в скобках на иврите?', fr:'Pourquoi les termes sont traduits avec l’hébreu entre parenthèses ?', en:'Why are terms translated with Hebrew in brackets?' },
  faq_a5: { ru:'Чтобы вы понимали суть по-русски и при этом узнавали официальное название в документе банка или расчётном листе на иврите.', fr:'Pour comprendre l’idée dans votre langue et reconnaître le terme officiel sur le document de la banque ou la fiche de paie en hébreu.', en:'So you grasp the idea in your own language and still recognise the official term on Hebrew bank documents or payslips.' },
  foot_p: { ru:'Независимый проект о финансах в Израиле. Мы не советуем, что вам делать, — мы показываем цифры, а решение остаётся за вами.', fr:'Un projet indépendant sur les finances en Israël. Nous ne vous disons pas quoi faire : nous montrons les chiffres, la décision vous appartient.', en:'An independent project about money in Israel. We don’t tell you what to do — we show the numbers, the decision stays yours.' },
  foot_mini: { ru:'© 2026 ShekelPRO · Сделано с ♥ в Ришон ле-Ционе', fr:'© 2026 ShekelPRO · Fait avec ♥ à Rishon LeZion', en:'© 2026 ShekelPRO · Made with ♥ in Rishon LeZion' },
  foot_pop: { ru:'Популярное', fr:'Populaires', en:'Popular' },
  foot_serv: { ru:'Сервисы', fr:'Services', en:'Services' },
  foot_about: { ru:'О проекте', fr:'À propos', en:'About' },
  f_salary: { ru:'Зарплата брутто-нетто', fr:'Salaire brut-net', en:'Gross-to-net salary' },
  f_mashkanta: { ru:'Машканта', fr:'Mashkanta', en:'Mashkanta' },
  f_avtala: { ru:'Дмей автала', fr:'Dmei avtala', en:'Unemployment pay' },
  f_arnona: { ru:'Скидка на арнону', fr:'Réduction d’arnona', en:'Arnona discount' },
  f_valuta: { ru:'Курс валют', fr:'Taux de change', en:'Exchange rates' },
  f_tablo: { ru:'Табло экономики', fr:"Tableau de l'économie", en:'Economic dashboard' },
  f_payments: { ru:'Даты выплат', fr:'Dates de versement', en:'Payment dates' },
  f_cyber: { ru:'Киберщит', fr:'CyberBouclier', en:'Cyber Shield' },
  f_slovar: { ru:'Словарь терминов', fr:'Glossaire', en:'Glossary' },
  f_nko: { ru:'Благотворительные НКО', fr:'Associations caritatives', en:'Charity NGOs' },
  f_faq: { ru:'Частые вопросы', fr:'FAQ', en:'FAQ' },
  f_goal: { ru:'Финансовая цель', fr:'Objectif financier', en:'Financial goal' },
  f_proverka: { ru:'Проверка специалиста', fr:'Vérifier un professionnel', en:'Check a professional' },
  rem_h: { ru:'Напомнить о выплате', fr:'Rappel de versement', en:'Payment reminder' },
  rem_s: { ru:'Выберите устройство — дата откроется в вашем календаре, и телефон сам напомнит о выплате.', fr:'Choisissez votre appareil : la date s’ouvre dans votre agenda et le téléphone vous rappellera.', en:'Pick your device — the date opens in your calendar and your phone will remind you.' },
  rem_gcal: { ru:'Google Календарь', fr:'Google Agenda', en:'Google Calendar' },
  rem_gcal_s: { ru:'Android / ПК — нажмите «Сохранить»', fr:'Android / PC — cliquez sur « Enregistrer »', en:'Android / PC — click “Save”' },
  rem_apple: { ru:'Apple Календарь', fr:'Calendrier Apple', en:'Apple Calendar' },
  rem_apple_s: { ru:'iPhone / iPad / Mac', fr:'iPhone / iPad / Mac', en:'iPhone / iPad / Mac' },
  planm_h: { ru:'Финансовая цель', fr:'Objectif financier', en:'Financial goal' },
  planm_s: { ru:'Внизу есть живой планировщик — посчитайте свою цель прямо сейчас.', fr:'Un planificateur vous attend plus bas — calculez votre objectif maintenant.', en:'A live planner awaits below — calculate your goal right now.' },
  planm_btn: { ru:'Открыть планировщик ↓', fr:'Ouvrir le planificateur ↓', en:'Open the planner ↓' },
  fab_title: { ru:'Мой финансовый план', fr:'Mon plan financier', en:'My financial plan' },
  to_top: { ru:'Наверх', fr:'Haut de page', en:'Back to top' },
  cyber_link: { ru:'Оригинал, перевод и разбор ▸', fr:'Original, traduction et analyse ▸', en:'Original, translation & breakdown ▸' },
  dash_graph_note: { ru:'Мини-графики показывают динамику показателя; точное текущее значение — крупно в карточке. Двигайте ползунок под графиком, чтобы посмотреть значения точек.', fr:'Les mini-graphiques montrent la dynamique ; la valeur actuelle exacte est en grand dans la carte. Déplacez le curseur sous le graphique pour voir les points.', en:'Mini-charts show the trend; the exact current value is large in the card. Move the slider under a chart to inspect its points.' },
  sec_chart_h: { ru:'Ставка Банка Израиля за 24 месяца', fr:'Le taux de Bank Israel : 24 mois de décisions', en:'Bank of Israel rate: 24 months of decisions' },
  sec_chart_s: { ru:'Месячные значения по данным Банка Израиля (SDMX, середина коридора). Обновляется автоматически каждый день.', fr:'Valeurs mensuelles selon la Banque d’Israël (SDMX, milieu du corridor). Mis à jour automatiquement chaque jour.', en:'Monthly values from the Bank of Israel (SDMX, corridor midpoint). Updated automatically every day.' },
  chart_months: { ru:'мес', fr:'mois', en:'mo' },
  chart_now: { ru:'сейчас 3,25%', fr:'actuel 3,25 %', en:'now 3.25%' },
  chart_peak: { ru:'максимум за 24 мес. 4,50%', fr:'maximum sur 24 mois : 4,50 %', en:'24-month high 4.50%' },
  chart_hint: { ru:'проведите по графику или используйте стрелки ← → на клавиатуре', fr:'parcourez le graphique pour voir le mois et la valeur', en:'move along the chart to see the month and value' },
  chart_tip_at: { ru:'Ставка', fr:'Taux', en:'Rate' },
  ring1_l: { ru:'Инфляция · <span>цель ≤ 3%</span>', fr:'Inflation · <span>cible ≤ 3 %</span>', en:'Inflation · <span>target ≤ 3%</span>' },
  ring2_l: { ru:'Прайм · <span>по табло</span>', fr:'Prime · <span>du tableau</span>', en:'Prime · <span>dashboard</span>' },
  ring3_l: { ru:'Аренда за год · <span>средняя по стране</span>', fr:'Loyer annuel · <span>moyenne nationale</span>', en:'Yearly rent · <span>national average</span>' },
  ring1_s: { ru:'цель ≤ 3%', fr:'cible ≤ 3 %', en:'target ≤ 3%' },
  ring2_s: { ru:'по табло', fr:'du tableau', en:'dashboard' },
  ring3_s: { ru:'средняя по стране', fr:'moyenne nationale', en:'national average' },
  sec_pen_kicker: { ru:'Спокойная пенсия', fr:'Retraite sereine', en:'A calm retirement' },
  sec_pen_h: { ru:'Пенсия <span class="grad-gold">без тревоги</span>', fr:'Une retraite <span class="grad-gold">sans angoisse</span>', en:'Retirement <span class="grad-gold">without the worry</span>' },
  sec_pen_s: { ru:'Сложите вместе микадем, пенсию фонда, Эзрах Ватик и пособия Битуах леуми — и узнайте честную цифру своего месяца. С учётом Кибуа Зхуйот (161д) и налогов.', fr:'Additionnez mikadem, pension de fonds, Ezrah Vatik et les prestations Bitoua’h Leoumi — découvrez le chiffre honnête de votre mois, Kiboua’h Zehouyot (161d) et impôts compris.', en:'Stack up mikadem, fund pension, Ezrah Vatik and Bituach Leumi benefits — get the honest number for your month, Kibua Zchuyot (161d) and taxes included.' },
  pen_chip1: { ru:'максимум сиюда в месяц', fr:'sioud max par mois', en:'max care benefit / mo' },
  pen_chip2: { ru:'к зачислению — 161д', fr:'crédité — 161d', en:'credited — 161d' },
  pen_b1: { ru:'Калькулятор накоплений →', fr:'Calculateur d’épargne →', en:'Savings calculator →' },
  pen_b2: { ru:'Хватит ли на пенсии?', fr:'Ma retraite suffira-t-elle ?', en:'Will my pension be enough?' },
  feat_tag: { ru:'МАШКАНТА И СТАВКА', fr:'MASHKANTA ET TAUX', en:'MASHKANTA AND THE RATE' },
  feat_h: { ru:'Как ставка влияет на вашу машканту', fr:'Comment le taux influe sur votre mashkanta', en:'How the rate affects your mashkanta' },
  feat_p: { ru:'Проверьте платёж по ипотеке и стресс-тест при изменении ставки. Прайм зависит от ставки Банка Израиля.', fr:'Vérifiez les mensualités et le test de résistance aux variations de taux. Le Prime dépend du taux de la Banque d’Israël.', en:'Check your mortgage payment and stress-test changes in rates. Prime depends on the Bank of Israel rate.' },
  feat_c1: { ru:'ставка', fr:'taux', en:'rate' },
  feat_c2: { ru:'прайм', fr:'prime', en:'prime' },
  feat_c3: { ru:'решение', fr:'décision', en:'decision' },
  feat_btn: { ru:'Проверить свою машканту →', fr:'Vérifier ma mashkanta →', en:'Check my mashkanta →' },
  ics_name: { ru:'ShekelPRO', fr:'ShekelPRO', en:'ShekelPRO' }
};
const TABLO = [
  { icon:'bank', gold:true, up:false, spark:[4.0,4.0,4.0,4.0,3.75,3.75,3.5,3.5,3.25,3.25,3.25],
    name:{ ru:'Ставка Банка Израиля', fr:'Taux de Bank Israel', en:'Bank of Israel rate' },
    val:{ ru:'3,25<small>%</small>', fr:'3,25<small>%</small>', en:'3.25<small>%</small>' },
    note:{ ru:'Прайм 4,75% · с сентября 2026', fr:'Prime 4,75 % · depuis septembre 2026', en:'Prime 4.75% · since Sep 2026' }, trend:{ ru:'▼ 0,25 п.п.', fr:'▼ 0,25 pts', en:'▼ 0.25 pts' } },
  { icon:'pie', up:false, spark:[3.1,2.9,2.6,2.4,2.2,1.9,1.6,1.4,1.2,1.1],
    name:{ ru:'Инфляция (мадад)', fr:'Inflation (madad)', en:'Inflation (CPI)' },
    val:{ ru:'1,1<small>%</small>', fr:'1,1<small>%</small>', en:'1.1<small>%</small>' },
    note:{ ru:'цель 1–3% · октябрь', fr:'cible 1–3 % · octobre', en:'target 1–3% · October' }, trend:{ ru:'▼ 0,1% за мес.', fr:'▼ 0,1 % sur le mois', en:'▼ 0.1% m/m' } },
  { icon:'dollar', up:false, spark:[3.4,3.38,3.36,3.31,3.3,3.29,3.28,3.326],
    name:{ ru:'USD / ₪', fr:'USD / ₪', en:'USD / ₪' },
    val:{ ru:'3,38<small> ₪</small>', fr:'3,38<small> ₪</small>', en:'3.38<small> ₪</small>' },
    note:{ ru:'курс Банка Израиля', fr:'cours de la Banque d’Israël', en:'Bank of Israel rate' }, trend:'▼ −0.4%' },
  { icon:'euro', up:false, spark:[3.5,3.52,3.51,3.53,3.55,3.56,3.6627],
    name:{ ru:'EUR / ₪', fr:'EUR / ₪', en:'EUR / ₪' },
    val:{ ru:'3,70<small> ₪</small>', fr:'3,70<small> ₪</small>', en:'3.70<small> ₪</small>' },
    note:{ ru:'курс Банка Израиля', fr:'cours de la Banque d’Israël', en:'Bank of Israel rate' }, trend:'▼ −0.4%' },
  { icon:'wallet', flat:true, spark:[5899,5969,6039,6139,6444],
    name:{ ru:'Минимальная зарплата', fr:'Salaire minimum', en:'Minimum wage' },
    val:{ ru:'6 444<small> ₪</small>', fr:'6 444<small> ₪</small>', en:'6,444<small> ₪</small>' },
    note:{ ru:'с 01.04.2026', fr:'depuis le 01.04.2026', en:'since Apr 1, 2026' }, trend:{ ru:'по закону', fr:'par la loi', en:'set by law' } },
  { icon:'briefcase', up:true, spark:[13300,13380,13450,13520,13600,13680,13750,13830,13950,14515],
    name:{ ru:'Средняя зарплата', fr:'Salaire moyen', en:'Average wage' },
    val:{ ru:'14 515<small> ₪</small>', fr:'14 515<small> ₪</small>', en:'14,515<small> ₪</small>' },
    note:{ ru:'ЦСУ · сентябрь 2026 · оценка', fr:'ICBS · septembre 2026 · estimation', en:'CBS · Sep 2026 · estimate' }, trend:'▲ +3.8%' },
  { icon:'fuel', up:true, spark:[6.9,7.0,7.05,7.15,7.2,7.31,7.35,7.85],
    name:{ ru:'Бензин 95', fr:'Essence 95', en:'Petrol 95' },
    val:{ ru:'7,85<small> ₪</small>', fr:'7,85<small> ₪</small>', en:'7.85<small> ₪</small>' },
    note:{ ru:'+0,50 ₪ с 05.11', fr:'+0,50 ₪ depuis le 05.11', en:'+0.50 ₪ since Nov 5' }, trend:'▲ 6.8%' },
  { icon:'home', up:true, spark:[4700,4740,4780,4800,4840,4870,4900,4919],
    name:{ ru:'Аренда 3-комн.', fr:'Loyer 3 pièces', en:'3-room rent' },
    val:{ ru:'4 919<small> ₪</small>', fr:'4 919<small> ₪</small>', en:'4,919<small> ₪</small>' },
    note:{ ru:'средняя по стране · данные: март 2026', fr:'moyenne nationale · données : mars 2026', en:'national average · data: Mar 2026' }, trend:'▲ +4.3%' }
];
const PAYMENTS = [
  { icon:'baby', he:'קצבת ילדים', day:20, url:u('tablo.html'),
    name:{ ru:'Пособие на детей', fr:'Allocations familiales', en:'Child allowance' },
    what:{ ru:'Выплата на детей до 18 лет приходит на счёт 20-го числа каждого месяца.', fr:'Versée le 20 de chaque mois pour chaque enfant de moins de 18 ans.', en:'Paid on the 20th of each month for every child under 18.' } },
  { icon:'briefcase', he:'קצבאות ארוכות מועד', day:28, url:u('pension-gap.html'),
    name:{ ru:'Пенсии, инвалидность, сиюд', fr:'Retraites, invalidité, soins', en:'Pensions, disability, care' },
    what:{ ru:'Старость, потеря кормильца, инвалидность, передвижение, уход (сиюд), алименты, узники Сиона.', fr:'Vieillesse, survivants, invalidité, mobilité, soins (sioud), pensions alimentaires, prisonniers de Sion.', en:'Old-age, survivor, disability, mobility, care (siud), alimony, Prisoners of Zion.' } },
  { icon:'fuel', he:'', day:1, url:u('benzin.html'),
    name:{ ru:'Пересмотр цены бензина', fr:'Révision du prix de l’essence', en:'Petrol price revision' },
    what:{ ru:'Министерство энергетики пересматривает тариф 95-го бензина в начале месяца.', fr:'Le ministère de l’Énergie révise le tarif de l’essence 95 au début du mois.', en:'The Energy Ministry resets the 95-octane price at the start of each month.' } },
  { icon:'pie', he:'מדד המחירים', day:15, url:u('tablo.html'),
    name:{ ru:'Публикация мадада', fr:'Publication du madad', en:'CPI release' },
    what:{ ru:'Индекс потребительских цен за предыдущий месяц публикует Центральное статистическое управление.', fr:'L’indice des prix à la consommation du mois précédent est publié par le Bureau central des statistiques.', en:'The previous month’s consumer price index is published by the Central Bureau of Statistics.' } },
  { icon:'doc', he:'דמי אבטלה', day:14, url:u('avtala.html'),
    name:{ ru:'Пособие по безработице', fr:'Allocations chômage', en:'Unemployment benefits' },
    what:{ ru:'Первые выплаты месяца для заявителей дмей автала.', fr:'Premiers versements du mois pour les demandeurs d’avtala.', en:'First payments of the month for avtala claimants.' } },
  { icon:'calendar', he:'דמי ביטוח לאומי', day:15, url:u('payments.html'),
    name:{ ru:'Взносы самозанятых', fr:'Cotisations des indépendants', en:'Self-employed contributions' },
    what:{ ru:'Срок уплаты взносов Битуах леуми за предыдущий месяц для «ацмаим».', fr:'Échéance des cotisations Bitoua’h Leoumi du mois précédent pour les indépendants.', en:'Bituach Leumi contributions for the previous month are due for the self-employed.' } }
];
const CATS = {
  all:{ i:'grid', l:{ ru:'Всё', fr:'Tout', en:'All' } },
  hot:{ i:'flame', l:{ ru:'Популярное', fr:'Populaires', en:'Popular' } },
  pension:{ i:'briefcase', l:{ ru:'Пенсия и накопления', fr:'Retraite et épargne', en:'Pension & savings' } },
  salary:{ i:'wallet', l:{ ru:'Зарплата и налоги', fr:'Salaire et impôts', en:'Salary & taxes' } },
  home:{ i:'home', l:{ ru:'Жильё и ипотека', fr:'Logement et immobilier', en:'Home & mortgage' } },
  auto:{ i:'car', l:{ ru:'Авто и кредиты', fr:'Auto et crédits', en:'Auto & loans' } },
  econ:{ i:'chart', l:{ ru:'Экономика', fr:'Économie', en:'Economy' } },
  guide:{ i:'book', l:{ ru:'Справочники', fr:'Guides', en:'Guides' } }
};
const CALCS = [
  { id:'maanak-avoda', icon:'percent', cat:'salary', hot:96, t:{ ru:'Маанак авода', fr:'Maanak avoda', en:'Maanak avoda' }, d:{ ru:'Отрицательный подоходный налог — до 16 000 ₪ на банковский счёт', fr:'Impôt sur le revenu négatif — jusqu’à 16 000 ₪ versés sur votre compte', en:'Negative income tax — up to ₪16,000 paid into your account' } },
  { id:'havraa', icon:'sun', cat:'salary', hot:90, t:{ ru:'Оздоровительные', fr:'Convalescence', en:'Convalescence pay' }, d:{ ru:'Ставку подняли до 451,50 ₪ за день — посчитайте доплату', fr:'Le taux monte à 451,50 ₪ par jour — calculez votre complément', en:'The daily rate rose to ₪451.50 — calculate your top-up' } },
  { id:'hisahon-yeled', icon:'baby', cat:'pension', hot:88, t:{ ru:'Накопления на ребёнка', fr:'Épargne enfant', en:'Child savings' }, d:{ ru:'58 ₪ в месяц от государства — сколько будет к 18 и 21 году', fr:'58 ₪/mois de l’État — combien à 18 et 21 ans', en:'₪58/month from the state — how much by ages 18 and 21' } },
  { id:'salary', icon:'wallet', cat:'salary', hot:99, t:{ ru:'Зарплата', fr:'Salaire', en:'Salary' }, d:{ ru:'Брутто↔нетто, выходное пособие, 2 работы, работающий пенсионер', fr:'Brut↔net, indemnité de départ, deux emplois, retraité actif', en:'Gross↔net, severance, two jobs, working pensioner' } },
  { id:'mashkanta', icon:'home', cat:'home', hot:99, t:{ ru:'Машканта', fr:'Mashkanta', en:'Mashkanta' }, d:{ ru:'Автоподбор из 67 000+ комбинаций, стресс-тест', fr:'Sélection automatique parmi 67 000+ combinaisons, stress-test', en:'Auto-pick over 67,000 combinations, stress test' } },
  { id:'auto', icon:'car', cat:'auto', hot:85, t:{ ru:'Автомобиль', fr:'Voiture', en:'Car' }, d:{ ru:'Реальная стоимость владения, не только цена в объявлении', fr:'Le coût réel de possession, pas seulement le prix de l’annonce', en:'True cost of ownership, not just the listing price' } },
  { id:'kredit', icon:'card', cat:'auto', hot:80, t:{ ru:'Кредит', fr:'Crédit', en:'Loan' }, d:{ ru:'Платёж, переплата, сравнение сроков', fr:'Mensualité, coût total, comparaison des durées', en:'Payment, total cost, compare terms' } },
  { id:'arenda-vs-pokupka', icon:'scale', cat:'home', hot:82, t:{ ru:'Аренда vs покупка', fr:'Louer ou acheter', en:'Rent vs buy' }, d:{ ru:'Что накопит больше капитала — снимать или купить', fr:'Quelle option bâtit le plus de capital — louer ou acheter', en:'Which builds more capital — renting or buying' } },
  { id:'mihzur-mashkanta', icon:'refresh', cat:'home', hot:75, t:{ ru:'Рефинансирование', fr:'Refinancement', en:'Refinancing' }, d:{ ru:'Стоит ли переоформить машканту на новых условиях', fr:'Faut-il refinancer la mashkanta aux nouvelles conditions', en:'Is refinancing your mashkanta worth it now' } },
  { id:'siluk-mukdam', icon:'gem', cat:'home', hot:70, t:{ ru:'Погашение vs инвестиции', fr:'Remboursement ou placement', en:'Repay vs invest' }, d:{ ru:'Что выгоднее с учётом штрафа и налога', fr:'Qu’est-ce qui rapporte plus, pénalité et impôt compris', en:'Which wins out after early-repayment fees and tax' } },
  { id:'mas-rehisha', icon:'key', cat:'home', hot:92, t:{ ru:'Мас рехиша', fr:'Mas rechicha', en:'Mas rechisha' }, d:{ ru:'Налог на покупку квартиры — все ступени 2026 и льготы', fr:'Taxe à l’achat d’un logement — barèmes 2026 et réductions', en:'Apartment purchase tax — all 2026 brackets and discounts' } },
  { id:'mas-shevach', icon:'chartdown', cat:'home', hot:68, t:{ ru:'Мас шевах', fr:'Mas cheva’h', en:'Mas shevach' }, d:{ ru:'Налог при продаже — пропорциональное освобождение', fr:'Taxe à la revente — exonération proportionnelle', en:'Capital-gains tax on sale — proportional exemption' } },
  { id:'dira', icon:'building', cat:'home', hot:65, t:{ ru:'Дира бе-ханаха', fr:'Dira be-hanaha', en:'Dira be-hanaha' }, d:{ ru:'Статус розыгрыша, что готовится, где реально был шанс за 5 лет', fr:'État du tirage, projets en préparation, vraies chances sur 5 ans', en:'Lottery status, what’s brewing, real odds over 5 years' } },
  { id:'arnona', icon:'tag', cat:'home', hot:89, t:{ ru:'Скидка на арнону', fr:'Réduction d’arnona', en:'Arnona discount' }, d:{ ru:'Репатрианты, пожилые, инвалиды, низкий доход — размеры по закону', fr:'Nouveaux immigrants, seniors, handicapés, bas revenus — montants légaux', en:'Olim, seniors, disabled, low income — statutory amounts' } },
  { id:'avtala', icon:'doc', cat:'salary', hot:94, t:{ ru:'Дмей автала', fr:'Dmei avtala', en:'Dmei avtala' }, d:{ ru:'Уволили? Сколько заплатят, сколько дней, куда идти по шагам', fr:'Licencié ? Montant, durée, démarches pas à pas', en:'Laid off? How much, how long, where to go — step by step' } },
  { id:'pension-calc', icon:'briefcase', cat:'pension', hot:87, t:{ ru:'Пенсионные накопления', fr:'Épargne retraite', en:'Pension savings' }, d:{ ru:'Микадем, пенсия фонда, Эзрах Ватик, налоги и Кибуа Зхуйот (161д)', fr:'Mikadem, pension de fonds, Ezrah Vatik, impôts et Kiboua’h Zehouyot (161d)', en:'Mikadem, fund pension, Ezrah Vatik, taxes and Kibua Zchuyot (161d)' } },
  { id:'pension-gap', icon:'clock', cat:'pension', hot:84, t:{ ru:'Пенсионный разрыв', fr:'Écart de retraite', en:'Pension gap' }, d:{ ru:'Хватит ли вам на пенсии — честно, с кицват зикна', fr:'Votre retraite suffira-t-elle — honnêtement, avec kitzvat zikna', en:'Will your pension be enough — honestly, with kitzvat zikna' } },
  { id:'ashlamat-ahnasa', icon:'plus', cat:'pension', hot:72, t:{ ru:'Социальная надбавка', fr:'Complément de revenu', en:'Income supplement' }, d:{ ru:'Ашламат ахнаса: сколько Битуах Леуми доплачивает — потолки 2026', fr:'Achlamat ahnassa : le complément de la Bitoua’h Leoumi — plafonds 2026', en:'Ashlamat ahnasa: the Bituach Leumi top-up — 2026 caps' } },
  { id:'avtahat-ahnasa', icon:'life', cat:'pension', hot:71, t:{ ru:'Пособие по прожиточному минимуму', fr:'Aide de subsistance', en:'Minimum-income benefit' }, d:{ ru:'Автахат ахнаса: суммы 2026 по возрастам и почему отказывают после алии', fr:'Avta’hat ahnassa : montants 2026 par âge et refus après l’alya', en:'Avtaat ahnasa: 2026 amounts by age and why olim get refused at first' } },
  { id:'siud', icon:'heart', cat:'pension', hot:78, t:{ ru:'Сиюд — уход', fr:'Sioud — soins', en:'Siud — long-term care' }, d:{ ru:'6 уровней: часы ухода и до 7 440 ₪/мес — положен ли уход близким', fr:'6 niveaux : heures de soins jusqu’à 7 440 ₪/mois — vos proches y ont-ils droit', en:'6 levels: care hours and up to ₪7,440/mo — do your relatives qualify' } },
  { id:'payments', icon:'calendar', cat:'guide', hot:93, t:{ ru:'Даты выплат Битуах Леуми', fr:'Versements Bitoua’h Leoumi', en:'Bituach Leumi payment dates' }, d:{ ru:'Когда придут деньги в этом месяце — обновляется автоматически', fr:'Quand arrivent les fonds ce mois-ci — mise à jour automatique', en:'When the money lands this month — auto-updated' } },
  { id:'keren-hishtalmut', icon:'grad', cat:'salary', hot:74, t:{ ru:'Фонд повышения квалификации', fr:'Fonds de formation', en:'Advanced-training fund' }, d:{ ru:'Рост фонда без налога — с правильными двумя потолками для самозанятых', fr:'Croissance sans impôt — avec les deux bons plafonds pour les indépendants', en:'Growth without tax — with the right two caps for the self-employed' } },
  { id:'nekudot-zikuy', icon:'star', cat:'salary', hot:69, t:{ ru:'Некудот зикуй', fr:'Nekoudot zikouï', en:'Nekudot zikuy' }, d:{ ru:'Сколько баллов вам положено и сколько это в шекелях', fr:'Combien de points vous sont dus et leur valeur en shékels', en:'How many points you’re owed and what they’re worth in shekels' } },
  { id:'keren-kaspit', icon:'calculator', cat:'pension', hot:67, t:{ ru:'Керен каспит: налог', fr:'Keren kaspit : impôt', en:'Keren kaspit: tax' }, d:{ ru:'Доход за 1–2 года, инфляция, налог 25% и сумма чистыми', fr:'Gain sur 1–2 ans, inflation, impôt de 25 % et net final', en:'1–2 year gain, inflation, 25% tax and the net amount' } },
  { id:'pikadon-vs-keren', icon:'swap', cat:'pension', hot:66, t:{ ru:'Пикадон vs керен каспит', fr:'Pikadon ou keren kaspit', en:'Pikadon vs keren kaspit' }, d:{ ru:'Сравните депозит и фонд с учётом доходности и налогов', fr:'Comparez dépôt et fonds selon le rendement et les impôts', en:'Compare deposit and fund returns after tax' } },
  { id:'valuta', icon:'globe', cat:'econ', hot:91, t:{ ru:'Курс валют', fr:'Taux de change', en:'Exchange rates' }, d:{ ru:'Конвертер, корзина валют, график за год, официальный vs рыночный', fr:'Convertisseur, panier de devises, graphique annuel, officiel vs réel', en:'Converter, currency basket, one-year chart, official vs market' } },
  { id:'tablo', icon:'chart', cat:'econ', hot:83, t:{ ru:'Экономика сегодня', fr:'L’économie du jour', en:'Economy today' }, d:{ ru:'Ставка, мадад, курсы валют, минималка — живое табло', fr:'Taux, madad, devises, salaire minimum — tableau en direct', en:'Rate, CPI, currencies, minimum wage — live dashboard' } },
  { id:'benzin', icon:'fuel', cat:'econ', hot:79, t:{ ru:'Цена на бензин', fr:'Prix de l’essence', en:'Petrol price' }, d:{ ru:'Из чего складывается литр, доля государства, сравнение с Европой', fr:'Décomposition du litre, part de l’État, comparaison européenne', en:'What makes up a litre, the state’s cut, Europe comparison' } },
  { id:'slovar', icon:'book', cat:'guide', hot:76, t:{ ru:'Словарь терминов', fr:'Glossaire', en:'Glossary' }, d:{ ru:'Что банк говорит и что это значит на самом деле', fr:'Ce que dit la banque et ce que cela veut vraiment dire', en:'What the bank says and what it actually means' } },
  { id:'nko', icon:'heart', cat:'guide', hot:62, t:{ ru:'Благотворительные НКО', fr:'Associations caritatives', en:'Charity NGOs' }, d:{ ru:'Крупные проверенные организации + как проверить любую самому', fr:'Grandes organisations vérifiées + comment vérifier n’importe laquelle', en:'Big vetted organisations + how to vet any one yourself' } },
  { id:'cyber', icon:'shield', cat:'guide', hot:64, t:{ ru:'Киберщит', fr:'CyberBouclier', en:'Cyber Shield' }, d:{ ru:'Официальные предупреждения киберштаба: мошеннические SMS и звонки', fr:'Alertes officielles du commandement cyber : SMS et appels frauduleux', en:'Official cyber-directorate alerts: scam SMS and calls' } },
  { id:'proverka-specialista', icon:'badge', cat:'guide', hot:61, t:{ ru:'Проверка специалиста', fr:'Vérifier un professionnel', en:'Check a professional' }, d:{ ru:'Врач, адвокат, маклер, CPA — проверка лицензии по официальным реестрам', fr:'Médecin, avocat, agent immobilier, CPA — licence vérifiée via les registres officiels', en:'Doctor, lawyer, agent, CPA — verify licences in official registries' } }
];
const SOLUTIONS = [
  { tag:'up', icon:'fuel', date:'05.11.2026', link:'benzin.html',
    tagText:{ ru:'БЕНЗИН +6.8%', fr:'ESSENCE +6.8%', en:'PETROL +6.8%' },
    t:{ ru:'Бензин 95 — 7,85 ₪ за литр', fr:'Essence 95 — 7,85 ₪ le litre', en:'Petrol 95 — ₪7.85 a litre' },
    p:{ ru:'С 5 ноября литр подорожал на 0,50 ₪. Пересмотр цены — в начале каждого месяца. Доля государства в цене литра — около 56% (4,43 ₪).', fr:'Depuis le 5 novembre, le litre a grimpé de 0,50 ₪. Révision du prix au début de chaque mois. L’État prélève environ 56 % du prix (4,43 ₪).', en:'Since Nov 5 a litre costs ₪0.50 more. The price resets at the start of each month. The state’s share is about 56% of the price (₪4.43).' },
    linkText:{ ru:'Разбор цены →', fr:'Décryptage du prix →', en:'Price breakdown →' } },
  { tag:'info', icon:'pie', date:{ ru:'ЦСУ Израиля', fr:'ICBS', en:'CBS Israel' }, link:'tablo.html',
    tagText:{ ru:'МДАД · ОКТЯБРЬ', fr:'MADAD · OCTOBRE', en:'CPI · OCTOBER' },
    t:{ ru:'Инфляция: 1,1% годовых', fr:'Inflation : 1,1 % en glissement annuel', en:'Inflation: 1.1% a year' },
    p:{ ru:'Годовой мадад в пределах цели 1–3%: месячный прирост −0,1%. Кредитный трек КАЛАЦ ведёт себя спокойно.', fr:'Le madad annuel reste dans la cible de 1–3 % : −0,1 % sur le mois. Le tahalich kalatz se porte bien.', en:'Annual CPI stays within the 1–3% target: −0.1% on the month. The kalatz track is behaving.' },
    linkText:{ ru:'Табло индексов →', fr:'Tableau des indices →', en:'Index dashboard →' } }
];
const CYBER = [
  { icon:'msg', date:'19.11',
    kind:{ ru:'SMS / ссылка', fr:'SMS / lien', en:'SMS / link' },
    t:{ ru:'Фальшивое приложение «Налоговое управление»', fr:'Fausse application « Autorité fiscale »', en:'Fake “Tax Authority” app' },
    p:{ ru:'Сообщение ведёт на поддельный «Google Play» и просит установить APK. После установки — доступ к SMS, кодам и камере. Скачивайте приложения только из официального магазина.', fr:'Le message mène vers un faux « Google Play » qui propose d’installer un APK. Une fois installé : accès aux SMS, codes et caméra. N’installez des applications que depuis la boutique officielle.', en:'The message leads to a fake “Google Play” offering an APK. Once installed: access to SMS, codes and camera. Install apps only from the official store.' } },
  { icon:'play', date:'18.11',
    kind:{ ru:'Сайт / подкаст', fr:'Site / podcast', en:'Website / podcast' },
    t:{ ru:'Подкаст «Без единого выстрела»', fr:'Podcast « Sans un seul tir »', en:'The “Without a Single Shot” podcast' },
    p:{ ru:'Официальный образовательный выпуск киберштаба: как техподдержка превратилась в кибероружие (NSO). Не является предупреждением о мошенничестве.', fr:'Un épisode officiel du commandement cyber : comment le support technique est devenu cyberarme (NSO). Ce n’est pas une alerte fraude.', en:'An official cyber-directorate episode: how tech support became cyber-weaponry (NSO). Not a fraud alert.' } },
  { icon:'shield', date:'16.11',
    kind:{ ru:'SMS / ссылка', fr:'SMS / lien', en:'SMS / link' },
    t:{ ru:'Подделка под Yad2', fr:'Imitation de Yad2', en:'Yad2 impersonation' },
    p:{ ru:'«Завершите заказ и доставку» — ссылка на фальшивый магазин приложений с фейковыми рейтингами. Установка из неизвестного источника = прямой признак вредоноса.', fr:'« Finalisez commande et livraison » — lien vers une fausse boutique d’applications aux faux avis. Autoriser une installation d’une source inconnue = signe certain de malware.', en:'“Complete your order and delivery” — a link to a fake app store with fake ratings. Allowing an install from an unknown source = a sure malware sign.' } }
];
const TICKER = [
  { icon:'bank', v:'3,25%', cls:'down', d:{ ru:'▼ 0.25', fr:'▼ 0.25', en:'▼ 0.25' }, n:{ ru:'Ставка Банка Израиля', fr:'Taux Bank Israel', en:'BoI rate' } },
  { icon:'pie', v:'1,1%', cls:'down', d:{ ru:'▼ 0,1% за мес.', fr:'▼ 0,1 % /mois', en:'▼ 0.1% m/m' }, n:{ ru:'Мадад (год)', fr:'Madad (an)', en:'CPI (year)' } },
  { icon:'dollar', v:'3,38 ₪', cls:'up', d:{ ru:'▲ 1.2%', fr:'▼ 0.1 %', en:'▼ 0.1%' }, n:{ ru:'USD/₪', fr:'USD/₪', en:'USD/₪' } },
  { icon:'euro', v:'3,70 ₪', cls:'up', d:{ ru:'▲ 1%', fr:'▲ 0.1 %', en:'▲ 0.1%' }, n:{ ru:'EUR/₪', fr:'EUR/₪', en:'EUR/₪' } },
  { icon:'wallet', v:{ ru:'6 444 ₪', fr:'6 444 ₪', en:'6,444 ₪' }, cls:'', d:null, n:{ ru:'Минимальная зарплата', fr:'Salaire minimum', en:'Minimum wage' } },
  { icon:'briefcase', v:{ ru:'14 515 ₪', fr:'14 515 ₪', en:'14,515 ₪' }, cls:'up', d:{ ru:'▲ 3.8%', fr:'▲ 3.8 %', en:'▲ 3.8%' }, n:{ ru:'Средняя зарплата', fr:'Salaire moyen', en:'Average wage' } },
  { icon:'fuel', v:{ ru:'7,85 ₪', fr:'7,85 ₪', en:'7.85 ₪' }, cls:'up', d:{ ru:'▲ 6.8%', fr:'▲ 6.8 %', en:'▲ 6.8%' }, n:{ ru:'Бензин 95', fr:'Essence 95', en:'Petrol 95' } },
  { icon:'home', v:{ ru:'4 919 ₪', fr:'4 919 ₪', en:'4,919 ₪' }, cls:'up', d:{ ru:'▲ 4.3%', fr:'▲ 4.3 %', en:'▲ 4.3%' }, n:{ ru:'Аренда 3-комн.', fr:'Loyer 3 pièces', en:'3-room rent' } },
  { icon:'bell', v:{ ru:'сегодня', fr:'aujourd’hui', en:'today' }, cls:'info', d:null, n:{ ru:'Кицбат йеладим — выплата', fr:'Kitsbat yeladim — versement', en:'Child allowance — paid' } }
];
const GOALS = {
  havraa: { rate:0.0, tax:0,
    name:{ ru:'Оздоровительные', fr:'Convalescence', en:'Convalescence pay' },
    hint:{ ru:'Чем больше стаж у одного работодателя — тем больше дней и сумма. 451,50 ₪ за день в 2026.', fr:'Plus votre ancienneté chez un employeur est longue, plus les jours et le montant sont élevés. 451,50 ₪ par jour en 2026.', en:'The longer your tenure with one employer, the more days and money. ₪451.50 per day in 2026.' } },
  hishtalmut: { rate:0.035, tax:0,
    name:{ ru:'Керен хишталмут', fr:'Keren hishtalmut', en:'Keren hishtalmut' },
    hint:{ ru:'Доходность фонда ~3,5% без налога при снятии через 6 лет.', fr:'Rendement du fonds ≈ 3,5 %, sans impôt si vous retirez après 6 ans.', en:'Fund yield ≈ 3.5%, tax-free if you withdraw after 6 years.' } },
  yeled: { rate:0.035, tax:0.25,
    name:{ ru:'Накопления ребёнку', fr:'Épargne enfant', en:'Child savings' },
    hint:{ ru:'Государство откладывает 58 ₪/мес + ваши взносы под ~3,5%.', fr:'L’État verse 58 ₪/mois + vos versements à ≈ 3,5 %.', en:'The state puts in ₪58/month plus your deposits at ~3.5%.' } },
  pikadon: { rate:0.045, tax:0.15,
    name:{ ru:'Пикадон (депозит)', fr:'Pikadon (dépôt)', en:'Pikadon (deposit)' },
    hint:{ ru:'Ставка введена вами; налог 15% — модельное допущение. Проверьте условия конкретного депозита.', fr:'Taux saisi par vous ; impôt de 15 % supposé. Vérifiez les conditions du dépôt.', en:'Your entered rate; 15% tax is an assumption. Check the deposit terms.' } }
};
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const LS = {
  get(k){ try { return window.localStorage.getItem(k); } catch(e){ return null; } },
  set(k,v){ try { window.localStorage.setItem(k,v); } catch(e){} }
};
function L(key){
  const e = I18N[key];
  if (!e) return key;
  return e[curLang] || e.ru;
}
function tx(obj){ return typeof obj === 'object' && obj !== null ? (obj[curLang] || obj.ru) : obj; }
function yearWord(n){
  if (curLang === 'fr') return n > 1 ? 'ans' : 'an';
  if (curLang === 'en') return n > 1 ? 'years' : 'year';
  return n === 1 ? 'год' : (n < 5 ? 'года' : 'лет');
}
function fmt(n){
  const s = Math.round(n).toLocaleString('en-US');
  return curLang === 'en' ? s : s.replace(/,/g, '\u00A0');
}
function applyStatic(){
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = L(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = L(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = L(el.dataset.i18nTitle); el.setAttribute('aria-label', L(el.dataset.i18nTitle)); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', L(el.dataset.i18nAria)); });
  document.documentElement.lang = curLang;
  document.title = L('meta_title');
  const lc = $('#langCur'); if (lc) lc.textContent = curLang.toUpperCase();
  $$('.lang-seg-btn, .lang-opt, .mm-lang .chip').forEach(b => b.classList.toggle('active', b.dataset.lang === curLang));
}
let LIVE_ISO = '';
let LIVE_PARTIAL = false;
const MONTHS_D = {
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};
const MONTHS_N = {
  ru: ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
  fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};
function fmtLiveDate(iso){
  const p = String(iso || '').split('-');
  if (p.length !== 3) return '';
  const d = +p[2], m = +p[1], y = p[0];
  if (!m || m > 12) return '';
  return curLang === 'en' ? MONTHS_D.en[m-1] + ' ' + d + ', ' + y : d + ' ' + MONTHS_D[curLang][m-1] + ' ' + y;
}
function fmtDec(x, dec){
  const s = (Math.round(x * 100) / 100).toFixed(dec == null ? 2 : dec);
  return curLang === 'en' ? s : s.replace('.', ',');
}
function fmtTri(n){
  const ru = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  const en = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return { ru: ru + ' ₪', fr: ru + ' ₪', en: en + ' ₪' };
}
function renderBadge(){
  const el = document.querySelector('[data-i18n="hero_badge"]');
  if (el) el.textContent = LIVE_ISO ? L(LIVE_PARTIAL ? 'hero_partial' : 'hero_badge').replace('{date}', fmtLiveDate(LIVE_ISO)) : L('hero_unavailable');
}
async function fetchLive(){
  if (typeof fetch !== 'function') return;
  try {
    const r = await fetch('https://exodus611.github.io/finance-portal/data/tablo.json', { cache: 'no-cache' });
    if (!r.ok) return;
    applyLive(await r.json());
    try {
      const rs = await fetch('https://exodus611.github.io/finance-portal/data/scams.json', { cache: 'no-cache' });
      if (rs.ok){
        const sj = await rs.json();
        const cyberEl = document.querySelector('[data-counter="cyber"]');
        if (cyberEl && sj && Array.isArray(sj.warnings)){
          cyberEl.dataset.count = String(sj.warnings.length);
          cyberEl.textContent = String(sj.warnings.length) + (cyberEl.dataset.suffix || '');
          const accBadge = document.querySelector('#cyberAcc .acc-badge');
          if (accBadge) accBadge.textContent = String(sj.warnings.length);
          renderCyberAlert(sj);
        }
      }
    } catch (e) { /* остаётся значение из каталога */ }
    try {
      const rh = await fetch('https://exodus611.github.io/finance-portal/data/rate_history.json', { cache: 'no-cache' });
      if (rh.ok){
        const hj = await rh.json();
        if (hj && Array.isArray(hj.monthly) && hj.monthly.length > 6){
          RATE_24 = hj.monthly.map(m => m.rate);
          RATE_24_LABELS = hj.monthly.map(m => m.period);
          TABLO[0].spark = RATE_24.slice(-11);
          let si = RATE_24.length - 1;
          while (si > 0 && RATE_24[si - 1] === RATE_24[RATE_24.length - 1]) si--;
          const sp = RATE_24_LABELS[si] || '';
          if (sp){
            const mn = MONTHS_N, primeTxt = typeof window._livePrime === 'number' ? fmtDec(window._livePrime) : '4,75';
            TABLO[0].note = {
              ru: 'Прайм ' + primeTxt + '% · с ' + mn.ru[+sp.slice(5,7) - 1] + ' ' + sp.slice(0,4),
              fr: 'Prime ' + primeTxt + ' % · depuis ' + mn.fr[+sp.slice(5,7) - 1] + ' ' + sp.slice(0,4),
              en: 'Prime ' + primeTxt + '% · since ' + mn.en[+sp.slice(5,7) - 1] + ' ' + sp.slice(0,4)
            };
          }
          renderDash();
          const cAcc2 = $('#chartAcc');
          if (cAcc2 && cAcc2.dataset.drawn) renderRateChart();
        }
      }
    } catch (e) { /* остаётся встроенный ряд */ }
  } catch (e) { /* офлайн/превью — остаётся встроенный снапшот */ }
}
function applyLive(j){
  try {
    const checked = j.auto && j.auto.last_run ? new Date(j.auto.last_run) : null;
    if (checked && !isNaN(checked.getTime())) {
      LIVE_ISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(checked);
      LIVE_PARTIAL = j.auto.ok !== true;
    }
    const small = '<small>%</small>';
    const b = j.boi || {};
    if (typeof b.rate === 'number'){
      const rate = b.rate * 100, prev = (b.prev_rate != null ? b.prev_rate : b.rate) * 100;
      const d = +(rate - prev).toFixed(2);
      const sgn = d > 0 ? '▲ +' : d < 0 ? '▼ ' : '';
      const dv = fmtDec(Math.abs(d), 2);
      TABLO[0].val = { ru: fmtDec(rate) + small, fr: fmtDec(rate) + small, en: fmtDec(rate) + small };
      TABLO[0].trend = { ru: sgn + dv + ' п.п.', fr: sgn + dv + ' pts', en: sgn + dv + ' pts' };
      TABLO[0].up = d > 0; TABLO[0].flat = d === 0;
      window._livePrime = (b.prime || 0) * 100; /* месяц начала текущего значения ставит история ставки */
      const sp = TABLO[0].spark; if (sp.length) sp[sp.length - 1] = rate;
      if (typeof RATE_24 !== 'undefined' && RATE_24.length) RATE_24[RATE_24.length - 1] = rate;
      TICKER[0].v = fmtDec(rate) + '%';
      TICKER[0].cls = d > 0 ? 'up' : d < 0 ? 'down' : '';
      TICKER[0].d = { ru: sgn + dv, fr: sgn + dv, en: sgn + dv };
      const featureRate = $('#featureRate'), featurePrime = $('#featurePrime');
      if (featureRate) featureRate.textContent = fmtDec(rate) + '%';
      if (featurePrime && typeof b.prime === 'number') featurePrime.textContent = fmtDec(b.prime * 100) + '%';
      const primeRing = document.querySelector('[data-ring-subkey="ring2_s"]');
      if (primeRing && typeof b.prime === 'number') { primeRing.dataset.ringLabel = fmtDec(b.prime * 100) + '%'; renderRings(); }
      const cr = $('#chipRate'), ct = $('#chipRateT');
      if (cr) cr.textContent = fmtDec(rate) + '%';
      if (ct){ ct.textContent = sgn + dv + (curLang === 'ru' ? ' п.п.' : ' pts'); ct.classList.toggle('chip-down', d < 0); }
    }
    const c = j.cpi || {};
    if (typeof c.yoy === 'number'){
      const y = c.yoy * 100, m = (c.mom != null ? c.mom : 0) * 100;
      const sgn = m > 0 ? '▲ +' : m < 0 ? '▼ ' : '';
      TABLO[1].val = { ru: fmtDec(y,1) + small, fr: fmtDec(y,1) + small, en: fmtDec(y,1) + small };
      TABLO[1].trend = { ru: sgn + fmtDec(Math.abs(m),1) + '% за мес.', fr: sgn + fmtDec(Math.abs(m),1) + ' % sur le mois', en: sgn + fmtDec(Math.abs(m),1) + '% m/m' };
      TABLO[1].up = m > 0; TABLO[1].flat = m === 0;
      const per = String(c.period || '');
      const mi = per ? +per.slice(5,7) - 1 : -1;
      if (mi >= 0) TABLO[1].note = {
        ru: 'цель 1–3% · ' + MONTHS_N.ru[mi],
        fr: 'cible 1–3 % · ' + MONTHS_N.fr[mi],
        en: 'target 1–3% · ' + MONTHS_N.en[mi]
      };
      const ring1 = document.querySelector('[data-ring-subkey="ring1_s"]');
      if (ring1) { ring1.dataset.ringLabel = fmtDec(y,1) + '%'; renderRings(); }
      TICKER[1].v = fmtDec(y,1) + '%';
      TICKER[1].cls = m > 0 ? 'up' : m < 0 ? 'down' : '';
      TICKER[1].d = { ru: sgn + fmtDec(Math.abs(m),1) + '% за мес.', fr: sgn + fmtDec(Math.abs(m),1) + ' % /mois', en: sgn + fmtDec(Math.abs(m),1) + '% m/m' };
    }
    const fx = j.fx || {};
    [['official','USD',2],['official','EUR',3]].forEach(function(a){
      const kk = a[0], cur = a[1], idx = a[2];
      const o = fx[kk] || {}, pv = (fx.prev || {})[kk] || {};
      const v = o[cur], pr = pv[cur];
      if (typeof v !== 'number') return;
      const val = fmtDec(v, 2) + ' ₪';
      TABLO[idx].val = { ru: val, fr: val, en: val };
      if (fx.official_date) {
        const date = fx.official_date.slice(8,10) + '.' + fx.official_date.slice(5,7) + '.' + fx.official_date.slice(0,4);
        TABLO[idx].note = { ru:'Курс Банка Израиля · ' + date, fr:'Banque d’Israël · ' + date, en:'Bank of Israel · ' + date };
      }
      if (TABLO[idx].spark.length) TABLO[idx].spark[TABLO[idx].spark.length - 1] = v;
      TICKER[idx].v = { ru: val, fr: val, en: val };
      if (typeof pr === 'number' && Math.abs(pr - v) > 1e-9){
        const p = (v / pr - 1) * 100;
        const sgn = p > 0 ? '▲ +' : '▼ ';
        TABLO[idx].trend = sgn + fmtDec(Math.abs(p),1) + '%';
        TABLO[idx].up = p > 0; TABLO[idx].flat = false;
        TICKER[idx].cls = p > 0 ? 'up' : 'down';
        TICKER[idx].d = { ru: sgn + fmtDec(Math.abs(p),1) + '%', fr: sgn + fmtDec(Math.abs(p),1) + ' %', en: sgn + fmtDec(Math.abs(p),1) + '%' };
        if (cur === 'USD'){ const t = $('#chipUsdT'); if (t){ t.textContent = sgn + fmtDec(Math.abs(p),1) + '%'; t.classList.toggle('chip-down', p < 0); } }
      }
      if (cur === 'USD'){ const e2 = $('#chipUsd'); if (e2) e2.textContent = val; }
    });
    const w = j.wage || {};
    if (typeof w.min_monthly === 'number'){
      const tri = fmtTri(w.min_monthly);
      TABLO[4].val = tri; TICKER[4].v = tri;
      const s = String(w.since || '');
      if (s.length === 10){
        const dmy = s.slice(8,10) + '.' + s.slice(5,7) + '.' + s.slice(0,4);
        TABLO[4].note = {
          ru: 'с ' + dmy,
          fr: 'depuis le ' + dmy,
          en: 'since ' + MONTHS_D.en[+s.slice(5,7)-1] + ' ' + +s.slice(8,10) + ', ' + s.slice(0,4)
        };
      }
    }
    if (typeof w.avg_cbs_monthly === 'number'){
      const triAvg = fmtTri(w.avg_cbs_monthly);
      TABLO[5].val = triAvg; TICKER[5].v = triAvg;
      const perA = String(w.avg_cbs_period || '');
      const miA = perA ? +perA.slice(5,7) - 1 : -1;
      if (miA >= 0) TABLO[5].note = {
        ru: 'ЦСУ · ' + MONTHS_N.ru[miA] + ' ' + perA.slice(0,4) + ' · оценка',
        fr: 'ICBS · ' + MONTHS_N.fr[miA] + ' ' + perA.slice(0,4) + ' · estimation',
        en: 'CBS · ' + MONTHS_N.en[miA] + ' ' + perA.slice(0,4) + ' · estimate'
      };
      if (typeof w.avg_cbs_yoy === 'number'){
        const yA = w.avg_cbs_yoy * 100, sgnA = yA >= 0 ? '▲ +' : '▼ ';
        TABLO[5].trend = sgnA + fmtDec(Math.abs(yA),1) + '%';
        TABLO[5].up = yA > 0; TABLO[5].flat = false;
        TICKER[5].cls = yA > 0 ? 'up' : 'down';
        TICKER[5].d = { ru: sgnA + fmtDec(Math.abs(yA),1) + '%', fr: sgnA + fmtDec(Math.abs(yA),1) + ' %', en: sgnA + fmtDec(Math.abs(yA),1) + '%' };
      }
      if (TABLO[5].spark.length) TABLO[5].spark[TABLO[5].spark.length - 1] = w.avg_cbs_monthly;
    }
    const f = j.fuel || {};
    if (typeof f.price_95 === 'number' && typeof f.prev_price === 'number'){
      const v = f.price_95, p = (v / f.prev_price - 1) * 100;
      const sgn = p >= 0 ? '▲ +' : '▼ ';
      const val = fmtDec(v, 2) + ' ₪';
      TABLO[6].val = { ru: val, fr: val, en: val };
      TABLO[6].trend = sgn + fmtDec(Math.abs(p),1) + '%';
      TABLO[6].up = p > 0;
      const mm = String(f.period || '').match(/(\d{2}\.\d{2})/);
      const dmy = mm ? mm[1] : '';
      const enM = dmy ? MONTHS_D.en[+dmy.slice(3,5)-1] + ' ' + +dmy.slice(0,2) : '';
      TABLO[6].note = {
        ru: '+' + fmtDec(v - f.prev_price, 2) + ' ₪ с ' + dmy,
        fr: '+' + fmtDec(v - f.prev_price, 2) + ' ₪ depuis le ' + dmy,
        en: '+' + fmtDec(v - f.prev_price, 2) + ' ₪ since ' + enM
      };
      TICKER[6].v = { ru: val, fr: val, en: val };
      TICKER[6].cls = p > 0 ? 'up' : 'down';
      TICKER[6].d = { ru: sgn + fmtDec(Math.abs(p),1) + '%', fr: sgn + fmtDec(Math.abs(p),1) + ' %', en: sgn + fmtDec(Math.abs(p),1) + '%' };
      const cf = $('#chipFuel'), ct2 = $('#chipFuelT');
      if (cf) cf.textContent = val;
      if (ct2){ ct2.textContent = sgn + fmtDec(Math.abs(p),1) + '%'; ct2.classList.toggle('chip-down', p < 0); }
    }
    const rb = j.rent_by_city || {};
    if (typeof rb.national_avg === 'number'){
      const tri = fmtTri(rb.national_avg);
      TABLO[7].val = tri; TICKER[7].v = tri;
      const perR = String(rb.period || '');
      const miR = perR ? +perR.slice(5,7) - 1 : -1;
      if (miR >= 0) TABLO[7].note = {
        ru: 'средняя по стране · данные: ' + MONTHS_N.ru[miR] + ' ' + perR.slice(0,4),
        fr: 'moyenne nationale · données : ' + MONTHS_N.fr[miR] + ' ' + perR.slice(0,4),
        en: 'national average · data: ' + MONTHS_N.en[miR] + ' ' + perR.slice(0,4)
      };
      if (typeof rb.yoy === 'number'){
        const y = rb.yoy * 100, sgn = y >= 0 ? '▲ +' : '▼ ';
        TABLO[7].trend = sgn + fmtDec(Math.abs(y),1) + '%';
        TABLO[7].up = y > 0;
        const ring3 = document.querySelector('[data-ring-subkey="ring3_s"]');
        if (ring3) { ring3.dataset.ringLabel = (y >= 0 ? '+' : '−') + fmtDec(Math.abs(y),1) + '%'; renderRings(); }
        TICKER[7].cls = y > 0 ? 'up' : 'down';
        TICKER[7].d = { ru: sgn + fmtDec(Math.abs(y),1) + '%', fr: sgn + fmtDec(Math.abs(y),1) + ' %', en: sgn + fmtDec(Math.abs(y),1) + '%' };
      }
    }
    renderBadge(); renderDash(); renderTicker();
    const cAcc = $('#chartAcc');
    if (cAcc && cAcc.dataset.drawn) renderRateChart();
  } catch (e) { /* тихо: остаётся встроенный снапшот */ }
}
function sparkPath(vals, w, h){
  const min = Math.min(...vals), max = Math.max(...vals), rng = (max - min) || 1;
  const pts = vals.map((v,i) => [i * (w / (vals.length - 1)), h - 4 - ((v-min)/rng)*(h-10)]);
  if (pts.length < 3) return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++){
    const p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1, i+2)];
    const c1x = p1[0] + (p2[0]-p0[0])/6, c1y = p1[1] + (p2[1]-p0[1])/6;
    const c2x = p2[0] - (p3[0]-p1[0])/6, c2y = p2[1] - (p3[1]-p1[1])/6;
    d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}
function sparkPosText(i, n){
  return curLang === 'ru' ? 'точка ' + (i + 1) + ' из ' + n
       : curLang === 'fr' ? 'point ' + (i + 1) + ' sur ' + n
       : 'point ' + (i + 1) + ' of ' + n;
}
function renderDash(){
  const el = $('#dashGrid'); if (!el) return;
  el.innerHTML = TABLO.map((c, i) => {
    const sp = c.spark, n = sp.length;
    const min = Math.min(...sp), max = Math.max(...sp), rng = (max - min) || 1;
    const pointXY = (v, j) => [8 + j * 184 / (n - 1), 55 - (v - min) / rng * 42];
    const points = sp.map((v, j) => pointXY(v, j));
    const [xLast, yLast] = points[n-1];
    const unit = i < 2 ? '%' : '₪';
    return `
    <div class="dash-card reveal${c.gold ? ' gold' : ''}">
      <div class="dash-top"><span class="dash-ico-sm">${ico(c.icon, 13)}</span><span class="dash-lbl">${tx(c.name)}</span><span class="dash-trend ${c.flat ? 'trend-flat' : (c.up ? 'trend-up' : 'trend-down')}">${tx(c.trend)}</span></div>
      <div class="dash-val">${tx(c.val)}</div>
      <div class="dash-note">${tx(c.note)}</div>
      <div class="dash-plot">
        <div class="plot-meta"><strong class="spark-value">${String(sp[n-1]).replace('.', curLang === 'en' ? '.' : ',')} ${unit}</strong></div>
        <div class="dash-chart" aria-hidden="true">
          <svg class="dash-spark" viewBox="0 0 200 68" preserveAspectRatio="xMidYMid meet">
            <path class="plot-grid" d="M8 13 H192 M8 34 H192 M8 55 H192"/>
            <path class="spark-area" d="M${points.map(p => p.map(v => v.toFixed(2)).join(' ')).join(' L')} L192 62 L8 62 Z"/>
            <polyline class="plot-connector" pathLength="100" points="${points.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>
            ${points.map((p, j) => `<circle class="plot-point" cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="2.7" data-point="${j}"/>`).join('')}
            <line class="spark-guide" x1="${xLast.toFixed(2)}" y1="5" x2="${xLast.toFixed(2)}" y2="62"/><circle class="spark-end" cx="${xLast.toFixed(2)}" cy="${yLast.toFixed(2)}" r="4.1"/>
          </svg>
        </div>
        <div class="plot-footer"><span><b class="spark-index">${sparkPosText(n - 1, n)}</b></span></div>
      </div>
      <input class="spark-range" type="range" min="0" max="${n-1}" value="${n-1}" step="1" data-spark-index="${i}" aria-label="${tx(c.name).replace(/<[^>]*>/g,'')} — ${curLang === 'ru' ? 'выбрать точку графика' : curLang === 'fr' ? 'choisir un point du graphique' : 'select a chart point'}">
    </div>`;
  }).join('');
  el.querySelectorAll('.spark-range').forEach(input => {
    const card = input.closest('.dash-card'), chart = card.querySelector('.dash-chart');
    const vals = TABLO[Number(input.dataset.sparkIndex)].spark;
    const update = () => {
      const idx = Number(input.value), value = vals[idx], min = Math.min(...vals), max = Math.max(...vals);
      const x = 8 + idx * 184 / (vals.length - 1), y = 55 - (value - min) / ((max - min) || 1) * 42;
      const dot = card.querySelector('.spark-end'), guide = card.querySelector('.spark-guide');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); guide.setAttribute('x1', x); guide.setAttribute('x2', x);
      card.querySelector('.spark-index').textContent = sparkPosText(idx, vals.length);
      card.querySelector('.spark-value').textContent = new Intl.NumberFormat(curLang === 'en' ? 'en-US' : 'ru-RU', {maximumFractionDigits:2}).format(value) + (Number(input.dataset.sparkIndex) < 2 ? ' %' : ' ₪');
      input.setAttribute('aria-valuetext', (idx + 1) + ' / ' + vals.length + ': ' + String(value));
    };
    input.addEventListener('input', update); update();
    chart.addEventListener('pointerdown', e => { chart.setPointerCapture(e.pointerId); pick(e); });
    chart.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) pick(e); });
    function pick(e){ const svg = chart.querySelector('svg'), point = svg.createSVGPoint(); point.x=e.clientX; point.y=e.clientY; const pos=point.matrixTransform(svg.getScreenCTM().inverse()); input.value = Math.max(0, Math.min(vals.length-1, Math.round((pos.x-8)/184*(vals.length-1)))); update(); }
  });
}
function renderTicker(){
  const el = $('#tickerTrack'); if (!el) return;
  try {
    const nd = nextMonthly(20);
    TICKER[8].v = nd.days === 0
      ? { ru:'сегодня', fr:'aujourd’hui', en:'today' }
      : { ru: nd.display.slice(0,5), fr: nd.display.slice(0,5), en: nd.display.slice(0,5) };
  } catch (e) { /* остаётся подпись из снапшота */ }
  const items = TICKER.map(t =>
    `<span class="ticker-item"><span class="tico">${ico(t.icon,14)}</span>${tx(t.n)}: <b>${tx(t.v)}</b>${t.d ? `<span class="${t.cls}">${tx(t.d)}</span>` : ''}</span>`).join('');
  el.innerHTML = items + items; /* дубль для бесшовности */
}
let PAY_RENDERED = [];
function nextMonthly(day){
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Jerusalem', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const g = {}; parts.forEach(x => { g[x.type] = +x.value; });
  const todayUTC = Date.UTC(g.year, g.month - 1, g.day);
  let y = g.year, m = g.month - 1, cand = Date.UTC(y, m, day);
  if (cand < todayUTC){ m++; if (m > 11){ m = 0; y++; } cand = Date.UTC(y, m, day); }
  const dt = new Date(cand), pad = n => String(n).padStart(2, '0');
  const yy = dt.getUTCFullYear(), mm = pad(dt.getUTCMonth() + 1), dd = pad(dt.getUTCDate());
  return { iso: yy + '-' + mm + '-' + dd, display: dd + '.' + mm + '.' + yy, days: Math.round((cand - todayUTC) / 86400000) };
}
function payBadgeText(days){
  if (days === 0) return { ru:'сегодня', fr:'aujourd’hui', en:'today' };
  if (days === 1) return { ru:'завтра', fr:'demain', en:'tomorrow' };
  return { ru:'через ' + days + ' дн.', fr:'dans ' + days + ' jours', en:'in ' + days + ' days' };
}
function renderPayments(){
  const el = $('#payGrid'); if (!el) return;
  PAY_RENDERED = PAYMENTS.map(p => Object.assign({}, p, nextMonthly(p.day))).sort((a, b) => a.days - b.days);
  el.innerHTML = PAY_RENDERED.map((p,i) => `
    <div class="pay-card reveal${p.days === 0 ? ' is-today' : ''}">
      <div class="pay-top"><span class="pay-emoji">${ico(p.icon, 24)}</span><span class="pay-badge ${p.days === 0 ? 'badge-today' : 'badge-soon'}">${tx(payBadgeText(p.days))}</span></div>
      <div class="pay-name">${tx(p.name)}<span class="he"> ${p.he}</span></div>
      <div class="pay-date">${ico('calendar',14)} <b>${p.display}</b></div>
      <div class="pay-what">${tx(p.what)}</div>
      <div class="pay-actions">
        <a class="btn btn-ghost" href="${p.url}">${L('btn_details')}</a>
        <button class="btn btn-gold" data-rem="${i}">${ico('bell',15)} ${L('btn_remind')}</button>
      </div>
    </div>`).join('');
  el.onclick = e => {
    const btn = e.target.closest('[data-rem]');
    if (btn) openReminder(PAY_RENDERED[+btn.dataset.rem]);
  };
}
function openReminder(p){
  const m = $('#remModal'); if (!m) return;
  $('#remDate').textContent = `${p.display} · ${tx(p.name)}`;
  const iso = p.iso;
  const nm = tx(p.name);
  const title = encodeURIComponent(`ShekelPRO: ${nm}`);
  const details = encodeURIComponent(`${nm}${p.he ? ' (' + p.he + ')' : ''} — shekelpro`);
  $('#gcalLink').href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${iso}T090000/${iso}T093000&details=${details}`;
  const btn = $('#icsLink');
  btn.onclick = () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','DTSTART:'+iso.replace(/-/g,'')+'T090000','SUMMARY:'+nm,'DESCRIPTION:'+nm+' — ShekelPRO','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'}));
    a.download = 'shekelpro-reminder.ics'; a.click(); URL.revokeObjectURL(a.href);
  };
  m.hidden = false; document.body.style.overflow = 'hidden';
}
let curCat = 'all', curQuery = '', curScenario = '';
const SYNONYMS = {
  'ипотека':['машканта'], 'ипотеку':['машканта'], 'ипотеки':['машканта'], 'mortgage':['mashkanta'],
  'пособие':['кицба','пособие'], 'пособия':['кицба','пособие'], 'пособий':['кицба','пособие'],
  'оздоровительные':['авраа','оздоровительные'], 'оздоровительных':['авраа'],
  'безработица':['автала','безработица'], 'безработице':['автала'], 'безработицы':['автала'],
  'покупку':['рехиша','покупку'], 'уволили':['автала'], 'увольнение':['автала']
};
const KEYWORDS = {
  'mashkanta':'ипотека ипотеку mortgage жилищный кредит',
  'salary':'нетто брутто зарплата netto gross оклад',
  'avtala':'безработица пособие увольнение уволили',
  'mas-rehisha':'налог на покупку квартиры purchase tax',
  'arnona':'муниципальный налог скидка репатриант олим',
  'pension-calc':'пенсия накопления выйти на пенсию',
  'maanak-avoda':'пособие отрицательный подоходный налог',
  'havraa':'оздоровительные авраа дмей авраа',
  'payments':'выплаты даты пособий кицба календарь выплат',
  'hisahon-yeled':'детское пособие накопления на ребёнка',
  'ashlamat-ahnasa':'пособие социальная надбавка доплата',
  'avtahat-ahnasa':'пособие прожиточный минимум'
};
function calcHay(c){ return (tx(c.t) + ' ' + tx(c.d) + ' ' + (KEYWORDS[c.id] || '')).toLowerCase(); }
function matchCalc(c, q){
  const hay = calcHay(c);
  return q.split(/\s+/).filter(Boolean).every(tok =>
    [tok, ...(SYNONYMS[tok] || [])].some(v => hay.includes(v)));
}
const SCENARIOS = {
  olim:{ l:{ ru:'Только приехал', fr:'Je viens d’arriver', en:'Just arrived' }, ids:['arnona','salary','mas-rehisha','payments','slovar'] },
  work:{ l:{ ru:'Работаю', fr:'Je travaille', en:'I work' }, ids:['salary','maanak-avoda','havraa','nekudot-zikuy','pension-calc'] },
  buy:{ l:{ ru:'Покупаю квартиру', fr:'J’achète un logement', en:'Buying a home' }, ids:['mashkanta','mas-rehisha','arenda-vs-pokupka','dira','arnona'] },
  retire:{ l:{ ru:'Готовлюсь к пенсии', fr:'Je prépare ma retraite', en:'Planning retirement' }, ids:['pension-calc','pension-gap','ashlamat-ahnasa','avtahat-ahnasa','keren-hishtalmut'] }
};
// HOT badge is scarce by design: only the four most popular calculators.
const HOT_BADGE = new Set([...CALCS].sort((a,b) => b.hot - a.hot).slice(0,4).map(c => c.id));
// Калькуляторы систематизированы аккордеонами по категориям: по умолчанию
// закрыты ВСЕ полки, включая «Популярное» (решение владельца 2026-11-25) —
// видна компактная карта категорий, а не раскрытая простыня.
const calcOpen = new Set();
function bindCalcAccs(box){
  if (!box || box.dataset.bound) return;
  box.dataset.bound = '1';
  box.addEventListener('toggle', e => {
    const d = e.target.closest && e.target.closest('details[data-cat]');
    if (!d) return;
    if (d.open) calcOpen.add(d.dataset.cat); else calcOpen.delete(d.dataset.cat);
  }, true);
}
function renderChips(){
  const el = $('#filterChips'); if (!el) return;
  el.innerHTML = Object.entries(CATS).map(([k,v]) =>
    `<button class="chip${k === curCat ? ' active' : ''}" data-cat="${k}">${ico(v.i,14)} ${tx(v.l)}</button>`).join('');
}
function renderScenarios(){
  const el = $('#scenarioChips'); if (!el) return;
  el.innerHTML = Object.entries(SCENARIOS).map(([k,v]) =>
    `<button class="chip scenario-chip${k === curScenario ? ' active' : ''}" data-scenario="${k}" aria-pressed="${k === curScenario}">${tx(v.l)}</button>`).join('');
}
function bindScenarios(){
  const el = $('#scenarioChips'); if (!el || el.dataset.bound) return;
  el.dataset.bound = '1';
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-scenario]'); if (!b) return;
    curScenario = curScenario === b.dataset.scenario ? '' : b.dataset.scenario;
    renderScenarios(); renderCalcs();
  });
}
function bindChips(){
  const el = $('#filterChips'); if (!el || el.dataset.bound) return;
  el.dataset.bound = '1';
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    curCat = b.dataset.cat;
    $$('#filterChips .chip').forEach(c => c.classList.toggle('active', c.dataset.cat === curCat));
    renderCalcs();
  });
}
function renderCalcs(){
  const box = $('#calcAccs'), empty = $('#emptyNote'); if (!box) return;
  bindCalcAccs(box);
  const q = curQuery.trim().toLowerCase();
  const filtering = !!q || !!curScenario;
  const match = c => (!curScenario || SCENARIOS[curScenario].ids.includes(c.id)) && (!q || matchCalc(c, q));
  const card = c => `
    <a class="calc-card reveal" href="${u(c.id + '.html')}">
      ${HOT_BADGE.has(c.id) ? '<span class="hot-tag" style="position:absolute;top:14px;right:14px">HOT</span>' : ''}
      <span class="calc-icon">${ico(c.icon, 24)}</span>
      <span class="calc-title">${tx(c.t)}</span>
      <span class="calc-desc">${tx(c.d)}</span>
      <span class="calc-go">${L('calc_go')}</span>
    </a>`;
  // Порядок полок: сначала зарплата и жильё (самое ходовое), потом пенсия,
  // авто/кредиты, экономика и справочники. «Популярное» — витрина сверху,
  // при поиске/сценарии прячется, чтобы карточки не двоились.
  const GROUPS = ['hot','salary','home','pension','auto','econ','guide'];
  let total = 0;
  box.innerHTML = GROUPS.map(k => {
    if (k === 'hot' && filtering) return '';
    const items = CALCS.filter(c => (k === 'hot' ? c.hot >= 85 : c.cat === k) && match(c))
      .sort((a,b) => b.hot - a.hot);
    const shown = k === 'hot' ? items.slice(0, 8) : items;
    if (!shown.length) return '';
    total += shown.length;
    const open = filtering || calcOpen.has(k);
    return `<details class="sec-acc calc-acc" data-cat="${k}"${open ? ' open' : ''}>
      <summary>${ico(CATS[k].i, 18)}<span>${tx(CATS[k].l)}</span><span class="acc-badge">${shown.length}</span><span class="acc-chev">${ico('chevron', 16)}</span></summary>
      <div class="sec-acc-in"><div class="calc-grid">${shown.map(card).join('')}</div></div>
    </details>`;
  }).join('');
  if (empty) empty.hidden = total > 0;
  const cc = $('#calcCount');
  if (cc) cc.innerHTML = L('calc_count').replace('{n}', CALCS.length);
  observeReveals();
}
let RATE_24 = [4.5,4.5,4.5,4.5,4.5,4.5,4.5,4.5,4.5,4.5,4.5,4.25,4.25,4.0,4.0,4.0,4.0,3.75,3.75,3.5,3.5,3.25,3.25,3.25];
let RATE_24_LABELS = ['2024-12','2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11'];
function renderRateChart(){
  const box = $('#rateChart'); if (!box) return;
  const W = 600, H = 150, PADL = 30, PADR = 12, PADT = 10, PADB = 20;
  const vals = RATE_24, n = vals.length;
  const nowLabel = document.querySelector('[data-i18n="chart_now"]');
  if (nowLabel) nowLabel.textContent = (curLang === 'ru' ? 'сейчас ' : curLang === 'fr' ? 'actuel ' : 'now ') + fmtDec(vals[n-1]) + '%';
  const peakLabel = document.querySelector('[data-i18n="chart_peak"]');
  if (peakLabel) peakLabel.textContent = (curLang === 'ru' ? 'максимум за 24 мес. ' : curLang === 'fr' ? 'maximum sur 24 mois : ' : '24-month high ') + fmtDec(Math.max(...vals)) + '%';
  const min = Math.max(0, Math.floor(Math.min(...vals) - 0.5)), max = Math.ceil(Math.max(...vals) + 0.5);
  const x = i => PADL + i * (W - PADL - PADR) / (n - 1);
  const y = v => PADT + (1 - (v - min) / (max - min)) * (H - PADT - PADB);
  const pts = vals.map((v,i) => [x(i), y(v)]);
  const line = pts.map(([px,py],i) => (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1)).join(' ');
  const area = line + ` L ${x(n-1).toFixed(1)} ${H-PADB} L ${x(0).toFixed(1)} ${H-PADB} Z`;
  const last = pts[n-1];
  const gridVals = []; for (let gv = Math.ceil(min); gv <= Math.floor(max); gv++) gridVals.push(gv);
  const grid = gridVals.map(v =>
    `<line class="chart-grid-l" x1="${PADL}" y1="${y(v).toFixed(1)}" x2="${W-PADR}" y2="${y(v).toFixed(1)}"/><text class="chart-ylab" x="${PADL-6}" y="${(y(v)+3).toFixed(1)}" text-anchor="end">${v}%</text>`).join('');
  const ylab = { ru:['2025','2026'], fr:['2025','2026'], en:['2025','2026'] }[curLang];
  const years = '';
  box.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bank rate chart">
      <defs>
        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(232,182,76,.34)"/><stop offset="1" stop-color="rgba(232,182,76,0)"/></linearGradient>
        <linearGradient id="rateStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c99a35"/><stop offset="1" stop-color="#f6d387"/></linearGradient>
      </defs>
      ${grid}${years}
      <path class="rate-area" d="${area}"/>
      <path class="rate-line" d="${line}"/>
      <circle class="rate-dot-pulse" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="7"/>
      <circle class="rate-dot" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4.5"/>
      <line class="hover-line" id="hoverLine" x1="0" y1="${PADT}" x2="0" y2="${H-PADB}"/>
      <circle class="hover-dot" id="hoverDot" r="4.5"/>
    </svg>
    <div class="chart-tip" id="chartTip"></div>`;
  const band = box.closest('.chart-band');
  if (band) requestAnimationFrame(() => {
    const path = box.querySelector('.rate-line');
    try {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.3,.7,.3,1) .2s';
      path.style.strokeDashoffset = '0';
      band.classList.add('drawn');
    } catch(e){ band.classList.add('drawn'); }
  });
  const svg = box.querySelector('svg');
  const tip = $('#chartTip'), hl = $('#hoverLine'), hd = $('#hoverDot');
  if (!svg || !tip) return;
  const move = e => {
    const r = svg.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const rx = px / r.width * W;
    let idx = Math.round((rx - PADL) / ((W - PADL - PADR) / (n - 1)));
    idx = Math.max(0, Math.min(n - 1, idx));
    const [cx2, cy2] = pts[idx];
    hl.setAttribute('x1', cx2); hl.setAttribute('x2', cx2); hl.style.opacity = 1;
    hd.setAttribute('cx', cx2); hd.setAttribute('cy', cy2); hd.style.opacity = 1;
    tip.style.opacity = 1;
    tip.style.left = (cx2 / W * r.width) + 'px';
    tip.style.top = (cy2 / H * r.height) + 'px';
    const per = RATE_24_LABELS[idx] || '';
    const mName = per ? MONTHS_N[curLang][+per.slice(5,7) - 1] : '';
    const mCap = mName ? mName.charAt(0).toUpperCase() + mName.slice(1) : '';
    tip.innerHTML = `${mCap} ${per.slice(0,4)}: <b>${fmtDec(vals[idx])}%</b>`;
  };
  const leave = () => { tip.style.opacity = 0; hl.style.opacity = 0; hd.style.opacity = 0; };
  svg.addEventListener('mousemove', move);
  svg.addEventListener('touchmove', move, { passive:true });
  svg.addEventListener('mouseleave', leave);
  // Keyboard access + a table equivalent: the chart must read without a mouse.
  const live = $('#chartLive');
  let kbIdx = n - 1;
  const showPoint = idx => {
    kbIdx = Math.max(0, Math.min(n - 1, idx));
    const r = svg.getBoundingClientRect();
    const fake = { clientX: r.left + pts[kbIdx][0] / W * r.width, touches: null };
    move(fake);
    if (live) live.textContent = tip.textContent;
  };
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-label', (curLang === 'ru' ? 'График ставки Банка Израиля по месяцам. Стрелки влево и вправо — значения по месяцам. Сейчас ' : curLang === 'fr' ? 'Graphique du taux de la Banque d’Israël par mois. Flèches gauche et droite pour parcourir. Actuel : ' : 'Bank of Israel rate by month. Left and right arrows move through values. Now ') + fmtDec(vals[n-1]) + '%');
  svg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { showPoint(kbIdx + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { showPoint(kbIdx - 1); e.preventDefault(); }
    else if (e.key === 'Home') { showPoint(0); e.preventDefault(); }
    else if (e.key === 'End') { showPoint(n - 1); e.preventDefault(); }
  });
  svg.addEventListener('focus', () => showPoint(kbIdx));
  const dataBox = $('#rateChartData');
  if (dataBox) {
    const rows = vals.map((v,i) => {
      const per = RATE_24_LABELS[i] || '';
      const mName = per ? MONTHS_N[curLang][+per.slice(5,7) - 1] : '';
      const mCap = mName ? mName.charAt(0).toUpperCase() + mName.slice(1) : per;
      return `<tr><td>${mCap} ${per.slice(0,4)}</td><td>${fmtDec(v)}%</td></tr>`;
    }).join('');
    dataBox.innerHTML = `<summary>${L('chart_data_summary')}</summary><table><thead><tr><th>${L('chart_col_period')}</th><th>${L('chart_col_rate')}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}
function renderRings(){
  $$('.ring').forEach(ring => {
    const pct = +ring.dataset.ring / 100;
    const fg = ring.querySelector('.ring-fg');
    const val = ring.querySelector('.ring-val');
    if (!fg || !val) return;
    const C = 264;
    const label = ring.dataset.ringLabel;
    fg.style.strokeDashoffset = C;
    requestAnimationFrame(() => requestAnimationFrame(() => { fg.style.strokeDashoffset = (C * (1 - pct)).toFixed(1); }));
    const target = parseFloat(label.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const prefix = label.startsWith('+') ? '+' : '';
    const t0 = performance.now();
    (function tick(t){
      const p = Math.min(1, (t - t0) / 1200), e2 = 1 - Math.pow(1 - p, 3);
      const digits = (label.split(/[,.]/)[1] || '').replace(/[^0-9]/g, '').length;
      const out = curLang === 'en' ? (target * e2).toFixed(digits) : (target * e2).toFixed(digits).replace('.', ',');
      val.textContent = prefix + out + '%';
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}
function renderSolutions(){
  const el = $('#solGrid'); if (!el) return;
  el.innerHTML = SOLUTIONS.map(s => `
    <div class="sol-card reveal">
      <span class="sol-tag ${s.tag}">${tx(s.tagText)}</span>
      <h3><span class="sol-ic">${ico(s.icon, 19)}</span>${tx(s.t)}</h3>
      <p>${tx(s.p)}</p>
      <div class="sol-meta"><span>${tx(s.date)}</span><a href="${u(s.link)}">${tx(s.linkText)}</a></div>
    </div>`).join('');
  observeReveals();
}
const CYBER_KIND = {
  sms: { icon: 'msg', label: { ru: 'SMS / ссылка', fr: 'SMS / lien', en: 'SMS / link' } },
  call: { icon: 'phone', label: { ru: 'Звонок', fr: 'Appel', en: 'Call' } },
  web: { icon: 'globe', label: { ru: 'Сайт / фишинг', fr: 'Site / phishing', en: 'Website / phishing' } }
};
function cyberCard(c, href){
  return `
    <a class="cyber-item reveal" href="${href}">
      <div class="cyber-top"><span class="cyber-kind">${ico(c.icon,14)} ${c.kind}</span><span class="cyber-date">${c.date}</span></div>
      <h3>${c.t}</h3>
      <p>${c.p}</p>
      <span class="cyber-link">${L('cyber_link')}</span>
    </a>`;
}
function renderCyber(){
  const el = $('#cyberGrid'); if (!el) return;
  el.innerHTML = CYBER.map(c => cyberCard(
    { icon: c.icon, kind: tx(c.kind), date: c.date, t: tx(c.t), p: tx(c.p) }, 'cyber.html')).join('');
  observeReveals();
  renderCyberLive();
}
async function renderCyberLive(){
  const el = $('#cyberGrid'); if (!el || typeof fetch !== 'function') return;
  try {
    const base = 'https://exodus611.github.io/finance-portal/data/';
    const [rs, ri] = await Promise.all([
      fetch(base + 'scams.json', { cache: 'no-cache' }),
      fetch(base + 'scams_i18n.json').catch(() => null)
    ]);
    if (!rs.ok) return;
    const sj = await rs.json();
    const ij = ri && ri.ok ? await ri.json() : {};
    const tr = ij[curLang] || {};
    const items = (sj.warnings || []).slice(0, 3).map(w => {
      const t = curLang === 'ru' ? null : tr[String(w.id)];
      const kind = CYBER_KIND[w.type] || CYBER_KIND.web;
      const parts = String(w.date || '').split('-');
      return { icon: kind.icon, kind: tx(kind.label),
               date: parts.length === 3 ? parts[2] + '.' + parts[1] : (w.date || ''),
               t: t ? t.t : w.title, p: t ? t.s : w.summary, id: w.id };
    });
    if (items.length) {
      el.innerHTML = items.map(c => cyberCard(c, 'cyber.html#w' + c.id)).join('');
      observeReveals();
    }
  } catch (e) { /* остаются статичные карточки */ }
}
let coinTimer = null;
function calcPlan(){
  const sel = $('#goalSelect'), mr = $('#monthRange'), yr = $('#yearRange');
  if (!sel || !mr || !yr) return;
  const g = GOALS[sel.value];
  const rateInput = $('#pikadonRate'), rateWrap = $('#pikadonRateWrap');
  const isPikadon = sel.value === 'pikadon';
  rateWrap.hidden = !isPikadon;
  const validRate = rateInput.value.trim() !== '' && rateInput.validity.valid && Number.isFinite(Number(rateInput.value));
  const rate = isPikadon && validRate ? Number(rateInput.value) / 100 : g.rate;
  const m = +mr.value, yrs = +yr.value, months = yrs * 12;
  $('#monthVal').textContent = fmt(m) + ' ₪';
  $('#yearVal').textContent = yrs + ' ' + yearWord(yrs);
  if (isPikadon && !validRate) { $('#plannerResult').textContent = L('plan_pik_error'); return; }
  let sum = 0;
  for (let i = 1; i <= months; i++) sum = (sum + m) * (1 + rate / 12);
  const invested = m * months;
  const tax = (sum - invested) * (g.tax || 0);
  const net = sum - tax;
  $('#monthVal').textContent = fmt(m) + ' ₪';
  $('#yearVal').textContent = yrs + ' ' + yearWord(yrs);
  [mr, yr].forEach(r => { const p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--fill', p + '%'); });
  const taxPct = Math.round(g.tax * 100);
  const netLabel = g.tax
    ? (curLang === 'ru' ? `чистыми после налога ${taxPct}%` : curLang === 'fr' ? `net d’impôt de ${taxPct} %` : `net of ${taxPct}% tax`)
    : (curLang === 'ru' ? 'чистыми' : 'net');
  $('#plannerResult').innerHTML = `
    <div class="small">${tx(g.name)} · ${months} ${L('r_months')} · ${L('r_deposit')} ${fmt(invested)} ₪</div>
    <div class="big">${fmt(net)} ₪</div>
    <div class="small">${netLabel} · ${L('r_income')} <b style="color:var(--gold2)">${fmt(net - invested)} ₪</b></div>
    <div class="small" style="margin-top:8px">${L('r_tip')} ${tx(g.hint)}</div>`;
}
function spawnCoin(){
  const sky = $('#coinSky'); if (!sky) return;
  const c = document.createElement('span');
  c.className = 'coin'; c.textContent = '₪';
  c.style.left = Math.random() * 96 + '%';
  const dur = 2.6 + Math.random() * 2.4;
  c.style.animationDuration = dur + 's';
  c.style.fontSize = (12 + Math.random() * 8) + 'px';
  sky.appendChild(c);
  setTimeout(() => c.remove(), dur * 1000 + 200);
}
function startCoins(){ if (coinTimer) return; spawnCoin(); spawnCoin(); coinTimer = setInterval(spawnCoin, 340); }
function animateCount(el){
  const suf = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1300;
  function tick(t){
    const target = +el.dataset.count;
    const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * ease) + suf;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
let io = null;
function observeReveals(){
  const sel = '.reveal:not(.in), .zoom-img:not(.in)';
  if (!('IntersectionObserver' in window)){ $$('.reveal, .zoom-img').forEach(e => e.classList.add('in')); return; }
  if (!io) io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold:.12 });
  $$(sel).forEach(e => io.observe(e));
}
function initParallax(){
  const els = [...document.querySelectorAll('[data-plx]')];
  if (!els.length) return;
  if (window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches && innerWidth < 760)) return;
  let ticking = false;
  const upd = () => {
    ticking = false;
    const vh = innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -140 || r.top > vh + 140) return;
      const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.plx);
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    });
  };
  window.addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(upd); } }, { passive:true });
  upd();
}
function initTilt(){
  if (window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches)) return;
  document.addEventListener('mousemove', e => {
    const t = e.target.closest('.tilt'); if (!t) return;
    const r = t.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - .5) * -4.5;
    const ry = ((e.clientX - r.left) / r.width - .5) * 5.5;
    t.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  }, { passive:true });
  document.addEventListener('mouseout', e => {
    const t = e.target.closest('.tilt');
    if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) t.style.transform = '';
  }, { passive:true });
}
function renderAll(){
  const pensionLink = $('#pensionCalcLink');
  if (pensionLink) pensionLink.href = u('pension-calc.html');
  renderDash(); renderTicker(); renderPayments(); renderChips(); renderScenarios(); renderCalcs(); renderSolutions(); renderCyber();
  renderRateChart(); renderRings();
  renderBadge();
  if (typeof spRender === 'function') spRender();
}
function setLang(l){
  if (['ru','fr','en'].indexOf(l) === -1) return;
  curLang = l;
  LS.set('shekelpro_lang', l);
  applyStatic();
  renderAll();
  calcPlan();
  const menu = $('#langMenu'); if (menu) menu.hidden = true;
  const lb = $('#langBtn'); if (lb) lb.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href').length < 2) return;
  const target = document.getElementById(a.getAttribute('href').slice(1));
  const fold = target && target.querySelector(':scope > .wrap > .page-fold');
  if (fold) fold.open = true;
});
window.addEventListener('hashchange', () => {
  const target = document.getElementById(location.hash.slice(1));
  const fold = target && target.querySelector(':scope > .wrap > .page-fold');
  if (fold) fold.open = true;
});
function initHeroPhotoMotion(){
  const hero = document.querySelector('.hero-media'), photo = hero && hero.querySelector('.hero-photo');
  if (!hero || !photo || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let x=0, y=0, targetX=0, targetY=0, frame=0;
  function animate(){
    frame=0;
    if (motion.matches){ photo.style.removeProperty('--photo-x'); photo.style.removeProperty('--photo-y'); return; }
    x += (targetX-x)*0.08; y += (targetY-y)*0.08;
    photo.style.setProperty('--photo-x', x.toFixed(2)+'px'); photo.style.setProperty('--photo-y', y.toFixed(2)+'px');
    if (Math.abs(targetX-x) > .03 || Math.abs(targetY-y) > .03) frame=requestAnimationFrame(animate);
  }
  function run(){ if (!frame && !motion.matches) frame=requestAnimationFrame(animate); }
  hero.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r=hero.getBoundingClientRect(); targetX=((e.clientX-r.left)/r.width-.5)*12; targetY=((e.clientY-r.top)/r.height-.5)*8; run(); });
  hero.addEventListener('pointerleave', () => { targetX=targetY=0; run(); });
  motion.addEventListener('change', () => { if (motion.matches) { if (frame) cancelAnimationFrame(frame); frame=0; photo.style.removeProperty('--photo-x'); photo.style.removeProperty('--photo-y'); } });
}
/* ════════ КИБЕРЩИТ: плашка о новом предупреждении наверху ════════ */
function renderCyberAlert(sj){
  try {
    const list = (sj && sj.warnings) || [];
    if (!list.length) return;
    const latest = list.reduce((a, b) => (String(a.date) > String(b.date) ? a : b));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const age = Math.round((new Date(today) - new Date(latest.date)) / 864e5);
    if (!(age >= 0 && age <= 3)) return;
    if (LS.get('shekelpro_cyber_dismissed') === String(latest.id)) return;
    const bar = $('#cyberAlert'); if (!bar) return;
    const link = $('#cyberAlertLink');
    if (link) link.href = u('cyber.html') + '#' + latest.id;
    const txt = $('#cyberAlertText');
    const setTitle = t => { if (txt) txt.textContent = ' — ' + t + ' · ' + fmtLiveDate(latest.date); };
    setTitle(latest.title || '');
    if (curLang !== 'ru') {
      fetch('https://exodus611.github.io/finance-portal/data/scams_i18n.json', { cache: 'no-cache' })
        .then(r => (r.ok ? r.json() : null))
        .then(j => { const tr = j && j[curLang] && j[curLang][String(latest.id)]; if (tr && tr.t) setTitle(tr.t); })
        .catch(() => {});
    }
    bar.hidden = false;
    $$('a[href$="cyber.html"]').forEach(a => a.classList.add('nav-new'));
    const close = $('#cyberAlertClose');
    if (close) close.addEventListener('click', () => { bar.hidden = true; LS.set('shekelpro_cyber_dismissed', String(latest.id)); });
  } catch (e) { /* плашка не критична */ }
}

/* ════════ SMART PROMPT v4: умный запрос для вашего ИИ под любой поиск ════════ */
const SP_ABROAD = [
  { k:['герман','берлин','мюнхен','гамбург','франкфурт','кёльн','дюссельдорф','german','berlin','munich','hamburg','frankfurt','allemagne'], c:{ ru:'в Германии', fr:'en Allemagne', en:'in Germany' }, n:{ ru:'Германия', fr:'Allemagne', en:'Germany' } },
  { k:['великобритан','англи','лондон','манчестер','бирмингем','эдинбург','шотланд','britain','england','london','manchester','royaume-uni'], c:{ ru:'в Великобритании', fr:'au Royaume-Uni', en:'in the UK' }, n:{ ru:'Великобритания', fr:'Royaume-Uni', en:'UK' } },
  { k:['сша','америк','нью-йорк','нью йорк','лос-анджелес','майами','чикаго','бостон','сан-франциско','usa','america','new york','los angeles','miami','chicago','boston','états-unis'], c:{ ru:'в США', fr:'aux États-Unis', en:'in the USA' }, n:{ ru:'США', fr:'États-Unis', en:'USA' } },
  { k:['канад','торонто','монреал','ванкувер','canada','toronto','montreal','montréal','vancouver'], c:{ ru:'в Канаде', fr:'au Canada', en:'in Canada' }, n:{ ru:'Канада', fr:'Canada', en:'Canada' } },
  { k:['франц','париж','марсел','лион','ницц','france','paris','marseille','lyon','nice'], c:{ ru:'во Франции', fr:'en France', en:'in France' }, n:{ ru:'Франция', fr:'France', en:'France' } },
  { k:['испан','мадрид','барселон','валенси','малаг','spain','espagne','madrid','barcelona','barcelone'], c:{ ru:'в Испании', fr:'en Espagne', en:'in Spain' }, n:{ ru:'Испания', fr:'Espagne', en:'Spain' } },
  { k:['итали','рим','милан','неапол','флоренц','венеци','italy','italie','rome','roma','milan'], c:{ ru:'в Италии', fr:'en Italie', en:'in Italy' }, n:{ ru:'Италия', fr:'Italie', en:'Italy' } },
  { k:['кипр','ларнак','лимасол','никоси','пафос','cyprus','chypre'], c:{ ru:'на Кипре', fr:'à Chypre', en:'in Cyprus' }, n:{ ru:'Кипр', fr:'Chypre', en:'Cyprus' } },
  { k:['грец','афин','салоник','greece','grèce','athens','athènes'], c:{ ru:'в Греции', fr:'en Grèce', en:'in Greece' }, n:{ ru:'Греция', fr:'Grèce', en:'Greece' } },
  { k:['росси','москв','петербург','екатеринбург','новосибирск','russia','russie','moscow','moscou'], c:{ ru:'в России', fr:'en Russie', en:'in Russia' }, n:{ ru:'Россия', fr:'Russie', en:'Russia' } },
  { k:['украин','киев','одесс','харьков','львов','ukraine','kyiv','kiev','odessa'], c:{ ru:'в Украине', fr:'en Ukraine', en:'in Ukraine' }, n:{ ru:'Украина', fr:'Ukraine', en:'Ukraine' } },
  { k:['нидерланд','голланд','амстердам','netherlands','amsterdam','pays-bas'], c:{ ru:'в Нидерландах', fr:'aux Pays-Bas', en:'in the Netherlands' }, n:{ ru:'Нидерланды', fr:'Pays-Bas', en:'Netherlands' } },
  { k:['польш','варшав','краков','poland','pologne','warsaw','varsovie'], c:{ ru:'в Польше', fr:'en Pologne', en:'in Poland' }, n:{ ru:'Польша', fr:'Pologne', en:'Poland' } },
  { k:['грузи','тбилиси','батуми','georgia','géorgie','tbilisi'], c:{ ru:'в Грузии', fr:'en Géorgie', en:'in Georgia' }, n:{ ru:'Грузия', fr:'Géorgie', en:'Georgia' } },
  { k:['турци','стамбул','анталь','turkey','turquie','istanbul'], c:{ ru:'в Турции', fr:'en Turquie', en:'in Turkey' }, n:{ ru:'Турция', fr:'Turquie', en:'Turkey' } },
  { k:['оаэ','дубай','эмират','абу-даби','dubai','dubaï','emirates','émirats'], c:{ ru:'в ОАЭ', fr:'aux Émirats', en:'in the UAE' }, n:{ ru:'ОАЭ', fr:'Émirats', en:'UAE' } },
  { k:['португал','лиссабон','порту','portugal','lisbon','lisbonne'], c:{ ru:'в Португалии', fr:'au Portugal', en:'in Portugal' }, n:{ ru:'Португалия', fr:'Portugal', en:'Portugal' } },
  { k:['австри','вена','austria','autriche','vienna','vienne'], c:{ ru:'в Австрии', fr:'en Autriche', en:'in Austria' }, n:{ ru:'Австрия', fr:'Autriche', en:'Austria' } },
  { k:['швейцар','цюрих','женев','лозанн','switzerland','suisse','zurich','geneva','genève'], c:{ ru:'в Швейцарии', fr:'en Suisse', en:'in Switzerland' }, n:{ ru:'Швейцария', fr:'Suisse', en:'Switzerland' } },
  { k:['чехи','прага','czech','tchéquie','prague'], c:{ ru:'в Чехии', fr:'en Tchéquie', en:'in Czechia' }, n:{ ru:'Чехия', fr:'Tchéquie', en:'Czechia' } }
];
function spHas(q, kw){
  const esc = String(kw).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^\\p{L}])' + esc, 'u').test(q);
}
function spFindAbroad(q){
  q = (q || '').toLowerCase();
  if (q.indexOf('израил') !== -1 || q.indexOf('israel') !== -1 || q.indexOf('israël') !== -1) return null;
  const IL = ['тель-авив','тель авив','иерусалим','хайф','беэр-шев','беэр шев','нетани','ашдод','ашкелон','ришон','петах-тиква','петах тиква','холон','бат-ям','бат ям','рамат-ган','бней-брак','эйлат','акко','назарет','нацерет','твери','цфат','герцли','раанан','кфар-саб','хадер','реховот','афула','кармиэль','модиин','tel aviv','jerusalem','haifa','netanya','ashdod','ashkelon','rishon','petah tikva','holon','bat yam','ramat gan','eilat','akko','acre','nazareth','tiberias','safed','herzliya','raanana','hadera','rehovot','tel-aviv','jérusalem','haïfa'];
  for (const c of IL) if (spHas(q, c)) return null;
  for (const P of SP_ABROAD) for (const kw of P.k) if (spHas(q, kw)) return P;
  return null;
}
const SP_CATS = [
  { c:'any', ico:'🌍', name:{ ru:'Любой / авто', fr:'Tous / auto', en:'Any / auto' }, k:[] },
  { c:'task', ico:'🤖', name:{ ru:'Сделать / поручить ИИ', fr:'À faire par l’IA', en:'Do it / ask the AI' },
    k:['редизайн','redesign','refonte du site','refonte','дизайн сайта','дизайн логотипа','логотип','website design','logo design','design a website','make a website','create a website','build a website','crée un site','créer un site','напиши текст','написать текст','напиши статью','напиши письмо','написать письмо','напиши код','написать код','write a text','write an article','write a letter','write code','rédige','чат-бот','чатбот','chatbot'] },
  { c:'med', ico:'🩺', name:{ ru:'Врач / медицина', fr:'Médecin / santé', en:'Doctor / medical' },
    k:['врач','доктор','хирург','стоматолог','дантист','ортодонт','дерматолог','гинеколог','кардиолог','невролог','терапевт','педиатр','офтальмолог','уролог','эндокринолог','онколог','психиатр','лор','отоларинголог','ортопед','гастроэнтеролог','ревматолог','аллерголог','нефролог','пульмонолог','акушер','психолог','психотерапевт','физиотерапевт','логопед','диетолог','клиник','больниц','зубн','мрт','узи','doctor','dentist','surgeon','cardiologist','neurologist','pediatrician','dermatologist','gynecologist','psychologist','clinic','médecin','docteur','dentiste','chirurgien','cardiologue','neurologue','pédiatre','dermatologue','gynécologue','psychologue','clinique'] },
  { c:'law', ico:'⚖️', name:{ ru:'Адвокат / нотариус', fr:'Avocat / notaire', en:'Lawyer / notary' },
    k:['адвокат','юрист','нотариус','патент','суд','lawyer','attorney','notary','avocat','notaire','juriste'] },
  { c:'fin', ico:'💳', name:{ ru:'Налоги / пенсия / страховка', fr:'Impôts / pension / assurance', en:'Tax / pension / insurance' },
    k:['бухгалтер','cpa','роэ хешбон','налог','страхов','пенсион','инвестиционн','финансовый консультант','брокер','ипотечный консульт','accountant','tax advisor','insurance agent','financial advisor','broker','comptable','conseiller fiscal','agent d’assurance','conseiller financier','courtier'] },
  { c:'real', ico:'🏠', name:{ ru:'Маклер / оценщик', fr:'Agent immobilier / expert', en:'Real-estate agent / appraiser' },
    k:['маклер','риелтор','риэлтор','риэлтер','риелт','оценщик','оценк','квартир','недвижимост','метавех','шамаи','real estate','realtor','appraiser','apartment','immobilier','agent immobilier','expert immobilier','appartement'] },
  { c:'biz', ico:'🔧', name:{ ru:'Мастер / сервис / фирма', fr:'Artisan / service / entreprise', en:'Handyman / service / company' },
    k:['мастер','сервис','ремонт','слесарь','электрик','сантехник','организаци','фирм','компани','подрядчик','няня','репетитор','переводчик','ателье','клининг','парикмахер','косметолог','маникюр','педикюр','грумер','массажист','фотограф','ветеринар','диджей','ведущ','handyman','repair','plumber','electrician','cleaning','tutor','nanny','hairdresser','barber','photographer','veterinarian','groomer','plombier','électricien','réparation','ménage','nounou','coiffeur','photographe','vétérinaire','toiletteur'] },
  { c:'shop', ico:'🛒', name:{ ru:'Товары / цены / места', fr:'Produits / prix / adresses', en:'Products / prices / places' },
    k:['магазин','купить','товар','цветочн','салон','кафе','ресторан','аптек','бутик','рынок','супермаркет','сравнить цены','сравни цены','сравнить цен','цена на','сколько стоит','где купить','доставк','телефон','смартфон','ноутбук','планшет','наушник','телевизор','холодильн','стиральн','посудомоеч','кондиционер','shop','store','buy','price comparison','compare prices','delivery','phone','laptop','cafe','restaurant','pharmacy','magasin','acheter','comparer les prix','livraison','téléphone','café','pharmacie'] },
  { c:'travel', ico:'✈️', name:{ ru:'Путешествия / отели', fr:'Voyages / hôtels', en:'Travel / hotels' },
    k:['отел','гостиниц','авиабилет','билет в','билет на','билеты','перелет','перелёт','авиарейс','экскурс','путешеств','отпуск','достопримечател','что посмотреть','тур в','туры','поездк','hotel','flight','flights','travel','trip','tour','excursion','vacation','hôtel','billet d’avion','avion','voyage','excursion'] },
  { c:'work', ico:'💼', name:{ ru:'Работа / вакансии', fr:'Emploi / offres', en:'Jobs / vacancies' },
    k:['ваканс','резюме','ищу работу','ищем работу','поиск работы','подработ','трудоустрой','vacancy','vacancies','resume','job search','looking for a job','offre d’emploi','recherche d’emploi','cherche un emploi','cv'] },
  { c:'study', ico:'📚', name:{ ru:'Объяснить / учёба', fr:'Expliquer / étudier', en:'Explain / study' },
    k:['объясн','разъясн','что такое','что значит','как понять','простыми словами','простыми понятными словами','научи','урок','экзамен','домашн','задани','переведи текст','explain','what is','what does','in simple words','teach me','lesson','homework','explique','qu’est-ce','que signifie','en mots simples','leçon','expliquer'] },
  { c:'info', ico:'ℹ️', name:{ ru:'Информация / факты', fr:'Infos / faits', en:'Information / facts' },
    k:['новост','последние события','свежие данные','актуальн','прогноз','статистик','правда ли','проверь факт','официальную информацию','когда будет','news','latest','forecast','statistics','is it true','actualités','dernières nouvelles','prévisions','statistiques','est-ce vrai'] }
];
let spManualCat = null;
function spDetectCat(q){
  q = ' ' + (q || '').toLowerCase() + ' ';
  // Поручение ИИ важнее поиска: глагол «сделай/напиши/составь» + творческий
  // объект (сайт, дизайн, текст, код...) = задание выполнить, а не искать фирму.
  // Физические услуги сюда не попадают: «сделай ремонт» уйдёт в мастеров.
  if (/(сделай|создай|создать|сделать|напиши|написать|составь|составить|придумай|разработай|оформи|подготовь|нарисуй|сгенерируй|перепиши|переведи)[^.]{0,60}(сайт|дизайн|текст|письм|жалоб|стать|код|таблиц|презентац|план|резюме|назван|слоган|логотип|список|иде|приложен|программ)/.test(q)) return 'task';
  if (/(write|create|make|build|design|generate|draw|come up with)[^.]{0,50}(website|site|text|article|letter|code|table|presentation|plan|resume|cv|name|slogan|logo|list|idea|app)/.test(q)) return 'task';
  if (/(rédige|écris|crée|créer|fais|génère|dessine|conçois)[^.]{0,50}(site|texte|article|lettre|code|tableau|présentation|plan|cv|nom|slogan|logo|liste|idée|application)/.test(q)) return 'task';
  // Приоритет не по порядку кнопок: явный замысел (вакансия, «объясни»,
  // отель/поездка) важнее темы — «вакансии бухгалтера» это работа, а не налоги.
  const ORDER = ['task','work','study','med','law','fin','real','biz','travel','shop','info'];
  for (const code of ORDER) {
    const cat = SP_CATS.find(c => c.c === code);
    if (cat) for (const kw of cat.k) if (spHas(q, kw)) return cat.c;
  }
  return 'any';
}
function spCurrentCat(){
  const ta = $('#spQuery');
  return spManualCat || spDetectCat(ta ? ta.value : '');
}
const SP_REG = {
  med: { israel:{ ru:'Подтверждай лицензию и специальность ТОЛЬКО в реестре Минздрава Израиля: https://www.gov.il/en/service/licensed-medical-practitioners', fr:'Confirme la licence et la spécialité UNIQUEMENT dans le registre du ministère israélien de la Santé : https://www.gov.il/en/service/licensed-medical-practitioners', en:'Verify the licence and specialty ONLY in the Israel Ministry of Health registry: https://www.gov.il/en/service/licensed-medical-practitioners' },
    abroad:{ ru:'Подтверждай лицензию и специальность ТОЛЬКО в официальном медицинском реестре/коллегии врачей этой страны (США — совет врачей штата / FSMB DocInfo; Великобритания — GMC gmc-uk.org; Германия — Ärztekammer; Франция — Ordre des Médecins; Канада — коллегия провинции). Сначала найди официальный реестр нужной страны.', fr:'Confirme la licence et la spécialité UNIQUEMENT dans le registre médical officiel du pays (USA — board de l’État / FSMB DocInfo ; Royaume-Uni — GMC gmc-uk.org ; Allemagne — Ärztekammer ; France — Ordre des Médecins ; Canada — collège provincial). Trouve d’abord le registre officiel du pays.', en:'Verify the licence and specialty ONLY in that country’s official medical registry/board (USA — state medical board / FSMB DocInfo; UK — GMC gmc-uk.org; Germany — Ärztekammer; France — Ordre des Médecins; Canada — provincial college). Find the country’s official registry first.' } },
  law: { israel:{ ru:'Израиль: адвокаты — реестр Коллегии адвокатов Israel Bar Association (israelbar.org.il); нотариусы и патентные поверенные — data.gov.il.', fr:'Israël : avocats — registre de l’Israel Bar Association (israelbar.org.il) ; notaires et conseils en brevets — data.gov.il.', en:'Israel: lawyers — Israel Bar Association registry (israelbar.org.il); notaries and patent attorneys — data.gov.il.' },
    abroad:{ ru:'Подтверждай статус в официальной адвокатской/нотариальной палате этой страны (США — bar association штата; Великобритания — Law Society / Notaries Society; Германия — Rechtsanwaltskammer; Франция — barreau / Chambre des notaires).', fr:'Confirme le statut auprès du barreau / de la chambre notariale officielle du pays (USA — bar de l’État ; Royaume-Uni — Law Society ; Allemagne — Rechtsanwaltskammer ; France — barreau / Chambre des notaires).', en:'Verify status with that country’s official bar/notarial chamber (USA — state bar; UK — Law Society / Notaries Society; Germany — Rechtsanwaltskammer; France — barreau / Chambre des notaires).' } },
  fin: { israel:{ ru:'Израиль: CPA и налоговые консультанты — data.gov.il и Совет налоговых консультантов (tac.gov.il); инвестиционные консультанты — Управление ценных бумаг ISA (investors.isa.gov.il); страховые и пенсионные агенты — Управление рынка капитала (gov.il).', fr:'Israël : CPA et conseillers fiscaux — data.gov.il et Conseil des conseillers fiscaux (tac.gov.il) ; conseillers en investissement — Autorité des valeurs ISA (investors.isa.gov.il) ; agents d’assurance et de pension — Autorité des marchés de capitaux (gov.il).', en:'Israel: CPAs and tax advisors — data.gov.il and the Tax Advisors Council (tac.gov.il); investment advisors — Israel Securities Authority (investors.isa.gov.il); insurance and pension agents — Capital Market Authority (gov.il).' },
    abroad:{ ru:'Проверяй статус в официальном регуляторе/реестре этой страны (США: CPA — совет штата, инвестсоветники — SEC, брокеры — FINRA BrokerCheck; Великобритания — FCA Register; Германия — Steuerberaterkammer / BaFin; Франция — AMF / OEC).', fr:'Vérifie le statut auprès du régulateur officiel du pays (USA : CPA — board de l’État, conseillers — SEC, courtiers — FINRA BrokerCheck ; Royaume-Uni — FCA Register ; Allemagne — Steuerberaterkammer / BaFin ; France — AMF / OEC).', en:'Verify status with that country’s official regulator/registry (USA: CPA — state board, investment advisors — SEC, brokers — FINRA BrokerCheck; UK — FCA Register; Germany — Steuerberaterkammer / BaFin; France — AMF / OEC).' } },
  real: { israel:{ ru:'Израиль: маклеры (метавхим), оценщики (шамаим) и нотариусы — открытые реестры на data.gov.il.', fr:'Israël : agents immobiliers (metavhim), experts (shamaïm) et notaires — registres ouverts sur data.gov.il.', en:'Israel: real-estate brokers (metavhim), appraisers (shamaim) and notaries — open registries at data.gov.il.' },
    abroad:{ ru:'Ищи официальный реестр риелторов/оценщиков этой страны (США — комиссия штата / NAR; Великобритания — RICS / Propertymark; Франция — FNAIM / notaires). Если деятельность не лицензируется — так и напиши.', fr:'Cherche le registre officiel des agents/experts du pays (USA — commission d’État / NAR ; Royaume-Uni — RICS / Propertymark ; France — FNAIM / notaires). Si l’activité n’est pas licenciée, dis-le.', en:'Find that country’s official broker/appraiser registry (USA — state commission / NAR; UK — RICS / Propertymark; France — FNAIM / notaries). If the activity is not licensed there, say so.' } }
};
function spBuildPrompt(Q){
  const cat = spCurrentCat();
  const place = spFindAbroad(Q);
  const ruSpeaking = /русск|русско|russian|russophone/i.test(Q);
  const loc = place ? place.c[curLang] : (curLang === 'fr' ? 'en Israël' : curLang === 'en' ? 'in Israel' : 'в Израиле');
  const head = {
    ru: `Запрос пользователя: «${Q}»\nСтрана и регион: ${place ? place.n.ru : 'Израиль'}. Отвечай на языке запроса пользователя, названия и термины на местном языке давай в скобках.`,
    fr: `Demande de l’utilisateur : « ${Q} »\nPays et région : ${place ? place.n.fr : 'Israël'}. Réponds dans la langue de la demande, avec les noms et termes locaux entre parenthèses.`,
    en: `User request: "${Q}"\nCountry and region: ${place ? place.n.en : 'Israel'}. Answer in the language of the request, with local names and terms in brackets.`
  }[curLang];
  const fields = {
    ru: 'Для каждого варианта дай коротко (не более 5 строк): имя/название; специальность/что это; город и адрес (если подтверждены); один контакт; прямая полная ссылка на профиль/источник (полный URL отдельной строкой, без markdown-ссылок). Если есть отзывы — отдельной строкой «Рейтинг: X/5, Y отзывов — [полный URL страницы отзывов]». Неподтверждённые поля не выдумывай.',
    fr: 'Pour chaque option, donne brièvement (5 lignes max) : nom ; spécialité ; ville et adresse (si confirmées) ; un contact ; l’URL complète du profil/de la source sur une ligne séparée (sans liens markdown). S’il y a des avis — une ligne « Note : X/5, Y avis — [URL complète de la page d’avis] ». N’invente aucun champ non confirmé.',
    en: 'For each option give briefly (max 5 lines): name; specialty/what it is; city and address (if confirmed); one contact; the full direct URL of the profile/source on its own line (no markdown links). If there are reviews — a separate line "Rating: X/5, Y reviews — [full URL of the reviews page]". Do not invent unconfirmed fields.'
  }[curLang];
  const end = {
    ru: 'Начни сразу с пункта 1. В конце одной строкой напиши: «Показаны только варианты, подтверждённые по доступным источникам».',
    fr: 'Commence directement au point 1. Termine par une ligne : « Seules les options confirmées par des sources disponibles sont affichées ».',
    en: 'Start right away with item 1. End with one line: "Only options confirmed by available sources are shown".'
  }[curLang];
  let body;
  if (cat === 'med' || cat === 'law' || cat === 'fin' || cat === 'real') {
    const reg = SP_REG[cat][place ? 'abroad' : 'israel'][curLang];
    const intro = {
      med:{ ru:'Это запрос о ВРАЧАХ и медработниках. Выдавай только конкретных людей-врачей, а не больницы и клиники (если пользователь сам не просил клинику). Узкую специализацию указывай только при подтверждении профилем или реестром.', fr:'Demande sur des MÉDECINS et professionnels de santé. Donne uniquement des médecins précis, pas des hôpitaux ou cliniques (sauf si demandé). N’indique une spécialisation étroite que si le profil ou le registre la confirme.', en:'This is a request about DOCTORS and medical professionals. Give specific individual doctors only, not hospitals or clinics (unless the user asked for a clinic). State a narrow specialty only if confirmed by the profile or registry.' },
      law:{ ru:'Это запрос о ЮРИСТАХ: адвокат, нотариус, патентный поверенный.', fr:'Demande sur des JURISTES : avocat, notaire, conseil en brevets.', en:'This is a request about LEGAL professionals: lawyer, notary, patent attorney.' },
      fin:{ ru:'Это запрос о ФИНАНСОВЫХ / НАЛОГОВЫХ / СТРАХОВЫХ / ПЕНСИОННЫХ специалистах.', fr:'Demande sur des spécialistes FINANCE / IMPÔTS / ASSURANCE / PENSION.', en:'This is a request about FINANCIAL / TAX / INSURANCE / PENSION specialists.' },
      real:{ ru:'Это запрос о СПЕЦИАЛИСТАХ ПО НЕДВИЖИМОСТИ: маклер/риелтор, оценщик.', fr:'Demande sur des professionnels de l’IMMOBILIER : agent, expert.', en:'This is a request about REAL-ESTATE professionals: broker/agent, appraiser.' }
    }[cat][curLang];
    const regLine = { ru:'Добавь строку «Лицензия/реестр: [номер или статус] — [полная ссылка на реестр]». Без подтверждения в реестре не называй специалиста лицензированным и не включай его.', fr:'Ajoute une ligne « Licence/registre : [numéro ou statut] — [lien complet vers le registre] ». Sans confirmation au registre, ne le dis pas licencié et ne l’inclus pas.', en:'Add a line "Licence/registry: [number or status] — [full registry link]". Without registry confirmation, do not call them licensed and do not include them.' }[curLang];
    body = [intro, reg, fields + ' ' + regLine, end].join('\n');
  } else if (cat === 'task') {
    body = [{
      ru:'Пользователь просит именно ТЕБЯ, нейросеть, выполнить задачу самому (сделать дизайн или редизайн, сайт, текст, письмо, план, таблицу, код и т.п.), а НЕ найти фирму, агентство или специалиста. Выполняй задачу сам прямо в этом ответе: дай готовый результат, а не список исполнителей, не адреса компаний и не «обратитесь к дизайнеру». Если данных не хватает, задай не более 3 коротких уточняющих вопросов (о чём бизнес/тема, стиль, для кого) — но если задачу можно выполнить сразу, делай первый готовый вариант без вопросов и в конце напиши, что именно можно изменить. Для дизайна или сайта дай конкретную концепцию: структура по блокам, цвета, шрифты, заголовки и тексты блоков; если просят код — дай готовый рабочий код. Пиши конкретно, без общих слов и воды.',
      fr:'L’utilisateur demande à TOI, l’IA, d’exécuter la tâche toi-même (faire un design ou une refonte, un site, un texte, une lettre, un plan, un tableau, du code…), et NON de trouver une entreprise, une agence ou un spécialiste. Exécute la tâche toi-même directement dans cette réponse : donne un résultat prêt, pas une liste d’exécutants, pas d’adresses d’entreprises et pas « contactez un designer ». S’il manque des données, pose au maximum 3 courtes questions (activité/sujet, style, pour qui) — mais si la tâche peut être faite tout de suite, livre une première version prête sans questions et dis à la fin ce qui peut être modifié. Pour un design ou un site, donne un concept concret : structure par blocs, couleurs, polices, titres et textes des blocs ; si on demande du code — donne un code prêt qui fonctionne. Sois concret, sans généralités.',
      en:'The user is asking YOU, the AI, to do the task yourself (make a design or redesign, a website, text, letter, plan, table, code, etc.), NOT to find a company, agency or specialist. Do the task yourself right in this answer: deliver a finished result, not a list of contractors, not company addresses and not "hire a designer". If data is missing, ask at most 3 short clarifying questions (what business/topic, style, who it is for) — but if the task can be done right away, deliver a first finished version without questions and at the end say what can be changed. For a design or website give a concrete concept: structure by sections, colours, fonts, headings and section texts; if code is requested — give ready working code. Be specific, no filler.'
    }[curLang]].join('\n');
  } else if (cat === 'biz') {
    body = [{
      ru:'Это запрос о мастере, сервисе или услуге. Проверяй официальный сайт или карточку организации и актуальность контакта. Не выдумывай адреса, телефоны, часы работы и цены: цену пиши только если она есть на сайте или в карточке, иначе — «цену уточнять».',
      fr:'Demande sur un artisan, un service ou une prestation. Vérifie le site officiel ou la fiche de l’organisation et l’actualité du contact. N’invente ni adresses, ni téléphones, ni horaires, ni prix : donne un prix seulement s’il figure sur le site ou la fiche, sinon « prix à demander ».',
      en:'This is a request about a handyman, service or provider. Verify the official website or listing and that the contact is current. Do not invent addresses, phones, opening hours or prices: give a price only if it is on the website or listing, otherwise write "ask for the price".'
    }[curLang], fields, end].join('\n');
  } else if (cat === 'shop') {
    body = [{
      ru:'Это поиск товара, цены или места (магазин, кафе, аптека и т.п.). Найди реальные варианты в продаже или реальные места и сравни их: что это, главные характеристики или особенности, цена (только с источника, с валютой) и где именно купить/найти — магазин или сайт. Отдельно отметь доставку в город пользователя, если она подтверждена. Не выдумывай цены, скидки, наличие и характеристики: чего нет в источнике — так и пиши «не указано».',
      fr:'C’est une recherche de produit, de prix ou d’adresse (magasin, café, pharmacie…). Trouve des options réelles en vente ou des lieux réels et compare-les : ce que c’est, caractéristiques principales, prix (uniquement depuis la source, avec la devise) et où acheter/trouver exactement. Signale à part la livraison vers la ville de l’utilisateur si elle est confirmée. N’invente ni prix, ni remises, ni stock, ni caractéristiques : ce qui n’est pas dans la source — écris « non indiqué ».',
      en:'This is a search for a product, price or place (shop, cafe, pharmacy, etc.). Find real items for sale or real places and compare them: what it is, key features, price (only from the source, with currency) and exactly where to buy/find it. Note delivery to the user’s city separately if confirmed. Do not invent prices, discounts, stock or features: whatever the source does not say — write "not stated".'
    }[curLang], fields, end].join('\n');
  } else if (cat === 'travel') {
    body = [{
      ru:'Это поиск для поездки: отель, билеты, тур, экскурсия или «что посмотреть». Учитывай даты, число людей и бюджет только если пользователь их указал — сам не додумывай. Давай реальные варианты с районом/расположением и ссылкой на официальный сайт или страницу бронирования. Цены, расписание рейсов и наличие мест пиши только с источника и помечай, что цена могла измениться; не выдумывай цены «примерно». В конце добавь короткий список: что проверить перед оплатой (даты, возврат, виза/документы, багаж).',
      fr:'C’est une recherche de voyage : hôtel, billets, circuit, excursion ou « que voir ». Ne tiens compte des dates, du nombre de personnes et du budget que si l’utilisateur les a donnés — ne les invente pas. Donne des options réelles avec le quartier/l’emplacement et un lien vers le site officiel ou la page de réservation. Prix, horaires de vols et disponibilités uniquement depuis la source, en notant que le prix peut changer ; n’invente pas de prix « approximatifs ». Termine par une courte liste : à vérifier avant de payer (dates, annulation, visa/documents, bagages).',
      en:'This is a travel search: hotel, tickets, tour, excursion or "what to see". Use dates, number of people and budget only if the user gave them — do not make them up. Give real options with the area/location and a link to the official site or booking page. Prices, flight schedules and availability only from the source, noting the price may have changed; do not invent "approximate" prices. End with a short checklist: what to verify before paying (dates, cancellation, visa/documents, baggage).'
    }[curLang], fields, end].join('\n');
  } else if (cat === 'work') {
    body = [{
      ru:'Это поиск работы или вакансий. Давай только реальные опубликованные вакансии: должность, работодатель, город или «удалённо», главные требования, зарплата — только если она указана в самой вакансии, дата публикации и прямая ссылка на вакансию. Не выдумывай работодателей, зарплаты и контакты. Если свежих вакансий по запросу не нашлось — честно напиши об этом и подскажи, на каких сайтах искать дальше.',
      fr:'C’est une recherche d’emploi ou d’offres. Donne uniquement des offres réellement publiées : poste, employeur, ville ou « à distance », exigences principales, salaire — uniquement s’il figure dans l’offre, date de publication et lien direct vers l’offre. N’invente ni employeurs, ni salaires, ni contacts. Si aucune offre récente ne correspond — dis-le honnêtement et suggère où chercher ensuite.',
      en:'This is a job/vacancy search. Give only real published vacancies: title, employer, city or "remote", main requirements, salary — only if stated in the vacancy itself, publication date and a direct link to the vacancy. Do not invent employers, salaries or contacts. If no fresh matching vacancies are found — say so honestly and suggest where to search next.'
    }[curLang], fields, end].join('\n');
  } else if (cat === 'study') {
    body = [{
      ru:'Пользователь просит объяснить или научить. Объясняй простыми словами, как человеку без специальной подготовки: сначала ответ в 2–3 предложениях, потом по шагам, с одним понятным примером из жизни. Сложные термины сразу расшифровывай простыми словами в скобках. Не усложняй и не уходи в сторону. В конце одной строкой предложи, что можно разобрать дальше, если непонятно.',
      fr:'L’utilisateur demande une explication ou un apprentissage. Explique en mots simples, pour une personne sans formation spéciale : d’abord la réponse en 2–3 phrases, puis étape par étape, avec un exemple concret de la vie quotidienne. Explique aussitôt les termes compliqués en mots simples entre parenthèses. Ne complique pas et ne t’écarte pas du sujet. Termine par une ligne proposant quoi détailler ensuite si ce n’est pas clair.',
      en:'The user asks for an explanation or teaching. Explain in simple words, for a person with no special background: first the answer in 2–3 sentences, then step by step, with one clear everyday example. Explain hard terms right away in simple words in brackets. Keep it simple and stay on topic. End with one line offering what to break down next if anything is unclear.'
    }[curLang]].join('\n');
  } else if (cat === 'info') {
    body = [{
      ru:'Это запрос информации или фактов. Отвечай по официальным и первоисточникам (госсайты, официальная статистика, первоисточник новости), а не по пересказам. Каждый важный факт подтверждай полной ссылкой на источник отдельной строкой и указывай дату, к которой относится информация. Отделяй подтверждённые факты от мнений и прогнозов. Если источники противоречат друг другу или свежих данных нет — прямо напиши об этом, ничего не додумывай.',
      fr:'C’est une demande d’information ou de faits. Réponds à partir de sources officielles et primaires (sites gouvernementaux, statistiques officielles, source première de l’actualité), pas de résumés de seconde main. Confirme chaque fait important par le lien complet de la source sur une ligne séparée et donne la date de l’information. Sépare les faits confirmés des opinions et des prévisions. Si les sources se contredisent ou s’il n’y a pas de données récentes — dis-le franchement, n’invente rien.',
      en:'This is an information/facts request. Answer from official and primary sources (government sites, official statistics, the original news source), not second-hand retellings. Back every important fact with the full source URL on its own line and give the date the information refers to. Separate confirmed facts from opinions and forecasts. If sources contradict each other or there is no fresh data — say so plainly, invent nothing.'
    }[curLang]].join('\n');
  } else {
    body = [{
      ru:'Определи профессию и страну из запроса, если это поиск специалиста; если это товар, поездка, работа, информация или объяснение темы — определи тип поиска и действуй по нему. Для специалиста сначала выясни, какой официальный орган, палата или госреестр этой страны выдаёт лицензию на данную профессию, и проверь специалиста именно в нём. Если госреестра у профессии нет — прямо напиши об этом и опирайся на официальный сайт организации и отзывы. Для любого типа поиска давай только подтверждённые источники с полными ссылками и не выдумывай цены, контакты и факты. Не применяй правила одной страны к другой.',
      fr:'Déduis la profession et le pays de la demande. Trouve d’abord quel organisme officiel, ordre ou registre d’État de ce pays délivre la licence pour cette profession, et vérifie-y le spécialiste. S’il n’y a pas de registre d’État, dis-le et appuie-toi sur le site officiel et les avis. N’applique pas les règles d’un pays à un autre.',
      en:'Infer the profession and country from the request. First find which official body, chamber or state registry of that country licenses this profession, and verify the specialist there. If the profession has no state registry, say so and rely on the official website and reviews. Do not apply one country’s rules to another.'
    }[curLang], fields + ' ' + ({ ru:'Если реестр существует — добавь строку «Лицензия/реестр: [номер/статус] — [ссылка]».', fr:'Si un registre existe — ajoute « Licence/registre : [numéro/statut] — [lien] ».', en:'If a registry exists — add "Licence/registry: [number/status] — [link]".' }[curLang]), end].join('\n');
  }
  if (ruSpeaking) body += '\n' + { ru:'Пользователь просит русскоязычного специалиста: помечай русскоязычность только при явном указании в профиле.', fr:'L’utilisateur demande un spécialiste russophone : ne signale la langue russe que si le profil l’indique explicitement.', en:'The user asks for a Russian-speaking specialist: mark Russian-speaking only if the profile states it explicitly.' }[curLang];
  return head + '\n\n' + body;
}
function spRender(){
  const box = $('#spChips'); if (!box) return;
  box.innerHTML = '';
  SP_CATS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'sp-chip'; b.dataset.cat = c.c;
    b.textContent = c.ico + ' ' + (c.name[curLang] || c.name.ru);
    b.addEventListener('click', () => { spManualCat = (c.c === 'any') ? null : c.c; spRender(); });
    box.appendChild(b);
  });
  spUpdate();
}
function spUpdate(){
  const ta = $('#spQuery'); if (!ta) return;
  const active = spCurrentCat();
  $$('#spChips .sp-chip').forEach(b => b.classList.toggle('on', b.dataset.cat === active));
  const q = ta.value.trim();
  const hint = $('#spHint');
  if (hint) {
    if (!q) hint.textContent = '';
    else {
      const cat = SP_CATS.find(c => c.c === active);
      const place = spFindAbroad(q);
      const T = { ru:['Тип поиска: ','Регион: ','Израиль'], fr:['Type : ','Région : ','Israël'], en:['Search type: ','Region: ','Israel'] }[curLang];
      hint.textContent = T[0] + (cat ? cat.ico + ' ' + (cat.name[curLang] || cat.name.ru) : active) + ' · ' + T[1] + (place ? '🌍 ' + (place.n[curLang] || place.n.ru) : '🇮🇱 ' + T[2]) + (/русск|русско|russian|russophone/i.test(q) ? ' · 🗣' : '');
    }
  }
  const prompt = spBuildPrompt(q || (curLang === 'fr' ? 'décris ce qu’il faut trouver (spécialiste, produit, voyage, emploi ou sujet — avec tes mots)' : curLang === 'en' ? 'describe what you need to find (specialist, product, trip, job or topic — in your own words)' : 'опиши, что нужно найти (специалист, товар, поездка, работа или тема — обычными словами)'));
  const enc = encodeURIComponent(prompt);
  const cg = $('#spChatgpt'), cl = $('#spClaude');
  if (cg) cg.href = 'https://chatgpt.com/?q=' + enc;
  if (cl) cl.href = 'https://claude.ai/new?q=' + enc;
}
function spCopyText(text, done){
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => spLegacyCopy(text, done));
  else spLegacyCopy(text, done);
}
function spLegacyCopy(text, done){
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) {}
  document.body.removeChild(ta);
}
function spInit(){
  const ta = $('#spQuery'); if (!ta) return;
  ta.addEventListener('input', () => { spUpdate(); });
  const copied = $('#spCopied');
  const showCopied = () => { if (copied){ copied.hidden = false; setTimeout(() => { copied.hidden = true; }, 6000); } };
  const copyBtn = $('#spCopy');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    const q = ta.value.trim() || (curLang === 'fr' ? 'décris ce qu’il faut trouver (spécialiste, produit, voyage, emploi ou sujet — avec tes mots)' : curLang === 'en' ? 'describe what you need to find (specialist, product, trip, job or topic — in your own words)' : 'опиши, что нужно найти (специалист, товар, поездка, работа или тема — обычными словами)');
    spCopyText(spBuildPrompt(q), showCopied);
  });
  const clearBtn = $('#spClear');
  if (clearBtn) clearBtn.addEventListener('click', () => { ta.value = ''; spManualCat = null; spRender(); ta.focus(); });
  const gem = $('#spGemini');
  if (gem) {
    let step = 1;
    gem.addEventListener('click', () => {
      if (step === 1) {
        const q = ta.value.trim() || '—';
        spCopyText(spBuildPrompt(q), () => { gem.textContent = L('sp_step2'); gem.classList.add('on'); step = 2; showCopied(); });
      } else window.open('https://gemini.google.com/app', '_blank', 'noopener');
    });
  }
  spRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroPhotoMotion();
  const hashTarget = document.getElementById(location.hash.slice(1));
  const hashFold = hashTarget && hashTarget.querySelector(':scope > .wrap > .page-fold');
  if (hashFold) hashFold.open = true;
  curLang = LS.get('shekelpro_lang') || window.__SHEKEL_DEFAULT_LANG__ || 'ru';
  initIcons();
  applyStatic();
  const cAcc = $('#chartAcc');
  if (cAcc) cAcc.addEventListener('toggle', () => { if (cAcc.open && !cAcc.dataset.drawn){ cAcc.dataset.drawn = '1'; renderRateChart(); } });
  renderAll(); bindChips();  calcPlan();
  spInit();
  observeReveals();
  fetchLive();
  const root = document.documentElement;
  const tt = $('#themeToggle');
  const syncTheme = () => tt.innerHTML = root.dataset.theme === 'light' ? ico('sun',17) : ico('moon',17);
  const savedTheme = LS.get('shekelpro_theme');
  // Дефолт — тёмная тема (решение владельца 2026-11-25: светлая сливается
  // с плашками). Светлая — только если пользователь сам её выбрал кнопкой.
  if (savedTheme) root.dataset.theme = savedTheme;
  else root.dataset.theme = 'dark';
  syncTheme();
  tt.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    LS.set('shekelpro_theme', root.dataset.theme === 'light' ? 'light' : 'dark');
    syncTheme();
  });
  const lb = $('#langBtn'), lm = $('#langMenu');
  if (lb && lm){
    lb.addEventListener('click', e => {
      e.stopPropagation();
      const open = !lm.hidden;
      lm.hidden = open;
      lb.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', e => {
      if (!lm.hidden && !e.target.closest('.lang-wrap')){ lm.hidden = true; lb.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lm.hidden){ lm.hidden = true; lb.setAttribute('aria-expanded', 'false'); } });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) setLang(b.dataset.lang);
  });
  const header = $('#siteHeader'), bar = $('#scrollProgress'), fab = $('#plannerFab'), toTop = $('#toTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 10);
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    fab.classList.toggle('show', y > 600);
  }, { passive:true });
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  if (fab) fab.addEventListener('click', e => {
    e.preventDefault();
    const acc = $('#planAcc'); if (acc) acc.open = true;
    $('#planner').scrollIntoView({ behavior:'smooth' });
  });
  const burger = $('#burger'), mm = $('#mobileMenu');
  burger.addEventListener('click', () => {
    const open = mm.classList.toggle('show');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  mm.addEventListener('click', e => { if (e.target.tagName === 'A'){ mm.classList.remove('show'); burger.classList.remove('open'); } });
  const search = $('#calcSearch');
  search.addEventListener('input', () => { curQuery = search.value; renderCalcs(); });
  bindScenarios();
  const heroSearch = $('#heroSearch'), heroResults = $('#heroResults');
  if (heroSearch && heroResults) {
    const closeHero = () => { heroResults.hidden = true; heroResults.innerHTML = ''; };
    heroSearch.addEventListener('input', () => {
      const q = heroSearch.value.trim().toLowerCase();
      curQuery = heroSearch.value; if (search) search.value = heroSearch.value; renderCalcs();
      if (!q) { closeHero(); return; }
      const hits = CALCS.filter(c => matchCalc(c, q)).sort((a,b) => b.hot - a.hot).slice(0,6);
      if (!hits.length) { closeHero(); return; }
      heroResults.innerHTML = hits.map(c =>
        `<a href="${u(c.id + '.html')}"><span class="hr-t">${tx(c.t)}</span><span class="hr-d">${tx(c.d)}</span></a>`).join('');
      heroResults.hidden = false;
    });
    heroSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const first = heroResults.querySelector('a'); if (first) location.href = first.href; }
      if (e.key === 'Escape') closeHero();
    });
    document.addEventListener('click', e => { if (!e.target.closest('.hero-search')) closeHero(); });
  }
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.calc-card'); if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }, { passive:true });
  ['#goalSelect', '#monthRange', '#yearRange', '#pikadonRate'].forEach(s => {
    const el = $(s);
    if (el){ el.addEventListener('input', calcPlan); el.addEventListener('change', calcPlan); }
  });
  ['#heroPlannerBtn', '#plannerBtn2'].forEach(s => {
    const b = $(s); if (b) b.addEventListener('click', () => {
      const acc = $('#planAcc'); if (acc) acc.open = true;
      $('#planner').scrollIntoView({ behavior:'smooth' });
    });
  });
  const planner = $('#planner');
  if (planner){
    if ('IntersectionObserver' in window){
      const po = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ startCoins(); po.disconnect(); } }), { threshold:.25 });
      po.observe(planner);
    } else startCoins();
  }
  const modals = [$('#remModal'), $('#planModal')];
  const closeAll = () => { modals.forEach(m => { if (m && !m.hidden){ m.hidden = true; document.body.style.overflow = ''; } }); };
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  const pg = $('#planModalGo'); if (pg) pg.addEventListener('click', () => closeAll());
  const calcsCounter = document.querySelector('[data-counter="calcs"]');
  if (calcsCounter) calcsCounter.dataset.count = String(CALCS.length);
  const hs = $('.hero-stats');
  if (hs){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { $$('.hero-stats dt').forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || '')); }
    else if ('IntersectionObserver' in window){
      const co = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ $$('.hero-stats dt').forEach(el => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) el.textContent = el.dataset.count + (el.dataset.suffix || ''); else animateCount(el); }); co.disconnect(); } }), { threshold:.4 });
      co.observe(hs);
    } else $$('.hero-stats dt').forEach(el => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) el.textContent = el.dataset.count + (el.dataset.suffix || ''); else animateCount(el); });
  }
  setTimeout(() => $$('.reveal:not(.in), .zoom-img:not(.in)').forEach(e => e.classList.add('in')), 1200);
});

