
/* ═══ СТУПЕНИ 2026 (заморожены до 15.01.2028) — ядро не менять без пересчёта тестов ═══ */
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
function fmt(n){return Math.round(n).toLocaleString('ru-RU')}
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
    h+='<div class="verdict"><div class="v-lbl">Налог на покупку</div>'+
       '<div class="v-num">'+fmt(t)+' ₪</div>'+
       '<div class="v-sub">6% с первого шекеля</div>'+
       '<div class="v-eff">эффективная ставка 6.00%</div></div>';
    h+='<div class="note n-info"><b>Нежилая недвижимость</b>'+
       '<span class="law" lang="he" dir="rtl">תקנה 2(1)</span> — единая ставка 6% на всю стоимость, без ступеней и без освобождения. '+
       'Если покупаете участок под жилищное строительство и в течение 24 месяцев получите разрешение на строительство, '+
       'возможен возврат 1/6 уплаченного налога (около '+fmt(t/6)+' ₪).</div>';
    document.getElementById('out').innerHTML=h;
    document.getElementById('results-wrap') && document.getElementById('results-wrap').classList.add('show');
    return {big:fmt(t)+' ₪', sub:'6% — нежилая недвижимость'};
  }

  var singleLike=(st==='single'||st==='upgrader');
  var routes=[];

  if(singleLike){
    var r=calcBrackets(v,B.single);
    routes.push({key:'single',name:'Единственная квартира',law:'סעיף 9(ג1ג)(3)',
      desc:'обычные ступени резидента Израиля',total:r.total,rows:r.rows});
  }
  if(st==='additional'||st==='foreign'){
    var r2=calcBrackets(v,B.additional);
    routes.push({key:'additional',name:st==='foreign'?'Иностранный резидент':'Дополнительная квартира',
      law:'סעיף 9(ג1ו)',desc:'8% с первого шекеля, далее 10%',total:r2.total,rows:r2.rows});
  }
  if(isOleh){
    if(singleLike){
      var r3=calcBrackets(v,B.olehNew);
      routes.push({key:'olehNew',name:'Репатриант — единственная квартира',law:'תקנה 12א',
        desc:'действует с 15.08.2024',total:r3.total,rows:r3.rows});
    }
    var before=olehDate&&olehDate<OLEH_AMENDMENT;
    if(before||!singleLike){
      var r4=calcBrackets(v,B.olehOld);
      routes.push({key:'olehOld',name:'Репатриант — прежняя норма',law:'תקנה 12',
        desc:before?'доступна вам: репатриация до 15.08.2024':'прежняя редакция',
        total:r4.total,rows:r4.rows});
    }
  }
  if(isDis){
    var r5=calcDisabled(v,singleLike);
    routes.push({key:'disabled',name:'Льгота инвалида / пострадавшего',law:'תקנה 11',
      desc:singleLike&&v<=DISABLED_THRESHOLD?'освобождение до первой ступени, далее 0.5%':'0.5% с первого шекеля',
      total:r5.total,rows:r5.rows});
  }

  routes.sort(function(a,b){return a.total-b.total});
  var best=routes[0];
  var eff=v>0?(best.total/v*100):0;

  h+='<div class="verdict"><div class="v-lbl">Налог на покупку</div>'+
     '<div class="v-num">'+fmt(best.total)+' ₪</div>'+
     '<div class="v-sub">'+best.name+'</div>'+
     '<div class="v-eff">эффективная ставка '+eff.toFixed(2)+'% от стоимости</div></div>';

  if(routes.length>1){
    h+='<div style="margin-bottom:10px"><b style="font-size:14px">Доступные вам маршруты</b>'+
       '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Калькулятор выбирает выгоднейший. Льгота не всегда лучше обычных ступеней — сравнивайте.</p></div>';
    routes.forEach(function(rt,i){
      h+='<div class="route'+(i===0?' best':'')+'"><div><div class="nm">'+(i===0?'✓ ':'')+rt.name+'</div>'+
         '<div class="ds"><span class="law" lang="he" dir="rtl">'+rt.law+'</span> '+rt.desc+'</div></div>'+
         '<div class="vl">'+fmt(rt.total)+' ₪'+(i>0?'<div style="font-size:10.5px;font-weight:400;color:var(--muted)">+'+fmt(rt.total-best.total)+'</div>':'')+'</div></div>';
    });
  }

  h+='<div style="margin-top:20px;margin-bottom:10px"><b style="font-size:14px">Разбивка по ступеням</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Ставка применяется не ко всей сумме, а к части стоимости внутри каждой ступени.</p></div>'+
     '<div style="overflow:auto"><table><thead><tr><th>Часть стоимости</th><th>Ставка</th><th>Сумма части</th><th>Налог</th></tr></thead><tbody>';
  best.rows.forEach(function(r){
    h+='<tr><td>'+fmt(r.from)+' – '+fmt(r.to)+'</td>'+
       '<td>'+(r.rate*100).toFixed(1)+'%</td>'+
       '<td>'+fmt(r.part)+'</td>'+
       '<td'+(r.tax===0?' class="zero"':'')+'>'+(r.tax===0?'—':fmt(r.tax))+'</td></tr>';
  });
  h+='</tbody><tfoot><tr><td colspan="3">Итого налог</td><td>'+fmt(best.total)+' ₪</td></tr></tfoot></table></div>';

  h+='<div style="margin-top:22px"><b style="font-size:14px">Что учесть</b></div><div style="margin-top:10px">';

  if(st==='upgrader'){
    var months=(fromWho==='dev')?12:24;
    var deadline=buyDate?addMonths(buyDate,months):null;
    var addl=calcBrackets(v,B.additional).total;
    var risk=addl-best.total;
    h+='<div class="note n-bad"><b>⏳ Главное: срок продажи старой квартиры</b>'+
       'Вы платите по ставкам единственной квартиры <strong>при условии</strong>, что продадите старую квартиру в срок. '+
       (fromWho==='dev'
         ? '<span class="law" lang="he" dir="rtl">סעיף 9(ג1ג)(2)(ב)</span> — <strong>12 месяцев</strong> с даты, когда застройщик должен был передать вам владение по договору.'
         : '<span class="law" lang="he" dir="rtl">סעיף 9(ג1ג)(2)(א)</span> — <strong>24 месяца</strong> со дня подписания договора.')+
       (deadline?'<br><br><strong>Ваш крайний срок: примерно '+fmtD(deadline)+'</strong>':'')+
       '<br><br>Если не успеть — доначисление задним числом по ставкам дополнительной квартиры: '+
       '<strong>'+fmt(addl)+' ₪</strong> вместо '+fmt(best.total)+' ₪. Разница <strong>'+fmt(risk)+' ₪</strong>, плюс проценты и индексация.</div>';
    h+='<div class="note n-warn"><b>Норма срока менялась трижды</b>'+
       'С 01.06.2023 по 31.05.2025 действовали 18 месяцев (временная норма). С 01.06.2025 вернулись 24 месяца. '+
       'В Кнессете продвигается законопроект о возврате к 18 месяцам — перед сделкой проверьте актуальную норму у адвоката.</div>';
  }

  if(isOleh){
    if(best.key==='olehNew'){
      var vsSingle=calcBrackets(v,B.single).total;
      h+='<div class="note n-ok"><b>Льгота репатрианта работает в вашу пользу</b>'+
         '<span class="law" lang="he" dir="rtl">תקנה 12א</span> даёт 0% до '+fmt(FIRST_TIER)+' ₪ и всего 0.5% до '+fmt(6055070)+' ₪. '+
         'Экономия против обычных ступеней: <strong>'+fmt(vsSingle-best.total)+' ₪</strong>.</div>';
    } else if(best.key==='single'&&routes.some(function(r){return r.key.indexOf('oleh')===0})){
      h+='<div class="note n-warn"><b>Льгота репатрианта вам НЕ выгодна</b>'+
         'Обычные ступени единственной квартиры дают меньший налог. Не применяйте льготу автоматически только потому, что она положена — '+
         'это распространённая и дорогая ошибка.</div>';
    }
    if(!olehDate){
      h+='<div class="note n-info"><b>Укажите дату репатриации</b>'+
         'От неё зависит, какая норма применима. Для репатриировавшихся до 15.08.2024 доступен выбор между '+
         '<span class="law" lang="he" dir="rtl">תקנה 12</span> и <span class="law" lang="he" dir="rtl">תקנה 12א</span>.</div>';
    }
    h+='<div class="note n-info"><b>Условия льготы репатрианта</b>'+
       'Период: от года до первого въезда в Израиль и до 7 лет после. Срочная и национальная служба в счёт семи лет не входит. '+
       'Нужна виза оле по ст. 2 Закона о возвращении, теудат оле по ст. 3 либо разрешение А1. Льгота даётся один раз.</div>';
  }

  if(isDis){
    h+='<div class="note n-info"><b>Условия льготы по такане 11</b>'+
       'Предоставляется <strong>не более двух раз за жизнь</strong>, и квартира должна служить для проживания правообладателя. '+
       'Требуется подтверждение Битуах Леуми или Министерства обороны о степени инвалидности.</div>';
  }

  if(st==='additional'||st==='foreign'){
    var asSingle=calcBrackets(v,B.single).total;
    h+='<div class="note n-warn"><b>Разница со статусом единственной квартиры — '+fmt(best.total-asSingle)+' ₪</b>'+
       'Если это ваша единственная квартира в Израиле, или вы продаёте имеющуюся — вы вправе на ставки единственной. '+
       'Проверьте: доля до 1/3 в другой квартире или до 1/2 в унаследованной <strong>не лишает</strong> статуса единственной.</div>';
    if(st==='foreign'){
      h+='<div class="note n-info"><b>Иностранный резидент, ставший резидентом Израиля</b>'+
         'Существовало положение, по которому покупатель, ставший резидентом в течение 27 месяцев с покупки, получал ставки единственной квартиры задним числом. '+
         'Уточните актуальность у адвоката.</div>';
    }
  }

  h+='<div class="note n-info"><b>Проверьте «семейную ячейку»</b>'+
     '<span class="law" lang="he" dir="rtl">סעיף 9(ג)(2)(ב)(2)</span> — вы, ваш супруг и дети до 18 лет считаются <strong>одним покупателем</strong>. '+
     'Если у супруга есть квартира, она учитывается как ваша, и статус единственной теряется.</div>';

  h+='<div class="note n-warn"><b>Сроки подачи и оплаты</b>'+
     'Декларация в «мисуй мекаркеин» — <strong>30 дней</strong> с подписания договора. Оплата — <strong>60 дней</strong>. '+
     'Просрочка влечёт проценты, индексацию и штрафы.</div>';

  h+='</div>';

  document.getElementById('out').innerHTML=h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {big:fmt(best.total)+' ₪', sub:best.name, eff:eff.toFixed(2)+'%'};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Налог на покупку (мас рехиша)', r.big, r.sub,
    r.eff ? [['Эффективная ставка', r.eff]] : [],
    '📊 Смотреть разбивку и маршруты', function(){setActiveView('result');});
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

fetch('data/rates.json',{cache:'no-cache'})
  .then(function(r){if(!r.ok)throw 0;return r.json()})
  .then(function(j){ if(j.updated){ var d=new Date(j.updated); if(!isNaN(d)) document.getElementById('p-upd').textContent=d.toLocaleDateString('ru-RU'); } })
  .catch(function(){});

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
