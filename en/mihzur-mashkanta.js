
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
    console.warn('rates.json is not available, we are working on defaults in the code', e);
    return false;
  }
}

var TRACKS=[
 {t:"prime",n:"Prime",free:true},
 {t:"kalatz",n:"Fix. without indexation (KALATS)",free:false},
 {t:"katz",n:'Fixed, CPI-linked (Kalatz)',free:false},
 {t:"var5",n:"Variable every 5 years",free:false},
 {t:"var1",n:"Variable once a year",free:true}
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
      '<span class="tag '+(def.free?'free':'fee')+'">'+(def.free?'no penalty':'there is a fine')+'</span>'+
      (rows.length>1?'<button class="del" type="button" onclick="del(\''+r.id+'\')" aria-label="Delete channel">✕</button>':'')+
      '</div><div class="grid">'+
      '<div class="f"><label>Balance, ₪</label><input type="number" value="'+r.bal+'" step="10000" oninput="upd(\''+r.id+'\',\'bal\',this.value)"></div>'+
      '<div class="f"><label>Your rate, %</label><input type="number" value="'+r.rate+'" step="0.05" oninput="upd(\''+r.id+'\',\'rate\',this.value)"></div>'+
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
function fmt(n){return Math.round(n).toLocaleString('en-US')}

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
     '<div class="v-lbl">'+(worth?'Refinancing is profitable':'The benefit is questionable')+'</div>'+
     '<div class="v-num">'+(monthly>0?'−'+fmt(monthly)+' ₪':'+'+fmt(-monthly)+' ₪')+'</div>'+
     '<div class="v-sub">'+(monthly>0
        ?'per month · will pay for itself in'+(payback===Infinity?'—':Math.ceil(payback)+'months')
        :'the payment will increase - it is unprofitable to refinance')+'</div></div>';

  h+='<div class="kpi">'+
     '<div class="k"><div class="n" style="color:'+(fees>0?'var(--red)':'var(--green)')+'">'+fmt(fees)+' ₪</div><div class="l">Fine and fees</div></div>'+
     '<div class="k"><div class="n">'+(payback===Infinity?'—':Math.ceil(payback))+'</div><div class="l">Months until payback</div></div>'+
     '<div class="k"><div class="n" style="color:'+(lifetime>0?'var(--green)':'var(--red)')+'">'+fmt(lifetime)+' ₪</div><div class="l">Total for the entire period</div></div>'+
     '</div>';

  h+='<div style="margin-bottom:10px"><b style="font-size:14px">Channel breakdown</b><p style="font-size:12px;color:var(--muted);margin:4px 0 10px">It’s not worth refinancing everything at once - see where the savings cover the fine.</p></div>';
  h+='<div style="overflow:auto"><table><thead><tr>'+
     '<th>Channel</th><th>Remainder</th><th>Payment now</th><th>will become</th><th>Fine</th></tr></thead><tbody>';
  det.forEach(function(d){
    h+='<tr><td><strong>'+d.n+'</strong><br><span style="font-size:10.5px;color:var(--muted)">'+d.rate+'%'+(d.free?'· no penalty':'')+'</span></td>'+
       '<td>'+fmt(d.bal)+'</td><td>'+fmt(d.oldP)+'</td>'+
       '<td class="'+(d.save>0?'pos':'neg')+'">'+fmt(d.newP)+'</td>'+
       '<td class="'+(d.ivun>0?'neg':'pos')+'">'+(d.ivun>0?fmt(d.ivun):'0')+'</td></tr>';
  });
  h+='</tbody><tfoot><tr><td>Total</td><td>'+fmt(tot.bal)+'</td><td>'+fmt(tot.oldPay)+'</td><td>'+fmt(tot.newPay)+'</td><td>'+fmt(tot.ivun)+'</td></tr></tfoot></table></div>';

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
       '<b style="color:var(--green);font-size:14px">✓ Optimal scenario</b>'+
       '<p style="font-size:12px;color:var(--muted);margin:6px 0 12px">You don\'t have to refinance everything. Here\'s what\'s really worth touching:</p>'+
       '<table><tbody>';
    good.forEach(function(d){
      var f=d.ivun+d.bal*RATES.noNotice;
      h+='<tr><td><strong>'+d.n+'</strong><br><span style=\"font-size:10.5px;color:var(--muted)\">fine'+fmt(f)+'₪ · will pay for itself in'+Math.ceil(f/d.save)+'month</span></td>'+
         '<td class="pos">−'+fmt(d.save)+'₪/month</td></tr>';
    });
    det.filter(function(d){return good.indexOf(d)<0}).forEach(function(d){
      h+='<tr><td style="opacity:.55"><strong>'+d.n+'</strong><br><span style="font-size:10.5px;color:var(--muted)">leave as is</span></td>'+
         '<td style="color:var(--muted);font-size:12px">don\'t touch</td></tr>';
    });
    h+='</tbody></table>'+
       '<div class="kpi" style="margin-top:14px;margin-bottom:0">'+
       '<div class="k"><div class="n" style="color:var(--green)">−'+fmt(gSave)+' ₪</div><div class="l">Per month</div></div>'+
       '<div class="k"><div class="n">'+(gPay===Infinity?'—':Math.ceil(gPay))+'</div><div class="l">Months of payback</div></div>'+
       '<div class="k"><div class="n" style="color:var(--green)">'+fmt(gLife)+' ₪</div><div class="l">Total benefit</div></div>'+
       '</div></div>';
  }

  h+='<div style="margin-top:20px"><b style="font-size:14px">What does it mean</b></div><div style="margin-top:10px">';
  var freeSum=det.filter(function(d){return d.free}).reduce(function(a,d){return a+d.bal},0);
  if(freeSum>0){
    h+='<div class=\"note n-ok\"><b>You have'+fmt(freeSum)+'₪ can be repaid without penalty</b>'+
       'Prime and variable once a year channels are not subject to compensation. This is the most flexible part of the mortgage - it can be refinanced or repaid early at any time.</div>';
  }
  if(tot.ivun>0){
    h+='<div class=\"note n-warn\"><b>Fine approx.'+fmt(tot.ivun)+'₪ — including discount'+Math.round(disc*100)+'%</b>'+
       'The discount is provided by law for the age of the loan. The bank is obliged to calculate the exact amount free of charge upon your request - ask for a written calculation before making a decision.</div>';
  } else {
    h+='<div class="note n-ok"><b>There is no penalty for early repayment</b>'+
       'Your rates are no higher than current market rates, or all channels are free of compensation. There are no obstacles to refinancing.</div>';
  }
  if(monthly>0 && payback>36){
    h+='<div class=\"note n-bad\"><b>Payback'+Math.ceil(payback)+'months is a long time</b>'+
       'The fine eats up the benefit. It makes sense to refinance only part of the channels - those where there is no compensation - or wait for a more favorable offer from another bank.</div>';
  }
  if(monthly<=0){
    h+='<div class="note n-bad"><b>The new rate is no better than yours</b>'+
       'When betting'+newrate+'The % payment is not reduced. Try to get offers from several banks - the spread of rates between banks can be noticeable.</div>';
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
  showResultModal(verdictLbl, verdictNum, verdictSub, [['Fine and fees', fees], ['Payback', payback+'months']], '📊 View details by channel', function(){setActiveView('result');});
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
    ov.innerHTML='<div class="result-modal"><div class="result-modal-head"><h3 id="rm-title"></h3><button class="result-modal-close" onclick="closeResultModal()">✕</button></div><div class="result-modal-big" id="rm-big"></div><div class="result-modal-sub" id="rm-sub"></div><div class="result-modal-rows" id="rm-rows"></div><div class="result-modal-actions"><button class="rm-secondary" onclick="closeResultModal()">Close</button><button class="rm-primary" id="rm-action-btn"></button></div></div>';
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
    var dateStr = isNaN(d) ? RATES.updated : d.toLocaleDateString('en-GB');
    note.textContent = '✓ Bank of Israel rate updated automatically (' + dateStr + '). Average market rates - manually verified' + (RATES.manualChecked ? ' ' + RATES.manualChecked : '') + '. Before making a decision, check with the bank.';
  } else {
    note.textContent = '⚠️ Failed to load fresh data - estimated rates are shown (hardwired into the code). Before making a decision, check the current rates with the bank.';
  }
}

loadRates().then(renderRatePills);

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
