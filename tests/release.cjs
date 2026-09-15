const assert=require('node:assert');
global.NightRelease={chapters:5,edition:'PART_ONE'};
const Game=require('../engine.js');
const I18n=require('../i18n.js');
const completed=require('./first-part-completed.json');
const game=new Game(completed);
assert.equal(global.NightRelease.chapters,5);
assert.equal(I18n.chapters.length,5);
assert.equal(I18n.trust.length,5);
assert.equal(I18n.nodes.length,5);
const Story=global.NightStory;
const cjk=/[\u3400-\u9fff]/;
for(let chapter=0;chapter<5;chapter++){
 const all=[...Story.chapters[chapter].nodes,...Story.chapters[chapter].expansionNodes];
 assert.equal(I18n.nodes[chapter].length,all.length,'Every public landmark needs an English name');
 assert.equal(I18n.regions[chapter].length,Story.chapters[chapter].regions.length,'Every public area needs an English name');
 all.forEach(([id],index)=>{
  assert(!cjk.test(I18n.nodes[chapter][index]),'English landmark contains CJK: '+id);
  const scene=I18n.scene(chapter,id);
  assert(scene?.length&&!scene.some(cjk.test.bind(cjk)),'English scene missing or contains CJK: '+id);
 });
}
for(const value of [...I18n.regions.flat(),...Object.values(I18n.phases)])assert(!cjk.test(value),'English navigation contains CJK: '+value);
assert(!game.ending().choices.some(c=>c.id==='continue-second'),'Part One ending must not expose Part Two');
assert.throws(()=>game.startSecond(),/第二部仍在製作中/);
const later={...completed,chapter:5,finished:false,contentVersion:3};
assert.equal(new Game(later).state.chapter,5,'Later save remains valid data and is not downgraded');
assert(!JSON.stringify(I18n).includes('林萱渝'),'English bundle must not contain creator-private responses');
console.log('PASS: five-chapter release gate, retained later save data, five-part English content, no private answers.');
