
var CEILING = 5008000;
var RATE = 0.25;
var LINEAR_CUTOFF = new Date('2014-01-01T00:00:00Z');

function fmt(n){return Math.round(n).toLocaleString('en-US')}
function daysBetween(a,b){return Math.max(0,(b-a)/(1000*60*60*24))}

function calc(){
  var buyPrice = +document.getElementById('buyPrice').value||0;
  var sellPrice = +document.getElementById('sellPrice').value||0;
  var expenses = +document.getElementById('expenses').value||0;
  var buyDateStr = document.getElementById('buyDate').value;
  var sellDateStr = document.getElementById('sellDate').value || new Date().toISOString().slice(0,10);
  var isSingle = document.getElementById('isSingle').checked;
  var isHighIncome = document.getElementById('isHighIncome').checked;

  var buyDate = new Date(buyDateStr+'T00:00:00Z');
  var sellDate = new Date(sellDateStr+'T00:00:00Z');

  var grossProfit = Math.max(0, sellPrice - buyPrice - expenses);

  // Шаг 1: линейный льготный расчёт (для квартир to 2014 года)
  var totalDays = daysBetween(buyDate, sellDate) || 1;
  var preDays = 0;
  var isPre2014 = buyDate < LINEAR_CUTOFF;
  if(isPre2014){
    preDays = Math.min(totalDays, daysBetween(buyDate, LINEAR_CUTOFF));
  }
  var linearExemptFraction = preDays / totalDays;
  var linearExemptAmount = grossProfit * linearExemptFraction;
  var profitAfterLinear = grossProfit - linearExemptAmount;

  // Шаг 2: потолок освобождения для единственной квартиры — применяется к ОСТАВШЕЙСЯ (не освобождённой линейно) прибыли
  var ceilingExemptFraction = 0;
  if(isSingle){
    ceilingExemptFraction = sellPrice > 0 ? Math.min(1, CEILING/sellPrice) : 1;
  }
  var ceilingExemptAmount = profitAfterLinear * ceilingExemptFraction;
  var taxableProfit = profitAfterLinear - ceilingExemptAmount;

  var tax = taxableProfit * RATE;
  var totalExempt = linearExemptAmount + ceilingExemptAmount;
  var effRate = grossProfit>0 ? (tax/grossProfit*100) : 0;

  var h='';
  var isZeroTax = tax<=0;
  h+='<div class="verdict '+(isZeroTax?'':'v-tax')+'"><div class="v-lbl">'+(isZeroTax?'Tax payable':'Tax payable')+'</div>'+
     '<div class="v-num">'+fmt(tax)+' ₪</div>'+
     '<div class=\"v-sub\">from'+fmt(grossProfit)+'₪ profit · effective rate'+effRate.toFixed(1)+'%</div></div>';

  h+='<div class="kpi">'+
    '<div class="k"><div class="n" style="color:var(--green)">'+fmt(totalExempt)+' ₪</div><div class="l">Exempt from tax</div></div>'+
    '<div class="k"><div class="n" style="color:var(--red)">'+fmt(taxableProfit)+' ₪</div><div class="l">Taxable</div></div>'+
    '<div class="k"><div class="n">'+fmt(grossProfit)+' ₪</div><div class="l">Profit total</div></div>'+
    '</div>';

  var exPct = grossProfit>0 ? (totalExempt/grossProfit*100) : 100;
  h+='<div style="margin-bottom:6px"><b style="font-size:13px">Exempt/taxed</b></div>'+
     '<div class="bar"><i class="ex" style="width:'+exPct+'%"></i><i class="tx" style="width:'+(100-exPct)+'%"></i></div>'+
     '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:16px"><span>🟢 '+fmt(totalExempt)+'₪ free</span><span>🔴'+fmt(taxableProfit)+'₪ taxable</span></div>';

  h+='<table><thead><tr><th>Calculation stage</th><th>Sum</th></tr></thead><tbody>'+
     '<tr><td>Gross profit (sales - purchases - expenses)</td><td>'+fmt(grossProfit)+' ₪</td></tr>';
  if(isPre2014){
    h+='<tr><td>Exempted by linear calculation (until 2014)<br><span style="font-size:10.5px;color:var(--muted)">'+Math.round(linearExemptFraction*100)+'% of holding period</span></td><td class=\"pos\">'+fmt(linearExemptAmount)+' ₪</td></tr>';
  }
  if(isSingle){
    h+='<tr><td>Vacated along the ceiling of the only apartment<br><span style="font-size:10.5px;color:var(--muted)">'+(sellPrice<=CEILING?'sale price within the ceiling - fully exempt':'proportionally to the ceiling'+fmt(CEILING)+' ₪')+'</span></td><td class="pos">'+fmt(ceilingExemptAmount)+' ₪</td></tr>';
  }
  h+='</tbody><tfoot><tr><td>Taxed × 25%</td><td class="neg">'+fmt(tax)+' ₪</td></tr></tfoot></table>';

  h+='<div style="margin-top:22px"><b style="font-size:14px">What to consider</b></div><div style="margin-top:10px">';

  if(!isSingle){
    h+='<div class="note n-warn"><b>This is not the only apartment - the exemption ceiling does not apply</b>Without single dwelling status, all profits (less linear benefit, if applicable) are taxable. Check whether you still fit the conditions of a single apartment - a share of up to 1/3 in another or up to 1/2 in an inherited one does not deprive you of your status.</div>';
  } else if(sellPrice > CEILING){
    h+='<div class=\"note n-warn\"><b>Sale price above ceiling - partial exemption</b>Ceiling'+fmt(CEILING)+'₪ frozen until 01/15/2028. The part of the profit attributable to the excess of the ceiling is taxed - this is not a mistake, but a rule of law for expensive real estate.</div>';
  } else {
    h+='<div class="note n-ok"><b>Complete clearance along the ceiling of a single apartment</b>The sale price does not exceed 5,008,000 ₪ - all remaining (not linearly exempt) profit is completely exempt from tax.</div>';
  }

  if(isPre2014){
    h+='<div class="note n-info"><b>The apartment was purchased before 2014 - linear benefit applied</b>'+Math.round(linearExemptFraction*100)+'% of the tenure period occurred before 2014 - this part of the profit is exempt regardless of the status of the only apartment.</div>';
  }

  if(isHighIncome && tax>0){
    h+='<div class="note n-warn"><b>Additional extra tax possible (5%)</b>If your total annual income in the year of sale exceeds the high income threshold, another 5% may be added to the taxable portion - the effective rate will increase from 25% to 30%. The exact amount is calculated by Misui Mekarkein, taking into account all your income for the year.</div>';
  }

  if(tax===0 && grossProfit>0){
    h+='<div class="note n-ok"><b>Tax payable – 0 ₪</b>All profits are released. Don\'t forget to file a declaration of sale anyway - the exemption is formalized and not automatic.</div>';
  }

  h+='</div>';

  document.getElementById('out').innerHTML=h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {tax:tax, grossProfit:grossProfit, totalExempt:totalExempt, effRate:effRate.toFixed(1)+'%'};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Income tax (mas shevah)', fmt(r.tax)+' ₪', 'From'+fmt(r.grossProfit)+'₪ profit',
    [['Exempt from tax', fmt(r.totalExempt)+' ₪'], ['Effective rate', r.effRate]],
    '📊 See breakdown by stages', function(){setActiveView('result');});
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

(function initDateSelects(){
  var MN=['January','February','March','April','May','June','July','August','September','October','november','December'];
  var now=new Date(), curY=now.getFullYear(), curM=now.getMonth()+1;
  function fill(mSel,ySel,hidden,defY,defM){
    var m=document.getElementById(mSel), y=document.getElementById(ySel), h=document.getElementById(hidden);
    if(!m||!y||!h) return;
    for(var i=0;i<12;i++){var o=document.createElement('option');o.value=i+1;o.textContent=MN[i];m.appendChild(o);}
    for(var yy=curY;yy>=1960;yy--){var o2=document.createElement('option');o2.value=yy;o2.textContent=yy;y.appendChild(o2);}
    m.value=defM; y.value=defY;
    function sync(){
      var mm=(''+m.value).length<2?'0'+m.value:m.value;
      h.value=y.value+'-'+mm+'-01';
    }
    m.addEventListener('change',sync); y.addEventListener('change',sync); sync();
  }
  fill('buyMonth','buyYear','buyDate',2012,6);
  fill('sellMonth','sellYear','sellDate',curY,curM);
})();
document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
