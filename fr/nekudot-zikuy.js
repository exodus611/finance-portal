
var POINT_VALUE = 242;
var GENDER = 'm';
var children = [];
var childIdCounter = 0;

function fmt(n){return Math.round(n).toLocaleString('fr-FR')+' ₪'}

function setGender(g){
  GENDER = g;
  document.getElementById('m-man').className = g==='m'?'on':'';
  document.getElementById('m-woman').className = g==='w'?'on':'';
}

function addChild(){
  var id = 'c'+(childIdCounter++);
  children.push({id:id, age:6});
  renderChildren();
}
function removeChild(id){
  children = children.filter(function(c){return c.id!==id});
  renderChildren();
}
function updateChildAge(id, age){
  var c = children.find(function(c){return c.id===id});
  if(c) c.age = +age;
}
function renderChildren(){
  var box = document.getElementById('childrenList');
  box.innerHTML = children.map(function(c){
    return '<div class="child-row">'+
      '<span style="font-size:12.5px;color:var(--muted)">Enfant</span>'+
      '<select onchange="updateChildAge(\''+c.id+'\',this.value)">'+
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(function(a){
          return '<option value="'+a+'"'+(a===c.age?' selected':'')+'>'+a+' ans</option>';
        }).join('')+
      '</select>'+
      '<button type="button" onclick="removeChild(\''+c.id+'\')" aria-label="Supprimer">✕</button>'+
    '</div>';
  }).join('') || '<p style="font-size:12px;color:var(--muted)">Aucun enfant ajouté pour l’instant</p>';
}

function toggleRecipientBox(){
  var sep = document.getElementById('isSeparated');
  // la case "bénéficiaire" reste toujours disponible ; on recalcule simplement à chaque changement
}
function toggleOlehBox(){
  document.getElementById('olehBox').style.display = document.getElementById('isOleh').checked ? 'block' : 'none';
}

// Part de chaque parent selon l’âge de l’enfant — selon Kol Zkhout (kolzchut.org.il),
// répartition NON égale : de 6 à 17 ans, la mère reçoit traditionnellement plus que le père.
function childShareByAge(age){
  if(age===0) return {mother:1, father:1, note:'année de naissance — 1 point à chaque parent (majoration distincte)'};
  if(age>=1 && age<=5) return {mother:4.5, father:0, uncertain:true, note:'1–5 ans — toute la part va généralement au bénéficiaire de l’allocation (estimation approximative, le point exact diverge selon les sources)'};
  if(age>=6 && age<=17) return {mother:2, father:1, note:'6–17 ans — les parts de la mère et du père ne sont PAS égales (avantage historique de la mère, part du père ajoutée plus tard)'};
  return {mother:0, father:0, note:''};
}

function childPointsForRecipient(age, recipientGender, isSeparated, isCustodial){
  var share = childShareByAge(age);
  if(!isSeparated){
    // Famille ordinaire : tous les points de l’enfant vont au bénéficiaire de l’allocation
    var mine = recipientGender==='w' ? (share.mother+share.father===0?0:Math.max(share.mother,share.father)) : share.father;
    // Si le bénéficiaire est la mère, elle reçoit sa part (généralement la plus grande) ; si c’est le père, la sienne
    mine = recipientGender==='w' ? share.mother : share.father;
    return {points: mine, note: share.note, uncertain: share.uncertain};
  } else {
    // Résidence séparée : le parent gardien reçoit les DEUX parts, l’autre parent seulement la sienne
    if(isCustodial) return {points: share.mother+share.father, note: share.note+' (le parent gardien reçoit les deux parts)', uncertain: share.uncertain};
    return {points: recipientGender==='w'?share.mother:share.father, note: share.note+' (sa part seulement)', uncertain: share.uncertain};
  }
}

function olehPoints(olehDateStr){
  if(!olehDateStr) return {points:0, monthsSince:0, stage:'—', scheme:''};
  var olehDate = new Date(olehDateStr+'T00:00:00Z');
  var now = new Date();
  var monthsSince = (now.getFullYear()-olehDate.getFullYear())*12 + (now.getMonth()-olehDate.getMonth());
  if(monthsSince < 0) monthsSince = 0;
  var reformCutoff = new Date('2022-01-01T00:00:00Z');
  var isPost2022 = olehDate >= reformCutoff;
  var points = 0, stage = '';

  if(!isPost2022){
    // Régime classique — 42 mois (pour les alya avant le 1.1.2022)
    if(monthsSince <= 18){ points = 4.5*(monthsSince/18); stage = 'les 18 premiers mois (4,5 points sur la période)'; }
    else if(monthsSince <= 30){ points = 4.5 + 2*((monthsSince-18)/12); stage = 'année suivante (+2 points)'; }
    else if(monthsSince <= 42){ points = 4.5+2 + 1*((monthsSince-30)/12); stage = 'dernière année de l’avantage (+1 point)'; }
    else { points = 0; stage = 'la période d’avantage (42 mois) est terminée'; }
  } else {
    // Régime étendu depuis 2022 — 54 mois (amendement n° 262)
    if(monthsSince <= 12){ points = 1 * (monthsSince/12); stage = '1ʳᵉ année (1 point par année pleine)'; }
    else if(monthsSince <= 30){ points = 1 + 4.5*((monthsSince-12)/18); stage = 'mois 13–30 (4,5 points sur la période)'; }
    else if(monthsSince <= 42){ points = 1+4.5+2*((monthsSince-30)/12); stage = 'année suivante (+2 points, estimation)'; }
    else if(monthsSince <= 54){ points = 1+4.5+2+1*((monthsSince-42)/12); stage = 'dernière année de l’avantage (+1 point, estimation)'; }
    else { points = 0; stage = 'la période d’avantage (54 mois) est terminée'; }
  }
  return {points: points, monthsSince: monthsSince, stage: stage, isPost2022: isPost2022};
}

function calc(){
  var isWoman = GENDER==='w';
  var base = isWoman ? 2.75 : 2.25;
  var rows = [['Point de base'+(isWoman?' + point de femme':''), base]];
  var total = base;

  var isRecipient = document.getElementById('isRecipient').checked;
  var isSeparated = document.getElementById('isSeparated').checked;
  var hasUncertainChild = false;

  if(!isRecipient && !isSeparated){
    rows.push(['Enfants — l’allocation est perçue par le conjoint', 0]);
  } else {
    children.forEach(function(c, i){
      var cp = childPointsForRecipient(c.age, GENDER, isSeparated, isRecipient);
      if(cp.uncertain) hasUncertainChild = true;
      if(cp.points>0){
        rows.push(['Enfant '+(i+1)+' ('+c.age+' ans) — '+cp.note, cp.points]);
        total += cp.points;
      } else {
        rows.push(['Enfant '+(i+1)+' ('+c.age+' ans) — '+cp.note, 0]);
      }
    });
  }

  var isOleh = document.getElementById('isOleh').checked;
  var olehInfo = null;
  if(isOleh){
    olehInfo = olehPoints(document.getElementById('olehDate').value);
    if(olehInfo.points>0){
      rows.push(['Oleh ('+olehInfo.stage+')', olehInfo.points]);
      total += olehInfo.points;
    }
  }

  if(document.getElementById('hasDegree').checked){ rows.push(['Diplôme (licence)', 1]); total += 1; }
  if(document.getElementById('isVeteran').checked){ rows.push(['Démobilisé (estimation)', 2]); total += 2; }
  if(document.getElementById('isSingleParent').checked){ rows.push(['Parent isolé', 1]); total += 1; }
  if(document.getElementById('isDivorcedAlimony').checked){ rows.push(['Divorce avec pension alimentaire', 1]); total += 1; }
  if(document.getElementById('hasNonWorkingSpouse').checked){ rows.push(['Conjoint sans emploi', 1]); total += 1; }

  var monthlySum = total * POINT_VALUE;
  var annualSum = monthlySum * 12;

  var h = '<div class="verdict"><div class="v-lbl">Vos points de crédit</div>'+
    '<div class="v-num">'+total.toFixed(2).replace('.', ',')+'</div>'+
    '<div class="v-sub">= '+fmt(monthlySum)+' par mois non imposés</div></div>';

  h += '<div class="kpi">'+
    '<div class="k"><div class="n">'+fmt(monthlySum)+'</div><div class="l">Économie par mois</div></div>'+
    '<div class="k"><div class="n">'+fmt(annualSum)+'</div><div class="l">Économie par an</div></div>'+
    '</div>';

  h += '<table><thead><tr><th>Motif</th><th>Points</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h += '<tr><td>'+r[0]+'</td><td'+(r[1]>0?' class="pos"':'')+'>'+(r[1]>0?'+':'')+r[1].toFixed(2).replace('.', ',')+'</td></tr>';
  });
  h += '</tbody><tfoot><tr><td>Total</td><td>'+total.toFixed(2).replace('.', ',')+'</td></tr></tfoot></table>';

  h += '<div style="margin-top:20px"><b style="font-size:14px">Comment toucher cet argent</b></div><div style="margin-top:10px">';
  h += '<div class="note n-info"><b>Remplissez la forme 101 auprès de votre employeur</b>En début d’année (ou à l’embauche), indiquez tous vos motifs dans la forme 101 — c’est le seul moyen pour que l’employeur applique les bons points. Des points « sur le papier » ne servent à rien si l’employeur ne les connaît pas.</div>';

  if(!isRecipient && !isSeparated && children.length>0){
    h += '<div class="note n-warn"><b>Les points enfants ne vous reviennent pas</b>Vous avez indiqué que l’allocation enfant est perçue par votre conjoint(e) — les points enfants sont donc à lui/elle, pas à vous. Pour les recevoir à votre nom, une demande de changement de bénéficiaire peut être déposée.</div>';
  }
  if(hasUncertainChild){
    h += '<div class="note n-warn"><b>Enfants de 1 à 5 ans — vérifiez le point exact</b>C’est la partie du système la plus souvent corrigée : même les sites comptables professionnels en Israël divergent sur les détails des années 1 à 5. Nous affichons une estimation prudente. Consultez le simulateur officiel du service des impôts ou demandez à un comptable, pour ne rien perdre ni trop payer.</div>';
  }
  if(isOleh && olehInfo && olehInfo.monthsSince>54){
    h += '<div class="note n-info"><b>La période d’avantage de l’oleh est déjà terminée</b>Plus de 54 mois (4,5 ans) se sont écoulés depuis l’alya — plus de points supplémentaires pour l’alya, seulement le point de base du résident.</div>';
  }
  h += '<div class="note n-ok"><b>Si des points n’ont pas été utilisés les années passées</b>Les points oubliés (par exemple pour un diplôme ou un enfant) peuvent être récupérés via une déclaration de restitution d’impôt — jusqu’à 6 ans en arrière.</div>';
  h += '</div>';

  document.getElementById('out').innerHTML = h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {total: total, monthlySum: monthlySum, annualSum: annualSum};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Vos points de crédit', r.total.toFixed(2).replace('.', ',')+' points', 'Soit '+fmt(r.monthlySum)+' par mois',
    [['Économie par mois', fmt(r.monthlySum)], ['Économie par an', fmt(r.annualSum)]],
    '📊 Voir le détail', function(){setActiveView('result');});
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

addChild();
document.getElementById('childrenList').lastElementChild;
children[0].age = 8;
renderChildren();
document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
