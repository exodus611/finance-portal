
var DEFAULT_RATES={prime:5.0,boi:3.5,avg:3.52,byTerm:{5:3.57,10:3.56,15:3.29,20:3.54,25:3.44,30:3.46},
  op:60,noNotice:0.001,updated:null};
var RATES = Object.assign({}, DEFAULT_RATES);

async function loadRates(){
  try{
    const r = await fetch('data/rates.json', {cache:'no-cache'});
    if(!r.ok) throw new Error(r.status);
    const j = await r.json();
    RATES.boi = (typeof j.boi_rate === 'number') ? j.boi_rate : RATES.boi;
    RATES.prime = (typeof j.prime === 'number') ? j.prime : RATES.prime;
    const manualByTerm = j.manual && j.manual.avg_mortgage_rate_by_term;
    if(manualByTerm){
      RATES.byTerm = {5:manualByTerm['5'],10:manualByTerm['10'],15:manualByTerm['15'],20:manualByTerm['20'],25:manualByTerm['25'],30:manualByTerm['30']};
    }
    RATES.avg = (j.manual && typeof j.manual.avg_mortgage_rate_overall === 'number') ? j.manual.avg_mortgage_rate_overall : RATES.avg;
    RATES.updated = j.updated || null;
    RATES.manualChecked = (j.manual && j.manual._checked) || null;
    return true;
  }catch(e){
    console.warn('rates.json недоступен, работаем на дефолтах в коде', e);
    return false;
  }
}

var TRACKS=[
 {t:"prime",n:"Прайм",free:true},
 {t:"kalatz",n:"Фикс. без индексации (КАЛАЦ)",free:false},
 {t:"katz",n:'Фикс. с индексацией (К"Ц)',free:false},
 {t:"var5",n:"Переменная раз в 5 лет",free:false},
 {t:"var1",n:"Переменная раз в год",free:true}
];

var rows=[];

function addTrack(preset){
  var id='t'+(Date.now()+Math.random()).toString(36).slice(-6);
  rows.push(Object.assign({id:id,bal:400000,rate:4.5,years:20,type:"kalatz"},preset||{}));
  render();
}

function render(){
  var h='';
  rows.forEach(function(r){
    var def=TRACKS.filter(function(x){return x.t===r.type})[0]||TRACKS[1];
    h+='<div class="trk"><div class="trk-h">'+
      '<select onchange="upd(\''+r.id+'\',\'type\',this.value)">';
    TRACKS.forEach(function(t){
      h+='<option value="'+t.t+'"'+(t.t===r.type?' selected':'')+'>'+t.n+'</option>';
    });
    h+='</select>'+
      '<span class="tag '+(def.free?'free':'fee')+'">'+(def.free?'без штрафа':'есть штраф')+'</span>'+
      (rows.length>1?'<button class="del" type="button" onclick="del(\''+r.id+'\')" aria-label="Удалить канал">✕</button>':'')+
      '</div><div class="grid">'+
      '<div class="f"><label>Остаток, ₪</label><input type="number" value="'+r.bal+'" step="10000" oninput="upd(\''+r.id+'\',\'bal\',this.value)"></div>'+
      '<div class="f"><label>Ваша ставка, %</label><input type="number" value="'+r.rate+'" step="0.05" oninput="upd(\''+r.id+'\',\'rate\',this.value)"></div>'+
      '<div class="f"><label>Осталось лет</label><input type="number" value="'+r.years+'" step="1" min="1" max="30" oninput="upd(\''+r.id+'\',\'years\',this.value)"></div>'+
      '</div></div>';
  });
  document.getElementById('tracks').innerHTML=h;
}
function upd(id,k,v){
  rows.forEach(function(r){if(r.id===id)r[k]=(k==='type')?v:(+v||0)});
  if(k==='type')render();
}
function del(id){rows=rows.filter(function(r){return r.id!==id});render()}

function pmt(P,annual,years){
  var i=annual/100/12, n=years*12;
  if(i<=0)return P/n;
  return P*i/(1-Math.pow(1+i,-n));
}
function discount(yrs,ztype){
  if(ztype==='zakaut'){
    if(yrs>=4)return .40; if(yrs>=3)return .30;
    if(yrs>=2)return .20; if(yrs>=1)return .10; return 0;
  }
  if(yrs>=5)return .30; if(yrs>=3)return .20; return 0;
}
function mktRate(y){
  var k=[5,10,15,20,25,30], best=30;
  for(var i=0;i<k.length;i++){ if(y<=k[i]){best=k[i];break} }
  return RATES.byTerm[best];
}
function fmt(n){return Math.round(n).toLocaleString('ru-RU')}

function calc(){
  var taken=+document.getElementById('taken').value;
  var ztype=document.getElementById('ztype').value;
  var newrate=+document.getElementById('newrate').value||RATES.avg;
  var disc=discount(taken,ztype);

  var tot={bal:0,oldPay:0,newPay:0,fee:0,ivun:0};
  var det=[];

  rows.forEach(function(r){
    var def=TRACKS.filter(function(x){return x.t===r.type})[0]||TRACKS[1];
    var oldP=pmt(r.bal,r.rate,r.years);
    var newP=pmt(r.bal,newrate,r.years);
    var ivun=0;

    if(!def.free){
      var mkt=mktRate(r.years);
      var gap=r.rate-mkt;
      if(gap>0){
        var i=mkt/100/12, n=r.years*12, m=gap/100/12, bal=r.bal, pv=0;
        var pay=pmt(r.bal,r.rate,r.years);
        for(var k=1;k<=n;k++){
          pv += (bal*m)/Math.pow(1+i,k);
          var int=bal*(r.rate/100/12);
          bal=bal-(pay-int);
          if(bal<=0)break;
        }
        ivun=pv*(1-disc);
      }
    }
    tot.bal+=r.bal; tot.oldPay+=oldP; tot.newPay+=newP; tot.ivun+=ivun;
    det.push({n:def.n,free:def.free,bal:r.bal,rate:r.rate,oldP:oldP,newP:newP,ivun:ivun,save:oldP-newP});
  });

  var noNotice=tot.bal*RATES.noNotice;
  var fees=tot.ivun+noNotice+RATES.op;
  var monthly=tot.oldPay-tot.newPay;
  var payback=monthly>0?fees/monthly:Infinity;
  var maxY=Math.max.apply(null,rows.map(function(r){return r.years}));
  var lifetime=monthly*maxY*12-fees;

  var worth = monthly>0 && payback<=36 && lifetime>0;
  var h='';

  h+='<div class="verdict '+(worth?'v-yes':'v-no')+'">'+
     '<div class="v-lbl">'+(worth?'Рефинансирование выгодно':'Выгода под вопросом')+'</div>'+
     '<div class="v-num">'+(monthly>0?'−'+fmt(monthly)+' ₪':'+'+fmt(-monthly)+' ₪')+'</div>'+
     '<div class="v-sub">'+(monthly>0
        ?'в месяц · окупится за '+(payback===Infinity?'—':Math.ceil(payback)+' мес.')
        :'платёж вырастет — рефинансировать невыгодно')+'</div></div>';

  h+='<div class="kpi">'+
     '<div class="k"><div class="n" style="color:'+(fees>0?'var(--red)':'var(--green)')+'">'+fmt(fees)+' ₪</div><div class="l">Штраф и сборы</div></div>'+
     '<div class="k"><div class="n">'+(payback===Infinity?'—':Math.ceil(payback))+'</div><div class="l">Месяцев до окупаемости</div></div>'+
     '<div class="k"><div class="n" style="color:'+(lifetime>0?'var(--green)':'var(--red)')+'">'+fmt(lifetime)+' ₪</div><div class="l">Итого за весь срок</div></div>'+
     '</div>';

  h+='<div style="margin-bottom:10px"><b style="font-size:14px">Разбивка по каналам</b><p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Рефинансировать стоит не всё сразу — смотрите, где экономия перекрывает штраф.</p></div>';
  h+='<div style="overflow:auto"><table><thead><tr>'+
     '<th>Канал</th><th>Остаток</th><th>Платёж сейчас</th><th>Станет</th><th>Штраф</th></tr></thead><tbody>';
  det.forEach(function(d){
    h+='<tr><td><strong>'+d.n+'</strong><br><span style="font-size:10.5px;color:var(--muted)">'+d.rate+'%'+(d.free?' · без штрафа':'')+'</span></td>'+
       '<td>'+fmt(d.bal)+'</td><td>'+fmt(d.oldP)+'</td>'+
       '<td class="'+(d.save>0?'pos':'neg')+'">'+fmt(d.newP)+'</td>'+
       '<td class="'+(d.ivun>0?'neg':'pos')+'">'+(d.ivun>0?fmt(d.ivun):'0')+'</td></tr>';
  });
  h+='</tbody><tfoot><tr><td>Итого</td><td>'+fmt(tot.bal)+'</td><td>'+fmt(tot.oldPay)+'</td><td>'+fmt(tot.newPay)+'</td><td>'+fmt(tot.ivun)+'</td></tr></tfoot></table></div>';

  var good=det.filter(function(d){
    var s=d.save; if(s<=0)return false;
    var f=d.ivun + d.bal*RATES.noNotice;
    return (f/s)<=36;
  });
  if(good.length>0 && good.length<det.length){
    var gSave=good.reduce(function(a,d){return a+d.save},0);
    var gFee=good.reduce(function(a,d){return a+d.ivun+d.bal*RATES.noNotice},0)+RATES.op;
    var gPay=gSave>0?gFee/gSave:Infinity;
    var gLife=gSave*maxY*12-gFee;
    h+='<div style="margin-top:20px;border:2px solid var(--green);border-radius:16px;padding:16px">'+
       '<b style="color:var(--green);font-size:14px">✓ Оптимальный сценарий</b>'+
       '<p style="font-size:12px;color:var(--muted);margin:6px 0 12px">Не обязательно рефинансировать всё. Вот что действительно стоит трогать:</p>'+
       '<table><tbody>';
    good.forEach(function(d){
      var f=d.ivun+d.bal*RATES.noNotice;
      h+='<tr><td><strong>'+d.n+'</strong><br><span style="font-size:10.5px;color:var(--muted)">штраф '+fmt(f)+' ₪ · окупится за '+Math.ceil(f/d.save)+' мес.</span></td>'+
         '<td class="pos">−'+fmt(d.save)+' ₪/мес</td></tr>';
    });
    det.filter(function(d){return good.indexOf(d)<0}).forEach(function(d){
      h+='<tr><td style="opacity:.55"><strong>'+d.n+'</strong><br><span style="font-size:10.5px;color:var(--muted)">оставить как есть</span></td>'+
         '<td style="color:var(--muted);font-size:12px">не трогать</td></tr>';
    });
    h+='</tbody></table>'+
       '<div class="kpi" style="margin-top:14px;margin-bottom:0">'+
       '<div class="k"><div class="n" style="color:var(--green)">−'+fmt(gSave)+' ₪</div><div class="l">В месяц</div></div>'+
       '<div class="k"><div class="n">'+(gPay===Infinity?'—':Math.ceil(gPay))+'</div><div class="l">Месяцев окупаемости</div></div>'+
       '<div class="k"><div class="n" style="color:var(--green)">'+fmt(gLife)+' ₪</div><div class="l">Итого выгода</div></div>'+
       '</div></div>';
  }

  h+='<div style="margin-top:20px"><b style="font-size:14px">Что это значит</b></div><div style="margin-top:10px">';
  var freeSum=det.filter(function(d){return d.free}).reduce(function(a,d){return a+d.bal},0);
  if(freeSum>0){
    h+='<div class="note n-ok"><b>У вас '+fmt(freeSum)+' ₪ можно погашать без штрафа</b>'+
       'Каналы «Прайм» и «переменная раз в год» не облагаются компенсацией. Это самая гибкая часть машканты — её можно рефинансировать или досрочно погашать в любой момент.</div>';
  }
  if(tot.ivun>0){
    h+='<div class="note n-warn"><b>Штраф около '+fmt(tot.ivun)+' ₪ — с учётом скидки '+Math.round(disc*100)+'%</b>'+
       'Скидка положена по закону за возраст кредита. Точную сумму банк обязан рассчитать бесплатно по вашему запросу — попросите письменный расчёт перед решением.</div>';
  } else {
    h+='<div class="note n-ok"><b>Штрафа за досрочное погашение нет</b>'+
       'Ваши ставки не выше текущих рыночных, либо все каналы свободны от компенсации. Препятствий для рефинансирования нет.</div>';
  }
  if(monthly>0 && payback>36){
    h+='<div class="note n-bad"><b>Окупаемость '+Math.ceil(payback)+' месяцев — это долго</b>'+
       'Штраф съедает выгоду. Есть смысл рефинансировать только часть каналов — те, где нет компенсации, — или подождать более выгодного предложения от другого банка.</div>';
  }
  if(monthly<=0){
    h+='<div class="note n-bad"><b>Новая ставка не лучше вашей</b>'+
       'При ставке '+newrate+'% платёж не снижается. Попробуйте получить предложения от нескольких банков — разброс ставок между банками может быть заметным.</div>';
  }
  h+='</div>';

  var o=document.getElementById('out');
  o.innerHTML=h;
  document.getElementById('results-wrap') && document.getElementById('results-wrap').classList.add('show');
}

function runAndShowModal(){
  calc();
  var monthly = rows.reduce(function(a,r){return a+pmt(r.bal,r.rate,r.years);},0) - rows.reduce(function(a,r){var nr=+document.getElementById('newrate').value||RATES.avg; return a+pmt(r.bal,nr,r.years);},0);
  var out = document.getElementById('out');
  var verdictLbl = out.querySelector('.v-lbl').textContent;
  var verdictNum = out.querySelector('.v-num').textContent;
  var verdictSub = out.querySelector('.v-sub').textContent;
  var fees = out.querySelectorAll('.k .n')[0].textContent;
  var payback = out.querySelectorAll('.k .n')[1].textContent;
  showResultModal(verdictLbl, verdictNum, verdictSub, [['Штраф и сборы', fees], ['Окупаемость', payback+' мес.']], '📊 Смотреть детали по каналам', function(){setActiveView('result');});
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

function showResultModal(title,bigValue,subText,rows,actionLabel,actionFn){
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
  document.getElementById('rm-rows').innerHTML=(rows||[]).map(function(r){return '<div class="result-modal-row"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('');
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

addTrack({type:"prime",bal:350000,rate:6.2,years:22});
addTrack({type:"kalatz",bal:400000,rate:4.9,years:20});
addTrack({type:"katz",bal:250000,rate:3.4,years:25});

function renderRatePills(loadedFromFile){
  document.getElementById('p-prime').textContent=RATES.prime.toFixed(2)+'%';
  document.getElementById('p-boi').textContent=RATES.boi.toFixed(2)+'%';
  document.getElementById('p-avg').textContent=RATES.avg.toFixed(2)+'%';
  var note = document.getElementById('stale-note');
  if(loadedFromFile && RATES.updated){
    var d = new Date(RATES.updated);
    var dateStr = isNaN(d) ? RATES.updated : d.toLocaleDateString('ru-RU');
    note.textContent = '✓ Ставка Банка Израиля обновлена автоматически (' + dateStr + '). Средние ставки по рынку — проверены вручную' + (RATES.manualChecked ? ' ' + RATES.manualChecked : '') + '. Перед решением уточняйте у банка.';
  } else {
    note.textContent = '⚠️ Не удалось загрузить свежие данные — показаны ориентировочные ставки (зашиты в код). Перед решением уточняйте актуальные ставки у банка.';
  }
}

loadRates().then(renderRatePills);

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
