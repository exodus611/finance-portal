
/* ═══ NOYAU — vérifié contre les données réelles de la Bitouah Leumi et la cohérence interne ═══ */
var K={kzSingle:1838, kzCouple:2762, kzVetekMax:0.50, mekademM:200, mekademF:210, feeDeposit:0.02};
function fmt(n){return Math.round(n).toLocaleString('fr-FR')}
function fvLump(P,r,n){return P*Math.pow(1+r,n)}
function fvStream(m,r,n){return r===0?m*n:m*(Math.pow(1+r,n)-1)/r}
function pmtNeeded(t,r,n){return r===0?t/n:t*r/(Math.pow(1+r,n)-1)}
function kitzva(yearsInsured,single){
  var base=single?K.kzSingle:K.kzCouple;
  var v=Math.min(K.kzVetekMax,Math.max(0,yearsInsured-10)*0.02);
  return base*(1+v);
}

document.getElementById('sex').addEventListener('change',function(){
  document.getElementById('retire').value=(this.value==='f')?65:67;
});

function drawPensionChart(points, targetLine){
  var W=640,H=260,padL=58,padR=14,padT=16,padB=30;
  var plotW=W-padL-padR, plotH=H-padT-padB;
  var vals=points.map(function(p){return p.cap});
  if(targetLine!==null)vals.push(targetLine);
  var maxV=Math.max(1,Math.max.apply(null,vals));
  function x(i){return padL+(plotW*i/(points.length-1))}
  function y(v){return padT+plotH-(plotH*v/maxV)}
  function fmtShort(n){return Math.abs(n)>=1000000?(n/1000000).toFixed(1)+'M':Math.abs(n)>=1000?Math.round(n/1000)+'K':Math.round(n)}
  var pathCap=points.map(function(p,i){return (i===0?'M':'L')+x(i)+','+y(p.cap)}).join(' ');

  var gridLines='';
  for(var g=0;g<=4;g++){
    var gv=maxV*g/4, gy=y(gv);
    gridLines+='<line x1="'+padL+'" y1="'+gy+'" x2="'+(W-padR)+'" y2="'+gy+'" stroke="var(--line)" stroke-width="1" stroke-dasharray="3,3"/>';
    gridLines+='<text x="'+(padL-8)+'" y="'+(gy+4)+'" font-size="10" fill="var(--muted)" text-anchor="end">'+fmtShort(gv)+'</text>';
  }
  var xLabels='';
  points.forEach(function(p,i){
    xLabels+='<text x="'+x(i)+'" y="'+(H-8)+'" font-size="10" fill="var(--muted)" text-anchor="middle">'+p.y+' ans</text>';
  });
  var targetSvg='';
  if(targetLine!==null){
    var ty=y(targetLine);
    targetSvg='<line x1="'+padL+'" y1="'+ty+'" x2="'+(W-padR)+'" y2="'+ty+'" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="5,4"/>'+
      '<text x="'+(W-padR)+'" y="'+(ty-6)+'" font-size="10" fill="var(--gold)" text-anchor="end" font-weight="700">objectif : '+fmtShort(targetLine)+'</text>';
  }
  var dots=points.map(function(p,i){return '<circle cx="'+x(i)+'" cy="'+y(p.cap)+'" r="3.5" fill="var(--green)"/>'}).join('');

  var svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">'+
    gridLines+targetSvg+
    '<path d="'+pathCap+'" fill="none" stroke="var(--green)" stroke-width="2.5"/>'+
    dots+xLabels+
    '</svg>'+
    '<div style="display:flex;gap:16px;justify-content:center;margin-top:8px;font-size:11.5px;color:var(--muted)">'+
    '<span>🟢 Votre capital projeté</span>'+(targetLine!==null?'<span>🟡 Capital nécessaire pour l’objectif</span>':'')+'</div>';
  document.getElementById('pension-chart-wrap').innerHTML=svg;
}

function calc(){
  var age=+document.getElementById('age').value||40;
  var sex=document.getElementById('sex').value;
  var retire=+document.getElementById('retire').value||67;
  var salary=+document.getElementById('salary').value||0;
  var saved=+document.getElementById('saved').value||0;
  var pw=+document.getElementById('pw').value||0;
  var pe=+document.getElementById('pe').value||0;
  var pz=+document.getElementById('pz').value||0;
  var basePct=(+document.getElementById('base').value||100)/100;
  var pitzOut=document.getElementById('pitzOut').checked;
  var gaps=document.getElementById('gaps').checked;
  var single=document.getElementById('single').checked;
  var nom=(+document.getElementById('ret').value||5.5)/100;
  var infl=(+document.getElementById('infl').value||2)/100;
  var fee=(+document.getElementById('fee').value||0.5)/100;
  var targetPct=(+document.getElementById('target').value||70)/100;

  var years=Math.max(0,retire-age);
  if(years<=0){alert('L’âge de départ doit être supérieur à l’âge actuel');return}

  var realGross=(1+nom)/(1+infl)-1;
  var real=realGross-fee;
  var rm=real/12;
  var mekadem=(sex==='f')?K.mekademF:K.mekademM;

  var rate=(pw+pe+(pitzOut?0:pz))/100;
  var gapFactor=gaps?0.90:1.0;
  var contrib=salary*basePct*gapFactor*rate*(1-K.feeDeposit);

  var fv1=fvLump(saved,real,years);
  var fv2=fvStream(contrib,rm,years*12);
  var total=fv1+fv2;
  var pension=total/mekadem;
  var kz=kitzva(years+Math.max(0,age-22),single);
  var income=pension+kz;
  var need=salary*targetPct;
  var gap=need-income;
  var repl=salary>0?income/salary*100:0;

  var h='';
  var cls=gap>need*0.25?'v-bad':(gap>0?'v-warn':'v-ok');
  h+='<div class="verdict '+cls+'"><div class="v-lbl">'+
     (gap>0?'Il vous manquera':'Vous êtes couvert')+'</div>'+
     '<div class="v-num">'+(gap>0?fmt(gap):fmt(-gap))+' ₪</div>'+
     '<div class="v-sub">par mois'+(gap>0?', à partir de '+retire+' ans':' — au-delà de l’objectif')+'</div></div>';

  h+='<div class="kpi">'+
    '<div class="k"><div class="n">'+fmt(income)+' ₪</div><div class="l">Revenu à la retraite</div></div>'+
    '<div class="k"><div class="n" style="color:'+(repl<50?'var(--red)':repl<65?'var(--gold)':'var(--green)')+'">'+repl.toFixed(0)+'%</div><div class="l">Taux de remplacement</div></div>'+
    '<div class="k"><div class="n">'+fmt(total)+' ₪</div><div class="l">Capital à '+retire+' ans</div></div>'+
    '</div>';

  var maxv=Math.max(need,income,1);
  h+='<div style="margin-bottom:10px"><b style="font-size:14px">Aujourd’hui et à la retraite</b><p style="font-size:12px;color:var(--muted);margin:4px 0 10px">En argent d’aujourd’hui — ajusté de l’inflation.</p></div>'+
     '<div class="barlbl"><span>Nécessaire pour le même niveau de vie</span><strong>'+fmt(need)+' ₪</strong></div>'+
     '<div class="bar"><i style="width:'+(need/maxv*100)+'%"></i><span>'+fmt(need)+' ₪</span></div>'+
     '<div class="barlbl" style="margin-top:14px"><span>Ce que vous toucherez réellement</span><strong>'+fmt(income)+' ₪</strong></div>'+
     '<div class="bar'+(income<need?' short':'')+'"><i style="width:'+(income/maxv*100)+'%"></i><span>'+fmt(income)+' ₪</span></div>';

  h+='<table style="margin-top:20px"><thead><tr><th>Source</th><th>Par mois</th></tr></thead><tbody>'+
     '<tr><td>Fonds de pension<br><span style="font-size:10.5px;color:var(--muted)">capital '+fmt(total)+' ₪ ÷ mekadem '+mekadem+'</span></td><td>'+fmt(pension)+' ₪</td></tr>'+
     '<tr><td>Kitsvat zikna (Bitouah Leumi)<br><span style="font-size:10.5px;color:var(--muted)">'+(single?'personne seule':'avec conjoint')+', avec la majoration d’ancienneté</span></td><td>'+fmt(kz)+' ₪</td></tr>'+
     '</tbody><tfoot><tr><td>Revenu total</td><td>'+fmt(income)+' ₪</td></tr></tfoot></table>';

  h+='<div style="margin-top:22px;margin-bottom:10px"><b style="font-size:14px">D’où viendra le capital</b></div>'+
     '<table><tbody>'+
     '<tr><td>Déjà épargné aujourd’hui<br><span style="font-size:10.5px;color:var(--muted)">croîtra pendant '+years+' ans à '+(real*100).toFixed(2).replace('.',',')+' % réels</span></td><td>'+fmt(fv1)+' ₪</td></tr>'+
     '<tr><td>Cotisations futures<br><span style="font-size:10.5px;color:var(--muted)">'+fmt(contrib)+' ₪/mois × '+years+' ans</span></td><td>'+fmt(fv2)+' ₪</td></tr>'+
     '</tbody><tfoot><tr><td>Capital à la retraite</td><td>'+fmt(total)+' ₪</td></tr></tfoot></table>'+
     '<p style="font-size:11.5px;color:var(--muted);margin-top:10px">Rendement réel de '+(real*100).toFixed(2).replace('.',',')+' % = '+(nom*100).toFixed(1).replace('.',',')+' % du fonds − '+(infl*100).toFixed(1).replace('.',',')+' % d’inflation − '+(fee*100).toFixed(2).replace('.',',')+' % de frais.</p>';

  h+='<div style="margin-top:22px;margin-bottom:10px"><b style="font-size:14px">Croissance du capital année par année</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">L’épargne actuelle + les cotisations futures, à intérêts composés jusqu’à la retraite.</p></div>'+
     '<div id="pension-chart-wrap"></div>';

  var needCapForChart = gap>0 ? gap*mekadem : null;

  if(gap>0){
    var needCap=gap*mekadem;
    var extra=pmtNeeded(needCap,rm,years*12);
    h+='<div style="margin-top:22px"><b style="font-size:14px">Comment combler l’écart</b></div>'+
       '<div class="note n-info" style="margin-top:10px"><b>Capital supplémentaire de '+fmt(needCap)+' ₪ nécessaire</b>'+
       'Soit '+fmt(extra)+' ₪ de plus par mois, si vous commencez maintenant et épargnez jusqu’à '+retire+' ans.</div>';

    h+='<h3>Le prix de l’attente</h3><div style="overflow:auto"><table><thead><tr><th>Si vous commencez</th><th>À épargner</th><th>Surcoût</th></tr></thead><tbody>';
    [0,1,3,5,10].forEach(function(d){
      if(years-d<=1)return;
      var e=pmtNeeded(needCap,rm,(years-d)*12);
      h+='<tr'+(d===0?' class="hl"':'')+'><td>'+(d===0?'<strong>maintenant</strong>':'dans '+d+' ans')+'</td>'+
         '<td>'+fmt(e)+' ₪/mois</td>'+
         '<td'+(d>0?' class="neg"':'')+'>'+(d===0?'—':'+'+fmt(e-extra)+' ₪/mois')+'</td></tr>';
    });
    h+='</tbody></table></div><p style="font-size:11.5px;color:var(--muted);margin-top:10px">Chaque année d’attente rend la solution plus chère. Ce n’est pas une question de discipline — c’est la mathématique des intérêts composés.</p>';
  }

  h+='<div style="margin-top:22px;margin-bottom:10px"><b style="font-size:14px">Ce qui pèse le plus</b></div>';

  if(pitzOut){
    var rateKeep=(pw+pe+pz)/100;
    var contribKeep=salary*basePct*gapFactor*rateKeep*(1-K.feeDeposit);
    var totalKeep=fv1+fvStream(contribKeep,rm,years*12);
    var diff=totalKeep-total;
    h+='<div class="note n-bad"><b>Retirer l’indemnité vous coûte '+fmt(diff)+' ₪ de capital</b>'+
       'Soit '+fmt(diff/mekadem)+' ₪ de pension par mois — pour toujours. Lors d’un licenciement, on peut laisser cette somme dans le fonds : l’argent continue de travailler, et c’est presque toujours plus avantageux.</div>';
  } else {
    h+='<div class="note n-ok"><b>Vous conservez l’indemnité — la bonne décision</b>Si vous la retiriez, le capital serait environ un tiers plus petit. Tenez cette ligne à chaque changement d’emploi.</div>';
  }

  if(pw<7){
    var rateUp=(7+pe+(pitzOut?0:pz))/100;
    var contribUp=salary*basePct*gapFactor*rateUp*(1-K.feeDeposit);
    var totalUp=fv1+fvStream(contribUp,rm,years*12);
    h+='<div class="note n-info"><b>Porter votre part de '+pw+' % à 7 %</b>'+
       'Ajoutera '+fmt(totalUp-total)+' ₪ au capital et '+fmt((totalUp-total)/mekadem)+' ₪ à la pension mensuelle. Avec un avantage fiscal en prime.</div>';
  }

  if(retire<70){
    var y2=years+3;
    var t2=fvLump(saved,real,y2)+fvStream(contrib,rm,y2*12);
    var kz2=kitzva(y2+Math.max(0,age-22),single)*1.15;
    var inc2=t2/mekadem+kz2;
    h+='<div class="note n-info"><b>Repousser le départ de 3 ans : '+fmt(inc2)+' ₪ au lieu de '+fmt(income)+' ₪</b>'+
       'Un triple effet : le capital croît, les cotisations continuent, et la Bitouah Leumi ajoute 5 % de kitsva par année de report.</div>';
  }

  var totalLowFee=fvLump(saved,realGross-0.002,years)+fvStream(contrib,(realGross-0.002)/12,years*12);
  if(fee>0.002){
    h+='<div class="note n-warn"><b>Réduire les frais de '+(fee*100).toFixed(2).replace('.',',')+' % à 0,2 %</b>'+
       'Écart de capital : '+fmt(totalLowFee-total)+' ₪. Un demi-point par an devient, sur 25 ans, des centaines de milliers de shekels.</div>';
  }

  h+='<div class="note '+(repl>=50?'n-ok':'n-warn')+'"><b>Votre taux de remplacement : '+repl.toFixed(0)+' % — le contexte</b>'+
     'Selon l’étude de l’université Ben-Gourion, le taux de remplacement moyen en Israël est de 38 % pour les hommes et 31 % pour les femmes. Le repère mondial est de 60 à 70 %. '+
     (repl>=60?'Vous êtes en bonne position.':repl>=45?'Vous êtes au-dessus de la moyenne nationale, mais sous le niveau confortable.':'Zone préoccupante — il faut agir.')+'</div>';

  document.getElementById('out').innerHTML=h;

  var pensionPoints=[];
  var pSteps=6;
  for(var pi=1;pi<=pSteps;pi++){
    var yy=Math.max(1,Math.round(years*pi/pSteps));
    var cap=fvLump(saved,real,yy)+fvStream(contrib,rm,yy*12);
    pensionPoints.push({y:age+yy, cap:cap});
  }
  var targetCapitalLine = needCapForChart!==null ? (total+needCapForChart) : null;
  drawPensionChart(pensionPoints, targetCapitalLine);
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {big:(gap>0?fmt(gap):fmt(-gap))+' ₪', sub:gap>0?'il manque par mois':'au-delà de l’objectif par mois', repl:repl.toFixed(0)+'%', income:fmt(income)+' ₪'};
}

function runAndShowModal(){
  var r = calc();
  if(!r) return;
  showResultModal(r.sub.includes('il manque')?'Il vous manquera':'Vous êtes couvert', r.big, r.sub,
    [['Revenu à la retraite', r.income], ['Taux de remplacement', r.repl]],
    '📊 Voir le plan et le prix de l’attente', function(){setActiveView('result');});
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

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
