
/* ══ DATA (pulled from data/rates.json, there are defaults) ══ */
var R={prime:5.0,boi:3.5,cpi:1.6,avg:3.52,
  byTerm:{5:3.57,10:3.56,15:3.29,20:3.54,25:3.44,30:3.46},
  op:60,noNotice:0.001,updated:null};

var TRACKS=[
 {t:"prime", n:"Prime",                      free:true,  linked:false},
 {t:"kalatz",n:"Fix. without indexation (KALATS)",free:false, linked:false},
 {t:"katz",  n:'Fixed, CPI-linked (Kalatz)',  free:false, linked:true},
 {t:"var5",  n:"Variable every 5 years",      free:false, linked:false},
 {t:"var1",  n:"Variable once a year",        free:true,  linked:false}
];
function def(t){for(var i=0;i<TRACKS.length;i++)if(TRACKS[i].t===t)return TRACKS[i];return TRACKS[1]}

var rows=[], MODE='payment';

/* ══ ФИНАНСОВОЕ ЯДРО (не менять без пересчёта тестов) ══ */
function pmt(P,ann,yrs){
  var i=ann/100/12,n=Math.round(yrs*12);
  if(n<=0)return 0;
  return i<=0? P/n : P*i/(1-Math.pow(1+i,-n));
}
function balAfter(P0,ann,pay,k){
  if(P0<=0)return 0;
  var i=ann/100/12;
  if(k<=0)return P0;
  if(i<=0)return Math.max(0,P0-pay*k);
  var g=Math.pow(1+i,k);
  return Math.max(0,P0*g-pay*(g-1)/i);
}
function monthsToPayoff(P0,ann,pay){
  if(P0<=0)return 0;
  var i=ann/100/12;
  if(i<=0)return P0/pay;
  if(pay<=P0*i)return Infinity;
  return -Math.log(1-i*P0/pay)/Math.log(1+i);
}
function fvAnnuity(m,r,n){
  if(n<=0)return 0;
  return r<=0? m*n : m*(Math.pow(1+r,n)-1)/r;
}
function discount(y,zt){
  if(zt==='zakaut'){
    if(y>=4)return .40; if(y>=3)return .30; if(y>=2)return .20; if(y>=1)return .10; return 0;
  }
  if(y>=5)return .30; if(y>=3)return .20; return 0;
}
function mktRate(y){
  var k=[5,10,15,20,25,30],b=30;
  for(var i=0;i<k.length;i++){if(y<=k[i]){b=k[i];break}}
  return R.byTerm[b];
}
function ivun(repaid,rate,years,disc){
  var mkt=mktRate(years), gap=rate-mkt;
  if(gap<=0||repaid<=0)return 0;
  var i=mkt/100/12,m=gap/100/12,n=Math.round(years*12);
  var pay=pmt(repaid,rate,years),bal=repaid,pv=0;
  for(var k=1;k<=n;k++){
    pv+=(bal*m)/Math.pow(1+i,k);
    bal-=(pay-bal*(rate/100/12));
    if(bal<=0)break;
  }
  return pv*(1-disc);
}

function rankTracks(hor,disc){
  return rows.map(function(r){
    var d=def(r.type);
    var eff=r.rate+(d.linked?R.cpi:0);
    var feePct=d.free?0:(ivun(r.bal,r.rate,r.years,disc)/Math.max(1,r.bal));
    var score=(eff/100)*Math.min(hor,r.years)-feePct;
    return {r:r,d:d,eff:eff,feePct:feePct,score:score};
  }).sort(function(a,b){return b.score-a.score});
}

function allocate(lump,ranked,disc){
  var fees=0;
  for(var pass=0;pass<2;pass++){
    var left=Math.max(0,lump-fees),f=0;
    ranked.forEach(function(x){
      var amt=Math.min(left,x.r.bal);
      x.repaid=amt; left-=amt;
      x.fee=x.d.free?0:ivun(amt,x.r.rate,x.r.years,disc);
      f+=x.fee;
    });
    fees=f;
  }
  var totalRepaid=ranked.reduce(function(a,x){return a+x.repaid},0);
  var noNotice=totalRepaid*R.noNotice;
  return {fees:fees+noNotice+(totalRepaid>0?R.op:0),repaid:totalRepaid};
}

function scenarios(lump,ret,tax,hor,disc,mode){
  var rNet=ret*(1-tax/100)/100/12, H=Math.round(hor*12);
  var ranked=rankTracks(hor,disc);
  var alloc=allocate(lump,ranked,disc);

  var payBefore=0, debtB=0;
  rows.forEach(function(r){
    var p=pmt(r.bal,r.rate,r.years);
    payBefore+=p;
    debtB+=balAfter(r.bal,r.rate,p,Math.min(H,Math.round(r.years*12)));
  });

  var nwB=lump*Math.pow(1+rNet,H)-debtB;

  var nwA=0, freedTotal=0, payAfterTotal=0;
  if(mode==='payment'){
    var debtA=0;
    ranked.forEach(function(x){
      var r=x.r, nb=Math.max(0,r.bal-x.repaid);
      var pB=pmt(r.bal,r.rate,r.years);
      var pA=nb>0?pmt(nb,r.rate,r.years):0;
      freedTotal+=(pB-pA); payAfterTotal+=pA;
      debtA+=nb>0?balAfter(nb,r.rate,pA,Math.min(H,Math.round(r.years*12))):0;
    });
    nwA=fvAnnuity(freedTotal,rNet,H)-debtA;
  }else{
    var debtA2=0, invA=0;
    ranked.forEach(function(x){
      var r=x.r, nb=Math.max(0,r.bal-x.repaid);
      var p=pmt(r.bal,r.rate,r.years);
      payAfterTotal+=p;
      if(nb<=0){ invA+=fvAnnuity(p,rNet,H); freedTotal+=p; return; }
      var nLeft=monthsToPayoff(nb,r.rate,p);
      var origLeft=Math.round(r.years*12);
      nLeft=Math.min(nLeft,origLeft);
      if(nLeft>=H){
        debtA2+=balAfter(nb,r.rate,p,H);
      }else{
        var freeM=H-Math.round(nLeft);
        invA+=fvAnnuity(p,rNet,freeM);
      }
    });
    nwA=invA-debtA2;
  }
  return {nwA:nwA,nwB:nwB,ranked:ranked,alloc:alloc,
          payBefore:payBefore,freed:freedTotal,payAfter:payAfterTotal};
}

function breakeven(lump,tax,hor,disc,mode){
  var lo=0,hi=40;
  var f=function(x){var s=scenarios(lump,x,tax,hor,disc,mode);return s.nwA-s.nwB};
  if(f(lo)<0)return null;
  if(f(hi)>0)return null;
  for(var i=0;i<40;i++){
    var mid=(lo+hi)/2;
    if(f(mid)>0)lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}

/* ══ UI ══ */
function addTrack(p){
  rows.push(Object.assign({id:'t'+Math.random().toString(36).slice(2,8),
    bal:400000,rate:4.5,years:20,type:'kalatz'},p||{}));
  render();
}
function render(){
  var h='';
  rows.forEach(function(r){
    var d=def(r.type);
    h+='<div class="trk"><div class="trk-h">'+
      '<select onchange="upd(\''+r.id+'\',\'type\',this.value)">';
    TRACKS.forEach(function(t){
      h+='<option value="'+t.t+'"'+(t.t===r.type?' selected':'')+'>'+t.n+'</option>';
    });
    h+='</select><span class="tag '+(d.free?'free':'fee')+'">'+(d.free?'no penalty':'there is a fine')+'</span>'+
      (rows.length>1?'<button class="del" type="button" onclick="del(\''+r.id+'\')" aria-label="Delete channel">✕</button>':'')+
      '</div><div class="grid3">'+
      '<div class="f"><label>Balance, ₪</label><input type="number" value="'+r.bal+'" step="10000" oninput="upd(\''+r.id+'\',\'bal\',this.value)"></div>'+
      '<div class="f"><label>Bid, %</label><input type="number" value="'+r.rate+'" step="0.05" oninput="upd(\''+r.id+'\',\'rate\',this.value)"></div>'+
      '<div class="f"><label>Years left</label><input type="number" value="'+r.years+'" step="1" min="1" max="30" oninput="upd(\''+r.id+'\',\'years\',this.value)"></div>'+
      '</div></div>';
  });
  document.getElementById('tracks').innerHTML=h;
}
function upd(id,k,v){
  rows.forEach(function(r){if(r.id===id)r[k]=(k==='type')?v:(+v||0)});
  if(k==='type')render();
}
function del(id){rows=rows.filter(function(r){return r.id!==id});render()}
function setMode(m){
  MODE=m;
  document.getElementById('m-pay').className=(m==='payment')?'on':'';
  document.getElementById('m-term').className=(m==='term')?'on':'';
  document.getElementById('modeHint').textContent=(m==='payment')
    ?'The term remains the same, the monthly payment is reduced. We invest the released difference.'
    :'The payment remains the same, the mortgage closes earlier. After closing the payment we invest.';
}
function fmt(n){return Math.round(n).toLocaleString('en-US')}

function drawSilukChart(points){
  var W=640,H=260,padL=54,padR=14,padT=16,padB=30;
  var plotW=W-padL-padR, plotH=H-padT-padB;
  var allVals=points.map(function(p){return p.pay}).concat(points.map(function(p){return p.inv}));
  var maxV=Math.max(1,Math.max.apply(null,allVals));
  var minV=Math.min(0,Math.min.apply(null,allVals));
  var range=maxV-minV||1;
  function x(i){return padL+(plotW*i/(points.length-1))}
  function y(v){return padT+plotH-(plotH*(v-minV)/range)}
  function pathFor(key){return points.map(function(p,i){return (i===0?'M':'L')+x(i)+','+y(p[key])}).join(' ')}
  function fmtShort(n){return Math.abs(n)>=1000000?(n/1000000).toFixed(1)+'M':Math.abs(n)>=1000?Math.round(n/1000)+'K':Math.round(n)}

  var gridLines='';
  for(var g=0;g<=4;g++){
    var gv=minV+range*g/4, gy=y(gv);
    gridLines+='<line x1="'+padL+'" y1="'+gy+'" x2="'+(W-padR)+'" y2="'+gy+'" stroke="var(--line)" stroke-width="1" stroke-dasharray="3,3"/>';
    gridLines+='<text x="'+(padL-8)+'" y="'+(gy+4)+'" font-size="10" fill="var(--muted)" text-anchor="end">'+fmtShort(gv)+'</text>';
  }
  var xLabels='';
  points.forEach(function(p,i){
    xLabels+='<text x="'+x(i)+'" y="'+(H-8)+'" font-size="10" fill="var(--muted)" text-anchor="middle">'+p.y+'l</text>';
  });
  var dotsPay=points.map(function(p,i){return '<circle cx="'+x(i)+'" cy="'+y(p.pay)+'" r="3.5" fill="var(--green)"/>'}).join('');
  var dotsInv=points.map(function(p,i){return '<circle cx="'+x(i)+'" cy="'+y(p.inv)+'" r="3.5" fill="var(--blue)"/>'}).join('');

  var svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">'+
    gridLines+
    '<path d="'+pathFor('pay')+'" fill="none" stroke="var(--green)" stroke-width="2.5"/>'+
    '<path d="'+pathFor('inv')+'" fill="none" stroke="var(--blue)" stroke-width="2.5"/>'+
    dotsPay+dotsInv+xLabels+
    '</svg>'+
    '<div style="display:flex;gap:16px;justify-content:center;margin-top:8px;font-size:11.5px;color:var(--muted)">'+
    '<span>🟢 Redeem</span><span>🔵 Invest</span></div>';
  document.getElementById('siluk-chart-wrap').innerHTML=svg;
}

function calc(){
  var lump=+document.getElementById('lump').value||0;
  var ret=+document.getElementById('ret').value||0;
  var tax=+document.getElementById('tax').value||0;
  var hor=+document.getElementById('hor').value||1;
  var taken=+document.getElementById('taken').value;
  var zt=document.getElementById('ztype').value;
  var hasFund=document.getElementById('fund').checked;
  var usesKeren=document.getElementById('keren').checked;
  var disc=discount(taken,zt);

  var totalBal=rows.reduce(function(a,r){return a+r.bal},0);
  if(lump>totalBal)lump=totalBal;

  var s=scenarios(lump,ret,tax,hor,disc,MODE);
  var other=scenarios(lump,ret,tax,hor,disc,MODE==='payment'?'term':'payment');
  var be=breakeven(lump,tax,hor,disc,MODE);
  var d=s.nwA-s.nwB;
  var rel=Math.abs(d)/Math.max(Math.abs(s.nwA),Math.abs(s.nwB),1);
  var close=rel<0.05;
  var h='';

  var cls=close?'v-eq':(d>0?'v-pay':'v-inv');
  var lbl=close?'The options are approximately equivalent'
    :(d>0?'It is more profitable to pay off the mortgage':'It\'s more profitable to invest');
  h+='<div class="verdict '+cls+'"><div class="v-lbl">'+lbl+'</div>'+
     '<div class="v-num">'+(close?'≈ '+fmt(Math.abs(d))+' ₪':(d>0?'+':'−')+fmt(Math.abs(d))+' ₪')+'</div>'+
     '<div class="v-sub">'+(close
       ? 'The difference is less than 5% for'+hor+'years - decide in relation to risk, not by number'
       : 'difference for'+hor+'years at a profitability'+ret+'% and tax'+tax+'%')+'</div></div>';

  h+='<div class="kpi">'+
    '<div class="k"><div class="n">'+(be===null?'—':be.toFixed(2)+'%')+'</div><div class="l">Point of indifference</div></div>'+
    '<div class="k"><div class="n" style="color:'+(s.alloc.fees>0?'var(--red)':'var(--green)')+'">'+fmt(s.alloc.fees)+' ₪</div><div class="l">Fine and fees</div></div>'+
    '<div class="k"><div class="n">'+fmt(MODE==='payment'?s.freed:s.payBefore)+' ₪</div><div class="l">'+(MODE==='payment'?'Available in a month':'Payment does not change')+'</div></div>'+
    '</div>';

  h+='<div style="margin-bottom:10px"><b style="font-size:14px">How capital grows over the years</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">You can clearly see when (if at all) one scenario outperforms another.</p></div>'+
     '<div id="siluk-chart-wrap" style="margin-bottom:16px"></div>';

  h+='<div style=\"margin-bottom:10px\"><b style=\"font-size:14px\">Two scenarios through'+hor+'years</b>'+
     '<p style=\"font-size:12px;color:var(--muted);margin:4px 0 10px\">In both you spend the same:'+fmt(lump)+'₪ now and'+fmt(s.payBefore)+'₪ per month. The difference is where the money goes.</p></div>';
  h+='<div style="overflow:auto"><table><thead><tr><th>Scenario</th><th>Net position</th></tr></thead><tbody>'+
     '<tr><td><strong>Pay off mortgage</strong><br><span style="font-size:10.5px;color:var(--muted)">'+
     (MODE==='payment'?'payment falls, we invest the difference':'the term is shorter, then we invest the payment')+'</span></td>'+
     '<td class="'+(d>0?'pos':'')+'">'+fmt(s.nwA)+' ₪</td></tr>'+
     '<tr><td><strong>Invest</strong><br><span style="font-size:10.5px;color:var(--muted)">mortgage goes on as usual</span></td>'+
     '<td class="'+(d<0?'pos':'')+'">'+fmt(s.nwB)+' ₪</td></tr>'+
     '</tbody><tfoot><tr><td>Difference</td><td class="'+(d>0?'pos':'neg')+'">'+(d>0?'+':'')+fmt(d)+' ₪</td></tr></tfoot></table></div>';

  h+='<p style=\"font-size:12px;color:var(--muted);margin-top:14px\">Second repayment method (“'+
     (MODE==='payment'?'shorten the period':'reduce payment')+'\") would give'+fmt(other.nwA)+' ₪ — '+
     (other.nwA>s.nwA?'on'+fmt(other.nwA-s.nwA)+'₪ better, try switching':'on'+fmt(s.nwA-other.nwA)+'₪ worse, your choice is correct')+'.</p>';

  h+='<div style="margin-top:22px"><b style="font-size:14px">Which channel should I redeem first?</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">At effective cost: rate plus indexation, minus penalty. Not always the one with the higher percentage.</p></div>';
  s.ranked.forEach(function(x,i){
    var used=x.repaid>0;
    h+='<div class="rank"><div class="rnum'+(used?'':' off')+'">'+(i+1)+'</div><div class="info">'+
       '<b>'+x.d.n+'</b><div>rate'+x.r.rate+'%'+(x.d.linked?' + мадад '+R.cpi+'% = <strong>'+x.eff.toFixed(2)+'%</strong> реальных':'')+
       (x.d.free?'· no penalty':'· fine ~'+fmt(x.fee||0)+' ₪')+'</div></div>'+
       '<div style="text-align:right;font-size:13px;'+(used?'font-weight:800;color:var(--green)':'color:var(--muted)')+'">'+
       (used?fmt(x.repaid)+' ₪':'wasn\'t enough')+'</div></div>';
  });

  h+='<div style="margin-top:22px"><b style="font-size:14px">What to consider</b></div><div style="margin-top:10px">';

  if(!hasFund){
    h+='<div class="note n-bad"><b>First reserve, then mortgage</b>Money sent to Mortgage cannot be returned. If there is no cushion for 3-6 months of expenses, if you lose income, you will have to take out an expensive consumer loan. Build a reserve before repaying.</div>';
  }
  if(!usesKeren){
    h+='<div class="note n-info"><b>Check the development fund and pensions</b>If you don\'t choose a concessional deduction limit, it\'s often better to fill it out first: there\'s a tax benefit that neither redemptions nor regular investments have. Only then compare the remainder.</div>';
  }
  var linked=s.ranked.filter(function(x){return x.d.linked&&x.r.bal>0});
  if(linked.length){
    h+='<div class=\"note n-warn\"><b>Do you have an indexed channel?</b>Rate'+linked[0].r.rate+'% looks low but with madad'+R.cpi+'% real cost approx.'+linked[0].eff.toFixed(2)+'%. As inflation rises, this channel automatically becomes more expensive - often it is worth paying off first.</div>';
  }
  var freeT=s.ranked.filter(function(x){return x.d.free&&x.r.bal>0});
  if(freeT.length){
    h+='<div class="note n-ok"><b>Part of the mortgage can be repaid without penalty</b>“Prime” and “variable once a year” channels are not subject to an early repayment penalty - they can be repaid in installments at any time, without losses and without haste.</div>';
  }
  if(be!==null){
    h+='<div class=\"note n-info\"><b>Your landmark is'+be.toFixed(2)+'% per annum</b>If you believe that investments will consistently yield more than this, invest. If in doubt, repayment gives this result guaranteed, without drawdowns and without taxes.</div>';
  }
  if(close){
    h+='<div class="note n-warn"><b>The numbers are almost equal - it’s not mathematics that decides</b>With such a difference, the choice depends on what is more important to you: guarantee and peace of mind or profitability potential with risk. Both strategies are reasonable.</div>';
  }
  h+='<div class="note n-info"><b>Ask the bank about free partial repayment</b>Some banks have conditions that allow you to pay off part of your balance without a fee. The bank must provide an official calculation of the fine free of charge upon request.</div>';
  h+='</div>';

  document.getElementById('out').innerHTML=h;

  var chartPoints=[];
  var steps=6;
  for(var si=1;si<=steps;si++){
    var yy=Math.max(1,Math.round(hor*si/steps));
    var ss=scenarios(lump,ret,tax,yy,disc,MODE);
    chartPoints.push({y:yy, pay:ss.nwA, inv:ss.nwB});
  }
  drawSilukChart(chartPoints);
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {verdictLbl:lbl, verdictNum:(close?'≈ ':(d>0?'+':'−'))+fmt(Math.abs(d))+' ₪', be:be, fees:s.alloc.fees};
}

function runAndShowModal(){
  var r = calc();
  showResultModal(
    r.verdictLbl,
    r.verdictNum,
    'The result of the comparison with your numbers',
    [['Point of indifference', r.be===null?'—':r.be.toFixed(2)+'%'], ['Fine and fees', fmt(r.fees)+' ₪']],
    '📊 View details and priority of channels',
    function(){setActiveView('result');}
  );
}
document.getElementById('run-btn').addEventListener('click', runAndShowModal);

/* ══ ЗАГРУЗКА rates.json (схема портала: manual.avg_mortgage_rate_by_term / _overall) ══ */
function loadRates(){
  return fetch('data/rates.json',{cache:'no-cache'})
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
    .then(function(j){
      if(typeof j.prime === 'number') R.prime=j.prime;
      if(j.cpi_annual_pct!=null) R.cpi=j.cpi_annual_pct;
      if(j.updated) R.updated=j.updated;
      var m=j.manual;
      if(m && m.avg_mortgage_rate_by_term){
        var bt=m.avg_mortgage_rate_by_term;
        R.byTerm={5:bt['5'],10:bt['10'],15:bt['15'],20:bt['20'],25:bt['25'],30:bt['30']};
      }
      if(m && typeof m.avg_mortgage_rate_overall === 'number') R.avg=m.avg_mortgage_rate_overall;
      R.manualChecked = (m && m._checked) || null;
      return true;
    })
    .catch(function(e){
      console.warn('rates.json is not available, we are working on defaults in the code', e);
      return false;
    });
}
function paintPills(loaded){
  document.getElementById('p-prime').textContent=R.prime.toFixed(2)+'%';
  document.getElementById('p-cpi').textContent=R.cpi.toFixed(1)+'%';
  var note=document.getElementById('stale-note');
  if(loaded && R.updated){
    var d=new Date(R.updated);
    var dateStr = isNaN(d) ? R.updated : d.toLocaleDateString('en-GB');
    note.textContent='✓ Bank of Israel rate and madad updated automatically ('+dateStr+'). Average rates - manually verified'+(R.manualChecked?' '+R.manualChecked:'')+'.';
  } else {
    note.textContent='⚠️ Failed to load fresh data - estimated rates are shown (hardwired into the code). Check with the bank before making a decision.';
  }
}

/* ══ ВКЛАДКИ (единый паттерн портала) ══ */
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

addTrack({type:'prime', bal:300000,rate:5.0,years:22});
addTrack({type:'kalatz',bal:400000,rate:4.9,years:20});
addTrack({type:'katz',  bal:250000,rate:3.3,years:25});

loadRates().then(paintPills);
document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
