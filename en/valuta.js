
(function () {
  'use strict';
  var root = document.getElementById('fx-root');
  if (!root) return;

  /* ═══ Sources. Everyone has been checked CORS, ключи не нужны ═══ */
  var API = {
    market:  'https://open.er-api.com/v6/latest/ILS',
    history: 'https://api.frankfurter.dev/v1/',
    // API Банка Израиля отвечает 404 на браузерный Origin — читаем локальный файл,
    // который обновляет GitHub Actions. Без файла страница работает, колонка пустая.
    official: 'data/rates.json'
  };

  var NAMES = {ILS:'Shekel',USD:'US dollar',EUR:'Euro',RUB:'Ruble',UAH:'Hryvnia',GBP:'Lb',
    KZT:'Tenge',GEL:'Lari',TRY:'Lyra',CHF:'Franc',CAD:'Canada dollar',AUD:'Australia dollar',
    PLN:'Zloty',CZK:'Crown',HUF:'Forint',RON:'Lei',BGN:'Lion',MDL:'Mold. lei',AMD:'Dram',
    AZN:'Manat',UZS:'Sum',KGS:'Som',BYN:'Bel. ruble',THB:'Baht',JPY:'Yen',CNY:'Yuan',
    INR:'Rupee',SEK:'Swede. crown',NOK:'Norv. crown',DKK:'Dat. crown',ZAR:'rand',AED:'Dirham',
    JOD:'Dinar',EGP:'Egypt lb.'};
  var FLAGS = {ILS:'🇮🇱',USD:'🇺🇸',EUR:'🇪🇺',RUB:'🇷🇺',UAH:'🇺🇦',GBP:'🇬🇧',KZT:'🇰🇿',GEL:'🇬🇪',
    TRY:'🇹🇷',CHF:'🇨🇭',CAD:'🇨🇦',AUD:'🇦🇺',PLN:'🇵🇱',CZK:'🇨🇿',HUF:'🇭🇺',RON:'🇷🇴',BGN:'🇧🇬',
    MDL:'🇲🇩',AMD:'🇦🇲',AZN:'🇦🇿',UZS:'🇺🇿',KGS:'🇰🇬',BYN:'🇧🇾',THB:'🇹🇭',JPY:'🇯🇵',CNY:'🇨🇳',
    INR:'🇮🇳',SEK:'🇸🇪',NOK:'🇳🇴',DKK:'🇩🇰',ZAR:'🇿🇦',AED:'🇦🇪',JOD:'🇯🇴',EGP:'🇪🇬'};
  var POPULAR = ['USD','EUR','RUB','UAH','GBP','KZT','GEL','TRY'];
  var TICKER  = ['USD','EUR','RUB','UAH','GBP','KZT'];
  var LS = 'fx-v2';

  var D = {market:{},official:{},prev:{},updated:null,officialDate:null,offline:false,list:[]};

  var nf = function (n,d){return new Intl.NumberFormat('en-GB',
    {minimumFractionDigits:d,maximumFractionDigits:d}).format(n);};
  function money(n){var a=Math.abs(n);return nf(n,a>=1000?0:a>=10?2:4);}
  function rate(n){var a=Math.abs(n);return nf(n,a>=100?2:a>=1?4:6);}
  function el(s){return root.querySelector(s);}
  function els(s){return Array.prototype.slice.call(root.querySelectorAll(s));}
  function name(c){return NAMES[c]||c;}
  function flag(c){return FLAGS[c]||'💱';}
  function parseNum(s){var v=parseFloat(String(s).replace(/\s/g,'').replace(',','.'));return isFinite(v)?v:0;}

  function readHash(){var o={},q=location.hash.replace(/^#/,'');
    q.split('&').forEach(function(p){if(!p)return;var kv=p.split('=');
      o[decodeURIComponent(kv[0])]=decodeURIComponent(kv[1]||'');});return o;}
  function writeHash(o){var a=[];Object.keys(o).forEach(function(k){
    if(o[k]!==''&&o[k]!=null)a.push(encodeURIComponent(k)+'='+encodeURIComponent(o[k]));});
    history.replaceState(null,'',a.length?'#'+a.join('&'):location.pathname);}
  var H = readHash();

  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function load(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}

  function fetchJSON(u,ms){
    return new Promise(function(res,rej){
      var t=setTimeout(function(){rej(new Error('timeout'));},ms||12000);
      fetch(u,{cache:'no-cache'}).then(function(r){clearTimeout(t);
        if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
        .then(res).catch(function(e){clearTimeout(t);rej(e);});
    });
  }

  function loadRates(){
    var cached=load(LS+'-rates');
    if(cached&&cached.market){D.market=cached.market;D.official=cached.official||{};
      D.updated=cached.updated;D.officialDate=cached.officialDate;D.prev=cached.prev||{};}
    return fetchJSON(API.market).then(function(j){
      if(!j||!j.rates)throw new Error('no data');
      var m={};
      Object.keys(j.rates).forEach(function(c){var v=j.rates[c];
        if(v&&isFinite(v)&&v>0)m[c]=1/v;});   // шекелей за 1 единицу
      m.ILS=1;
      D.prev=(cached&&cached.market)?cached.market:{};
      D.market=m; D.updated=j.time_last_update_utc||new Date().toUTCString(); D.offline=false;
      return fetchJSON(API.official,6000).catch(function(){return null;});
    }).then(function(off){
      if(off&&off.fx&&!off.rates){ off={rates:off.fx, date:off.updated}; } // наш формат rates.json -> ожидаемый модулем
      if(off&&off.rates){D.official=off.rates;D.officialDate=off.date||off.updated;}
      D.list=Object.keys(D.market).filter(function(c){return c!=='ILS';}).sort();
      save(LS+'-rates',{market:D.market,official:D.official,updated:D.updated,
        officialDate:D.officialDate,prev:D.prev});
    }).catch(function(e){
      if(D.market&&Object.keys(D.market).length){D.offline=true;
        D.list=Object.keys(D.market).filter(function(c){return c!=='ILS';}).sort();return;}
      throw e;
    });
  }

  function renderStatus(){
    var when=D.updated?new Date(D.updated):null, s=el('#fx-status');
    if(D.offline){
      s.innerHTML='<div class=\"fx-warn\"><strong>There is no connection with the course server.</strong> Showing the latest'+
        'saved values'+(when?'from'+when.toLocaleString('en-US'):'')+'.</div>';
      return;
    }
    var bits=[];
    if(when)bits.push('Updated'+when.toLocaleString('en-US',
      {day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}));
    if(D.officialDate)bits.push('official Bank of Israel exchange rate'+
      new Date(D.officialDate).toLocaleDateString('en-GB'));
    s.innerHTML='<p class="fx-hint" style="margin:0 0 2px">'+bits.join(' · ')+'</p>';
  }

  function renderTicker(){
    el('#fx-ticker').innerHTML=TICKER.map(function(c){
      var v=D.market[c]; if(!v)return '';
      var p=D.prev[c], d=(p&&p>0)?(v-p)/p*100:null;
      var cls=d==null?'':(d>=0?'fx-up':'fx-down'), arrow=d==null?'':(d>=0?'▲':'▼');
      return '<button type="button" class="fx-tick" data-cur="'+c+'">'+
        '<span class="fx-tick__c"><span class="fx-flag">'+flag(c)+'</span>'+c+'</span>'+
        '<span class="fx-tick__v fx-num">'+rate(v)+'</span>'+
        '<span class="fx-tick__d '+cls+'">'+(d==null?'&nbsp;':arrow+' '+nf(Math.abs(d),2)+'%')+
        '</span></button>';
    }).join('');
    els('[data-cur]').forEach(function(b){
      b.addEventListener('click',function(){
        el('#fx-c1').value=b.getAttribute('data-cur'); el('#fx-c2').value='ILS';
        activate('conv'); convert('a1');
      });
    });
  }

  function fillSelects(){
    var opts=['ILS'].concat(D.list).map(function(c){
      return '<option value="'+c+'">'+flag(c)+' '+c+'</option>';}).join('');
    el('#fx-c1').innerHTML=opts; el('#fx-c2').innerHTML=opts;
    el('#fx-c1').value=(H.from&&D.market[H.from])?H.from:'USD';
    el('#fx-c2').value=(H.to&&D.market[H.to])?H.to:'ILS';
    el('#fx-a1').value=H.amt||'1000';
  }

  var SPREAD=0.03; // типичный суммарный спред обменника/банка — 1.5% в каждую сторону
  D.realistic=false; // по умолчанию — средний рыночный курс

  // Продаёте валюту c (получаете ILS) — обменник покупает у вас по курсу похуже (ниже)
  function toILS(a,c){
    if(c==='ILS')return a;
    var m=D.market[c]||0;
    var rate=D.realistic?m*(1-SPREAD/2):m;
    return a*rate;
  }
  // Покупаете валюту c (тратите ILS) — обменник продаёт вам по курсу похуже (выше)
  function fromILS(a,c){
    if(c==='ILS')return a;
    var m=D.market[c]||1;
    var rate=D.realistic?m*(1+SPREAD/2):m;
    return a/rate;
  }

  function convert(src){
    var c1=el('#fx-c1').value, c2=el('#fx-c2').value;
    if(src==='a2'){
      var v2=parseNum(el('#fx-a2').value);
      el('#fx-a1').value=money(fromILS(toILS(v2,c2),c1));
    }else{
      var v1=parseNum(el('#fx-a1').value);
      el('#fx-a2').value=money(fromILS(toILS(v1,c1),c2));
    }
    var one=fromILS(toILS(1,c1),c2);
    el('#fx-rateline').innerHTML='1 '+c1+' = <b class="fx-num">'+rate(one)+'</b> '+c2+
      '<br><span class="fx-hint">1 '+c2+' = '+rate(1/one)+' '+c1+'</span>';
    renderCompare(c1,c2);
    var h=readHash(); h.from=c1; h.to=c2; h.amt=el('#fx-a1').value; writeHash(h);
    els('#fx-quick .fx-chip').forEach(function(b){
      b.setAttribute('aria-pressed',b.getAttribute('data-q')===c1&&c2==='ILS');});
  }

  function renderCompare(c1,c2){
    var box=el('#fx-cmp'), pair=(c1!=='ILS'?c1:c2);
    if(pair==='ILS'){box.innerHTML='';return;}
    var mk=D.market[pair], of=D.official[pair];
    var sellToYou=mk*(1+SPREAD/2);   // обменник продаёт вам валюту — курс хуже (дороже)
    var buyFromYou=mk*(1-SPREAD/2);  // обменник покупает у вас валюту — курс хуже (дешевле)
    var html='<div class="fx-cmp__i"><span class="fx-cmp__l">Market rate (average)</span>'+
      '<span class="fx-cmp__v fx-num">'+rate(mk)+' ₪</span></div>';
    html+='<div class=\"fx-cmp__i\"><span class=\"fx-cmp__l\">Buy'+pair+'- they sell you</span>'+
      '<span class="fx-cmp__v fx-num">'+rate(sellToYou)+' ₪</span>'+
      '<span class="fx-hint">more expensive than average - rating</span></div>';
    html+='<div class=\"fx-cmp__i\"><span class=\"fx-cmp__l\">Sell'+pair+'— they buy from you</span>'+
      '<span class="fx-cmp__v fx-num">'+rate(buyFromYou)+' ₪</span>'+
      '<span class="fx-hint">cheaper than average - estimate</span></div>';
    if(of){
      var diff=(mk-of)/of*100;
      html+='<div class="fx-cmp__i"><span class="fx-cmp__l">Bank of Israel</span>'+
        '<span class="fx-cmp__v fx-num">'+rate(of)+' ₪</span>'+
        '<span class="fx-hint '+(diff>=0?'fx-up':'fx-down')+'\">difference'+nf(Math.abs(diff),2)+'%</span></div>';
    }
    var amt=parseNum(el('#fx-a1').value)||0, ilsSum=toILS(amt,c1);
    if(ilsSum>0){
      html+='<div class="fx-cmp__i"><span class="fx-cmp__l">Loss at 2% markup</span>'+
        '<span class="fx-cmp__v fx-num">−'+money(ilsSum*0.02)+' ₪</span>'+
        '<span class="fx-hint">typical bank margin</span></div>';
    }
    box.innerHTML=html;
  }

  function renderQuick(){
    el('#fx-quick').innerHTML=POPULAR.map(function(c){
      return '<button type="button" class="fx-chip" data-q="'+c+'" aria-pressed="false">'+
        flag(c)+' '+c+'</button>';}).join('');
    els('#fx-quick .fx-chip').forEach(function(b){
      b.addEventListener('click',function(){
        el('#fx-c1').value=b.getAttribute('data-q'); el('#fx-c2').value='ILS'; convert('a1');});
    });
  }

  /* ═══ Корзина ═══ */
  var basket=[];
  function loadBasket(){
    if(H.b){
      basket=H.b.split(',').map(function(p){var kv=p.split(':');
        return {cur:kv[0],amt:parseFloat(kv[1])||0};}).filter(function(x){return x.cur;});
    }else{
      basket=load(LS+'-basket')||[{cur:'USD',amt:5000},{cur:'ILS',amt:20000}];
    }
  }
  function persistBasket(){save(LS+'-basket',basket);}

  function renderBasket(){
    var box=el('#fx-basket');
    if(!basket.length){
      box.innerHTML='<p class="fx-hint">The cart is empty. Add currency using the button below.</p>';
    }else{
      var opts=['ILS'].concat(D.list);
      box.innerHTML=basket.map(function(r,i){
        return '<div class="fx-brow">'+
          '<select data-bc="'+i+'" aria-label="Currency">'+opts.map(function(c){
            return '<option value="'+c+'"'+(c===r.cur?' selected':'')+'>'+flag(c)+' '+c+'</option>';
          }).join('')+'</select>'+
          '<input type="text" inputmode="decimal" size="1" data-ba="'+i+'" value="'+r.amt+'" aria-label="Sum">'+
          '<span class="fx-brow__ils" data-bi="'+i+'"></span>'+
          '<button type="button" class="fx-brow__del" data-bd="'+i+'" aria-label="Delete">×</button></div>';
      }).join('');
      els('[data-bc]').forEach(function(s){s.addEventListener('change',function(){
        basket[+s.getAttribute('data-bc')].cur=s.value;calcBasket();persistBasket();});});
      els('[data-ba]').forEach(function(inp){inp.addEventListener('input',function(){
        basket[+inp.getAttribute('data-ba')].amt=parseNum(inp.value);calcBasket();persistBasket();});});
      els('[data-bd]').forEach(function(b){b.addEventListener('click',function(){
        basket.splice(+b.getAttribute('data-bd'),1);renderBasket();persistBasket();});});
    }
    calcBasket();
  }

  var PALETTE=['#0b7a6d','#2f6df6','#c07d15','#7c3aed','#e0393e','#0a9757','#db2777','#0891b2'];

  function calcBasket(){
    var total=0, parts=[];
    basket.forEach(function(r,i){
      var ils=toILS(r.amt,r.cur); total+=ils; parts.push({cur:r.cur,ils:ils});
      var n=root.querySelector('[data-bi="'+i+'"]'); if(n)n.textContent=money(ils)+' ₪';
    });
    el('#fx-btotal').textContent=money(total)+' ₪';

    var bars='', legend='';
    parts.forEach(function(p,i){
      if(total<=0||p.ils<=0)return;
      var pc=p.ils/total*100, col=PALETTE[i%PALETTE.length];
      bars+='<div style="width:'+pc+'%;background:'+col+'" title="'+p.cur+' '+nf(pc,1)+'%"></div>';
      legend+='<span><i style="background:'+col+'"></i>'+p.cur+' '+nf(pc,1)+'%</span>';
    });
    el('#fx-bbars').innerHTML=bars; el('#fx-blegend').innerHTML=legend;

    var curs=parts.filter(function(p){return p.cur!=='ILS';}).map(function(p){return p.cur;});
    if(!curs.length||total<=0){el('#fx-bchange').innerHTML='';return;}
    var d=new Date(); d.setDate(d.getDate()-30);
    fetchJSON(API.history+d.toISOString().slice(0,10)+'?base=ILS&symbols='+curs.join(','),9000)
      .then(function(j){
        if(!j||!j.rates)return;
        var old=0, ok=false;
        parts.forEach(function(p){
          if(p.cur==='ILS'){old+=p.ils;return;}
          var r=j.rates[p.cur];
          if(r){var amt=basket.filter(function(b){return b.cur===p.cur;})
            .reduce(function(s,b){return s+b.amt;},0); old+=amt/r; ok=true;}
          else old+=p.ils;
        });
        if(!ok||old<=0)return;
        var diff=total-old, pc=diff/old*100;
        el('#fx-bchange').innerHTML='<div class=\"fx-note\">Last month cart'+
          (diff>=0?'went up in price':'fell in price')+'on<strong class=\"'+(diff>=0?'fx-up':'fx-down')+
          '">'+money(Math.abs(diff))+' ₪ ('+nf(Math.abs(pc),2)+'%)</strong> - only through courses.</div>';
      }).catch(function(){});
  }

  /* ═══ График ═══ */
  var chartCur=H.ch||'USD', chartPer=H.cp||'90';

  function renderChartControls(){
    el('#fx-chart-cur').innerHTML=['USD','EUR','GBP','CHF','JPY'].map(function(c){
      return '<button type="button" class="fx-chip" data-cc="'+c+'" aria-pressed="'+
        (c===chartCur)+'">'+flag(c)+' '+c+'</button>';}).join('');
    el('#fx-chart-per').innerHTML=[['30','Month'],['90','3 months'],['365','Year']].map(function(p){
      return '<button type="button" class="fx-chip" data-cp="'+p[0]+'" aria-pressed="'+
        (p[0]===chartPer)+'">'+p[1]+'</button>';}).join('');
    els('[data-cc]').forEach(function(b){b.addEventListener('click',function(){
      chartCur=b.getAttribute('data-cc');renderChartControls();drawChart();});});
    els('[data-cp]').forEach(function(b){b.addEventListener('click',function(){
      chartPer=b.getAttribute('data-cp');renderChartControls();drawChart();});});
  }

  function drawChart(){
    var svg=el('#fx-chart');
    svg.innerHTML='<text x="380" y="130" text-anchor="middle">Loading data...</text>';
    var end=new Date(), start=new Date();
    start.setDate(start.getDate()-parseInt(chartPer,10));
    var url=API.history+start.toISOString().slice(0,10)+'..'+end.toISOString().slice(0,10)+
            '?base=ILS&symbols='+chartCur;
    var h=readHash(); h.ch=chartCur; h.cp=chartPer; writeHash(h);

    fetchJSON(url,14000).then(function(j){
      if(!j||!j.rates)throw new Error('no data');
      var pts=Object.keys(j.rates).sort().map(function(d){
        var v=j.rates[d][chartCur]; return v?{d:d,v:1/v}:null;}).filter(Boolean);
      if(pts.length<2)throw new Error('few points');

      var vals=pts.map(function(p){return p.v;});
      var min=Math.min.apply(null,vals), max=Math.max.apply(null,vals);
      var pad=(max-min)*0.14||0.01; min-=pad; max+=pad;
      var W=760,Hh=260,ml=10,mr=10,mt=16,mb=26;
      var x=function(i){return ml+i*(W-ml-mr)/(pts.length-1);};
      var y=function(v){return mt+(max-v)/(max-min)*(Hh-mt-mb);};

      var dLine=pts.map(function(p,i){return (i?'L':'M')+x(i).toFixed(1)+' '+y(p.v).toFixed(1);}).join(' ');
      var dArea=dLine+' L'+x(pts.length-1).toFixed(1)+' '+(Hh-mb)+' L'+ml+' '+(Hh-mb)+' Z';

      var defs='<defs><linearGradient id="fxgrad" x1="0" y1="0" x2="1" y2="0">'+
        '<stop offset="0%" stop-color="var(--fx-brand)"/><stop offset="100%" stop-color="var(--fx-brand-2)"/>'+
        '</linearGradient><linearGradient id="fxfill" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0%" stop-color="var(--fx-brand)" stop-opacity=".22"/>'+
        '<stop offset="100%" stop-color="var(--fx-brand)" stop-opacity="0"/></linearGradient></defs>';

      var grid='',labels='';
      for(var g=0;g<=3;g++){
        var vv=min+(max-min)*g/3, yy=y(vv);
        grid+='<line class="grid" x1="'+ml+'" y1="'+yy.toFixed(1)+'" x2="'+(W-mr)+'" y2="'+yy.toFixed(1)+'"/>';
        labels+='<text x="'+(ml+4)+'" y="'+(yy-5).toFixed(1)+'">'+nf(vv,3)+'</text>';
      }
      var f=pts[0], l=pts[pts.length-1];
      labels+='<text x="'+ml+'" y="'+(Hh-7)+'">'+f.d.slice(5)+'</text>'+
              '<text x="'+(W-mr)+'" y="'+(Hh-7)+'" text-anchor="end">'+l.d.slice(5)+'</text>';

      svg.innerHTML=defs+grid+'<path class="area" d="'+dArea+'"/><path class="line" d="'+dLine+'"/>'+
        '<circle cx="'+x(pts.length-1).toFixed(1)+'" cy="'+y(l.v).toFixed(1)+
        '" r="5" fill="var(--fx-brand)" stroke="var(--fx-card)" stroke-width="2.5"/>'+labels;

      var chg=(l.v-f.v)/f.v*100;
      el('#fx-chart-stats').innerHTML=
        stat('Now',rate(l.v)+' ₪')+
        stat('Minimum',rate(Math.min.apply(null,vals))+' ₪')+
        stat('Maximum',rate(Math.max.apply(null,vals))+' ₪')+
        stat('Change','<span class="'+(chg>=0?'fx-up':'fx-down')+'">'+
          (chg>=0?'+':'−')+nf(Math.abs(chg),2)+'%</span>');
      el('#fx-chart-note').textContent='Course 1'+chartCur+'in shekels. European data'+
        'central bank, published on weekdays. Points on the graph:'+pts.length+'.';
    }).catch(function(){
      svg.innerHTML='<text x="380" y="130" text-anchor="middle">Failed to load history</text>';
      el('#fx-chart-stats').innerHTML='';
    });

    function stat(l,v){return '<div class="fx-stat"><span class="fx-stat__l">'+l+
      '</span><span class="fx-stat__v fx-num">'+v+'</span></div>';}
  }

  function renderTable(){
    var order=POPULAR.concat(D.list.filter(function(c){return POPULAR.indexOf(c)<0;}));
    el('#fx-alltable tbody').innerHTML=order.map(function(c){
      var v=D.market[c]; if(!v)return '';
      var of=D.official[c], p=D.prev[c], d=(p&&p>0)?(v-p)/p*100:null;
      return '<tr><td><span class="fx-flag">'+flag(c)+'</span><strong>'+c+'</strong> '+
        '<span class="fx-hint">'+name(c)+'</span></td>'+
        '<td class="num">'+rate(v)+' ₪</td>'+
        '<td class="num">'+(of?rate(of)+' ₪ <span class="fx-badge fx-badge--ok">official</span>':'—')+'</td>'+
        '<td class="num '+(d==null?'':(d>=0?'fx-up':'fx-down'))+'">'+
        (d==null?'—':(d>=0?'+':'−')+nf(Math.abs(d),2)+'%')+'</td></tr>';
    }).join('');
  }

  function activate(n){
    els('.fx-tab').forEach(function(t){t.setAttribute('aria-selected',t.getAttribute('data-tab')===n);});
    els('.fx-panel').forEach(function(p){p.hidden=p.getAttribute('data-panel')!==n;});
    var h=readHash(); h.t=n; writeHash(h);
    if(n==='chart')drawChart();
  }

  function initTabs(){
    var tabs=els('.fx-tab');
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){activate(t.getAttribute('data-tab'));});
      t.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight'){tabs[(i+1)%tabs.length].focus();e.preventDefault();}
        if(e.key==='ArrowLeft'){tabs[(i-1+tabs.length)%tabs.length].focus();e.preventDefault();}
      });
    });
    activate(H.t||'conv');
  }

  function copyLink(btn,label){
    var t=btn.textContent;
    if(navigator.clipboard)navigator.clipboard.writeText(location.href);
    btn.textContent=label||'Copied ✓';
    setTimeout(function(){btn.textContent=t;},1800);
  }

  function initTheme(){
    var saved=load(LS+'-theme');
    if(saved)root.setAttribute('data-theme',saved);
    el('#fx-theme').addEventListener('click',function(){
      var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
      root.setAttribute('data-theme',next); save(LS+'-theme',next);
    });
  }

  // Скелетоны, пока грузятся курсы
  el('#fx-ticker').innerHTML=TICKER.map(function(){return '<div class="fx-skel"></div>';}).join('');

  loadRates().then(function(){
    fillSelects(); renderQuick(); renderTicker(); renderStatus(); renderTable();
    loadBasket(); renderBasket(); renderChartControls(); initTabs(); initTheme();

    el('#fx-a1').addEventListener('input',function(){convert('a1');});
    el('#fx-realistic-toggle').addEventListener('change',function(){D.realistic=this.checked;convert('a1');});
    el('#fx-a2').addEventListener('input',function(){convert('a2');});
    el('#fx-c1').addEventListener('change',function(){convert('a1');});
    el('#fx-c2').addEventListener('change',function(){convert('a1');});
    el('#fx-swap').addEventListener('click',function(){
      var a=el('#fx-c1').value; el('#fx-c1').value=el('#fx-c2').value; el('#fx-c2').value=a; convert('a1');});
    el('#fx-share').addEventListener('click',function(){copyLink(this);});
    el('#fx-bshare').addEventListener('click',function(){
      var h=readHash(); h.b=basket.map(function(r){return r.cur+':'+r.amt;}).join(',');
      h.t='basket'; writeHash(h); copyLink(this,'Link copied ✓');});
    el('#fx-tobasket').addEventListener('click',function(){
      basket.push({cur:el('#fx-c1').value,amt:parseNum(el('#fx-a1').value)});
      persistBasket(); renderBasket(); activate('basket');});
    el('#fx-badd').addEventListener('click',function(){
      basket.push({cur:'EUR',amt:1000}); persistBasket(); renderBasket();});
    el('#fx-bclear').addEventListener('click',function(){
      basket=[]; persistBasket(); renderBasket();});

    convert('a1');
    setInterval(function(){
      loadRates().then(function(){renderTicker();renderStatus();renderTable();convert('a1');calcBasket();})
                 .catch(function(){});
    },600000);
  }).catch(function(e){
    el('#fx-ticker').innerHTML='';
    el('#fx-status').innerHTML='<div class="fx-warn"><strong>Failed to load courses.</strong> '+
      'Check your connection and refresh the page. ('+e.message+')</div>';
  });
})();
