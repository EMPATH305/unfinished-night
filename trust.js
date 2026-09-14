/* Public prompts only. Creator responses must never be shipped to clients. */
(function(root){'use strict';
const letters=[{"id":1,"question":"如果有一天，你發現自己最深的痛苦是你人格的一部分—甚至是你最強大的那部分—那麼你還願意把它治好嗎？"},{"id":2,"question":"我真正害怕失去的是傷口，還是傷口帶來的意義？"},{"id":3,"question":"如果有一天，你不再以痛苦來定義自己，你還剩下什麼？"},{"id":4,"question":"如果有一天，你突然不再感到痛苦，你會用什麼方式辨認自己依然是「你」？"},{"id":5,"question":"如果痛苦讓你覺得「真實」—那麼沒有痛苦，還能相信自己的情感嗎？"}];
let stage=0;
function at(state,node,revisited){if(!revisited)return [];const c=state.chapter,f=state.flags||{},chosen=state.choices||{};
 if(c===0&&node==='keeper'&&chosen.c1)return [1];
 if(c===5&&node==='witness'&&chosen.c6)return [2];
 if(c===3&&node==='door'&&chosen.c4&&(state.contentVersion===1||f.c4_after))return [3];
 if(c===6&&node==='witness'&&chosen.c7)return [4];
 if((c===4&&node==='ink'&&f.c5_promise)||(c===7&&node==='witness'&&chosen.c8))return [5];
 return [];
}

function open(){
 const doc=root.document,d=doc.getElementById('trust-dialog');let timer;
 const make=(tag,text)=>{const e=doc.createElement(tag);if(text)e.textContent=text;return e};
 const btn=(text,run)=>{const b=make('button',text);b.type='button';b.className='secondary';b.onclick=run;return b};
 const stop=()=>{if(timer)clearInterval(timer);timer=null};
 const close=()=>{stop();d.close()};
 function paint(){
 stop();d.replaceChildren();d.classList.remove('trust-corridor');
 const top=make('div');top.className='dialog-top';top.append(make('span','空白信託'),btn('暫時離開',close));
 const h=make('h2',stage<5?'第'+(stage+1)+'封':'五道提問暫告一段落');h.id='trust-heading';d.append(top,h);
 if(stage>=5){d.append(make('p','下一道提問尚未開放。信留在你手裡；這裡不知道內容。'));return}
 d.append(make('p','若願意，準備 A6 白紙（105 × 148 mm）、筆與實體信封。你也可以改日再來。'));
 const p=make('blockquote');p.className='trust-question';p.id='trust-question';p.setAttribute('aria-label',letters[stage].question);
 const text=letters[stage].question;let cursor=0;
 const reveal=()=>{stop();p.textContent=text};
 const actions=make('div');actions.className='trust-actions';
 actions.append(btn('立即顯示全文',reveal),btn('我已封信',()=>{stop();stage++;paint()}));
 d.append(p,actions,make('p','只接受你的封信聲明，不驗證、讀取或儲存信件。此階段只保留於本次頁面，重新整理會重置；不寫入旅程 JSON。'));
 if(root.matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();
 else timer=setInterval(()=>{cursor++;p.textContent=text.slice(0,cursor);if(cursor>=text.length)stop()},95);
 d.scrollTop=0;
 }
 paint();if(!d.open)d.showModal();d.querySelector('button').focus({preventScroll:true});d.addEventListener('close',stop,{once:true});
}
root.NightTrust={letters,at,open};if(typeof module!=='undefined')module.exports=root.NightTrust;
})(typeof globalThis!=='undefined'?globalThis:this);
