<script>
/* CARTES ÉCONOMIQUES + CALENDRIER VIVANTS (version française)
   Mêmes données que la version russe : ../data/tablo.json, ../data/payments.json, ../data/benzin.json.
   Tout est calculé dans le navigateur (dates, montants, badges, « dans N jours ») :
   la page ne se fige plus entre deux mises à jour automatiques.
   Particularités françaises : dates « 31 août 2026 », format des nombres fr-FR (virgule décimale),
   pluriel « dans 1 jour / 2 jours ». */
(function(){
  var MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  function d0(x){x.setHours(0,0,0,0);return x}
  function isoDate(s){var p=String(s||'').split('-');return p.length===3&&p[0]?new Date(+p[0],+p[1]-1,+p[2]):null}
  function fmtD(d){return d.getDate()+' '+MOIS[d.getMonth()]+' '+d.getFullYear()}
  function fmtDM(d){return d.getDate()+' '+MOIS[d.getMonth()]}
  function daysTo(d){return Math.round((d0(new Date(d))-d0(new Date()))/86400000)}
  function whenPhrase(d){var n=daysTo(d);return n===0?"aujourd’hui":(n===1?'demain':'dans '+n+' jours')}
  function num(n,dec){return n.toLocaleString('fr-FR',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0})}
  function money(n){return num(Math.round(n*100)/100,2)+' ₪'}
  function pct(x,dec){return num(x,dec==null?2:dec)+' %'}
  function weekdayForward(d){var w=d.getDay();if(w===6){d.setDate(d.getDate()+2)}else if(w===5){d.setDate(d.getDate()+1)}return d}
  function cbsShift(y,m){var d=new Date(y,m,15);var w=d.getDay();if(w===5){d.setDate(d.getDate()-1)}else if(w===6){d.setDate(d.getDate()-2)}return d}
  function nextCbs(){var n=new Date(),y=n.getFullYear(),m=n.getMonth();var d=cbsShift(y,m);if(d0(d)<=d0(new Date())){d=cbsShift(y,m+1)}return d}
  function nextMonthFirst(){var n=new Date();return new Date(n.getFullYear(),n.getMonth()+1,1)}
  function setTxt(id,t){var e=document.getElementById(id);if(e){e.textContent=t}}

  window.__renderHome=function(tablo,pay,fuel){
    tablo=tablo||{};pay=pay||{};fuel=fuel||{};
    var boi=tablo.boi||{},cpi=tablo.cpi||{},f=fuel.price||{},fmeta=fuel.meta||{};

    /* ---- carte : Banque d'Israël ---- */
    if(boi.rate!=null){
      setTxt('dec-boi-val','Taux '+pct(boi.rate*100)+' · Prime '+pct(boi.prime*100));
      var bd=isoDate(boi.changed);
      if(bd){setTxt('dec-boi-label','🏦 Banque d’Israël (depuis le '+fmtDM(bd)+')')}
      var badge=document.getElementById('dec-boi-badge');
      if(badge&&boi.prev_rate!=null){
        var pp=Math.round((boi.rate-boi.prev_rate)*10000)/100;
        if(pp<0){badge.textContent='📉 BAISSÉE DE '+pct(Math.abs(pp))+' pt';badge.style.color='var(--green)';badge.style.background='var(--green-light)'}
        else if(pp>0){badge.textContent='📈 HAUSSÉE DE '+pct(pp)+' pt';badge.style.color='#c15045';badge.style.background='#fdeeee'}
        else {badge.textContent='INCHANGÉE'}
      }
    }
    /* ---- carte : essence ---- */
    if(f.self!=null){
      setTxt('dec-fuel-val',money(f.self)+' / litre'+(f.diff!=null?' ('+(f.diff>0?'+':'')+money(f.diff).replace(' ₪',' ₪')+')':''));
      var fd=isoDate(fmeta.updated);
      if(fd){setTxt('dec-fuel-label','⛽ Essence 95 (dès le '+fmtDM(fd)+')')}
      var fb=document.getElementById('dec-fuel-badge');
      if(fb&&f.diff_pct!=null){
        var up=f.diff_pct>0;
        fb.textContent=(up?'🔺 +':'🔻 ')+pct(f.diff_pct,1);
        fb.style.color=up?'#c15045':'var(--green)';
        fb.style.background=up?'#fdeeee':'#eaf6f0';
      }
    }
    /* ---- carte : inflation ---- */
    if(cpi.yoy!=null){
      setTxt('dec-cpi-val','Inflation annuelle : '+pct(cpi.yoy*100,1)+(cpi.mom!=null?' · Mois '+(cpi.mom>0?'+':'')+pct(cpi.mom*100,1):''));
      var pm=isoDate(cpi.period+'-01');
      if(pm){var e=document.getElementById('dec-cpi-badge');if(e){e.textContent=MOIS[pm.getMonth()].toUpperCase()}}
    }

    /* ---- calendrier : d'abord le passé (avec le résultat), puis l'à-venir ---- */
    var past=[],next=[];
    if(boi.changed&&boi.rate!=null){
      var res='✅ Taux maintenu : '+pct(boi.rate*100);
      if(boi.prev_rate!=null&&boi.rate<boi.prev_rate){res='✅ Taux abaissé : '+pct(boi.rate*100)+' (prime '+pct(boi.prime*100)+')'}
      else if(boi.prev_rate!=null&&boi.rate>boi.prev_rate){res='✅ Taux relevé : '+pct(boi.rate*100)}
      past.push({d:isoDate(boi.changed),label:'Réunion de la Banque d’Israël',res:res});
    }
    if(fmeta.updated&&f.self!=null){
      past.push({d:isoDate(fmeta.updated),label:'Tarif essence 95',
                 res:'✅ '+money(f.self)+(f.diff!=null?' ('+(f.diff>0?'+':'')+money(f.diff)+')':'')});
    }
    var BL=[['unemployment','Allocations chômage (avtala)','avtala.html'],
            ['self_employed','Cotisations indépendants et employeurs','../salary.html'],
            ['long_term','Retraite, invalidité, sioud, allocations de longue durée','pension-gap.html'],
            ['children','Allocations familiales (kitsvat yeladim)','tablo.html']];
    BL.forEach(function(row){
      var src=isoDate(pay[row[0]]);if(!src){return}
      var n=new Date(),d=new Date(n.getFullYear(),n.getMonth(),src.getDate());
      if(daysTo(d)<0){d=new Date(n.getFullYear(),n.getMonth()+1,src.getDate())}
      weekdayForward(d);
      next.push({d:d,label:row[1],href:row[2],bl:true});
    });
    var nd=isoDate(boi.next_decision);
    if(nd){next.push({d:nd,label:'Décision de la Banque d’Israël sur le taux',href:'tablo.html'})}
    next.push({d:nextCbs(),label:'Indice des prix à la consommation (madad)',href:'tablo.html'});
    next.push({d:nextMonthFirst(),label:'Révision du prix de l’essence pour le mois suivant',href:'../benzin.html'});
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
          'Dates et montants calculés dans le navigateur à partir de tablo.json, payments.json et benzin.json'+
          (tablo.updated?' · données du '+tablo.updated:'')+'</div>';
    list.innerHTML=html;
  };

  function load(){
    function g(u){return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
    Promise.all([g('../data/tablo.json'),g('../data/payments.json'),g('../data/benzin.json')])
      .then(function(a){window.__renderHome(a[0],a[1],a[2])});
  }
  load();
  setInterval(load,600000);   /* si la page reste ouverte toute la nuit : on recalcule « dans N jours » */
})();
</script>
