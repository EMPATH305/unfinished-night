// Browser regression suite. page may be a Playwright Page or the browser skill's
// tab.playwright (pass navigation separately). Uses visible UI and read-only DOM;
// never injects game state, bypasses puzzles, or replaces application code.
export async function runUIRegression(page, { allowReset = false, report = () => {} } = {}) {
 const check=(ok,message)=>{if(!ok)throw Error(message)};
 const button=name=>page.getByRole('button',{name,exact:true});
 const click=async name=>{await button(name).click()};
 const dialog=page.locator('#story-dialog').first();
 const readAll=async()=>{await dialog.waitFor({state:'visible'});for(let i=0;i<12&&await button('繼續讀').isVisible();i++)await click('繼續讀')};
 const close=async()=>{await click('關閉對話');await dialog.waitFor({state:'hidden'})};
 const visit=async name=>{await click('探索'+name);await readAll()};
 const region=async name=>{const plain=button(name);await (await plain.isVisible()?plain:button(name+' · 線索')).click()};
 const query=fn=>page.evaluate(fn);
 const sky=()=>query(()=>{const el=document.querySelector('.sky-vortex-main'),css=getComputedStyle(el);return {transform:css.transform,name:css.animationName,play:css.animationPlayState}});
 check(!await page.locator('#story-dialog').isVisible()&&!await page.locator('#journal-dialog').isVisible(),'Closed dialogs must be hidden, including on mobile');
 await page.locator('.sky-vortex[style*="background-size"]').first().waitFor({state:'attached'});
 const skyBounds=await query(()=>[...document.querySelectorAll('.sky-vortex')].map(el=>({width:parseFloat(el.style.width),height:parseFloat(el.style.height),background:el.style.backgroundSize})));
 check(skyBounds.length===9&&skyBounds.every(b=>b.width>0&&b.width===b.height&&b.background),'Sky patches must align to image-cover coordinates');
 const first=await sky();
 check(first.name==='sky-turn'||first.name==='none','Sky animation is missing');
 if(first.name==='none')check(await button('星空已靜止').isVisible()&&!await button('星空已靜止').isEnabled(),'Reduced motion must stop animation and disable playback');
 check(await query(()=>document.documentElement.scrollWidth<=innerWidth),'Title must fit the viewport without horizontal clipping');
 if(await button('暫停星空').isVisible()){
  await click('暫停星空');check((await sky()).play==='paused','Pause must stop the sky');
  await click('播放星空');check((await sky()).play==='running','Resume must restart the sky');
 }
 if(await button('開始一段新旅程').isVisible()){
  check(allowReset,'Use a disposable test profile or explicitly permit resetting its test save');
  await click('開始一段新旅程');await click('開始新旅程，取代自動存檔');
 }else await click('走進畫裡 ↗');
 check(!await button('開始探索').isVisible(),'Opening controls must wait for the last page');
 await readAll();await click('開始探索');
 const mobile=await button('地點清單').isVisible();
 if(mobile){
  await click('方向鍵');check(await button('向上移動').isVisible(),'Touch movement must expand');
  check(await query(()=>[...document.querySelectorAll('#touch-controls button,#mobile-tools button')].every(e=>e.getBoundingClientRect().height>=44)),'Mobile controls need usable tap targets');
  await click('方向鍵');check(!await button('向上移動').isVisible(),'Touch movement must collapse');
  await click('地點清單');check(await button('當前線索 · 製燈人的燈').isVisible(),'Places list must expose the current objective');await close();
 }

 await page.locator('#world').press('w');
 check(await query(()=>getComputedStyle(document.querySelector('#world')).outlineStyle)==='none','WASD must not draw a full-map outline');
 const before=await query(()=>document.querySelector('#traveler').style.top);
 await click('探索製燈人的燈');
 if(first.name!=='none')await page.locator('#traveler.walking').waitFor({state:'attached'});
 const motion=await query(()=>{const t=document.querySelector('#traveler');return {walking:t.classList.contains('walking'),name:getComputedStyle(t.querySelector('.traveler-core')).animationName}});
 if(first.name==='none')check(motion.name==='none','Reduced motion must suppress the walking animation');
 if(first.name!=='none')check(motion.walking&&motion.name.includes('walk-bob'),'Landmark movement should animate the traveler');
 await readAll();
 await click('追問：餘彩域與借色的夜市');await readAll();check(await page.getByRole('heading',{name:'亞恩的另一盞燈',exact:true}).isVisible(),'World story must open');await click('回到剛才的對話');
 await click('自願開啟 · 空白信託');
 await click('立即顯示全文');await click('我已在現實中封存第 1 封信');
 check(await page.getByRole('heading',{name:'信留在你手裡',exact:true}).isVisible(),'One contextual envelope per encounter');
 await click('暫時離開');await readAll();
 check((await page.locator('#dialog-text').innerText()).includes('留著接縫'),'Sealing updates the current landmark inline');
 check((await query(()=>document.querySelector('#traveler').style.top))!==before,'Traveler must reach the landmark');
 await click('借取燈中的黃色 燈會暫時暗下來。');await close();
 await visit('褪色的信');await click('用黃色照亮信件');await close();
 await region('河岸與鐘樓');await visit('靜藍井');await click('借取井中的藍色');await close();
 await visit('鐘樓守夜人');await click('凝止裂縫，走進鐘樓');await close();
 await visit('河岸工坊');await click('確認安排');
 const feedback=page.locator('.puzzle-feedback');
 check(await feedback.isVisible(),'Wrong answer feedback must be visible inside the dialog');
 check(await feedback.getAttribute('aria-live')==='polite','Error must be announced');
 check(await query(()=>{const el=document.querySelector('.puzzle-feedback'),r=el.getBoundingClientRect(),d=el.closest('dialog');return !!d?.open&&r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===el}),'Feedback must be inside the viewport and unobscured');
 await click('請墨給一點提示');const vague=await page.locator('.puzzle-clue').textContent();
 check(await page.locator('.puzzle-clue').getAttribute('aria-live')==='polite','Clue must be announced');
 await click('重讀完整線索');check((await page.locator('.puzzle-clue').textContent())!==vague,'Second hint must reveal different text');
 check(await feedback.textContent(),'Error must remain available while reading a hint');
 await click('清除重排');check(await feedback.textContent()==='','Reset must clear stale error');
 for(const [name,label] of [['撐住屋簷','木梁'],['固定橋面','繩索'],['標示集合點','遮光燈']])await page.getByRole('combobox',{name,exact:true}).selectOption({label});
 await click('確認安排');check(await page.getByRole('heading',{name:'準備不是一個保證',exact:true}).isVisible(),'Correct assignment must advance');await close();
 report('PASS: sky pause/resume, opening pagination, map focus, walking, inline error visibility, two-stage live clues, assignment recovery');
 await region('鎮街與星鐘');await visit('名字廣場');await close();await visit('名字廣場');await readAll();await click('問留下的人需要什麼準備');await close();
 await visit('失速的星辰');await click('讓記憶接合');check(await feedback.isVisible(),'Sequence errors must also be in the dialog');
 for(const name of ['燈','月','星'])await click(name);
 await click('讓記憶接合');await close();await visit('失速的星辰');
 await button('一起準備，迎接黎明 結束循環，小鎮開始學習面對未知。').click();await close();
 check(await query(()=>document.querySelector('#world').classList.contains('mood-dawn')),'Decision must apply its mood class');
 check(await query(()=>getComputedStyle(document.querySelector('#scene-art')).filter)!=='none','Decision must apply its visual treatment');
 await visit('名字廣場');await click('和居民一起留下第一份記錄');await close();
 check(await page.getByRole('button',{name:'旅人手記 5',exact:true}).isVisible(),'First chapter must retain its five memories');
 await (mobile?button('旅人手記'):button('旅人手記 5')).click();
 check(await page.getByRole('heading',{name:'畫境志',exact:true}).isVisible(),'Journal should include world discoveries');
 await page.locator('.atlas-entry summary').first().click();check(await page.locator('.atlas-entry[open]').isVisible(),'World notes must expand');
 await click('關閉手記');
 report('PASS: sequence retry, decision mood, aftermath, mobile tools and world stories');
 return {passed:true,chapter:1};
}


