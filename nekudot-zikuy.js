
var POINT_VALUE = 242;
var GENDER = 'm';
var children = [];
var childIdCounter = 0;

function fmt(n){return Math.round(n).toLocaleString('ru-RU')+' ₪'}

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
      '<span style="font-size:12.5px;color:var(--muted)">Ребёнок</span>'+
      '<select onchange="updateChildAge(\''+c.id+'\',this.value)">'+
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(function(a){
          return '<option value="'+a+'"'+(a===c.age?' selected':'')+'>'+a+' лет</option>';
        }).join('')+
      '</select>'+
      '<button type="button" onclick="removeChild(\''+c.id+'\')" aria-label="Удалить">✕</button>'+
    '</div>';
  }).join('') || '<p style="font-size:12px;color:var(--muted)">Пока не добавлено ни одного ребёнка</p>';
}

function toggleRecipientBox(){
  var sep = document.getElementById('isSeparated');
  // чекбокс "получатель" всегда доступен; просто пересчитаем при изменении
}
function toggleOlehBox(){
  document.getElementById('olehBox').style.display = document.getElementById('isOleh').checked ? 'block' : 'none';
}

// Доля каждого родителя по возрасту ребёнка — по данным Коль зхут (kolzchut.org.il),
// делится НЕ поровну: у детей 6-17 мать традиционно получает больше, чем отец.
function childShareByAge(age){
  if(age===0) return {mother:1, father:1, note:'год рождения — по 1 баллу каждому родителю (отдельная надбавка)'};
  if(age>=1 && age<=5) return {mother:4.5, father:0, uncertain:true, note:'1–5 лет — вся доля обычно у получателя пособия (примерная оценка, точный балл по годам расходится в источниках)'};
  if(age>=6 && age<=17) return {mother:2, father:1, note:'6–17 лет — доля матери и отца НЕ равны (историческая льгота матери, доля отца добавлена позже)'};
  return {mother:0, father:0, note:''};
}

function childPointsForRecipient(age, recipientGender, isSeparated, isCustodial){
  var share = childShareByAge(age);
  if(!isSeparated){
    // Обычная семья: все баллы за ребёнка — у того, кто получает пособие
    var mine = recipientGender==='w' ? (share.mother+share.father===0?0:Math.max(share.mother,share.father)) : share.father;
    // Если получатель — мать, она получает свою (обычно большую) долю; если отец — свою
    mine = recipientGender==='w' ? share.mother : share.father;
    return {points: mine, note: share.note, uncertain: share.uncertain};
  } else {
    // Раздельно проживающие: опекун получает ОБЕ доли, второй родитель — только свою
    if(isCustodial) return {points: share.mother+share.father, note: share.note+' (опекун получает обе доли)', uncertain: share.uncertain};
    return {points: recipientGender==='w'?share.mother:share.father, note: share.note+' (только своя доля)', uncertain: share.uncertain};
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
    // Классическая схема — 42 месяца (для репатриировавшихся до 1.1.2022)
    if(monthsSince <= 18){ points = 4.5*(monthsSince/18); stage = '1–1.5 года (4.5 балла за этот период)'; }
    else if(monthsSince <= 30){ points = 4.5 + 2*((monthsSince-18)/12); stage = 'следующий год (+2 балла)'; }
    else if(monthsSince <= 42){ points = 4.5+2 + 1*((monthsSince-30)/12); stage = 'последний год льготы (+1 балл)'; }
    else { points = 0; stage = 'льготный период (42 месяца) закончился'; }
  } else {
    // Расширенная схема с 2022 года — 54 месяца (поправка №262)
    if(monthsSince <= 12){ points = 1 * (monthsSince/12); stage = '1-й год (1 балл за полный год)'; }
    else if(monthsSince <= 30){ points = 1 + 4.5*((monthsSince-12)/18); stage = 'месяцы 13–30 (4.5 балла за этот период)'; }
    else if(monthsSince <= 42){ points = 1+4.5+2*((monthsSince-30)/12); stage = 'следующий год (+2 балла, оценка)'; }
    else if(monthsSince <= 54){ points = 1+4.5+2+1*((monthsSince-42)/12); stage = 'последний год льготы (+1 балл, оценка)'; }
    else { points = 0; stage = 'льготный период (54 месяца) закончился'; }
  }
  return {points: points, monthsSince: monthsSince, stage: stage, isPost2022: isPost2022};
}

function calc(){
  var isWoman = GENDER==='w';
  var base = isWoman ? 2.75 : 2.25;
  var rows = [['Базовый балл'+(isWoman?' + балл женщины':''), base]];
  var total = base;

  var isRecipient = document.getElementById('isRecipient').checked;
  var isSeparated = document.getElementById('isSeparated').checked;
  var hasUncertainChild = false;

  if(!isRecipient && !isSeparated){
    rows.push(['Дети — пособие получает супруг(а)', 0]);
  } else {
    children.forEach(function(c, i){
      var cp = childPointsForRecipient(c.age, GENDER, isSeparated, isRecipient);
      if(cp.uncertain) hasUncertainChild = true;
      if(cp.points>0){
        rows.push(['Ребёнок '+(i+1)+' ('+c.age+' лет) — '+cp.note, cp.points]);
        total += cp.points;
      } else {
        rows.push(['Ребёнок '+(i+1)+' ('+c.age+' лет) — '+cp.note, 0]);
      }
    });
  }

  var isOleh = document.getElementById('isOleh').checked;
  var olehInfo = null;
  if(isOleh){
    olehInfo = olehPoints(document.getElementById('olehDate').value);
    if(olehInfo.points>0){
      rows.push(['Репатриант ('+olehInfo.stage+')', olehInfo.points]);
      total += olehInfo.points;
    }
  }

  if(document.getElementById('hasDegree').checked){ rows.push(['Диплом (бакалавриат)', 1]); total += 1; }
  if(document.getElementById('isVeteran').checked){ rows.push(['Демобилизованный (оценка)', 2]); total += 2; }
  if(document.getElementById('isSingleParent').checked){ rows.push(['Одинокий родитель', 1]); total += 1; }
  if(document.getElementById('isDivorcedAlimony').checked){ rows.push(['Развод с алиментами', 1]); total += 1; }
  if(document.getElementById('hasNonWorkingSpouse').checked){ rows.push(['Неработающий супруг(а)', 1]); total += 1; }

  var monthlySum = total * POINT_VALUE;
  var annualSum = monthlySum * 12;

  var h = '<div class="verdict"><div class="v-lbl">Ваши налоговые баллы</div>'+
    '<div class="v-num">'+total.toFixed(2)+'</div>'+
    '<div class="v-sub">= '+fmt(monthlySum)+' в месяц не облагается налогом</div></div>';

  h += '<div class="kpi">'+
    '<div class="k"><div class="n">'+fmt(monthlySum)+'</div><div class="l">Экономия в месяц</div></div>'+
    '<div class="k"><div class="n">'+fmt(annualSum)+'</div><div class="l">Экономия в год</div></div>'+
    '</div>';

  h += '<table><thead><tr><th>Основание</th><th>Баллы</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h += '<tr><td>'+r[0]+'</td><td'+(r[1]>0?' class="pos"':'')+'>'+(r[1]>0?'+':'')+r[1].toFixed(2)+'</td></tr>';
  });
  h += '</tbody><tfoot><tr><td>Итого</td><td>'+total.toFixed(2)+'</td></tr></tfoot></table>';

  h += '<div style="margin-top:20px"><b style="font-size:14px">Как получить эти деньги</b></div><div style="margin-top:10px">';
  h += '<div class="note n-info"><b>Заполните форму 101 у работодателя</b>В начале года (или при устройстве на новую работу) укажите все основания в форме 101 — это единственный способ, чтобы работодатель применил правильные баллы. Баллы «на бумаге» не дают ничего, если работодатель о них не знает.</div>';

  if(!isRecipient && !isSeparated && children.length>0){
    h += '<div class="note n-warn"><b>Баллы за детей достаются не вам</b>Вы указали, что пособие на детей получает супруг(а) — значит, детские баллы у него/неё, а не у вас. Если хотите передать баллы себе — можно подать заявление о смене получателя пособия.</div>';
  }
  if(hasUncertainChild){
    h += '<div class="note n-warn"><b>Дети 1–5 лет — сверьте точный балл</b>Это самая часто уточняемая часть системы: даже профессиональные бухгалтерские сайты в Израиле расходятся в деталях по годам 1–5. Мы показали осторожную оценку. Загляните в официальный симулятор Налогового управления или спросите бухгалтера, чтобы не потерять и не переплатить.</div>';
  }
  if(isOleh && olehInfo && olehInfo.monthsSince>54){
    h += '<div class="note n-info"><b>Льготный период репатрианта уже закончился</b>С момента репатриации прошло больше 54 месяцев (4.5 года) — дополнительные баллы за репатриацию больше не положены, только базовый балл резидента.</div>';
  }
  h += '<div class="note n-ok"><b>Если баллы не использовались в прошлые годы</b>Забытые баллы (например, за диплом или ребёнка) можно вернуть через декларацию о возврате налога — срок давности до 6 лет назад.</div>';
  h += '</div>';

  document.getElementById('out').innerHTML = h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {total: total, monthlySum: monthlySum, annualSum: annualSum};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Ваши налоговые баллы', r.total.toFixed(2)+' баллов', 'Это '+fmt(r.monthlySum)+' в месяц',
    [['Экономия в месяц', fmt(r.monthlySum)], ['Экономия в год', fmt(r.annualSum)]],
    '📊 Смотреть подробную разбивку', function(){setActiveView('result');});
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

addChild();
document.getElementById('childrenList').lastElementChild;
children[0].age = 8;
renderChildren();
document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
