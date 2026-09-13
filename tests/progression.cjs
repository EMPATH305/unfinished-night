'use strict';
const assert=require('node:assert/strict');
const Game=require('../engine.js');
const Story=require('../story.js');
const legacy=require('./legacy-saves.json');
let checkpoints=0;
function snapshot(g){
 const resumed=new Game(JSON.parse(JSON.stringify(g.state)));assert.deepEqual(resumed.state,g.state);
 if(g.goal){assert(g.allNodes.some(n=>n[0]===g.goal.node));assert(g.regionFor(g.goal.node)>=0)}
 assert(g.state.flags&&Object.keys(g.state.flags).length<=150);checkpoints++;
}
function visit(g,id){const region=g.regionFor(id);assert(region>=0,'Unknown landmark '+id);if(region!==g.state.region)g.setRegion(region);const view=g.interact(id);assert(view?.speaker&&view.text.length);snapshot(g);return view;}
function choose(g,id){assert(g.view.choices.some(c=>c.id===id),'Unavailable action '+id+' at '+g.view.speaker);const view=g.choose(id);snapshot(g);return view;}
function solve(g,input){
 const before=JSON.stringify(g.state);assert.equal(g.solve(['wrong']).ok,false);assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.solve(input).ok,true);snapshot(g);checkpoints+=3;
}
function blockedExit(g,id){assert.throws(()=>g.advance());visit(g,id);assert(!g.view.choices.some(o=>o.id==='next'));}
const fresh=()=>{const g=new Game();g.start();return g};
for(const c1 of ['night','dawn'])for(const c2 of ['send-letter','build-beacon'])for(const c3 of ['seasons','consent'])for(const c4 of ['rest','release'])for(const c5 of ['restore','open','share'])for(const annotation of ['margin','blank']){
 const g=fresh();assert.equal(g.state.contentVersion,2);
 assert.throws(()=>g.interact('workshop'),'Cannot interact across regions without travelling');
 visit(g,'star');assert.equal(g.puzzle,null);assert.throws(()=>g.choose('dawn'));
 visit(g,'lamp');choose(g,'borrow-yellow');visit(g,'letter');choose(g,'reveal');assert(!g.carries('yellow'));
 visit(g,'well');choose(g,'borrow-blue');visit(g,'keeper');choose(g,'freeze');assert(!g.carries('blue'));
 visit(g,'star');solve(g,['燈','月','星']);visit(g,'star');assert(!g.view.choices.some(c=>c.id==='dawn'),'Must hear residents first');
 visit(g,'square');assert(g.has('c1_roll'));visit(g,'workshop');solve(g,[1,2,0]);visit(g,'square');choose(g,annotation==='margin'?'hear-fear':'hear-loss');
 visit(g,'star');choose(g,c1);blockedExit(g,'gate');visit(g,'square');choose(g,'record-town');visit(g,'lamp');visit(g,'gate');choose(g,'next');
 assert.equal(g.state.chapter,1);visit(g,'daughter');assert(!g.has('c2_daughter'));visit(g,'traveler');visit(g,'sign');visit(g,'feather');visit(g,'brook');visit(g,'path');solve(g,['溪水','舊鐘','遠山']);
 visit(g,'daughter');assert(!g.view.choices.some(c=>c.id==='send-letter'),'Need a return route');visit(g,'markers');const before=JSON.stringify(g.state);assert.equal(g.solve([0,0]).ok,false);assert.equal(JSON.stringify(g.state),before);solve(g,[1,0]);
 visit(g,'daughter');choose(g,c2);blockedExit(g,'gate');visit(g,'post');choose(g,'deliver');visit(g,'gate');choose(g,'next');
 assert.equal(g.state.chapter,2);visit(g,'lamps');assert.equal(g.puzzle,null);visit(g,'gardener');visit(g,'child');visit(g,'crow');visit(g,'archive');visit(g,'cistern');choose(g,'collect-light');visit(g,'lamps');
 assert.match(g.solve([2,2,1]).message,/還差 1/,'Keep user-provided numerical feedback');solve(g,[2,3,1]);visit(g,'lamps');assert(!g.view.choices.some(c=>c.id==='seasons'));visit(g,'board');solve(g,[0,1]);visit(g,'lamps');choose(g,c3);blockedExit(g,'gate');visit(g,'seedlings');choose(g,'care');visit(g,'gardener');visit(g,'gate');choose(g,'next');
 assert.equal(g.state.chapter,3);visit(g,'door');assert(!g.state.choices.c4);visit(g,'desk');visit(g,'bag');choose(g,annotation);visit(g,'bed');visit(g,'mirror');choose(g,'borrow-mirror');visit(g,'wall');
 assert(g.puzzle.items.includes('永遠等待'),'Keep user-added distractor');solve(g,['救下烏鴉','畫境誕生','畫者離開']);visit(g,'window');visit(g,'door');assert(!g.view.choices.some(c=>c.id==='rest'));visit(g,'clock');solve(g,[1,2,0]);visit(g,'door');choose(g,c4);blockedExit(g,'door');visit(g,'bag');choose(g,'pack');visit(g,'door');choose(g,'next');
 assert.equal(g.state.chapter,4);visit(g,'ending');assert(!g.state.finished);visit(g,'frame');for(const id of ['yellow','blue','green']){visit(g,id);choose(g,'borrow-'+id)}visit(g,'weave');solve(g,['藍','綠','黃']);assert.equal(g.state.pigments.length,0);visit(g,'ink');visit(g,'ending');assert(!g.view.choices.some(c=>c.id==='share'));
 visit(g,'council');assert(!g.view.choices.some(c=>c.id==='council-agree'));for(const voice of ['town','road','garden','crow']){visit(g,'council');choose(g,'voice-'+voice)}visit(g,'council');choose(g,'council-agree');visit(g,'ferry');solve(g,[3,2,2]);visit(g,'ending');choose(g,c5);
 assert(g.state.finished);assert.equal(g.state.memories.length,25);assert.equal(g.state.choices.c5,c5);assert.equal(g.ending().text.length,9);assert.equal(g.has('c4_margin'),annotation==='margin');snapshot(g);checkpoints+=5;
 // Finished journeys remain explorable and their ending is stable after import.
 const resumed=new Game(JSON.parse(JSON.stringify(g.state)));visit(resumed,'ending');assert.equal(resumed.view.speaker,g.ending().speaker);
}
// Actual saves captured from the user's pre-expansion main: complete each current
// chapter without imposing new requirements; new material begins at the next one.
legacy.forEach((raw,i)=>{
 const g=new Game(raw);assert.equal(g.state.contentVersion,1);assert.equal(g.regions.length,1);assert.equal(g.goal,null);
 if(i===0){visit(g,'letter');choose(g,'reveal');visit(g,'well');choose(g,'borrow-blue');visit(g,'keeper');choose(g,'freeze');visit(g,'star');solve(g,['燈','月','星']);visit(g,'star');choose(g,'dawn');}
 if(i===1){visit(g,'daughter');choose(g,'send-letter')}
 if(i===2){visit(g,'child');visit(g,'crow');visit(g,'lamps');choose(g,'seasons')}
 if(i===3){visit(g,'window');visit(g,'door');choose(g,'rest')}
 if(i===4){visit(g,'ink');visit(g,'ending');choose(g,'share')}
 if(i<4){visit(g,i===3?'door':'gate');choose(g,'next');assert.equal(g.state.contentVersion,2);assert.equal(g.state.chapter,i+1);assert.equal(g.regions.length,2);snapshot(g)}
 else {assert(g.state.finished);assert.equal(g.ending().text.length,7);snapshot(g)}
});
const g=fresh();assert.throws(()=>g.solve([]));assert.throws(()=>g.advance());assert.throws(()=>g.setRegion(2));assert.throws(()=>g.interact('missing'));
for(const invalid of [{chapter:12},{pigments:['red']},{memories:['__proto__']},{chapter:1},{flags:{bad:'string'}},{position:{x:NaN,y:50}},{region:2},{contentVersion:3}])assert.throws(()=>new Game({...g.state,...invalid}));
// Region navigation invalidates a staged puzzle; a cancelled task cannot mutate progress.
visit(g,'lamp');choose(g,'borrow-yellow');visit(g,'letter');choose(g,'reveal');visit(g,'well');choose(g,'borrow-blue');visit(g,'keeper');choose(g,'freeze');visit(g,'workshop');g.setRegion(0);assert.throws(()=>g.solve([1,2,0]));assert(!g.has('c1_prepared'));
assert.equal(Object.values(Story.memories).filter(m=>m.chapter<5).length,25);
console.log('PASS: 96 complete expanded routes (48 main choices × 2 personal annotations), 10 puzzles, regional navigation, aftermath gates, 25 memories, preserved user hints/distractors, six real legacy saves, invalid imports. '+checkpoints+' checkpoints.');
