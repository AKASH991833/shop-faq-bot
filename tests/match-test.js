const M=require('../match.js');
const faqs=[
{q:'What are your opening hours?',a:'We are open Monday to Saturday, 10 AM to 8 PM. Sunday closed.',k:'timing, time, khulta, open, close'},
{q:'Where is your shop located?',a:'12 Sample Road, Sample City. Landmark: near the main market.',k:'address, location, kahan, map, direction'},
{q:'Do you offer home delivery?',a:'Yes, free home delivery within 5 km on orders above Rs 500.',k:'delivery, deliver, home, ghar'},
{q:'Which payment methods do you accept?',a:'UPI, cards and cash.',k:'payment, upi, gpay, phonepe, cash, card'},
{q:'What is your return and refund policy?',a:'Return within 7 days with bill.',k:'return, refund, exchange, wapas'},
{q:'How can I contact you?',a:'Call or WhatsApp 90000 00000.',k:'contact, phone, number, call, whatsapp'},
{q:'Do you give any discount?',a:'Festival offers run through the year. Ask in store.',k:'discount, offer, chhoot'},
{q:'Do you give warranty on products?',a:'Brand warranty applies as per the product card.',k:'warranty, guarantee'}
];
const tests=[
['shop kab khulta hai',0],['what time do you close','0'],['timings?',0],['opening time',0],['sunday open hai kya',0],
['address kya hai',1],['shop kahan hai',1],['where are you located',1],['location bhejo',1],['dukan ka pata',1],
['home delivery milegi?',2],['do you deliver to my house',2],['delivery charges',2],['ghar tak delivery',2],
['can I pay by gpay',3],['upi accepted?',3],['cash on delivery',null],['payment kaise kare',3],['do you take cards',3],
['can i return something',4],['refund policy',4],['exchange possible hai kya',4],['wapas kar sakte hai',4],
['phone number do',5],['whatsapp number',5],['contact kaise kare',5],['how to call you',5],
['any offer going on',6],['discount milega kya',6],['festival offers',6],
['warranty kitne saal ki hai',7],['is there guarantee',7],
['what is the weather today',-1],['who won the cricket match',-1],['do you sell iphones',-1],['asdf qwer',-1],['tell me a joke',-1]
];
const idx=M.build(faqs);let ok=0,bad=0,wrongAnswer=0,unk=0,sugg=0;
tests.forEach(([q,exp])=>{exp=exp===null?null:Number(exp);const r=M.answer(idx,faqs,q);let got=r.type==='answer'?r.index:(r.type==='suggest'?'S'+r.options.join(','):-1);
 let pass;if(exp===-1)pass=(r.type==='unknown'||r.type==='suggest');else if(exp===null)pass=true;else pass=(r.type==='answer'&&r.index===exp)||(r.type==='suggest'&&r.options.includes(exp));
 if(exp!==null&&exp!==-1&&r.type==='answer'&&r.index!==exp)wrongAnswer++;
 if(exp===-1&&r.type==='answer')wrongAnswer++;
 pass?ok++:bad++;if(!pass||r.type==='suggest')console.log((pass?'~ ':'FAIL ')+q+' -> '+JSON.stringify(r));});
console.log('pass',ok,'fail',bad,'confident-wrong',wrongAnswer,'of',tests.length);
['hello','hi there','thanks','thank you','namaste','bye'].forEach(s=>console.log(s,M.answer(idx,faqs,s).type));
