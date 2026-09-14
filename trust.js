/* Public prompts only. Never include creator responses or infer physical letter contents. */
(function(root){'use strict';
const letters=[{"id": 1, "question": "如果有一天，你發現自己最深的痛苦是你人格的一部分—甚至是你最強大的那部分—那麼你還願意把它治好嗎？"}, {"id": 2, "question": "我真正害怕失去的是傷口，還是傷口帶來的意義？"}, {"id": 3, "question": "如果有一天，你不再以痛苦來定義自己，你還剩下什麼？"}, {"id": 4, "question": "如果有一天，你突然不再感到痛苦，你會用什麼方式辨認自己依然是「你」？"}, {"id": 5, "question": "如果痛苦讓你覺得「真實」—那麼沒有痛苦，還能相信自己的情感嗎？"}, {"id": 6, "question": "如果有一天，你發現你一直以來深信不疑的那些『真實情緒』—痛苦、狂喜、感動、平靜—其實都可能是你為了『讓自己相信自己存在』而創造出來的，那你會怎麼驗證『你沒有在欺騙自己』？"}];
const sixth=[
'墨：「安妲記得北門關著；達澄記得六只糧袋被運走。兩份紀錄都寫著鐘的尾音。那還不足以告訴我們，他們看的是不是同一扇門。」',
'墨：「芙岑卸下舊鐘梁時，空場也留下了震動。確信可能使鐘共鳴；誤認的記憶也可能。鐘沒有替我們走到窗前。」',
'墨：「你告訴這裡，前五封信已經封好。我沒有讀過。它們沒有把你變成一個我能解釋的人。」',
'墨：「感動被感受到，不等於你已知道它從哪裡來。窗上的光是真的；我們替窗外取的名字，仍可能需要更正。」',
'墨：「我也只有一些片段。若要檢查一個故事，也許得容許別人的腳印走進來——包括那些不替它作證的。」'
];
function available(state){return (state.blank_trust_stage||0)<5||((state.blank_trust_stage||0)===5&&state.chapter>=6)}
function at(state,node,revisited){const stage=state.blank_trust_stage||0,c=state.chapter;
 if(stage===5&&c===6&&['witness','inquiry'].includes(node))return [6];
 if(stage===0&&((c===0&&node==='lamp')||(c===6&&node==='record_c')))return [1];
 if(stage===1&&((c===1&&node==='post')||(c===5&&node==='record_a')))return [2];
 if(stage===2&&c===3&&node==='door'&&state.choices?.c4)return [3];
 if(stage===3&&((c===3&&node==='mirror')||(c===6&&['witness','record_a'].includes(node))))return [4];
 if(stage===4&&c===4&&['frame','ending'].includes(node))return [5];
 if(stage===4&&c===7&&node==='record_c')return [5];
 return [];
}
function open(state,seal,options={}){
 const doc=root.document,d=doc.getElementById('trust-dialog');let timer,page=0,sealed=false;
 const make=(tag,text)=>{const e=doc.createElement(tag);if(text)e.textContent=text;return e};
 const btn=(text,run)=>{const b=make('button',text);b.type='button';b.className='secondary';b.onclick=run;return b};
 const stop=()=>{if(timer)clearInterval(timer);timer=null};
 function paint(){
 stop();d.replaceChildren();const stage=state.blank_trust_stage||0;
 d.classList.toggle('trust-snow',stage===5&&available(state));
 const top=make('div');top.className='dialog-top';top.append(make('span','空白信託'),btn('暫時離開',()=>d.close()));
 const h=make('h2',available(state)?'第'+(stage+1)+'封':stage===5?'五道提問暫告一段落':'第六封之後，仍有留白');h.id='trust-heading';d.append(top,h);
 if(options.overview||sealed){h.textContent=sealed?'信留在你手裡':'空白信託 · 地標中的信封';d.append(make('p',sealed?'這裡只收下封信的聲明。'+(['','下一封在麥原的回信站。','下一封在候歸之室離開前的門邊。','離開房間以前，可以回到鏡前遇見第四封。','第五封在空白海的最初畫架。','第六封在雪鈴城的雙窗聽證所。','第七至十題仍未開放。'][stage]||''):'問題會在地標與過場中出現：第一封在迴星鎮的燈，第二封在麥原回信站，第三封在候歸之室離開前，第四封在離室前回看鏡子，第五封在空白海畫架。'),make('p','已聲明封存 '+stage+' 封。沒有答案輸入或上傳入口；參與與否不影響主線。'));return}
 if(!available(state)){d.append(make('p',stage===5?'下一封在第七章雪鈴城等待。你也可以繼續主線，不必寫信。':'第七至十題尚未開放。信仍留在你手裡。'));return}
 const pages=stage===5?[...sixth,letters[stage].question]:[letters[stage].question];
 const final=page===pages.length-1;
 d.append(make('p',final?'若願意，準備 A6 白紙（105 × 148 mm）、筆與實體信封。在現實書寫後封存；不必交給任何人。':'雙窗聽證所 · '+(page+1)+' / '+pages.length));
 if(final){const envelope=make('div');envelope.className='trust-envelope';envelope.setAttribute('aria-hidden','true');d.append(envelope)}
 const p=make(final?'blockquote':'p');p.className='trust-question';p.id=final?'trust-question':'trust-passage';p.setAttribute('aria-label',pages[page]);
 const reserve=make('span',pages[page]);reserve.className='trust-reserve';reserve.setAttribute('aria-hidden','true');
 const visual=make('span');visual.className='trust-ink-text';visual.setAttribute('aria-hidden','true');p.append(reserve,visual);
 const actions=make('div');actions.className='trust-actions';
 let done=false;const proceed=btn(final?'我已在現實中封存第 '+(stage+1)+' 封信':'讀下一段',()=>{
 if(!done)return;proceed.disabled=true;stop();
 if(final){seal(stage);page=0;sealed=true}else page++;
 paint();d.querySelector('h2').setAttribute('tabindex','-1');d.querySelector('h2').focus({preventScroll:true});
 });proceed.hidden=true;
 const reveal=()=>{stop();visual.textContent=pages[page];done=true;proceed.hidden=false};
 actions.append(btn('立即顯示全文',reveal),proceed);
 d.append(p,actions,make('p','網頁只記錄封信階段，不讀取、驗證或儲存信件內容，也不根據封信推測你的答案。可以隨時離開；主線不受影響。'));
 if(root.matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();
 else {let cursor=0;timer=setInterval(()=>{visual.textContent=pages[page].slice(0,++cursor);if(cursor>=pages[page].length)reveal()},60)}
 d.scrollTop=0;
 }
 paint();if(!d.open)d.showModal();d.querySelector('button').focus({preventScroll:true});d.addEventListener('close',()=>{stop();options.onClose?.()},{once:true});
}
root.NightTrust={letters,at,available,open};if(typeof module!=='undefined')module.exports=root.NightTrust;
})(typeof globalThis!=='undefined'?globalThis:this);

