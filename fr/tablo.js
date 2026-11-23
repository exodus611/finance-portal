
(function(){
'use strict';
var root=document.getElementById('tb-root'); if(!root) return;
var SRC=root.getAttribute('data-src')||'../data/tablo.json';
var D=null;

var CITY_FR={'Тель-Авив':'Tel-Aviv','Герцлия':'Herzliya','Кфар-Сава':'Kfar Saba','Рамат-Ган':'Ramat Gan','Иерусалим':'Jérusalem','Ришон-ле-Цион':'Rishon LeZion','Петах-Тиква':'Petah Tikva','Холон':'Holon','Реховот':'Rehovot','Нетания':'Netanya','Бней-Брак':'Bnei Brak','Ашдод':'Ashdod','Бат-Ям':'Bat-Yam','Бейт-Шемеш':'Beit Shemesh','Хадера':'Hadera','Ашкелон':'Ashkelon','Хайфа':'Haïfa','Беэр-Шева':'Beer-Sheva'};
var SRC_FR={'https://www.boi.org.il/':['Banque d’Israël — taux directeur','taux et prime'],'https://www.cbs.gov.il/':['Bureau central des statistiques (CBS)','indice des prix et coûts de construction'],'https://data.gov.il/dataset/288':['Bituah Leumi — salaire minimum','salaire minimum, données ouvertes'],'https://www.exchangerate-api.com/':['ExchangeRate-API','cours de change du marché']};
var EXPL_FR={
rate:'Le taux directeur, fixé par la Banque d’Israël environ une fois et demie par mois lors de la réunion du conseil d’administration. C’est la base à partir de laquelle se calcule le prime — la forme de crédit la plus courante du pays. Le taux monte — la mensualité de l’hypothèque à part variable (michtana) et de tout crédit indexé sur le prime augmente ; il baisse — la mensualité diminue dès le mois de calcul suivant, sans renégocier le contrat.',
cpi:'L’indice des prix à la consommation est calculé par le Bureau central des statistiques à partir d’un panier d’achats typiques d’un ménage moyen — de l’alimentation au logement. Y sont officiellement indexés : les baux « cemouda le-madad », les pensions alimentaires, une partie des allocations publiques et certains accords salariaux. Si votre contrat de location contient cette clause, le montant est automatiquement recalculé au pourcentage annoncé, sans l’accord des parties.',
construction:'Un indice distinct du madad, qui mesure la hausse des seuls matériaux et travaux de construction. La « part construction » du prix d’un appartement acheté sur plan y est indexée (généralement la part du montant non encore payée à la livraison de l’immeuble) : pendant la construction, cette part augmente avec l’indice, même si le prix de l’appartement est fixé au contrat.',
min_wage:'Le salaire minimum est fixé par la loi et actualisé généralement chaque 1er avril. Il est interdit de payer moins, en toutes circonstances — période d’essai et temps partiel compris (recalculé au prorata). C’est le minimum général ; pour certaines branches, la loi prévoit un seuil plus élevé : sécurité — 7 118,85 ₪/mois (39,11 ₪/heure), nettoyage — 7 118,85 ₪/mois (38,03 ₪/heure), restauration — environ 113 % du minimum général. Vérifiez votre branche dans le calculateur de salaire.',
fx:'Le taux officiel de la Banque d’Israël est publié une fois par jour et sert au calcul des impôts, des droits de douane et de la comptabilité publique. Le taux du marché — celui que vous verrez réellement au bureau de change ou dans l’application bancaire — en diffère généralement de 1,5\u20133 % en votre défaveur (c’est la marge du changeur ou de la banque).',
housing:'Le prix moyen des transactions réelles de vente de logements dans le pays — à ne pas confondre avec l’indice des coûts de construction ci-dessus : ce sont deux indicateurs différents. Publié tous les deux mois sur la base du registre des transactions et non des annonces — il reflète donc ce que les gens ont réellement payé, et non ce que les vendeurs demandent.',
rent:'Loyer moyen d’un appartement de 3 pièces dans les 18 grandes villes d’Israël (plus de 100 000 habitants). Les données du CBS reposent sur des baux réels et non sur des annonces — le chiffre est donc généralement un peu inférieur à celui des sites d’annonces, où l’affiche souvent un prix de départ gonflé pour négocier. Pour un appartement d’une autre taille (1\u20132 ou 5+ pièces), le prix varie proportionnellement à la surface.',
fuel:'Le prix maximal de l’essence est fixé chaque mois par le ministère de l’Énergie (annoncé deux jours avant la fin du mois, en vigueur dès le 1er du mois suivant) selon une formule basée sur les prix moyens du carburant dans le bassin méditerranéen, plus accise et TVA. C’est un plafond : en dessous, les stations peuvent vendre (et le font parfois) ; au-dessus, elles n’y ont pas le droit. Avec service complet (au lieu du libre-service) — supplément d’environ 0,25 ₪/l.'
};


function el(s){return root.querySelector(s);}
var nf=function(n,d){return new Intl.NumberFormat('fr-FR',
  {minimumFractionDigits:d,maximumFractionDigits:d}).format(n);};
function pct(x,d){return nf(x*100,d===undefined?2:d)+'%';}
function money(n){return nf(n,Math.abs(n)>=1000?0:2)+' ₪';}
function dt(s){return s?new Date(s+'T00:00:00').toLocaleDateString('fr-FR',
  {day:'numeric',month:'long',year:'numeric'}):'';}
function dshort(s){return s?new Date(s+'T00:00:00').toLocaleDateString('fr-FR'):'';}

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
    '<div class="tb-tile__more">En savoir plus ›</div>'+
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
        '<label style="font-size:12.5px;font-weight:700;color:var(--tb-muted);display:block;margin-bottom:6px">Choisissez votre ville :</label>'+
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
    sel.innerHTML=names.map(function(c){return '<option value="'+c+'">'+(CITY_FR[c]||c)+'</option>';}).join('');
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
  var diffStr=diff===0?'comme la moyenne nationale':
    (diff>0?new Intl.NumberFormat('fr-FR').format(diff)+' ₪ de plus que la moyenne nationale':
    new Intl.NumberFormat('fr-FR').format(-diff)+' ₪ de moins que la moyenne nationale');
  box.innerHTML='<strong style="font-size:20px;color:var(--tb-text)">'+
    new Intl.NumberFormat('fr-FR').format(val)+' ₪</strong> — loyer moyen d’un appartement de 3 pièces à '+CITY_FR[city]+'<br>'+
    '<span style="opacity:.85">'+diffStr+'</span>';
}
window.tbCityChange=tbCityChange;
function tbCloseModal(){var ov=document.getElementById('tb-modal-overlay');if(ov)ov.classList.remove('show');}
window.tbOpenModal=tbOpenModal;
window.tbCloseModal=tbCloseModal;

function nextCbsPublication(){
  // Le CBS publie le madad et l'indice construction le 15 de chaque mois à 18h30,
  // avec report au jeudi si le 15 tombe un vendredi ou un samedi.
  // Important : le décalage week-end est appliqué AVANT le test "passé ou non" —
  // sinon la date décalée (ex. le 13) resterait "la plus proche"
  // même si ce jour décalé est déjà passé.
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
    rateDelta=arrow(diff)+' '+nf(Math.abs(diff),2)+' pt depuis le '+dshort(b.changed);
  }

  var nextCbs=nextCbsPublication();
  var nextCbsStr=nextCbs.toLocaleDateString('fr-FR',{day:'numeric',month:'long'});

  window.__tbModalData=[];
  el('#tb-grid').innerHTML=
    tile({kind:'rate',icon:'🏛️',label:'Taux de la Banque d’Israël',value:pct(b.rate,2),
      sub:'Prime : <strong>'+pct(b.prime,2)+'</strong>',
      delta:rateDelta,dcls:cls(b.rate-(b.prev_rate||b.rate)),
      expl:EXPL_FR.rate+(b.next_decision?' Prochaine décision : '+dshort(b.next_decision)+'.':''),
      link:['Recalculer sa machkanta','mashkanta.html']})+
    tile({kind:'cpi',icon:'📈',label:'Madad — indice des prix',value:pct(c.yoy,1),
      sub:'sur un an · valeur '+nf(c.value,1),
      delta:'sur un mois '+(c.mom>=0?'+':'−')+nf(Math.abs(c.mom*100),1)+'%',dcls:cls(c.mom),
      expl:EXPL_FR.cpi+' Prochaine publication du CBS — '+nextCbsStr+' à 18 h 30.',
      link:['Calculer l’indexation du loyer','#arenda']})+
    tile({kind:'build',icon:'🏗️',label:'Indice de la construction',value:pct(k.yoy,1),
      sub:'sur un an · valeur '+nf(k.value,1),
      delta:'sur un mois '+(k.mom>=0?'+':'−')+nf(Math.abs(k.mom*100),1)+'%',dcls:cls(k.mom),
      expl:EXPL_FR.construction+' Prochaine publication du CBS — '+nextCbsStr+' à 18 h 30.',
      link:['Impôt à l’achat','mas-rehisha.html']})+
    tile({kind:'wage',icon:'💼',label:'Salaire minimum',value:money(w.min_monthly),
      sub:'de l’heure : '+nf(w.min_hourly,2)+' ₪',
      delta:'en vigueur depuis le '+dshort(w.since),
      expl:EXPL_FR.min_wage,link:['Calculer son salaire','salary.html']})+
    tile({kind:'housing',icon:'🏘️',label:'Indice des prix du logement',value:pct(D.housing.yoy,1),
      sub:'sur un an'+(D.housing.value?' · valeur '+nf(D.housing.value,1):''),
      delta:'sur 2 mois '+(D.housing.mom>=0?'+':'−')+nf(Math.abs(D.housing.mom*100),1)+'%',dcls:cls(D.housing.mom),
      expl:EXPL_FR.housing,link:['Impôt à l’achat','mas-rehisha.html']})+
    tile({kind:'rent',icon:'🏠',label:'Loyer par ville',value:money(D.rent_by_city.national_avg),
      sub:'appartement 3 pièces · moyenne nationale',
      delta:'sur un an +'+nf(D.rent_by_city.yoy*100,1)+'%',dcls:'up',
      expl:EXPL_FR.rent,link:['Louer ou acheter ?','arenda-vs-pokupka.html'],
      cities:D.rent_by_city.cities})+
    tile({kind:'fuel',icon:'⛽',label:'Essence 95',value:nf(D.fuel.price_95,2)+' ₪/l',
      sub:'libre-service · avec service complet +'+nf(D.fuel.full_service_extra,2)+' ₪/l',
      delta:(D.fuel.price_95>=D.fuel.prev_price?'+':'')+nf((D.fuel.price_95-D.fuel.prev_price)*100,0)+' agorot depuis le mois dernier',
      dcls:cls(D.fuel.price_95-D.fuel.prev_price),
      expl:EXPL_FR.fuel,link:['Analyse détaillée du prix','benzin.html']});

  // Devises
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
  el('#tb-fx-note').innerHTML='Combien de shekels pour une unité de devise. '+
    (off?'Taux officiel de la Banque d’Israël au '+dshort(fx.official_date)+' : USD '+
      nf(off,4)+' ₪, EUR '+nf(fx.official.EUR,4)+' ₪. ':'')+EXPL_FR.fx;

  // Calculateur d’indexation du loyer
  function renderRentCalc(){
    var rentInput = el('#tb-rent-input');
    var rent = rentInput ? (+rentInput.value || 0) : 4500;
    var add = rent*c.yoy;
    var resultBox = el('#tb-rent-result');
    var daysLeft = Math.max(0, Math.ceil((nextCbs - new Date()) / 86400000));
    if(resultBox) resultBox.innerHTML = (rent>0 ?
      'Si votre loyer est de '+money(rent)+
      " et qu’il est indexé sur le madad, avec une hausse annuelle de l’indice de "+pct(c.yoy,1)+
      " il augmentera d’environ <strong>"+money(add)+'</strong> par mois — soit '+
      money(add*12)+' par an. '
      : 'Saisissez le montant du loyer pour voir le calcul. ')+
      'Vérifiez la clause d’indexation dans votre contrat : sans elle, le bailleur ne peut pas augmenter le loyer en cours de bail. '+
      '<br><span style="opacity:.8">📅 Prochaine mise à jour de l’indice dans <strong>'+daysLeft+' '+
      (daysLeft===1?'jour':'jours')+'</strong> ('+nextCbsStr+').</span>';
  }
  renderRentCalc();
  if(el('#tb-rent-input')) el('#tb-rent-input').addEventListener('input', renderRentCalc);

  // Historique
  var rows='';
  if(b.prev_rate!=null){
    rows+='<tr><td>Taux de la Banque d’Israël</td><td class="num">'+pct(b.rate,2)+
      '</td><td class="num">'+pct(b.prev_rate,2)+'</td><td>'+dshort(b.changed)+'</td></tr>'+
      '<tr><td>Prime</td><td class="num">'+pct(b.prime,2)+'</td><td class="num">'+
      pct(b.prev_rate+0.015,2)+'</td><td>'+dshort(b.changed)+'</td></tr>';
  }
  rows+='<tr><td>Salaire minimum</td><td class="num">'+money(w.min_monthly)+
    '</td><td class="num">—</td><td>'+dshort(w.since)+'</td></tr>';
  el('#tb-hist tbody').innerHTML=rows;

  // Pied de page
  el('#tb-updated').textContent=dt(D.updated);
  el('#tb-sources').innerHTML=(D.sources||[]).map(function(s){
    var fr=SRC_FR[s.url]||[s.name,s.role]; return '<li><a href="'+s.url+'" target="_blank" rel="noopener nofollow">'+fr[0]+
      '</a> <span class="tb-hint">— '+fr[1]+'</span></li>';}).join('');

  // Statut
  var a=D.auto||{},age=Math.round((new Date()-new Date(D.updated+'T00:00:00'))/86400000);
  var stale=age>3, partial=a.ok===false;
  el('#tb-status').innerHTML='<p class="tb-hint" style="margin:2px 0 0">'+
    (stale?'Données du '+dt(D.updated)+' — des écarts sont possibles.'
          :'Données actualisées le '+dt(D.updated)+' à partir de sources officielles.')+
    (partial?' Une partie des indicateurs a pu ne pas s’actualiser.':'')+'</p>';
}

fetch(SRC,{cache:'no-cache'})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
  .then(function(j){D=j;window.TABLO={data:D};render();})
  .catch(function(e){
    el('#tb-status').innerHTML='<div class="tb-note">Impossible de charger les données ('+
      e.message+'). Vérifiez le chemin vers <code>'+SRC+'</code>.</div>';});
})();
