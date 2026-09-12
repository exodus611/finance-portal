/* « Dmei avtala » (דמי אבטלה) — calculateur d’allocation de chômage en Israël.
 * Module autonome : n’expose que window.AVT.
 * Tous les chiffres viennent de data/avtala-fr.json, aucune somme n’est codée en dur.
 */
(function () {
  'use strict';

  var root = document.getElementById('avt-root');
  if (!root) return;

  var DATA_URL = root.getAttribute('data-src') || 'data/avtala.json';
  var D = null;

  var nfInt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  var nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function shekel(n) { return nfInt.format(Math.round(n)) + ' ₪'; }
  function shekel2(n) { return nf2.format(n) + ' ₪'; }
  function pct(x) { return Math.round(x * 100) + '\u00a0%'; }
  function el(s, c) { return (c || root).querySelector(s); }
  function els(s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); }
  function parseDate(s) { return s ? new Date(s + 'T00:00:00') : null; }
  function days(a, b) { return Math.round((b - a) / 86400000); }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  function readState() {
    var out = {}, q = location.hash.replace(/^#/, '');
    q.split('&').forEach(function (p) {
      if (!p) return;
      var kv = p.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }
  function writeState(o) {
    var parts = [];
    Object.keys(o).forEach(function (k) {
      if (o[k] !== '' && o[k] != null) parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(o[k]));
    });
    history.replaceState(null, '', parts.length ? '#' + parts.join('&') : location.pathname);
  }
  var STATE = readState();

  /* ═══════════ CŒUR DU CALCUL ═══════════
     Vérifié contre l’exemple officiel de Kol Zkhout :
     35 ans, salaire quotidien moyen de 500 ₪ → 290,05 ₪/jour. Concordance à l’agora près. */

  function dailyBenefit(avgDaily, under28) {
    var prev = 0, total = 0, steps = [];
    D.brackets.forEach(function (b) {
      if (avgDaily <= prev) { steps.push({ from: prev, to: b.upto, rate: null, part: 0, sum: 0 }); return; }
      var part = Math.min(avgDaily, b.upto) - prev;
      var rate = under28 ? b.rate_under28 : b.rate_28plus;
      var sum = part * rate;
      total += sum;
      steps.push({ from: prev, to: b.upto, rate: rate, part: part, sum: sum });
      prev = b.upto;
    });
    return { total: total, steps: steps };
  }

  function maxDays(age, dependents, gender, birthYear) {
    var found = null;
    D.days_table.forEach(function (r) {
      if (found) return;
      if (age >= r.age_from && age < r.age_to && dependents >= r.dependents_min) found = r;
    });
    found = found || D.days_table[D.days_table.length - 1];

    // Droit étendu des femmes de 57–67 ans nées depuis le 1.1.1960 (depuis janvier 2022, lors du relèvement de l’âge de la retraite)
    var ext = D.special_cases && D.special_cases.women_57_67_extension;
    if (ext && gender === 'f' && age >= ext.min_age && age <= ext.max_age &&
        (!birthYear || birthYear >= ext.min_birth_year)) {
      var extended = {};
      for (var k in found) extended[k] = found[k];
      extended.days = ext.extended_days;
      extended.extended = true;
      extended.usage_window_months = ext.usage_window_months;
      extended.label_ru = (found.label_ru || '') + ' — droit étendu (femmes 57–67, nées depuis 1960)';
      return extended;
    }
    return found;
  }

  function calcAll(input) {
    var r = D.rules, c = D.caps;
    var avgDaily = input.wage * r.avg_months_for_calc / (r.workdays_per_month * r.avg_months_for_calc);
    var under28 = input.age < 28;
    var base = dailyBenefit(avgDaily, under28);

    var dailyFull = Math.min(base.total, c.daily_first_period);
    var dailyReduced = Math.min(base.total, c.daily_after_125);

    var dt = maxDays(input.age, input.dependents, input.gender, input.birthYear);
    var totalDays = input.soldier ? D.special_cases.discharged_soldier_days : dt.days;

    var fullDays = Math.min(totalDays, r.reduced_rate_after_day);
    var reducedDays = Math.max(0, totalDays - r.reduced_rate_after_day);

    var totalSum = dailyFull * fullDays + dailyReduced * reducedDays;
    var monthlyFull = dailyFull * r.workdays_per_month;
    var monthlyReduced = dailyReduced * r.workdays_per_month;
    var months = totalDays / r.workdays_per_month;

    return {
      avgDaily: avgDaily, under28: under28, base: base,
      dailyFull: dailyFull, dailyReduced: dailyReduced,
      cappedFull: base.total > c.daily_first_period,
      cappedReduced: base.total > c.daily_after_125,
      totalDays: totalDays, fullDays: fullDays, reducedDays: reducedDays,
      monthlyFull: monthlyFull, monthlyReduced: monthlyReduced,
      totalSum: totalSum, months: months, rule: dt,
      replacement: monthlyFull / input.wage
    };
  }

  /* ═══════════ CALCULATEUR ═══════════ */

  function renderCalc() {
    var r = D.rules;
    var p = el('#avt-panel-calc');

    p.innerHTML =
      num('Salaire brut moyen des ' + r.avg_months_for_calc + ' derniers mois, ₪',
          'avt-wage', STATE.w || 12000,
          'Calculé sur les bulletins de paie, avant déductions') +
      num('Votre âge', 'avt-age', STATE.a || 35,
          'De ' + r.age_min + ' à ' + r.age_max + ' ans. Avant 28 ans, les taux sont plus bas') +
      '<div class="avt-field"><span class="avt-label">Sexe</span>' +
      '<div class="avt-choices" id="avt-gender">' +
        choice('m', 'Homme', STATE.g !== 'f') +
        choice('f', 'Femme', STATE.g === 'f') +
      '</div></div>' +
      '<div class="avt-field" id="avt-birthyear-wrap" style="display:none">' +
      num('Année de naissance', 'avt-birthyear', STATE.by || (new Date().getFullYear() - 60),
          'Pour les femmes de 57–67 ans, il est décisif : c’est lui qui ouvre droit à 300 jours au lieu de 175') +
      '</div>' +
      num('Personnes à charge (conjoint et enfants jusqu’à 18 ans)', 'avt-dep', STATE.d || 0,
          'Trois ou plus augmentent nettement le nombre de jours') +
      '<div class="avt-field"><span class="avt-label">Circonstances du départ</span>' +
      '<div class="avt-choices" id="avt-reason">' +
        choice('fired', 'Licenciement', STATE.r !== 'quit' && STATE.r !== 'halat') +
        choice('quit', 'Démission', STATE.r === 'quit') +
        choice('halat', 'HALAT de l’employeur', STATE.r === 'halat') +
      '</div></div>' +
      '<div class="avt-field"><label class="avt-choice" style="display:inline-flex;align-items:center;gap:9px">' +
      '<input type="checkbox" id="avt-soldier"' + (STATE.s === '1' ? ' checked' : '') +
      ' style="width:19px;height:19px;accent-color:var(--avt-primary)">' +
      '<span>Première année après l’armée ou le service national</span></label></div>' +
      '<div class="avt-out" id="avt-out" aria-live="polite"></div>' +
      '<div class="avt-actions">' +
      '<button type="button" class="avt-btn avt-btn--ghost" id="avt-share">Copier le lien du calcul</button>' +
      '<button type="button" class="avt-btn avt-btn--ghost" onclick="window.print()">Imprimer</button>' +
      '</div>';

    els('input[type=number]', p).forEach(function (i) { i.addEventListener('input', run); });
    el('#avt-soldier', p).addEventListener('change', run);
    els('[data-opt]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        var group = b.closest('.avt-choices');
        els('[data-opt]', group || p).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        if (group && group.id === 'avt-gender') {
          var isFemale = b.getAttribute('data-opt') === 'f';
          var age = +el('#avt-age', p).value || 0;
          el('#avt-birthyear-wrap', p).style.display = (isFemale && age >= 57 && age <= 67) ? 'block' : 'none';
        }
        run();
      });
    });
    var ageInput = el('#avt-age', p);
    if (ageInput) ageInput.addEventListener('input', function () {
      var age = +this.value || 0;
      var isFemale = !!el('#avt-gender [data-opt="f"][aria-pressed="true"]', p);
      el('#avt-birthyear-wrap', p).style.display = (isFemale && age >= 57 && age <= 67) ? 'block' : 'none';
    });
    el('#avt-share').addEventListener('click', function () {
      var btn = this;
      if (navigator.clipboard) navigator.clipboard.writeText(location.href);
      btn.textContent = 'Lien copié ✓';
      setTimeout(function () { btn.textContent = 'Copier le lien du calcul'; }, 2000);
    });
    run();

    function num(label, id, val, hint) {
      return '<div class="avt-field"><label class="avt-label" for="' + id + '">' + label +
        (hint ? ' <span class="avt-hint">— ' + hint + '</span>' : '') +
        '</label><input class="avt-input" type="number" inputmode="numeric" id="' + id +
        '" value="' + val + '" min="0"></div>';
    }
    function choice(v, l, on) {
      return '<button type="button" class="avt-choice" data-opt="' + v + '" aria-pressed="' + !!on + '">' + l + '</button>';
    }
  }

  function run() {
    var r = D.rules, c = D.caps;
    var wage = +el('#avt-wage').value || 0;
    var age = +el('#avt-age').value || 0;
    var dep = +el('#avt-dep').value || 0;
    var soldier = el('#avt-soldier').checked;
    var reasonBtn = el('#avt-reason [aria-pressed="true"]');
    var reason = reasonBtn ? reasonBtn.getAttribute('data-opt') : 'fired';
    var genderBtn = el('#avt-gender [aria-pressed="true"]');
    var gender = genderBtn ? genderBtn.getAttribute('data-opt') : 'm';
    var birthYearEl = el('#avt-birthyear');
    var birthYear = birthYearEl ? (+birthYearEl.value || 0) : 0;

    var out = el('#avt-out');
    var blockers = [];

    if (age && (age < r.age_min || age >= r.age_max)) {
      blockers.push('L’allocation est due de ' + r.age_min + ' à ' + r.age_max +
        ' ans. Âge indiqué : ' + age + '.');
    }
    if (!wage) {
      out.innerHTML = '<p class="avt-hint">Indiquez un salaire pour voir le calcul.</p>';
      return;
    }

    var res = calcAll({ wage: wage, age: age, dependents: dep, soldier: soldier, gender: gender, birthYear: birthYear });

    var notices = [];
    if (reason === 'quit') {
      notices.push('<strong>Vous avez démissionné.</strong> Les versements ne commenceront qu’après ' +
        r.resignation_wait_days + ' jours après la fin du contrat. Exception : un motif valable ' +
        '(liste plus bas, section « Quand la démission compte comme valable ») — dans ce cas, on paie dès le premier jour.');
    }
    if (reason === 'halat') {
      notices.push('<strong>Le HALAT (congé sans solde) à l’initiative de l’employeur</strong> donne droit ' +
        'à l’allocation dès le premier pointage, si la durée est d’au moins ' + r.halat_min_days + ' jours. ' +
        'Un HALAT à votre propre initiative n’ouvre aucun droit.');
    }
    if (soldier) {
      notices.push('La première année après la démobilisation, le maximum est de ' +
        D.special_cases.discharged_soldier_days + ' jours, et l’ancienneté peut être acquise en ' +
        r.qualification_months_soldier + ' mois sur ' + r.qualification_window_soldier + '.');
    }
    if (res.rule && res.rule.extended) {
      notices.push('<strong>Droit étendu (femmes de 57–67 ans nées depuis le 1.1.1960) :</strong> ' +
        'vous pouvez recevoir jusqu’à <strong>' + res.rule.days + ' jours</strong> au lieu des 175 habituels — ' +
        'à utiliser dans un délai de <strong>' + res.rule.usage_window_months + ' mois</strong> ' +
        '(et non 12, comme pour les autres). C’est un avantage introduit en janvier 2022, lors du relèvement de ' +
        'l’âge de la retraite des femmes.');
    }
    if (res.cappedFull) {
      notices.push('Votre montant calculé dépasse le plafond : le maximum est appliqué — ' +
        shekel2(c.daily_first_period) + ' par jour. C’est la grande surprise pour les hauts salaires : ' +
        'quel que soit votre salaire, on ne paiera jamais plus que le plafond.');
    }

    // Tranches du calcul
    var ladder = '<table class="avt-ladder"><thead><tr><th>Tranche du salaire quotidien</th>' +
      '<th class="num">Taux</th><th class="num">Retenu</th></tr></thead><tbody>';
    var prevTo = 0;
    res.base.steps.forEach(function (s) {
      var active = s.part > 0;
      ladder += '<tr class="' + (active ? 'is-active' : '') + '">' +
        '<td>' + (prevTo === 0 ? 'jusqu’à ' + nfInt.format(s.to) : nfInt.format(prevTo) + '–' + nfInt.format(s.to)) + ' ₪</td>' +
        '<td class="num">' + (s.rate ? pct(s.rate) : '—') + '</td>' +
        '<td class="num">' + (active ? shekel2(s.sum) : '—') + '</td></tr>';
      prevTo = s.to;
    });
    ladder += '</tbody></table>';

    // Versements mois par mois
    var monthsFull = res.fullDays / r.workdays_per_month;
    var monthsRed = res.reducedDays / r.workdays_per_month;
    var totalMonths = Math.ceil(monthsFull + monthsRed);
    var maxVal = Math.max(res.monthlyFull, res.monthlyReduced) || 1;
    var bars = '';
    for (var m = 1; m <= totalMonths; m++) {
      var isRed = m > Math.ceil(monthsFull);
      var val = isRed ? res.monthlyReduced : res.monthlyFull;
      var lastPartial = (m === totalMonths);
      var daysThis = lastPartial
        ? res.totalDays - r.workdays_per_month * (totalMonths - 1)
        : r.workdays_per_month;
      if (daysThis < 0) daysThis = 0;
      var sum = (isRed ? res.dailyReduced : res.dailyFull) * daysThis;
      var h = Math.max(4, Math.round(sum / maxVal * 100));
      bars += '<div class="avt-bar' + (isRed ? ' avt-bar--reduced' : '') + '" style="height:' + h + '%">' +
        '<span class="avt-bar__val">' + nfInt.format(sum / 1000 >= 10 ? Math.round(sum / 1000) + 'k' : Math.round(sum)) + '</span>' +
        '<span class="avt-bar__lbl">' + m + '</span></div>';
    }

    out.innerHTML =
      (blockers.length ? '<div class="avt-warn">' + blockers.join('<br>') + '</div>' : '') +
      '<div class="avt-split">' +
        '<div class="avt-split__item"><span class="avt-split__lbl">Par jour</span>' +
          '<span class="avt-money avt-money--small">' + shekel2(res.dailyFull) + '</span></div>' +
        '<div class="avt-split__item"><span class="avt-split__lbl">Par mois (brut)</span>' +
          '<span class="avt-money avt-money--small">' + shekel(res.monthlyFull) + '</span></div>' +
        '<div class="avt-split__item"><span class="avt-split__lbl">Jours dus</span>' +
          '<span class="avt-money avt-money--small">' + res.totalDays + '</span></div>' +
        '<div class="avt-split__item"><span class="avt-split__lbl">Environ</span>' +
          '<span class="avt-money avt-money--small">' + res.months.toFixed(1) + ' mois</span></div>' +
      '</div>' +

      '<div class="avt-row"><span>Salaire quotidien moyen</span>' +
        '<span class="avt-row__v">' + shekel2(res.avgDaily) + '</span></div>' +
      '<div class="avt-row"><span>Groupe d’âge</span>' +
        '<span class="avt-row__v">' + (res.under28 ? 'moins de 28 ans — taux réduits' : '28 ans et plus') + '</span></div>' +
      '<div class="avt-row"><span>Base du nombre de jours</span>' +
        '<span class="avt-row__v">' + res.rule.label_ru + '</span></div>' +
      '<div class="avt-row"><span>Remplacement du salaire antérieur</span>' +
        '<span class="avt-row__v">' + pct(res.replacement) + '</span></div>' +

      (res.reducedDays > 0
        ? '<div class="avt-row"><span>Les ' + r.reduced_rate_after_day + ' premiers jours</span>' +
          '<span class="avt-row__v">' + shekel2(res.dailyFull) + ' par jour</span></div>' +
          '<div class="avt-row"><span>À partir du ' + (r.reduced_rate_after_day + 1) + 'ᵉ jour (' +
          res.reducedDays + ' ' + 'jours' + ')</span>' +
          '<span class="avt-row__v">' + shekel2(res.dailyReduced) + ' par jour</span></div>'
        : '') +

      '<div class="avt-row avt-row--total"><span>Total sur toute la période (brut)</span>' +
        '<span class="avt-row__v">' + shekel(res.totalSum) + '</span></div>' +

      '<div class="calc-share-box" style="margin: 14px 0 10px 0; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; flex-direction: column; gap: 8px;">' +
        '<span style="font-size: 0.82rem; font-weight: 600; color: #475569;">📤 Partager le calcul :</span>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
          '<button type="button" onclick="window.shareAvtala(\'whatsapp\')" style="padding: 6px 12px; background: #25d366; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">💬 WhatsApp</button>' +
          '<button type="button" onclick="window.shareAvtala(\'telegram\')" style="padding: 6px 12px; background: #229ed9; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">✈️ Telegram</button>' +
          '<button type="button" id="copy-avt-btn" onclick="window.shareAvtala(\'copy\')" style="padding: 6px 12px; background: #475569; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">📋 Copier</button>' +
        '</div>' +
      '</div>' +

      (notices.length ? '<div class="avt-note">' + notices.join('<br><br>') + '</div>' : '') +

      '<h3>Comment le montant quotidien est calculé</h3>' + ladder +
      '<p class="avt-hint">Les taux s’appliquent par tranches : chaque part du salaire est comptée à son ' +
      'propre pourcentage, et non l’ensemble au taux unique. Total par jour avant plafond : ' +
      shekel2(res.base.total) + '.</p>' +

      '<h3>Versements mois par mois</h3>' +
      '<div class="avt-bars">' + bars + '</div>' +
      '<div class="avt-legend"><span class="full">Taux plein</span>' +
      (res.reducedDays > 0 ? '<span class="red">Réduit à partir du ' + (r.reduced_rate_after_day + 1) + 'ᵉ jour</span>' : '') +
      '</div>' +
      '<p class="avt-hint">Les montants sont indiqués avant déductions. Sur l’allocation sont retenus l’impôt sur le revenu, ' +
      'la cotisation au Bitouah Leumi (' + shekel(r.monthly_bituah_leumi_deduction) + ' par mois) et l’assurance maladie, ' +
      'si bien qu’il arrive moins sur votre compte.</p>';

    var st = readState();
    st.w = wage; st.a = age; st.d = dep; st.r = reason; st.s = soldier ? '1' : '';
    writeState(st);
  }

  /* ═══════════ VÉRIFICATION DU DROIT ═══════════ */

  var wiz = { step: 0, answers: {}, steps: [] };

  function buildSteps() {
    var r = D.rules;
    wiz.steps = [
      { id: 'resident', q: 'Êtes-vous résident(e) d’Israël ?',
        hint: 'L’allocation est due aux résidents du pays.',
        opts: [{ v: 'yes', l: 'Oui' }, { v: 'no', l: 'Non' }] },
      { id: 'age', q: 'Quel est votre âge (années révolues) ?',
        hint: 'Le droit existe de ' + r.age_min + ' à ' + r.age_max + ' ans.', input: true },
      { id: 'stage', q: 'Combien de mois avez-vous travaillé comme salarié(e) au cours des ' +
          r.qualification_window_months + ' derniers mois ?',
        hint: 'Il en faut au moins ' + r.qualification_months + '. Les mois n’ont pas à être consécutifs et peuvent être ' +
              'chez des employeurs différents — une seule journée travaillée compte pour un mois entier.', input: true },
      { id: 'reason', q: 'Comment le travail s’est-il terminé ?',
        hint: 'De la réponse dépend le démarrage immédiat des versements.',
        opts: [{ v: 'fired', l: 'Licenciement' }, { v: 'quit_ok', l: 'Démission pour motif valable' },
               { v: 'quit', l: 'Démission' }, { v: 'halat', l: 'HALAT de l’employeur' }] },
      { id: 'registered', q: 'Êtes-vous enregistré(e) au bureau de placement ?',
        hint: 'Sans enregistrement ni pointages réguliers, pas d’allocation. C’est la condition clé.',
        opts: [{ v: 'yes', l: 'Oui' }, { v: 'no', l: 'Pas encore' }] }
    ];
  }

  function renderWizard() {
    var p = el('#avt-panel-check');
    var s = wiz.steps[wiz.step];
    if (!s) return renderVerdict();

    var segs = wiz.steps.map(function (_, i) {
      return '<div class="avt-progress__seg' + (i < wiz.step ? ' is-done' : '') + '"></div>';
    }).join('');

    var body = s.opts
      ? '<div class="avt-choices">' + s.opts.map(function (o) {
          return '<button type="button" class="avt-choice" data-opt="' + o.v + '" aria-pressed="' +
            (wiz.answers[s.id] === o.v) + '">' + o.l + '</button>';
        }).join('') + '</div>'
      : '<input type="number" inputmode="numeric" class="avt-input" id="avt-n" style="max-width:170px" value="' +
        (wiz.answers[s.id] || '') + '">';

    p.innerHTML = '<div class="avt-progress">' + segs + '</div>' +
      '<div class="avt-step-meta">Étape ' + (wiz.step + 1) + ' sur ' + wiz.steps.length + '</div>' +
      '<div class="avt-question">' + s.q + '</div>' +
      '<p class="avt-hint">' + (s.hint || '') + '</p>' + body +
      '<div class="avt-actions">' +
      (wiz.step > 0 ? '<button type="button" class="avt-btn avt-btn--ghost" id="avt-back">← Retour</button>' : '') +
      '<button type="button" class="avt-btn" id="avt-next">' +
      (wiz.step === wiz.steps.length - 1 ? 'Voir le résultat' : 'Suivant →') + '</button></div>';

    els('[data-opt]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        wiz.answers[s.id] = b.getAttribute('data-opt');
        els('[data-opt]', p).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        setTimeout(next, 170);
      });
    });
    var bk = el('#avt-back', p);
    if (bk) bk.addEventListener('click', function () { wiz.step--; renderWizard(); });
    el('#avt-next', p).addEventListener('click', next);

    function next() {
      if (!s.opts) {
        var v = el('#avt-n', p);
        if (v && v.value !== '') wiz.answers[s.id] = v.value;
      }
      if (wiz.answers[s.id] == null || wiz.answers[s.id] === '') return;
      wiz.step++;
      renderWizard();
    }
  }

  function renderVerdict() {
    var a = wiz.answers, r = D.rules;
    var age = parseInt(a.age, 10) || 0;
    var stage = parseInt(a.stage, 10) || 0;
    var verdict = 'yes', reasons = [], notes = [];

    if (a.resident === 'no') {
      verdict = 'no';
      reasons.push('L’allocation est due uniquement aux résidents d’Israël.');
    }
    if (age && (age < r.age_min || age >= r.age_max)) {
      verdict = 'no';
      reasons.push('Âge hors de la fourchette ' + r.age_min + '–' + r.age_max + ' ans.');
    }
    var needed = r.qualification_months;
    if (stage && stage < needed) {
      if (verdict !== 'no') verdict = 'maybe';
      reasons.push('Ancienneté insuffisante : ' + stage + ' ' + 'mois' +
        ' au lieu de ' + needed + '. Après l’armée ou le service national, ' +
        r.qualification_months_soldier + ' mois sur ' + r.qualification_window_soldier +
        ' suffisent. Attention : même une seule journée travaillée dans un mois compte pour un mois complet — recomptez bien.');
    }
    if (a.reason === 'quit') {
      if (verdict === 'yes') verdict = 'maybe';
      reasons.push('En cas de démission, les versements ne commencent qu’après ' +
        r.resignation_wait_days + ' jours. Vérifiez plus bas la liste des motifs valables — votre cas en fait peut-être partie.');
    }
    if (a.reason === 'quit_ok') {
      notes.push('Pour un motif de départ valable, on paie dès le premier pointage, mais des justificatifs sont exigés.');
    }
    if (a.reason === 'halat') {
      notes.push('Le HALAT à l’initiative de l’employeur donne droit dès le premier jour, si la durée est d’au moins ' +
        r.halat_min_days + ' jours.');
    }
    if (a.registered === 'no') {
      if (verdict === 'yes') verdict = 'maybe';
      reasons.push('Sans enregistrement au bureau de placement, l’allocation n’est pas versée. ' +
        'Le jour du premier pointage est la date clé : c’est de lui que part l’ouverture du droit. Enregistrez-vous au plus vite, ' +
        'chaque retard coûte littéralement de l’argent.');
    }

    var head = verdict === 'yes' ? '✅ Il semble que vous ayez droit à l’allocation'
      : verdict === 'maybe' ? '⚠️ Droit possible, mais sous conditions'
      : '❌ Ces réponses ne confirment pas le droit';

    el('#avt-panel-check').innerHTML =
      '<div class="avt-verdict" data-v="' + verdict + '" role="status" aria-live="polite">' +
      '<div class="avt-verdict__head">' + head + '</div>' +
      (reasons.length ? '<ul>' + reasons.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') +
      (notes.length ? '<ul>' + notes.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') +
      '</div><div class="avt-actions">' +
      '<button type="button" class="avt-btn avt-btn--ghost" id="avt-restart">Recommencer</button>' +
      '<button type="button" class="avt-btn" data-goto="calc">Calculer le montant →</button></div>' +
      '<p class="avt-hint" style="margin-top:12px">Vérification préliminaire selon les règles publiées. ' +
      'La décision finale appartient à l’agent du Bitouah Leumi.</p>';

    el('#avt-restart').addEventListener('click', function () {
      wiz.step = 0; wiz.answers = {}; renderWizard();
    });
    bindGoto();
  }

  /* ═══════════ BLOCS DE RÉFÉRENCE ═══════════ */

  function renderLists() {
    el('#avt-days-table tbody').innerHTML = D.days_table.map(function (r) {
      return '<tr><td>' + r.label_ru + '</td><td class="num">' + r.days + '</td>' +
        '<td class="num">' + (r.days / D.rules.workdays_per_month).toFixed(1) + '</td></tr>';
    }).join('') +
      '<tr><td>' + D.special_cases.discharged_soldier_note_ru + '</td>' +
      '<td class="num">' + D.special_cases.discharged_soldier_days + '</td>' +
      '<td class="num">' + (D.special_cases.discharged_soldier_days / D.rules.workdays_per_month).toFixed(1) + '</td></tr>';

    el('#avt-rates-table tbody').innerHTML = D.brackets.map(function (b, i) {
      var from = i === 0 ? 0 : D.brackets[i - 1].upto;
      return '<tr><td>' + (i === 0 ? 'jusqu’à ' + nfInt.format(b.upto) : nfInt.format(from) + '–' + nfInt.format(b.upto)) +
        ' ₪</td><td class="num">' + pct(b.rate_under28) + '</td><td class="num">' + pct(b.rate_28plus) + '</td></tr>';
    }).join('');

    fill('#avt-justified', D.justified_resignation);
    fill('#avt-rejections', D.rejection_reasons);
    fill('#avt-docs', D.documents);
    fill('#avt-deductions', D.deductions);

    el('#avt-timeline').innerHTML = D.timeline.map(function (t, i) {
      return '<li><strong>' + t.step_ru + '</strong> — ' + t.when_ru + '</li>';
    }).join('');

    function fill(sel, arr) {
      var n = el(sel);
      if (n) n.innerHTML = arr.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    }

    els('[data-fill]').forEach(function (n) {
      var v = D, fmt = n.getAttribute('data-fmt');
      n.getAttribute('data-fill').split('.').forEach(function (k) { v = v ? v[k] : null; });
      if (v == null) return;
      n.textContent = fmt === 'int' ? nfInt.format(v)
        : fmt === 'money' ? shekel(v)
        : fmt === 'money2' ? shekel2(v)
        : fmt === 'pct' ? pct(v)
        : fmt === 'date' ? parseDate(v).toLocaleDateString('fr-FR')
        : v;
    });
  }

  function renderJourney() {
    var orgs = {};
    (D.organizations || []).forEach(function (o) { orgs[o.key] = o; });

    var j = el('#avt-journey');
    if (j && D.journey) {
      j.innerHTML = D.journey.map(function (st) {
        var o = orgs[st.org] || {};
        return '<div class="avt-jstep">' +
          '<div class="avt-jstep__n">' + st.n + '</div>' +
          '<div class="avt-jstep__body">' +
            '<div class="avt-jstep__head">' + st.title_ru +
              '<span class="avt-badge avt-badge--org">' + (o.name_ru || '') + '</span></div>' +
            '<div class="avt-jstep__when">Délai : ' + st.when_ru + '</div>' +
            '<p>' + st.what_ru + '</p>' +
            (st.warn_ru ? '<p class="avt-jstep__warn">' + st.warn_ru + '</p>' : '') +
          '</div></div>';
      }).join('');
    }

    var o = el('#avt-orgs');
    if (o && D.organizations) {
      o.innerHTML = D.organizations.map(function (x) {
        return '<div class="avt-org">' +
          '<div class="avt-org__name">' + x.name_ru +
            ' <span class="avt-heb">(' + x.name_he + ')</span>' +
            (x.tr ? ' <span class="avt-tr">' + x.tr + '</span>' : '') + '</div>' +
          '<p>' + x.role_ru + '</p>' +
          (x.url ? '<a href="' + x.url + '" target="_blank" rel="noopener nofollow">Site officiel →</a>' : '') +
          '</div>';
      }).join('');
    }

    var f = el('#avt-forms-table tbody');
    if (f && D.forms) {
      f.innerHTML = D.forms.map(function (x) {
        return '<tr><td><strong>' + x.code_ru + '</strong>' +
            (x.code !== x.code_ru ? ' <span class="avt-heb">' + x.code + '</span>' : '') +
            '<br><span class="avt-hint">' + x.name_ru + '</span></td>' +
          '<td>' + x.who_ru + '</td><td>' + x.to_ru + '</td>' +
          '<td>' + (x.required ? '<span class="avt-badge avt-badge--req">obligatoire</span>'
                               : '<span class="avt-badge">selon le cas</span>') + '</td>' +
          '<td>' + x.note_ru + (x.url ? ' <a href="' + x.url + '" target="_blank" rel="noopener nofollow">formulaire →</a>' : '') + '</td></tr>';
      }).join('');
    }

    var pr = el('#avt-parallel');
    if (pr && D.parallel_rights) {
      pr.innerHTML = D.parallel_rights.map(function (x) {
        return '<li><strong>' + x.name_ru + '</strong> <span class="avt-heb">(' + x.name_he + ')</span>' +
          (x.tr ? ', <span class="avt-tr">' + x.tr + '</span>' : '') + ' — ' + x.note_ru + '</li>';
      }).join('');
    }

    var lk = el('#avt-links');
    if (lk && D.links) {
      lk.innerHTML = D.links.map(function (x) {
        return '<li><a href="' + x.url + '" target="_blank" rel="noopener nofollow">' + x.title_ru + '</a></li>';
      }).join('');
    }
  }

  function renderEmployerChecklist() {
    var n = el('#avt-employer-list');
    if (!n || !D.employer_checklist) return;
    n.innerHTML = D.employer_checklist.map(function (x, i) {
      return '<li class="avt-doc' + (x.critical ? ' avt-doc--crit' : '') + '">' +
        '<input type="checkbox" id="emp' + i + '">' +
        '<label for="emp' + i + '">' +
          '<span class="avt-doc__name">' + x.item_ru +
            (x.he ? ' <span class="avt-heb">(' + x.he + ')</span>' : '') +
            (x.tr ? ' <span class="avt-tr">' + x.tr + '</span>' : '') +
            (x.critical ? ' <span class="avt-badge avt-badge--req">obligatoire</span>' : '') +
          '</span>' +
          '<span class="avt-doc__why">' + x.why_ru + '</span>' +
          '<span class="avt-doc__when">Quand : ' + x.deadline_ru + '</span>' +
        '</label></li>';
    }).join('');
    els('#avt-employer-list input').forEach(function (c) {
      var key = 'avt-emp-' + c.id;
      try { if (localStorage.getItem(key) === '1') c.checked = true; } catch (e) {}
      c.addEventListener('change', function () {
        try { localStorage.setItem(key, c.checked ? '1' : '0'); } catch (e) {}
      });
    });
  }

  function renderMeta() {
    var when = parseDate(D.updated).toLocaleDateString('fr-FR',
      { day: 'numeric', month: 'long', year: 'numeric' });
    el('#avt-updated').textContent = when;

    var a = D.auto || {}, age = days(parseDate(D.updated), new Date());
    var lines = [
      'Les taux et plafonds sont valables pour ' + D.year + '.',
      'Maximum ' + shekel2(D.caps.daily_first_period) + ' par jour les ' +
        D.rules.reduced_rate_after_day + ' premiers jours, puis ' + shekel2(D.caps.daily_after_125) + '.'
    ];
    if (D.macro && D.macro.minimum_wage_monthly) {
      lines.push('Salaire minimum ' + shekel2(D.macro.minimum_wage_monthly) + ' par mois — depuis ' +
        parseDate(D.macro.minimum_wage_since).toLocaleDateString('fr-FR') + '.');
    }
    var stale = age > 40, partial = a.ok === false;
    var head = stale
      ? 'Dernière mise à jour des données : ' + when + ' — des écarts avec le site du Bitouah Leumi sont possibles.'
      : 'Données mises à jour le ' + when + ' à partir de sources officielles.';

    el('#avt-status').innerHTML = '<div class="' + ((stale || partial) ? 'avt-warn' : 'avt-note') + '">' +
      '<strong>' + head + '</strong><br>' + lines.join('<br>') + '</div>';

    el('#avt-sources').innerHTML = D.sources.map(function (s) {
      return '<li><a href="' + s.url + '" target="_blank" rel="noopener nofollow">' + s.name + '</a>' +
        (s.role ? ' <span class="avt-hint">— ' + s.role + '</span>' : '') + '</li>';
    }).join('');
  }

  /* ═══════════ ONGLETS ═══════════ */

  function initTabs() {
    var tabs = els('.avt-tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { activate(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t);
        if (e.key === 'ArrowRight') { tabs[(i + 1) % tabs.length].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { tabs[(i - 1 + tabs.length) % tabs.length].focus(); e.preventDefault(); }
      });
    });
    activate(STATE.t || 'calc');
  }
  function activate(name) {
    els('.avt-tab').forEach(function (t) {
      t.setAttribute('aria-selected', t.getAttribute('data-tab') === name);
    });
    els('.avt-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
    var st = readState(); st.t = name; writeState(st);
  }
  function bindGoto() {
    els('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () {
        activate(b.getAttribute('data-goto'));
        el('#avt-tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initChecklist() {
    els('.avt-check input').forEach(function (c) {
      var key = 'avt-check-' + c.id;
      try { if (localStorage.getItem(key) === '1') c.checked = true; } catch (e) {}
      c.addEventListener('change', function () {
        try { localStorage.setItem(key, c.checked ? '1' : '0'); } catch (e) {}
      });
    });
  }

  /* ═══════════ DÉMARRAGE ═══════════ */

  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (json) {
      D = json;
      window.AVT = { data: D, calc: calcAll, daily: dailyBenefit, maxDays: maxDays };
      buildSteps();
      initTabs();
      renderCalc();
      renderWizard();
      renderLists();
      renderJourney();
      renderEmployerChecklist();
      renderMeta();
      initChecklist();
      bindGoto();
    })
    .catch(function (e) {
      el('#avt-status').innerHTML = '<div class="avt-warn">Impossible de charger les données (' +
        e.message + '). Vérifiez le chemin vers <code>' + DATA_URL + '</code>.</div>';
    });

  window.shareAvtala = function(platform) {
    var items = document.querySelectorAll('.avt-split__item .avt-money--small');
    var daily = items[0] ? items[0].innerText.trim() : '';
    var monthly = items[1] ? items[1].innerText.trim() : '';
    var days = items[2] ? items[2].innerText.trim() : '';
    var totalEl = document.querySelector('.avt-row--total .avt-row__v');
    var total = totalEl ? totalEl.innerText.trim() : '';

    var text = '💼 Mon calcul d’allocation de chômage (avtala) :\n' +
               '💵 Par mois (brut) : ' + monthly + '\n' +
               '📅 Jours de versement : ' + days + ' (' + daily + ' par jour)\n' +
               '💰 Total sur la période : ' + total + '\n\n' +
               'Calculateur d’allocations pour Israël : ' + window.location.href;

    if (platform === 'whatsapp') {
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
    } else if (platform === 'telegram') {
      window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(text), '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(text).then(function() {
        var b = document.getElementById('copy-avt-btn');
        if (b) {
          var old = b.innerText;
          b.innerText = '✅ Copié !';
          setTimeout(function() { b.innerText = old; }, 2000);
        }
      });
    }
  };
})();