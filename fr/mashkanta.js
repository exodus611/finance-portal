
    window.currentLang = 'ru';
    window.activeStrategy = null;

    function fmt(n) { return Math.round(n).toLocaleString('fr-FR') + ' ₪'; }
    function syncSlider(id, val, cb) { const el = document.getElementById(`${id}-slider`); if (el) el.value = val; cb(); }
    function syncInput(id, cb) { const el = document.getElementById(id); const s = document.getElementById(`${id}-slider`); if (el && s) el.value = s.value; cb(); }

    const DICT_IDS = {
        lbl_r_p1: { ru: 'Prime :', he: 'פריים:' },
        lbl_r_p2: { ru: 'Kalatz :', he: 'קל&quot;צ:' },
        lbl_r_p3: { ru: 'Mishtana :', he: 'משתנה:' },
        lbl_r_tot: { ru: 'TOTAL PAR MOIS :', he: 'סה&quot;כ לתשלום חודשי:' },
        lbl_note_top: { ru: '💡 Cliquez sur « Appliquer » sur n’importe quelle tuile', he: '💡 לחצו «החל» על כל אריח' },
        lbl_inf_prefix: { ru: 'Inflation annuelle :', he: 'אינפלציה שנתית:' },
        lbl_t3_link: { ru: 'Type d’indexation à l’inflation :', he: 'סוג הצמדה למדד:' },
        opt_l_no: { ru: '❌ Non indexée (sûr)', he: '❌ לא צמודה (בטוח)' },
        opt_l_yes: { ru: '⚠️ INDEXÉE à l’indice des prix (piège !)', he: '⚠️ צמודה למדד (מלכודת!)' },
        btn_theme: { ru: '🌙 Thème sombre', he: '🌙 ערכת נושא כהה' },
        lbl_brand_main: { ru: '🏠 Simulateur de Mashkanta 2026', he: '🏠 סימולטור משכנתא 2026' },
        lbl_brand_sub: { ru: '8 stratégies professionnelles de tamhil', he: '8 אסטרטגיות תמהיל מקצועיות' },
        btn_m_reset: { ru: 'Réinitialiser 33/42/25 %', he: 'איפוס 33/42/25%' },
        lbl_stress_h: { ru: '⚠️ Stress-test de la Banque d’Israël (+1 % Prime) :', he: '⚠️ מבחן עמידות בנק ישראל (+1% פריים):' },
        lbl_stress_d: { ru: 'Si le taux de la Banque centrale monte de 1 %, la mensualité devient', he: 'עליית ריבית ב-1% תעלה את ההחזר ל-' },
        lbl_stress_unit: { ru: '₪/mois', he: '₪/חודש' },
        lbl_inf_trap_h: { ru: '🚨 PIÈGE INFLATIONNISTE :', he: '🚨 מלכודת האינפלציה:' },
        lbl_pass_desc: { ru: 'Apportez ces chiffres à la banque <em>Leumi, Poalim ou Tafahot</em>. N’acceptez pas 25 ans. Dites : <strong>« Approuvez-moi un ishur ikroni exactement avec cette répartition d’années et de taux »</strong>.',
                          he: 'קחו את הנתונים לבנק <em>לאומי, פועלים או טפחות</em>. אל תסכימו ל-25 שנה. אמרו: <strong>«אשרו לי אישור עקרוני בדיוק עם חלוקת השנים והריביות האלו»</strong>.' },
        lbl_disc_txt: { ru: 'Tous les calculs sont purement indicatifs et informatifs. Les montants finaux peuvent varier selon la date d’octroi du crédit, le profil de l’emprunteur et les décisions de chaque banque. Ce calculateur n’est pas une consultation financière ou juridique. Pour une offre officielle, adressez-vous à des professionnels certifiés.',
                        he: 'כל החישובים הם להערכה כללית בלבד. הסכומים הסופיים עשויים להשתנות בהתאם לתאריך ההלוואה, פרופיל הלווה והחלטות הבנק. המחשבון אינו ייעוץ פיננסי או משפטי. לקבלת הצעה רשמית (אישור עקרוני) פנו לאנשי מקצוע מוסמכים.' },
        'footer-brand': { ru: 'Simulateur de Mashkanta 2026 · Calcul professionnel de tamhil pour Israël', he: 'סימולטור משכנתא 2026 · חישוב תמהיל מקצועי לישראל' },
    };

    const STRAT_BTN_TEXT = { ru: '⚡ Appliquer', he: '⚡ החל אסטרטגיה' };

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
        set('safe-income-label', ru ? 'Revenu net du foyer recommandé' : 'הכנסה משפחתית נטו מומלצת');
        set('safe-income-note', ru ? 'Pour que la mensualité ne dépasse pas 35 % du revenu' : 'כדי שההחזר לא יעלה על 35% מההכנסה');
        set('stress-ratio-label', ru ? 'Charge si le taux monte' : 'עומס בתרחיש עליית ריבית');
        set('stress-ratio-note', ru ? 'Scénario de stress : Prime +1 %' : 'תרחיש לחץ: פריים +1%');
        set('reserve-label', ru ? 'Réserve pour 6 mensualités' : 'רזרבה ל-6 תשלומים');
        set('reserve-note', ru ? 'Repère de matelas de sécurité, hypothèque seule' : 'יעד כרית ביטחון למשכנתא בלבד');
        set('margin-label', ru ? 'Marge avant 40 % de charge' : 'מרווח עד עומס של 40%');
        set('margin-note', ru ? 'Écart entre 40 % du revenu et la mensualité actuelle' : 'הפער בין 40% מההכנסה להחזר הנוכחי');
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
        document.title = he ? 'מחשבון משכנתא בישראל — התאמת תמהיל, אסטרטגיות ולוח סילוקין | 2026' : 'Calculateur de prêt hypothécaire (mashkanta) en Israël — structure et tableau | 2026';
        set('site-back','← Accueil','חזרה לדף הראשי →');
        // Le 4ᵉ argument true = écrire via innerHTML. Sans lui, la fonction écrit
        // en textContent, et la balise <span> avec l’hébreu s’affichait comme texte.
        set('site-intro-title','Calculateur de mashkanta (<span lang="he" dir="rtl">משכנתא</span>) — calcul avancé','מחשבון משכנתא — חישוב מורחב',true);
        set('site-intro-text','Commencez par indiquer le montant et la répartition des pistes. Ensuite, utilisez les stratégies pédagogiques ou l’optimisation automatique. Tous les résultats sont un modèle mathématique préliminaire.','תחילה הגדירו את הסכום ואת חלוקת המסלולים. לאחר מכן ניתן להשתמש באסטרטגיות ההדגמה או בהתאמה האוטומטית. כל התוצאות הן מודל מתמטי מקדים.');
        set('opt-help-1-title','1. Fixez la limite','1. הגדירו גבול');
        set('opt-help-1-text','Une mensualité confortable et la durée maximale.','החזר חודשי נוח ותקופה מרבית.');
        set('opt-help-2-title','2. Choisissez l’objectif','2. בחרו מטרה');
        set('opt-help-2-text','Économie, mensualité basse ou stabilité.','חיסכון, החזר נמוך או יציבות.');
        set('opt-help-3-title','3. Appliquez l’option','3. החילו אפשרות');
        set('opt-help-3-text','Le meilleur résultat est reporté dans le calcul principal.','התוצאה המתאימה מועברת לחישוב הראשי.');
        set('opt-goal-balanced','Équilibre','איזון'); set('opt-goal-cost','Surcoût minimal','מינימום ריבית כוללת');
        set('opt-goal-payment','Mensualité minimale','מינימום החזר חודשי'); set('opt-goal-stability','Stabilité','יציבות');
        set('opt-risk-low','Faible','נמוכה'); set('opt-risk-medium','Moyen','בינונית'); set('opt-risk-high','Élevé','גבוהה');
        set('opt-term-20','20 ans','20 שנה'); set('opt-term-25','25 ans','25 שנה'); set('opt-term-30','30 ans','30 שנה');
        set('unified-selection-banner','<b>Comment ça marche :</b> l’« objectif principal » choisi est la stratégie de recherche. L’optimisation automatique n’est pas une concurrente des stratégies : elle réalise mathématiquement l’objectif choisi et construit le classement des places 1 à 5.','<b>איך זה עובד:</b> המטרה שנבחרה היא אסטרטגיית החיפוש. ההתאמה האוטומטית אינה כלי מתחרה — היא מממשת את המטרה באופן מתמטי ומדרגת את חמש האפשרויות המובילות.',true);
        set('stat-tested-label','Combinaisons testées','צירופים שנבדקו'); set('stat-fit-label','Dans la limite de mensualité','בתוך מגבלת ההחזר'); set('stat-time-label','Temps de calcul','זמן חישוב'); set('stat-shown-label','Meilleures options affichées','תוצאות מובילות');
        set('chart-truth','Chaque colonne montre la somme totale qui sera versée sur la durée : le capital de 1 300 000 ₪ plus les intérêts. La valeur ne peut donc pas être inférieure à la dette initiale. Une mensualité basse sur une longue durée peut aboutir à un total versé plus élevé.','כל עמודה מציגה את מלוא הסכום שישולם לאורך התקופה: קרן ההלוואה בתוספת ריבית. לכן הסכום אינו יכול להיות נמוך מהחוב המקורי. החזר חודשי נמוך בתקופה ארוכה עשוי ליצור סכום תשלומים כולל גבוה יותר.');
        set('annual-warning-title','⚠️ Avant de consulter le tableau annuel','⚠️ לפני הצגת לוח הסילוקין השנתי');
        set('annual-warning-text','Le détail annuel est construit sur les taux, durées et hypothèses saisis au moment du calcul. C’est un scénario, pas un tableau bancaire garanti pour toute la durée. En cas de variation du Prime, du taux révisé, de l’indice des prix, des conditions de la banque, d’un remboursement anticipé ou d’un rachat de crédit, la mensualité, les intérêts et le solde changeront. Le tableau aide à comprendre la direction et l’ordre de grandeur, mais ne remplace pas le tableau d’amortissement officiel de la banque.','הפירוט השנתי מחושב לפי הריביות, התקופות וההנחות שהוזנו בזמן החישוב. זהו תרחיש ולא לוח בנקאי מובטח לכל התקופה. שינוי בריבית הפריים, בריבית המתעדכנת, במדד המחירים, בתנאי הבנק, בפירעון מוקדם או במחזור ישנה את ההחזר החודשי, הריבית ויתרת החוב. הטבלה מסייעת להבין את הכיוון ואת סדרי הגודל, אך אינה מחליפה לוח סילוקין רשמי של הבנק.');
        document.querySelectorAll('.btn-strat-apply').forEach(e=>e.textContent=he?'⚡ החל':'⚡ Appliquer');
        updateFlowLanguage(lang);
        if (!window.optimizerVariants || !window.optimizerVariants.length) set('optimizer-status','Les taux sont repris des champs actuels du calculateur.','הריביות נלקחות מהשדות הנוכחיים במחשבון.');
    }

    function toggleTheme() {
        const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        const b = document.getElementById('btn_theme');
        const isHe = window.currentLang === 'he';
        if (b) b.innerText = (t === 'dark') ? (isHe ? '☀️ ערכת נושא בהירה' : '☀️ Thème clair') : (isHe ? '🌙 ערכת נושא כהה' : '🌙 Thème sombre');
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
            noteText = isHe ? 'הזינו הכנסה ונתוני משכנתא כדי לראות את העומס.' : 'Saisissez le revenu et les données de l’hypothèque pour voir la charge.';
        } else if (ratio < 35) {
            color = 'var(--success)'; noteBg = 'rgba(22,163,74,0.1)';
            noteText = isHe ? `✅ עומס בריא. ${Math.round(ratio)}% מהנטו הולך למשכנתא — טווח בטוח (עד 35-40%).` : `✅ Charge saine. ${Math.round(ratio)} % du net part dans l’hypothèque — zone sûre (jusqu’à 35-40 %).`;
        } else if (ratio < 45) {
            color = 'var(--warning)'; noteBg = 'rgba(217,119,6,0.12)';
            noteText = isHe ? `⚠️ עומס גבולי. ${Math.round(ratio)}% מהנטו הולך למשכנתא — הבנקים בודקים בקפידה.` : `⚠️ Charge limite. ${Math.round(ratio)} % du net part dans l’hypothèque — les banques examinent plus strictement.`;
        } else {
            color = 'var(--alert)'; noteBg = 'rgba(220,38,38,0.12)';
            noteText = isHe ? `🚨 עומס גבוה מדי. ${Math.round(ratio)}% מהנטו הולך למשכנתא — מעל 45%, הבנק עלול לסרב.` : `🚨 Charge élevée. ${Math.round(ratio)} % du net part dans l’hypothèque — au-delà de 45 %, la banque peut refuser.`;
        }
        if (fillEl) { fillEl.style.width = `${Math.min(100, ratio)}%`; fillEl.style.background = color; }
        if (noteEl) { noteEl.innerText = noteText; noteEl.style.background = noteBg; noteEl.style.color = color; }
        const bNetto = document.getElementById('dbb-b-netto'); if (bNetto) bNetto.innerText = (isHe ? '💰 נטו משפחתי: ' : '💰 Net du foyer : ') + fmt(netto);
        const bMash = document.getElementById('dbb-b-mash'); if (bMash) bMash.innerText = (isHe ? '🏠 משכנתא/חודש: ' : '🏠 Hypothèque/mois : ') + fmt(mash);
        const bFree = document.getElementById('dbb-b-free'); if (bFree) bFree.innerText = (isHe ? '✅ נשאר פנוי אחרי תשלום: ' : '✅ Reste après mensualité : ') + fmt(freeLeft);        updateSafetyDashboard();
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
      var fmtW = function(n){ return Math.round(n).toLocaleString('fr-FR')+' ₪'; };
      if(from===1){
        var price = +document.getElementById('wiz-price').value||0;
        var status = +document.getElementById('wiz-status').value||75;
        var loan = Math.round(price*status/100);
        var equity = price - loan;
        document.getElementById('wiz-step1-result').innerHTML =
          '<b>Mashkanta maximale :</b> '+fmtW(loan)+'<br><b>Apport personnel requis :</b> '+fmtW(equity);
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
          '<b>Charge sur le revenu :</b> '+ratioTxt+'<br>'+noteTxt;
        showWizStep(3);
      } else if(from===3){
        var total = document.getElementById('m-total') ? document.getElementById('m-total').value : 0;
        document.getElementById('wiz-step3-result').innerHTML =
          'Montant de la mashkanta : <b>'+fmtW(total)+'</b><br>Pistes par défaut : Prime 33 % · Kalatz 42 % · Mishtana 25 %';
        showWizStep(4);
        document.getElementById('wiz-step4-result').textContent = '⏳ Calcul en cours…';
        setTimeout(function(){
          if(typeof runOptimizer==='function') runOptimizer();
          var variants = window.optimizerVariants||[];
          var html = '<p style="color:var(--text-muted);font-size:12px;margin-bottom:10px">De nombreuses combinaisons ont été testées, voici les 3 meilleures :</p>';
          variants.slice(0,3).forEach(function(v,i){
            html += '<div style="background:var(--bg-inner);border-radius:9px;padding:10px;margin-bottom:8px;'+(i===0?'border:2px solid var(--success)':'border:1px solid var(--border)')+'">'+
              '<b>'+(i===0?'🏆 ':'')+(window.currentLang==='he'?(v.strategyHe||''):(v.strategyRu||''))+'</b><br>'+
              '<span style="font-size:12px;color:var(--text-muted)">Mensualité : '+fmtW(v.payment)+' · Surcoût : '+fmtW(v.cost)+'</span></div>';
          });
          document.getElementById('wiz-step4-result').innerHTML = html || 'Impossible de trouver des options — vérifiez les données saisies.';
        }, 50);
      } else if(from===4){
        var variants = window.optimizerVariants||[];
        var best = variants[0];
        var monthly = document.getElementById('res-m-total') ? document.getElementById('res-m-total').textContent : '—';
        var overpay = document.getElementById('res-overpay') ? document.getElementById('res-overpay').textContent : '—';
        var html = '<div style="background:var(--opt-bg);border-radius:10px;padding:14px;margin-bottom:10px">'+
          '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:800">Mensualité</div>'+
          '<div style="font-size:26px;font-weight:900;font-family:var(--font-mono);color:var(--success)">'+monthly+'</div>'+
          '<div style="font-size:12px;color:var(--text-muted);margin-top:4px">Surcoût total sur la durée : '+overpay+'</div></div>';
        if(best){
          html += '<div style="font-size:13px">Stratégie : <b>'+(window.currentLang==='he'?(best.strategyHe||''):(best.strategyRu||''))+'</b><br>'+
            'Prime : '+best.p1+'% · '+best.y1+' ans<br>Kalatz : '+best.p2+'% · '+best.y2+' ans<br>Mishtana : '+best.p3+'% · '+best.y3+' ans</div>';
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
      const bestInfo = checkAndUpdateBest(window.__lastMonthly, window.__lastOverpay, 'calcul manuel', window.__lastTotalPaid);

      // --- on calcule discrètement les 5 meilleures options, sans toucher à votre calcul manuel ---
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
        const WHY_SHORT = {balanced:'équilibre mensualité/surcoût',payment:'mensualité minimale',cost:'surcoût minimal',stability:'le moins de risque de hausse',prime:'pari sur un Prime bon marché'};
        const cardsHtml = variants.map(function(v,i){
          const name = (window.currentLang==='he'?v.strategyHe:v.strategyRu) || ('Option '+(i+1));
          const why = WHY_SHORT[v.strategyKey] || '';
          return '<div onclick="jumpToOptimizerVariant('+i+')" style="cursor:pointer;background:var(--bg-inner);border:1px solid var(--border);border-radius:9px;padding:9px 11px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px">'+
            '<div><b style="font-size:12.5px">'+(i===0?'🏆 ':'')+name+'</b><br><span style="font-size:11px;color:var(--text-muted)">'+why+' · '+fmt(v.payment)+'/mois · surcoût '+fmt(v.cost)+'</span></div>'+
            '<span style="color:var(--primary);font-weight:800;font-size:16px;flex:0 0 auto">›</span></div>';
        }).join('');
        fiveVariantRows = [['📊 Les 5 meilleures options — cliquez sur l’une pour voir le détail complet des pistes', '<div style="margin-top:6px">'+cardsHtml+'</div>']];
      } finally {
        // on restaure votre propre calcul tel qu’il était
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
        'Votre mensualité',
        monthly,
        'Au montant et à la répartition actuels des pistes · '+bestInfo.text,
        [
          ['Prime — '+sh1+'% du montant, '+r1+'% par an, '+y1v+' ans', t1], ['Kalatz — '+sh2+'% du montant, '+r2+'% par an, '+y2v+' ans', t2], ['Mishtana — '+sh3+'% du montant, '+r3+'% par an, '+y3v+' ans', t3],
          ['💸 Surcoût total sur la durée', fmt(window.__lastOverpay)],
          ['Si le Prime monte de 1 %', stressVal+' (+'+stressDiff+' ₪)'],
          ['🔍 L’optimisation automatique a examiné', testedCount+' combinaisons en '+timeStat+' · dans la limite de mensualité : '+fitCount],
          ...fiveVariantRows
        ]
      );
    }
    function calcLtv(){
      const price=parseFloat(document.getElementById('ltv-price').value)||0;
      const pct=parseFloat(document.getElementById('ltv-status').value)||75;
      const loan=Math.round(price*pct/100);
      const equity=price-loan;
      const fmtN=n=>Math.round(n).toLocaleString('fr-FR');
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
            showToast(window.currentLang === 'he' ? 'האסטרטגיה מחליפה את תוצאת ההתאמה האוטומטית' : 'La stratégie remplace le résultat de l’optimisation automatique');
            window.optimizerApplied = false;
        }
        window.activeStrategy = st;
        document.querySelectorAll('.strat-card').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`btn-${st}`); if (btn) btn.classList.add('active');

        // On restaure d’abord la répartition de base 33/42/25 %, pour que les stratégies
        // sans pourcentages propres n’héritent pas d’une Mishtana à zéro laissée par la stratégie précédente (ex. s10)
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
        // On restaure les taux/durées de base, pour que les valeurs de la stratégie précédente ne "restent pas figées"
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
        const stratName=btnCard?btnCard.querySelector('.strat-header strong')?.textContent.replace(/^[^\wА-Яа-я]+/,'').trim():'Stratégie';
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
            'Votre mensualité réelle pour cette option — ce que vous payez actuellement · '+st_bestInfo.text,
            [
              ['Prime — '+st_sh1+'% du montant, '+st_r1+'% par an, '+st_y1+' ans', st_t1], ['Kalatz — '+st_sh2+'% du montant, '+st_r2+'% par an, '+st_y2+' ans', st_t2], ['Mishtana — '+st_sh3+'% du montant, '+st_r3+'% par an, '+st_y3+' ans', st_t3],
              ['💸 Surcoût total sur la durée', fmt(window.__lastOverpay)],
              ['Hypothèse : que se passe-t-il si le Prime monte de 1 % ?', stressVal+' (+'+stressDiff+' ₪/mois)']
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
        label = isHe ? '🟢 נטל נוח — סיכוי גבוה לאישור הבנק' : '🟢 Charge confortable — forte chance d’approbation par la banque';
      } else if (ratio <= 40) {
        bg = '#fef9e7'; border = '#c2a30b';
        label = isHe ? '🟡 קרוב לתקרה המעשית שבנקים בדרך כלל מאשרים (כ-40%)' : '🟡 Proche du plafond pratique que les banques approuvent généralement (~40 %)';
      } else if (ratio <= 50) {
        bg = '#fdf1ea'; border = '#c2790b';
        label = isHe ? '🟠 בתוך התקרה הפורמלית של בנק ישראל (50%), אך בפועל בנקים נוטים לסרב מעל 40%' : '🟠 Dans le plafond formel de la Banque d’Israël (50 %), mais en pratique les banques refusent généralement au-delà de 40 %';
      } else {
        bg = '#fdeceb'; border = '#b84b3e';
        label = isHe ? '🔴 מעל התקרה הפורמלית של בנק ישראל (50%) — לא ניתן לאישור באפיק הבנקאי הרגיל' : '🔴 Au-dessus du plafond formel de la Banque d’Israël (50 %) — ne peut pas être approuvé par une banque ordinaire';
      }
      box.style.background = bg;
      box.style.border = '1px solid ' + border;
      box.style.display = 'block';
      const ratioTxt = ratio.toFixed(0) + '%';
      box.innerHTML = '<b>' + (isHe ? 'נטל ההחזר מההכנסה: ' : 'La mensualité représente ') + ratioTxt + (isHe ? '' : ' du revenu du foyer') + '</b><br>' + label;
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
                balText.innerText = isHe ? `✔️ הוקצה: ${fmt(curSum)} מתוך ${fmt(total)} (100% תקין)` : `✔️ Réparti : ${fmt(curSum)} sur ${fmt(total)} (100 % équilibré)`;
            } else {
                balBox.className = 'balance-badge warn';
                if (diff > 0) balText.innerText = isHe ? `⚠️ נותר להקצות עוד ${fmt(diff)}` : `⚠️ Il reste ${fmt(diff)} à répartir pour atteindre ${fmt(total)}`;
                else balText.innerText = isHe ? `⚠️ חריגה של ${fmt(-diff)} מהסכום הכולל!` : `⚠️ Dépassement de ${fmt(-diff)} par rapport à ${fmt(total)} !`;
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
        if(sh1&&p1El)sh1.textContent=Math.round(p1El.value||0)+'% du gâteau';
        if(sh2&&p2El)sh2.textContent=Math.round(p2El.value||0)+'% du gâteau';
        if(sh3&&p3El)sh3.textContent=Math.round(p3El.value||0)+'% du gâteau';
        const yr1=document.getElementById('res-t1-years'),yr2=document.getElementById('res-t2-years'),yr3=document.getElementById('res-t3-years');
        if(yr1)yr1.textContent=y1+' ans';
        if(yr2)yr2.textContent=y2+' ans';
        if(yr3)yr3.textContent=y3+' ans';
        document.getElementById('res-m-total').innerText = fmt(mTotal);
        const overpayEl=document.getElementById('res-overpay');
        if(overpayEl)overpayEl.innerText = fmt(totalOverpay);
        const stickyVal=document.getElementById('sticky-result-value');
        if(stickyVal)stickyVal.textContent=fmt(mTotal);

        window.finState.mashkantaTotal = mTotal;
        updateDebtBurden();
        document.getElementById('res-stress').innerText = fmt(stressTotal);
        document.getElementById('res-stress-diff').innerText = Math.round(stressTotal - mTotal).toLocaleString('fr-FR');

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
                else txtEl.innerHTML = `En 5 ans de remboursement vous aurez versé ~<strong>${fmt(paidAt5)}</strong> à la banque, MAIS à cause de l’inflation (${infRate} % par an) le solde de cette piste atteindra <strong>${fmt(balAt5)}</strong>, et la mensualité bondit de ${fmt(p3)} à <strong>${fmt(p3At5)}</strong> (+${diffP3} ₪/mois). Hausse cachée de la dette de <strong>~${fmt(extraLoss)}</strong> !`;
            }
        } else { if (infBoxEl) infBoxEl.style.display = 'none'; }

        const boiBox = document.getElementById('res-boi-box');
        const t1P = Number(document.getElementById('t1-perc').value) || 0;
        const t2P = Number(document.getElementById('t2-perc').value) || 0;
        const t3P = Number(document.getElementById('t3-perc').value) || 0;
        if (boiBox) {
            let errors = [];
            if (t2P < 33) errors.push(isHe ? `• חריגה: חובה 1/3 קל"צ. כרגע ${t2P}%.` : `• Infraction des règles de la Banque centrale : au moins 1/3 (33,3 %) doit être en Kalatz. Actuellement : ${t2P} %.`);
            if ((t1P + t3P) > 67) errors.push(isHe ? `• חריגה: סך מסלולים משתנים חורג מ-2/3. כרגע ${t1P + t3P}%.` : `• Infraction des règles de la Banque centrale : la somme des pistes variables dépasse 2/3. Actuellement : ${t1P + t3P} %.`);
            if (errors.length > 0) {
                boiBox.style.background = 'rgba(220, 38, 38, 0.12)'; boiBox.style.border = '1.5px solid var(--alert)'; boiBox.style.color = 'var(--alert)';
                boiBox.innerHTML = (isHe ? `<strong>🚫 חריגה מהנחיות בנק ישראל:</strong><br>` : `<strong>🚫 INFRACTION AUX RÈGLES DE LA BANQUE CENTRALE :</strong><br>`) + errors.join('<br>');
            } else {
                boiBox.style.background = 'var(--opt-bg)'; boiBox.style.border = '1px solid var(--success)'; boiBox.style.color = 'var(--success)';
                boiBox.innerHTML = isHe ? `<strong>🛡️ עומד בהנחיות בנק ישראל 100%</strong>.` : `<strong>🛡️ CONFORME AUX NORMES DE LA BANQUE D’ISRAËL À 100 %</strong>.`;
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
                    : `<strong>ℹ️ DYNAMIQUE DE LA PÉRIODE DE GRÂCE :</strong><br>Les 24 premiers mois : <strong>${fmt(mTotal)}</strong>.<br>Dès le 25ᵉ mois, la mensualité passera à <strong>${fmt(restTotal)}</strong>.`;
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
                    : `<strong>📈 DYNAMIQUE DU KEREN SHAVA :</strong><br>• 1ᵉʳ mois : <strong>${fmt(firstTotal)}</strong><br>• Moyenne : <strong>${fmt(avgTotal)}</strong><br>• Dernier : <strong>${fmt(lastTotal)}</strong>`;
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
        ctx.fillText(isHe ? 'תרחיש ייחוס' : 'Référence (25 ans)', w * 0.25, h - bottomPad + 14);
        ctx.font = 'bold 12px sans-serif'; ctx.fillText(fmt(oldTotalPaid), w * 0.25, h - bottomPad - h1 - 4);
        const h2 = (newTotalPaid / maxV) * (h - bottomPad - 10);
        const isBetter = newTotalPaid <= oldTotalPaid;
        ctx.fillStyle = isBetter ? '#16a34a' : '#d97706';
        ctx.fillRect(w * 0.75 - barW / 2, h - bottomPad - h2, barW, h2);
        ctx.fillStyle = textColor; ctx.font = '11px sans-serif';
        ctx.fillText(isHe ? 'האפשרות שנבחרה' : 'Option choisie', w * 0.75, h - bottomPad + 14);
        ctx.font = 'bold 12px sans-serif'; ctx.fillText(fmt(newTotalPaid), w * 0.75, h - bottomPad - h2 - 4);
        if (!isBetter) {
            ctx.font = '10px sans-serif'; ctx.fillStyle = '#d97706';
            ctx.fillText(isHe ? 'עלות כוללת גבוהה יותר — לרוב במחיר תשלום חודשי נמוך יותר' : 'Plus cher que la référence — généralement pour une mensualité plus basse', w * 0.5, h - 6);
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
        {key:'balanced',ru:'1. Équilibre raisonnable',he:'1. איזון סביר',score:c=>c.cost*.42+c.payment*42+(c.stress-c.payment)*45+c.volatility*70000+Math.max(0,c.payment-maxPay)*1100},
        {key:'payment',ru:'2. Mensualité la plus basse',he:'2. ההחזר הנמוך ביותר',score:c=>c.payment*120+c.cost*.12+c.volatility*25000+Math.max(0,c.payment-maxPay)*1200},
        {key:'cost',ru:'3. Intérêts minimaux',he:'3. מינימום ריבית',score:c=>c.cost+Math.max(0,c.payment-maxPay)*900+c.volatility*40000},
        {key:'stability',ru:'4. Plus de stabilité',he:'4. יותר יציבות',score:c=>c.volatility*180000+(c.stress-c.payment)*100+c.cost*.25+Math.max(0,c.payment-maxPay)*1000},
        {key:'prime',ru:'5. Pari sur le Prime',he:'5. דגש על פריים',score:c=>c.cost*.30+c.payment*32+(c.stress-c.payment)*25-Math.min(c.p1,50)*1800+Math.max(0,c.payment-maxPay)*1100}
      ];
      const picked=[];for(const def of strategyDefinitions){const sorted=[...candidates].sort((a,b)=>def.score(a)-def.score(b));const chosen=sorted.find(c=>picked.every(x=>Math.abs(x.p1-c.p1)>=5||Math.abs(x.p2-c.p2)>=5||Math.abs(x.y1-c.y1)>=2||Math.abs(x.y2-c.y2)>=2))||sorted[0];if(chosen){picked.push({...chosen,strategyKey:def.key,strategyRu:def.ru,strategyHe:def.he});}}
      window.optimizerVariants=picked;renderOptimizer(tested);const fitCount=candidates.filter(c=>c.payment<=maxPay).length;const elapsed=performance.now()-optimizerStarted;updateOptimizerStats(tested,fitCount,elapsed,picked.length);if(picked.length)applyOptimized(0,true);
      const minFound=Math.min(...candidates.map(c=>c.payment));
      const warnBox=document.getElementById('optimizer-achievability-warning');
      if(warnBox){
        if(maxPay<minFound-10){
          warnBox.style.display='block';
          warnBox.innerHTML='⚠️ La limite indiquée ('+fmt(maxPay)+') est techniquement inatteignable avec un montant de '+fmt(total)+' et une durée maximale de '+maxTerm+' ans. La mensualité minimale possible parmi les combinaisons testées est d’environ <b>'+fmt(minFound)+'</b> (déjà affichée plus bas comme « Mensualité la plus basse »). Pour descendre encore, il faut un montant plus petit, une durée plus longue ou des taux moins chers.';
        } else {
          warnBox.style.display='none';
        }
      }
    }
    function updateOptimizerStats(tested,fit,elapsed,shown){
      const he=window.currentLang==='he',box=document.getElementById('optimizer-stats');if(box)box.classList.add('show');
      const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
      set('stat-tested',tested.toLocaleString(he?'he-IL':'fr-FR'));set('stat-fit',fit.toLocaleString(he?'he-IL':'fr-FR'));set('stat-time',elapsed<1000?Math.round(elapsed)+' '+(he?'מ״ש':'ms'):(elapsed/1000).toFixed(2)+' '+(he?'שנ׳':'s'));set('stat-shown',shown);
    }

    function renderOptimizer(tested){
      const he=window.currentLang==='he',box=document.getElementById('optimizer-results'),st=document.getElementById('optimizer-status');
      if(st)st.textContent=he?'החישוב הושלם. הנתונים המפורטים מוצגים בכרטיסי הסיכום למטה.':'Calcul terminé. Les statistiques détaillées sont affichées dans les cartes ci-dessous.';
      if(!box)return;
      const WHY={
        balanced:{ru:'✅ Pourquoi cette option : un compromis raisonnable entre mensualité et surcoût total — ni la moins chère ni la plus rapide, mais sans déséquilibre marqué.',he:'✅ למה זה נבחר: איזון סביר בין גובה ההחזר לסך הריבית — לא הזול ביותר ולא המהיר ביותר, אך ללא הטיה קיצונית לכיוון אחד.'},
        payment:{ru:'💳 Pourquoi cette option : la mensualité la plus basse de toutes les combinaisons testées — plus confortable pour le budget actuel, mais généralement un surcoût total plus élevé.',he:'💳 למה זה נבחר: ההחזר החודשי הנמוך ביותר מבין כל הצירופים שנבדקו — נוח יותר לתקציב כעת, אך בדרך כלל הריבית הכוללת גבוהה יותר.'},
        cost:{ru:'💰 Pourquoi cette option : le minimum d’intérêts payés sur toute la durée — vous versez le moins d’argent au total, mais la mensualité est généralement plus élevée.',he:'💰 למה זה נבחר: סך הריבית הנמוך ביותר לאורך כל התקופה — משלמים הכי פחות בסה"כ, אך ההחזר החודשי בדרך כלל גבוה יותר.'},
        stability:{ru:'🛡️ Pourquoi cette option : la plus petite part dans les pistes variables (Prime et Mishtana) — la mensualité change à peine, même si les taux montent.',he:'🛡️ למה זה נבחר: החלק הקטן ביותר במסלולים משתנים (פריים ומשתנה) — ההחזר כמעט לא משתנה גם אם הריבית במשק תעלה.'},
        prime:{ru:'📉 Pourquoi cette option : mise sur la piste Prime — généralement la moins chère en pratique, mais aussi la moins prévisible si la Banque d’Israël relève son taux.',he:'📉 למה זה נבחר: מבוסס בעיקר על מסלול הפריים — בדרך כלל הזול ביותר בפועל, אך גם הכי לא צפוי אם בנק ישראל יעלה את הריבית.'}
      };
      box.innerHTML=window.optimizerVariants.map((v,i)=>{
        const why = WHY[v.strategyKey] ? (he?WHY[v.strategyKey].he:WHY[v.strategyKey].ru) : '';
        return `<article class="opt-result ${i===0?'best':''}"><div class="opt-head"><strong>${i===0?'🏆 ':''}${he?(v.strategyHe||'אפשרות '+(i+1)):(v.strategyRu||'Option '+(i+1))}</strong><span class="opt-score">#${i+1}</span></div><div class="opt-metrics"><span>${he?'החזר':'Mensualité'}: <b>${fmt(v.payment)}</b></span><span>${he?'לחץ':'Stress'}: <b>${fmt(v.stress)}</b></span><span>${he?'ריבית משוערת':'Surcoût'}: <b>${fmt(v.cost)}</b></span><span>${he?'חלק משתנה':'Part variable'}: <b>${v.p1+v.p3}%</b></span></div>${why?`<div style="font-size:11.5px;color:var(--text-muted);background:var(--bg-inner);border-radius:8px;padding:8px 10px;margin:8px 0;line-height:1.5">${why}</div>`:''}<div class="opt-tracks">${he?'פריים':'Prime'}: <b>${v.p1}% · ${v.y1}</b><br>${he?'קל״צ':'Kalatz'}: <b>${v.p2}% · ${v.y2}</b><br>${he?'משתנה':'Mishtana'}: <b>${v.p3}% · ${v.y3}</b></div><button class="opt-apply" onclick="applyOptimized(${i})">${he?'החל במחשבון':'Appliquer au calculateur'}</button></article>`;
      }).join('');
    }
    function applyOptimized(i,automatic=false){const v=window.optimizerVariants[i];if(!v)return;const total=+document.getElementById('m-total').value||0;[[1,v.p1,v.y1],[2,v.p2,v.y2],[3,v.p3,v.y3]].forEach(([n,p,y])=>{document.getElementById(`t${n}-perc`).value=p;document.getElementById(`t${n}-perc-slider`).value=p;document.getElementById(`t${n}-sum`).value=Math.round(total*p/100);document.getElementById(`t${n}-years`).value=y;});window.activeStrategy=null;window.optimizerApplied=true;document.querySelectorAll('.strat-card').forEach(e=>e.classList.remove('active'));calcMashkanta();
const monthly=document.getElementById('res-m-total')?.textContent||'—';
const stressVal=document.getElementById('res-stress')?.textContent||'—';
const opt_r1=parseFloat(document.getElementById('t1-rate')?.value||0).toFixed(1);
const opt_r2=parseFloat(document.getElementById('t2-rate')?.value||0).toFixed(1);
const opt_r3=parseFloat(document.getElementById('t3-rate')?.value||0).toFixed(1);
const opt_bestInfo = checkAndUpdateBest(window.__lastMonthly, window.__lastOverpay, automatic?'optimisation automatique (n° 1)':'optimisation automatique — option n° '+(i+1), window.__lastTotalPaid);
showResultModal(
    automatic?'La meilleure option a été appliquée automatiquement':'Option appliquée',
    monthly,
    'Votre mensualité actuelle, pour cette répartition · '+opt_bestInfo.text,
    [['Prime — '+opt_r1+'% par an', v.p1+'% du montant · '+v.y1+' ans'], ['Kalatz — '+opt_r2+'% par an', v.p2+'% du montant · '+v.y2+' ans'], ['Mishtana — '+opt_r3+'% par an', v.p3+'% du montant · '+v.y3+' ans'], ['💸 Surcoût total sur la durée', fmt(window.__lastOverpay)], ['Hypothèse : mensualité si le Prime monte de 1 %', stressVal+' — ce n’est pas ce que vous payez aujourd’hui']]
);
if(!automatic)document.getElementById('m-total').scrollIntoView({behavior:'smooth',block:'center'});}
    function updateOptimizerLanguage(lang){const he=lang==='he',set=(id,ru,iv)=>{const e=document.getElementById(id);if(e)e.textContent=he?iv:ru};set('optimizer-title','✨ Optimisation automatique du tamhil','✨ התאמה אוטומטית של תמהיל');set('optimizer-desc','L’algorithme passe en revue des dizaines de milliers de combinaisons admises de parts et de durées, et affiche les meilleures options selon l’objectif choisi. C’est un modèle mathématique, pas une offre bancaire.','האלגוריתם בודק עשרות אלפי שילובים של אחוזים ותקופות ומציג את המובילים לפי המטרה. זוהי הדמיה מתמטית ולא הצעת בנק.');set('opt-maxpay-label','Mensualité confortable maximale','החזר חודשי נוח מרבי');set('opt-risk-label','Risque admis','רמת סיכון');set('opt-maxterm-label','Durée maximale','תקופה מרבית');set('optimizer-run','Trouver les meilleures options','חשב והחל את האפשרות המיטבית');if(window.optimizerVariants.length)renderOptimizer('—');}

    function showToast(text){const t=document.getElementById('app-toast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2200);}

    function initStrategyAccordion(){
      document.querySelectorAll('.strat-card').forEach((card,index)=>{
        const head=card.querySelector('.strat-header');if(!head)return;
        head.setAttribute('role','button');head.setAttribute('tabindex','0');head.setAttribute('aria-expanded','false');
        const toggle=()=>{const willOpen=!card.classList.contains('open');document.querySelectorAll('.strat-card.open').forEach(x=>{if(x!==card){x.classList.remove('open');x.querySelector('.strat-header')?.setAttribute('aria-expanded','false')}});card.classList.toggle('open',willOpen);head.setAttribute('aria-expanded',String(willOpen));};
        head.addEventListener('click',toggle);head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
      });
    }

    function summaryText(){const he=window.currentLang==='he';const total=document.getElementById('m-total').value;const payment=document.getElementById('res-m-total').innerText;const stress=document.getElementById('res-stress').innerText;const parts=[1,2,3].map(i=>`${document.getElementById(`t${i}-perc`).value}% / ${document.getElementById(`t${i}-years`).value}${he?' שנים':' ans'} / ${document.getElementById(`t${i}-rate`).value}%`);return `${he?'סכום משכנתא':'Montant de la mashkanta'}: ${fmt(total)}
${he?'החזר חודשי':'Mensualité'}: ${payment}
${he?'תרחיש לחץ':'Scénario de stress'}: ${stress}
${he?'פריים':'Prime'}: ${parts[0]}
${he?'קל״צ':'Kalatz'}: ${parts[1]}
${he?'משתנה':'Mishtana'}: ${parts[2]}

${he?'חישוב מידע בלבד':'Calcul préliminaire informatif'}.`;}
    async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}}
    async function copySummary(){const ok=await copyText(summaryText());showToast(ok?(window.currentLang==='he'?'הסיכום הועתק':'Résumé copié'):'Copie impossible');}
    function scenarioParams(){const o={lang:window.currentLang,total:document.getElementById('m-total').value};for(let i=1;i<=3;i++)for(const k of ['sum','perc','years','rate'])o[`t${i}${k}`]=document.getElementById(`t${i}-${k}`).value;o.link=document.getElementById('t3-link').value;o.inf=document.getElementById('t3-inf').value;return o;}
    async function copyScenarioLink(){const data=btoa(unescape(encodeURIComponent(JSON.stringify(scenarioParams()))));const url=location.href.split('#')[0]+'#calc='+encodeURIComponent(data);const ok=await copyText(url);showToast(ok?(window.currentLang==='he'?'הקישור הועתק':'Lien du calcul copié'):'Copie impossible');}
    function loadScenarioLink(){const m=location.hash.match(/(?:^#|&)calc=([^&]+)/);if(!m)return false;try{const o=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1])))));if(o.total)document.getElementById('m-total').value=o.total;for(let i=1;i<=3;i++)for(const k of ['sum','perc','years','rate'])if(o[`t${i}${k}`]!=null)document.getElementById(`t${i}-${k}`).value=o[`t${i}${k}`];if(o.link)document.getElementById('t3-link').value=o.link;if(o.inf)document.getElementById('t3-inf').value=o.inf;applyLang(o.lang==='he'?'he':'ru');calcMashkanta();showToast(window.currentLang==='he'?'החישוב נטען מהקישור':'Calcul chargé depuis le lien');return true}catch(e){return false;}}

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
        ['A','B'].forEach(k=>{const el=document.getElementById(`scenario-${k.toLowerCase()}`),v=scenarioMemory[k];if(!el)return;el.innerHTML=v?`<b>${he?'תרחיש':'Scénario'} ${k}</b><br>${he?'החזר':'Mensualité'}: <strong>${fmt(v.payment)}</strong><br>${he?'לחץ':'Stress'}: <strong>${fmt(v.stress)}</strong><br>${he?'ריבית משוערת':'Surcoût estimatif'}: <strong>${fmt(v.overpayment)}</strong>`:`${he?'תרחיש טרם נשמר':'Scénario pas encore mémorisé'} ${k}`;});
        const d=document.getElementById('scenario-diff'),a=scenarioMemory.A,b=scenarioMemory.B;if(!d)return;
        if(a&&b){const dp=b.payment-a.payment,di=b.overpayment-a.overpayment;d.innerHTML=(he?'B לעומת A: ':'B par rapport à A : ')+`${he?'החזר':'mensualité'} ${dp>=0?'+':'−'}${fmt(Math.abs(dp))}; ${he?'ריבית':'surcoût'} ${di>=0?'+':'−'}${fmt(Math.abs(di))}.`;}else{d.textContent=he?'שנו פרמטרים ושמרו שני תרחישים.':'Modifiez les paramètres et enregistrez deux scénarios.';}
    }
    function refreshAnnualSchedule(){buildAnnualSchedule();const he=window.currentLang==='he';const now=new Date().toLocaleTimeString(he?'he-IL':'fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});const e=document.getElementById('schedule-updated');if(e)e.textContent=(he?'עודכן ':'Mis à jour ')+now;showToast(he?'הטבלה חושבה מחדש':'Tableau recalculé');}
    function buildAnnualSchedule(){
        const tracks=[1,2,3].map(i=>({bal:+document.getElementById(`t${i}-sum`).value||0,n:(+document.getElementById(`t${i}-years`).value||0)*12,r:(+document.getElementById(`t${i}-rate`).value||0)/1200,i,month:0}));
        tracks.forEach(t=>t.pay=calcAnnuity(t.bal,t.n/12,t.r*1200));
        const maxM=Math.max(...tracks.map(t=>t.n),0), rows=[];let yp=0,yi=0,ypr=0;
        for(let m=1;m<=maxM;m++){for(const t of tracks){if(t.month>=t.n||t.bal<=.01)continue;t.month++;let pay,interest,principal;
            if(window.activeStrategy==='s5'&&t.month<=24){interest=t.bal*t.r;pay=interest;principal=0;}else if(window.activeStrategy==='s7'){principal=Math.min(t.bal,(+document.getElementById(`t${t.i}-sum`).value||0)/t.n);interest=t.bal*t.r;pay=principal+interest;}else{const remain=t.n-t.month+1;pay=calcAnnuity(t.bal,remain/12,t.r*1200);interest=t.bal*t.r;principal=Math.min(t.bal,Math.max(0,pay-interest));}t.bal-=principal;yp+=pay;yi+=interest;ypr+=principal;}
            if(m%12===0||m===maxM){rows.push({year:Math.ceil(m/12),paid:yp,interest:yi,principal:ypr,balance:tracks.reduce((a,t)=>a+t.bal,0)});yp=yi=ypr=0;}}
        const body=document.getElementById('schedule-body');if(body)body.innerHTML=rows.map(r=>`<tr><td>${r.year}</td><td>${fmt(r.paid)}</td><td>${fmt(r.interest)}</td><td>${fmt(r.principal)}</td><td>${fmt(r.balance)}</td></tr>`).join('');
    }
    function updateToolsLanguage(lang){const he=lang==='he',set=(id,ru,iv)=>{const e=document.getElementById(id);if(e)e.textContent=he?iv:ru};set('tools-title','🧭 Comparaison et graphique de remboursement','🧭 השוואה ולוח סילוקין');set('tools-desc','Mémorisez deux variantes de mashkanta et comparez mensualité, charge en stress-test et surcoût estimatif. Les données restent dans l’onglet ouvert.','שמרו זמנית שני תרחישים והשוו החזר, עומס וריבית משוערת. הנתונים נשארים בלשונית בלבד.');set('compare-title','Comparaison des scénarios A / B','השוואת תרחישים A / B');set('capture-a','Mémoriser A','שמור A');set('capture-b','Mémoriser B','שמור B');set('print-btn','Imprimer / PDF','הדפסה / PDF');set('copy-btn','Copier le résumé','העתק סיכום');set('link-btn','Lien du calcul','קישור לחישוב');set('schedule-title','Tableau annuel de remboursement','לוח סילוקין שנתי');set('schedule-help','Le tableau se met à jour automatiquement à chaque changement de montant, taux, durée ou stratégie. Il regroupe le calcul mensuel par années.','הטבלה מתעדכנת אוטומטית בכל שינוי בסכום, בריבית, בתקופה או באסטרטגיה, ומסכמת את החישוב החודשי לפי שנים.');set('schedule-refresh','Recalculer maintenant','חשב מחדש עכשיו');set('strategy-help','Cliquez sur le nom d’une stratégie pour n’ouvrir que sa description et son bouton d’application. Les autres stratégies resteront repliées.','לחצו על שם אסטרטגיה ספציפית כדי לפתוח רק את התיאור שלה ואת כפתור ההפעלה. שאר האסטרטגיות יישארו מקופלות.');set('th-year','Année','שנה');set('th-paid','Versé','שולם');set('th-interest','Intérêts','ריבית');set('th-principal','Capital remboursé','קרן שנפרעה');set('th-balance','Solde','יתרה');renderScenarioCompare();}

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
      core.prepend(makeOrganizedHeading('1','Calcul principal','Indiquez le montant et répartissez-le entre les pistes. La mensualité finale et le scénario de stress se trouvent juste sous les réglages.'));
      const strategyGrid=core.querySelector('.strat-grid-2col'),strategyWrap=strategyGrid?.parentElement;
      window.__strategyWrap=strategyWrap||null;
      const summary=core.querySelector('.mashkanta-summary-layout');if(summary){const note=document.createElement('div');note.className='results-callout';note.id='results-callout-note';note.textContent='Le résultat se met à jour automatiquement à chaque changement de montant, de parts, de durée ou de taux.';summary.before(note);
        const nextStep=document.createElement('div');nextStep.className='view-explain';nextStep.id='next-step-hint';nextStep.style.margin='10px 0 0';nextStep.innerHTML='<b>Et maintenant ?</b> Essayez les méthodes prêtes à l’emploi dans l’onglet « Stratégies » ou confiez le choix à l’algorithme dans « Optimisation automatique ». Le détail annuel des paiements est dans l’onglet « Comparaison et graphique ».';summary.after(nextStep);
      }
      const debt=document.querySelector('body > .debt-burden-bar'),safety=document.querySelector('body > .safety-dashboard');
      if(debt){debt.id='financial-safety';debt.classList.add('section-anchor');core.after(debt);}
      if(safety){debt?debt.after(safety):core.after(safety);}
      const opt=document.getElementById('optimizer-card');if(opt){opt.classList.add('section-anchor');const h=opt.querySelector('#optimizer-title'),d=opt.querySelector('#optimizer-desc');if(h)h.style.display='none';if(d)d.style.display='none';opt.prepend(makeOrganizedHeading('3','Sélection unifiée : objectif et optimisation','L’algorithme applique simultanément cinq stratégies d’évaluation et donne la meilleure option pour chacune : équilibre, mensualité basse, intérêts minimaux, stabilité et part accrue de Prime.'));}
      const tools=document.getElementById('analysis-tools-card');if(tools){tools.classList.add('section-anchor');const h=tools.querySelector('#tools-title'),d=tools.querySelector('#tools-desc');if(h)h.style.display='none';if(d)d.style.display='none';tools.prepend(makeOrganizedHeading('4','Comparaison et graphique','Enregistrez les options A et B, comparez-les et, au besoin, ouvrez le tableau annuel de remboursement.'));}
    }
    function updateFlowLanguage(lang){const he=lang==='he',set=(id,ru,iv,html=false)=>{const e=document.getElementById(id);if(e)e[html?'innerHTML':'textContent']=he?iv:ru};set('results-callout-note','Le résultat se met à jour automatiquement à chaque changement de montant, de parts, de durée ou de taux.','התוצאה מתעדכנת אוטומטית עם כל שינוי בסכום, בחלוקה, בתקופה או בריבית.');set('flow-1','Calcul','חישוב');set('flow-3b','Stratégies','אסטרטגיות');set('flow-3','Optimisation automatique','התאמה אוטומטית');set('flow-4','Comparaison et graphique','לוח סילוקין והשוואה');set('view-explain-text','<b>Quelle différence ?</b> « Stratégies » — des méthodes de répartition prêtes à l’emploi, vous choisissez la logique (par exemple « rembourser d’abord la piste chère »). « Optimisation automatique » — l’ordinateur passe en revue des dizaines de milliers de combinaisons et trouve la meilleure option pour votre objectif. Le résultat apparaît dans la bande ci-dessus, quel que soit l’onglet.<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border);display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px"><span style="font-weight:800">🧭 Accès rapide :</span><a href="javascript:void(0)" onclick="setActiveView(&apos;calc&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">Au calcul</a><a href="javascript:void(0)" onclick="setActiveView(&apos;strategies&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">Aux stratégies</a><a href="javascript:void(0)" onclick="setActiveView(&apos;optimizer&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">À l’optimisation</a><a href="javascript:void(0)" onclick="setActiveView(&apos;tools&apos;)" style="color:var(--primary);font-weight:700;text-decoration:underline">Au graphique</a></div>','<b>מה ההבדל?</b> "אסטרטגיות" הן שיטות חלוקה מוכנות שאתם בוחרים בעצמכם. "התאמה אוטומטית" — המחשב בודק בעצמו עשרות אלפי צירופים ומוצא את האפשרות הטובה ביותר למטרה שלכם. בשני המקרים התוצאה תופיע בחלון קופץ.',true);set('org-title-1','Calcul principal','חישוב ראשי');set('org-text-1','Indiquez le montant et répartissez-le entre les pistes. La mensualité finale et le scénario de stress se trouvent juste sous les réglages.','הגדירו את הסכום וחלקו אותו בין המסלולים. ההחזר הרגיל ותרחיש הלחץ מופיעים מיד מתחת להגדרות.');set('org-title-3','Sélection unifiée : objectif et optimisation','בחירה מאוחדת: מטרה ואופטימיזציה');set('org-text-3','Choisissez d’abord ce qui compte le plus pour vous. L’algorithme testera ensuite les combinaisons et affichera un classement des cinq meilleures options.','תחילה בחרו מה חשוב לכם יותר. לאחר מכן האלגוריתם יבדוק צירופים ויציג דירוג של חמש האפשרויות המובילות.');set('org-title-4','Comparaison et graphique','השוואה ולוח סילוקין');set('org-text-4','Enregistrez les options A et B, comparez-les et, au besoin, ouvrez le tableau annuel de remboursement.','שמרו את האפשרויות A ו-B, השוו ביניהן ופתחו לפי הצורך את לוח הסילוקין השנתי.');set('integrated-scenarios-title','Objectifs prêts à l’emploi et méthodes de remboursement spéciales','מטרות מוכנות ושיטות פירעון מיוחדות');set('integrated-scenarios-explain','<b>Qu’est-ce qui prime ?</b> L’optimisation automatique est l’outil principal : elle cherche des options sous votre limite de mensualité et l’objectif choisi. Les scénarios prêts ci-dessous sont des préréglages rapides et des exemples pédagogiques. Les appliquer remplace le résultat de l’optimisation.','<b>מהו הכלי הראשי?</b> ההתאמה האוטומטית היא הכלי המרכזי: היא מחפשת אפשרויות לפי מגבלת ההחזר והמטרה שבחרתם. התרחישים המוכנים הם קיצורי דרך ודוגמאות לימוד. החלת תרחיש מחליפה את תוצאת ההתאמה.',true);}

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
        budgetSummary.textContent='📊 Vérifier la charge sur le budget familial (facultatif)';
        budgetDetails.append(budgetSummary);
        if(debt)budgetDetails.append(debt);
        if(safety)budgetDetails.append(safety);
        panelCalc.append(budgetDetails);
      }

      panelCalc.after(panelStrategies);
      const stratExplain=document.createElement('div');
      stratExplain.className='selection-explain';
      stratExplain.innerHTML='<b>Comment ça marche :</b> chaque carte est une méthode prête de répartition des parts et des durées. Cliquez sur « Appliquer » — le calculateur recalcule et montre aussitôt, en popup, ce que cela change en shekels.';
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
        text = `🏆 Première option calculée — une base de comparaison pour la suite`;
      } else {
        const paymentDiff = payment - prev.payment;
        const overpayDiff = overpay - prev.overpay;
        const paymentPart = Math.abs(paymentDiff)<1
          ? 'mensualité identique'
          : (paymentDiff<0 ? `mensualité inférieure de ${fmt(-paymentDiff)}/mois` : `mensualité supérieure de ${fmt(paymentDiff)}/mois`);
        const overpayPart = Math.abs(overpayDiff)<1
          ? 'surcoût identique'
          : (overpayDiff<0 ? `surcoût total inférieur de ${fmt(-overpayDiff)}` : `surcoût total supérieur de ${fmt(overpayDiff)}`);
        const bothBetter = paymentDiff<-1 && overpayDiff<-1;
        const bothWorse = paymentDiff>1 && overpayDiff>1;
        const prefix = bothBetter ? '✅ Mieux sur les deux critères : ' : bothWorse ? '⚠️ Moins bien sur les deux critères : ' : '⚖️ Compromis : ';
        text = `${prefix}par rapport à « ${prev.label} » — ${paymentPart}, ${overpayPart}`;
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
        ov.innerHTML='<div class="result-modal"><div class="result-modal-head"><h3 id="rm-title"></h3><button class="result-modal-close" onclick="closeResultModal()">✕</button></div><div class="result-modal-big" id="rm-big"></div><div class="result-modal-sub" id="rm-sub"></div><div class="result-modal-rows" id="rm-rows"></div><div class="result-modal-actions"><button class="rm-secondary" onclick="closeResultModal()" id="rm-close-label">Fermer</button><button class="rm-primary" onclick="closeResultModal();setActiveView(\'tools\')" id="rm-schedule-label">📅 Tableau par années</button></div></div>';
        document.body.append(ov);
        ov.addEventListener('click',e=>{if(e.target===ov)closeResultModal();});
      }
      document.getElementById('rm-title').textContent=title;
      document.getElementById('rm-big').textContent=bigValue;
      document.getElementById('rm-sub').textContent=subText;
      document.getElementById('rm-rows').innerHTML=(rows||[]).map(r=>`<div class="result-modal-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
      const he=window.currentLang==='he';
      document.getElementById('rm-close-label').textContent=he?'סגור':'Fermer';
      document.getElementById('rm-schedule-label').textContent=he?'📅 לוח סילוקין שנתי':'📅 Tableau par années';
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
          noteEl.textContent = '✓ Taux mis à jour automatiquement (' + (isNaN(d)?j.updated:d.toLocaleDateString('fr-FR')) + ')';
          noteEl.style.display='block';
        }
        calcMashkanta();
      }).catch(()=>{
        const noteEl = document.getElementById('rates-live-note');
        if(noteEl){ noteEl.textContent='⚠️ Impossible de charger les taux à jour — valeurs indicatives par défaut affichées.'; noteEl.style.display='block'; }
      });
    }
    window.addEventListener('DOMContentLoaded', () => {
      function safe(fn, label) {
        try { fn(); } catch (e) { console.error('Erreur d’initialisation (' + label + '):', e); }
      }
      // Le chargement des taux en direct passe en premier et séparément du reste —
        // pour qu’une panne dans un autre bloc d’initialisation ne puisse pas l’interrompre.
      safe(loadLiveRatesIntoTracks, 'loadLiveRatesIntoTracks');
      safe(organizeMortgageLayout, 'organizeMortgageLayout');
      safe(buildViewPanels, 'buildViewPanels');
      safe(initStrategyAccordion, 'initStrategyAccordion');
      safe(() => applyLang('ru'), 'applyLang');
      safe(syncLtvToTotal, 'syncLtvToTotal');
      setTimeout(() => safe(loadScenarioLink, 'loadScenarioLink'), 0);
    });
