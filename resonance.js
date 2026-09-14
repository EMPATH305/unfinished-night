/* Public scene responses. Seal counts are not knowledge of a person's letters. */
(function(root){'use strict';
const notes=[
 {id:'c1_lamp_margin_seen',chapter:0,node:'lamp',stage:1,title:'製燈人的燈 · 回訪註記',text:['燈罩的裂口被補過，舊接縫仍在。','墨：「修燈人沒有把接縫磨掉。他說，再壞一次時，得知道從哪裡拆。」','「留著接縫，不表示他希望燈再裂一次。」']},
 {id:'c2_post_margin_seen',chapter:1,node:'post',stage:2,title:'回信站 · 回訪註記',text:['椅背上留著上一位等信者磨出的凹痕。新來的人坐下，沒有被要求照他的姿勢等待。','墨：「留下等過的痕跡，不等於把下一封信也押在這裡。」']},
 {id:'c3_crow_margin_seen',chapter:2,node:'crow',stage:2,title:'藏雨的烏鴉 · 回訪註記',text:['瓶裡還有雨聲。墨沒有打開它。','「留下一段聲音，不等於留住聽見它的整個人。瓶子裝不下的，不能由我補齊。」']},
 {id:'c4_door_margin_seen',chapter:3,node:'door',stage:3,title:'離室走廊 · 回訪註記',text:['牆上的稱謂褪掉了。門軸仍按原來的方向轉動。','墨：「少了一個名字，還不能斷言裡面空了。」']},
 {id:'c4_mirror_margin_seen',chapter:3,node:'mirror',stage:4,title:'鏡前 · 回訪註記',text:['鏡子慢了一瞬。你抬起手時，玻璃裡的手還停在原處。','墨：「它記得上一刻。這一刻，還得重新看。」']},
 {id:'c5_frame_margin_seen',chapter:4,node:'frame',stage:5,title:'最初的畫架 · 回訪註記',text:['海面映出一小片平靜，沒有附上返航日期。','墨：「平靜可以在此刻發生。船是否會回來，仍須另查。」']},
 {id:'c6_record_a_margin_seen',chapter:5,node:'record_a',stage:2,title:'兩面的代名牌 · 查證註記',text:['牌背留著磨痕。它能證明曾被佩戴，不能證明那個名字仍被願意地使用。','墨：「曾經答應，不能替每一個後來的日子簽名。」']},
 {id:'c7_record_a_margin_seen',chapter:6,node:'record_a',stage:4,title:'雙窗聽證所 · 查證註記',text:['他認得那晚的自己。圖紙沒有因此少掉另一扇窗。','墨：「認得自己站在哪裡，還不足以知道別人看見了什麼。」']},
 {id:'c7_record_c_margin_seen',chapter:6,node:'record_c',stage:1,title:'暫疑廊 · 更正註記',text:['更正件沒有覆蓋原來的字。兩種墨色隔著一道細線。','墨：「撤回一句話，不必把說過它的人一併刮掉。」','「但留下那個人，也不能讓錯字繼續替別人作證。」']},
 {id:'c8_record_c_margin_seen',chapter:7,node:'record_c',stage:5,title:'沒有歸期的信 · 查證註記',text:['艾汀收回信，指尖仍壓著折線。','墨：「想念有它的位置。歸期若沒有寫，我們就不能替它填上。」']}
];
const bellOrdinary=['墨：「把鐘聲記在鐘聲那一欄。門開沒開，還要去找門的證據。」'];
const bellAfterSix=['墨把爪尖移開。梁端沒有立刻安靜。','「第六封，你也說已經封好了。我沒有讀過。」','「這截木頭還在響。眼前沒有人拉它，不表示先前的力量從未存在。」','牠看著兩份紀錄留下的先後。','「但我們若把每一次回聲都叫作此刻的證詞，就會讓已經離開的人，繼續替現在回答。」','「你聽見了聲音。聲音從哪裡來，仍是另一件事。」'];
const ordinary=['墨停在畫架背面。木框把牠的影子截成兩段。','「落下去以後，這一筆會讓一些地方相連，也會遮住一些地方。」','「我能把我們看見的再說一遍。沒看見的，我補不了。」','牠收起翅膀。「你要落在哪裡？」'];
const afterFive=['墨沒有落在畫架上。牠留在地面，離你的影子半步。','「你曾告訴這裡，五封信已經封好。這裡只記著封信的數目。」','「我不知道你寫了什麼。也不能拿你沒有交出的字，替這一筆作證。」','海面的一小塊白，越過了木框投下的陰影。','「你可以相信握筆的這隻手。被它改動的人，仍可以不同意。」','「如果落筆之後，你發現自己錯了——你準備從哪裡開始改？」','墨側過頭，看向尚未著色的邊緣。','「留白不會自動使你無辜。畫滿，也不會使你完整。」'];
function permitted(state,node){return !node.startsWith('record_')||!!state.flags['c'+(state.chapter+1)+'_evidence_'+node.slice(-1)]}
function decorate(state,node,revisited,view){
 const result={...view,text:[...view.text],resonanceNode:node,resonanceRevisited:revisited};
 const selected=notes.filter(n=>n.chapter===state.chapter&&n.node===node&&(state.blank_trust_stage||0)>=n.stage&&(revisited||node.startsWith('record_'))&&permitted(state,node));
 result.marginStart=result.text.length;
 for(const n of selected)result.text.push(...n.text);
 result.marginIds=selected.map(n=>n.id);
 if(state.chapter===6&&node==='record_b'&&permitted(state,node)){
  result.text.push(...((state.blank_trust_stage||0)>=6?bellAfterSix:bellOrdinary));
  result.bellEvidence=true;
 }
 if(state.chapter===4&&view.choices.some(c=>c.id==='restore')){
  result.text.push(...((state.blank_trust_stage||0)>=5?afterFive:ordinary));result.framePrelude=true;
 }
 return result;
}
function journal(state,chapter){return notes.filter(n=>n.chapter===chapter&&state.flags[n.id]&&(state.blank_trust_stage||0)>=n.stage)}
const checks=[{title:'並排查看：證人入場與鐘梁振動的先後',text:'紀錄確認無人陳述時也留下尾音，且節奏與上一場相似。現有材料不足以逐次配對某位證人與某一聲回響；沒有精確時刻的地方仍留白。'},{title:'查看空場測試的限制',text:'這次測試支持：此鐘部分響聲不由當下證詞引起。它不能證明每一座鐘皆如此，也不能直接判定每份舊判決錯誤。確信可能引起共鳴，殘留振動也可能延續；鐘聲不是外界事實的保證。'}];
root.NightResonance={notes,decorate,journal,checks,bellAfterSix};if(typeof module!=='undefined')module.exports=root.NightResonance;
})(typeof globalThis!=='undefined'?globalThis:this);
