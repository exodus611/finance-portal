
/* ═══ TESTED CONSTANTS 2026 (do not confuse the two self-employed ceilings!) ═══ */
var EMPLOYEE_SALARY_CAP = 15712;      // salary cap для льготного взноса наёмного
var SELF_DEDUCTION_INCOME_CAP = 293397; // потолок дохода для вычета (4.5%)
var SELF_DEDUCTION_MAX = 13203;       // максимальный вычет из подоходного налога
var SELF_CGT_EXEMPT_CAP = 20566;      // потолок освобождения from налога на прирост капитала
var CGT_RATE = 0.25;

var STATUS = 'employee';

function fmt(n){return Math.round(n).toLocaleString('en-US')}
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

    h+='<div class=\"verdict\"><div class=\"v-lbl\">Fund through'+years+'years</div>'+
       '<div class="v-num">'+fmt(futureValue)+' ₪</div>'+
       '<div class=\"v-sub\">submitted'+fmt(totalDeposited)+'₪ · income'+fmt(profit)+'₪ · all income without tax</div></div>';

    h+='<div class="kpi">'+
      '<div class="k"><div class="n">'+fmt(monthlyDeposit)+' ₪</div><div class="l">Contribution per month (you + employer)</div></div>'+
      '<div class="k"><div class="n" style="color:var(--green)">'+fmt(taxSaved)+' ₪</div><div class="l">Savings on gains tax</div></div>'+
      '<div class="k"><div class="n">'+fmt(futureValue-plainFV)+' ₪</div><div class="l">More than a regular bill</div></div>'+
      '</div>';

    if(isOverCap){
      h+='<div class=\"note n-warn\"><b>Salary above the ceiling</b>The contribution is calculated only from'+fmt(EMPLOYEE_SALARY_CAP)+'₪ from yours'+fmt(salary)+'₪ - part of the salary above the ceiling is not included in the preferential calculation.</div>';
    }
    h+='<div class=\"note n-ok\"><b>All investment income is exempt tax</b>Provided that the money is not touched for the first 6 years. A regular account with the same income would be given to the state'+fmt(taxSaved)+'₪ in the form of capital gains tax.</div>';

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

    h+='<div class=\"verdict\"><div class=\"v-lbl\">Fund through'+years+'years</div>'+
       '<div class="v-num">'+fmt(futureValue)+' ₪</div>'+
       '<div class=\"v-sub\">submitted'+fmt(totalDeposited)+'₪ · income'+fmt(profit)+' ₪</div></div>';

    h+='<div class="kpi">'+
      '<div class="k"><div class="n">'+fmt(deductiblePart)+' ₪</div><div class="l">Recognized as a tax deduction</div></div>'+
      '<div class="k"><div class="n" style="color:var(--green)">'+fmt(cgtExemptPart)+' ₪</div><div class="l">Exempt from gains tax</div></div>'+
      '<div class="k"><div class="n" style="color:var(--green)">'+fmt(taxSaved)+'₪</div><div class=\"l\">Savings for'+years+'years</div></div>'+
      '</div>';

    h+='<table><thead><tr><th>Ceiling</th><th>Amount/year</th><th>What does it give?</th></tr></thead><tbody>'+
       '<tr><td>Tax deduction (4.5% of income)</td><td>'+fmt(SELF_DEDUCTION_MAX)+' ₪</td><td class="pos">'+fmt(deductiblePart)+'₪ recognized</td></tr>'+
       '<tr><td>Gains tax exemption</td><td>'+fmt(SELF_CGT_EXEMPT_CAP)+' ₪</td><td class="pos">'+fmt(cgtExemptPart)+'₪ from the contribution</td></tr>'+
       '</tbody></table>';

    if(deposit>SELF_CGT_EXEMPT_CAP){
      h+='<div class=\"note n-warn\"><b>Contribution is above the ceiling by'+fmt(overCgtCap)+'₪</b>This portion of the contribution does not receive capital gains tax relief - only the standard tax treatment of a regular investment. Usually there is no point in contributing more'+fmt(SELF_CGT_EXEMPT_CAP)+'₪ per year.</div>';
    } else if(deposit>SELF_DEDUCTION_MAX+1 && deposit<=SELF_CGT_EXEMPT_CAP){
      h+='<div class=\"note n-info\"><b>Part of the contribution does not give a deduction, but gives an exemption from income tax</b>Amount in excess'+fmt(SELF_DEDUCTION_MAX)+'₪ does not reduce income tax now, but all investment income from it will still be exempt from tax in 6 years - this is an informed and usually profitable choice.</div>';
    } else {
      h+='<div class="note n-ok"><b>The entire contribution is within the limits of the preferential deduction</b>The entire amount is both deductible from income tax and exempt from capital gains tax.</div>';
    }
    if(income>SELF_DEDUCTION_INCOME_CAP){
      h+='<div class=\"note n-info\"><b>Your income is above the deduction ceiling ('+fmt(SELF_DEDUCTION_INCOME_CAP)+'₪)</b>The maximum deduction is limited in any case'+fmt(SELF_DEDUCTION_MAX)+'₪ - increasing income further does not give any more deduction.</div>';
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
  showResultModal('Your fund through' + document.getElementById('years').value + 'years', big, sub, rows, '📊 See full breakdown', function(){setActiveView('result');});
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
    ov.innerHTML='<div class="result-modal"><div class="result-modal-head"><h3 id="rm-title"></h3><button class="result-modal-close" onclick="closeResultModal()">✕</button></div><div class="result-modal-big" id="rm-big"></div><div class="result-modal-sub" id="rm-sub"></div><div class="result-modal-rows" id="rm-rows"></div><div class="result-modal-actions"><button class="rm-secondary" onclick="closeResultModal()">Close</button><button class="rm-primary" id="rm-action-btn"></button></div></div>';
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
