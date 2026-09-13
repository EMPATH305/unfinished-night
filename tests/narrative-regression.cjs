'use strict';
const assert=require('node:assert/strict'),Game=require('../engine.js');
const freshChapter=()=>new Game({...new Game().state,chapter:1,started:true,choices:{c1:'dawn'}});
const visit=(g,id)=>{const r=g.regionFor(id);if(r!==g.state.region)g.setRegion(r);return g.interact(id)};
for(const order of [['feather','traveler','brook'],['brook','feather','traveler'],['traveler','brook','feather']]){
 const g=freshChapter();
 for(let i=0;i<order.length;i++){visit(g,order[i]);const v=visit(g,'path');assert.equal(!!v.puzzle,i===2,'Each source is required; exploration order stays free')}
 assert.equal(g.solve(['溪水','舊鐘','遠山']).ok,true);
}
for(const decision of ['send-letter','build-beacon']){
 const g=freshChapter();
 const first=visit(g,'traveler').text.join('');visit(g,'feather');
 assert.match(g.memoryText('footprints'),/尚未核對/,'Journal must not invent unseen evidence');
 const brookFirst=visit(g,'brook').text.join('');assert(!g.memoryText('footprints').includes('尚未核對'));
 const signFirst=visit(g,'sign').text.join('');visit(g,'path');g.solve(['溪水','舊鐘','遠山']);
 assert.notEqual(visit(g,'sign').text.join(''),signFirst);
 visit(g,'markers');g.solve([0,1]);assert.notEqual(visit(g,'traveler').text.join(''),first);
 visit(g,'daughter');g.choose(decision);assert.notEqual(visit(g,'brook').text.join(''),brookFirst);
 visit(g,'post');g.choose('deliver');assert.match(visit(g,'traveler').speaker,/費恩/);
 assert.notEqual(visit(g,'sign').text.join(''),signFirst);
 const resumed=new Game(JSON.parse(JSON.stringify(g.state)));assert.equal(resumed.memoryText('footprints'),g.memoryText('footprints'));
}
const modern=new Game(),legacy=new Game({...modern.state,version:1,contentVersion:1});
assert.notEqual(modern.memoryText('letter'),legacy.memoryText('letter'));
assert.notEqual(modern.memoryText('clock'),legacy.memoryText('clock'));
assert.match(legacy.memoryText('letter'),/先窗裡的燈，再水中的月/,'Old journey keeps its original clue');
console.log('PASS: split evidence gates, free investigation order, evolving journal, revisit reactions for both decisions, legacy clue compatibility.');
