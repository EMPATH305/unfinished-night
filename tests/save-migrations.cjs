'use strict';
const assert=require('node:assert/strict');
const Game=require('../engine.js');
const legacy=require('./legacy-saves.json');
for(const old of legacy){
 const original=JSON.stringify(old),g=new Game(old);
 assert.equal(JSON.stringify(old),original,'Migration must not mutate source');
 assert.equal(g.state.version,2);assert.equal(g.state.contentVersion,1);
 for(const key of ['chapter','started','finished','flags','choices','memories','pigments','position'])assert.deepEqual(g.state[key],old[key]);
 assert.deepEqual(new Game(g.state).state,g.state);
}
const expanded={...new Game().state,version:1,started:true,region:1,flags:{c1_blue:true},pigments:['blue']};
const updated=new Game(expanded);assert.equal(updated.state.version,2);assert.equal(updated.state.region,1);assert.equal(updated.state.contentVersion,2);assert(updated.carries('blue'));
for(const version of [undefined,null,0,-1,1.5,'1',3,99])assert.throws(()=>new Game({...expanded,version}));
assert.throws(()=>new Game({...expanded,version:3}),/較新的遊戲版本/);
assert.throws(()=>new Game({...expanded,contentVersion:0}));
assert.throws(()=>new Game({...expanded,region:'0'}));
assert.throws(()=>new Game({...expanded,version:2,contentVersion:undefined}));
console.log('PASS: v1 legacy and expanded saves migrate to v2 without losing progress; repeat imports stable; malformed/future saves rejected explicitly.');
