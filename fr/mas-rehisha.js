
/* ═══ PALIERS 2026 (gelés jusqu’au 15.01.2028) — ne pas modifier le noyau sans recalculer les tests ═══ */
var B={
  single:[[1978745,0],[2347040,.035],[6055070,.05],[20183565,.08],[null,.10]],
  additional:[[6055070,.08],[null,.10]],
  olehNew:[[1978745,0],[6055070,.005],[20183565,.08],[null,.10]],
  olehOld:[[1988090,.005],[null,.05]]
};
var DISABLED_THRESHOLD=2500000, FIRST_TIER=1978745, NONRES=.06;
var OLEH_AMENDMENT='2024-08-15';

function calcBrackets(v,tiers){
  var t=0,prev=0,rows=[];
  for(var i=0;i<tiers.length;i++){
    var cap=tiers[i][0]===null?Infinity:tiers[i][0], r=tiers[i][1];
    if(v>prev){
      var part=Math.min(v,cap)-prev, tax=part*r;
      t+=tax;
      rows.push({from:prev,to:Math.min(v,cap),rate:r,part:part,tax:tax});
      prev=cap;
    } else break;
  }
  return {total:t,rows:rows};
}
function calcDisabled(v,isSingle){
  if(isSingle&&v<=DISABLED_THRESHOLD){
    var taxable=Math.max(0,v-FIRST_TIER);
    return {total:taxable*.005,
      rows:[{from:0,to:Math.min(v,FIRST_TIER),rate:0,part:Math.min(v,FIRST_TIER),tax:0},
            {from:FIRST_TIER,to:v,rate:.005,part:taxable,tax:taxable*.005}].filter(function(r){return r.part>0})};
  }
  return {total:v*.005,rows:[{from:0,to:v,rate:.005,part:v,tax:v*.005}]};
}
function fmt(n){return Math.round(n).toLocaleString('fr-FR')}
function fmtD(d){var p=d.split('-');return p[2]+'.'+p[1]+'.'+p[0]}
function addMonths(iso,m){
  var d=new Date(iso); var day=d.getDate();
  d.setMonth(d.getMonth()+m);
  if(d.getDate()<day)d.setDate(0);
  return d.toISOString().slice(0,10);
}

document.getElementById('status').addEventListener('change',function(){
  document.getElementById('upgBox').style.display=(this.value==='upgrader')?'block':'none';
});
document.getElementById('oleh').addEventListener('change',function(){
  document.getElementById('olehBox').style.display=this.checked?'block':'none';
});

function calc(){
  var v=+document.getElementById('val').value||0;
  var st=document.getElementById('status').value;
  var isOleh=document.getElementById('oleh').checked;
  var isDis=document.getElementById('disabled').checked;
  var olehDate=document.getElementById('olehDate').value;
  var buyDate=document.getElementById('buyDate').value;
  var fromWho=document.getElementById('fromWho').value;
  var h='';

  if(st==='nonres'){
    var t=v*NONRES;
    h+='<div class="verdict"><div class="v-lbl">Impôt à l’achat</div>'+
       '<div class="v-num">'+fmt(t)+' ₪</div>'+
       '<div class="v-sub">6 % dès le premier shekel</div>'+
       '<div class="v-eff">taux effectif 6,00 %</div></div>';
    h+='<div class="note n-info"><b>Immobilier non résidentiel</b>'+
       '<span class="law" lang="he" dir="rtl">תקנה 2(1)</span> — taux unique de 6 % sur toute la valeur, sans paliers ni exonération. '+
       'Si vous achetez un terrain pour construire un logement et obtenez le permis de construire dans les 24 mois, '+
       'un remboursement de 1/6 de l’impôt versé est possible (environ '+fmt(t/6)+' ₪).</div>';
    document.getElementById('out').innerHTML=h;
    document.getElementById('results-wrap') && document.getElementById('results-wrap').classList.add('show');
    return {big:fmt(t)+' ₪', sub:'6 % — bien non résidentiel'};
  }

  var singleLike=(st==='single'||st==='upgrader');
  var routes=[];

  if(singleLike){
    var r=calcBrackets(v,B.single);
    routes.push({key:'single',name:'Résidence unique',law:'סעיף 9(ג1ג)(3)',
      desc:'paliers ordinaires du résident israélien',total:r.total,rows:r.rows});
  }
  if(st==='additional'||st==='foreign'){
    var r2=calcBrackets(v,B.additional);
    routes.push({key:'additional',name:st==='foreign'?'Résident étranger':'Appartement supplémentaire',
      law:'סעיף 9(ג1ו)',desc:'8 % dès le premier shekel, puis 10 %',total:r2.total,rows:r2.rows});
  }
  if(isOleh){
    if(singleLike){
      var r3=calcBrackets(v,B.olehNew);
      routes.push({key:'olehNew',name:'Olah — résidence unique',law:'תקנה 12א',
        desc:'en vigueur depuis le 15.08.2024',total:r3.total,rows:r3.rows});
    }
    var before=olehDate&&olehDate<OLEH_AMENDMENT;
    if(before||!singleLike){
      var r4=calcBrackets(v,B.olehOld);
      routes.push({key:'olehOld',name:'Olah — ancienne norme',law:'תקנה 12',
        desc:before?'accessible pour vous : alya avant le 15.08.2024':'ancienne rédaction',
        total:r4.total,rows:r4.rows});
    }
  }
  if(isDis){
    var r5=calcDisabled(v,singleLike);
    routes.push({key:'disabled',name:'Avantage handicapé / victime',law:'תקנה 11',
      desc:singleLike&&v<=DISABLED_THRESHOLD?'exonération jusqu’au premier palier, puis 0,5 %':'0,5 % dès le premier shekel',
      total:r5.total,rows:r5.rows});
  }

  routes.sort(function(a,b){return a.total-b.total});
  var best=routes[0];
  var eff=v>0?(best.total/v*100):0;

  h+='<div class="verdict"><div class="v-lbl">Impôt à l’achat</div>'+
     '<div class="v-num">'+fmt(best.total)+' ₪</div>'+
     '<div class="v-sub">'+best.name+'</div>'+
     '<div class="v-eff">taux effectif '+eff.toFixed(2).replace('.',',')+' % de la valeur</div></div>';

  if(routes.length>1){
    h+='<div style="margin-bottom:10px"><b style="font-size:14px">Les parcours possibles</b>'+
       '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Le calculateur choisit le plus avantageux. Un avantage fiscal n’est pas toujours meilleur que les paliers ordinaires — comparez.</p></div>';
    routes.forEach(function(rt,i){
      h+='<div class="route'+(i===0?' best':'')+'"><div><div class="nm">'+(i===0?'✓ ':'')+rt.name+'</div>'+
         '<div class="ds"><span class="law" lang="he" dir="rtl">'+rt.law+'</span> '+rt.desc+'</div></div>'+
         '<div class="vl">'+fmt(rt.total)+' ₪'+(i>0?'<div style="font-size:10.5px;font-weight:400;color:var(--muted)">+'+fmt(rt.total-best.total)+'</div>':'')+'</div></div>';
    });
  }

  h+='<div style="margin-top:20px;margin-bottom:10px"><b style="font-size:14px">Détail par paliers</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Le taux ne s’applique pas à toute la somme, mais à la part de la valeur comprise dans chaque palier.</p></div>'+
     '<div style="overflow:auto"><table><thead><tr><th>Tranche de la valeur</th><th>Taux</th><th>Montant de la tranche</th><th>Impôt</th></tr></thead><tbody>';
  best.rows.forEach(function(r){
    h+='<tr><td>'+fmt(r.from)+' – '+fmt(r.to)+'</td>'+
       '<td>'+(r.rate*100).toFixed(1).replace('.',',')+' %</td>'+
       '<td>'+fmt(r.part)+'</td>'+
       '<td'+(r.tax===0?' class="zero"':'')+'>'+(r.tax===0?'—':fmt(r.tax))+'</td></tr>';
  });
  h+='</tbody><tfoot><tr><td colspan="3">Total de l’impôt</td><td>'+fmt(best.total)+' ₪</td></tr></tfoot></table></div>';

  h+='<div style="margin-top:22px"><b style="font-size:14px">À prendre en compte</b></div><div style="margin-top:10px">';

  if(st==='upgrader'){
    var months=(fromWho==='dev')?12:24;
    var deadline=buyDate?addMonths(buyDate,months):null;
    var addl=calcBrackets(v,B.additional).total;
    var risk=addl-best.total;
    h+='<div class="note n-bad"><b>⏳ L’essentiel : le délai de vente de l’ancien appartement</b>'+
       'Vous payez aux taux de la résidence unique <strong>à condition</strong> de vendre l’ancien appartement dans les délais. '+
       (fromWho==='dev'
         ? '<span class="law" lang="he" dir="rtl">סעיף 9(ג1ג)(2)(ב)</span> — <strong>12 mois</strong> à compter de la date à laquelle le promoteur devait vous remettre la possession selon le contrat.'
         : '<span class="law" lang="he" dir="rtl">סעיף 9(ג1ג)(2)(א)</span> — <strong>24 mois</strong> à compter de la signature du contrat.')+
       (deadline?'<br><br><strong>Votre date limite : environ '+fmtD(deadline)+'</strong>':'')+
       '<br><br>En cas de dépassement — régularisation rétroactive aux taux de l’appartement supplémentaire : '+
       '<strong>'+fmt(addl)+' ₪</strong> au lieu de '+fmt(best.total)+' ₪. Écart <strong>'+fmt(risk)+' ₪</strong>, plus intérêts et indexation.</div>';
    h+='<div class="note n-warn"><b>La règle de délai a changé trois fois</b>'+
       'Du 01.06.2023 au 31.05.2025, 18 mois s’appliquaient (norme transitoire). Depuis le 01.06.2025, retour aux 24 mois. '+
       'Une proposition de loi visant à revenir à 18 mois avance à la Knesset — avant la transaction, vérifiez la norme en vigueur auprès de votre avocat.</div>';
  }

  if(isOleh){
    if(best.key==='olehNew'){
      var vsSingle=calcBrackets(v,B.single).total;
      h+='<div class="note n-ok"><b>L’avantage de l’oleh joue en votre faveur</b>'+
         '<span class="law" lang="he" dir="rtl">תקנה 12א</span> accorde 0 % jusqu’à '+fmt(FIRST_TIER)+' ₪ et seulement 0,5 % jusqu’à '+fmt(6055070)+' ₪. '+
         'Économie par rapport aux paliers ordinaires : <strong>'+fmt(vsSingle-best.total)+' ₪</strong>.</div>';
    } else if(best.key==='single'&&routes.some(function(r){return r.key.indexOf('oleh')===0})){
      h+='<div class="note n-warn"><b>L’avantage de l’oleh n’est PAS avantageux pour vous</b>'+
         'Les paliers ordinaires de la résidence unique donnent un impôt plus faible. N’appliquez pas l’avantage automatiquement, au seul prétexte qu’il est acquis — '+
         'c’est une erreur courante et coûteuse.</div>';
    }
    if(!olehDate){
      h+='<div class="note n-info"><b>Indiquez la date de votre alya</b>'+
         'D’elle dépend la norme applicable. Pour les olim antérieurs au 15.08.2024, un choix existe entre '+
         '<span class="law" lang="he" dir="rtl">תקנה 12</span> et <span class="law" lang="he" dir="rtl">תקנה 12א</span>.</div>';
    }
    h+='<div class="note n-info"><b>Conditions de l’avantage de l’oleh</b>'+
       'Période : de l’année précédant la première entrée en Israël jusqu’à 7 ans après. Le service militaire régulier et national ne compte pas dans les 7 ans. '+
       'Nécessaires : visa d’oleh selon l’art. 2 de la Loi du retour, teoudat oleh selon l’art. 3, ou permis A1. L’avantage est accordé une seule fois.</div>';
  }

  if(isDis){
    h+='<div class="note n-info"><b>Conditions de l’avantage de la takana 11</b>'+
       'Accordé <strong>au plus deux fois dans la vie</strong>, et l’appartement doit servir de logement au titulaire. '+
       'Une attestation de la Bitouah Leumi ou du ministère de la Défense sur le taux d’incapacité est exigée.</div>';
  }

  if(st==='additional'||st==='foreign'){
    var asSingle=calcBrackets(v,B.single).total;
    h+='<div class="note n-warn"><b>Écart avec le statut de résidence unique — '+fmt(best.total-asSingle)+' ₪</b>'+
       'Si c’est votre seul appartement en Israël, ou si vous vendez celui que vous détenez — vous avez droit aux taux de la résidence unique. '+
       'À vérifier : une part jusqu’à 1/3 dans un autre appartement, ou 1/2 dans un bien hérité, <strong>ne fait pas perdre</strong> le statut.</div>';
    if(st==='foreign'){
      h+='<div class="note n-info"><b>Résident étranger devenu résident israélien</b>'+
         'Une disposition permettait à l’acheteur devenu résident dans les 27 mois suivant l’achat d’obtenir rétroactivement les taux de la résidence unique. '+
         'Vérifiez son actualité auprès de votre avocat.</div>';
    }
  }

  h+='<div class="note n-info"><b>Vérifiez la « cellule familiale »</b>'+
     '<span class="law" lang="he" dir="rtl">סעיף 9(ג)(2)(ב)(2)</span> — vous, votre conjoint et les enfants de moins de 18 ans formez <strong>un seul acheteur</strong>. '+
     'Si le conjoint possède un appartement, il compte comme le vôtre, et le statut de résidence unique est perdu.</div>';

  h+='<div class="note n-warn"><b>Délais de déclaration et de paiement</b>'+
     'Déclaration au « missouy mekarka’in » — <strong>30 jours</strong> de la signature du contrat. Paiement — <strong>60 jours</strong>. '+
     'Tout retard entraîne intérêts, indexation et amendes.</div>';

  h+='</div>';

  document.getElementById('out').innerHTML=h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {big:fmt(best.total)+' ₪', sub:best.name, eff:eff.toFixed(2).replace('.',',')+' %'};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Impôt à l’achat (mas rehisha)', r.big, r.sub,
    r.eff ? [['Taux effectif', r.eff]] : [],
    '📊 Voir le détail et les parcours', function(){setActiveView('result');});
}
document.getElementById('run-btn').addEventListener('click', runAndShowModal);

function buildViewPanelsSafe(){
  var inputMain = document.querySelectorAll('main.shell')[0];
  var hiddenMain = document.getElementById('hidden-source');
  var inputCards = [].slice.call(inputMain.querySelectorAll(':scope > section.card'));
  var hiddenCards = [].slice.call(hiddenMain.querySelectorAll(':scope > section.card'));

  var panelInput = document.createElement('div'); panelInput.id='view-panel-input'; panelInput.className='view-panel active';
  inputCards.forEach(function(c){panelInput.appendChild(c);});

  var panelResult = document.createElement('div'); panelResult.id='view-panel-result'; panelResult.className='view-panel';
  hiddenCards[0].id='results-wrap';
  panelResult.appendChild(hiddenCards[0]);

  var panelExplain = document.createElement('div'); panelExplain.id='view-panel-explain'; panelExplain.className='view-panel';
  panelExplain.appendChild(hiddenCards[1]);
  panelExplain.appendChild(hiddenCards[2]);

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

fetch('../data/rates.json',{cache:'no-cache'})
  .then(function(r){if(!r.ok)throw 0;return r.json()})
  .then(function(j){ if(j.updated){ var d=new Date(j.updated); if(!isNaN(d)) document.getElementById('p-upd').textContent=d.toLocaleDateString('fr-FR'); } })
  .catch(function(){});

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
