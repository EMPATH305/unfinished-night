'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Game=require('../engine.js'),Story=require('../story.js'),Second=require('../second.js');
const legacy=require('./legacy-saves.json');
const firstEnd=legacy.find(s=>s.finished);
assert(firstEnd,'Need real first-part completed save');
let checkpoints=0;
const check=g=>{assert.deepEqual(new Game(JSON.parse(JSON.stringify(g.state))).state,g.state);checkpoints++;};
const visit=(g,id)=>{const r=g.regionFor(id);assert(r>=0);if(r!==g.state.region)g.setRegion(r);const v=g.interact(id);assert(v&&v.text.every(t=>typeof t==='string'));check(g);return v;};
const act=(g,id)=>{const v=g.choose(id);check(g);return v;};
const round=(g,input)=>{const r=g.solve(input);check(g);return r;};
assert.equal(Story.chapters.length,8);
assert.equal(Object.keys(Story.memories).length,40);
for(const d of Second.regions){assert(fs.existsSync(require('node:path').join(__dirname,'../assets',d.image)));assert.equal(d.labels.length,10);}
assert.throws(()=>new Game().startSecond());
for(const ending of ['restore','open','share'])for(let mask=0;mask<8;mask++){
 const raw=JSON.parse(JSON.stringify(firstEnd));raw.choices.c5=ending;const g=new Game(raw),original=JSON.stringify(raw);
 g.ending();act(g,'continue-second');assert.equal(JSON.stringify(raw),original);assert.equal(g.state.chapter,5);assert.equal(g.state.contentVersion,3);assert(!g.state.finished);assert.equal(g.state.choices.c5,ending);
 for(let i=0;i<3;i++){
  const d=Second.regions[i],k='c'+(i+6);
  visit(g,'gate');assert(!g.actions.has('next')&&!g.actions.has('finish-second'));
  visit(g,'record_a');assert(!g.has(k+'_evidence_a'),'Consent required');
  visit(g,'council');assert.equal(g.actions.size,0);
  visit(g,'witness');
  for(const x of ['c','a','b'])visit(g,'record_'+x);
  visit(g,'after');assert(g.state.memories.includes(k+'_history'));
  visit(g,'inquiry');const before=JSON.stringify(g.state);assert(!round(g,[99,99,99]).ok);assert.equal(JSON.stringify(g.state),before,'Wrong answer preserves progress');
  g.setRegion(1-g.state.region);assert.throws(()=>g.solve(d.inquiry.answer),'Switching region invalidates puzzle');
  visit(g,'inquiry');assert(round(g,d.inquiry.answer).ok);
  visit(g,'source');act(g,'borrow-color');assert(g.carries(d.color));
  visit(g,'source');assert(!g.actions.has('return-color'),'No return before safe handoff');
  visit(g,'workshop');assert(!round(g,[]).ok);assert(!round(g,d.repair.answer.map(()=>0)).ok);assert(round(g,d.repair.answer).ok);assert(g.carries(d.color));
  visit(g,'council');assert.equal(g.actions.size,0,'Cannot decide with borrowed resource outstanding');
  visit(g,'source');act(g,'return-color');assert.equal(g.state.pigments.length,0);
  visit(g,'council');act(g,d.choices[(mask>>i)&1][0]);
  visit(g,'gate');assert.equal(g.actions.size,0,'Decision alone does not finish chapter');
  visit(g,'after');act(g,'record-aftermath');visit(g,'gate');assert.equal(g.actions.size,0,'Must hear resident again');
  visit(g,'witness');assert(Second.ready(g));visit(g,'gate');
  if(i<2){act(g,'next');assert.equal(g.state.chapter,i+6);assert.equal(g.state.contentVersion,3);}
  else{act(g,'finish-second');assert(g.state.finished);assert.equal(g.state.chapter,7);assert(g.ending().text.some(t=>t.includes('八章')));}
 }
 for(let i=0;i<3;i++){const d=Second.regions[i],v=d.choices[(mask>>i)&1];assert(g.ending().text.includes(v[3]));assert(g.memoryText('c'+(i+6)+'_aftermath').includes(v[3]));}
 assert.throws(()=>g.advance());assert.throws(()=>g.startSecond());
 assert.throws(()=>new Game({...g.state,contentVersion:2}));
 assert.throws(()=>new Game({...g.state,flags:{...g.state.flags,c8_after:false}}));
}
console.log('PASS: 24 full second-part routes (8 choices × 3 inherited endings), 6 puzzles, all evidence and handoff gates, repeated save imports, resource return, dynamic aftermath memories; '+checkpoints+' checkpoints.');
