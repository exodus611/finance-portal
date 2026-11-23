
var POINT_VALUE = 242;
var GENDER = 'm';
var children = [];
var childIdCounter = 0;

function fmt(n){return Math.round(n).toLocaleString('en-US')+' ₪'}

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
      '<span style="font-size:12.5px;color:var(--muted)">Child</span>'+
      '<select onchange="updateChildAge(\''+c.id+'\',this.value)">'+
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(function(a){
          return '<option value="'+a+'"'+(a===c.age?' selected':'')+'>'+a+' years</option>';
        }).join('')+
      '</select>'+
      '<button type="button" onclick="removeChild(\''+c.id+'\')" aria-label="Delete">✕</button>'+
    '</div>';
  }).join('') || '<p style="font-size:12px;color:var(--muted)">No children added yet</p>';
}

function toggleRecipientBox(){
  var sep = document.getElementById('isSeparated');
  // чекбокс "recipient" всегда доступен; просто пересчитаем при изменении
}
function toggleOlehBox(){
  document.getElementById('olehBox').style.display = document.getElementById('isOleh').checked ? 'block' : 'none';
}

// Доля каждого родителя по возрасту ребёнка — по данным Коль зхут (kolzchut.org.il),
// делится НЕ поровну: у детей 6-17 мать традиционно получает больше, чем отец.
function childShareByAge(age){
  if(age===0) return {mother:1, father:1, note:'year of birth - 1 point for each parent (separate supplement)'};
  if(age>=1 && age<=5) return {mother:4.5, father:0, uncertain:true, note:'1–5 years - the entire share is usually with the recipient of the benefit (approximate estimate, the exact score by year differs in sources)'};
  if(age>=6 && age<=17) return {mother:2, father:1, note:'6–17 years old - mother\'s and father\'s share are NOT equal (historical mother\'s benefit, father\'s share added later)'};
  return {mother:0, father:0, note:''};
}

function childPointsForRecipient(age, recipientGender, isSeparated, isCustodial){
  var share = childShareByAge(age);
  if(!isSeparated){
    // Обычная семья: all баллы за ребёнка — у того, who получает пособие
    var mine = recipientGender==='w' ? (share.mother+share.father===0?0:Math.max(share.mother,share.father)) : share.father;
    // Если получатель — мать, она получает свою (обычно большую) долю; если отец — свою
    mine = recipientGender==='w' ? share.mother : share.father;
    return {points: mine, note: share.note, uncertain: share.uncertain};
  } else {
    // Раздельно проживающие: опекун получает ОБЕ доли, второй родитель — только свою
    if(isCustodial) return {points: share.mother+share.father, note: share.note+'(guardian receives both shares)', uncertain: share.uncertain};
    return {points: recipientGender==='w'?share.mother:share.father, note: share.note+' (own share only)', uncertain: share.uncertain};
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
    // Классическая схема — 42 месяца (для репатриировавшихся to 1.1.2022)
    if(monthsSince <= 18){ points = 4.5*(monthsSince/18); stage = '1–1.5 years (4.5 points for this period)'; }
    else if(monthsSince <= 30){ points = 4.5 + 2*((monthsSince-18)/12); stage = 'next year (+2 points)'; }
    else if(monthsSince <= 42){ points = 4.5+2 + 1*((monthsSince-30)/12); stage = 'last year of benefit (+1 point)'; }
    else { points = 0; stage = 'grace period (42 months) has ended'; }
  } else {
    // Расширенная схема с 2022 года — 54 месяца (поправка №262)
    if(monthsSince <= 12){ points = 1 * (monthsSince/12); stage = '1st year (1 point per full year)'; }
    else if(monthsSince <= 30){ points = 1 + 4.5*((monthsSince-12)/18); stage = 'months 13–30 (4.5 points for this period)'; }
    else if(monthsSince <= 42){ points = 1+4.5+2*((monthsSince-30)/12); stage = 'next year (+2 points, score)'; }
    else if(monthsSince <= 54){ points = 1+4.5+2+1*((monthsSince-42)/12); stage = 'last year of benefit (+1 point, score)'; }
    else { points = 0; stage = 'grace period (54 months) has ended'; }
  }
  return {points: points, monthsSince: monthsSince, stage: stage, isPost2022: isPost2022};
}

function calc(){
  var isWoman = GENDER==='w';
  var base = isWoman ? 2.75 : 2.25;
  var rows = [['Base score'+(isWoman?'+ woman score':''), base]];
  var total = base;

  var isRecipient = document.getElementById('isRecipient').checked;
  var isSeparated = document.getElementById('isSeparated').checked;
  var hasUncertainChild = false;

  if(!isRecipient && !isSeparated){
    rows.push(['Children - spouse receives benefits', 0]);
  } else {
    children.forEach(function(c, i){
      var cp = childPointsForRecipient(c.age, GENDER, isSeparated, isRecipient);
      if(cp.uncertain) hasUncertainChild = true;
      if(cp.points>0){
        rows.push(['Child'+(i+1)+' ('+c.age+'years) -'+cp.note, cp.points]);
        total += cp.points;
      } else {
        rows.push(['Child'+(i+1)+' ('+c.age+'years) -'+cp.note, 0]);
      }
    });
  }

  var isOleh = document.getElementById('isOleh').checked;
  var olehInfo = null;
  if(isOleh){
    olehInfo = olehPoints(document.getElementById('olehDate').value);
    if(olehInfo.points>0){
      rows.push(['Repatriate ('+olehInfo.stage+')', olehInfo.points]);
      total += olehInfo.points;
    }
  }

  if(document.getElementById('hasDegree').checked){ rows.push(['Diploma (bachelor\'s degree)', 1]); total += 1; }
  if(document.getElementById('isVeteran').checked){ rows.push(['Demobilized (estimated)', 2]); total += 2; }
  if(document.getElementById('isSingleParent').checked){ rows.push(['Single parent', 1]); total += 1; }
  if(document.getElementById('isDivorcedAlimony').checked){ rows.push(['Divorce with alimony', 1]); total += 1; }
  if(document.getElementById('hasNonWorkingSpouse').checked){ rows.push(['Non-working spouse', 1]); total += 1; }

  var monthlySum = total * POINT_VALUE;
  var annualSum = monthlySum * 12;

  var h = '<div class="verdict"><div class="v-lbl">Your tax points</div>'+
    '<div class="v-num">'+total.toFixed(2)+'</div>'+
    '<div class="v-sub">= '+fmt(monthlySum)+'per month tax free</div></div>';

  h += '<div class="kpi">'+
    '<div class="k"><div class="n">'+fmt(monthlySum)+'</div><div class="l">Savings per month</div></div>'+
    '<div class="k"><div class="n">'+fmt(annualSum)+'</div><div class="l">Savings per year</div></div>'+
    '</div>';

  h += '<table><thead><tr><th>Base</th><th>Points</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h += '<tr><td>'+r[0]+'</td><td'+(r[1]>0?' class="pos"':'')+'>'+(r[1]>0?'+':'')+r[1].toFixed(2)+'</td></tr>';
  });
  h += '</tbody><tfoot><tr><td>Total</td><td>'+total.toFixed(2)+'</td></tr></tfoot></table>';

  h += '<div style="margin-top:20px"><b style="font-size:14px">How to get this money</b></div><div style="margin-top:10px">';
  h += '<div class="note n-info"><b>Complete Form 101 with your employer.</b>At the beginning of the year (or when starting a new job), enter all the reasons on Form 101 - this is the only way the employer will apply the correct points. Points “on paper” mean nothing if the employer doesn’t know about them.</div>';

  if(!isRecipient && !isSeparated && children.length>0){
    h += '<div class="note n-warn"><b>You don\'t get points for kids</b>You indicated that your spouse receives child benefits, which means he/she has the children’s points, not you. If you want to transfer the points to yourself, you can submit an application to change the recipient of the benefit.</div>';
  }
  if(hasUncertainChild){
    h += '<div class="note n-warn"><b>Children 1–5 years old - check the exact score</b>This is the most frequently clarified part of the system: even professional accounting sites in Israel differ on the details for years 1–5. We showed a cautious assessment. Check out the official IRS simulator or ask an accountant to avoid losing out and overpaying.</div>';
  }
  if(isOleh && olehInfo && olehInfo.monthsSince>54){
    h += '<div class="note n-info"><b>The repatriate\'s grace period has already ended</b>More than 54 months (4.5 years) have passed since repatriation - no additional points are awarded for repatriation, only the basic resident score.</div>';
  }
  h += '<div class="note n-ok"><b>If points have not been used in previous years</b>Forgotten points (for example, for a diploma or a child) can be returned through a tax return declaration - the limitation period is up to 6 years ago.</div>';
  h += '</div>';

  document.getElementById('out').innerHTML = h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {total: total, monthlySum: monthlySum, annualSum: annualSum};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Your tax points', r.total.toFixed(2)+'points', 'This'+fmt(r.monthlySum)+'per month',
    [['Savings per month', fmt(r.monthlySum)], ['Savings per year', fmt(r.annualSum)]],
    '📊 See detailed breakdown', function(){setActiveView('result');});
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

addChild();
document.getElementById('childrenList').lastElementChild;
children[0].age = 8;
renderChildren();
document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
