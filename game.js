(function(){'use strict';
const $=id=>document.getElementById(id),Story=window.NightStory,Atlas=window.NightAtlas,Game=window.NightGame,KEY='unfinished-night-save-v1';
let game=new Game(),active=false,target=null,arrival=null,lastTime=0,toastTimer,storageOK=true,audioCtx=null,audioGain=null,audioTimer=null,audioOn=false;
const keys=new Set();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const saved=localStorage.getItem(KEY);if(saved)game=new Game(JSON.parse(saved))}catch(e){storageOK=false;setTimeout(()=>toast('先前存檔無法讀取，或瀏覽器不允許儲存。可用匯入／下載存檔保存旅程。'),400)}
function toast(message){
 const dialog=[$('story-dialog'),$('journal-dialog')].find(d=>d.open);
 if(dialog){let notice=dialog.querySelector('.dialog-notice');if(!notice){notice=document.createElement('p');notice.className='dialog-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.setAttribute('aria-atomic','true');dialog.append(notice)}notice.textContent=message;notice.scrollIntoView({block:'nearest'});return}
 $('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').classList.remove('show');$('toast').textContent=''},4800)
}
function save(){if(!game.state.started&&!game.state.blank_trust_stage)return;try{localStorage.setItem(KEY,JSON.stringify(game.state));storageOK=true}catch(e){if(storageOK)toast('此瀏覽器無法自動存檔。請從手記下載存檔。');storageOK=false}}
function title(){active=false;cancelMove();$('title-screen').hidden=false;$('game-screen').hidden=true;$('continue-btn').hidden=!game.state.started;$('continue-btn').textContent=game.state.finished?'回到已完成的旅程':'繼續上次的旅程';$('save-info').textContent=game.state.started?(game.state.finished?(game.state.chapter===4?'第一部已完成 · 可從結局繼續遠行':'八章已完成 · 你的選擇已留在畫境'):'旅程停在第 '+game.chapter.roman+' 章 · '+game.chapter.title+(game.expanded?'':'（本章保留舊流程，下一章加入新內容）')):'八幅畫境 · 一位旅人 · 一隻記得你的烏鴉';$('start-btn').textContent=game.state.started?'開始一段新旅程':'走進畫裡 ↗'}
function enter(){active=true;$('title-screen').hidden=true;$('game-screen').hidden=false;render();$('world').focus({preventScroll:true})}
function newGame(){const stage=game.state.started?0:game.state.blank_trust_stage;game=new Game();game.state.blank_trust_stage=stage;enter();show(game.start());save()}
function cancelMove(){target=null;keys.clear();if(arrival){arrival(false);arrival=null}setMotion(false,0)}
function render(){
 const ch=game.chapter,s=game.state;const art=$('scene-art');if(art.dataset.image!==ch.image){art.dataset.image=ch.image;art.style.backgroundImage='url("assets/'+ch.image+'")';art.style.animation='none';void art.offsetWidth;art.style.animation=''}
 const mood=s.choices['c'+(s.chapter+1)];$('world').className=mood?'mood-'+mood:'';$('chapter-index').textContent='CHAPTER '+ch.roman+' / VIII';$('chapter-title').textContent=ch.title;$('chapter-subtitle').textContent=ch.subtitle;$('quest-text').textContent=game.objective();$('memory-count').textContent=s.memories.length;$('crow-line').textContent=s.finished?'今天換你數。我想休息一下。':s.choices['c'+(s.chapter+1)]?'你做的選擇，已經成為這裡的一部分。去看看他們吧。':ch.line;
 const nav=$('chapter-nav');nav.replaceChildren();Story.chapters.forEach((c,i)=>{const el=document.createElement('button');el.className='chapter-dot'+(i===s.chapter?' current':'')+(s.choices['c'+(i+1)]?' complete':'');el.textContent=c.roman;el.title=c.title;el.setAttribute('aria-label','第 '+c.roman+' 章 '+c.title+(i>s.chapter?'，尚未抵達':''));if(i===s.chapter)el.setAttribute('aria-current','step');el.disabled=i>s.chapter;el.onclick=()=>show({speaker:c.title,text:[c.subtitle,c.question,i===s.chapter?game.objective():'你的選擇：'+Story.choiceNames[s.choices['c'+(i+1)]]],choices:[]});nav.append(el)});
 renderRegions();
 const marks=$('hotspots');marks.replaceChildren();game.mapNodes.forEach(([id,label,x,y,icon])=>{const btn=document.createElement('button');btn.className='hotspot';const prefix='c'+(s.chapter+1)+'_';if(game.has(prefix+'visited_'+id))btn.classList.add('visited');if(s.chapter>=5&&id==='source'&&game.has(prefix+'borrowed')&&!game.has(prefix+'returned'))btn.classList.add('source-empty');if(s.chapter>=5&&id==='after'&&mood)label='回訪 · '+ch.title;if((id==='lamp'&&game.has('c1_yellow')&&!game.has('c1_letter'))||(id==='well'&&game.has('c1_blue')&&!game.has('c1_keeper'))||(s.chapter===4&&['yellow','blue','green'].includes(id)&&game.has('c5_'+id)))btn.classList.add('source-empty');btn.style.left=x+'%';btn.style.top=y+'%';btn.dataset.node=id;btn.setAttribute('aria-label','探索'+label);const mark=document.createElement('span');mark.className='hotspot-mark';const inner=document.createElement('span');inner.textContent=icon;inner.setAttribute('aria-hidden','true');mark.append(inner);const name=document.createElement('span');name.className='hotspot-label';name.textContent=label;btn.append(mark,name);btn.onclick=e=>{e.stopPropagation();moveTo(x,y+5,id)};marks.append(btn)});
 const colors=$('pigments');colors.replaceChildren();[['yellow','黃','#e8c360'],['blue','藍','#649ad8'],['green','綠','#6ca790']].forEach(([id,label,color])=>{const el=document.createElement('div');el.className='pigment'+(game.carries(id)?' held':'');el.style.setProperty('--pigment',color);el.title=label+'：'+(game.carries(id)?'攜帶中':'未攜帶');el.setAttribute('aria-label',el.title);el.setAttribute('role','img');const tip=document.createElement('span');tip.textContent=label;el.append(tip);colors.append(el)});updatePosition();
}
function updatePosition(){const p=game.state.position;$('traveler').style.left=p.x+'%';$('traveler').style.top=p.y+'%'}
function setMotion(moving,dx){const t=$('traveler');t.classList.toggle('walking',moving);if(dx>0.02){t.classList.add('dir-right');t.classList.remove('dir-left')}else if(dx<-0.02){t.classList.add('dir-left');t.classList.remove('dir-right')}}
function paragraphs(element,text){element.replaceChildren();text.forEach(t=>{const p=document.createElement('p');p.textContent=t;element.append(p)})}
function openTrust(overview=false){cancelMove();const previous=game.view;window.NightTrust.open(game.state,stage=>{game.sealTrust(stage);save()},{overview,onClose:()=>{
 if(!overview&&previous?.resonanceNode&&$('story-dialog').open){
  const base={...previous,text:previous.text.slice(0,previous.marginStart),marginIds:[]};
  const view=window.NightResonance.decorate(game.state,previous.resonanceNode,true,base);
  view.trustIds=window.NightTrust.at(game.state,view.resonanceNode,true);game.view=view;show(view);
 }
}})}
function show(view,handlers){if(!view){$('story-dialog').close();render();save();return}cancelMove();const d=$('story-dialog');d.querySelector('.dialog-notice')?.remove();$('toast').textContent='';$('toast').classList.remove('show');$('dialog-speaker').textContent=view.speaker;$('dialog-kicker').textContent=view.puzzle?.kind==='ending'?'THE UNFINISHED NIGHT · 終章':'畫境裡的聲音';paragraphs($('dialog-text'),view.text);$('dialog-choices').replaceChildren();$('puzzle-area').replaceChildren();
 for(const choice of view.choices||[]){const button=document.createElement('button');button.textContent=choice.label;if(choice.detail){const detail=document.createElement('small');detail.textContent=choice.detail;button.append(detail)}button.onclick=()=>{try{const next=handlers?handlers[choice.id]():game.choose(choice.id);render();save();if(next!==undefined)show(next);else d.close()}catch(e){toast(e.message)}};$('dialog-choices').append(button)}
 if(view.puzzle&&view.puzzle.kind!=='ending')renderPuzzle(view.puzzle);
 if(!view.choices?.length&&!view.puzzle){const button=document.createElement('button');button.textContent='收起話語，繼續探索';button.onclick=()=>d.close();$('dialog-choices').append(button)}
 if(view.puzzle?.kind==='ending'){const mark=document.createElement('div');mark.className='ending-mark';mark.textContent='FIN';$('puzzle-area').append(mark)}
 if(view.loreId){const entry=Atlas.entries.find(e=>e.id===view.loreId),more=document.createElement('button');more.className='lore-question';more.textContent='追問：'+entry.title;more.onclick=()=>show({speaker:entry.speaker,text:entry.text,choices:[{id:'return-story',label:'回到剛才的對話'}]},{'return-story':()=>view});$('dialog-choices').append(more)}
 for(const id of view.trustIds||[]){const b=document.createElement('button');b.className='trust-invitation';b.textContent='自願開啟 · 空白信託';b.onclick=()=>{cancelMove();openTrust()};$('dialog-choices').append(b)}
 paginateDialogue(view);if(!d.open)d.showModal();d.scrollTop=0;const focus=$('dialog-pagination').querySelector('.next-page')||$('dialog-choices').querySelector('button')||$('puzzle-area').querySelector('button')||$('close-dialog');focus.focus({preventScroll:true});save();
}
function renderPuzzle(p){
 const area=$('puzzle-area'),numeric=p.kind==='allocation',assigned=p.kind==='assignment',selected=p.kind==='selection';
 const count=p.count||p.length||3,total=p.total||6,unit=p.unit||(p.id==='ferry'?'塊木板':'份光');
 let values=numeric?p.items.map(()=>0):assigned?p.rows.map(()=>null):[];
 const feedback=document.createElement('p');feedback.className='puzzle-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.setAttribute('aria-atomic','true');
 const report=message=>{feedback.textContent=message;feedback.scrollIntoView({block:'center',behavior:'auto'})};
 const display=document.createElement('div');display.className='sequence-display';display.setAttribute('aria-live','polite');area.append(display);
 const controls=document.createElement('div');controls.className='puzzle-grid';area.append(controls);
 const update=()=>{
  display.textContent=numeric?'已分配 '+values.reduce((a,b)=>a+b,0)+' / '+total+' '+unit:assigned?'已安排 '+values.filter(v=>v!==null).length+' / '+p.rows.length+' 項':selected?'已選 '+values.length+' / '+count+' 項':values.length?values.join(' → '):'選擇順序 · · ·';
  if(numeric)controls.querySelectorAll('output').forEach((o,i)=>o.textContent=values[i]);
  if(selected)controls.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(values.includes(i))));
 };
 if(assigned){
  controls.classList.add('assignment-grid');p.rows.forEach((label,i)=>{
   const row=document.createElement('div');row.className='assignment-row';const name=document.createElement('label'),select=document.createElement('select');
   select.id='assign-'+p.id+'-'+i;name.htmlFor=select.id;name.textContent=label;const blank=document.createElement('option');blank.value='';blank.textContent='選擇安排';select.append(blank);
   p.items.forEach((item,j)=>{const o=document.createElement('option');o.value=String(j);o.textContent=item;select.append(o)});
   select.onchange=()=>{values[i]=select.value===''?null:Number(select.value);update()};row.append(name,select);controls.append(row);
  });
 }else if(p.kind==='sequence'||selected){
  p.items.forEach((item,i)=>{const btn=document.createElement('button');btn.textContent=item;
   btn.onclick=()=>{if(selected&&values.includes(i))values=values.filter(v=>v!==i);else if(values.length<count)values.push(selected?i:item);else report('已選滿 '+count+' 項；可以取消選取或清除後重排。');update()};controls.append(btn);
  });
 }else{
  controls.style.display='block';p.items.forEach((label,i)=>{
   const row=document.createElement('div');row.className='allocation-row';const name=document.createElement('span');name.textContent=label;const counter=document.createElement('div');counter.className='counter';
   const minus=document.createElement('button'),plus=document.createElement('button'),out=document.createElement('output');minus.textContent='−';plus.textContent='+';
   minus.setAttribute('aria-label',label+'減少一'+unit);plus.setAttribute('aria-label',label+'增加一'+unit);out.setAttribute('aria-label',label+'目前數量');
   minus.onclick=()=>{values[i]=Math.max(0,values[i]-1);update()};plus.onclick=()=>{if(values.reduce((a,b)=>a+b,0)<total){values[i]++;update()}else report('只有 '+total+' '+unit+'。請先從另一處減少。')};
   counter.append(minus,out,plus);row.append(name,counter);controls.append(row);
  });
 }
 const buttons=document.createElement('div');buttons.className='save-actions';const reset=document.createElement('button'),submit=document.createElement('button'),hint=document.createElement('button');
 reset.className='secondary';reset.textContent='清除重排';reset.onclick=()=>{values=numeric?p.items.map(()=>0):assigned?p.rows.map(()=>null):[];controls.querySelectorAll('select').forEach(select=>select.value='');feedback.textContent='';update()};
 submit.className='primary';submit.textContent=assigned?'確認安排':selected?'核對這些依據':numeric?'確認分配':'讓記憶接合';
 submit.onclick=()=>{try{const result=game.solve(values);if(result.ok){render();save();show(result.view)}else{report(result.message);if(p.kind==='sequence'){values=[];update()}}}catch(e){report(e.message)}};
 hint.className='text-btn';hint.textContent='請墨給一點提示';let hintStage=0;
 const clue=document.createElement('p');clue.className='puzzle-clue';clue.setAttribute('aria-live','polite');clue.setAttribute('aria-atomic','true');
 hint.onclick=()=>{
  const vague={stars:'墨歪著頭：「信和索恩各記得一半。試著把兩個「比誰先」接起來。」',roads:'墨用喙碰了碰羽毛：「旅人只見過後半段；泥殼的內外層可以補上前半段。」',lights:'墨說：「答案就攤在帳簿那一頁，你只是還沒仔細讀。」',memories:'墨壓低聲音：「鏡子最擅長的，就是把發生的順序換一遍。」',weave:'墨說：「三種顏色，各自擅長不同的事。想想它們平常做什麼。」'};
  const full={stars:Story.memories.letter.text,roads:Story.memories.footprints.text,lights:Story.memories.ledger.text,memories:Story.memories.draft.text,weave:'先以藍凝止崩解，再以綠接合裂口，最後以黃照見彼此。'};
  if(hintStage===0){clue.textContent=(p.hint||vague[p.id])+'（再按一次可看完整線索）';hintStage=1;hint.textContent='重讀完整線索'}else clue.textContent=p.clue||full[p.id];
  clue.scrollIntoView({block:'nearest'});
 };buttons.append(submit,reset,hint);area.append(feedback,buttons,clue);update();
}
function renderRegions(){
 const goal=game.goal;$('chapter-phase').textContent=goal?goal.stage:'既有旅程 · 本章沿用原流程';
 const nav=$('region-nav');nav.replaceChildren();game.regions.forEach((region,i)=>{
  const btn=document.createElement('button');btn.textContent=region.name;btn.className='region-button';btn.setAttribute('aria-pressed',String(i===game.state.region));
  if(goal&&game.regionFor(goal.node)===i){const marker=document.createElement('span');marker.textContent=' · 線索';marker.className='region-hint';btn.append(marker)}
  btn.onclick=()=>switchRegion(i);nav.append(btn);
 });$('world').dataset.region=String(game.state.region);
 $('mobile-goal').textContent=game.objective();
 $('scene-art').style.backgroundPosition=game.state.region===1?'68% center':'center';
}
function switchRegion(index){cancelMove();try{game.setRegion(index);render();save();$('world').focus({preventScroll:true})}catch(e){toast(e.message)}}
function paginateDialogue(view){
 const container=$('dialog-pagination'),area=$('puzzle-area'),choices=$('dialog-choices');container.replaceChildren();let page=0;const size=2,pages=Math.max(1,Math.ceil(view.text.length/size));
 const paint=()=>{
  paragraphs($('dialog-text'),view.text.slice(page*size,(page+1)*size));container.replaceChildren();area.hidden=choices.hidden=page<pages-1;
  [...$('dialog-text').children].forEach((el,i)=>{if(page*size+i>=view.marginStart){el.classList.add('resonance-ink');}});
  if(page===pages-1){for(const flag of view.marginIds||[])game.flag(flag);save();
   if(view.bellEvidence){const proof=document.createElement('section');proof.className='resonance-proof';
    for(const spec of window.NightResonance.checks){const detail=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');summary.textContent=spec.title;text.textContent=spec.text;detail.append(summary,text);proof.append(detail)}
    if(game.state.blank_trust_stage>=6){const prompt=document.createElement('p');prompt.textContent='再找一次：有沒有什麼紀錄，會使目前的解釋站不住？';proof.append(prompt)}
    $('dialog-text').append(proof);
   }
  }
  if(pages>1){
   const prev=document.createElement('button'),label=document.createElement('span'),next=document.createElement('button');prev.className='text-btn';prev.textContent='上一段';prev.disabled=page===0;
   label.textContent=(page+1)+' / '+pages;label.className='fine';label.setAttribute('aria-live','polite');
   prev.onclick=()=>{page--;paint();$('story-dialog').scrollTop=0};container.append(prev,label);
   if(page<pages-1){next.className='secondary next-page';next.textContent='繼續讀';next.onclick=()=>{page++;paint();$('story-dialog').scrollTop=0;($('dialog-pagination').querySelector('.next-page')||choices.querySelector('button')||area.querySelector('button,select')||$('close-dialog')).focus({preventScroll:true})};container.append(next)}
  }
 };paint();
}
function inspect(id){try{const revisited=game.has('c'+(game.state.chapter+1)+'_visited_'+id);const view=game.interact(id),entry=Atlas.at(game.state,id);view.trustIds=window.NightTrust.at(game.state,id,revisited);if(id.startsWith('record_')&&!game.has('c'+(game.state.chapter+1)+'_evidence_'+id.slice(-1)))view.trustIds=[];if(entry)view.loreId=entry.id;render();show(view);save()}catch(e){toast(e.message)}}
function moveTo(x,y,node){if(!active||$('story-dialog').open||$('journal-dialog').open||$('trust-dialog').open)return Promise.resolve(false);cancelMove();target={x:Math.max(5,Math.min(95,x)),y:Math.max(23,Math.min(91,y)),node};if(reduced){game.state.position={x:target.x,y:target.y};updatePosition();target=null;if(node)inspect(node);save();return Promise.resolve(true)}return new Promise(resolve=>{arrival=resolve})}
function tick(now){const dt=Math.min((now-lastTime)/1000||0,.06);lastTime=now;if(active&&!$('story-dialog').open&&!$('journal-dialog').open&&!$('trust-dialog').open){const p=game.state.position;let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx--;if(keys.has('ArrowRight')||keys.has('d'))dx++;if(keys.has('ArrowUp')||keys.has('w'))dy--;if(keys.has('ArrowDown')||keys.has('s'))dy++;
 if(dx||dy){if(target){target=null;if(arrival){arrival(false);arrival=null}}const n=Math.hypot(dx,dy);p.x=Math.max(5,Math.min(95,p.x+dx/n*dt*23));p.y=Math.max(23,Math.min(91,p.y+dy/n*dt*30));updatePosition();setMotion(true,dx)}
 else if(target){const tdx=target.x-p.x,tdy=target.y-p.y,dist=Math.hypot(tdx,tdy),step=dt*42;if(dist<=step){p.x=target.x;p.y=target.y;const node=target.node;target=null;updatePosition();setMotion(false,0);const done=arrival;arrival=null;if(node)inspect(node);save();if(done)done(true)}else{p.x+=tdx/dist*step;p.y+=tdy/dist*step;updatePosition();setMotion(true,tdx)}}
 else setMotion(false,0);
}requestAnimationFrame(tick)}
function appendAtlas(content){
 const heading=document.createElement('h3');heading.textContent='畫境志';heading.className='journal-chapter';content.append(heading);
 const found=Atlas.available(game.state),intro=document.createElement('p');intro.className='fine';intro.textContent='已發現 '+found.length+' / '+Atlas.entries.length+' 篇 · 地標裡聽來的故事與尚待查證的傳聞。';content.append(intro);
 for(const entry of found){const section=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');section.className='atlas-entry';summary.textContent=entry.title;paragraphs(body,entry.text);section.append(summary,body);content.append(section)}
}
function journal(){cancelMove();$('journal-dialog').querySelector('.dialog-notice')?.remove();const content=$('journal-content');content.replaceChildren();if(game.goal){const task=document.createElement('p');task.className='journal-task';task.textContent=game.goal.stage+' · '+game.objective();content.append(task)}Story.chapters.forEach((c,i)=>{if(i>game.state.chapter)return;const h=document.createElement('h3');h.className='journal-chapter';h.textContent=c.roman+' / '+c.title;content.append(h);const memories=game.state.memories.filter(k=>Story.memories[k].chapter===i);if(!memories.length){const p=document.createElement('p');p.className='fine';p.textContent='這一頁，還在等待故事。';content.append(p)}for(const k of memories){const m=Story.memories[k],card=document.createElement('article'),title=document.createElement('h3'),p=document.createElement('p');card.className='memory-card';title.textContent=m.title;p.textContent=game.memoryText(k);card.append(title,p);content.append(card)}for(const note of window.NightResonance.journal(game.state,i)){const card=document.createElement('article'),title=document.createElement('h3');card.className='memory-card resonance-note';title.textContent=note.title;card.append(title);const body=document.createElement('div');paragraphs(body,note.text);card.append(body);content.append(card)}const chosen=game.state.choices['c'+(i+1)];if(chosen){const p=document.createElement('p');p.className='fine';p.textContent='留下的選擇：'+Story.choiceNames[chosen];content.append(p)}});appendAtlas(content);$('journal-dialog').showModal()}
function download(){const blob=new Blob([JSON.stringify(game.state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='unfinished-night-journey.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('旅程存檔已準備下載。')}
function help(){show({speaker:'如何在畫境裡旅行',text:['點擊地標，旅人會走近並開啟對話。也可用 WASD 或方向鍵移動，靠近地標後按 E；手機可直接點地標，或用底部「地點清單」前往；「方向鍵」可展開移動與互動按鈕。','每章有兩個探索區域，可從畫面上方切換；標有「線索」的區域包含下一項目標。畫面右上的「當前線索」會隨進度改變。卡住時按「問問墨」；謎題裡也能重讀線索。','借色會暫時改變來源。完成修復後，顏色會歸還或安放到新位置。選擇沒有倒數，請慢慢讀。','旅程會自動儲存在這個瀏覽器。從「旅人手記」下載存檔，就能換到另一台裝置繼續。按 Esc 可關閉對話。'],choices:[]})}
function sound(){if(audioOn){audioOn=false;clearInterval(audioTimer);if(audioGain)audioGain.gain.setTargetAtTime(0,audioCtx.currentTime,.5);$('sound-btn').textContent='♫';$('sound-btn').setAttribute('aria-label','開啟環境音');return}try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error();if(!audioCtx){audioCtx=new AC();audioGain=audioCtx.createGain();audioGain.gain.value=0;audioGain.connect(audioCtx.destination)}audioCtx.resume();audioOn=true;audioGain.gain.setTargetAtTime(.11,audioCtx.currentTime,.5);const play=()=>{if(document.hidden)return;const t=audioCtx.currentTime,notes=[146.83,174.61,220,261.63,293.66];[0,1,2].forEach((n)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=notes[(game.state.chapter+n*2)%notes.length];gain.gain.setValueAtTime(0,t+n*.8);gain.gain.linearRampToValueAtTime(.12,t+n*.8+1.5);gain.gain.exponentialRampToValueAtTime(.001,t+n*.8+6);osc.connect(gain);gain.connect(audioGain);osc.start(t+n*.8);osc.stop(t+n*.8+7)})};play();audioTimer=setInterval(play,7000);$('sound-btn').textContent='♪';$('sound-btn').setAttribute('aria-label','關閉環境音')}catch(e){toast('這個瀏覽器暫時無法播放環境音。')}}
$('start-btn').onclick=()=>{if(game.state.started)show({speaker:'開始一段新旅程？',text:['目前的自動存檔會被新旅程取代。可以先下載存檔，保留這一次的選擇。'],choices:[{id:'export',label:'先下載目前存檔'},{id:'new',label:'開始新旅程，取代自動存檔'},{id:'cancel',label:'保留目前旅程'}]}, {export:()=>{download();return null},new:()=>{$('story-dialog').close();newGame();return game.view},cancel:()=>null});else newGame()};
$('continue-btn').onclick=()=>{enter();if(game.state.finished)show(game.ending())};$('home-btn').onclick=()=>{save();title()};$('help-btn').onclick=help;$('journal-btn').onclick=journal;$('hint-btn').onclick=()=>{const goal=game.goal,region=goal?game.regionFor(goal.node):-1;show({speaker:'墨的提示',text:[game.objective(),region>=0?'線索在「'+game.regions[region].name+'」。'+(region!==game.state.region?'可以從畫面上方切換區域。':'你已經在這個區域。'):'你收集過的文字都在旅人手記。'],choices:region>=0&&region!==game.state.region?[{id:'region',label:'前往'+game.regions[region].name}]:[]},{region:()=>{switchRegion(region);return null}})};$('sound-btn').onclick=sound;
$('close-dialog').onclick=()=>$('story-dialog').close();$('close-journal').onclick=()=>$('journal-dialog').close();for(const id of ['story-dialog','journal-dialog'])$(id).addEventListener('close',()=>{if(active)$('world').focus({preventScroll:true});render();save()});
$('about-btn').onclick=()=>show({speaker:'關於這個尚未乾透的世界',text:['《未乾之夜》是一款以梵谷繪畫為靈感的原創奇幻探索遊戲。第一部走進星夜、麥田、向日葵、藍色房間與空白海；第二部續往赤赭鹽市、雪鈴城與玻璃潮汐。','畫境規則、角色與事件均為原創虛構，不代表梵谷的生平或畫作的唯一解讀。場景與烏鴉為 AI 生成的原創繪畫素材，並非原作數位複製品。','創作發起：林萱渝。故事與遊戲製作：與 AI 協作。每章包含兩個探索區域、決定前的準備與決定後的回訪，故事仍會持續擴充。','適合慢慢探索與閱讀。沒有戰鬥，也沒有時間限制。遊玩本身不需要 AI 帳號或 API。'],choices:[]});
$('export-btn').onclick=download;for(const id of ['import-btn','import-title'])$(id).onclick=()=>$('import-file').click();$('import-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>100000)throw Error('存檔檔案太大。請選擇遊戲匯出的 JSON 存檔。');const candidate=new Game(JSON.parse(await file.text()));$('journal-dialog').close();show({speaker:'載入這段旅程？',text:['即將載入「'+candidate.chapter.title+'」的旅程，取代目前瀏覽器內的自動存檔。'],choices:[{id:'load',label:'載入這份存檔'},{id:'cancel',label:'保留目前旅程'}]},{load:()=>{game=candidate;save();enter();toast('旅程已載入。');return game.state.finished?game.ending():null},cancel:()=>null})}catch(err){toast(err.message||'無法讀取這份存檔。')}};
$('world').addEventListener('click',e=>{if(e.target.closest('button')||e.target.closest('.color-palette'))return;const r=$('world').getBoundingClientRect();moveTo((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100)});
window.addEventListener('keydown',e=>{if(!active||$('story-dialog').open||$('journal-dialog').open||$('trust-dialog').open||e.target.closest('button,input'))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)){e.preventDefault();keys.add(key)}if(key==='e'){e.preventDefault();nearby()}});window.addEventListener('keyup',e=>{keys.delete(e.key.length===1?e.key.toLowerCase():e.key);if(active)save()});window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();save()}});window.addEventListener('beforeunload',save);
for(const btn of document.querySelectorAll('[data-dir]')){const key={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[btn.dataset.dir];btn.onpointerdown=e=>{e.preventDefault();keys.add(key);btn.setPointerCapture(e.pointerId)};btn.onpointerup=btn.onpointercancel=()=>{keys.delete(key);save()}}
for(let i=0;i<14;i++){const dot=document.createElement('i');dot.className='mote';dot.style.left=(7+i*6.5)%100+'%';dot.style.top=(30+i*13)%93+'%';dot.style.animationDelay=(-i*.9)+'s';$('motes').append(dot)}
// Optional structured access uses the same visible journey state. No AI runtime dependency.
const context=document.modelContext;if(context?.registerTool){const controller=new AbortController();for(const tool of [{name:'read_journey',title:'讀取畫境旅程',description:'Read the current chapter, objective and collected memories without changing the journey.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw Error('Expected an empty object.');return {chapter:game.chapter.title,objective:game.objective(),memories:game.state.memories.map(k=>Story.memories[k].title),finished:game.state.finished}}}]){try{Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{})}catch(e){}}window.addEventListener('pagehide',()=>controller.abort(),{once:true})}
// Every visible circular star, the moon and both whorls share a slow sky current.
const skyCircles=[[110,70,70],[398,94,63],[691,35,35],[1086,39,39],[563,230,70],[753,306,74],[1340,119,119],[944,208,135],[1140,322,83]];
const skyLayer=$('title-screen').querySelector('.title-sky');
const skyMaxR=Math.max(...skyCircles.map(c=>c[2]));
skyCircles.forEach((circle,i)=>{const el=document.createElement('div');el.className='sky-vortex'+(circle[2]===skyMaxR?' sky-vortex-main':'');el.dataset.sky=String(i);el.style.animationDuration=Math.round(70+circle[2]*0.6)+'s';skyLayer.append(el)});
function alignSky(){
 const art=$('title-screen').querySelector('.title-art'),r=art.getBoundingClientRect();if(!r.width||!r.height)return;
 const pos=getComputedStyle(art).backgroundPosition.split(' ').map(parseFloat),scale=Math.max(r.width/1536,r.height/1024);
 const ox=(r.width-1536*scale)*(pos[0]/100),oy=(r.height-1024*scale)*(pos[1]/100);
 skyLayer.querySelectorAll('.sky-vortex').forEach((el,i)=>{const [x,y,radius]=skyCircles[i],left=(x-radius)*scale,top=(y-radius)*scale;Object.assign(el.style,{left:(ox+left)+'px',top:(oy+top)+'px',width:(radius*2*scale)+'px',height:(radius*2*scale)+'px',backgroundSize:(1536*scale)+'px '+(1024*scale)+'px',backgroundPosition:(-left)+'px '+(-top)+'px'});el.style.setProperty('--glow-delay',(-i*.65)+'s')});
 Object.assign(skyLayer.querySelector('.sky-current').style,{left:ox+'px',top:oy+'px',width:(1536*scale)+'px',height:(1024*scale)+'px'});
}
const skyObserver=new ResizeObserver(alignSky);skyObserver.observe($('title-screen'));window.addEventListener('resize',alignSky);
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');let skyPaused=motionQuery.matches;
function updateSky(){const stopped=skyPaused||motionQuery.matches;$('title-screen').classList.toggle('sky-paused',stopped);$('sky-motion-btn').textContent=stopped?'播放星空':'暫停星空';$('sky-motion-btn').setAttribute('aria-pressed',String(!stopped));$('sky-motion-btn').disabled=motionQuery.matches;if(motionQuery.matches)$('sky-motion-btn').textContent='星空已靜止'}
$('sky-motion-btn').onclick=()=>{skyPaused=!skyPaused;updateSky()};motionQuery.addEventListener('change',updateSky);updateSky();
$('trust-title').onclick=()=>openTrust(true);
$('atlas-title').onclick=()=>show({speaker:'餘彩域 · 未乾的世界',text:Atlas.overview,choices:[]});
$('mobile-journal').onclick=journal;$('mobile-hint').onclick=()=>$('hint-btn').click();
$('movement-toggle').onclick=()=>{const panel=$('touch-controls');panel.hidden=!panel.hidden;$('movement-toggle').setAttribute('aria-expanded',String(!panel.hidden))};
$('places-btn').onclick=()=>{const nodes=game.mapNodes,handlers={};nodes.forEach(([id,label,x,y])=>{handlers[id]=()=>{$('story-dialog').close();moveTo(x,y+5,id)}});show({speaker:'本區地點',text:['點選名稱，旅人就會前往並開啟對話。切換區域可從地圖上方選擇。'],choices:nodes.map(([id,label])=>({id,label:(game.goal?.node===id?'當前線索 · ':'')+label}))},handlers)};
function nearby(){const p=game.state.position,near=game.mapNodes.map(n=>({n,d:Math.hypot(n[2]-p.x,n[3]+5-p.y)})).sort((a,b)=>a.d-b.d)[0];if(near&&near.d<18)inspect(near.n[0]);else toast('再靠近一個地標，或從地點清單選擇它。')}
$('touch-interact').onclick=nearby;
for(const btn of document.querySelectorAll('[data-dir]'))btn.onlostpointercapture=()=>{keys.clear();setMotion(false,0);save()};
title();alignSky();requestAnimationFrame(tick);
})();




