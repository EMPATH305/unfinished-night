'use strict';
const assert=require('node:assert/strict'),Game=require('../engine.js'),Atlas=require('../atlas.js');
const g=new Game();assert.equal(Atlas.available(g.state).length,0);
for(const entry of Atlas.entries){
 assert(entry.text.length>=3);const state={...g.state,chapter:entry.chapter,flags:{['c'+(entry.chapter+1)+'_visited_'+entry.node]:true}};
 assert.equal(Atlas.available(state).length,1);assert.equal(Atlas.at(state,entry.node).id,entry.id);
 const old=JSON.stringify(state);Atlas.available(state);assert.equal(JSON.stringify(state),old,'Reading lore must not mutate a save');
 const chapter=require('../story.js').chapters[entry.chapter];assert([...chapter.nodes,...chapter.expansionNodes].some(n=>n[0]===entry.node),'Every story needs a reachable landmark');
}
assert.equal(new Set(Atlas.entries.map(e=>e.id)).size,10);
g.start();g.interact('lamp');const before=[...g.actions.keys()];assert(Atlas.at(g.state,'lamp'));assert.deepEqual([...g.actions.keys()],before,'Side stories cannot replace live choices');g.choose('borrow-yellow');assert(g.carries('yellow'));
const resumed=new Game(JSON.parse(JSON.stringify(g.state)));assert.deepEqual(Atlas.available(resumed.state),Atlas.available(g.state));
console.log('PASS: 10 reachable world stories, visit-based discovery, legacy-compatible derivation and untouched main actions.');
