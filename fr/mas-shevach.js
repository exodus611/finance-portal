
var CEILING = 5008000;
var RATE = 0.25;
var LINEAR_CUTOFF = new Date('2014-01-01T00:00:00Z');

function fmt(n){return Math.round(n).toLocaleString('fr-FR')}
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

  // Étape 1 : calcul linéaire préférentiel (appartements achetés avant 2014)
  var totalDays = daysBetween(buyDate, sellDate) || 1;
  var preDays = 0;
  var isPre2014 = buyDate < LINEAR_CUTOFF;
  if(isPre2014){
    preDays = Math.min(totalDays, daysBetween(buyDate, LINEAR_CUTOFF));
  }
  var linearExemptFraction = preDays / totalDays;
  var linearExemptAmount = grossProfit * linearExemptFraction;
  var profitAfterLinear = grossProfit - linearExemptAmount;

  // Étape 2 : plafond d’exonération de la résidence unique — appliqué au profit RESTANT (non exonéré linéairement)
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
  h+='<div class="verdict '+(isZeroTax?'':'v-tax')+'"><div class="v-lbl">'+(isZeroTax?'Impôt à payer':'Impôt à payer')+'</div>'+
     '<div class="v-num">'+fmt(tax)+' ₪</div>'+
     '<div class="v-sub">sur '+fmt(grossProfit)+' ₪ de profit · taux effectif '+effRate.toFixed(1).replace('.',',')+' %</div></div>';

  h+='<div class="kpi">'+
    '<div class="k"><div class="n" style="color:var(--green)">'+fmt(totalExempt)+' ₪</div><div class="l">Exonéré d’impôt</div></div>'+
    '<div class="k"><div class="n" style="color:var(--red)">'+fmt(taxableProfit)+' ₪</div><div class="l">Imposable</div></div>'+
    '<div class="k"><div class="n">'+fmt(grossProfit)+' ₪</div><div class="l">Profit total</div></div>'+
    '</div>';

  var exPct = grossProfit>0 ? (totalExempt/grossProfit*100) : 100;
  h+='<div style="margin-bottom:6px"><b style="font-size:13px">Exonéré / imposable</b></div>'+
     '<div class="bar"><i class="ex" style="width:'+exPct+'%"></i><i class="tx" style="width:'+(100-exPct)+'%"></i></div>'+
     '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:16px"><span>🟢 '+fmt(totalExempt)+' ₪ exonéré</span><span>🔴 '+fmt(taxableProfit)+' ₪ imposable</span></div>';

  h+='<table><thead><tr><th>Étape du calcul</th><th>Montant</th></tr></thead><tbody>'+
     '<tr><td>Profit brut (vente − achat − dépenses)</td><td>'+fmt(grossProfit)+' ₪</td></tr>';
  if(isPre2014){
    h+='<tr><td>Exonéré par le calcul linéaire (avant 2014)<br><span style="font-size:10.5px;color:var(--muted)">'+Math.round(linearExemptFraction*100)+' % de la période de détention</span></td><td class="pos">'+fmt(linearExemptAmount)+' ₪</td></tr>';
  }
  if(isSingle){
    h+='<tr><td>Exonéré par le plafond de la résidence unique<br><span style="font-size:10.5px;color:var(--muted)">'+(sellPrice<=CEILING?'prix de vente sous le plafond — exonération totale':'au prorata jusqu’au plafond de '+fmt(CEILING)+' ₪')+'</span></td><td class="pos">'+fmt(ceilingExemptAmount)+' ₪</td></tr>';
  }
  h+='</tbody><tfoot><tr><td>Imposable × 25 %</td><td class="neg">'+fmt(tax)+' ₪</td></tr></tfoot></table>';

  h+='<div style="margin-top:22px"><b style="font-size:14px">À prendre en compte</b></div><div style="margin-top:10px">';

  if(!isSingle){
    h+='<div class="note n-warn"><b>Ce n’est pas une résidence unique — le plafond d’exonération ne s’applique pas</b>Sans le statut de résidence unique, tout le profit (hors avantage linéaire, s’il s’applique) est imposé. Vérifiez si vous ne remplissez pas tout de même les conditions : une part jusqu’à 1/3 dans un autre bien, ou 1/2 dans un bien hérité, ne fait pas perdre le statut.</div>';
  } else if(sellPrice > CEILING){
    h+='<div class="note n-warn"><b>Prix de vente au-dessus du plafond — exonération partielle</b>Le plafond de '+fmt(CEILING)+' ₪ est gelé jusqu’au 15.01.2028. La part du profit correspondant au dépassement du plafond est imposée — ce n’est pas une erreur, c’est la règle légale pour l’immobilier cher.</div>';
  } else {
    h+='<div class="note n-ok"><b>Exonération totale par le plafond de la résidence unique</b>Le prix de vente ne dépasse pas 5 008 000 ₪ — tout le profit restant (non exonéré linéairement) est totalement exonéré.</div>';
  }

  if(isPre2014){
    h+='<div class="note n-info"><b>Appartement acheté avant 2014 — l’avantage linéaire est appliqué</b>'+Math.round(linearExemptFraction*100)+' % de la durée de détention tombe avant 2014 — cette part du profit est exonérée quel que soit le statut de résidence unique.</div>';
  }

  if(isHighIncome && tax>0){
    h+='<div class="note n-warn"><b>Un mas yesef additionnel (5 %) est possible</b>Si votre revenu annuel global de l’année de vente dépasse le seuil de haut revenu, 5 % supplémentaires peuvent s’ajouter à la part imposable — le taux effectif passera de 25 % à 30 %. Le montant exact est calculé par le Missouy Mekarka’in, en tenant compte de tous vos revenus de l’année.</div>';
  }

  if(tax===0 && grossProfit>0){
    h+='<div class="note n-ok"><b>Impôt à payer : 0 ₪</b>Tout le profit est exonéré. N’oubliez pas de déposer quand même une déclaration de vente — l’exonération s’obtient officiellement, elle ne tombe pas automatiquement.</div>';
  }

  h+='</div>';

  document.getElementById('out').innerHTML=h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {tax:tax, grossProfit:grossProfit, totalExempt:totalExempt, effRate:effRate.toFixed(1)+'%'};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Impôt sur la plus-value (mas shevach)', fmt(r.tax)+' ₪', 'Sur '+fmt(r.grossProfit)+' ₪ de profit',
    [['Exonéré d’impôt', fmt(r.totalExempt)+' ₪'], ['Taux effectif', r.effRate]],
    '📊 Voir le détail par étapes', function(){setActiveView('result');});
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
    ov.innerHTML='<div class="result-modal"><div class="result-modal-head"><h3 id="rm-title"></h3><button class="result-modal-close" onclick="closeResultModal()">✕</button></div><div class="result-modal-big" id="rm-big"></div><div class="result-modal-sub" id="rm-sub"></div><div class="result-modal-rows" id="rm-rows"></div><div class="result-modal-actions"><button class="rm-secondary" onclick="closeResultModal()">Fermer</button><button class="rm-primary" id="rm-action-btn"></button></div></div>';
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
  var MN=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
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
