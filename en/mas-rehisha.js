
/* ═══ STEPS 2026 (frozen until 15.01.2028) — do not change the kernel without recalculating the tests ═══ */
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
function fmt(n){return Math.round(n).toLocaleString('en-US')}
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
    h+='<div class="verdict"><div class="v-lbl">Purchase tax</div>'+
       '<div class="v-num">'+fmt(t)+' ₪</div>'+
       '<div class="v-sub">6% from the first shekel</div>'+
       '<div class="v-eff">effective rate 6.00%</div></div>';
    h+='<div class="note n-info"><b>Non-residential real estate</b>'+
       '<span class=\"law\" lang=\"he\" dir=\"rtl\">תקנה 2(1)</span> - a flat rate of 6% on the entire cost, without steps and without exemption.'+
       'If you buy a plot for residential construction and receive a building permit within 24 months,'+
       'a refund of 1/6 of the tax paid is possible (approx.'+fmt(t/6)+' ₪).</div>';
    document.getElementById('out').innerHTML=h;
    document.getElementById('results-wrap') && document.getElementById('results-wrap').classList.add('show');
    return {big:fmt(t)+' ₪', sub:'6% - non-residential real estate'};
  }

  var singleLike=(st==='single'||st==='upgrader');
  var routes=[];

  if(singleLike){
    var r=calcBrackets(v,B.single);
    routes.push({key:'single',name:'The only apartment',law:'סעיף 9(ג1ג)(3)',
      desc:'ordinary Israeli resident levels',total:r.total,rows:r.rows});
  }
  if(st==='additional'||st==='foreign'){
    var r2=calcBrackets(v,B.additional);
    routes.push({key:'additional',name:st==='foreign'?'Foreign resident':'Additional apartment',
      law:'סעיף 9(ג1ו)',desc:'8% from the first shekel, then 10%',total:r2.total,rows:r2.rows});
  }
  if(isOleh){
    if(singleLike){
      var r3=calcBrackets(v,B.olehNew);
      routes.push({key:'olehNew',name:'Repatriate - only apartment',law:'תקנה 12א',
        desc:'valid from 08/15/2024',total:r3.total,rows:r3.rows});
    }
    var before=olehDate&&olehDate<OLEH_AMENDMENT;
    if(before||!singleLike){
      var r4=calcBrackets(v,B.olehOld);
      routes.push({key:'olehOld',name:'Repatriate - the old norm',law:'תקנה 12',
        desc:before?'available to you: repatriation until 08/15/2024':'previous edition',
        total:r4.total,rows:r4.rows});
    }
  }
  if(isDis){
    var r5=calcDisabled(v,singleLike);
    routes.push({key:'disabled',name:'Disabled/victim benefit',law:'תקנה 11',
      desc:singleLike&&v<=DISABLED_THRESHOLD?'exemption up to the first stage, then 0.5%':'0.5% from the first shekel',
      total:r5.total,rows:r5.rows});
  }

  routes.sort(function(a,b){return a.total-b.total});
  var best=routes[0];
  var eff=v>0?(best.total/v*100):0;

  h+='<div class="verdict"><div class="v-lbl">Purchase tax</div>'+
     '<div class="v-num">'+fmt(best.total)+' ₪</div>'+
     '<div class="v-sub">'+best.name+'</div>'+
     '<div class=\"v-eff\">effective rate'+eff.toFixed(2)+'% of cost</div></div>';

  if(routes.length>1){
    h+='<div style="margin-bottom:10px"><b style="font-size:14px">Routes available to you</b>'+
       '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">The calculator chooses the most profitable one. Benefits are not always better than regular steps - compare.</p></div>';
    routes.forEach(function(rt,i){
      h+='<div class="route'+(i===0?' best':'')+'"><div><div class="nm">'+(i===0?'✓ ':'')+rt.name+'</div>'+
         '<div class="ds"><span class="law" lang="he" dir="rtl">'+rt.law+'</span> '+rt.desc+'</div></div>'+
         '<div class="vl">'+fmt(rt.total)+' ₪'+(i>0?'<div style="font-size:10.5px;font-weight:400;color:var(--muted)">+'+fmt(rt.total-best.total)+'</div>':'')+'</div></div>';
    });
  }

  h+='<div style="margin-top:20px;margin-bottom:10px"><b style="font-size:14px">Breakdown by stages</b>'+
     '<p style="font-size:12px;color:var(--muted);margin:4px 0 10px">The rate does not apply to the entire amount, but to a portion of the cost within each step.</p></div>'+
     '<div style="overflow:auto"><table><thead><tr><th>Part of the cost</th><th>Bid</th><th>Sum of part</th><th>Tax</th></tr></thead><tbody>';
  best.rows.forEach(function(r){
    h+='<tr><td>'+fmt(r.from)+' – '+fmt(r.to)+'</td>'+
       '<td>'+(r.rate*100).toFixed(1)+'%</td>'+
       '<td>'+fmt(r.part)+'</td>'+
       '<td'+(r.tax===0?' class="zero"':'')+'>'+(r.tax===0?'—':fmt(r.tax))+'</td></tr>';
  });
  h+='</tbody><tfoot><tr><td colspan="3">Total tax</td><td>'+fmt(best.total)+' ₪</td></tr></tfoot></table></div>';

  h+='<div style="margin-top:22px"><b style="font-size:14px">What to consider</b></div><div style="margin-top:10px">';

  if(st==='upgrader'){
    var months=(fromWho==='dev')?12:24;
    var deadline=buyDate?addMonths(buyDate,months):null;
    var addl=calcBrackets(v,B.additional).total;
    var risk=addl-best.total;
    h+='<div class="note n-bad"><b>⏳ The main thing: the deadline for selling the old apartment</b>'+
       'You pay the rates for a single apartment<strong>given that</strong>you will sell the old apartment on time.'+
       (fromWho==='dev'
         ? '<span class=\"law\" lang=\"he\" dir=\"rtl\">סעיף 9(ג1ג)(2)(ב)</span> - <strong>12 months</strong> from the date when the developer was supposed to transfer ownership to you under the contract.'
         : '<span class=\"law\" lang=\"he\" dir=\"rtl\">סעיף 9(ג1ג)(2)(א)</span> - <strong>24 months</strong> from the date of signing the contract.')+
       (deadline?'<br><br><strong>Your deadline: approx.'+fmtD(deadline)+'</strong>':'')+
       '<br><br>If you don’t make it in time, additional charges will be made retroactively at the additional apartment rates:'+
       '<strong>'+fmt(addl)+'₪</strong>instead of'+fmt(best.total)+'₪. Difference<strong>'+fmt(risk)+' ₪</strong>, plus interest and indexation.</div>';
    h+='<div class="note n-warn"><b>The deadline has changed three times</b>'+
       'From 06/01/2023 to 05/31/2025, 18 months were in effect (temporary norm). 24 months have returned since 06/01/2025.'+
       'A bill to return to 18 months is being promoted in the Knesset - check the current rule with a lawyer before making a deal.</div>';
  }

  if(isOleh){
    if(best.key==='olehNew'){
      var vsSingle=calcBrackets(v,B.single).total;
      h+='<div class="note n-ok"><b>The repatriate benefit works in your favor</b>'+
         '<span class=\"law\" lang=\"he\" dir=\"rtl\">תקנה 12א</span> gives 0% up to'+fmt(FIRST_TIER)+'₪ and only 0.5% up to'+fmt(6055070)+' ₪. '+
         'Savings versus conventional steps:<strong>'+fmt(vsSingle-best.total)+' ₪</strong>.</div>';
    } else if(best.key==='single'&&routes.some(function(r){return r.key.indexOf('oleh')===0})){
      h+='<div class="note n-warn"><b>The repatriate benefit is NOT beneficial to you</b>'+
         'Regular steps of a single apartment give less tax. Do not automatically apply the benefit just because it is due -'+
         'This is a common and expensive mistake.</div>';
    }
    if(!olehDate){
      h+='<div class="note n-info"><b>Specify the date of repatriation</b>'+
         'It depends on which standard is applicable. For those who repatriated before 08/15/2024, there is a choice between'+
         '<span class=\"law\" lang=\"he\" dir=\"rtl\">תקנה 12</span> and <span class=\"law\" lang=\"he\" dir=\"rtl\">תקנה 12א</span>.</div>';
    }
    h+='<div class="note n-info"><b>Conditions for repatriate benefits</b>'+
       'Period: from one year before the first entry into Israel and up to 7 years after. Military and national service are not included in the seven years count.'+
       'You need a visa according to Art. 2 of the Law of Return, teudat ole under Art. 3 or resolution A1. The benefit is given once.</div>';
  }

  if(isDis){
    h+='<div class="note n-info"><b>Conditions of benefit for takana 11</b>'+
       'Provided <strong>no more than twice in a lifetime</strong>, and the apartment must be used for the residence of the copyright holder.'+
       'Confirmation from Bituach Leumi or the Ministry of Defense regarding the degree of disability is required.</div>';
  }

  if(st==='additional'||st==='foreign'){
    var asSingle=calcBrackets(v,B.single).total;
    h+='<div class=\"note n-warn\"><b>Difference with the status of a single apartment -'+fmt(best.total-asSingle)+' ₪</b>'+
       'If this is your only apartment in Israel, or you are selling your existing one, you have the right to be the only one.'+
       'Check: the share is up to 1/3 in another apartment or up to 1/2 in an inherited one <strong>does not deprive</strong> the status of the only one.</div>';
    if(st==='foreign'){
      h+='<div class="note n-info"><b>Foreign resident who becomes a resident of Israel</b>'+
         'There was a provision whereby a buyer who became a resident within 27 months of purchase would receive the rates for a single apartment retroactively.'+
         'Check with your lawyer for relevance.</div>';
    }
  }

  h+='<div class="note n-info"><b>Check the \"family unit\"</b>'+
     '<span class="law" lang="he" dir="rtl">סעיף 9(ג)(2)(ב)(2)</span> - you, your spouse and children under 18 years of age are considered <strong>one buyer</strong>. '+
     'If your spouse has an apartment, it is counted as yours, and the status of the only one is lost.</div>';

  h+='<div class="note n-warn"><b>Deadlines for submission and payment</b>'+
     'Declaration in “misui mekarkein” - <strong>30 days</strong> from signing the contract. Payment - <strong>60 days</strong>.'+
     'Delay entails interest, indexation and fines.</div>';

  h+='</div>';

  document.getElementById('out').innerHTML=h;
  var wrap = document.getElementById('results-wrap');
  if(wrap) wrap.classList.add('show');
  return {big:fmt(best.total)+' ₪', sub:best.name, eff:eff.toFixed(2)+'%'};
}

function runAndShowModal(){
  var r = calc();
  showResultModal('Purchase tax (purchase tax)', r.big, r.sub,
    r.eff ? [['Effective rate', r.eff]] : [],
    '📊 See breakdown and routes', function(){setActiveView('result');});
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

fetch('data/rates.json',{cache:'no-cache'})
  .then(function(r){if(!r.ok)throw 0;return r.json()})
  .then(function(j){ if(j.updated){ var d=new Date(j.updated); if(!isNaN(d)) document.getElementById('p-upd').textContent=d.toLocaleDateString('en-GB'); } })
  .catch(function(){});

document.addEventListener('DOMContentLoaded', buildViewPanelsSafe);
