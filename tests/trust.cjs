'use strict';
const assert=require('node:assert/strict'),Trust=require('../trust.js'), Game=require('../engine.js');
assert.equal(Trust.letters.length,6);
for(const l of Trust.letters)assert.deepEqual(Object.keys(l).sort(),['id','question']);
const state={chapter:0,choices:{c1:'dawn'},flags:{},contentVersion:2},before=JSON.stringify(state);
assert.deepEqual(Trust.at(state,'lamp',true),[1]);assert.deepEqual(Trust.at(state,'lamp',false),[1]);assert.equal(JSON.stringify(state),before);
const g=new Game(),legacy=JSON.parse(JSON.stringify(g.state));delete legacy.blank_trust_stage;
assert.equal(Game.validate(legacy).blank_trust_stage,0);
for(const bad of [null,-1,7,1.5,'5'])assert.throws(()=>Game.validate({...legacy,blank_trust_stage:bad}));
for(let i=0;i<5;i++){assert(g.sealTrust(i));assert(!g.sealTrust(i));assert.equal(new Game(JSON.parse(JSON.stringify(g.state))).state.blank_trust_stage,i+1)}
assert(!g.sealTrust(5));assert(!Trust.available(g.state));
g.state.chapter=6;assert(Trust.available(g.state));assert.deepEqual(Trust.at(g.state,'witness',false),[6]);assert(g.sealTrust(5));assert(!g.sealTrust(6));assert(!Trust.available(g.state));
const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../trust.js'),'utf8');
assert(!/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|XMLHttpRequest/.test(source));
console.log('PASS: public prompts, old-save defaults, stage validation, duplicate seals, chapter gate, no answer storage APIs.');


const Resonance=require('../resonance.js');
const lamp=new Game();lamp.state.blank_trust_stage=1;
assert(!lamp.interact('lamp').text.join('').includes('留著接縫'));
const revisit=lamp.interact('lamp');assert(revisit.text.join('').includes('留著接縫'));
assert.deepEqual(revisit.choices.map(x=>x.id),['borrow-yellow']);
assert.equal(Resonance.journal(lamp.state,0).length,0,'Not marked read by merely creating a view');
for(const id of revisit.marginIds)lamp.flag(id);
assert.equal(Resonance.journal(new Game(JSON.parse(JSON.stringify(lamp.state))).state,0).length,1);
lamp.choose('borrow-yellow');assert(lamp.carries('yellow'),'Narrative decoration preserves actions');
for(const [stage,chapter,node,choice] of [[0,0,'lamp',{}],[1,1,'post',{}],[2,3,'door',{c4:'rest'}],[3,3,'mirror',{}],[4,4,'frame',{}]]){
 assert.deepEqual(Trust.at({blank_trust_stage:stage,chapter,choices:choice},node,true),[stage+1]);
}
const base={text:['Original fact'],choices:[{id:'restore'},{id:'open'},{id:'share'}]};
for(const stage of [0,4,5,6]){const out=Resonance.decorate({chapter:4,flags:{},blank_trust_stage:stage},'ending',true,base);assert.deepEqual(out.choices,base.choices);assert.equal(out.text.join('').includes('留白不會自動使你無辜'),stage>=5)}
const denied=Resonance.decorate({chapter:6,flags:{},blank_trust_stage:6},'record_b',true,{text:['Ask consent'],choices:[]});assert(!denied.bellEvidence);
for(const stage of [0,5,6]){const out=Resonance.decorate({chapter:6,flags:{c7_evidence_b:true},blank_trust_stage:stage},'record_b',false,{text:['Same verified fact'],choices:[]});assert.equal(out.text[0],'Same verified fact');assert(out.bellEvidence);assert.equal(out.text.join('').includes('第六封'),stage>=6)}
console.log('PASS: contextual first-five route, read-only journal unlocks, consent gates, identical evidence and ending choices across stages.');
