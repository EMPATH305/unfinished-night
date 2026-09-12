const assert=require('node:assert/strict');
const Game=require('../engine.js');
let checks=0;
function snapshot(g){const round=new Game(JSON.parse(JSON.stringify(g.state)));assert.deepEqual(round.state,g.state);checks++}
function interact(g,n){const v=g.interact(n);assert(v&&v.speaker&&v.text.length);snapshot(g);return v}
function choose(g,id){const r=g.choose(id);snapshot(g);return r}
function solve(g,answer){const before=JSON.stringify(g.state);assert.equal(g.solve(['wrong']).ok,false);assert.equal(JSON.stringify(g.state),before);assert.equal(g.solve(answer).ok,true);snapshot(g);checks+=3}
for(const c1 of ['night','dawn'])for(const c2 of ['send-letter','build-beacon'])for(const c3 of ['seasons','consent'])for(const c4 of ['rest','release'])for(const c5 of ['restore','open','share']){
 const g=new Game();g.start();
 interact(g,'star');assert.equal(g.puzzle,null);assert.throws(()=>g.choose('dawn'));
 interact(g,'keeper');assert(!g.has('c1_keeper'));
 interact(g,'letter');assert(!g.has('c1_letter'));
 interact(g,'lamp');choose(g,'borrow-yellow');interact(g,'letter');choose(g,'reveal');assert(!g.carries('yellow'));
 interact(g,'well');choose(g,'borrow-blue');interact(g,'keeper');choose(g,'freeze');assert(!g.carries('blue'));
 interact(g,'star');solve(g,['燈','月','星']);interact(g,'star');choose(g,c1);interact(g,'lamp');interact(g,'gate');choose(g,'next');
 assert.equal(g.state.chapter,1);interact(g,'daughter');assert(!g.has('c2_daughter'));interact(g,'traveler');interact(g,'sign');interact(g,'brook');interact(g,'feather');interact(g,'path');solve(g,['溪水','舊鐘','遠山']);interact(g,'daughter');choose(g,c2);interact(g,'daughter');interact(g,'gate');choose(g,'next');
 assert.equal(g.state.chapter,2);interact(g,'lamps');assert.equal(g.puzzle,null);interact(g,'gardener');interact(g,'child');interact(g,'crow');interact(g,'archive');interact(g,'cistern');choose(g,'collect-light');interact(g,'lamps');solve(g,[2,3,1]);interact(g,'lamps');choose(g,c3);interact(g,'gardener');interact(g,'gate');choose(g,'next');
 assert.equal(g.state.chapter,3);interact(g,'door');assert(!g.state.choices.c4);interact(g,'desk');interact(g,'bed');interact(g,'mirror');choose(g,'borrow-mirror');interact(g,'wall');solve(g,['救下烏鴉','畫境誕生','畫者離開']);assert(!g.carries('blue'));interact(g,'window');interact(g,'door');choose(g,c4);interact(g,'door');choose(g,'next');
 assert.equal(g.state.chapter,4);interact(g,'ending');assert(!g.state.finished);interact(g,'frame');for(const id of ['yellow','blue','green']){interact(g,id);choose(g,'borrow-'+id)}interact(g,'weave');solve(g,['藍','綠','黃']);assert.equal(g.state.pigments.length,0);interact(g,'ink');interact(g,'ending');choose(g,c5);assert(g.state.finished);assert.equal(g.state.memories.length,10);assert.equal(g.state.choices.c5,c5);assert.equal(g.ending().text.length,7);snapshot(g);checks+=5;
}
const g=new Game();assert.throws(()=>g.solve([]));assert.throws(()=>g.advance());assert.throws(()=>g.interact('missing'));assert.throws(()=>new Game({...g.state,chapter:12}));assert.throws(()=>new Game({...g.state,pigments:['red']}));assert.throws(()=>new Game({...g.state,memories:['__proto__']}));assert.throws(()=>new Game({...g.state,chapter:1}));assert.throws(()=>new Game({...g.state,flags:{bad:'string'}}));assert.throws(()=>new Game({...g.state,position:{x:NaN,y:50}}));
console.log('PASS: 48 complete five-chapter routes, all 5 puzzles, wrong-answer recovery, prerequisites, colour returns, 10 memories, save round-trips and invalid imports. '+checks+' assertions/checkpoints.');
