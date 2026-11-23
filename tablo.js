
(function(){
'use strict';
var root=document.getElementById('tb-root'); if(!root) return;
var SRC=root.getAttribute('data-src')||'data/tablo.json';
var D=null;

function el(s){return root.querySelector(s);}
var nf=function(n,d){return new Intl.NumberFormat('ru-RU',
  {minimumFractionDigits:d,maximumFractionDigits:d}).format(n);};
function pct(x,d){return nf(x*100,d===undefined?2:d)+'%';}
function money(n){return nf(n,Math.abs(n)>=1000?0:2)+' ₪';}
function dt(s){return s?new Date(s+'T00:00:00').toLocaleDateString('ru-RU',
  {day:'numeric',month:'long',year:'numeric'}):'';}
function dshort(s){return s?new Date(s+'T00:00:00').toLocaleDateString('ru-RU'):'';}

function arrow(v){return v>0?'▲':v<0?'▼':'';}
function cls(v){return v>0?'tb-up':v<0?'tb-down':'';}

function tile(o){
  var idx=window.__tbModalData=(window.__tbModalData||[]);
  var i=idx.length;
  idx.push(o);
  return '<button type="button" class="tb-tile tb-tile--'+o.kind+'" onclick="tbOpenModal('+i+')">'+
    '<div class="tb-tile__l">'+o.icon+' '+o.label+'</div>'+
    '<div class="tb-tile__v">'+o.value+'</div>'+
    (o.sub?'<div class="tb-tile__sub">'+o.sub+'</div>':'')+
    (o.delta?'<div class="tb-tile__d">'+o.delta+'</div>':'')+
    '<div class="tb-tile__more">Подробнее ›</div>'+
    '</button>';
}
function tbOpenModal(i){
  var o=(window.__tbModalData||[])[i];
  if(!o)return;
  var ov=document.getElementById('tb-modal-overlay');
  if(!ov){
    ov=document.createElement('div');ov.id='tb-modal-overlay';ov.className='tb-modal-overlay';
    ov.innerHTML='<div class="tb-modal"><div class="tb-modal__head"><h3 id="tb-modal-title"></h3>'+
      '<button class="tb-modal__close" onclick="tbCloseModal()">✕</button></div>'+
      '<div class="tb-modal__big" id="tb-modal-big"></div>'+
      '<div class="tb-modal__sub" id="tb-modal-sub"></div>'+
      '<div id="tb-modal-city-picker" style="display:none;margin-bottom:14px">'+
        '<label style="font-size:12.5px;font-weight:700;color:var(--tb-muted);display:block;margin-bottom:6px">Выберите свой город:</label>'+
        '<select id="tb-city-select" style="width:100%;padding:10px 12px;border:1px solid var(--tb-border);border-radius:10px;font-size:14px;background:var(--tb-surface);color:var(--tb-text)"></select>'+
        '<div id="tb-city-result" style="margin-top:10px;font-size:14px;color:var(--tb-text2)"></div>'+
      '</div>'+
      '<div class="tb-modal__expl" id="tb-modal-expl"></div>'+
      '<a class="tb-modal__link" id="tb-modal-link" href="#"></a></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){if(e.target===ov)tbCloseModal();});
    document.getElementById('tb-city-select').addEventListener('change', tbCityChange);
  }
  document.getElementById('tb-modal-title').textContent=o.label;
  document.getElementById('tb-modal-big').textContent=o.value;
  document.getElementById('tb-modal-sub').innerHTML=o.sub||'';
  document.getElementById('tb-modal-expl').innerHTML=o.expl||'';
  var pickerBox=document.getElementById('tb-modal-city-picker');
  if(o.cities){
    pickerBox.style.display='block';
    var sel=document.getElementById('tb-city-select');
    var names=Object.keys(o.cities);
    sel.innerHTML=names.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('');
    window.__tbCurrentCities=o.cities;
    window.__tbNationalAvg=parseFloat((o.value||'').replace(/[^\d]/g,''))||0;
    tbCityChange();
  } else {
    pickerBox.style.display='none';
  }
  var linkEl=document.getElementById('tb-modal-link');
  if(o.link){linkEl.style.display='';linkEl.textContent=o.link[0]+' →';linkEl.href=o.link[1];}
  else{linkEl.style.display='none';}
  ov.classList.add('show');
}
function tbCityChange(){
  var sel=document.getElementById('tb-city-select');
  var cities=window.__tbCurrentCities||{};
  var city=sel.value;
  var val=cities[city];
  var avg=window.__tbNationalAvg||0;
  var box=document.getElementById('tb-city-result');
  if(!box||val==null)return;
  var diff=val-avg;
  var diffStr=diff===0?'ровно как в среднем по стране':
    (diff>0?'на '+new Intl.NumberFormat('ru-RU').format(diff)+' ₪ дороже среднего по стране':
    'на '+new Intl.NumberFormat('ru-RU').format(-diff)+' ₪ дешевле среднего по стране');
  box.innerHTML='<strong style="font-size:20px;color:var(--tb-text)">'+
    new Intl.NumberFormat('ru-RU').format(val)+' ₪</strong> — средняя аренда 3-комнатной квартиры в '+city+'<br>'+
    '<span style="opacity:.85">'+diffStr+'</span>';
}
window.tbCityChange=tbCityChange;
function tbCloseModal(){var ov=document.getElementById('tb-modal-overlay');if(ov)ov.classList.remove('show');}
window.tbOpenModal=tbOpenModal;
window.tbCloseModal=tbCloseModal;

function nextCbsPublication(){
  // ЦСБ публикует мадад и индекс строительства 15 числа каждого месяца в 18:30,
  // с переносом на четверг, если 15-е выпадает на пятницу или субботу.
  // Важно: сдвиг на выходные применяется ДО проверки "прошло или нет" —
  // иначе дата после сдвига (например, 13-е) могла бы застревать как
  // "ближайшая", даже если этот сдвинутый день уже прошёл.
  function shifted(y, m){
    var c=new Date(y,m,15,18,30);
    var dow=c.getDay();
    if(dow===5) c.setDate(c.getDate()-1);
    else if(dow===6) c.setDate(c.getDate()-2);
    return c;
  }
  var now=new Date();
  var y=now.getFullYear(),m=now.getMonth();
  var candidate=shifted(y,m);
  if(candidate<=now) candidate=shifted(y,m+1);
  return candidate;
}

function render(){
  var b=D.boi,c=D.cpi,k=D.construction,w=D.wage,e=D.explain;

  var rateDelta='';
  if(b.prev_rate!=null && Math.abs(b.prev_rate-b.rate)>1e-9){
    var diff=(b.rate-b.prev_rate)*100;
    rateDelta=arrow(diff)+' '+nf(Math.abs(diff),2)+' п.п. с '+dshort(b.changed);
  }

  var nextCbs=nextCbsPublication();
  var nextCbsStr=nextCbs.toLocaleDateString('ru-RU',{day:'numeric',month:'long'});

  window.__tbModalData=[];
  el('#tb-grid').innerHTML=
    tile({kind:'rate',icon:'🏛️',label:'Ставка Банка Израиля',value:pct(b.rate,2),
      sub:'Прайм: <strong>'+pct(b.prime,2)+'</strong>',
      delta:rateDelta,dcls:cls(b.rate-(b.prev_rate||b.rate)),
      expl:e.rate_ru+(b.next_decision?' Следующее решение: '+dshort(b.next_decision)+'.':''),
      link:['Пересчитать машканту','mashkanta.html']})+
    tile({kind:'cpi',icon:'📈',label:'Мадад — индекс цен',value:pct(c.yoy,1),
      sub:'за год · значение '+nf(c.value,1),
      delta:'за месяц '+(c.mom>=0?'+':'−')+nf(Math.abs(c.mom*100),1)+'%',dcls:cls(c.mom),
      expl:e.cpi_ru+' Следующая публикация ЦСБ — '+nextCbsStr+' в 18:30.',
      link:['Расчёт индексации аренды','#arenda']})+
    tile({kind:'build',icon:'🏗️',label:'Индекс строительства',value:pct(k.yoy,1),
      sub:'за год · значение '+nf(k.value,1),
      delta:'за месяц '+(k.mom>=0?'+':'−')+nf(Math.abs(k.mom*100),1)+'%',dcls:cls(k.mom),
      expl:e.construction_ru+' Следующая публикация ЦСБ — '+nextCbsStr+' в 18:30.',
      link:['Налог при покупке','mas-rehisha.html']})+
    tile({kind:'wage',icon:'💼',label:'Минимальная зарплата',value:money(w.min_monthly),
      sub:'в час: '+nf(w.min_hourly,2)+' ₪',
      delta:'действует с '+dshort(w.since),
      expl:e.min_wage_ru,link:['Посчитать зарплату','salary.html']})+
    tile({kind:'housing',icon:'🏘️',label:'Индекс цен на жильё',value:pct(D.housing.yoy,1),
      sub:'за год'+(D.housing.value?' · значение '+nf(D.housing.value,1):''),
      delta:'за 2 месяца '+(D.housing.mom>=0?'+':'−')+nf(Math.abs(D.housing.mom*100),1)+'%',dcls:cls(D.housing.mom),
      expl:e.housing_ru,link:['Налог при покупке','mas-rehisha.html']})+
    tile({kind:'rent',icon:'🏠',label:'Аренда по городам',value:money(D.rent_by_city.national_avg),
      sub:'3-комн. квартира · средняя по стране',
      delta:'за год +'+nf(D.rent_by_city.yoy*100,1)+'%',dcls:'up',
      expl:e.rent_ru,link:['Аренда или покупка?','arenda-vs-pokupka.html'],
      cities:D.rent_by_city.cities})+
    tile({kind:'fuel',icon:'⛽',label:'Бензин 95',value:nf(D.fuel.price_95,2)+' ₪/л',
      sub:'самообслуживание · с полным обслуживанием +'+nf(D.fuel.full_service_extra,2)+' ₪/л',
      delta:(D.fuel.price_95>=D.fuel.prev_price?'+':'')+nf((D.fuel.price_95-D.fuel.prev_price)*100,0)+' агорот с прошлого месяца',
      dcls:cls(D.fuel.price_95-D.fuel.prev_price),
      expl:e.fuel_ru,link:['Подробный разбор цены','benzin.html']});

  // Валюты
  var fx=D.fx,out='';
  ['USD','EUR','RUB','UAH','GBP'].forEach(function(cur){
    var v=fx.market[cur]; if(!v)return;
    var p=(fx.prev||{})[cur],d=(p&&p>0)?(v-p)/p*100:null;
    out+='<div class="tb-fxi"><div class="tb-fxi__c">'+cur+'</div>'+
      '<span class="tb-fxi__v">'+nf(v,v>=1?4:5)+'</span>'+
      '<span class="tb-fxi__d '+(d==null?'':cls(d))+'">'+
      (d==null?'&nbsp;':arrow(d)+' '+nf(Math.abs(d),2)+'%')+'</span></div>';
  });
  el('#tb-fx').innerHTML=out;

  var off=fx.official&&fx.official.USD;
  el('#tb-fx-note').innerHTML='Сколько шекелей за одну единицу валюты. '+
    (off?'Официальный курс Банка Израиля на '+dshort(fx.official_date)+': USD '+
      nf(off,4)+' ₪, EUR '+nf(fx.official.EUR,4)+' ₪. ':'')+e.fx_ru;

  // Калькулятор индексации аренды
  function renderRentCalc(){
    var rentInput = el('#tb-rent-input');
    var rent = rentInput ? (+rentInput.value || 0) : 4500;
    var add = rent*c.yoy;
    var resultBox = el('#tb-rent-result');
    var daysLeft = Math.max(0, Math.ceil((nextCbs - new Date()) / 86400000));
    if(resultBox) resultBox.innerHTML = (rent>0 ?
      'Если ваша аренда '+money(rent)+
      ' и она привязана к мададу, при годовом росте индекса '+pct(c.yoy,1)+
      ' плата вырастет примерно на <strong>'+money(add)+'</strong> в месяц — это '+
      money(add*12)+' в год. '
      : 'Введите сумму аренды, чтобы увидеть расчёт. ')+
      'Проверьте в договоре пункт про привязку: без него поднимать плату в течение срока нельзя. '+
      '<br><span style="opacity:.8">📅 Следующее обновление индекса — через <strong>'+daysLeft+' '+
      (daysLeft===1?'день':(daysLeft>=2&&daysLeft<=4?'дня':'дней'))+'</strong> ('+nextCbsStr+').</span>';
  }
  renderRentCalc();
  if(el('#tb-rent-input')) el('#tb-rent-input').addEventListener('input', renderRentCalc);

  // История
  var rows='';
  if(b.prev_rate!=null){
    rows+='<tr><td>Ставка Банка Израиля</td><td class="num">'+pct(b.rate,2)+
      '</td><td class="num">'+pct(b.prev_rate,2)+'</td><td>'+dshort(b.changed)+'</td></tr>'+
      '<tr><td>Прайм</td><td class="num">'+pct(b.prime,2)+'</td><td class="num">'+
      pct(b.prev_rate+0.015,2)+'</td><td>'+dshort(b.changed)+'</td></tr>';
  }
  rows+='<tr><td>Минимальная зарплата</td><td class="num">'+money(w.min_monthly)+
    '</td><td class="num">—</td><td>'+dshort(w.since)+'</td></tr>';
  el('#tb-hist tbody').innerHTML=rows;

  // Подвал
  el('#tb-updated').textContent=dt(D.updated);
  el('#tb-sources').innerHTML=(D.sources||[]).map(function(s){
    return '<li><a href="'+s.url+'" target="_blank" rel="noopener nofollow">'+s.name+
      '</a> <span class="tb-hint">— '+s.role+'</span></li>';}).join('');

  // Статус
  var a=D.auto||{},age=Math.round((new Date()-new Date(D.updated+'T00:00:00'))/86400000);
  var stale=age>3, partial=a.ok===false;
  el('#tb-status').innerHTML='<p class="tb-hint" style="margin:2px 0 0">'+
    (stale?'Данные от '+dt(D.updated)+' — возможны расхождения.'
          :'Данные обновлены '+dt(D.updated)+' из официальных источников.')+
    (partial?' Часть показателей могла не обновиться.':'')+'</p>';
}

fetch(SRC,{cache:'no-cache'})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
  .then(function(j){D=j;window.TABLO={data:D};render();})
  .catch(function(e){
    el('#tb-status').innerHTML='<div class="tb-note">Не удалось загрузить данные ('+
      e.message+'). Проверьте путь к <code>'+SRC+'</code>.</div>';});
})();
