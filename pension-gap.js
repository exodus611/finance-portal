
/* ═══ ЯДРО — проверено против реальных данных Битуах Леуми и внутренней согласованности ═══ */
var K={kzSingle:1838, kzCouple:2762, kzVetekMax:0.50, mekademM:200, mekademF:210, feeDeposit:0.02};
function fmt(n){return Math.round(n).toLocaleString('ru-RU')}
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
    xLabels+='<text x="'+x(i)+'" y="'+(H-8)+'" font-size="10" fill="var(--muted)" text-anchor="middle">'+p.y+' лет</text>';
  });
  var targetSvg='';
  if(targetLine!==null){
    var ty=y(targetLine);
    targetSvg='<line x1="'+padL+'" y1="'+ty+'" x2="'+(W-padR)+'" y2="'+ty+'" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="5,4"/>'+
      '<text x="'+(W-padR)+'" y="'+(ty-6)+'" font-size="10" fill="var(--gold)" text-anchor="end" font-weight="700">цель: '+fmtShort(targetLine)+'</text>';
  }
  var dots=points.map(function(p,i){return '<circle cx="'+x(i)+'" cy="'+y(p.cap)+'" r="3.5" fill="var(--green)"/>'}).join('');

  var svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">'+
    gridLines+targetSvg+
    '<path d="'+pathCap+'" fill="none" stroke="var(--green)" stroke-width="2.5"/>'+
    dots+xLabels+
    '</svg>'+
    '<div style="display:flex;gap:16px;justify-content:center;margin-top:8px;font-size:11.5px;color:var(--muted)">'+
    '<span>🟢 Ваш прогнозируемый капитал</span>'+(targetLine!==null?'<span>🟡 Нужный капитал для цели</span>':'')+'</div>';
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
  if(years<=0){alert('Возраст выхода должен быть больше текущего');return}

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
     (gap>0?'Вам будет не хватать':'Вы обеспечены')+'</div>'+
     '<div class="v-num">'+(gap>0?fmt(gap):fmt(-gap))+' ₪</div>'+
     '<div class="v-sub">в месяц'+(gap>0?', начиная с '+retire+' лет':' — сверх цели')+'</div></div>';

  h+='<div class="kpi">'+
    '<div class="k"><div class="n">'+fmt(income)+' ₪</div><div class="l">Доход на пенсии</div></div>'+
    '<div class="k"><div class="n" style="color:'+(repl<50?'var(--red)':repl<65?'var(--gold)':'var(--green)')+'">'+repl.toFixed(0)+'%</div><div class="l">Замещение зарплаты</div></div>'+
    '<div class="k"><div class="n">'+fmt(total)+' ₪</div><div class="l">Капитал к '+retire+' годам</div></div>'+
    '</div>';

  var maxv=Math.max(need,income,1);
  h+='<div style="margin-bottom:10px"><b style="font-size:14px">Сегодня и на пенсии</b><p style="font-size:12px;color:var(--muted);margin:4px 0 10px">В сегодняшних деньгах — с поправкой на инфляцию.</p></div>'+
     '<div class="barlbl"><span>Нужно для прежнего уровня жизни</span><strong>'+fmt(need)+' ₪</strong></div>'+
     '<div class="bar"><i style="width:'+(need/maxv*100)+'%"></i><span>'+fmt(need)+' ₪</span></div>'+
     '<div class="barlbl" style="margin-top:14px"><span>Реально будете получать</span><strong>'+fmt(income)+' ₪</strong></div>'+
     '<div class="bar'+(income<need?' short':'')+'"><i style="width:'+(income/maxv*100)+'%"></i><span>'+fmt(income)+' ₪</span></div>';

  h+='<table style="margin-top:20px"><thead><tr><th>Источник</th><th>В месяц</th></tr></thead><tbody>'+
     '<tr><td>Пенсионный фонд<br><span style="font-size:10.5px;color:var(--muted)">капитал '+fmt(total)+' ₪ ÷ мекадем '+mekadem+'</span></td><td>'+fmt(pension)+' ₪</td></tr>'+
     '<tr><td>Кицват зикна (Битуах Леуми)<br><span style="font-size:10.5px;color:var(--muted)">'+(single?'одинокий':'с супругом')+', со стажевой надбавкой</span></td><td>'+fmt(kz)+' ₪</td></tr>'+
     '</tbody><tfoot><tr><td>Итого доход</td><td>'+fmt(income)+' ₪</td></tr></tfoot></table>';

  h+='<div style="margin-top:22px;margin-bottom:10px"><b style="font-size:14px">Откуда возьмётся капитал</b></div>'+
     '<table><tbody>'+
     '<tr><td>Уже накоплено сегодня<br><span style="font-size:10.5px;color:var(--muted)">вырастет за '+years+' лет под '+(real*100).toFixed(2)+'% реальных</span></td><td>'+fmt(fv1)+' ₪</td></tr>'+
     '<tr><td>Будущие отчисления<br><span style="font-size:10.5px;color:var(--muted)">'+fmt(contrib)+' ₪/мес × '+years+' лет</span></td><td>'+fmt(fv2)+' ₪</td></tr>'+
     '</tbody><tfoot><tr><td>Капитал к пенсии</td><td>'+fmt(total)+' ₪</td></tr></tfoot></table>'+
     '<p style="font-size:11.5px;color:var(--muted);margin-top:10px">Реальная доходность '+(real*100).toFixed(2)+'% = '+(nom*100).toFixed(1)+'% фонда − '+(infl*100).toFixed(1)+'% инфляции − '+(fee*100).toFixed(2)+'% комиссии.</p>';

  h+='<div style="margin-top:22px;margin-bottom:10px"><b style="font-size:14px">Рост капитала по годам</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Накопления сегодня + будущие отчисления, сложным процентом до самой пенсии.</p></div>'+
     '<div id="pension-chart-wrap"></div>';

  var needCapForChart = gap>0 ? gap*mekadem : null;

  if(gap>0){
    var needCap=gap*mekadem;
    var extra=pmtNeeded(needCap,rm,years*12);
    h+='<div style="margin-top:22px"><b style="font-size:14px">Как закрыть разрыв</b></div>'+
       '<div class="note n-info" style="margin-top:10px"><b>Нужен дополнительный капитал '+fmt(needCap)+' ₪</b>'+
       'Это '+fmt(extra)+' ₪ в месяц дополнительно, если начать сейчас и откладывать до '+retire+' лет.</div>';

    h+='<h3>Цена промедления</h3><div style="overflow:auto"><table><thead><tr><th>Если начать</th><th>Нужно откладывать</th><th>Переплата</th></tr></thead><tbody>';
    [0,1,3,5,10].forEach(function(d){
      if(years-d<=1)return;
      var e=pmtNeeded(needCap,rm,(years-d)*12);
      h+='<tr'+(d===0?' class="hl"':'')+'><td>'+(d===0?'<strong>сейчас</strong>':'через '+d+' лет')+'</td>'+
         '<td>'+fmt(e)+' ₪/мес</td>'+
         '<td'+(d>0?' class="neg"':'')+'>'+(d===0?'—':'+'+fmt(e-extra)+' ₪/мес')+'</td></tr>';
    });
    h+='</tbody></table></div><p style="font-size:11.5px;color:var(--muted);margin-top:10px">Каждый год промедления делает решение дороже. Это не про дисциплину — это математика сложного процента.</p>';
  }

  h+='<div style="margin-top:22px;margin-bottom:10px"><b style="font-size:14px">Что влияет сильнее всего</b></div>';

  if(pitzOut){
    var rateKeep=(pw+pe+pz)/100;
    var contribKeep=salary*basePct*gapFactor*rateKeep*(1-K.feeDeposit);
    var totalKeep=fv1+fvStream(contribKeep,rm,years*12);
    var diff=totalKeep-total;
    h+='<div class="note n-bad"><b>Снятие компенсации стоит вам '+fmt(diff)+' ₪ капитала</b>'+
       'Это '+fmt(diff/mekadem)+' ₪ в месяц пенсии — навсегда. При увольнении их можно оставить в фонде: деньги продолжат работать, и это почти всегда выгоднее.</div>';
  } else {
    h+='<div class="note n-ok"><b>Вы сохраняете компенсацию — правильное решение</b>Если бы вы её снимали, капитал был бы примерно на треть меньше. Держите эту линию при каждой смене работы.</div>';
  }

  if(pw<7){
    var rateUp=(7+pe+(pitzOut?0:pz))/100;
    var contribUp=salary*basePct*gapFactor*rateUp*(1-K.feeDeposit);
    var totalUp=fv1+fvStream(contribUp,rm,years*12);
    h+='<div class="note n-info"><b>Увеличить свою часть с '+pw+'% до 7%</b>'+
       'Добавит '+fmt(totalUp-total)+' ₪ к капиталу и '+fmt((totalUp-total)/mekadem)+' ₪ к месячной пенсии. Плюс налоговая льгота.</div>';
  }

  if(retire<70){
    var y2=years+3;
    var t2=fvLump(saved,real,y2)+fvStream(contrib,rm,y2*12);
    var kz2=kitzva(y2+Math.max(0,age-22),single)*1.15;
    var inc2=t2/mekadem+kz2;
    h+='<div class="note n-info"><b>Отложить выход на 3 года: '+fmt(inc2)+' ₪ вместо '+fmt(income)+' ₪</b>'+
       'Работает трижды: капитал растёт, взносы продолжаются, и Битуах Леуми добавляет 5% к кицва за каждый год отсрочки.</div>';
  }

  var totalLowFee=fvLump(saved,realGross-0.002,years)+fvStream(contrib,(realGross-0.002)/12,years*12);
  if(fee>0.002){
    h+='<div class="note n-warn"><b>Снизить комиссию с '+(fee*100).toFixed(2)+'% до 0.2%</b>'+
       'Разница в капитале — '+fmt(totalLowFee-total)+' ₪. Полпроцента в год за 25 лет превращаются в сотни тысяч шекелей.</div>';
  }

  h+='<div class="note '+(repl>=50?'n-ok':'n-warn')+'"><b>Ваше замещение '+repl.toFixed(0)+'% — контекст</b>'+
     'По исследованию Университета Бен-Гуриона, средний коэффициент замещения в Израиле — 38% у мужчин и 31% у женщин. Мировой ориентир — 60–70%. '+
     (repl>=60?'Вы в хорошей позиции.':repl>=45?'Вы выше среднего по стране, но ниже комфортного уровня.':'Это тревожная зона — стоит действовать.')+'</div>';

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
  return {big:(gap>0?fmt(gap):fmt(-gap))+' ₪', sub:gap>0?'не хватает в месяц':'сверх цели в месяц', repl:repl.toFixed(0)+'%', income:fmt(income)+' ₪'};
}

function runAndShowModal(){
  var r = calc();
  if(!r) return;
  showResultModal(r.sub.includes('не хватает')?'Вам будет не хватать':'Вы обеспечены', r.big, r.sub,
    [['Доход на пенсии', r.income], ['Замещение зарплаты', r.repl]],
    '📊 Смотреть план и цену промедления', function(){setActiveView('result');});
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

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
