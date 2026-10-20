(function(root){
'use strict';
var STOP={}; 'a an the is are was were am i you your my me we our to of in on at for and or but do does did can could will would please pls plz kindly tell about what which who how when where why there here this that it its be have has had with from by as if so any some hai hain ho hoga kya ka ki ke ko me mein se par pe aur ya to bhi nhi nahi koi kuch mujhe mere meri mera aap aapka aapki aapke hum ham apna apni main mai h'.split(' ').forEach(function(w){STOP[w]=1});
// groups of words that mean the same (English + Hinglish + Hindi)
var SYN=[
 ['time','timing','timings','hours','open','opening','close','closing','khulta','khulte','khula','khulti','band','kab','schedule','samay','टाइम','समय','खुलता'],
 ['address','location','where','kahan','kaha','kidhar','pata','direction','directions','map','locate','situated','shop','store','dukaan','dukan','पता','कहाँ','कहां'],
 ['price','prices','cost','rate','rates','charges','charge','fees','fee','kitna','kitne','kimat','keemat','daam','dam','pricing','quote','कीमत','दाम','रेट','कितना'],
 ['pay','payment','payments','upi','gpay','phonepe','paytm','card','cash','online','cod','paisa','paise','bhugtan','पेमेंट'],
 ['deliver','delivery','home','ship','shipping','courier','pahunch','pahuchana','dispatch','डिलीवरी'],
 ['return','returns','refund','exchange','replace','replacement','wapas','vapas','वापस','रिफंड'],
 ['warranty','guarantee','warrenty','गारंटी','वारंटी'],
 ['discount','offer','offers','sale','deal','coupon','cashback','chhoot','chhut','sasta','छूट','ऑफर'],
 ['contact','call','phone','number','mobile','whatsapp','talk','speak','baat','nambar','संपर्क','फोन','नंबर'],
 ['book','booking','appointment','order','reserve','reservation','visit','buking','बुक','ऑर्डर'],
 ['available','availability','stock','instock','उपलब्ध'],
 ['service','repair','install','installation','fix','maintenance','amc','servicing','marammat','सर्विस','रिपेयर'],
 ['bill','invoice','receipt','gst','tax','रसीद','बिल'],
 ['hello','hi','hey','namaste','namaskar','hii','hlo','helo','नमस्ते'],
 ['thanks','thank','thankyou','shukriya','dhanyavaad','dhanyawad','धन्यवाद','शुक्रिया']
];
var SYNMAP={};SYN.forEach(function(g,i){g.forEach(function(w){SYNMAP[w]=g[0]})});
function norm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g,' ').replace(/\s+/g,' ').trim()}
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 9;var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i]}for(j=1;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function tokens(s,keepStop){
  var out=[];norm(s).split(' ').forEach(function(w){
    if(!w)return;if(!keepStop&&STOP[w])return;
    var b=SYNMAP[w]||(w.length>3&&/[a-z]s$/.test(w)&&!/ss$/.test(w)?(SYNMAP[w.slice(0,-1)]||w.slice(0,-1)):w);out.push(b);
  });return out;
}
function tokEq(a,b){if(a===b)return 1;if(a.length>=5&&b.length>=5&&lev(a,b)<=1)return .8;if(a.length>=5&&b.length>=5&&(a.indexOf(b)===0||b.indexOf(a)===0)&&Math.min(a.length,b.length)>=5)return .7;return 0}
function build(faqs){
  var docs=faqs.map(function(f){var q=tokens(f.q),k=tokens(f.k||''),a=tokens(f.a).slice(0,40);return {q:q,k:k,a:a}});
  var df={};docs.forEach(function(d){var seen={};d.q.concat(d.k).forEach(function(t){if(!seen[t]){seen[t]=1;df[t]=(df[t]||0)+1}})});
  var N=Math.max(1,docs.length);
  function idf(t){return Math.log(1+N/(1+(df[t]||0)))+0.5}
  return {docs:docs,idf:idf};
}
function best(idx,text,faqs){
  var qt=tokens(text);if(!qt.length)return {list:[],top:null,conf:0};
  var scores=idx.docs.map(function(d,i){
    var s=0,max=0;
    qt.forEach(function(t){
      var w=idx.idf(t),hit=0;
      d.q.forEach(function(x){hit=Math.max(hit,tokEq(t,x))});
      d.k.forEach(function(x){hit=Math.max(hit,tokEq(t,x)*1.15)});
      if(!hit)d.a.forEach(function(x){hit=Math.max(hit,tokEq(t,x)*0.25)});
      s+=w*hit;max+=w;
    });
    // coverage of the FAQ question by the user query (so "price" alone favours short price FAQ)
    var cov=0,tot=0;d.q.forEach(function(x){var w=idx.idf(x),h=0;qt.forEach(function(t){h=Math.max(h,tokEq(t,x))});cov+=w*h;tot+=w});
    var qscore=max?s/max:0,cscore=tot?cov/tot:0;
    return {i:i,score:0.7*qscore+0.3*cscore,q:qscore};
  }).sort(function(a,b){return b.score-a.score});
  var top=scores[0];
  return {list:scores.slice(0,3),top:top,conf:top?top.score:0,second:scores[1]?scores[1].score:0};
}
var SMALL=[
 {re:/^(hello|hi|hey|hii+|hlo|helo|namaste|namaskar|good (morning|afternoon|evening)|नमस्ते)\b/,k:'hi'},
 {re:/^(thanks?|thank you|thankyou|shukriya|dhanyavaad|dhanyawad|ok thanks|ok thank you|धन्यवाद|शुक्रिया)\b/,k:'thanks'},
 {re:/^(bye|goodbye|ok bye|tata|alvida)\b/,k:'bye'}
];
function answer(idx,faqs,text,cfg){
  var n=norm(text);
  if(!n)return {type:'empty'};
  for(var i=0;i<SMALL.length;i++)if(SMALL[i].re.test(n)&&n.split(' ').length<=4)return {type:SMALL[i].k};
  var r=best(idx,text,faqs);
  if(r.top&&r.conf>=0.5&&(r.conf-r.second>=0.04||r.conf>=0.75))return {type:'answer',index:r.top.i,conf:r.conf};
  if(r.top&&r.conf>=0.3)return {type:'suggest',options:r.list.filter(function(x){return x.score>=0.2}).map(function(x){return x.i}),conf:r.conf};
  return {type:'unknown',conf:r.conf};
}
var api={norm:norm,tokens:tokens,build:build,answer:answer,best:best};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FaqMatch=api;
})(typeof self!=='undefined'?self:this);
