import { readFile } from 'node:fs/promises';
export async function runLoreTrustUI(page,{report=()=>{}}={}){
 const check=(x,m)=>{if(!x)throw Error(m)},button=name=>page.getByRole('button',{name,exact:true});
 const read=async()=>{for(let i=0;i<16&&await button('繼續讀').isVisible();i++)await button('繼續讀').click();};
 const entries=[
 ['卷七 · 雪鈴城：暫疑廊更正件',1,'留著接縫'],
 ['卷六 · 赤赭鹽市：米珂兩面的代名牌',2,'牌背留著磨痕'],
 ['卷七 · 雪鈴城：雙窗聽證所的窗位圖',4,'圖紙沒有因此少掉另一扇窗'],
 ['卷八 · 玻璃潮汐：候景查證',5,'海面映出了他的平靜']
 ];
 const fixture=JSON.parse(await readFile(new URL('./first-part-completed.json',import.meta.url),'utf8'));
 for(const stage of [undefined,1,2,4,5,0]){
  const data={...fixture};if(stage===undefined)delete data.blank_trust_stage;else data.blank_trust_stage=stage;
  const pending=page.waitForEvent('filechooser');await button('匯入旅程存檔').click();
  await(await pending).setFiles({name:'lore-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
  await read();await button('載入這份存檔').click();await button('關閉對話').click();await button('返回主選單').click();
  if(stage===5)await page.reload();
  const savedBefore=await page.evaluate(()=>localStorage.getItem('unfinished-night-save-v1'));
  await button('認識餘彩域').click();await read();
  for(const [title,threshold,phrase] of entries){
   await button(title).click();await read();
   const ink=page.locator('.lore-trust-ink');
   check(await ink.count()===((stage||0)>=threshold?1:0),'Exact stage threshold '+title);
   if((stage||0)>=threshold){
    const reveal=page.locator('.lore-trust-reveal');
    if(await reveal.isVisible())await reveal.click();
    check((await ink.innerText()).includes(phrase),'Exact requested note');
    check(await ink.getAttribute('data-complete')==='true','Ink completes');
    check(await ink.evaluate(e=>e.scrollWidth<=e.clientWidth),'Ink fits narrow screens');
   }
   await button('回到餘彩域地標目錄').click();await read();
  }
  await button('關閉對話').click();
  check(await page.evaluate(()=>localStorage.getItem('unfinished-night-save-v1'))===savedBefore,'Lore preview must not award flags or evidence');
 }
 report('PASS: lore UI imports legacy/1/2/4/5/0, reloads local progress, removes stale ink after lower import, retains facts and responsive text.');
}
