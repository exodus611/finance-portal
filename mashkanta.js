
    window.currentLang = 'ru';
    window.activeStrategy = null;

    function fmt(n) { return Math.round(n).toLocaleString('ru-RU') + ' ₪'; }
    function syncSlider(id, val, cb) { const el = document.getElementById(`${id}-slider`); if (el) el.value = val; cb(); }
    function syncInput(id, cb) { const el = document.getElementById(id); const s = document.getElementById(`${id}-slider`); if (el && s) el.value = s.value; cb(); }

    const DICT_IDS = {
        lbl_r_p1: { ru: 'Прайм:', he: 'פריים:' },
        lbl_r_p2: { ru: 'КАЛАЦ:', he: 'קל&quot;צ:' },
        lbl_r_p3: { ru: 'Миштана:', he: 'משתנה:' },
        lbl_r_tot: { ru: 'ИТОГО В МЕСЯЦ:', he: 'סה&quot;כ לתשלום חודשי:' },
        lbl_note_top: { ru: '💡 Нажмите «Применить» на любой плашке', he: '💡 לחצו «החל» על כל אריח' },
        lbl_inf_prefix: { ru: 'Инфляция в год:', he: 'אינפלציה שנתית:' },
        lbl_t3_link: { ru: 'Тип привязки к инфляции:', he: 'סוג הצמדה למדד:' },
        opt_l_no: { ru: '❌ Не привязана (Безопасно)', he: '❌ לא צמודה (בטוח)' },
        opt_l_yes: { ru: '⚠️ ПРИВЯЗАНА к индексу ЦБ (Ловушка!)', he: '⚠️ צמודה למדד (מלכודת!)' },
        btn_theme: { ru: '🌙 Тёмная тема', he: '🌙 ערכת נושא כהה' },
        lbl_brand_main: { ru: '🏠 Симулятор Машканты 2026', he: '🏠 סימולטור משכנתא 2026' },
        lbl_brand_sub: { ru: '8 профессиональных стратегий тамхиля', he: '8 אסטרטגיות תמהיל מקצועיות' },
        btn_m_reset: { ru: 'Сброс 33/42/25%', he: 'איפוס 33/42/25%' },
        lbl_stress_h: { ru: '⚠️ Стресс-тест Банка Израиля (+1% Прайм):', he: '⚠️ מבחן עמידות בנק ישראל (+1% פריים):' },
        lbl_stress_d: { ru: 'При росте ЦБ на 1% платеж станет', he: 'עליית ריבית ב-1% תעלה את ההחזר ל-' },
        lbl_stress_unit: { ru: '₪/мес', he: '₪/חודש' },
        lbl_inf_trap_h: { ru: '🚨 ИНФЛЯЦИОННАЯ ЛОВУШКА:', he: '🚨 מלכודת האינפלציה:' },
        lbl_pass_desc: { ru: 'Возьмите эти цифры в банк <em>Леуми, Апоалим или Тфахот</em>. Не соглашайтесь на 25 лет. Скажите: <strong>«Утвердите мне Ишур Икрони именно с такой разбивкой лет и ставок»</strong>.',
                          he: 'קחו את הנתונים לבנק <em>לאומי, פועלים או טפחות</em>. אל תסכימו ל-25 שנה. אמרו: <strong>«אשרו לי אישור עקרוני בדיוק עם חלוקת השנים והריביות האלו»</strong>.' },
        lbl_disc_txt: { ru: 'Все расчеты носят исключительно ориентировочный и информационный характер. Итоговые суммы могут отличаться в зависимости от даты выдачи кредита, профиля заемщика, решений конкретного банка. Данный калькулятор не является финансовой или юридической консультацией. Для официального предложения обращайтесь к сертифицированным специалистам.',
                        he: 'כל החישובים הם להערכה כללית בלבד. הסכומים הסופיים עשויים להשתנות בהתאם לתאריך ההלוואה, פרופיל הלווה והחלטות הבנק. המחשבון אינו ייעוץ פיננסי או משפטי. לקבלת הצעה רשמית (אישור עקרוני) פנו לאנשי מקצוע מוסמכים.' },
        'footer-brand': { ru: 'Симулятор Машканты 2026 · Профессиональный расчет тамхиля для Израиля', he: 'סימולטור משכנתא 2026 · חישוב תמהיל מקצועי לישראל' },
    };

    const STRAT_BTN_TEXT = { ru: '⚡ Применить', he: '⚡ החל אסטרטגיה' };

    function toggleLang() {
        window.currentLang = (window.currentLang === 'ru') ? 'he' : 'ru';
        applyLang(window.currentLang);
    }

    function applyLang(lang) {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
        document.querySelectorAll('[data-ru]').forEach(el => {
            const text = lang === 'he' ? el.getAttribute('data-he') : el.getAttribute('data-ru');
            if (text) el.innerHTML = text;
        });
        for (const id in DICT_IDS) {
            const el = document.getElementById(id);
            if (el) el.innerHTML = DICT_IDS[id][lang];
        }
        document.querySelectorAll('.btn-strat-apply').forEach(el => { el.innerText = STRAT_BTN_TEXT[lang]; });
        const btnLang = document.getElementById('btn_lang');
        if (btnLang) btnLang.innerText = lang === 'he' ? '🇷🇺 Русский' : '🇮🇱 עברית';
        updateSafetyLanguage(lang);
        updateOptimizerLanguage(lang);
        updateToolsLanguage(lang);
        updateCompleteLanguage(lang);
        calcMashkanta();
    }

    function updateSafetyLanguage(lang) {
        const ru = lang === 'ru';
        const set = (id, text) => { const el=document.getElementById(id); if(el) el.textContent=text; };
        set('safe-income-label', ru ? 'Рекомендуемый семейный нетто-доход' : 'הכנסה משפחתית נטו מומלצת');
        set('safe-income-note', ru ? 'Чтобы платёж составлял не более 35% дохода' : 'כדי שההחזר לא יעלה על 35% מההכנסה');
        set('stress-ratio-label', ru ? 'Нагрузка при росте ставки' : 'עומס בתרחיש עליית ריבית');
        set('stress-ratio-note', ru ? 'Стресс-сценарий: Прайм +1%' : 'תרחיש לחץ: פריים +1%');
        set('reserve-label', ru ? 'Резерв на 6 платежей' : 'רזרבה ל-6 תשלומים');
        set('reserve-note', ru ? 'Ориентир финансовой подушки только для ипотеки' : 'יעד כרית ביטחון למשכנתא בלבד');
        set('margin-label', ru ? 'Запас до нагрузки 40%' : 'מרווח עד עומס של 40%');
        set('margin-note', ru ? 'Разница между 40% дохода и текущим платежом' : 'הפער בין 40% מההכנסה להחזר הנוכחי');
        updateSafetyDashboard();
    }

    function updateSafetyDashboard() {
        const income = Number(document.getElementById('dbb-family-netto')?.value)||0;
        const payment = Number(window.finState?.mashkantaTotal)||0;
        const stressText = document.getElementById('res-stress')?.innerText || '';
        const stress = Number(stressText.replace(/[^0-9]/g,'')) || payment;
        const required = payment/0.35;
        const stressRatio = income>0 ? stress/income*100 : 0;
        const reserve = payment*6;
        const margin = income>0 ? income*0.40-payment : 0;
        const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text;};
        set('safe-income-value', fmt(required));
        set('stress-ratio-value', income>0 ? Math.round(stressRatio)+'%' : '—');
        set('reserve-value', fmt(reserve));
        set('margin-value', income>0 ? (margin>=0?'+':'−')+fmt(Math.abs(margin)) : '—');
        const classify=(id,value,a,b)=>{const el=document.getElementById(id);if(!el)return;el.classList.remove('status-good','status-warn','status-bad');el.classList.add(value<a?'status-good':value<b?'status-warn':'status-bad');};
        classify('stress-ratio-tile',stressRatio,35,45);
        const mt=document.getElementById('margin-tile'); if(mt){mt.classList.remove('status-good','status-warn','status-bad');mt.classList.add(margin>=0?'status-good':'status-bad');}
    }

    function updateCompleteLanguage(lang) {
        const he = lang === 'he';
        const set = (id, ru, iv, html=false) => { const e=document.getElementById(id); if(e) e[html?'innerHTML':'textContent']=he?iv:ru; };
        document.title = he ? 'מחשבון משכנתא בישראל — התאמת תמהיל, אסטרטגיות ולוח סילוקין | 2026' : 'Калькулятор ипотечной ссуды (машканты) в Израиле — подбор структуры и график | 2026';
        set('site-back','← На главную','חזרה לדף הראשי →');
        // 4-й аргумент true = писать через innerHTML. Без него функция пишет
        // в textContent, и тег <span> с ивритом выводился на экран как текст.
        set('site-intro-title','Калькулятор машканты (<span lang="he" dir="rtl">משכנתא</span>) — расширенный расчёт','מחשבון משכנתא — חישוב מורחב',true);
        set('site-intro-text','Машканта — так на иврите называется ипотека. Задайте сумму и распределение треков, затем используйте учебные стратегии или автоматический подбор. Все результаты — предварительная математическая модель.','תחילה הגדירו את הסכום ואת חלוקת המסלולים. לאחר מכן ניתן להשתמש באסטרטגיות ההדגמה או בהתאמה האוטומטית. כל התוצאות הן מודל מתמטי מקדים.');
        set('opt-help-1-title','1. Задайте предел','1. הגדירו גבול');
        set('opt-help-1-text','Комфортный платёж и максимальный срок.','החזר חודשי נוח ותקופה מרבית.');
        set('opt-help-2-title','2. Выберите цель','2. בחרו מטרה');
        set('opt-help-2-text','Экономия, низкий платёж или стабильность.','חיסכון, החזר נמוך או יציבות.');
        set('opt-help-3-title','3. Примените вариант','3. החילו אפשרות');
        set('opt-help-3-text','Лучший результат переносится в основной расчёт.','התוצאה המתאימה מועברת לחישוב הראשי.');
        set('opt-goal-balanced','Баланс','איזון'); set('opt-goal-cost','Минимальная переплата','מינימום ריבית כוללת');
        set('opt-goal-payment','Минимальный платёж','מינימום החזר חודשי'); set('opt-goal-stability','Стабильность','יציבות');
        set('opt-risk-low','Низкий','נמוכה'); set('opt-risk-medium','Средний','בינונית'); set('opt-risk-high','Повышенный','גבוהה');
        set('opt-term-20','20 лет','20 שנה'); set('opt-term-25','25 лет','25 שנה'); set('opt-term-30','30 лет','30 שנה');
        set('unified-selection-banner','<b>Как это работает:</b> выбранная «Главная цель» — это и есть стратегия поиска. Автоподбор не является отдельным конкурентом стратегии: он математически реализует выбранную цель и формирует места с 1-го по 5-е.','<b>איך זה עובד:</b> המטרה שנבחרה היא אסטרטגיית החיפוש. ההתאמה האוטומטית אינה כלי מתחרה — היא מממשת את המטרה באופן מתמטי ומדרגת את חמש האפשרויות המובילות.',true);
        set('stat-tested-label','Проверено комбинаций','צירופים שנבדקו'); set('stat-fit-label','В пределах платежа','בתוך מגבלת ההחזר'); set('stat-time-label','Время расчёта','זמן חישוב'); set('stat-shown-label','Показано лучших','תוצאות מובילות');
        set('chart-truth','Каждый столбец показывает всю сумму, которая будет выплачена за срок: тело ипотечной ссуды 1 300 000 ₪ плюс проценты. Поэтому значение не может быть меньше первоначального долга. Низкий месячный платёж при длинном сроке может дать большую общую сумму выплат.','כל עמודה מציגה את מלוא הסכום שישולם לאורך התקופה: קרן ההלוואה בתוספת ריבית. לכן הסכום אינו יכול להיות נמוך מהחוב המקורי. החזר חודשי נמוך בתקופה ארוכה עשוי ליצור סכום תשלומים כולל גבוה יותר.');
        set('annual-warning-title','⚠️ Перед просмотром годового графика','⚠️ לפני הצגת לוח הסילוקין השנתי');
        set('annual-warning-text','Годовая разбивка строится по ставкам, срокам и предположениям, указанным в момент расчёта. Это сценарий, а не гарантированный банковский график на весь срок. При изменении Прайм, пересматриваемой ставки, индекса цен, условий банка, досрочном погашении или рефинансировании ежемесячный платёж, проценты и остаток долга изменятся. Таблица помогает понять направление и порядок сумм, но не заменяет официальный график банка.','הפירוט השנתי מחושב לפי הריביות, התקופות וההנחות שהוזנו בזמן החישוב. זהו תרחיש ולא לוח בנקאי מובטח לכל התקופה. שינוי בריבית הפריים, בריבית המתעדכנת, במדד המחירים, בתנאי הבנק, בפירעון מוקדם או במחזור ישנה את ההחזר החודשי, הריבית ויתרת החוב. הטבלה מסייעת להבין את הכיוון ואת סדרי הגודל, אך אינה מחליפה לוח סילוקין רשמי של הבנק.');
        document.querySelectorAll('.btn-strat-apply').forEach(e=>e.textContent=he?'⚡ החל':'⚡ Применить');
        updateFlowLanguage(lang);
        if (!window.optimizerVariants || !window.optimizerVariants.length) set('optimizer-status','Параметры ставок берутся из текущих полей калькулятора.','הריביות נלקחות מהשדות הנוכחיים במחשבון.');
    }

    function toggleTheme() {
        const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        const b = document.getElementById('btn_theme');
        const isHe = window.currentLang === 'he';
        if (b) b.innerText = (t === 'dark') ? (isHe ? '☀️ ערכת נושא בהירה' : '☀️ Светлая тема') : (isHe ? '🌙 ערכת נושא כהה' : '🌙 Тёмная тема');
        calcMashkanta();
    }

    function updateDebtBurden() {
        const netto = Number(document.getElementById('dbb-family-netto').value) || 0;
        const mash = window.finState ? window.finState.mashkantaTotal || 0 : 0;
        const ratio = netto > 0 ? (mash / netto) * 100 : 0;
        const freeLeft = netto - mash;
        const isHe = window.currentLang === 'he';
        const ratioEl = document.getElementById('dbb-ratio-val');
        const fillEl = document.getElementById('dbb-fill');
        const noteEl = document.getElementById('dbb-note');
        if (ratioEl) ratioEl.innerText = `${Math.round(ratio)}%`;
        let color = 'var(--success)', noteText = '', noteBg = 'rgba(22,163,74,0.1)';
        if (ratio === 0) {
            noteText = isHe ? 'הזינו הכנסה ונתוני משכנתא כדי לראות את העומס.' : 'Введите доход и данные ипотеки, чтобы увидеть нагрузку.';
        } else if (ratio < 35) {
            color = 'var(--success)'; noteBg = 'rgba(22,163,74,0.1)';
            noteText = isHe ? `✅ עומס בריא. ${Math.round(ratio)}% מהנטו הולך למשכנתא — טווח בטוח (עד 35-40%).` : `✅ Здоровая нагрузка. ${Math.round(ratio)}% нетто уходит на ипотеку — безопасный диапазон (до 35-40%).`;
        } else if (ratio < 45) {
            color = 'var(--warning)'; noteBg = 'rgba(217,119,6,0.12)';
            noteText = isHe ? `⚠️ עומס גבולי. ${Math.round(ratio)}% מהנטו הולך למשכנתא — הבנקים בודקים בקפידה.` : `⚠️ Пограничная нагрузка. ${Math.round(ratio)}% нетто уходит на ипотеку — банки проверяют строже.`;
        } else {
            color = 'var(--alert)'; noteBg = 'rgba(220,38,38,0.12)';
            noteText = isHe ? `🚨 עומס גבוה מדי. ${Math.round(ratio)}% מהנטו הולך למשכנתא — מעל 45%, הבנק עלול לסרב.` : `🚨 Высокая нагрузка. ${Math.round(ratio)}% нетто уходит на ипотеку — выше 45%, банк может отказать.`;
        }
        if (fillEl) { fillEl.style.width = `${Math.min(100, ratio)}%`; fillEl.style.background = color; }
        if (noteEl) { noteEl.innerText = noteText; noteEl.style.background = noteBg; noteEl.style.color = color; }
        const bNetto = document.getElementById('dbb-b-netto'); if (bNetto) bNetto.innerText = (isHe ? '💰 נטו משפחתי: ' : '💰 Нетто семьи: ') + fmt(netto);
        const bMash = document.getElementById('dbb-b-mash'); if (bMash) bMash.innerText = (isHe ? '🏠 משכנתא/חודש: ' : '🏠 Ипотека/мес: ') + fmt(mash);
        const bFree = document.getElementById('dbb-b-free'); if (bFree) bFree.innerText = (isHe ? '✅ נשאר פנוי אחרי תשלום: ' : '✅ Свободно после платежа: ') + fmt(freeLeft);        updateSafetyDashboard();
    }

    window.finState = { mashkantaTotal: 0 };
    function calcAnnuity(sum, years, rate) {
        if (sum <= 0 || years <= 0 || rate <= 0) return 0;
        const m = years * 12, mr = (rate / 100) / 12;
        return sum * (mr * Math.pow(1 + mr, m)) / (Math.pow(1 + mr, m) - 1);
    }

    function simSpitzerBalanceAt5(sum, years, rate, inf) {
        if (sum <= 0 || years <= 0 || rate <= 0) return sum;
        const m = years * 12, mr = (rate / 100) / 12, im = (inf / 100) / 12;
        let bal = sum, p = sum * (mr * Math.pow(1 + mr, m)) / (Math.pow(1 + mr, m) - 1);
        for (let i = 1; i <= Math.min(60, m); i++) {
            if (inf > 0 && i > 1) { bal *= (1 + im); p *= (1 + im); }
            const interest = bal * mr; bal -= (p - interest);
        }
        return Math.max(0, Math.round(bal));
    }

    function simSpitzerPaidAt5(sum, years, rate, inf) {
        if (sum <= 0 || years <= 0 || rate <= 0) return 0;
        const m = years * 12, mr = (rate / 100) / 12, im = (inf / 100) / 12;
        let bal = sum, p = sum * (mr * Math.pow(1 + mr, m)) / (Math.pow(1 + mr, m) - 1), total = 0;
        for (let i = 1; i <= Math.min(60, m); i++) {
            if (inf > 0 && i > 1) { bal *= (1 + im); p *= (1 + im); }
            total += p; const interest = bal * mr; bal -= (p - interest);
        }
        return Math.round(total);
    }

    function onLinkChange() {
        const linkVal = document.getElementById('t3-link').value;
        const infBox = document.getElementById('t3-inf-box');
        if (linkVal === 'yes') { if (infBox) infBox.style.display = 'block'; document.getElementById('t3-rate').value = 3.2; }
        else { if (infBox) infBox.style.display = 'none'; document.getElementById('t3-rate').value = 4.4; }
        calcMashkanta();
    }

    function showWizStep(n){
      document.querySelectorAll('.wiz-step').forEach(function(el){ el.style.display = (String(el.dataset.wstep) === String(n)) ? 'block' : 'none'; });
      document.querySelectorAll('.wiz-dot').forEach(function(d){
        var s = parseInt(d.dataset.step,10);
        d.classList.remove('active','done');
        if(s < n) d.classList.add('done');
        else if(s === n) d.classList.add('active');
      });
      var panel = document.getElementById('view-panel-wizard');
      if(panel) panel.scrollIntoView({behavior:'smooth',block:'start'});
    }
    function wizardRestart(){ showWizStep(1); }
    function wizardBack(from){ showWizStep(from-1); }
    function wizardNext(from){
      var fmtW = function(n){ return Math.round(n).toLocaleString('ru-RU')+' ₪'; };
      if(from===1){
        var price = +document.getElementById('wiz-price').value||0;
        var status = +document.getElementById('wiz-status').value||75;
        var loan = Math.round(price*status/100);
        var equity = price - loan;
        document.getElementById('wiz-step1-result').innerHTML =
          '<b>Максимум машканты:</b> '+fmtW(loan)+'<br><b>Нужно своих денег:</b> '+fmtW(equity);
        var ltvPriceEl=document.getElementById('ltv-price'), ltvStatusEl=document.getElementById('ltv-status');
        if(ltvPriceEl) ltvPriceEl.value = price;
        if(ltvStatusEl) ltvStatusEl.value = status;
        if(typeof syncLtvToTotal==='function') syncLtvToTotal();
        showWizStep(2);
      } else if(from===2){
        var income = +document.getElementById('wiz-income').value||0;
        var incomeEl = document.getElementById('dbb-family-netto');
        if(incomeEl){ incomeEl.value = income; }
        if(typeof updateDebtBurden==='function') updateDebtBurden();
        var ratioTxt = document.getElementById('dbb-ratio-val') ? document.getElementById('dbb-ratio-val').textContent : '—';
        var noteTxt = document.getElementById('dbb-note') ? document.getElementById('dbb-note').textContent : '';
        document.getElementById('wiz-step2-result').innerHTML =
          '<b>Нагрузка на доход:</b> '+ratioTxt+'<br>'+noteTxt;
        showWizStep(3);
      } else if(from===3){
        var total = document.getElementById('m-total') ? document.getElementById('m-total').value : 0;
        document.getElementById('wiz-step3-result').innerHTML =
          'Сумма машканты: <b>'+fmtW(total)+'</b><br>Треки по умолчанию: Прайм 33% · КАЛАЦ 42% · Миштана 25%';
        showWizStep(4);
        document.getElementById('wiz-step4-result').textContent = '⏳ Считаем...';
        setTimeout(function(){
          if(typeof runOptimizer==='function') runOptimizer();
          var variants = window.optimizerVariants||[];
          var html = '<p style="color:var(--text-muted);font-size:12px;margin-bottom:10px">Проверено множество комбинаций, показываем 3 лучших:</p>';
          variants.slice(0,3).forEach(function(v,i){
            html += '<div style="background:var(--bg-inner);border-radius:9px;padding:10px;margin-bottom:8px;'+(i===0?'border:2px solid var(--success)':'border:1px solid var(--border)')+'">'+
              '<b>'+(i===0?'🏆 ':'')+(window.currentLang==='he'?(v.strategyHe||''):(v.strategyRu||''))+'</b><br>'+
              '<span style="font-size:12px;color:var(--text-muted)">Платёж: '+fmtW(v.payment)+' · Переплата: '+fmtW(v.cost)+'</span></div>';
          });
          document.getElementById('wiz-step4-result').innerHTML = html || 'Не удалось подобрать варианты — проверьте вводные.';
        }, 50);
      } else if(from===4){
        var variants = window.optimizerVariants||[];
        var best = variants[0];
        var monthly = document.getElementById('res-m-total') ? document.getElementById('res-m-total').textContent : '—';
        var overpay = document.getElementById('res-overpay') ? document.getElementById('res-overpay').textContent : '—';
        var html = '<div style="background:var(--opt-bg);border-radius:10px;padding:14px;margin-bottom:10px">'+
          '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:800">Платёж в месяц</div>'+
          '<div style="font-size:26px;font-weight:900;font-family:var(--font-mono);color:var(--success)">'+monthly+'</div>'+
          '<div style="font-size:12px;color:var(--text-muted);margin-top:4px">Переплата за весь срок: '+overpay+'</div></div>';
        if(best){
          html += '<div style="font-size:13px">Стратегия: <b>'+(window.currentLang==='he'?(best.strategyHe||''):(best.strategyRu||''))+'</b><br>'+
            'Прайм: '+best.p1+'% · '+best.y1+' лет<br>КАЛАЦ: '+best.p2+'% · '+best.y2+' лет<br>Миштана: '+best.p3+'% · '+best.y3+' лет</div>';
        }
        document.getElementById('wiz-step5-result').innerHTML = html;
        showWizStep(5);
      }
    }

    function runQuickCalc(){
      calcMashkanta();
      const monthly=document.getElementById('res-m-total')?.textContent||'—';
      const stressVal=document.getElementById('res-stress')?.textContent||'—';
      const stressDiff=document.getElementById('res-stress-diff')?.textContent||'—';
      const t1=document.getElementById('res-t1')?.textContent||'—';
      const t2=document.getElementById('res-t2')?.textContent||'—';
      const t3=document.getElementById('res-t3')?.textContent||'—';
      const r1=parseFloat(document.getElementById('t1-rate')?.value||0).toFixed(1);
      const r2=parseFloat(document.getElementById('t2-rate')?.value||0).toFixed(1);
      const r3=parseFloat(document.getElementById('t3-rate')?.value||0).toFixed(1);
      const sh1=Math.round(document.getElementById('t1-perc')?.value||0);
      const sh2=Math.round(document.getElementById('t2-perc')?.value||0);
      const sh3=Math.round(document.getElementById('t3-perc')?.value||0);
      const y1v=document.getElementById('t1-years')?.value||'—';
      const y2v=document.getElementById('t2-years')?.value||'—';
      const y3v=document.getElementById('t3-years')?.value||'—';
      const bestInfo = checkAndUpdateBest(window.__lastMonthly, window.__lastOverpay, 'ручной расчёт', window.__lastTotalPaid);

      // --- тихо считаем 5 лучших вариантов автоподбора, не портя ваш ручной расчёт ---
      const savedFields = [1,2,3].map(function(n){
        return {
          perc: document.getElementById('t'+n+'-perc').value,
          years: document.getElementById('t'+n+'-years').value,
          sum: document.getElementById('t'+n+'-sum').value
        };
      });
      const savedActiveStrategy = window.activeStrategy, savedOptApplied = window.optimizerApplied;
      let fiveVariantRows = [];
      let testedCount = '—', fitCount = '—', timeStat = '—';
      try{
        runOptimizer();
        testedCount = document.getElementById('stat-tested')?.textContent || '—';
        fitCount = document.getElementById('stat-fit')?.textContent || '—';
        timeStat = document.getElementById('stat-time')?.textContent || '—';
        const variants = (window.optimizerVariants||[]).slice(0,5);
        const WHY_SHORT = {balanced:'баланс платежа и переплаты',payment:'минимальный платёж',cost:'минимум переплаты',stability:'меньше всего риска роста',prime:'ставка на дешёвый Прайм'};
        const cardsHtml = variants.map(function(v,i){
          const name = (window.currentLang==='he'?v.strategyHe:v.strategyRu) || ('Вариант '+(i+1));
          const why = WHY_SHORT[v.strategyKey] || '';
          return '<div onclick="jumpToOptimizerVariant('+i+')" style="cursor:pointer;background:var(--bg-inner);border:1px solid var(--border);border-radius:9px;padding:9px 11px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px">'+
            '<div><b style="font-size:12.5px">'+(i===0?'🏆 ':'')+name+'</b><br><span style="font-size:11px;color:var(--text-muted)">'+why+' · '+fmt(v.payment)+'/мес · переплата '+fmt(v.cost)+'</span></div>'+
            '<span style="color:var(--primary);font-weight:800;font-size:16px;flex:0 0 auto">›</span></div>';
        }).join('');
        fiveVariantRows = [['📊 5 лучших вариантов — нажмите на любой, чтобы увидеть полную разбивку по трекам', '<div style="margin-top:6px">'+cardsHtml+'</div>']];
      } finally {
        // восстанавливаем ваш собственный расчёт как был
        [1,2,3].forEach(function(n,idx){
          document.getElementById('t'+n+'-perc').value = savedFields[idx].perc;
          const slider = document.getElementById('t'+n+'-perc-slider'); if(slider) slider.value = savedFields[idx].perc;
          document.getElementById('t'+n+'-years').value = savedFields[idx].years;
          document.getElementById('t'+n+'-sum').value = savedFields[idx].sum;
        });
        window.activeStrategy = savedActiveStrategy;
        window.optimizerApplied = savedOptApplied;
        calcMashkanta();
      }

      showResultModal(
        'Ваш ежемесячный платёж',
        monthly,
        'При текущей сумме и распределении по трекам · '+bestInfo.text,
        [
          ['Прайм — '+sh1+'% суммы, '+r1+'% годовых, '+y1v+' лет', t1], ['КАЛАЦ — '+sh2+'% суммы, '+r2+'% годовых, '+y2v+' лет', t2], ['Миштана — '+sh3+'% суммы, '+r3+'% годовых, '+y3v+' лет', t3],
          ['💸 Переплата за весь срок', fmt(window.__lastOverpay)],
          ['Если Прайм вырастет на 1%', stressVal+' (+'+stressDiff+' ₪)'],
          ['🔍 Автоподбор проверил', testedCount+' комбинаций за '+timeStat+' · подходят под лимит платежа: '+fitCount],
          ...fiveVariantRows
        ]
      );
    }
    function calcLtv(){
      const price=parseFloat(document.getElementById('ltv-price').value)||0;
      const pct=parseFloat(document.getElementById('ltv-status').value)||75;
      const loan=Math.round(price*pct/100);
      const equity=price-loan;
      const fmtN=n=>Math.round(n).toLocaleString('ru-RU');
      document.getElementById('ltv-loan').textContent=fmtN(loan)+' ₪';
      document.getElementById('ltv-equity').textContent=fmtN(equity)+' ₪';
    }
    function syncLtvToTotal(){
      calcLtv();
      const loanText=document.getElementById('ltv-loan').textContent.replace(/[^\d]/g,'');
      const loan=parseInt(loanText,10)||1300000;
      const clamped=Math.max(400000,Math.min(4000000,loan));
      document.getElementById('m-total').value=clamped;
      const slider=document.getElementById('m-total-slider');if(slider)slider.value=clamped;
      onTotalChange();
    }
    function applyLtvToTotal(){
      syncLtvToTotal();
      document.getElementById('core-calculation')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
    document.getElementById('ltv-price')?.addEventListener('input',syncLtvToTotal);
    document.getElementById('ltv-status')?.addEventListener('change',syncLtvToTotal);
    function onTotalChange() {
        const total = Number(document.getElementById('m-total').value) || 1300000;
        document.getElementById('val_m_total').innerText = fmt(total);
        const t1Perc = Number(document.getElementById('t1-perc').value) || 33;
        const t2Perc = Number(document.getElementById('t2-perc').value) || 42;
        const t3Perc = Math.max(0, 100 - t1Perc - t2Perc);
        const t1Sum = Math.round(total * (t1Perc / 100));
        const t2Sum = Math.round(total * (t2Perc / 100));
        const t3Sum = Math.max(0, total - t1Sum - t2Sum);
        document.getElementById('t1-sum').value = t1Sum;
        document.getElementById('t2-sum').value = t2Sum;
        document.getElementById('t3-sum').value = t3Sum;
        document.getElementById('t3-perc').value = t3Perc;
        const s3 = document.getElementById('t3-perc-slider'); if (s3) s3.value = t3Perc;
        calcMashkanta();
    }

    function onTrackChange(num, type) {
        const total = Number(document.getElementById('m-total').value) || 1300000;
        let t1Sum = Number(document.getElementById('t1-sum').value) || 0;
        let t2Sum = Number(document.getElementById('t2-sum').value) || 0;
        let t3Sum = Number(document.getElementById('t3-sum').value) || 0;
        let t1Perc = Number(document.getElementById('t1-perc').value) || 0;
        let t2Perc = Number(document.getElementById('t2-perc').value) || 0;
        let t3Perc = Number(document.getElementById('t3-perc').value) || 0;

        if (num === 1) {
            if (type === 'perc') { t1Perc = Number(document.getElementById('t1-perc').value) || 0; t1Sum = Math.round(total * (t1Perc / 100)); document.getElementById('t1-sum').value = t1Sum; }
            else { t1Sum = Number(document.getElementById('t1-sum').value) || 0; t1Perc = Math.min(100, Math.round((t1Sum / total) * 100)); document.getElementById('t1-perc').value = t1Perc; }
            const sl = document.getElementById('t1-perc-slider'); if (sl) sl.value = t1Perc;
        } else if (num === 2) {
            if (type === 'perc') { t2Perc = Number(document.getElementById('t2-perc').value) || 0; t2Sum = Math.round(total * (t2Perc / 100)); document.getElementById('t2-sum').value = t2Sum; }
            else { t2Sum = Number(document.getElementById('t2-sum').value) || 0; t2Perc = Math.min(100, Math.round((t2Sum / total) * 100)); document.getElementById('t2-perc').value = t2Perc; }
            const sl = document.getElementById('t2-perc-slider'); if (sl) sl.value = t2Perc;
        } else if (num === 3) {
            if (type === 'perc') { t3Perc = Number(document.getElementById('t3-perc').value) || 0; t3Sum = Math.round(total * (t3Perc / 100)); document.getElementById('t3-sum').value = t3Sum; }
            else { t3Sum = Number(document.getElementById('t3-sum').value) || 0; t3Perc = Math.min(100, Math.round((t3Sum / total) * 100)); document.getElementById('t3-perc').value = t3Perc; }
            const sl = document.getElementById('t3-perc-slider'); if (sl) sl.value = t3Perc;
        }

        if (num === 1 || num === 2) {
            t3Sum = Math.max(0, total - t1Sum - t2Sum); t3Perc = Math.max(0, 100 - t1Perc - t2Perc);
            document.getElementById('t3-sum').value = t3Sum; document.getElementById('t3-perc').value = t3Perc;
            const s3 = document.getElementById('t3-perc-slider'); if (s3) s3.value = t3Perc;
        } else if (num === 3) {
            t2Sum = Math.max(0, total - t1Sum - t3Sum); t2Perc = Math.max(0, 100 - t1Perc - t3Perc);
            document.getElementById('t2-sum').value = t2Sum; document.getElementById('t2-perc').value = t2Perc;
            const s2 = document.getElementById('t2-perc-slider'); if (s2) s2.value = t2Perc;
        }
        calcMashkanta();
    }

    function resetMashkanta() {
        window.activeStrategy = null;
        document.querySelectorAll('.strat-card').forEach(b => b.classList.remove('active'));
        document.getElementById('t1-perc').value = 33; document.getElementById('t1-perc-slider').value = 33;
        document.getElementById('t2-perc').value = 42; document.getElementById('t2-perc-slider').value = 42;
        document.getElementById('t3-perc').value = 25; document.getElementById('t3-perc-slider').value = 25;
        document.getElementById('t1-years').value = 25; document.getElementById('t1-rate').value = 5.5;
        document.getElementById('t2-years').value = 25; document.getElementById('t2-rate').value = 5.1;
        document.getElementById('t3-years').value = 25; document.getElementById('t3-rate').value = 4.4;
        onTotalChange();
    }

    function runStrategy(st) {
        if (window.optimizerApplied) {
            showToast(window.currentLang === 'he' ? 'האסטרטגיה מחליפה את תוצאת ההתאמה האוטומטית' : 'Стратегия заменяет собой результат автоподбора');
            window.optimizerApplied = false;
        }
        window.activeStrategy = st;
        document.querySelectorAll('.strat-card').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`btn-${st}`); if (btn) btn.classList.add('active');

        // Сначала возвращаем базовое распределение долей 33/42/25%, чтобы стратегии,
        // не задающие свои проценты, не наследовали обнулённую Миштану от предыдущей стратегии (например s10)
        const stratsWithCustomPercs = ['s6', 's10'];
        if (!stratsWithCustomPercs.includes(st)) {
            const tot = Number(document.getElementById('m-total').value) || 1300000;
            const t1Sum = Math.round(tot * 0.33);
            const t2Sum = Math.round(tot * 0.42);
            const t3Sum = Math.max(0, tot - t1Sum - t2Sum);
            document.getElementById('t1-perc').value = 33; document.getElementById('t1-perc-slider').value = 33; document.getElementById('t1-sum').value = t1Sum;
            document.getElementById('t2-perc').value = 42; document.getElementById('t2-perc-slider').value = 42; document.getElementById('t2-sum').value = t2Sum;
            document.getElementById('t3-perc').value = 25; document.getElementById('t3-perc-slider').value = 25; document.getElementById('t3-sum').value = t3Sum;
        }
        // Возвращаем базовые ставки/сроки, чтобы значения от предыдущей выбранной стратегии не "залипали"
        document.getElementById('t1-years').value = 25; document.getElementById('t1-rate').value = 5.5;
        document.getElementById('t2-years').value = 25; document.getElementById('t2-rate').value = 5.1;
        document.getElementById('t3-years').value = 25; document.getElementById('t3-rate').value = 4.4;

        if (st === 's1') { document.getElementById('t1-years').value = 30; document.getElementById('t2-years').value = 30; document.getElementById('t2-rate').value = 5.3; document.getElementById('t3-years').value = 30; }
        else if (st === 's2') { document.getElementById('t1-years').value = 25; document.getElementById('t2-years').value = 15; document.getElementById('t2-rate').value = 4.1; document.getElementById('t3-years').value = 25; }
        else if (st === 's4') { document.getElementById('t1-years').value = 28; document.getElementById('t2-years').value = 20; document.getElementById('t2-rate').value = 4.6; document.getElementById('t3-years').value = 25; }
        else if (st === 's5') { document.getElementById('t1-years').value = 30; document.getElementById('t2-years').value = 30; document.getElementById('t3-years').value = 30; }
        else if (st === 's6') {
            const tot = Number(document.getElementById('m-total').value) || 1300000;
            document.getElementById('t1-perc').value = 50; document.getElementById('t1-perc-slider').value = 50; document.getElementById('t1-sum').value = Math.round(tot * 0.50);
            document.getElementById('t2-perc').value = 35; document.getElementById('t2-perc-slider').value = 35; document.getElementById('t2-sum').value = Math.round(tot * 0.35);
            document.getElementById('t3-perc').value = 15; document.getElementById('t3-perc-slider').value = 15; document.getElementById('t3-sum').value = Math.round(tot * 0.15);
            document.getElementById('t1-years').value = 30; document.getElementById('t2-years').value = 20; document.getElementById('t3-years').value = 25;
        } else if (st === 's7') { document.getElementById('t1-years').value = 20; document.getElementById('t2-years').value = 15; document.getElementById('t2-rate').value = 4.0; document.getElementById('t3-years').value = 20; }
        else if (st === 's8') { document.getElementById('t1-years').value = 25; document.getElementById('t2-years').value = 20; document.getElementById('t3-years').value = 15; }
        else if (st === 's10') {
            const tot = Number(document.getElementById('m-total').value) || 1300000;
            document.getElementById('t1-perc').value = 50; document.getElementById('t1-perc-slider').value = 50; document.getElementById('t1-sum').value = Math.round(tot * 0.50);
            document.getElementById('t2-perc').value = 50; document.getElementById('t2-perc-slider').value = 50; document.getElementById('t2-sum').value = Math.round(tot * 0.50);
            document.getElementById('t3-perc').value = 0; document.getElementById('t3-perc-slider').value = 0; document.getElementById('t3-sum').value = 0;
            document.getElementById('t1-years').value = 25; document.getElementById('t2-years').value = 20; document.getElementById('t2-rate').value = 4.5;
        }
        calcMashkanta();
        const btnCard=document.getElementById(`btn-${st}`);
        const stratName=btnCard?btnCard.querySelector('.strat-header strong')?.textContent.replace(/^[^\wА-Яа-я]+/,'').trim():'Стратегия';
        const monthly=document.getElementById('res-m-total')?.textContent||'—';
        const stressVal=document.getElementById('res-stress')?.textContent||'—';
        const stressDiff=document.getElementById('res-stress-diff')?.textContent||'—';
        const st_t1=document.getElementById('res-t1')?.textContent||'—';
        const st_t2=document.getElementById('res-t2')?.textContent||'—';
        const st_t3=document.getElementById('res-t3')?.textContent||'—';
        const st_r1=parseFloat(document.getElementById('t1-rate')?.value||0).toFixed(1);
        const st_r2=parseFloat(document.getElementById('t2-rate')?.value||0).toFixed(1);
        const st_r3=parseFloat(document.getElementById('t3-rate')?.value||0).toFixed(1);
        const st_sh1=Math.round(document.getElementById('t1-perc')?.value||0);
        const st_sh2=Math.round(document.getElementById('t2-perc')?.value||0);
        const st_sh3=Math.round(document.getElementById('t3-perc')?.value||0);
        const st_y1=document.getElementById('t1-years')?.value||'—';
        const st_y2=document.getElementById('t2-years')?.value||'—';
        const st_y3=document.getElementById('t3-years')?.value||'—';
        const st_bestInfo = checkAndUpdateBest(window.__lastMonthly, window.__lastOverpay, stratName, window.__lastTotalPaid);
        showResultModal(
            stratName,
            monthly,
            'Ваш реальный платёж по этому варианту — вот сколько вы платите сейчас · '+st_bestInfo.text,
            [
              ['Прайм — '+st_sh1+'% суммы, '+st_r1+'% годовых, '+st_y1+' лет', st_t1], ['КАЛАЦ — '+st_sh2+'% суммы, '+st_r2+'% годовых, '+st_y2+' лет', st_t2], ['Миштана — '+st_sh3+'% суммы, '+st_r3+'% годовых, '+st_y3+' лет', st_t3],
              ['💸 Переплата за весь срок', fmt(window.__lastOverpay)],
              ['Гипотеза: что если Прайм вырастет на 1%?', stressVal+' (+'+stressDiff+' ₪/мес)']
            ]
        );
    }

    function updateDtiIndicator(monthlyPayment) {
      const box = document.getElementById('dti-indicator');
      if (!box) return;
      const incomeEl = document.getElementById('m-income');
      const income = incomeEl ? (Number(incomeEl.value) || 0) : 0;
      if (income <= 0 || monthlyPayment <= 0) { box.style.display = 'none'; return; }
      const ratio = (monthlyPayment / income) * 100;
      const isHe = window.currentLang === 'he';
      let bg, border, label;
      if (ratio <= 35) {
        bg = '#eafaf3'; border = '#0a8f6b';
        label = isHe ? '🟢 נטל נוח — סיכוי גבוה לאישור הבנק' : '🟢 Комфортная нагрузка — высокий шанс одобрения банком';
      } else if (ratio <= 40) {
        bg = '#fef9e7'; border = '#c2a30b';
        label = isHe ? '🟡 קרוב לתקרה המעשית שבנקים בדרך כלל מאשרים (כ-40%)' : '🟡 Близко к практическому потолку, который банки обычно одобряют (~40%)';
      } else if (ratio <= 50) {
        bg = '#fdf1ea'; border = '#c2790b';
        label = isHe ? '🟠 בתוך התקרה הפורמלית של בנק ישראל (50%), אך בפועל בנקים נוטים לסרב מעל 40%' : '🟠 В рамках формального потолка Банка Израиля (50%), но на практике банки обычно отказывают выше 40%';
      } else {
        bg = '#fdeceb'; border = '#b84b3e';
        label = isHe ? '🔴 מעל התקרה הפורמלית של בנק ישראל (50%) — לא ניתן לאישור באפיק הבנקאי הרגיל' : '🔴 Выше формального потолка Банка Израиля (50%) — не может быть одобрено обычным банком';
      }
      box.style.background = bg;
      box.style.border = '1px solid ' + border;
      box.style.display = 'block';
      const ratioTxt = ratio.toFixed(0) + '%';
      box.innerHTML = '<b>' + (isHe ? 'נטל ההחזר מההכנסה: ' : 'Платёж составляет ') + ratioTxt + (isHe ? '' : ' от дохода семьи') + '</b><br>' + label;
    }

    function calcMashkanta() {
        const total = Number(document.getElementById('m-total').value) || 1300000;
        const t1 = Number(document.getElementById('t1-sum').value) || 0;
        const t2 = Number(document.getElementById('t2-sum').value) || 0;
        const t3 = Number(document.getElementById('t3-sum').value) || 0;
        const curSum = t1 + t2 + t3;
        const balBox = document.getElementById('m-bal-box');
        const balText = document.getElementById('m-bal-text');
        if (balBox && balText) {
            const diff = total - curSum;
            const isHe = window.currentLang === 'he';
            if (Math.abs(diff) <= 100) {
                balBox.className = 'balance-badge ok';
                balText.innerText = isHe ? `✔️ הוקצה: ${fmt(curSum)} מתוך ${fmt(total)} (100% תקין)` : `✔️ Распределено: ${fmt(curSum)} из ${fmt(total)} (100% баланс)`;
            } else {
                balBox.className = 'balance-badge warn';
                if (diff > 0) balText.innerText = isHe ? `⚠️ נותר להקצות עוד ${fmt(diff)}` : `⚠️ Осталось распределить еще ${fmt(diff)} до суммы ${fmt(total)}`;
                else balText.innerText = isHe ? `⚠️ חריגה של ${fmt(-diff)} מהסכום הכולל!` : `⚠️ Превышение на ${fmt(-diff)} над суммой ${fmt(total)}!`;
            }
        }

        const y1 = Number(document.getElementById('t1-years').value) || 25;
        const y2 = Number(document.getElementById('t2-years').value) || 25;
        const y3 = Number(document.getElementById('t3-years').value) || 25;
        const r1 = Number(document.getElementById('t1-rate').value) || 5.5;
        const r2 = Number(document.getElementById('t2-rate').value) || 5.1;
        const r3 = Number(document.getElementById('t3-rate').value) || 4.4;

        let p1 = calcAnnuity(t1, y1, r1), p2 = calcAnnuity(t2, y2, r2), p3 = calcAnnuity(t3, y3, r3);

        if (window.activeStrategy === 's5') {
            p1 = t1 * (r1 / 100) / 12; p2 = t2 * (r2 / 100) / 12; p3 = t3 * (r3 / 100) / 12;
        } else if (window.activeStrategy === 's7') {
            p1 = (t1 / (y1 * 12)) + (t1 * (r1 / 100) / 12);
            p2 = (t2 / (y2 * 12)) + (t2 * (r2 / 100) / 12);
            p3 = (t3 / (y3 * 12)) + (t3 * (r3 / 100) / 12);
        }

        const mTotal = p1 + p2 + p3;
        const totalPaidLife = p1*y1*12 + p2*y2*12 + p3*y3*12;
        const totalOverpay = Math.max(0, totalPaidLife - (t1+t2+t3));
        window.__lastMonthly = mTotal;
        updateDtiIndicator(mTotal);
        if(!window.__optMaxPayTouched){
          const maxPayEl=document.getElementById('opt-maxpay');
          if(maxPayEl) maxPayEl.value = Math.ceil(mTotal*1.15/100)*100;
        }
        window.__lastOverpay = totalOverpay;
        window.__lastTotalPaid = totalPaidLife;

        let p1Stress = calcAnnuity(t1, y1, r1 + 1.0);
        if (window.activeStrategy === 's5') p1Stress = t1 * ((r1 + 1.0) / 100) / 12;
        else if (window.activeStrategy === 's7') p1Stress = (t1 / (y1 * 12)) + (t1 * ((r1 + 1.0) / 100) / 12);
        const stressTotal = p1Stress + p2 + p3;

        document.getElementById('res-t1').innerText = fmt(p1);
        document.getElementById('res-t2').innerText = fmt(p2);
        document.getElementById('res-t3').innerText = fmt(p3);
        const r1El=document.getElementById('t1-rate'),r2El=document.getElementById('t2-rate'),r3El=document.getElementById('t3-rate');
        const rt1=document.getElementById('res-t1-rate'),rt2=document.getElementById('res-t2-rate'),rt3=document.getElementById('res-t3-rate');
        if(rt1&&r1El)rt1.textContent=parseFloat(r1El.value||0).toFixed(1)+'%';
        if(rt2&&r2El)rt2.textContent=parseFloat(r2El.value||0).toFixed(1)+'%';
        if(rt3&&r3El)rt3.textContent=parseFloat(r3El.value||0).toFixed(1)+'%';
        const p1El=document.getElementById('t1-perc'),p2El=document.getElementById('t2-perc'),p3El=document.getElementById('t3-perc');
        const sh1=document.getElementById('res-t1-share'),sh2=document.getElementById('res-t2-share'),sh3=document.getElementById('res-t3-share');
        if(sh1&&p1El)sh1.textContent=Math.round(p1El.value||0)+'% пирога';
        if(sh2&&p2El)sh2.textContent=Math.round(p2El.value||0)+'% пирога';
        if(sh3&&p3El)sh3.textContent=Math.round(p3El.value||0)+'% пирога';
        const yr1=document.getElementById('res-t1-years'),yr2=document.getElementById('res-t2-years'),yr3=document.getElementById('res-t3-years');
        if(yr1)yr1.textContent=y1+' лет';
        if(yr2)yr2.textContent=y2+' лет';
        if(yr3)yr3.textContent=y3+' лет';
        document.getElementById('res-m-total').innerText = fmt(mTotal);
        const overpayEl=document.getElementById('res-overpay');
        if(overpayEl)overpayEl.innerText = fmt(totalOverpay);
        const stickyVal=document.getElementById('sticky-result-value');
        if(stickyVal)stickyVal.textContent=fmt(mTotal);

        window.finState.mashkantaTotal = mTotal;
        updateDebtBurden();
        document.getElementById('res-stress').innerText = fmt(stressTotal);
        document.getElementById('res-stress-diff').innerText = Math.round(stressTotal - mTotal).toLocaleString('ru-RU');

        // NEW: update global state for debt burden bar
        window.finState.mashkantaTotal = mTotal;
        updateDebtBurden();

        const b1 = document.getElementById('t1-perc-badge'); if (b1) b1.innerText = `${document.getElementById('t1-perc').value}%`;
        const b2 = document.getElementById('t2-perc-badge'); if (b2) b2.innerText = `${document.getElementById('t2-perc').value}%`;
        const b3 = document.getElementById('t3-perc-badge'); if (b3) b3.innerText = `${document.getElementById('t3-perc').value}%`;

        const linkEl = document.getElementById('t3-link');
        const infBoxEl = document.getElementById('res-inf-trap-box');
        const isHe = window.currentLang === 'he';
        if (linkEl && linkEl.value === 'yes') {
            if (infBoxEl) infBoxEl.style.display = 'block';
            const infRate = Number(document.getElementById('t3-inf').value) || 3.0;
            const p3At5 = Math.round(p3 * Math.pow(1 + (infRate/100)/12, 60));
            const diffP3 = p3At5 - Math.round(p3);
            const balAt5 = simSpitzerBalanceAt5(t3, y3, r3, infRate);
            const paidAt5 = simSpitzerPaidAt5(t3, y3, r3, infRate);
            const unlinkedBalAt5 = simSpitzerBalanceAt5(t3, y3, 4.4, 0);
            const extraLoss = Math.max(0, balAt5 - unlinkedBalAt5);
            const txtEl = document.getElementById('res-inf-trap-txt');
            if (txtEl) {
                if (isHe) txtEl.innerHTML = `ב-5 שנות תשלום שפיצר במסלול צמוד תשלמו לבנק כ-<strong>${fmt(paidAt5)}</strong>, אך בגלל ההצמדה למדד (${infRate}% בשנה) יתרת החוב תעמוד על <strong>${fmt(balAt5)}</strong>, וההחזר החודשי יזנק מ-${fmt(p3)} ל-<strong>${fmt(p3At5)}</strong> (+${diffP3} ₪/חודש). הפסד קרן של כ-<strong>${fmt(extraLoss)}</strong>!`;
                else txtEl.innerHTML = `За 5 лет выплат банку вы отдадите ~<strong>${fmt(paidAt5)}</strong>, НО из-за инфляции (${infRate}% в год) остаток долга по этому треку составит <strong>${fmt(balAt5)}</strong>, а платеж подскакивает с ${fmt(p3)} до <strong>${fmt(p3At5)}</strong> (+${diffP3} ₪/мес). Скрытый рост долга на <strong>~${fmt(extraLoss)}</strong>!`;
            }
        } else { if (infBoxEl) infBoxEl.style.display = 'none'; }

        const boiBox = document.getElementById('res-boi-box');
        const t1P = Number(document.getElementById('t1-perc').value) || 0;
        const t2P = Number(document.getElementById('t2-perc').value) || 0;
        const t3P = Number(document.getElementById('t3-perc').value) || 0;
        if (boiBox) {
            let errors = [];
            if (t2P < 33) errors.push(isHe ? `• חריגה: חובה 1/3 קל"צ. כרגע ${t2P}%.` : `• Нарушение ЦБ: минимум 1/3 (33.3%) должна быть в КАЛАЦ. У вас сейчас ${t2P}%.`);
            if ((t1P + t3P) > 67) errors.push(isHe ? `• חריגה: סך מסלולים משתנים חורג מ-2/3. כרגע ${t1P + t3P}%.` : `• Нарушение ЦБ: сумма переменных треков превышает 2/3. У вас сейчас ${t1P + t3P}%.`);
            if (errors.length > 0) {
                boiBox.style.background = 'rgba(220, 38, 38, 0.12)'; boiBox.style.border = '1.5px solid var(--alert)'; boiBox.style.color = 'var(--alert)';
                boiBox.innerHTML = (isHe ? `<strong>🚫 חריגה מהנחיות בנק ישראל:</strong><br>` : `<strong>🚫 НАРУШЕНИЕ РЕГУЛЯТОРА ЦБ:</strong><br>`) + errors.join('<br>');
            } else {
                boiBox.style.background = 'var(--opt-bg)'; boiBox.style.border = '1px solid var(--success)'; boiBox.style.color = 'var(--success)';
                boiBox.innerHTML = isHe ? `<strong>🛡️ עומד בהנחיות בנק ישראל 100%</strong>.` : `<strong>🛡️ СООТВЕТСТВУЕТ НОРМАМ БАНКА ИЗРАИЛЯ 100%</strong>.`;
            }
        }

        const stratDetailsBox = document.getElementById('res-strat-details-box');
        if (stratDetailsBox) {
            if (window.activeStrategy === 's5') {
                const rest1 = calcAnnuity(t1, 28, r1), rest2 = calcAnnuity(t2, 28, r2), rest3 = calcAnnuity(t3, 28, r3);
                const restTotal = Math.round(rest1 + rest2 + rest3);
                stratDetailsBox.style.display = 'block'; stratDetailsBox.style.borderColor = 'var(--primary)';
                stratDetailsBox.innerHTML = isHe
                    ? `<strong>ℹ️ דינמיקת הלוואת גרייס:</strong><br>ב-24 החודשים הראשונים: <strong>${fmt(mTotal)}</strong>.<br>החל מהחודש ה-25, ההחזר יעמוד על <strong>${fmt(restTotal)}</strong>.`
                    : `<strong>ℹ️ ДИНАМИКА ГРЕЙС-ПЕРИОДА:</strong><br>Первые 24 месяца: <strong>${fmt(mTotal)}</strong>.<br>С 25-го месяца платеж перейдет на <strong>${fmt(restTotal)}</strong>.`;
            } else if (window.activeStrategy === 's7') {
                const lastP1 = (t1 / (y1 * 12)) + (t1 / (y1 * 12)) * (r1 / 100) / 12;
                const lastP2 = (t2 / (y2 * 12)) + (t2 / (y2 * 12)) * (r2 / 100) / 12;
                const lastP3 = (t3 / (y3 * 12)) + (t3 / (y3 * 12)) * (r3 / 100) / 12;
                const lastTotal = Math.round(lastP1 + lastP2 + lastP3);
                const firstTotal = Math.round(mTotal);
                const totalPaidS7 = t1 + (t1 * (r1/100) * (y1+1)/2) + t2 + (t2 * (r2/100) * (y2+1)/2) + t3 + (t3 * (r3/100) * (y3+1)/2);
                const maxM = Math.max(y1, y2, y3) * 12 || 1;
                const avgTotal = Math.round(totalPaidS7 / maxM);
                document.getElementById('res-m-total').innerText = `${fmt(firstTotal)} ➔ ${fmt(lastTotal)}`;
                stratDetailsBox.style.display = 'block'; stratDetailsBox.style.borderColor = 'var(--success)';
                stratDetailsBox.innerHTML = isHe
                    ? `<strong>📈 דינמיקת קרן שווה:</strong><br>• תשלום ראשון: <strong>${fmt(firstTotal)}</strong><br>• ממוצע: <strong>${fmt(avgTotal)}</strong><br>• אחרון: <strong>${fmt(lastTotal)}</strong>`
                    : `<strong>📈 ДИНАМИКА КЕРЕН ШАВА:</strong><br>• 1-й месяц: <strong>${fmt(firstTotal)}</strong><br>• Средний: <strong>${fmt(avgTotal)}</strong><br>• Последний: <strong>${fmt(lastTotal)}</strong>`;
            } else { stratDetailsBox.style.display = 'none'; }
        }

        drawMashkantaChart(t1, t2, t3, y1, y2, y3, r1, r2, r3, p1, p2, p3);
        buildAnnualSchedule();
    }

    function drawMashkantaChart(t1, t2, t3, y1, y2, y3, r1, r2, r3, p1, p2, p3) {
        const canvas = document.getElementById('m-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = canvas.parentElement.clientWidth - 24; canvas.height = 140;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const oldP1 = calcAnnuity(t1, 25, 5.5), oldP2 = calcAnnuity(t2, 25, 5.1), oldP3 = calcAnnuity(t3, 25, 4.4);
        const oldTotalPaid = (oldP1 * 300) + (oldP2 * 300) + (oldP3 * 300);
        let newTotalPaid = (p1 * y1 * 12) + (p2 * y2 * 12) + (p3 * y3 * 12);
        if (window.activeStrategy === 's5') {
            const g1 = t1 * (r1/100)/12 * 24, rest1 = calcAnnuity(t1, 28, r1) * 336;
            const g2 = t2 * (r2/100)/12 * 24, rest2 = calcAnnuity(t2, 28, r2) * 336;
            const g3 = t3 * (r3/100)/12 * 24, rest3 = calcAnnuity(t3, 28, r3) * 336;
            newTotalPaid = g1 + g2 + g3 + rest1 + rest2 + rest3;
        } else if (window.activeStrategy === 's7') {
            newTotalPaid = t1 + (t1 * (r1/100) * (y1+1)/2) + t2 + (t2 * (r2/100) * (y2+1)/2) + t3 + (t3 * (r3/100) * (y3+1)/2);
        }
        const w = canvas.width, h = canvas.height, bottomPad = 42;
        const maxV = Math.max(oldTotalPaid, newTotalPaid) * 1.15 || 1;
        const barW = Math.min(65, w / 4);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#cbd5e1' : '#475569';
        const isHe = window.currentLang === 'he';
        const h1 = (oldTotalPaid / maxV) * (h - bottomPad - 10);
        ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
        ctx.fillRect(w * 0.25 - barW / 2, h - bottomPad - h1, barW, h1);
        ctx.fillStyle = textColor; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(isHe ? 'תרחיש ייחוס' : 'Эталон (25 лет)', w * 0.25, h - bottomPad + 14);
        ctx.font = 'bold 12px sans-serif'; ctx.fillText(fmt(oldTotalPaid), w * 0.25, h - bottomPad - h1 - 4);
        const h2 = (newTotalPaid / maxV) * (h - bottomPad - 10);
        const isBetter = newTotalPaid <= oldTotalPaid;
        ctx.fillStyle = isBetter ? '#16a34a' : '#d97706';
        ctx.fillRect(w * 0.75 - barW / 2, h - bottomPad - h2, barW, h2);
        ctx.fillStyle = textColor; ctx.font = '11px sans-serif';
        ctx.fillText(isHe ? 'האפשרות שנבחרה' : 'Выбранный вариант', w * 0.75, h - bottomPad + 14);
        ctx.font = 'bold 12px sans-serif'; ctx.fillText(fmt(newTotalPaid), w * 0.75, h - bottomPad - h2 - 4);
        if (!isBetter) {
            ctx.font = '10px sans-serif'; ctx.fillStyle = '#d97706';
            ctx.fillText(isHe ? 'עלות כוללת גבוהה יותר — לרוב במחיר תשלום חודשי נמוך יותר' : 'Дороже эталона — обычно ради меньшего платежа в месяц', w * 0.5, h - 6);
        }
    }




    window.optimizerVariants=[];
    function runOptimizer(){
      const optimizerStarted=performance.now();
      const total=+document.getElementById('m-total').value||0,maxPay=+document.getElementById('opt-maxpay').value||Infinity,maxTerm=+document.getElementById('opt-maxterm').value||30;
      const risk=document.getElementById('opt-risk').value;
      const rates=[0,+document.getElementById('t1-rate').value||0,+document.getElementById('t2-rate').value||0,+document.getElementById('t3-rate').value||0];
      const years=[];for(let y=10;y<=maxTerm;y+=2)years.push(y);if(!years.includes(maxTerm))years.push(maxTerm);
      let tested=0,candidates=[];const maxPrime={low:30,medium:45,high:50}[risk],maxVariable={low:45,medium:60,high:65}[risk];
      for(let p1=10;p1<=maxPrime;p1+=5)for(let p2=35;p2<=75;p2+=5){const p3=100-p1-p2;if(p3<0||p3>40||p1+p3>maxVariable)continue;
        for(const y1 of years)for(const y2 of years)for(const y3 of years){tested++;const sums=[0,total*p1/100,total*p2/100,total*p3/100];const pays=[0,calcAnnuity(sums[1],y1,rates[1]),calcAnnuity(sums[2],y2,rates[2]),calcAnnuity(sums[3],y3,rates[3])];const payment=pays[1]+pays[2]+pays[3];const stress=calcAnnuity(sums[1],y1,rates[1]+1)+pays[2]+pays[3];const paid=pays[1]*y1*12+pays[2]*y2*12+pays[3]*y3*12;const cost=paid-total;const volatility=(p1*1.0+p3*.75)/100;const over=Math.max(0,payment-maxPay);
          candidates.push({p1,p2,p3,y1,y2,y3,payment,stress,cost,volatility});
        }}
      const strategyDefinitions=[
        {key:'balanced',ru:'1. Разумный баланс',he:'1. איזון סביר',score:c=>c.cost*.42+c.payment*42+(c.stress-c.payment)*45+c.volatility*70000+Math.max(0,c.payment-maxPay)*1100},
        {key:'payment',ru:'2. Самый низкий платёж',he:'2. ההחזר הנמוך ביותר',score:c=>c.payment*120+c.cost*.12+c.volatility*25000+Math.max(0,c.payment-maxPay)*1200},
        {key:'cost',ru:'3. Минимум процентов',he:'3. מינימום ריבית',score:c=>c.cost+Math.max(0,c.payment-maxPay)*900+c.volatility*40000},
        {key:'stability',ru:'4. Больше стабильности',he:'4. יותר יציבות',score:c=>c.volatility*180000+(c.stress-c.payment)*100+c.cost*.25+Math.max(0,c.payment-maxPay)*1000},
        {key:'prime',ru:'5. Ставка на Прайм',he:'5. דגש על פריים',score:c=>c.cost*.30+c.payment*32+(c.stress-c.payment)*25-Math.min(c.p1,50)*1800+Math.max(0,c.payment-maxPay)*1100}
      ];
      const picked=[];for(const def of strategyDefinitions){const sorted=[...candidates].sort((a,b)=>def.score(a)-def.score(b));const chosen=sorted.find(c=>picked.every(x=>Math.abs(x.p1-c.p1)>=5||Math.abs(x.p2-c.p2)>=5||Math.abs(x.y1-c.y1)>=2||Math.abs(x.y2-c.y2)>=2))||sorted[0];if(chosen){picked.push({...chosen,strategyKey:def.key,strategyRu:def.ru,strategyHe:def.he});}}
      window.optimizerVariants=picked;renderOptimizer(tested);const fitCount=candidates.filter(c=>c.payment<=maxPay).length;const elapsed=performance.now()-optimizerStarted;updateOptimizerStats(tested,fitCount,elapsed,picked.length);if(picked.length)applyOptimized(0,true);
      const minFound=Math.min(...candidates.map(c=>c.payment));
      const warnBox=document.getElementById('optimizer-achievability-warning');
      if(warnBox){
        if(maxPay<minFound-10){
          warnBox.style.display='block';
          warnBox.innerHTML='⚠️ Указанный лимит ('+fmt(maxPay)+') технически недостижим при сумме '+fmt(total)+' и максимальном сроке '+maxTerm+' лет. Минимально возможный платёж среди проверенных комбинаций — около <b>'+fmt(minFound)+'</b> (уже показан ниже как «Самый низкий платёж»). Чтобы платёж был ещё ниже — нужна меньшая сумма, более длинный срок или более дешёвые ставки.';
        } else {
          warnBox.style.display='none';
        }
      }
    }
    function updateOptimizerStats(tested,fit,elapsed,shown){
      const he=window.currentLang==='he',box=document.getElementById('optimizer-stats');if(box)box.classList.add('show');
      const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
      set('stat-tested',tested.toLocaleString(he?'he-IL':'ru-RU'));set('stat-fit',fit.toLocaleString(he?'he-IL':'ru-RU'));set('stat-time',elapsed<1000?Math.round(elapsed)+' '+(he?'מ״ש':'мс'):(elapsed/1000).toFixed(2)+' '+(he?'שנ׳':'с'));set('stat-shown',shown);
    }

    function renderOptimizer(tested){
      const he=window.currentLang==='he',box=document.getElementById('optimizer-results'),st=document.getElementById('optimizer-status');
      if(st)st.textContent=he?'החישוב הושלם. הנתונים המפורטים מוצגים בכרטיסי הסיכום למטה.':'Расчёт завершён. Подробная статистика показана в карточках ниже.';
      if(!box)return;
      const WHY={
        balanced:{ru:'✅ Почему этот вариант: разумный компромисс между размером платежа и общей переплатой — не самый дешёвый и не самый быстрый, но нет явных перекосов ни в одну сторону.',he:'✅ למה זה נבחר: איזון סביר בין גובה ההחזר לסך הריבית — לא הזול ביותר ולא המהיר ביותר, אך ללא הטיה קיצונית לכיוון אחד.'},
        payment:{ru:'💳 Почему этот вариант: минимальный ежемесячный платёж среди всех проверенных комбинаций — удобнее для бюджета сейчас, но обычно переплата за весь срок выше.',he:'💳 למה זה נבחר: ההחזר החודשי הנמוך ביותר מבין כל הצירופים שנבדקו — נוח יותר לתקציב כעת, אך בדרך כלל הריבית הכוללת גבוהה יותר.'},
        cost:{ru:'💰 Почему этот вариант: минимальная переплата процентов за весь срок — вы платите государству и банку меньше всего денег в сумме, но ежемесячный платёж обычно выше.',he:'💰 למה זה נבחר: סך הריבית הנמוך ביותר לאורך כל התקופה — משלמים הכי פחות בסה"כ, אך ההחזר החודשי בדרך כלל גבוה יותר.'},
        stability:{ru:'🛡️ Почему этот вариант: наименьшая доля в переменных треках (Прайм и Миштана) — платёж почти не меняется, даже если ставки в экономике вырастут.',he:'🛡️ למה זה נבחר: החלק הקטן ביותר במסלולים משתנים (פריים ומשתנה) — ההחזר כמעט לא משתנה גם אם הריבית במשק תעלה.'},
        prime:{ru:'📉 Почему этот вариант: делает ставку на канал Прайм — обычно самый дешёвый по факту, но и самый непредсказуемый, если Банк Израиля поднимет ставку.',he:'📉 למה זה נבחר: מבוסס בעיקר על מסלול הפריים — בדרך כלל הזול ביותר בפועל, אך גם הכי לא צפוי אם בנק ישראל יעלה את הריבית.'}
      };
      box.innerHTML=window.optimizerVariants.map((v,i)=>{
        const why = WHY[v.strategyKey] ? (he?WHY[v.strategyKey].he:WHY[v.strategyKey].ru) : '';
        return `<article class="opt-result ${i===0?'best':''}"><div class="opt-head"><strong>${i===0?'🏆 ':''}${he?(v.strategyHe||'אפשרות '+(i+1)):(v.strategyRu||'Вариант '+(i+1))}</strong><span class="opt-score">#${i+1}</span></div><div class="opt-metrics"><span>${he?'החזר':'Платёж'}: <b>${fmt(v.payment)}</b></span><span>${he?'לחץ':'Стресс'}: <b>${fmt(v.stress)}</b></span><span>${he?'ריבית משוערת':'Переплата'}: <b>${fmt(v.cost)}</b></span><span>${he?'חלק משתנה':'Переменная доля'}: <b>${v.p1+v.p3}%</b></span></div>${why?`<div style="font-size:11.5px;color:var(--text-muted);background:var(--bg-inner);border-radius:8px;padding:8px 10px;margin:8px 0;line-height:1.5">${why}</div>`:''}<div class="opt-tracks">${he?'פריים':'Прайм'}: <b>${v.p1}% · ${v.y1}</b><br>${he?'קל״צ':'КАЛАЦ'}: <b>${v.p2}% · ${v.y2}</b><br>${he?'משתנה':'Миштана'}: <b>${v.p3}% · ${v.y3}</b></div><button class="opt-apply" onclick="applyOptimized(${i})">${he?'החל במחשבון':'Применить в калькуляторе'}</button></article>`;
      }).join('');
    }
    function applyOptimized(i,automatic=false){const v=window.optimizerVariants[i];if(!v)return;const total=+document.getElementById('m-total').value||0;[[1,v.p1,v.y1],[2,v.p2,v.y2],[3,v.p3,v.y3]].forEach(([n,p,y])=>{document.getElementById(`t${n}-perc`).value=p;document.getElementById(`t${n}-perc-slider`).value=p;document.getElementById(`t${n}-sum`).value=Math.round(total*p/100);document.getElementById(`t${n}-years`).value=y;});window.activeStrategy=null;window.optimizerApplied=true;document.querySelectorAll('.strat-card').forEach(e=>e.classList.remove('active'));calcMashkanta();
const monthly=document.getElementById('res-m-total')?.textContent||'—';
const stressVal=document.getElementById('res-stress')?.textContent||'—';
const opt_r1=parseFloat(document.getElementById('t1-rate')?.value||0).toFixed(1);
const opt_r2=parseFloat(document.getElementById('t2-rate')?.value||0).toFixed(1);
const opt_r3=parseFloat(document.getElementById('t3-rate')?.value||0).toFixed(1);
const opt_bestInfo = checkAndUpdateBest(window.__lastMonthly, window.__lastOverpay, automatic?'автоподбор (топ-1)':'автоподбор — вариант #'+(i+1), window.__lastTotalPaid);
showResultModal(
    automatic?'Лучший вариант применён автоматически':'Вариант применён',
    monthly,
    'Ваш реальный платёж сейчас, по этому варианту распределения · '+opt_bestInfo.text,
    [['Прайм — '+opt_r1+'% годовых', v.p1+'% суммы · '+v.y1+' лет'], ['КАЛАЦ — '+opt_r2+'% годовых', v.p2+'% суммы · '+v.y2+' лет'], ['Миштана — '+opt_r3+'% годовых', v.p3+'% суммы · '+v.y3+' лет'], ['💸 Переплата за весь срок', fmt(window.__lastOverpay)], ['Гипотеза: платёж, если Прайм вырастет на 1%', stressVal+' — не то, что вы платите сегодня']]
);
if(!automatic)document.getElementById('m-total').scrollIntoView({behavior:'smooth',block:'center'});}
    function updateOptimizerLanguage(lang){const he=lang==='he',set=(id,ru,iv)=>{const e=document.getElementById(id);if(e)e.textContent=he?iv:ru};set('optimizer-title','✨ Автоподбор тамхиля','✨ התאמה אוטומטית של תמהיל');set('optimizer-desc','Алгоритм перебирает десятки тысяч допустимых сочетаний долей и сроков и показывает лучшие варианты по выбранной цели. Это математическая модель, а не банковское предложение.','האלגוריתם בודק עשרות אלפי שילובים של אחוזים ותקופות ומציג את המובילים לפי המטרה. זוהי הדמיה מתמטית ולא הצעת בנק.');set('opt-maxpay-label','Максимальный комфортный платёж','החזר חודשי נוח מרבי');set('opt-risk-label','Допустимый риск','רמת סיכון');set('opt-maxterm-label','Максимальный срок','תקופה מרבית');set('optimizer-run','Подобрать лучшие варианты','חשב והחל את האפשרות המיטבית');if(window.optimizerVariants.length)renderOptimizer('—');}

    function showToast(text){const t=document.getElementById('app-toast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2200);}

    function initStrategyAccordion(){
      document.querySelectorAll('.strat-card').forEach((card,index)=>{
        const head=card.querySelector('.strat-header');if(!head)return;
        head.setAttribute('role','button');head.setAttribute('tabindex','0');head.setAttribute('aria-expanded','false');
        const toggle=()=>{const willOpen=!card.classList.contains('open');document.querySelectorAll('.strat-card.open').forEach(x=>{if(x!==card){x.classList.remove('open');x.querySelector('.strat-header')?.setAttribute('aria-expanded','false')}});card.classList.toggle('open',willOpen);head.setAttribute('aria-expanded',String(willOpen));};
        head.addEventListener('click',toggle);head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
      });
    }

    function summaryText(){const he=window.currentLang==='he';const total=document.getElementById('m-total').value;const payment=document.getElementById('res-m-total').innerText;const stress=document.getElementById('res-stress').innerText;const parts=[1,2,3].map(i=>`${document.getElementById(`t${i}-perc`).value}% / ${document.getElementById(`t${i}-years`).value}${he?' שנים':' лет'} / ${document.getElementById(`t${i}-rate`).value}%`);return `${he?'סכום משכנתא':'Сумма машканты'}: ${fmt(total)}
${he?'החזר חודשי':'Ежемесячный платёж'}: ${payment}
${he?'תרחיש לחץ':'Стресс-сценарий'}: ${stress}
${he?'פריים':'Прайм'}: ${parts[0]}
${he?'קל״צ':'КАЛАЦ'}: ${parts[1]}
${he?'משתנה':'Миштана'}: ${parts[2]}

${he?'חישוב מידע בלבד':'Информационный предварительный расчёт'}.`;}
    async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}}
    async function copySummary(){const ok=await copyText(summaryText());showToast(ok?(window.currentLang==='he'?'הסיכום הועתק':'Итог скопирован'):'Не удалось скопировать');}
    function scenarioParams(){const o={lang:window.currentLang,total:document.getElementById('m-total').value};for(let i=1;i<=3;i++)for(const k of ['sum','perc','years','rate'])o[`t${i}${k}`]=document.getElementById(`t${i}-${k}`).value;o.link=document.getElementById('t3-link').value;o.inf=document.getElementById('t3-inf').value;return o;}
    async function copyScenarioLink(){const data=btoa(unescape(encodeURIComponent(JSON.stringify(scenarioParams()))));const url=location.href.split('#')[0]+'#calc='+encodeURIComponent(data);const ok=await copyText(url);showToast(ok?(window.currentLang==='he'?'הקישור הועתק':'Ссылка на расчёт скопирована'):'Не удалось скопировать');}
    function loadScenarioLink(){const m=location.hash.match(/(?:^#|&)calc=([^&]+)/);if(!m)return false;try{const o=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1])))));if(o.total)document.getElementById('m-total').value=o.total;for(let i=1;i<=3;i++)for(const k of ['sum','perc','years','rate'])if(o[`t${i}${k}`]!=null)document.getElementById(`t${i}-${k}`).value=o[`t${i}${k}`];if(o.link)document.getElementById('t3-link').value=o.link;if(o.inf)document.getElementById('t3-inf').value=o.inf;applyLang(o.lang==='he'?'he':'ru');calcMashkanta();showToast(window.currentLang==='he'?'החישוב נטען מהקישור':'Расчёт загружен из ссылки');return true}catch(e){return false;}}

    const scenarioMemory={A:null,B:null};
    function estimateCurrentTotalPaid(){
        const vals=[1,2,3].map(i=>({sum:+document.getElementById(`t${i}-sum`).value||0,years:+document.getElementById(`t${i}-years`).value||0,rate:+document.getElementById(`t${i}-rate`).value||0}));
        return vals.reduce((a,v)=>a+calcAnnuity(v.sum,v.years,v.rate)*v.years*12,0);
    }
    function captureScenario(slot){
        const payment=Number(window.finState?.mashkantaTotal)||0;
        const stress=Number((document.getElementById('res-stress')?.innerText||'').replace(/[^0-9]/g,''))||0;
        const total=+document.getElementById('m-total').value||0;
        const paid=estimateCurrentTotalPaid();
        scenarioMemory[slot]={payment,stress,total,overpayment:Math.max(0,paid-total)};
        renderScenarioCompare();
    }
    function renderScenarioCompare(){
        const he=window.currentLang==='he';
        ['A','B'].forEach(k=>{const el=document.getElementById(`scenario-${k.toLowerCase()}`),v=scenarioMemory[k];if(!el)return;el.innerHTML=v?`<b>${he?'תרחיש':'Сценарий'} ${k}</b><br>${he?'החזר':'Платёж'}: <strong>${fmt(v.payment)}</strong><br>${he?'לחץ':'Стресс'}: <strong>${fmt(v.stress)}</strong><br>${he?'ריבית משוערת':'Ориентир переплаты'}: <strong>${fmt(v.overpayment)}</strong>`:`${he?'תרחיש טרם נשמר':'Сценарий ещё не зафиксирован'} ${k}`;});
        const d=document.getElementById('scenario-diff'),a=scenarioMemory.A,b=scenarioMemory.B;if(!d)return;
        if(a&&b){const dp=b.payment-a.payment,di=b.overpayment-a.overpayment;d.innerHTML=(he?'B לעומת A: ':'B относительно A: ')+`${he?'החזר':'платёж'} ${dp>=0?'+':'−'}${fmt(Math.abs(dp))}; ${he?'ריבית':'переплата'} ${di>=0?'+':'−'}${fmt(Math.abs(di))}.`;}else{d.textContent=he?'שנו פרמטרים ושמרו שני תרחישים.':'Измените параметры и сохраните два сценария.';}
    }
    function refreshAnnualSchedule(){buildAnnualSchedule();const he=window.currentLang==='he';const now=new Date().toLocaleTimeString(he?'he-IL':'ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'});const e=document.getElementById('schedule-updated');if(e)e.textContent=(he?'עודכן ':'Обновлено ')+now;showToast(he?'הטבלה חושבה מחדש':'Таблица пересчитана');}
    function buildAnnualSchedule(){
        const tracks=[1,2,3].map(i=>({bal:+document.getElementById(`t${i}-sum`).value||0,n:(+document.getElementById(`t${i}-years`).value||0)*12,r:(+document.getElementById(`t${i}-rate`).value||0)/1200,i,month:0}));
        tracks.forEach(t=>t.pay=calcAnnuity(t.bal,t.n/12,t.r*1200));
        const maxM=Math.max(...tracks.map(t=>t.n),0), rows=[];let yp=0,yi=0,ypr=0;
        for(let m=1;m<=maxM;m++){for(const t of tracks){if(t.month>=t.n||t.bal<=.01)continue;t.month++;let pay,interest,principal;
            if(window.activeStrategy==='s5'&&t.month<=24){interest=t.bal*t.r;pay=interest;principal=0;}else if(window.activeStrategy==='s7'){principal=Math.min(t.bal,(+document.getElementById(`t${t.i}-sum`).value||0)/t.n);interest=t.bal*t.r;pay=principal+interest;}else{const remain=t.n-t.month+1;pay=calcAnnuity(t.bal,remain/12,t.r*1200);interest=t.bal*t.r;principal=Math.min(t.bal,Math.max(0,pay-interest));}t.bal-=principal;yp+=pay;yi+=interest;ypr+=principal;}
            if(m%12===0||m===maxM){rows.push({year:Math.ceil(m/12),paid:yp,interest:yi,principal:ypr,balance:tracks.reduce((a,t)=>a+t.bal,0)});yp=yi=ypr=0;}}
        const body=document.getElementById('schedule-body');if(body)body.innerHTML=rows.map(r=>`<tr><td>${r.year}</td><td>${fmt(r.paid)}</td><td>${fmt(r.interest)}</td><td>${fmt(r.principal)}</td><td>${fmt(r.balance)}</td></tr>`).join('');
    }
    function updateToolsLanguage(lang){const he=lang==='he',set=(id,ru,iv)=>{const e=document.getElementById(id);if(e)e.textContent=he?iv:ru};set('tools-title','🧭 Сравнение и график погашения','🧭 השוואה ולוח סילוקין');set('tools-desc','Зафиксируйте два варианта машканты и сравните платёж, стресс-нагрузку и ориентировочную переплату. Данные остаются только в открытой вкладке.','שמרו זמנית שני תרחישים והשוו החזר, עומס וריבית משוערת. הנתונים נשארים בלשונית בלבד.');set('compare-title','Сравнение сценариев A / B','השוואת תרחישים A / B');set('capture-a','Запомнить A','שמור A');set('capture-b','Запомнить B','שמור B');set('print-btn','Печать / PDF','הדפסה / PDF');set('copy-btn','Копировать итог','העתק סיכום');set('link-btn','Ссылка на расчёт','קישור לחישוב');set('schedule-title','Годовой график погашения','לוח סילוקין שנתי');set('schedule-help','Таблица обновляется автоматически при каждом изменении суммы, ставки, срока или стратегии. Она группирует помесячный расчёт по годам.','הטבלה מתעדכנת אוטומטית בכל שינוי בסכום, בריבית, בתקופה או באסטרטגיה, ומסכמת את החישוב החודשי לפי שנים.');set('schedule-refresh','Пересчитать сейчас','חשב מחדש עכשיו');set('strategy-help','Нажмите на название конкретной стратегии, чтобы открыть только её описание и кнопку применения. Остальные стратегии останутся свёрнутыми.','לחצו על שם אסטרטגיה ספציפית כדי לפתוח רק את התיאור שלה ואת כפתור ההפעלה. שאר האסטרטגיות יישארו מקופלות.');set('th-year','Год','שנה');set('th-paid','Выплачено','שולם');set('th-interest','Проценты','ריבית');set('th-principal','Погашено долга','קרן שנפרעה');set('th-balance','Остаток','יתרה');renderScenarioCompare();}

    function lockFinancialSliders(){
      ['m-total-slider','t1-perc-slider','t2-perc-slider','t3-perc-slider'].forEach(id=>{const range=document.getElementById(id);if(!range||range.closest('.locked-range'))return;const wrap=document.createElement('div');wrap.className='locked-range';range.parentNode.insertBefore(wrap,range);const minus=document.createElement('button'),plus=document.createElement('button');minus.type=plus.type='button';minus.textContent='−';plus.textContent='+';wrap.append(minus,range,plus);const commit=dir=>{const step=Number(range.step)||1,min=Number(range.min),max=Number(range.max);range.value=Math.max(min,Math.min(max,Number(range.value)+dir*step));range.dispatchEvent(new Event('change',{bubbles:true}));};minus.onclick=()=>commit(-1);plus.onclick=()=>commit(1);});
    }

    function makeOrganizedHeading(number,title,text){const box=document.createElement('div');box.className='organized-heading';box.innerHTML=`<span class="organized-number">${number}</span><div><h2 id="org-title-${number}">${title}</h2><p id="org-text-${number}">${text}</p></div>`;return box;}
    function organizeMortgageLayout(){
      lockFinancialSliders();
      const main=document.querySelector('main'),core=main?.querySelector(':scope > .card');if(!main||!core)return;
      core.id='core-calculation';core.classList.add('section-anchor');
      const oldTitle=core.querySelector('h2'),oldDesc=core.querySelector('p.desc');
      if(oldTitle)oldTitle.style.display='none';if(oldDesc)oldDesc.style.display='none';
      core.prepend(makeOrganizedHeading('1','Основной расчёт','Укажите сумму и распределите её между треками. Итоговый платёж и стресс-сценарий находятся сразу под настройками.'));
      const strategyGrid=core.querySelector('.strat-grid-2col'),strategyWrap=strategyGrid?.parentElement;
      window.__strategyWrap=strategyWrap||null;
      const summary=core.querySelector('.mashkanta-summary-layout');if(summary){const note=document.createElement('div');note.className='results-callout';note.id='results-callout-note';note.textContent='Результат обновляется автоматически при каждом изменении суммы, долей, срока или ставки.';summary.before(note);
        const nextStep=document.createElement('div');nextStep.className='view-explain';nextStep.id='next-step-hint';nextStep.style.margin='10px 0 0';nextStep.innerHTML='<b>Что дальше?</b> Попробуйте готовые методы во вкладке «Стратегии» или доверьте подбор алгоритму во вкладке «Автоподбор». Годовую разбивку платежей смотрите во вкладке «График и сравнение».';summary.after(nextStep);
      }
      const debt=document.querySelector('body > .debt-burden-bar'),safety=document.querySelector('body > .safety-dashboard');
      if(debt){debt.id='financial-safety';debt.classList.add('section-anchor');core.after(debt);}
      if(safety){debt?debt.after(safety):core.after(safety);}
      const opt=document.getElementById('optimizer-card');if(opt){opt.classList.add('section-anchor');const h=opt.querySelector('#optimizer-title'),d=opt.querySelector('#optimizer-desc');if(h)h.style.display='none';if(d)d.style.display='none';opt.prepend(makeOrganizedHeading('3','Единый подбор: цель и оптимизация','Алгоритм одновременно применяет пять стратегий оценки и выдаёт по одному лучшему варианту для каждой: баланс, низкий платёж, минимум процентов, стабильность и повышенная доля Прайм.'));}
      const tools=document.getElementById('analysis-tools-card');if(tools){tools.classList.add('section-anchor');const h=tools.querySelector('#tools-title'),d=tools.querySelector('#tools-desc');if(h)h.style.display='none';if(d)d.style.display='none';tools.prepend(makeOrganizedHeading('4','Сравнение и график','Сохраните варианты A и B, сравните их между собой и при необходимости откройте годовой график погашения.'));}
    }
    function updateFlowLanguage(lang){const he=lang==='he',set=(id,ru,iv,html=false)=>{const e=document.getElementById(id);if(e)e[html?'innerHTML':'textContent']=he?iv:ru};set('results-callout-note','Результат обновляется автоматически при каждом изменении суммы, долей, срока или ставки.','התוצאה מתעדכנת אוטומטית עם כל שינוי בסכום, בחלוקה, בתקופה או בריבית.');set('flow-1','Расчёт','חישוב');set('flow-3b','Стратегии','אסטרטגיות');set('flow-3','Автоподбор','התאמה אוטומטית');set('flow-4','График и сравнение','לוח סילוקין והשוואה');set('view-explain-text','<b>В чём разница?</b> «Стратегии» — готовые методы распределения, вы сами выбираете логику (например «сначала погашать дорогой трек»). «Автоподбор» — компьютер сам перебирает десятки тысяч комбинаций и находит лучший вариант под вашу цель. Результат виден в полосе выше — на любой вкладке.<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border);display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px"><span style="font-weight:800">🧭 Быстрый переход:</span><a href="javascript:void(0)" onclick="setActiveView(&apos;calc&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">К расчёту</a><a href="javascript:void(0)" onclick="setActiveView(&apos;strategies&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">К стратегиям</a><a href="javascript:void(0)" onclick="setActiveView(&apos;optimizer&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">К автоподбору</a><a href="javascript:void(0)" onclick="setActiveView(&apos;tools&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">К графику</a></div>','<b>מה ההבדל?</b> "אסטרטגיות" הן שיטות חלוקה מוכנות שאתם בוחרים בעצמכם. "התאמה אוטומטית" — המחשב בודק בעצמו עשרות אלפי צירופים ומוצא את האפשרות הטובה ביותר למטרה שלכם. בשני המקרים התוצאה תופיע בחלון קופץ.',true);set('org-title-1','Основной расчёт','חישוב ראשי');set('org-text-1','Укажите сумму и распределите её между треками. Итоговый платёж и стресс-сценарий находятся сразу под настройками.','הגדירו את הסכום וחלקו אותו בין המסלולים. ההחזר הרגיל ותרחיש הלחץ מופיעים מיד מתחת להגדרות.');set('org-title-3','Единый подбор: цель и оптимизация','בחירה מאוחדת: מטרה ואופטימיזציה');set('org-text-3','Сначала выберите, что для вас важнее. Затем алгоритм проверит комбинации и выдаст рейтинг из пяти лучших вариантов.','תחילה בחרו מה חשוב לכם יותר. לאחר מכן האלגוריתם יבדוק צירופים ויציג דירוג של חמש האפשרויות המובילות.');set('org-title-4','Сравнение и график','השוואה ולוח סילוקין');set('org-text-4','Сохраните варианты A и B, сравните их между собой и при необходимости откройте годовой график погашения.','שמרו את האפשרויות A ו-B, השוו ביניהן ופתחו לפי הצורך את לוח הסילוקין השנתי.');set('integrated-scenarios-title','Готовые цели и особые способы погашения','מטרות מוכנות ושיטות פירעון מיוחדות');set('integrated-scenarios-explain','<b>Что главнее?</b> Автоподбор — основной инструмент: он ищет варианты под ваш предел платежа и выбранную цель. Готовые сценарии ниже — быстрые пресеты и учебные примеры. Их применение заменяет результат автоподбора.','<b>מהו הכלי הראשי?</b> ההתאמה האוטומטית היא הכלי המרכזי: היא מחפשת אפשרויות לפי מגבלת ההחזר והמטרה שבחרתם. התרחישים המוכנים הם קיצורי דרך ודוגמאות לימוד. החלת תרחיש מחליפה את תוצאת ההתאמה.',true);}

    function buildViewPanels(){
      const main=document.querySelector('main');if(!main)return;
      const core=document.getElementById('core-calculation');
      const debt=document.getElementById('financial-safety');
      const safety=document.querySelector('.safety-dashboard');
      const optimizer=document.getElementById('optimizer-card');
      const tools=document.getElementById('analysis-tools-card');
      const annualWarning=tools?tools.previousElementSibling:null;
      const disclaimer=main.lastElementChild;

      const panelCalc=document.createElement('div');panelCalc.id='view-panel-calc';panelCalc.className='view-panel';
      const panelStrategies=document.createElement('div');panelStrategies.id='view-panel-strategies';panelStrategies.className='view-panel';
      const panelOptimizer=document.createElement('div');panelOptimizer.id='view-panel-optimizer';panelOptimizer.className='view-panel';
      const panelTools=document.createElement('div');panelTools.id='view-panel-tools';panelTools.className='view-panel';

      main.insertBefore(panelCalc,core);
      if(core)panelCalc.append(core);
      if(debt||safety){
        const budgetDetails=document.createElement('details');
        budgetDetails.style.cssText='max-width:1100px;width:calc(100% - 32px);margin:16px auto 0';
        const budgetSummary=document.createElement('summary');
        budgetSummary.style.cssText='cursor:pointer;font-weight:700;font-size:13px;color:var(--primary);padding:12px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow)';
        budgetSummary.textContent='📊 Проверить нагрузку на семейный бюджет (опционально)';
        budgetDetails.append(budgetSummary);
        if(debt)budgetDetails.append(debt);
        if(safety)budgetDetails.append(safety);
        panelCalc.append(budgetDetails);
      }

      panelCalc.after(panelStrategies);
      const stratExplain=document.createElement('div');
      stratExplain.className='selection-explain';
      stratExplain.innerHTML='<b>Как это работает:</b> каждая карточка — готовый метод распределения долей и сроков. Нажмите «Применить» — калькулятор пересчитает и сразу покажет во всплывающем окне, сколько это меняет в шекелях.';
      panelStrategies.append(stratExplain);
      if(window.__strategyWrap)panelStrategies.append(window.__strategyWrap);

      panelStrategies.after(panelOptimizer);
      if(optimizer)panelOptimizer.append(optimizer);

      panelOptimizer.after(panelTools);
      if(annualWarning)panelTools.append(annualWarning);
      if(tools)panelTools.append(tools);

      if(disclaimer)main.append(disclaimer);
    }

    function setActiveView(name){
      document.querySelectorAll('.view-panel').forEach(p=>p.classList.remove('active'));
      document.querySelectorAll('.view-tab').forEach(t=>t.classList.remove('active'));
      const panel=document.getElementById('view-panel-'+name),tab=document.getElementById('tab-'+name);
      if(panel)panel.classList.add('active');
      if(tab)tab.classList.add('active');
      if(name==='calc'){
        const wizIncome=document.getElementById('wiz-income'), mIncome=document.getElementById('m-income');
        if(wizIncome && mIncome && wizIncome.value) { mIncome.value = wizIncome.value; calcMashkanta(); }
      }
      window.scrollTo({top:document.getElementById('view-tabs').offsetTop-8,behavior:'smooth'});
    }

    window.__bestFound = null;
    function checkAndUpdateBest(payment, overpay, label, totalPaid){
      const prev = window.__bestFound;
      let text;
      if(!prev){
        text = `🏆 Первый посчитанный вариант — есть с чем сравнивать дальше`;
      } else {
        const paymentDiff = payment - prev.payment;
        const overpayDiff = overpay - prev.overpay;
        const paymentPart = Math.abs(paymentDiff)<1
          ? 'платёж такой же'
          : (paymentDiff<0 ? `платёж ниже на ${fmt(-paymentDiff)}/мес` : `платёж выше на ${fmt(paymentDiff)}/мес`);
        const overpayPart = Math.abs(overpayDiff)<1
          ? 'переплата такая же'
          : (overpayDiff<0 ? `переплата за весь срок меньше на ${fmt(-overpayDiff)}` : `переплата за весь срок больше на ${fmt(overpayDiff)}`);
        const bothBetter = paymentDiff<-1 && overpayDiff<-1;
        const bothWorse = paymentDiff>1 && overpayDiff>1;
        const prefix = bothBetter ? '✅ Лучше по обоим критериям: ' : bothWorse ? '⚠️ Хуже по обоим критериям: ' : '⚖️ Компромисс: ';
        text = `${prefix}по сравнению с «${prev.label}» — ${paymentPart}, ${overpayPart}`;
      }
      if(!prev || totalPaid < prev.totalPaid){
        window.__bestFound = {payment, overpay, label, totalPaid};
      }
      return {text};
    }
    function jumpToOptimizerVariant(i){
      closeResultModal();
      setActiveView('optimizer');
      setTimeout(function(){
        const cards = document.querySelectorAll('.opt-result');
        if(cards[i]){
          cards[i].scrollIntoView({behavior:'smooth',block:'center'});
          cards[i].style.boxShadow='0 0 0 3px var(--primary)';
          setTimeout(function(){ cards[i].style.boxShadow=''; }, 1500);
        }
      }, 150);
    }
    function showResultModal(title,bigValue,subText,rows){
      let ov=document.getElementById('result-modal-overlay');
      if(!ov){
        ov=document.createElement('div');ov.id='result-modal-overlay';ov.className='result-modal-overlay';
        ov.innerHTML='<div class="result-modal"><div class="result-modal-head"><h3 id="rm-title"></h3><button class="result-modal-close" onclick="closeResultModal()">✕</button></div><div class="result-modal-big" id="rm-big"></div><div class="result-modal-sub" id="rm-sub"></div><div class="result-modal-rows" id="rm-rows"></div><div class="result-modal-actions"><button class="rm-secondary" onclick="closeResultModal()" id="rm-close-label">Закрыть</button><button class="rm-primary" onclick="closeResultModal();setActiveView(\'tools\')" id="rm-schedule-label">📅 График по годам</button></div></div>';
        document.body.append(ov);
        ov.addEventListener('click',e=>{if(e.target===ov)closeResultModal();});
      }
      document.getElementById('rm-title').textContent=title;
      document.getElementById('rm-big').textContent=bigValue;
      document.getElementById('rm-sub').textContent=subText;
      document.getElementById('rm-rows').innerHTML=(rows||[]).map(r=>`<div class="result-modal-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
      const he=window.currentLang==='he';
      document.getElementById('rm-close-label').textContent=he?'סגור':'Закрыть';
      document.getElementById('rm-schedule-label').textContent=he?'📅 לוח סילוקין שנתי':'📅 График по годам';
      ov.classList.add('show');
    }
    function closeResultModal(){const ov=document.getElementById('result-modal-overlay');if(ov)ov.classList.remove('show');}

    function loadLiveRatesIntoTracks(){
      fetch('data/rates.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{
        const prime = j.prime;
        const byTerm = j.manual && j.manual.avg_mortgage_rate_by_term;
        const overall = j.manual && j.manual.avg_mortgage_rate_overall;
        if(typeof prime === 'number'){
          document.getElementById('t1-rate').value = prime.toFixed(2);
        }
        if(byTerm && byTerm['20']) document.getElementById('t2-rate').value = (+byTerm['20']).toFixed(2);
        if(overall) document.getElementById('t3-rate').value = (+overall).toFixed(2);
        const noteEl = document.getElementById('rates-live-note');
        if(noteEl && j.updated){
          const d = new Date(j.updated);
          noteEl.textContent = '✓ Ставки обновлены автоматически (' + (isNaN(d)?j.updated:d.toLocaleDateString('ru-RU')) + ')';
          noteEl.style.display='block';
        }
        calcMashkanta();
      }).catch(()=>{
        const noteEl = document.getElementById('rates-live-note');
        if(noteEl){ noteEl.textContent='⚠️ Не удалось загрузить свежие ставки — показаны ориентировочные значения по умолчанию.'; noteEl.style.display='block'; }
      });
    }
    window.addEventListener('DOMContentLoaded', () => {
      function safe(fn, label) {
        try { fn(); } catch (e) { console.error('Ошибка инициализации (' + label + '):', e); }
      }
      // Живая подгрузка ставок идёт первой и отдельно от остального —
      // чтобы сбой в любом другом блоке инициализации не мог её сорвать.
      safe(loadLiveRatesIntoTracks, 'loadLiveRatesIntoTracks');
      safe(organizeMortgageLayout, 'organizeMortgageLayout');
      safe(buildViewPanels, 'buildViewPanels');
      safe(initStrategyAccordion, 'initStrategyAccordion');
      safe(() => applyLang('ru'), 'applyLang');
      safe(syncLtvToTotal, 'syncLtvToTotal');
      setTimeout(() => safe(loadScenarioLink, 'loadScenarioLink'), 0);
    });
