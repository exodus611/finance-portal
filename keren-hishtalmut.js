
/* ═══ ПРОВЕРЕННЫЕ КОНСТАНТЫ 2026 (не путать два потолка самозанятых!) ═══ */
var EMPLOYEE_SALARY_CAP = 15712;      // потолок зарплаты для льготного взноса наёмного
var SELF_DEDUCTION_INCOME_CAP = 293397; // потолок дохода для вычета (4.5%)
var SELF_DEDUCTION_MAX = 13203;       // максимальный вычет из подоходного налога
var SELF_CGT_EXEMPT_CAP = 20566;      // потолок освобождения от налога на прирост капитала
var CGT_RATE = 0.25;

var STATUS = 'employee';

function fmt(n){return Math.round(n).toLocaleString('ru-RU')}
function fv(monthlyDeposit, monthlyRate, months){
  if(monthlyRate<=0) return monthlyDeposit*months;
  return monthlyDeposit*((Math.pow(1+monthlyRate,months)-1)/monthlyRate);
}

function setStatus(s){
  STATUS=s;
  document.getElementById('m-emp').className = s==='employee'?'on':'';
  document.getElementById('m-self').className = s==='self'?'on':'';
  document.getElementById('empBox').style.display = s==='employee'?'block':'none';
  document.getElementById('selfBox').style.display = s==='self'?'block':'none';
}

function calc(){
  var ret=(+document.getElementById('ret').value||0)/100;
  var fee=(+document.getElementById('fee').value||0)/100;
  var years=+document.getElementById('years').value||1;
  var netAnnual=Math.max(0, ret-fee);
  var netMonthly=netAnnual/12;
  var months=years*12;

  var annualDeposit=0, deductibleAmount=0, taxDeductionInfo='';
  var h='';

  if(STATUS==='employee'){
    var salary=+document.getElementById('salary').value||0;
    var cappedSalary=Math.min(salary, EMPLOYEE_SALARY_CAP);
    var monthlyDeposit=cappedSalary*0.10;
    annualDeposit=monthlyDeposit*12;
    var isOverCap = salary>EMPLOYEE_SALARY_CAP;

    var totalDeposited=monthlyDeposit*months;
    var futureValue=fv(monthlyDeposit, netMonthly, months);
    var profit=futureValue-totalDeposited;
    var taxSaved=profit*CGT_RATE;

    var plainFV = totalDeposited + (futureValue-totalDeposited)*(1-CGT_RATE);

    h+='<div class="verdict"><div class="v-lbl">Фонд через '+years+' лет</div>'+
       '<div class="v-num">'+fmt(futureValue)+' ₪</div>'+
       '<div class="v-sub">внесено '+fmt(totalDeposited)+' ₪ · доход '+fmt(profit)+' ₪ · весь доход без налога</div></div>';

    h+='<div class="kpi">'+
      '<div class="k"><div class="n">'+fmt(monthlyDeposit)+' ₪</div><div class="l">Взнос в месяц (вы+работодатель)</div></div>'+
      '<div class="k"><div class="n" style="color:var(--green)">'+fmt(taxSaved)+' ₪</div><div class="l">Экономия на налоге на прирост</div></div>'+
      '<div class="k"><div class="n">'+fmt(futureValue-plainFV)+' ₪</div><div class="l">Больше, чем обычный счёт</div></div>'+
      '</div>';

    if(isOverCap){
      h+='<div class="note n-warn"><b>Зарплата выше потолка</b>Взнос считается только с '+fmt(EMPLOYEE_SALARY_CAP)+' ₪ из ваших '+fmt(salary)+' ₪ — часть зарплаты сверх потолка в льготный расчёт не попадает.</div>';
    }
    h+='<div class="note n-ok"><b>Весь инвестиционный доход освобождён от налога</b>При условии, что деньги не тронуты первые 6 лет. Обычный счёт с тем же доходом отдал бы государству '+fmt(taxSaved)+' ₪ в виде налога на прирост капитала.</div>';

  } else {
    var income=+document.getElementById('income').value||0;
    var deposit=+document.getElementById('selfDeposit').value||0;

    var maxDeductibleBase = Math.min(income, SELF_DEDUCTION_INCOME_CAP)*0.045;
    var deductiblePart = Math.min(deposit, maxDeductibleBase, SELF_DEDUCTION_MAX);
    var cgtExemptPart = Math.min(deposit, SELF_CGT_EXEMPT_CAP);
    var overCgtCap = Math.max(0, deposit - SELF_CGT_EXEMPT_CAP);

    var monthlyDeposit = deposit/12;
    var totalDeposited = deposit*years;
    var futureValue = fv(monthlyDeposit, netMonthly, months);
    var profit = futureValue - totalDeposited;

    var exemptFraction = deposit>0 ? cgtExemptPart/deposit : 0;
    var taxSaved = profit*exemptFraction*CGT_RATE;
    var plainFV = totalDeposited + profit*(1-CGT_RATE);

    h+='<div class="verdict"><div class="v-lbl">Фонд через '+years+' лет</div>'+
       '<div class="v-num">'+fmt(futureValue)+' ₪</div>'+
       '<div class="v-sub">внесено '+fmt(totalDeposited)+' ₪ · доход '+fmt(profit)+' ₪</div></div>';

    h+='<div class="kpi">'+
      '<div class="k"><div class="n">'+fmt(deductiblePart)+' ₪</div><div class="l">Признано вычетом из налога</div></div>'+
      '<div class="k"><div class="n" style="color:var(--green)">'+fmt(cgtExemptPart)+' ₪</div><div class="l">Освобождено от налога на прирост</div></div>'+
      '<div class="k"><div class="n" style="color:var(--green)">'+fmt(taxSaved)+' ₪</div><div class="l">Экономия за '+years+' лет</div></div>'+
      '</div>';

    h+='<table><thead><tr><th>Потолок</th><th>Сумма/год</th><th>Что даёт</th></tr></thead><tbody>'+
       '<tr><td>Вычет из налога (4.5% дохода)</td><td>'+fmt(SELF_DEDUCTION_MAX)+' ₪</td><td class="pos">'+fmt(deductiblePart)+' ₪ признано</td></tr>'+
       '<tr><td>Освобождение от налога на прирост</td><td>'+fmt(SELF_CGT_EXEMPT_CAP)+' ₪</td><td class="pos">'+fmt(cgtExemptPart)+' ₪ из взноса</td></tr>'+
       '</tbody></table>';

    if(deposit>SELF_CGT_EXEMPT_CAP){
      h+='<div class="note n-warn"><b>Взнос выше потолка на '+fmt(overCgtCap)+' ₪</b>Эта часть взноса не получает льготу по налогу на прирост капитала — только стандартное налогообложение как у обычного вложения. Обычно нет смысла вносить больше '+fmt(SELF_CGT_EXEMPT_CAP)+' ₪ в год.</div>';
    } else if(deposit>SELF_DEDUCTION_MAX+1 && deposit<=SELF_CGT_EXEMPT_CAP){
      h+='<div class="note n-info"><b>Часть взноса не даёт вычет, но даёт освобождение от налога на прирост</b>Сумма сверх '+fmt(SELF_DEDUCTION_MAX)+' ₪ не уменьшает подоходный налог сейчас, но весь инвестиционный доход с неё всё равно будет освобождён от налога через 6 лет — это осознанный и обычно выгодный выбор.</div>';
    } else {
      h+='<div class="note n-ok"><b>Весь взнос в пределах льготного вычета</b>Вся сумма даёт и вычет из подоходного налога, и освобождение от налога на прирост капитала.</div>';
    }
    if(income>SELF_DEDUCTION_INCOME_CAP){
      h+='<div class="note n-info"><b>Ваш доход выше потолка для вычета ('+fmt(SELF_DEDUCTION_INCOME_CAP)+' ₪)</b>Максимальный вычет в любом случае ограничен '+fmt(SELF_DEDUCTION_MAX)+' ₪ — увеличение дохода дальше не даёт больше вычета.</div>';
    }
  }

  document.getElementById('out').innerHTML=h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {big:fmt(document.querySelector('.v-num')?document.querySelector('.v-num').textContent.replace(/[^\d]/g,''):0), h:h};
}

function runAndShowModal(){
  calc();
  var big = document.querySelector('.v-num').textContent;
  var sub = document.querySelector('.v-sub').textContent;
  var kpis = [].slice.call(document.querySelectorAll('.k'));
  var rows = kpis.map(function(k){return [k.querySelector('.l').textContent, k.querySelector('.n').textContent];});
  showResultModal('Ваш фонд через ' + document.getElementById('years').value + ' лет', big, sub, rows, '📊 Смотреть полную разбивку', function(){setActiveView('result');});
}
document.getElementById('run-btn').addEventListener('click', runAndShowModal);

function buildViewPanelsSafe(){
  var inputMain = document.querySelectorAll('main.shell')[0];
  var hiddenMain = document.getElementById('hidden-source');
  var inputCard = inputMain.querySelector('section.card');
  var hiddenCards = [].slice.call(hiddenMain.querySelectorAll(':scope > section.card'));

  var panelInput = document.createElement('div'); panelInput.id='view-panel-input'; panelInput.className='view-panel active';
  panelInput.appendChild(inputCard);

  var panelResult = document.createElement('div'); panelResult.id='view-panel-result'; panelResult.className='view-panel';
  hiddenCards[0].id='results-wrap';
  panelResult.appendChild(hiddenCards[0]);

  var panelExplain = document.createElement('div'); panelExplain.id='view-panel-explain'; panelExplain.className='view-panel';
  panelExplain.appendChild(hiddenCards[1]);

  inputMain.appendChild(panelInput);
  inputMain.appendChild(panelResult);
  inputMain.appendChild(panelExplain);
  hiddenMain.remove();
}
function setActiveView(name){
  document.querySelectorAll('.view-panel').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.view-tab').forEach(function(t){t.classList.remove('active');});
  var panel=document.getElementById('view-panel-'+name), tab=document.getElementById('tab-'+name);
  if(panel) panel.classList.add('active');
  if(tab) tab.classList.add('active');
  document.getElementById('view-tabs').scrollIntoView({behavior:'smooth',block:'start'});
}
function showResultModal(title,bigValue,subText,rowsArr,actionLabel,actionFn){
  var ov=document.getElementById('result-modal-overlay');
  if(!ov){
    ov=document.createElement('div');ov.id='result-modal-overlay';ov.className='result-modal-overlay';
    ov.innerHTML='<div class="result-modal"><div class="result-modal-head"><h3 id="rm-title"></h3><button class="result-modal-close" onclick="closeResultModal()">✕</button></div><div class="result-modal-big" id="rm-big"></div><div class="result-modal-sub" id="rm-sub"></div><div class="result-modal-rows" id="rm-rows"></div><div class="result-modal-actions"><button class="rm-secondary" onclick="closeResultModal()">Закрыть</button><button class="rm-primary" id="rm-action-btn"></button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){if(e.target===ov)closeResultModal();});
  }
  document.getElementById('rm-title').textContent=title;
  var bigEl=document.getElementById('rm-big');
  if(bigValue){bigEl.textContent=bigValue;bigEl.style.display='';}else{bigEl.style.display='none';}
  document.getElementById('rm-sub').textContent=subText;
  document.getElementById('rm-rows').innerHTML=(rowsArr||[]).map(function(r){return '<div class="result-modal-row"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('');
  var actBtn=document.getElementById('rm-action-btn');
  if(actionLabel){actBtn.style.display='';actBtn.textContent=actionLabel;actBtn.onclick=function(){closeResultModal();(actionFn||function(){})();};}
  else{actBtn.style.display='none';}
  ov.classList.add('show');
}
function closeResultModal(){var ov=document.getElementById('result-modal-overlay');if(ov)ov.classList.remove('show');}

(function(){
  var btn = document.getElementById('scrollToTop');
  window.addEventListener('scroll', function(){ btn.style.display = window.scrollY > 400 ? 'block' : 'none'; });
  btn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
})();

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
