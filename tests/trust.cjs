'use strict';
const assert=require('node:assert/strict'),Trust=require('../trust.js'), Game=require('../engine.js');
assert.equal(Trust.letters.length,6);
for(const l of Trust.letters)assert.deepEqual(Object.keys(l).sort(),['id','question']);
const state={chapter:0,choices:{c1:'dawn'},flags:{},contentVersion:2},before=JSON.stringify(state);
assert.deepEqual(Trust.at(state,'lamp',true),[1]);assert.deepEqual(Trust.at(state,'lamp',false),[]);assert.equal(JSON.stringify(state),before);
const g=new Game(),legacy=JSON.parse(JSON.stringify(g.state));delete legacy.blank_trust_stage;
assert.equal(Game.validate(legacy).blank_trust_stage,0);
for(const bad of [null,-1,7,1.5,'5'])assert.throws(()=>Game.validate({...legacy,blank_trust_stage:bad}));
for(let i=0;i<5;i++){assert(g.sealTrust(i));assert(!g.sealTrust(i));assert.equal(new Game(JSON.parse(JSON.stringify(g.state))).state.blank_trust_stage,i+1)}
assert(!g.sealTrust(5));assert(!Trust.available(g.state));
g.state.chapter=6;assert(Trust.available(g.state));assert.deepEqual(Trust.at(g.state,'witness',false),[6]);assert(g.sealTrust(5));assert(!g.sealTrust(6));assert(!Trust.available(g.state));
const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../trust.js'),'utf8');
assert(!/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|XMLHttpRequest/.test(source));
console.log('PASS: public prompts, old-save defaults, stage validation, duplicate seals, chapter gate, no answer storage APIs.');
