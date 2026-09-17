<script>
/* ЖИВЫЕ КАРТОЧКИ ЭКОНОМИКИ + КАЛЕНДАРЬ РЕШЕНИЙ И ВЫПЛАТ
   Один запрос вместо четырёх дублей. Источники: data/tablo.json, data/payments.json, data/benzin.json.
   Ничего не «зашито» в разметку: даты, суммы, бейджи и «через N дн.» считаются в браузере,
   поэтому страница не устаревает между прогонами автообновления. */
(function(){
  function pad(n){return n<10?'0'+n:''+n}
  function fmtD(d){return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear()}
  function fmtDM(d){return pad(d.getDate())+'.'+pad(d.getMonth()+1)}
  function d0(x){x.setHours(0,0,0,0);return x}
  function isoDate(s){var p=String(s||'').split('-');return p.length===3&&p[0]?new Date(+p[0],+p[1]-1,+p[2]):null}
  function daysTo(d){return Math.round((d0(new Date(d))-d0(new Date()))/86400000)}
  function plural(n,one,few,many){var a=n%10,b=n%100;if(a===1&&b!==11){return one}if(a>=2&&a<=4&&(b<12||b>14)){return few}return many}
  function whenPhrase(d){var n=daysTo(d);return n===0?'сегодня':(n===1?'завтра':'через '+n+' '+plural(n,'день','дня','дней'))}
  function weekdayForward(d){var w=d.getDay();if(w===6){d.setDate(d.getDate()+2)}else if(w===5){d.setDate(d.getDate()+1)}return d}
  function cbsShift(y,m){var d=new Date(y,m,15);var w=d.getDay();if(w===5){d.setDate(d.getDate()-1)}else if(w===6){d.setDate(d.getDate()-2)}return d}
  function nextCbs(){var n=new Date(),y=n.getFullYear(),m=n.getMonth();var d=cbsShift(y,m);if(d0(d)<=d0(new Date())){d=cbsShift(y,m+1)}return d}
  function nextMonthFirst(){var n=new Date();return new Date(n.getFullYear(),n.getMonth()+1,1)}
  var MONTHS=['ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ','ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ'];
  function setTxt(id,t){var e=document.getElementById(id);if(e){e.textContent=t}}
  function money(n){return (Math.round(n*100)/100).toFixed(2)+' ₪'}

  window.__renderHome=function(tablo,pay,fuel){
    tablo=tablo||{};pay=pay||{};fuel=fuel||{};
    var boi=tablo.boi||{},cpi=tablo.cpi||{},f=fuel.price||{},fmeta=fuel.meta||{};

    /* ---- карточка: Банк Израиля ---- */
    if(boi.rate!=null){
      setTxt('dec-boi-val','Ставка '+(boi.rate*100).toFixed(2)+'% · Прайм '+(boi.prime*100).toFixed(2)+'%');
      var bd=isoDate(boi.changed);
      if(bd){setTxt('dec-boi-label','🏦 Банк Израиля (с '+fmtDM(bd)+')')}
      var badge=document.getElementById('dec-boi-badge');
      if(badge&&boi.prev_rate!=null){
        var pp=Math.round((boi.rate-boi.prev_rate)*10000)/100;
        if(pp<0){badge.textContent='📉 СНИЖЕНА НА '+Math.abs(pp).toFixed(2)+'%';badge.style.color='var(--green)';badge.style.background='var(--green-light)'}
        else if(pp>0){badge.textContent='📈 ПОВЫШЕНА НА '+pp.toFixed(2)+'%';badge.style.color='#c15045';badge.style.background='#fdeeee'}
        else {badge.textContent='БЕЗ ИЗМЕНЕНИЙ'}
      }
    }
    /* ---- карточка: бензин ---- */
    if(f.self!=null){
      setTxt('dec-fuel-val',f.self.toFixed(2)+' ₪ / литр'+(f.diff!=null?' ('+(f.diff<0?'':'+')+f.diff.toFixed(2)+' ₪)':''));
      var fd=isoDate(fmeta.updated);
      if(fd){setTxt('dec-fuel-label','⛽ Бензин 95 (с '+fmtDM(fd)+')')}
      var fb=document.getElementById('dec-fuel-badge');
      if(fb&&f.diff_pct!=null){
        var up=f.diff_pct>0;
        fb.textContent=(up?'🔺 +':'🔻 ')+f.diff_pct.toFixed(1)+'%';
        fb.style.color=up?'#c15045':'var(--green)';
        fb.style.background=up?'#fdeeee':'#eaf6f0';
      }
    }
    /* ---- карточка: инфляция ---- */
    if(cpi.yoy!=null){
      setTxt('dec-cpi-val','Годовая инфляция: '+(cpi.yoy*100).toFixed(1)+'%'+(cpi.mom!=null?' · Месяц '+(cpi.mom>0?'+':'')+(cpi.mom*100).toFixed(1)+'%':''));
      var pm=isoDate(cpi.period+'-01');
      if(pm){setTxt('dec-cpi-badge',MONTHS[pm.getMonth()])}
    }

    /* ---- календарь: сначала прошедшее (с результатом), потом ближайшее ---- */
    var past=[],next=[];
    if(boi.changed&&boi.rate!=null){
      var res='✅ Ставка сохранена: '+(boi.rate*100).toFixed(2)+'%';
      if(boi.prev_rate!=null&&boi.rate<boi.prev_rate){res='✅ Ставка снижена: '+(boi.rate*100).toFixed(2)+'% (прайм '+(boi.prime*100).toFixed(2)+'%)'}
      else if(boi.prev_rate!=null&&boi.rate>boi.prev_rate){res='✅ Ставка повышена: '+(boi.rate*100).toFixed(2)+'%'}
      past.push({d:isoDate(boi.changed),label:'Заседание Банка Израиля',res:res});
    }
    if(fmeta.updated&&f.self!=null){
      past.push({d:isoDate(fmeta.updated),label:'Тариф на бензин 95',
                 res:'✅ '+money(f.self)+(f.diff!=null?' ('+(f.diff<0?'':'+')+f.diff.toFixed(2)+' ₪)':'')});
    }
    var BL=[['unemployment','Пособие по безработице (автала)','avtala.html'],
            ['self_employed','Взносы самозанятых и работодателей','salary.html'],
            ['long_term','Пособие по старости, инвалидность, сиюд','pension-gap.html'],
            ['children','Пособие на детей (קצבת ילדים)','tablo.html']];
    BL.forEach(function(row){
      var src=isoDate(pay[row[0]]);if(!src){return}
      var n=new Date(),d=new Date(n.getFullYear(),n.getMonth(),src.getDate());
      if(daysTo(d)<0){d=new Date(n.getFullYear(),n.getMonth()+1,src.getDate())}
      weekdayForward(d);
      next.push({d:d,label:row[1],href:row[2],bl:true});
    });
    var nd=isoDate(boi.next_decision);
    if(nd){next.push({d:nd,label:'Решение Банка Израиля по ставке',href:'tablo.html'})}
    next.push({d:nextCbs(),label:'Индекс потребительских цен (מדד)',href:'tablo.html'});
    next.push({d:nextMonthFirst(),label:'Пересмотр цены на бензин на следующий месяц',href:'benzin.html'});
    next=next.filter(function(e){return e.d&&!isNaN(e.d)&&daysTo(e.d)>=0}).sort(function(a,b){return a.d-b.d});

    var list=document.getElementById('dec-calendar-list');
    if(!list){return}
    var html='';
    past.forEach(function(e){
      if(!e.d||isNaN(e.d)){return}
      html+='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:4px 0">'+
            '<span><b>'+fmtD(e.d)+'</b> · '+e.label+'</span>'+
            '<span style="font-weight:800;color:var(--green);font-size:10.5px;white-space:nowrap">'+e.res+'</span></div>';
    });
    next.forEach(function(e){
      html+='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:4px 0">'+
            '<span><b>'+fmtD(e.d)+'</b> · '+e.label+'</span>'+
            '<span style="color:var(--muted);font-size:10.5px;white-space:nowrap">'+(e.bl?'🔔 ':'')+'⏳ '+whenPhrase(e.d)+'</span></div>';
    });
    html+='<div style="font-size:10px;color:var(--muted);padding:8px 0 0;border-top:1px dashed var(--line);margin-top:6px">'+
          'Даты и суммы считаются в браузере из tablo.json, payments.json и benzin.json'+
          (tablo.updated?' · данные от '+tablo.updated:'')+'</div>';
    list.innerHTML=html;
  };

  function load(){
    function g(u){return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
    Promise.all([g('data/tablo.json'),g('data/payments.json'),g('data/benzin.json')])
      .then(function(a){window.__renderHome(a[0],a[1],a[2])});
  }
  load();
  /* если страница открыта сутками (телефон в фоне) — пересчитываем «через N дн.» */
  setInterval(load,600000);
})();
</script>
