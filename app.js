(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
$('themeBtn').addEventListener('click',function(){var n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}});
var SAMPLE={name:'Sample General Store',wa:'',greet:'Hi! Ask me about timings, address, payment or delivery.',faqs:[
 {q:'What are your opening hours?',a:'We are open Monday to Saturday, 10 AM to 8 PM. Sunday is closed.',k:'timing, time, kab khulta, open, close, hours'},
 {q:'Where is your shop located?',a:'You can find us at 12 Sample Road, near the main market. (Edit this answer with your real address.)',k:'address, location, kahan, kaha, pata, map, direction'},
 {q:'Do you offer home delivery?',a:'Yes. Free home delivery within 5 km on orders above Rs 500.',k:'delivery, deliver, home, ghar, courier'},
 {q:'Which payment methods do you accept?',a:'We accept UPI (GPay, PhonePe, Paytm), debit/credit cards and cash.',k:'payment, upi, gpay, phonepe, paytm, card, cash'},
 {q:'What is your return and refund policy?',a:'You can return or exchange within 7 days with the bill. Item must be unused.',k:'return, refund, exchange, wapas, replace'},
 {q:'Do you give any discount or offers?',a:'We run offers during festivals. Ask in the shop for current deals.',k:'discount, offer, sale, chhoot, deal'},
 {q:'How can I contact you?',a:'Call or WhatsApp us on the number shown in the shop. (Add your number in Setup.)',k:'contact, phone, number, call, whatsapp'}
]};
var cfg=null,idx=null,shared=false,tab='chat';
function b64e(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
function clampCfg(c){
  var o={name:String(c.name||'').slice(0,60),wa:String(c.wa||'').replace(/\D/g,'').slice(0,13),greet:String(c.greet||'').slice(0,160),faqs:[]};
  (Array.isArray(c.faqs)?c.faqs:[]).slice(0,100).forEach(function(f){if(f&&f.q&&f.a)o.faqs.push({q:String(f.q).slice(0,200),a:String(f.a).slice(0,800),k:String(f.k||'').slice(0,200)})});
  return o;
}
function load(){
  var h=location.hash.match(/^#c=([\w\-]+)$/);
  if(h){try{cfg=clampCfg(JSON.parse(b64d(h[1])));shared=true}catch(e){cfg=null}}
  if(!cfg){try{var s=localStorage.getItem('faqbot_cfg');if(s)cfg=clampCfg(JSON.parse(s))}catch(e){}}
  if(!cfg)cfg=clampCfg(SAMPLE);
}
function save(){if(shared)return;try{localStorage.setItem('faqbot_cfg',JSON.stringify(cfg))}catch(e){}}
function reindex(){idx=FaqMatch.build(cfg.faqs)}
function waNum(){var d=cfg.wa;if(d.length===10)d='91'+d;return d.length>=11?d:''}
var log=$('log');
function scroll(){log.scrollTop=log.scrollHeight}
function linkify(el,text){
  var re=/(https?:\/\/[^\s]+)/g,last=0,m;
  while((m=re.exec(text))){el.appendChild(document.createTextNode(text.slice(last,m.index)));var a=document.createElement('a');a.href=m[1];a.target='_blank';a.rel='noopener noreferrer';a.textContent=m[1];el.appendChild(a);last=m.index+m[1].length}
  el.appendChild(document.createTextNode(text.slice(last)));
}
function say(text,who,extra){
  var d=document.createElement('div');d.className='m '+who;linkify(d,text);if(extra)extra(d);log.appendChild(d);scroll();return d;
}
function botSay(text,extra){
  var t=document.createElement('div');t.className='m bot typing';t.innerHTML='<i></i><i></i><i></i>';log.appendChild(t);scroll();
  setTimeout(function(){t.remove();say(text,'bot',extra)},350);
}
function waButton(q){
  return function(d){var n=waNum();if(!n)return;var a=document.createElement('a');a.className='wabtn';a.target='_blank';a.rel='noopener noreferrer';a.href='https://wa.me/'+n+'?text='+encodeURIComponent('Hi, I have a question: '+q);a.textContent='Ask on WhatsApp';d.appendChild(document.createElement('br'));d.appendChild(a)}
}
function ask(q){
  q=q.trim();if(!q)return;
  say(q,'me');
  var r=FaqMatch.answer(idx,cfg.faqs,q);
  if(r.type==='answer')botSay(cfg.faqs[r.index].a);
  else if(r.type==='hi')botSay(cfg.greet||'Hi! How can I help you?');
  else if(r.type==='thanks')botSay('You are welcome! Ask anything else if you need.');
  else if(r.type==='bye')botSay('Thank you for visiting. Have a nice day!');
  else if(r.type==='suggest'&&r.options.length)botSay('Did you mean one of these?',function(d){var w=document.createElement('div');w.className='opts';r.options.forEach(function(i){var b=document.createElement('button');b.type='button';b.className='opt';b.textContent=cfg.faqs[i].q;b.addEventListener('click',function(){say(cfg.faqs[i].q,'me');botSay(cfg.faqs[i].a)});w.appendChild(b)});d.appendChild(w);waButton(q)(d)});
  else{unans(q);botSay('Sorry, I do not have an answer for this yet.'+(waNum()?' You can ask the shop directly:':' Please call or visit the shop.'),waButton(q))}
}
function unans(q){if(shared)return;try{var l=JSON.parse(localStorage.getItem('faqbot_un')||'[]');l.unshift(q.slice(0,120));localStorage.setItem('faqbot_un',JSON.stringify(l.slice(0,30)))}catch(e){}renderUn()}
function renderUn(){var ul=$('unans');if(!ul)return;ul.innerHTML='';var l=[];try{l=JSON.parse(localStorage.getItem('faqbot_un')||'[]')}catch(e){}if(!l.length){var li=document.createElement('li');li.textContent='None yet.';ul.appendChild(li)}l.forEach(function(q){var li=document.createElement('li');li.textContent=q;ul.appendChild(li)})}
function renderChips(){var c=$('chips');c.innerHTML='';cfg.faqs.slice(0,6).forEach(function(f,i){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=f.q;b.addEventListener('click',function(){ask(f.q)});c.appendChild(b)})}
function startChat(){
  log.innerHTML='';reindex();renderChips();
  $('brandName').textContent=cfg.name||'FAQ Bot';$('brandSub').textContent=shared?'Ask us anything':'preview';
  document.title=(cfg.name?cfg.name+' - ':'')+'FAQ Bot';
  say(cfg.greet||'Hi! How can I help you?','bot');
}
$('send').addEventListener('submit',function(e){e.preventDefault();var v=$('msg').value;$('msg').value='';ask(v)});

// setup
function faqRow(f,i){
  var d=document.createElement('div');d.className='faq';
  d.innerHTML='<div class="top2"><span class="n"></span><button type="button" class="rm">Remove</button></div><label>Question</label><input type="text" maxlength="200" class="fq"><label>Answer</label><textarea maxlength="800" class="fa"></textarea><label>Keywords (optional, comma separated)</label><input type="text" maxlength="200" class="fk">';
  d.querySelector('.n').textContent='Question '+(i+1);
  d.querySelector('.fq').value=f.q;d.querySelector('.fa').value=f.a;d.querySelector('.fk').value=f.k||'';
  d.querySelector('.rm').addEventListener('click',function(){readSetup();cfg.faqs.splice(i,1);renderSetup();save()});
  d.addEventListener('input',function(){readSetup(true)});
  return d;
}
function renderSetup(){
  $('cName').value=cfg.name;$('cWa').value=cfg.wa;$('cGreet').value=cfg.greet;
  var l=$('faqList');l.innerHTML='';cfg.faqs.forEach(function(f,i){l.appendChild(faqRow(f,i))});
}
function readSetup(soft){
  cfg.name=$('cName').value.trim();cfg.wa=$('cWa').value.replace(/\D/g,'');cfg.greet=$('cGreet').value.trim();
  var rows=document.querySelectorAll('#faqList .faq'),out=[];
  rows.forEach(function(r){out.push({q:r.querySelector('.fq').value,a:r.querySelector('.fa').value,k:r.querySelector('.fk').value})});
  cfg.faqs=out;if(soft)save();
}
['cName','cWa','cGreet'].forEach(function(i){$(i).addEventListener('input',function(){readSetup(true)})});
$('addFaq').addEventListener('click',function(){readSetup();cfg.faqs.push({q:'',a:'',k:''});renderSetup();var q=document.querySelectorAll('#faqList .fq');q[q.length-1].focus()});
$('tpl').addEventListener('click',function(){if(cfg.faqs.some(function(f){return f.q||f.a})&&!confirm('Replace your questions with the sample shop?'))return;cfg=clampCfg(SAMPLE);renderSetup();save()});
function validate(){
  readSetup();var ok=true;$('waErr').textContent='';$('faqErr').textContent='';
  if(cfg.wa&&!/^(91)?[6-9]\d{9}$/.test(cfg.wa)){$('waErr').textContent='Enter a 10-digit Indian mobile number (starts with 6-9).';ok=false}
  var rows=document.querySelectorAll('#faqList .faq'),good=0;
  rows.forEach(function(r){var q=r.querySelector('.fq'),a=r.querySelector('.fa');q.classList.toggle('bad',!q.value.trim());a.classList.toggle('bad',!a.value.trim());if(q.value.trim()&&a.value.trim())good++;else ok=false});
  if(!good){$('faqErr').textContent='Add at least one question with an answer.';ok=false}else if(!ok)$('faqErr').textContent='Every question needs an answer. Fill or remove the red ones.';
  if(ok){cfg.faqs=cfg.faqs.filter(function(f){return f.q.trim()&&f.a.trim()});}
  return ok;
}
var shareUrl='';
$('mkLink').addEventListener('click',function(){
  if(!validate())return;save();
  var data=b64e(JSON.stringify(clampCfg(cfg)));var base=location.href.split('#')[0].split('?')[0];shareUrl=base+'#c='+data;
  $('linkOut').value=shareUrl;$('copyLink').disabled=false;$('waShare').disabled=false;
  toast(shareUrl.length>6000?'Link is very long ('+shareUrl.length+' characters). Some apps may cut it. Remove a few answers or shorten them.':'Link ready');
});
$('copyLink').addEventListener('click',function(){var done=function(){toast('Link copied')};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(shareUrl).then(done,function(){$('linkOut').select();document.execCommand('copy');done()});else{$('linkOut').select();document.execCommand('copy');done()}});
$('waShare').addEventListener('click',function(){window.open('https://wa.me/?text='+encodeURIComponent((cfg.name?cfg.name+' - ':'')+'Ask us anything here: '+shareUrl),'_blank','noopener')});
function toast(m){var t=$('toast');t.textContent=m;clearTimeout(toast.t);toast.t=setTimeout(function(){t.textContent=''},4000)}
$('testBtn').addEventListener('click',function(){if(!validate())return;save();setTab('chat')});
$('exp').addEventListener('click',function(){readSetup();var b=new Blob([JSON.stringify(cfg,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='faq-bot-backup.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500)});
$('imp').addEventListener('click',function(){$('impFile').click()});
$('impFile').addEventListener('change',function(){var f=this.files[0];if(!f||f.size>300000)return toast('File too big');var r=new FileReader();r.onload=function(){try{var c=clampCfg(JSON.parse(r.result));if(!c.faqs.length)throw 0;cfg=c;renderSetup();save();toast('Backup restored')}catch(e){toast('This file is not a valid backup')}};r.readAsText(f);this.value=''});
$('clrUnans').addEventListener('click',function(){try{localStorage.removeItem('faqbot_un')}catch(e){}renderUn()});

function setTab(t){
  tab=t;$('tChat').setAttribute('aria-selected',t==='chat');$('tSetup').setAttribute('aria-selected',t==='setup');
  $('chatView').hidden=t!=='chat';$('setupView').hidden=t!=='setup';
  if(t==='chat')startChat();else{renderSetup();renderUn()}
}
$('tChat').addEventListener('click',function(){if(tab==='setup'&&!validate())return;save();setTab('chat')});
$('tSetup').addEventListener('click',function(){setTab('setup')});
load();
if(shared)$('tabs').classList.add('hidden');
setTab('chat');
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){});
})();
