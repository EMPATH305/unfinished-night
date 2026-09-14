'use strict';
const assert=require('node:assert/strict');
const Trust=require('../trust.js');
const Game=require('../engine.js');
assert.equal(Trust.letters.length,5);
assert.deepEqual(Trust.letters.map(l=>l.id),[1,2,3,4,5]);
assert.equal(Trust.letters[1].answers.length,2);
assert(Trust.letters[0].answers[0].text.includes('更加堅堅強'),'Keep supplied wording, including repetition');
assert(Trust.letters[4].answers[0].text.endsWith('擁有信念就不怕被動搖。'));
const routes=[
 [0,'keeper',{c1:'dawn'},{},1],
 [5,'witness',{c6:'commons'},{},2],
 [3,'door',{c4:'rest'},{c4_after:true},3],
 [6,'witness',{c7:'reopen'},{},4],
 [4,'ink',{}, {c5_promise:true},5],
 [7,'witness',{c8:'shortwatch'},{},5]
];
for(const [chapter,node,choices,flags,id] of routes){const state={chapter,choices,flags,contentVersion:2},before=JSON.stringify(state);assert.deepEqual(Trust.at(state,node,true),[id]);assert.deepEqual(Trust.at(state,node,false),[]);assert.equal(JSON.stringify(state),before);}
assert.deepEqual(Trust.at({chapter:3,choices:{c4:'rest'},flags:{},contentVersion:2},'door',true),[]);
const g=new Game(),before=JSON.stringify(g.state);Trust.at(g.state,'keeper',true);assert.equal(JSON.stringify(g.state),before);
const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../trust.js'),'utf8');
assert(!/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|XMLHttpRequest|\.flag\(|\.remember\(/.test(source),'Trust must not store, transmit or mutate progress');
console.log('PASS: exactly five author letters, both letter-two versions, six optional revisit placements, no state mutation or storage/network APIs.');
