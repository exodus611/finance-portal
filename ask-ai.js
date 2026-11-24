/* «Спросить у своего ИИ»: блок с готовым вопросом для личного ИИ посетителя.
   Сайт ничего никуда не отправляет и не платит за запросы: кнопки открывают
   ChatGPT / Claude / Gemini в аккаунте самого посетителя, с уже подставленным
   (или скопированным) вопросом по теме текущей страницы. */
(function () {
  if (document.getElementById('ask-ai-block')) return;
  var path = location.pathname;
  var lang = /\/fr(\/|$)/.test(path) ? 'fr' : /\/en(\/|$)/.test(path) ? 'en' : 'ru';
  var slug = (path.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  if (slug === '404') return;

  var TOPICS = {
    'salary': { ru: 'как считается зарплата на руки (нетто) в Израиле из брутто: подоходный налог, Битуах Леуми, пенсионные отчисления и некудот зикуй в 2026 году',
      fr: 'comment le salaire net est calculé en Israël à partir du brut : impôt sur le revenu, Bituach Leumi, cotisations retraite et nekoudot zikouï en 2026',
      en: 'how take-home (net) pay is calculated in Israel from gross salary: income tax, National Insurance (Bituach Leumi), pension contributions and tax credit points (nekudot zikuy) in 2026' },
    'mashkanta': { ru: 'как устроена машканта (ипотека) в Израиле: треки, прайм, привязка к мададу, сколько можно взять и как считается ежемесячный платёж',
      fr: 'comment fonctionne la mashkanta (prêt immobilier) en Israël : parcours, prime, indexation au madad, combien on peut emprunter et comment la mensualité est calculée',
      en: 'how a mortgage (mashkanta) works in Israel: tracks, prime rate, CPI (madad) linkage, how much you can borrow and how the monthly payment is calculated' },
    'kredit': { ru: 'как считается переплата по обычному банковскому кредиту в Израиле и на что смотреть в договоре, кроме процентной ставки',
      fr: 'comment calculer le coût total d’un crédit bancaire classique en Israël et quoi vérifier dans le contrat, au-delà du taux',
      en: 'how to calculate the total cost of a regular bank loan in Israel and what to check in the contract besides the interest rate' },
    'avtala': { ru: 'как считаются пособие по безработице (дмей автала) в Израиле: кто имеет право, сколько платят и сколько дней, правила Битуах Леуми',
      fr: 'comment sont calculées les allocations de chômage (dmei avtala) en Israël : qui y a droit, combien et combien de jours, règles du Bituach Leumi',
      en: 'how unemployment benefits (dmei avtala) are calculated in Israel: who is eligible, how much is paid and for how many days, National Insurance rules' },
    'arnona': { ru: 'как получить скидку на арнону (муниципальный налог) в Израиле: кому положена, какие основания и как оформить',
      fr: 'comment obtenir une réduction d’arnona (taxe municipale) en Israël : qui y a droit, quels motifs et comment faire la demande',
      en: 'how to get a discount on Arnona (municipal tax) in Israel: who is eligible, on what grounds and how to apply' },
    'auto': { ru: 'из чего складывается реальная стоимость владения автомобилем в Израиле: топливо, страховка, техосмотр, обслуживание и потеря стоимости',
      fr: 'ce qui compose le coût réel de possession d’une voiture en Israël : carburant, assurance, contrôle technique, entretien et dépréciation',
      en: 'what makes up the real cost of owning a car in Israel: fuel, insurance, annual test, maintenance and depreciation' },
    'benzin': { ru: 'как формируется цена бензина 95 в Израиле, почему она меняется каждый месяц и из чего состоит цена литра',
      fr: 'comment le prix de l’essence 95 est formé en Israël, pourquoi il change chaque mois et ce qui compose le prix d’un litre',
      en: 'how the price of 95 petrol is set in Israel, why it changes every month and what a litre price consists of' },
    'dira': { ru: 'что такое «Дира бе-анаха» (жильё со скидкой) в Израиле: лотереи, условия участия, шансы и подводные камни',
      fr: 'ce qu’est « Dira behanaha » (logement à prix réduit) en Israël : loteries, conditions de participation, chances et pièges',
      en: 'what Dira Behanaha (discounted housing) is in Israel: lotteries, eligibility, chances and pitfalls' },
    'valuta': { ru: 'как Банк Израиля устанавливает официальный курс валют и чем он отличается от курса обмена в банке и обменниках',
      fr: 'comment la Banque d’Israël fixe le taux de change officiel et en quoi il diffère du taux des banques et des bureaux de change',
      en: 'how the Bank of Israel sets the official exchange rate and how it differs from bank and exchange-office rates' },
    'pension-gap': { ru: 'как понять, хватит ли пенсии в Израиле на привычный уровень жизни, и что такое пенсионный разрыв',
      fr: 'comment savoir si la pension en Israël suffira pour garder son niveau de vie, et ce qu’est l’écart de pension',
      en: 'how to tell whether a pension in Israel will cover your usual standard of living, and what the pension gap is' },
    'keren-hishtalmut': { ru: 'что такое керен иштальмут в Израиле: взносы работодателя, налоговая льгота и когда деньги можно снять без налога',
      fr: 'ce qu’est un keren hishtalmut en Israël : cotisations de l’employeur, avantage fiscal et quand retirer l’argent sans impôt',
      en: 'what a Keren Hishtalmut is in Israel: employer contributions, the tax benefit and when money can be withdrawn tax-free' },
    'keren-kaspit': { ru: 'что такое денежный фонд (керен каспит) в Израиле: доходность, налог 25% с реальной прибыли и чем он отличается от банковского вклада',
      fr: 'ce qu’est un fonds monétaire (keren kaspit) en Israël : rendement, impôt de 25 % sur le gain réel et différence avec un dépôt bancaire',
      en: 'what a money market fund (keren kaspit) is in Israel: yield, the 25% tax on real profit and how it differs from a bank deposit' },
    'pikadon-vs-keren': { ru: 'что выгоднее в Израиле: банковский вклад (пикадон) или денежный фонд (керен каспит), с учётом разных налогов — 15% с номинала против 25% с реальной прибыли',
      fr: 'ce qui est plus rentable en Israël : un dépôt bancaire (pikadon) ou un fonds monétaire (keren kaspit), compte tenu des impôts différents — 15 % sur le nominal contre 25 % sur le gain réel',
      en: 'which is better in Israel: a bank deposit (pikadon) or a money market fund (keren kaspit), given the different taxes — 15% on nominal vs 25% on real profit' },
    'arenda-vs-pokupka': { ru: 'что выгоднее в Израиле на горизонте 10–20 лет: аренда квартиры с инвестированием разницы или покупка с машкантой, и как это честно посчитать',
      fr: 'ce qui est plus rentable en Israël sur 10–20 ans : louer en investissant la différence ou acheter avec une mashkanta, et comment le calculer honnêtement',
      en: 'which is better in Israel over 10–20 years: renting while investing the difference or buying with a mortgage, and how to calculate it honestly' },
    'mihzur-mashkanta': { ru: 'когда выгодно рефинансирование машканты (михзур) в Израиле: штрафы за досрочное погашение, новая ставка и точка безубыточности',
      fr: 'quand le refinancement d’une mashkanta (mihzour) est rentable en Israël : pénalités de remboursement anticipé, nouveau taux et seuil de rentabilité',
      en: 'when refinancing a mortgage (mihzur mashkanta) pays off in Israel: early-repayment penalties, the new rate and the break-even point' },
    'siluk-mukdam': { ru: 'что выгоднее в Израиле: досрочно погасить машканту или инвестировать свободные деньги, и как сравнить варианты с учётом штрафов и доходности',
      fr: 'ce qui est plus rentable en Israël : rembourser sa mashkanta par anticipation ou investir l’argent disponible, et comment comparer les options',
      en: 'which is better in Israel: repaying a mortgage early or investing spare money, and how to compare the options including penalties and returns' },
    'nekudot-zikuy': { ru: 'что такое некудот зикуй (налоговые баллы) в Израиле: сколько стоит один балл в 2026 году, кому дают дополнительные и как они уменьшают налог с зарплаты',
      fr: 'ce que sont les nekoudot zikouï (points de crédit d’impôt) en Israël : valeur d’un point en 2026, qui a droit à des points supplémentaires et comment ils réduisent l’impôt',
      en: 'what tax credit points (nekudot zikuy) are in Israel: what one point is worth in 2026, who gets extra points and how they reduce salary tax' },
    'mas-rehisha': { ru: 'как считается налог на покупку недвижимости (мас рехиша) в Израиле: ступени, льготы для новых репатриантов и второй квартиры',
      fr: 'comment est calculée la taxe d’achat immobilier (mas rehisha) en Israël : tranches, avantages pour les nouveaux immigrants et seconde résidence',
      en: 'how purchase tax (mas rehisha) is calculated in Israel: brackets, benefits for new immigrants and second apartments' },
    'mas-shevach': { ru: 'как считается налог на прирост стоимости (мас шевах) при продаже недвижимости в Израиле и какие есть освобождения',
      fr: 'comment est calculée la taxe sur la plus-value (mas shevah) à la vente d’un bien immobilier en Israël et quelles exemptions existent',
      en: 'how capital gains tax (mas shevah) is calculated when selling property in Israel and what exemptions exist' },
    'havraa': { ru: 'что такое оздоровительные (дмей авраа) в Израиле: кому положены, сколько дней и как считаются выплаты в 2026 году',
      fr: 'ce que sont les jours de convalescence (dmei havraa) en Israël : qui y a droit, combien de jours et comment le paiement est calculé en 2026',
      en: 'what recreation pay (dmei havraa) is in Israel: who is entitled, how many days and how the payment is calculated in 2026' },
    'hisahon-yeled': { ru: 'как работает государственная программа сбережений для ребёнка (хиссахон ле-елед) в Израиле: взносы Битуах Леуми, удвоение от родителей и что будет к 18 годам',
      fr: 'comment fonctionne le programme d’épargne enfant (hisahon le-yeled) en Israël : versements du Bituach Leumi, doublement par les parents et montant à 18 ans',
      en: 'how the child savings programme (Hisahon LeYeled) works in Israel: National Insurance contributions, parental top-ups and the amount by age 18' },
    'nko': { ru: 'какие благотворительные организации (амутот) в Израиле реально помогают продуктами, пожилым и семьям, и как проверить, что организация настоящая',
      fr: 'quelles organisations caritatives (amoutot) en Israël aident réellement en nourriture, pour les personnes âgées et les familles, et comment vérifier qu’une organisation est réelle',
      en: 'which charities (amutot) in Israel actually help with food, the elderly and families, and how to verify an organisation is genuine' },
    'slovar': { ru: 'что означают банковские и финансовые термины в Израиле простым языком, с примерами из договоров и выписок',
      fr: 'ce que signifient les termes bancaires et financiers en Israël en langage simple, avec des exemples de contrats et de relevés',
      en: 'what banking and financial terms in Israel mean in plain language, with examples from contracts and statements' },
    'cyber': { ru: 'как распознать финансовое мошенничество в Израиле: фишинг от имени банка и Битуах Леуми, лже-инвестиции, что делать, если уже отправил деньги или данные карты',
      fr: 'comment reconnaître une fraude financière en Israël : phishing au nom de la banque et du Bituach Leumi, faux investissements, quoi faire si l’argent ou les données de carte sont déjà partis',
      en: 'how to spot financial fraud in Israel: phishing posing as the bank or National Insurance, fake investments, and what to do if money or card details are already gone' },
    'tablo': { ru: 'что означают главные экономические показатели Израиля — ставка Банка Израиля, прайм, инфляция (мадад), курс шекеля — и как они влияют на мой кредит, вклад и цены',
      fr: 'ce que signifient les principaux indicateurs économiques d’Israël — taux de la Banque d’Israël, prime, inflation (madad), taux du shekel — et leur effet sur mon crédit, mon épargne et les prix',
      en: 'what Israel’s key economic indicators mean — the Bank of Israel rate, prime, inflation (madad), the shekel rate — and how they affect my loan, savings and prices' },
    'payments': { ru: 'когда Битуах Леуми платит пособия в Израиле: даты выплат, что делать, если деньги не пришли, и куда обращаться',
      fr: 'quand le Bituach Leumi verse les prestations en Israël : dates de paiement, quoi faire si l’argent n’arrive pas et qui contacter',
      en: 'when National Insurance pays benefits in Israel: payment dates, what to do if the money does not arrive and who to contact' },
    'ashlamat-ahnasa': { ru: 'что такое доплата до прожиточного минимума (ашламат ахнаса) от Битуах Леуми в Израиле: кому положена, условия по доходу и имуществу и как подать',
      fr: 'ce qu’est le complément de revenu (ashlamat ahnasa) du Bituach Leumi en Israël : qui y a droit, conditions de revenu et de patrimoine et comment déposer la demande',
      en: 'what the income supplement (hashlamat hachnasa) from National Insurance is in Israel: who is eligible, income and asset conditions and how to apply' },
    'maanak-avoda': { ru: 'что такое рабочая премия (маанак авода, отрицательный подоходный налог) в Израиле: кому положена, сколько платят и как подать заявление',
      fr: 'ce qu’est la prime d’activité (maanak avoda, impôt négatif) en Israël : qui y a droit, combien est versé et comment faire la demande',
      en: 'what the earned income grant (maanak avoda, negative income tax) is in Israel: who is eligible, how much is paid and how to apply' },
    'proverka-specialista': { ru: 'как проверить лицензию специалиста в Израиле — врача, адвоката, маклера, бухгалтера (CPA) — по официальным реестрам перед обращением',
      fr: 'comment vérifier la licence d’un professionnel en Israël — médecin, avocat, agent immobilier, CPA — dans les registres officiels avant de le consulter',
      en: 'how to verify a professional’s licence in Israel — doctor, lawyer, real-estate agent, CPA — in official registries before hiring them' },
    'siud': { ru: 'как оформляется пособие по уходу (гимлат сиуд) в Израиле: уровни зависимости, часы ухода и как проходит проверка Битуах Леуми',
      fr: 'comment obtenir l’allocation de dépendance (guimlat sioud) en Israël : niveaux de dépendance, heures d’aide et déroulement de l’évaluation du Bituach Leumi',
      en: 'how the long-term care benefit (gimlat siud) works in Israel: dependency levels, care hours and how the National Insurance assessment goes' },
    'article_minus': { ru: 'почему минус (овердрафт) на счёте в израильском банке — самый дорогой кредит, чем разрешённый минус отличается от неразрешённого и как из него выйти',
      fr: 'pourquoi le découvert (minus) sur un compte bancaire israélien est le crédit le plus cher, en quoi un découvert autorisé diffère d’un non autorisé et comment en sortir',
      en: 'why an overdraft (minus) on an Israeli bank account is the most expensive loan, how an authorised overdraft differs from an unauthorised one and how to get out of it' },
    'article_budget_leaks': { ru: 'куда незаметно утекают деньги в Израиле: банковские комиссии, забытые постоянные платежи, дорогая связь и электричество по умолчанию — и как это закрыть',
      fr: 'où l’argent fuit sans qu’on s’en aperçoive en Israël : frais bancaires, paiements réguliers oubliés, communications chères et électricité au tarif par défaut — et comment y mettre fin',
      en: 'where money quietly leaks in Israel: bank fees, forgotten standing orders, expensive mobile plans and default-tariff electricity — and how to close those leaks' }
  };

  var t = TOPICS[slug];
  var topic;
  if (t) topic = t[lang] || t.ru;
  else {
    var h = document.querySelector('h1');
    var ttl = (h ? h.textContent : document.title || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    topic = (lang === 'fr' ? 'explique simplement ce sujet, en lien avec Israël : ' : lang === 'en' ? 'explain this topic in plain language, in the Israeli context: ' : 'объясни простыми словами эту тему в контексте Израиля: ') + ttl;
  }

  var PROMPT = {
    ru: 'Я живу в Израиле. Объясни простыми словами: ' + topic + '. Учитывай израильские правила 2026 года, приводи примеры в шекелях (₪), без воды: что это, как считается, на что обратить внимание и какие ошибки делают чаще всего. Если для точного ответа нужны мои цифры — спроси их у меня.',
    fr: 'Je vis en Israël. Explique en mots simples : ' + topic + '. Tiens compte des règles israéliennes de 2026, donne des exemples en shekels (₪), sans blabla : ce que c’est, comment ça se calcule, à quoi faire attention et les erreurs les plus fréquentes. Si tu as besoin de mes chiffres pour une réponse précise, demande-les-moi.',
    en: 'I live in Israel. Explain in plain words: ' + topic + '. Follow Israeli rules for 2026, give examples in shekels (₪), no fluff: what it is, how it is calculated, what to watch out for and the most common mistakes. If you need my numbers for a precise answer, ask me for them.'
  }[lang];

  var UI = {
    ru: { title: 'Не нашли ответ? Спросите у своего ИИ', sub: 'Откроется ваш личный ChatGPT, Claude или Gemini с уже готовым вопросом по этой теме. Сайт ничего не отправляет и ни за что не платит — вопрос задаёте вы из своего аккаунта.',
      chatgpt: 'ChatGPT — вопрос вставится сам', claude: 'Claude — вопрос вставится сам', gemini: 'Gemini — в 2 шага', copy: 'Просто скопировать вопрос', copied: '✓ Вопрос скопирован',
      note: 'ChatGPT и Claude подставят вопрос автоматически. Gemini не разрешает сайтам вставлять вопрос за вас, поэтому там два шага — кнопка всё подскажет.',
      step2: '✓ Шаг 1 готов: вопрос скопирован. Нажмите ещё раз — откроется Gemini',
      hint: 'Когда Gemini откроется: нажмите на поле ввода внизу экрана, вставьте вопрос (на компьютере — Ctrl+V, на телефоне — удерживайте поле и выберите «Вставить») и нажмите стрелку «Отправить». Это всё — дальше отвечаете уже в своём Gemini.' },
    fr: { title: 'Pas trouvé la réponse ? Demandez à votre IA', sub: 'Votre ChatGPT, Claude ou Gemini personnel s’ouvrira avec une question déjà prête sur ce sujet. Le site n’envoie rien et ne paie rien — c’est vous qui posez la question depuis votre compte.',
      chatgpt: 'ChatGPT — question insérée automatiquement', claude: 'Claude — question insérée automatiquement', gemini: 'Gemini — en 2 étapes', copy: 'Juste copier la question',
      copied: '✓ Question copiée',
      note: 'ChatGPT et Claude insèrent la question automatiquement. Gemini ne permet pas aux sites de l’insérer pour vous : il y a donc deux étapes — le bouton vous guidera.',
      step2: '✓ Étape 1 faite : question copiée. Cliquez encore une fois — Gemini s’ouvrira',
      hint: 'Quand Gemini s’ouvrira : touchez le champ de saisie en bas de l’écran, collez la question (sur ordinateur — Ctrl+V, sur téléphone — appui long puis « Coller ») et appuyez sur la flèche d’envoi. C’est tout — vous continuez ensuite dans votre Gemini.' },
    en: { title: 'Didn’t find the answer? Ask your own AI', sub: 'Your personal ChatGPT, Claude or Gemini will open with a ready-made question on this topic. The site sends nothing and pays for nothing — you ask from your own account.',
      chatgpt: 'ChatGPT — question inserted for you', claude: 'Claude — question inserted for you', gemini: 'Gemini — in 2 steps', copy: 'Just copy the question', copied: '✓ Question copied',
      note: 'ChatGPT and Claude insert the question automatically. Gemini does not let websites insert it for you, so it takes two steps — the button will guide you.',
      step2: '✓ Step 1 done: question copied. Click once more — Gemini will open',
      hint: 'When Gemini opens: tap the input field at the bottom of the screen, paste the question (on a computer — Ctrl+V, on a phone — long-press the field and choose “Paste”) and press the send arrow. That’s it — you continue in your own Gemini.' }
  }[lang];

  var style = document.createElement('style');
  style.textContent = '#ask-ai-block{max-width:760px;margin:28px auto;padding:0 14px}' +
    '#ask-ai-block .ask-ai-card{border:1px solid rgba(140,150,170,.4);border-radius:16px;padding:20px 22px;background:rgba(127,140,165,.08)}' +
    '#ask-ai-block h2{font-size:19px;margin:0 0 8px}' +
    '#ask-ai-block p{font-size:13.5px;opacity:.85;margin:0 0 16px;line-height:1.55}' +
    '#ask-ai-block .ask-ai-btns{display:flex;flex-wrap:wrap;gap:9px}' +
    '#ask-ai-block a,#ask-ai-block button{font:600 13px/1.2 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;border-radius:999px;padding:11px 18px;cursor:pointer;text-decoration:none;display:inline-block}' +
    '#ask-ai-block .ask-ai-main{background:linear-gradient(135deg,#0d9671,#08775a);color:#fff;border:1px solid transparent}' +
    '#ask-ai-block .ask-ai-alt{background:transparent;color:inherit;border:1px solid rgba(140,150,170,.55)}' +
    '#ask-ai-block a:focus-visible,#ask-ai-block button:focus-visible{outline:3px solid #c9962e;outline-offset:2px}' +
    '#ask-ai-block .ask-ai-done{border-color:#0d9671!important;color:#0d9671!important}';
  document.head.appendChild(style);

  var enc = encodeURIComponent(PROMPT);
  var block = document.createElement('section');
  block.id = 'ask-ai-block';
  block.setAttribute('aria-label', UI.title);
  block.innerHTML = '<div class="ask-ai-card"><h2>🤖 ' + UI.title + '</h2><p>' + UI.sub + '</p>' +
    '<div class="ask-ai-btns">' +
    '<a class="ask-ai-main" target="_blank" rel="noopener" href="https://chatgpt.com/?q=' + enc + '">' + UI.chatgpt + ' →</a>' +
    '<a class="ask-ai-alt" target="_blank" rel="noopener" href="https://claude.ai/new?q=' + enc + '">' + UI.claude + ' →</a>' +
    '<button type="button" class="ask-ai-alt" id="ask-ai-gemini">' + UI.gemini + '</button>' +
    '<button type="button" class="ask-ai-alt" id="ask-ai-copy">' + UI.copy + '</button>' +
    '</div><p id="ask-ai-note" style="margin:14px 0 0;font-size:12.5px">' + UI.note + '</p></div>';

  var footer = document.querySelector('footer');
  if (footer && footer.parentNode) footer.parentNode.insertBefore(block, footer);
  else if (document.querySelector('main')) document.querySelector('main').appendChild(block);
  else document.body.appendChild(block);

  function copyPrompt(doneBtn) {
    function ok() {
      if (doneBtn) { doneBtn.textContent = UI.copied; doneBtn.classList.add('ask-ai-done'); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PROMPT).then(ok, function () { legacy(); });
    } else legacy();
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = PROMPT; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }
  document.getElementById('ask-ai-copy').addEventListener('click', function () {
    copyPrompt(null);
    this.textContent = UI.copied;
    this.classList.add('ask-ai-done');
  });
  var geminiBtn = document.getElementById('ask-ai-gemini');
  var geminiStep = 1;
  geminiBtn.addEventListener('click', function () {
    if (geminiStep === 1) {
      copyPrompt(null);
      geminiStep = 2;
      geminiBtn.textContent = UI.step2;
      geminiBtn.classList.add('ask-ai-done');
      var note = document.getElementById('ask-ai-note');
      if (note) note.textContent = UI.hint;
    } else {
      window.open('https://gemini.google.com/app', '_blank', 'noopener');
    }
  });
})();
