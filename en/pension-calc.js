
/* ==========================================================================
   ISRAEL PENSION ADVISOR CALCULATION ENGINE (2026)
   Exact Actuarial & Tax Standard (Capital Market Authority & BTL 345b)
   ========================================================================== */

const CURRENT_YEAR = 2026;

// Эталонная актуарная база Микадема для одиноких (минимальный возраст 60 years)
const MALE_BASE_TABLE = {
  60: 194.81, 61: 191.13, 62: 187.45, 63: 183.61, 64: 179.60,
  65: 175.60, 66: 171.37, 67: 167.14, 68: 162.70, 69: 158.18, 70: 153.65,
  71: 149.15, 72: 144.65, 73: 140.15, 74: 135.65, 75: 131.15
};

const FEMALE_BASE_TABLE = {
  60: 207.00, 61: 203.46, 62: 199.92, 63: 196.21, 64: 192.33,
  65: 188.45, 66: 184.33, 67: 180.21, 68: 175.90, 69: 171.45, 70: 167.00,
  71: 162.50, 72: 158.00, 73: 153.50, 74: 149.00, 75: 144.50
};

// Официальная таблица ступеней реформы для женщин (תיקון מס' 8 לחוק גיל פרישה)
function getFemaleOfficialAgeByYear(birthYear){
  if(birthYear <= 1959) return { age: 62.0, label: "62 years old" };
  if(birthYear === 1960) return { age: 62 + 4/12, label: "62 years and 4 months" };
  if(birthYear === 1961) return { age: 62 + 8/12, label: "62 years and 8 months" };
  if(birthYear === 1962) return { age: 63.0, label: "63 years old" };
  if(birthYear === 1963) return { age: 63 + 3/12, label: "63 years and 3 months" };
  if(birthYear === 1964) return { age: 63 + 6/12, label: "63 years and 6 months" };
  if(birthYear === 1965) return { age: 63 + 9/12, label: "63 years and 9 months" };
  if(birthYear === 1966) return { age: 64.0, label: "64 years old" };
  if(birthYear === 1967) return { age: 64 + 3/12, label: "64 years and 3 months" };
  if(birthYear === 1968) return { age: 64 + 6/12, label: "64 years and 6 months" };
  if(birthYear === 1969) return { age: 64 + 9/12, label: "64 years and 9 months" };
  return { age: 65.0, label: "65 years old" };
}

let state = {
  gender: 'm',
  marital: 'single',
  withdrewSeverance: false
};

function onBirthYearChange(){
  if(state.gender === 'f') {
    updateFemaleOfficialAge();
  }
  updateQuickButtons();
  calc();
}

function updateQuickButtons(){
  const userBirthYear = parseInt(document.getElementById('user-birth-year').value) || 1966;
  const offData = state.gender === 'm' ? { age: 67, label: '67 years old' } : getFemaleOfficialAgeByYear(userBirthYear);
  const container = document.getElementById('quick-buttons-container');
  
  let ages = state.gender === 'm' ? [60, 62, 63, 65, 67, 70] : [60, 62, 63, Math.round(offData.age), 65, 70];
  ages = [...new Set(ages)].sort((a,b) => a - b);

  container.innerHTML = ages.map(age => {
    const isOff = Math.abs(age - offData.age) < 0.2;
    const label = isOff ? `${Math.round(age)} years (official)` : `${age} years`;
    return `<button type="button" class="age-btn" data-age="${age}" onclick="setQuickRetAge(${age})">${label}</button>`;
  }).join('');

  const curRet = parseFloat(document.getElementById('ret-age').value) || 63;
  updateQuickChips(curRet);
}

function onRetAgeChange(){
  let retVal = parseFloat(document.getElementById('ret-age').value) || 63;
  if(retVal < 60) retVal = 60;
  updateQuickChips(retVal);
  calc();
}

function setQuickRetAge(age){
  if(age < 60) age = 60;
  document.getElementById('ret-age').value = age;
  updateQuickChips(age);
  calc();
}

function updateQuickChips(age){
  document.querySelectorAll('.age-quick-grid .age-btn').forEach(btn => {
    const btnAge = parseFloat(btn.getAttribute('data-age') || btn.textContent);
    btn.classList.toggle('active', Math.abs(btnAge - age) < 0.2);
  });
}

function updateFemaleOfficialAge(){
  const bYear = parseInt(document.getElementById('user-birth-year').value) || 1966;
  const data = getFemaleOfficialAgeByYear(bYear);
  document.getElementById('official-age-label').textContent = `Official age: ${data.label}`;
}

function setGender(g){
  state.gender = g;
  document.querySelectorAll('#gender-seg .seg-btn').forEach((b, idx) => {
    b.classList.toggle('active', (g==='m' && idx===0) || (g==='f' && idx===1));
  });

  if(g === 'f') {
    updateFemaleOfficialAge();
  } else {
    document.getElementById('official-age-label').textContent = 'Official age: 67 years old';
  }
  updateQuickButtons();
  calc();
}

function setMarital(m){
  state.marital = m;
  document.querySelectorAll('#marital-seg .seg-btn').forEach((b, idx) => {
    b.classList.toggle('active', (m==='married' && idx===0) || (m==='single' && idx===1));
  });
  document.getElementById('spouse-age-wrap').style.display = (m==='married') ? 'flex' : 'none';
  
  if(m === 'single') {
    document.getElementById('spouse-pension-pct').value = '0';
    document.getElementById('guarantee-months').value = '0';
  } else {
    document.getElementById('spouse-pension-pct').value = '60';
    document.getElementById('guarantee-months').value = '240';
  }
  calc();
}

function setSeverance(val){
  state.withdrewSeverance = val;
  document.querySelectorAll('#severance-seg .seg-btn').forEach((b, idx) => {
    b.classList.toggle('active', (!val && idx===0) || (val && idx===1));
  });
  document.getElementById('severance-sum-wrap').style.display = val ? 'flex' : 'none';
  calc();
}

function toggleCustomMikadem(){
  const isCustom = document.getElementById('custom-mikadem-toggle').checked;
  document.getElementById('custom-mikadem-wrap').style.display = isCustom ? 'block' : 'none';
  calc();
}

/* Точный расчет Микадема (from 60 years) */
function getMikadem(retAge, gender, isMarried, spousePct, guaranteeMonths, spouseAgeDiffYears){
  const isCustom = document.getElementById('custom-mikadem-toggle') && document.getElementById('custom-mikadem-toggle').checked;
  const customVal = parseFloat(document.getElementById('custom-mikadem-input') ? document.getElementById('custom-mikadem-input').value : 0);
  if(isCustom && customVal >= 100) {
    return customVal;
  }

  const tbl = (gender === 'm') ? MALE_BASE_TABLE : FEMALE_BASE_TABLE;
  let base = 0;

  if(retAge in tbl) {
    base = tbl[retAge];
  } else if(retAge < 60) {
    base = tbl[60] + (60 - retAge) * 3.8;
  } else if(retAge > 75) {
    base = tbl[75] - (retAge - 75) * 4.5;
  } else {
    const floorA = Math.floor(retAge);
    const ceilA = floorA + 1;
    const frac = retAge - floorA;
    const baseFloor = tbl[floorA] || tbl[60];
    const baseCeil = tbl[ceilA] || tbl[70];
    base = baseFloor * (1 - frac) + baseCeil * frac;
  }

  if(!isMarried || spousePct === 0) {
    let gAdj = 0;
    if(guaranteeMonths === 240) gAdj = 12.0;
    else if(guaranteeMonths === 180) gAdj = 8.0;
    else if(guaranteeMonths === 120) gAdj = 5.0;
    else if(guaranteeMonths === 60) gAdj = 2.0;
    return base + gAdj;
  } else {
    let sAdj = 0;
    if(spousePct === 60) sAdj = 22.0;
    else if(spousePct === 100) sAdj = 34.0;
    else if(spousePct === 30) sAdj = 11.0;

    let gAdj = 0;
    if(guaranteeMonths === 240) gAdj = 6.0;
    else if(guaranteeMonths === 180) gAdj = 4.0;
    else if(guaranteeMonths === 120) gAdj = 2.0;

    let diffAdj = (spouseAgeDiffYears - 3) * 0.75;
    return base + sAdj + gAdj + diffAdj;
  }
}

/* Расчет пособия «Эзрах Ватик» Битуах Леуми */
function getBtlAllowance(retAge, gender, seniority, aliyahAge, marital, userBirthYear){
  const officialAge = (gender === 'm') ? 67.0 : getFemaleOfficialAgeByYear(userBirthYear).age;
  
  if(retAge < officialAge - 0.05) {
    return { btlTotal: 0, isEligible: false, base: 0, seniorityAdd: 0, deferralAdd: 0, officialAge };
  }

  let base = (marital === 'married') ? 2610 : 1736;
  let extraYears = Math.max(0, seniority - 10);
  let seniorityPct = Math.min(50, extraYears * 2);
  let seniorityAdd = base * (seniorityPct / 100);

  let deferralYears = Math.max(0, Math.floor(retAge - officialAge));
  let deferralPct = Math.min(25, deferralYears * 5);
  let deferralAdd = (base + seniorityAdd) * (deferralPct / 100);

  let btlTotal = base + seniorityAdd + deferralAdd;

  return {
    btlTotal: Math.round(btlTotal),
    isEligible: true,
    base: base,
    seniorityPct: seniorityPct,
    seniorityAdd: Math.round(seniorityAdd),
    deferralPct: deferralPct,
    deferralAdd: Math.round(deferralAdd),
    officialAge
  };
}

/* Удержания Битуах Леуми и Дмей Бриаут (ст. 345б) */
function calcBtlHealthDeductions(grossPension, retAge, officialAge){
  if(retAge >= officialAge - 0.01) {
    return { btl: 0, health: 0, total: 0, isExempt: true };
  }

  const threshold = 7522;
  let btl = 0;
  let health = 0;

  if(grossPension <= threshold) {
    btl = grossPension * 0.0039;
    health = grossPension * 0.0310;
  } else {
    btl = (threshold * 0.0039) + ((grossPension - threshold) * 0.0679);
    health = (threshold * 0.0310) + ((grossPension - threshold) * 0.0500);
  }

  return {
    btl: Math.round(btl),
    health: Math.round(health),
    total: Math.round(btl + health),
    isExempt: false
  };
}

/* Расчет подоходного налога (Мас Ахнаса — ст. 9а) */
function calcPensionTax(grossPension, retAge, officialAge, gender, isKibuaDone, withdrewSeverance, severanceSum){
  let exemptCeiling = 0;
  const isEligibleForKibua = (retAge >= officialAge - 0.01);

  if(isEligibleForKibua && isKibuaDone) {
    exemptCeiling = 4950;
    if(withdrewSeverance && severanceSum > 0) {
      const monthlyPenalty = (severanceSum * 1.35) / 180;
      exemptCeiling = Math.max(0, exemptCeiling - monthlyPenalty);
    }
  }

  let taxableGross = Math.max(0, grossPension - exemptCeiling);
  if(taxableGross <= 0) return { tax: 0, exemptCeiling: Math.round(exemptCeiling), isEligibleForKibua };

  let rawTax = 0;
  if(taxableGross <= 7010) {
    rawTax = taxableGross * 0.10;
  } else if(taxableGross <= 10060) {
    rawTax = 7010 * 0.10 + (taxableGross - 7010) * 0.14;
  } else if(taxableGross <= 16150) {
    rawTax = 7010 * 0.10 + (10060 - 7010) * 0.14 + (taxableGross - 10060) * 0.20;
  } else if(taxableGross <= 22440) {
    rawTax = 7010 * 0.10 + (10060 - 7010) * 0.14 + (16150 - 10060) * 0.20 + (taxableGross - 16150) * 0.31;
  } else if(taxableGross <= 46690) {
    rawTax = 7010 * 0.10 + (10060 - 7010) * 0.14 + (16150 - 10060) * 0.20 + (22440 - 16150) * 0.31 + (taxableGross - 22440) * 0.35;
  } else {
    rawTax = 7010 * 0.10 + (10060 - 7010) * 0.14 + (16150 - 10060) * 0.20 + (22440 - 16150) * 0.31 + (46690 - 22440) * 0.35 + (taxableGross - 46690) * 0.47;
  }

  const creditPointsVal = (gender === 'm' ? 2.25 : 2.75) * 242;
  const finalTax = Math.max(0, rawTax - creditPointsVal);

  return { tax: Math.round(finalTax), exemptCeiling: Math.round(exemptCeiling), isEligibleForKibua };
}

function fmt(num){
  return Math.round(num).toLocaleString('en-US');
}

function selectScenarioAge(age){
  if(age < 60) age = 60;
  document.getElementById('ret-age').value = age;
  updateQuickChips(age);
  calc();
  window.scrollTo({ top: document.querySelector('.age-selector-box').offsetTop - 20, behavior: 'smooth' });
}

function calc(){
  const userBirthYear = parseInt(document.getElementById('user-birth-year').value) || 1966;
  const curAgeEst = CURRENT_YEAR - userBirthYear;
  document.getElementById('cur-age-calc-hint').textContent = `Current age: ~${curAgeEst} years`;

  let retAge = parseFloat(document.getElementById('ret-age').value) || 63;
  if(retAge < 60) retAge = 60;

  const curCapital = parseFloat(document.getElementById('cur-capital').value) || 0;
  const lumpSum = parseFloat(document.getElementById('lump-sum').value) || 0;
  const seniority = parseInt(document.getElementById('israel-seniority').value) || 0;
  const aliyahAge = parseInt(document.getElementById('aliyah-age').value) || 0;
  const isMarried = (state.marital === 'married');
  const spousePct = isMarried ? (parseInt(document.getElementById('spouse-pension-pct').value) || 60) : 0;
  const guaranteeMonths = parseInt(document.getElementById('guarantee-months').value) || 0;

  const spouseBirthYear = parseInt(document.getElementById('spouse-birth-year').value) || userBirthYear;
  const spouseDiffYears = spouseBirthYear - userBirthYear;

  let spouseText = '';
  if(spouseDiffYears === 0) {
    spouseText = `Spouses born in the same year (born ${spouseBirthYear})`;
  } else if(spouseDiffYears > 0) {
    spouseText = `Spouse is ${spouseDiffYears} years younger (born ${spouseBirthYear})`;
  } else {
    spouseText = `Spouse is ${Math.abs(spouseDiffYears)} years older (born ${spouseBirthYear})`;
  }
  document.getElementById('spouse-diff-hint').textContent = spouseText;

  const offAgeData = state.gender === 'm' ? { age: 67, label: '67 years old' } : getFemaleOfficialAgeByYear(userBirthYear);
  const officialAge = offAgeData.age;
  const offAgeLabel = offAgeData.label;

  const isEarlyRetirement = (retAge < officialAge - 0.05);

  // ШАГ 3: БЛОКИРОВКА ПОСОБИЯ «ЭЗРАХ ВАТИК» БИТУАХ ЛЕУМИ ПРИ РАННЕМ ВЫХОДЕ
  const btlBadge = document.getElementById('btl-status-badge');
  const btlEarlyLockMsg = document.getElementById('btl-early-lock-msg');
  const btlLockAgeLbl = document.getElementById('btl-lock-age-lbl');
  const btlInputsGrid = document.getElementById('btl-inputs-grid');
  const btlActiveMsg = document.getElementById('btl-active-msg');
  const seniorityInput = document.getElementById('israel-seniority');
  const aliyahInput = document.getElementById('aliyah-age');

  if(isEarlyRetirement) {
    btlBadge.className = 'kibua-badge-lock';
    btlBadge.innerHTML = '🔒 Blocked (only with' + offAgeLabel + ')';
    btlEarlyLockMsg.style.display = 'block';
    btlLockAgeLbl.textContent = offAgeLabel;
    btlInputsGrid.style.opacity = '0.45';
    btlInputsGrid.style.pointerEvents = 'none';
    seniorityInput.disabled = true;
    aliyahInput.disabled = true;
    btlActiveMsg.style.display = 'none';
  } else {
    btlBadge.className = 'kibua-badge-ok';
    btlBadge.innerHTML = '✅ Available (from' + offAgeLabel + ')';
    btlEarlyLockMsg.style.display = 'none';
    btlInputsGrid.style.opacity = '1';
    btlInputsGrid.style.pointerEvents = 'auto';
    seniorityInput.disabled = false;
    aliyahInput.disabled = false;
    btlActiveMsg.style.display = 'block';
  }

  // ШАГ 5: БЛОКИРОВКА КИБУА ЗХУЙОТ (161д)
  const kibuaCheckbox = document.getElementById('kibua-done');
  const kibuaLabel = document.getElementById('kibua-checkbox-label');
  const kibuaBadge = document.getElementById('kibua-status-badge');
  const kibuaSubdesc = document.getElementById('kibua-subdesc');
  const severanceBlock = document.getElementById('severance-block');
  const kibuaLockOffAge = document.getElementById('kibua-lock-off-age');

  if(isEarlyRetirement) {
    kibuaCheckbox.checked = false;
    kibuaCheckbox.disabled = true;
    kibuaLabel.classList.add('disabled');
    kibuaBadge.className = 'kibua-badge-lock';
    kibuaBadge.innerHTML = '🔒 Blocked (only with' + offAgeLabel + ')';
    kibuaSubdesc.innerHTML = '<span style=\"color:var(--red);font-weight:700\">❌ Not available with early exit (' + retAge + 'years).</span> According to the law (Article 9a), basket 161d is not available until' + offAgeLabel + '.';
    severanceBlock.style.opacity = '0.4';
    severanceBlock.style.pointerEvents = 'none';
    document.getElementById('kibua-age-warning').style.display = 'block';
    if(kibuaLockOffAge) kibuaLockOffAge.textContent = offAgeLabel;
    document.getElementById('kibua-warning').style.display = 'none';
    document.getElementById('kibua-success').style.display = 'none';
  } else {
    kibuaCheckbox.disabled = false;
    kibuaLabel.classList.remove('disabled');
    kibuaBadge.className = 'kibua-badge-ok';
    kibuaBadge.innerHTML = '✅ Available (from' + offAgeLabel + ')';
    kibuaSubdesc.innerHTML = 'Entitles you to a tax-free basket of up to ~4,950 ₪/month, exempting your pension from income tax.';
    severanceBlock.style.opacity = '1';
    severanceBlock.style.pointerEvents = 'auto';
    document.getElementById('kibua-age-warning').style.display = 'none';
    document.getElementById('kibua-warning').style.display = kibuaCheckbox.checked ? 'none' : 'block';
    document.getElementById('kibua-success').style.display = kibuaCheckbox.checked ? 'block' : 'none';
  }

  const isKibuaDone = kibuaCheckbox.checked && !isEarlyRetirement;
  const severanceSum = state.withdrewSeverance ? (parseFloat(document.getElementById('severance-sum').value) || 0) : 0;

  const effectiveCapital = Math.max(0, curCapital - lumpSum);
  const mikadem = getMikadem(retAge, state.gender, isMarried, spousePct, guaranteeMonths, spouseDiffYears);
  const fundPensionGross = Math.round(effectiveCapital / mikadem);

  const btl = getBtlAllowance(retAge, state.gender, seniority, aliyahAge, state.marital, userBirthYear);
  
  // Подоходный налог (Мас Ахнаса)
  const taxRes = calcPensionTax(fundPensionGross, retAge, officialAge, state.gender, isKibuaDone, state.withdrewSeverance, severanceSum);
  const pensionTax = taxRes.tax;

  // Битуах Леуми и Здоровье с ранней пенсии (ст. 345б)
  const btlHealth = calcBtlHealthDeductions(fundPensionGross, retAge, officialAge);
  
  const totalDeductions = pensionTax + btlHealth.total;
  const fundPensionNet = Math.max(0, fundPensionGross - totalDeductions);

  const totalNet = fundPensionNet + btl.btlTotal;
  const totalGross = fundPensionGross + btl.btlTotal;

  document.getElementById('total-net-sum').textContent = fmt(totalNet) + '₪ / month';
  
  let deductionsNote = '';
  if(isEarlyRetirement) {
    deductionsNote = `Deductions: -${fmt(totalDeductions)} ₪ (Income tax: ${fmt(pensionTax)} ₪ · Social Security/Health: ${fmt(btlHealth.total)} ₪)`;
  } else if(totalDeductions === 0) {
    deductionsNote = `100% tax exemption (from ${offAgeLabel} with Kibua Zhuyot)`;
  } else {
    deductionsNote = `Income tax: ${fmt(pensionTax)} ₪ (Bituach/Health: 0 ₪)`;
  }

  document.getElementById('total-gross-sub').textContent = `Gross: ${fmt(totalGross)} ₪ · ${deductionsNote}`;

  document.getElementById('res-fund-pension').textContent = fmt(fundPensionGross) + '₪ / month';
  document.getElementById('res-capital-at-ret').textContent = `Capital: ${fmt(curCapital)} ₪`;

  document.getElementById('res-total-deductions').textContent = totalDeductions > 0 ? `-${fmt(totalDeductions)} ₪ / month` : '0 ₪ (exempt)';
  document.getElementById('res-deductions-details').textContent = isEarlyRetirement 
    ? `Tax: ${fmt(pensionTax)} ₪ · Social Security + Health: ${fmt(btlHealth.total)} ₪`
    : `From ${offAgeLabel}, social insurance = 0 ₪ · Tax = ${fmt(pensionTax)} ₪`;

  if(btl.isEligible) {
    document.getElementById('res-btl-sum').textContent = fmt(btl.btlTotal) + '₪ / month';
    document.getElementById('res-btl-details').textContent = `Base: ${fmt(btl.base)} ₪ + seniority: +${btl.seniorityPct}%`;
  } else {
    document.getElementById('res-btl-sum').textContent = `0 ₪ (until ${offAgeLabel})`;
    document.getElementById('res-btl-details').textContent = 'The Ezrach Vatik benefit will begin at the official age';
  }

  // Обновление Микадема в шаге 1 и 4
  document.getElementById('top-mikadem-val').textContent = mikadem.toFixed(2);
  const immediatePer100k = Math.round(100000 / mikadem);
  if(document.getElementById('top-pension-per-100k')) {
    document.getElementById('top-pension-per-100k').textContent = fmt(immediatePer100k) + '₪ / month';
  }

  document.getElementById('dyn-ret-age-label').textContent = retAge + ' years';
  document.getElementById('mikadem-val').textContent = mikadem.toFixed(2);
  document.getElementById('pension-per-100k').textContent = fmt(immediatePer100k) + '₪ / month';

  // ЧЕТКОЕ СТРУКТУРИРОВАННОЕ ОБЪЯСНЕНИЕ В ШАГЕ 1
  const ageHintWrap = document.getElementById('ret-age-hint-wrap');
  if(ageHintWrap) {
    if(retAge < officialAge - 0.1) {
      ageHintWrap.className = 'age-hint-box age-hint-early';
      ageHintWrap.innerHTML = `
        <div class="age-hint-title">⚠️ Early retirement (${retAge} years; official age ${offAgeLabel}):</div>
        <div class="age-hint-text">
          • <b>Old age benefit (“Ezrach Vatik”):</b> Payments from Bituach Leumi will begin only upon reaching <b>${offAgeLabel}</b>.<br>
          • <b>Deductions from the pension fund:</b> Until ${offAgeLabel}, standard income tax and health care/social security contributions are withheld from the pension (Article 345b).
        </div>
      `;
    } else if(retAge > officialAge + 0.1) {
      const deferYears = Math.floor(retAge - officialAge);
      const deferBonus = Math.min(25, deferYears * 5);
      ageHintWrap.className = 'age-hint-box age-hint-defer';
      ageHintWrap.innerHTML = `
        <div class="age-hint-title">🌟 Delayed retirement (${retAge} years):</div>
        <div class="age-hint-text">
          • <b>Bonus for deferment (“Ezrach Vatik”):</b> Bituach Leumi adds +${deferBonus}% (+5% for each year) to the benefit for deferral after ${offAgeLabel}.<br>
          • <b>Maximum pension:</b> The reduced divisor (mikadem = ${mikadem.toFixed(2)}) provides the maximum monthly payout.
        </div>
      `;
    } else {
      ageHintWrap.className = 'age-hint-box age-hint-official';
      ageHintWrap.innerHTML = `
        <div class="age-hint-title">✅ Official retirement age (“Gil Prisha Mezake” - ${offAgeLabel}):</div>
        <div class="age-hint-text">
          • <b>Old age benefit:</b> Bituach Leumi begins monthly payment of Ezrach Vatik benefits.<br>
          • <b>Tax benefits:</b> A 100% exemption from income tax on form 161d (Kibua Zhuyot) and a complete exemption from Bituach Leumi (National Insurance) contributions from the fund\'s pension come into force.
        </div>
      `;
    }
  }

  const senBonus = Math.min(50, Math.max(0, seniority - 10) * 2);
  document.getElementById('seniority-bonus-desc').textContent = `Supplement to the Ezrach Vatik benefit for length of service: +${senBonus}%`;
  
  if(aliyahAge >= 60 || seniority < 10) {
    document.getElementById('low-income-alert').style.display = 'block';
  } else {
    document.getElementById('low-income-alert').style.display = 'none';
  }

  renderScenarios(curCapital, seniority, aliyahAge, isMarried, spousePct, guaranteeMonths, spouseDiffYears, isKibuaDone, severanceSum, retAge, userBirthYear, officialAge);
}

function renderScenarios(curCapital, seniority, aliyahAge, isMarried, spousePct, guaranteeMonths, spouseDiffYears, isKibuaDone, severanceSum, selectedRetAge, userBirthYear, officialAge){
  const tbody = document.getElementById('scenarios-body');
  tbody.innerHTML = '';

  let testAges = [60, 62, 63, 65, officialAge, 70];
  if(state.gender === 'f') {
    testAges.push(64);
  }
  if(!testAges.includes(selectedRetAge) && selectedRetAge >= 60) {
    testAges.push(selectedRetAge);
  }
  testAges = [...new Set(testAges)].filter(a => a >= 60).sort((a,b) => a - b);

  testAges.forEach(age => {
    const mik = getMikadem(age, state.gender, isMarried, spousePct, guaranteeMonths, spouseDiffYears);
    const fundGross = Math.round(curCapital / mik);
    const btlObj = getBtlAllowance(age, state.gender, seniority, aliyahAge, state.marital, userBirthYear);
    
    // В таблице сценариев для возрастов >= officialAge кибуа применяется автоматически
    const isKibuaForAge = (age >= officialAge - 0.05);
    const taxRes = calcPensionTax(fundGross, age, officialAge, state.gender, isKibuaForAge, state.withdrewSeverance, severanceSum);
    const btlHealth = calcBtlHealthDeductions(fundGross, age, officialAge);
    
    const totalDeds = taxRes.tax + btlHealth.total;
    const net = (fundGross - totalDeds) + btlObj.btlTotal;

    const tr = document.createElement('tr');
    if(Math.abs(age - selectedRetAge) < 0.2) tr.classList.add('highlight');
    tr.onclick = () => selectScenarioAge(age);

    const isOff = Math.abs(age - officialAge) < 0.1;
    const ageLabel = Number.isInteger(age) ? `${age} years` : `${Math.floor(age)} years and ${Math.round((age%1)*12)} months`;

    let taxCol = taxRes.tax === 0 ? `<span style="color:var(--green)">0 ₪</span>` : `<span style="color:var(--red)">-${fmt(taxRes.tax)} ₪</span>`;
    let btlHealthCol = btlHealth.total === 0 ? `<span style="color:var(--green)">0 ₪</span>` : `<span style="color:var(--red)">-${fmt(btlHealth.total)} ₪</span>`;

    tr.innerHTML = `
      <td><b>${ageLabel}</b> ${isOff ? '⚖️' : ''} ${Math.abs(age - selectedRetAge) < 0.2 ? '★' : ''}</td>
      <td><b style="color:#2b6cb0;font-size:12px">${mik.toFixed(2)}</b></td>
      <td>${fmt(curCapital)} ₪</td>
      <td>${fmt(fundGross)} ₪</td>
      <td>${taxCol}</td>
      <td>${btlHealthCol}</td>
      <td>${btlObj.isEligible ? fmt(btlObj.btlTotal) + ' ₪' : `<span style="color:var(--muted)">0 ₪ (until ${Math.floor(officialAge)})</span>`}</td>
      <td><b style="color:var(--green)">${fmt(net)} ₪/month</b></td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateQuickButtons();
  calc();
});
