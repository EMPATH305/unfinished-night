// Uses only visible controls and the normal save-file import workflow.
export async function runSecondUI(page,{importSave,report=()=>{},capture=async()=>{}}={}){
 const check=(v,m)=>{if(!v)throw Error(m)};
 const button=n=>page.getByRole('button',{name:n,exact:true});
 const click=async n=>button(n).click();
 const dialog=page.locator('#story-dialog');
 const read=async()=>{await dialog.waitFor({state:'visible'});for(let n=0;n<16&&await button('繼續讀').isVisible();n++)await click('繼續讀');};
 const close=async()=>{await click('關閉對話');await dialog.waitFor({state:'hidden'});};
 const action=async name=>{await page.locator('#dialog-choices button').filter({hasText:name}).click();if(await dialog.isVisible())await read();};
 const visit=async id=>{await page.locator('[data-node="'+id+'"]').click();await read();};
 const region=async index=>{await page.locator('#region-nav button').nth(index).click();};
 await importSave();await read();await action('載入這份存檔');
 check((await page.locator('#dialog-speaker').innerText()).includes('結局'),'Completed v1 save opens first ending');
 await action('繼續遠行');await action('開始探索');
 const configs=[
  {title:'赤赭鹽市',image:'salt.jpg',evidence:[2,1,0],repair:[4,2,0],choice:'先完成共同供水輪值',kind:'allocation'},
  {title:'雪鈴城',image:'snow.jpg',evidence:[1,2,0],repair:[1,2,0],choice:'先重開暫疑廊的更正窗口',kind:'assignment'},
  {title:'玻璃潮汐',image:'glass.jpg',evidence:[2,1,0],repair:[2,2,1,0],choice:'保留短時觀潮與自願輪值',kind:'allocation'}
 ];
 for(let i=0;i<configs.length;i++){
  const c=configs[i];check(await page.locator('#chapter-title').innerText()===c.title,'Expected new chapter '+c.title);
  check(await page.locator('#scene-art').getAttribute('data-image')===c.image,'Distinct background asset');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal page overflow');
  if(await button('地點清單').isVisible())check(await page.evaluate(()=>[...document.querySelectorAll('#chapter-nav button')].every(b=>b.getBoundingClientRect().width>=44&&b.getBoundingClientRect().height>=44)),'Chapter navigation needs 44px touch targets');
  await capture('map-'+i);
  await visit('witness');
  if(i===1){
   await click('自願開啟 · 空白信託');const trust=page.locator('#trust-dialog');
   for(let passage=0;passage<5;passage++){
    check(await trust.getByRole('button',{name:'我已在現實中封存第 6 封信',exact:true}).count()===0,'No seal before final passage');
    await trust.getByRole('button',{name:'立即顯示全文',exact:true}).click();
    await trust.getByRole('button',{name:'讀下一段',exact:true}).click();
   }
   await trust.getByRole('button',{name:'立即顯示全文',exact:true}).click();
   check(await trust.locator('input,textarea,form').count()===0,'No physical answer input');
   check(await trust.evaluate(e=>e.scrollWidth<=e.clientWidth),'Trust fits mobile width');
   await capture('trust-six');
   await trust.getByRole('button',{name:'我已在現實中封存第 6 封信',exact:true}).click();
   check(await trust.getByRole('heading',{name:'信留在你手裡',exact:true}).isVisible(),'Stops before unwritten seventh');
   await trust.getByRole('button',{name:'暫時離開',exact:true}).click();
  }
  await close();
  await visit('record_a');await close();await visit('record_b');
  if(i===1){
   check((await page.locator('#dialog-text').innerText()).includes('聲音從哪裡來'),'Sixth-letter branch stays inline');
   const proof=page.locator('.resonance-proof');check(await proof.isVisible(),'Inline evidence checks');
   await proof.getByText('查看空場測試的限制',{exact:true}).click();
   check((await proof.innerText()).includes('每份舊判決'),'Evidence limits remain visible');
  }
  await close();
  await region(1);await visit('record_c');await close();await visit('after');await close();
  await region(0);await visit('inquiry');
  await click('確認安排');check(await page.locator('.puzzle-feedback').isVisible(),'Wrong-answer feedback stays inside dialog');
  await click('請墨給一點提示');check(await page.locator('.puzzle-clue').getAttribute('aria-live')==='polite','Clue is announced');await click('重讀完整線索');
  await capture('puzzle-'+i);
  for(let j=0;j<c.evidence.length;j++)await page.locator('.assignment-row select').nth(j).selectOption(String(c.evidence[j]));
  await click('確認安排');await read();await close();
  await visit('source');await action('同意短借');await close();
  check(await page.locator('[data-node="source"]').getAttribute('class').then(x=>x.includes('source-empty')),'Borrowed source visibly changes');
  await region(1);await visit('workshop');
  if(c.kind==='assignment'){for(let j=0;j<c.repair.length;j++)await page.locator('.assignment-row select').nth(j).selectOption(String(c.repair[j]));await click('確認安排');}
  else{for(let j=0;j<c.repair.length;j++)for(let n=0;n<c.repair[j];n++)await page.locator('.allocation-row').nth(j).getByRole('button',{name:/增加/}).click();await click('確認分配');}
  await read();await close();await region(0);await visit('source');await action('歸還借色');await close();
  check(!(await page.locator('[data-node="source"]').getAttribute('class')).includes('source-empty'),'Source restored after return');
  await region(1);await visit('council');await action(c.choice);await close();
  await visit('after');await page.locator('#dialog-choices button').first().click();await read();await close();
  await region(0);await visit('witness');await close();await region(1);await visit('gate');
  if(i<2){await page.locator('#dialog-choices button').first().click();await read();await action('開始探索');}
  else{await action('收好手記');check((await page.locator('#dialog-speaker').innerText()).includes('第二部結局'),'Final ending reached');await capture('ending');await action('留在岸上');}
  report('PASS second-part '+c.title+': evidence, hint, borrowing, handoff, decision and revisit');
 }
 await click('旅人手記 '+await page.locator('#memory-count').innerText());
 check((await page.locator('#journal-content').innerText()).includes('回訪 · 赤赭鹽市'),'Earlier regional aftermath remains readable');
 await click('關閉手記');
 return {passed:true};
}


