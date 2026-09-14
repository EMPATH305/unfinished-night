/* Public annotations only. Lookup never changes progress or infers letter contents. */
(function(root){'use strict';
const Second=root.NightSecond||(typeof require==='function'?require('./second.js'):null);
const entries=[
 {id:'snow_correction',chapter:6,node:'record_c',threshold:1,title:'卷七 · 雪鈴城：暫疑廊更正件',record:2,note:'「留著接縫，不表示他希望燈再裂一次。」修復與保存是否必須二選一？'},
 {id:'salt_nameplate',chapter:5,node:'record_a',threshold:2,title:'卷六 · 赤赭鹽市：米珂兩面的代名牌',record:0,note:'「牌背留著磨痕。它能證明曾被佩戴，不能證明那個名字仍被願意地使用。」曾有意義，是否就必須繼續承擔？'},
 {id:'snow_windows',chapter:6,node:'record_a',threshold:4,title:'卷七 · 雪鈴城：雙窗聽證所的窗位圖',record:0,note:'「他認得那晚的自己。圖紙沒有因此少掉另一扇窗。」自我辨認是否足以保證見證完整？'},
 {id:'glass_reflection',chapter:7,node:'inquiry',threshold:5,title:'卷八 · 玻璃潮汐：候景查證',record:1,note:'「海面映出了他的平靜。平靜是真的發生了；船是否會回來，仍須另查。」情感與對外界的判斷，各自能證明什麼？'}
];
function lookup(state,id){
 const e=entries.find(x=>x.id===id);if(!e)return null;
 const d=Second.regions[e.chapter-5];
 const facts=e.id==='glass_reflection'?[d.history[2],...d.records.map(r=>r[2])]:d.records[e.record].slice(1);
 return {...e,facts,annotation:(state.blank_trust_stage||0)>=e.threshold?e.note:null};
}
function at(state,node){const e=entries.find(x=>x.chapter===state.chapter&&x.node===node);return e?lookup(state,e.id):null;}
const timers=new Set();
function stop(){for(const cancel of [...timers])cancel();}
function mount(host,text){
 const doc=host.ownerDocument,p=doc.createElement('p'),reserve=doc.createElement('span'),ink=doc.createElement('span'),accessible=doc.createElement('span'),button=doc.createElement('button');
 p.className='lore-trust-ink';reserve.className='lore-trust-reserve';reserve.textContent=text;reserve.setAttribute('aria-hidden','true');
 ink.className='lore-trust-visible';ink.setAttribute('aria-hidden','true');accessible.className='lore-trust-accessible';accessible.textContent=text;
 p.append(reserve,ink,accessible);button.type='button';button.className='secondary lore-trust-reveal';button.textContent='立即顯示墨跡';host.append(p,button);
 let timer=null,cursor=0;const cancel=()=>{if(timer!==null)clearInterval(timer);timers.delete(cancel);timer=null;};
 const finish=()=>{cancel();ink.textContent=text;p.dataset.complete='true';button.hidden=true;};
 button.onclick=finish;
 if(root.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
 else{timers.add(cancel);timer=setInterval(()=>{if(!p.isConnected){cancel();return}ink.textContent=text.slice(0,++cursor);if(cursor>=text.length)finish();},45);}
 return cancel;
}
root.NightLoreTrust={entries,lookup,at,mount,stop};if(typeof module!=='undefined')module.exports=root.NightLoreTrust;
})(typeof globalThis!=='undefined'?globalThis:this);
