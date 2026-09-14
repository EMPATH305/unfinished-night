'use strict';
const assert=require('node:assert/strict'),Lore=require('../lore-trust.js'),Game=require('../engine.js'),R=require('../resonance.js');
for(const e of Lore.entries){
 for(const stage of [0,e.threshold-1,e.threshold,6]){
  const g=new Game();g.state.blank_trust_stage=stage;
  const state=Game.validate(JSON.parse(JSON.stringify(g.state))),before=JSON.stringify(state),entry=Lore.lookup(state,e.id);
  assert.equal(!!entry.annotation,stage>=e.threshold);assert.equal(JSON.stringify(state),before);
  assert.deepEqual(entry.facts,Lore.lookup({...state,blank_trust_stage:0},e.id).facts);
  state.chapter=e.chapter;state.flags['c'+(e.chapter+1)+'_evidence_'+e.node.slice(-1)]=true;
  if(e.node==='inquiry')for(const k of ['a','b','c'])state.flags['c8_evidence_'+k]=true;
  const out=R.decorate(state,e.node,true,{text:['original fact'],choices:[]});
  assert.equal(out.text.includes(e.note),stage>=e.threshold);
 }
}
const legacy=new Game().state;delete legacy.blank_trust_stage;
assert(Lore.entries.every(e=>Lore.lookup(Game.validate(legacy),e.id).annotation===null));
assert.equal(Lore.entries.length,4);
console.log('PASS: four exact lore bindings, every threshold, unchanged facts, legacy defaults, import normalization and live scene synchronization.');
