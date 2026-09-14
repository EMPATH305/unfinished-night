'use strict';
const assert=require('node:assert/strict'),Trust=require('../trust.js');
assert.equal(Trust.letters.length,5);
for(const l of Trust.letters)assert.deepEqual(Object.keys(l).sort(),['id','question']);
const state={chapter:0,choices:{c1:'dawn'},flags:{},contentVersion:2},before=JSON.stringify(state);
assert.deepEqual(Trust.at(state,'keeper',true),[1]);assert.deepEqual(Trust.at(state,'keeper',false),[]);assert.equal(JSON.stringify(state),before);
const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../trust.js'),'utf8');
assert(!/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|XMLHttpRequest/.test(source));
console.log('PASS: public prompts only, no creator responses, no persistent storage/network APIs.');
