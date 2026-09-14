export async function runTrustUI(page,{report=()=>{}}={}){
 const check=(v,m)=>{if(!v)throw Error(m)};
 const trust=page.locator('#trust-dialog'),button=n=>trust.getByRole('button',{name:n,exact:true});
 const before=await page.evaluate(()=>({save:localStorage.getItem('unfinished-night-save-v1'),keys:Object.keys(localStorage).sort(),session:Object.keys(sessionStorage).sort()}));
 await page.getByRole('button',{name:'空白信託 · 創作者的五封信',exact:true}).click();
 for(let i=1;i<=5;i++){
  await trust.getByRole('button',{name:new RegExp('^第'+i+'封 · ')}).click();
  check(await trust.locator('input,textarea,[contenteditable],form').count()===0,'No answer collection controls');
  await button('讓問題顯現').click();
  check(await page.locator('#trust-question').isVisible(),'Question revealed');
  await button('立即顯示全文').click();
  await trust.locator('summary').click();
  check(await trust.locator('.trust-letter-text').count()===(i===2?2:1),'All author versions present');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  check(await trust.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Letter fits dialog');
  await button('閱讀其他四封').click();
 }
 await button('今天不寫，回到原處').click();
 check(!await trust.isVisible(),'Can decline without completion');
 const after=await page.evaluate(()=>({save:localStorage.getItem('unfinished-night-save-v1'),keys:Object.keys(localStorage).sort(),session:Object.keys(sessionStorage).sort()}));
 check(JSON.stringify(before)===JSON.stringify(after),'Opening, reading and declining must not persist any data');
 await page.getByRole('button',{name:'空白信託 · 創作者的五封信',exact:true}).click();
 await trust.getByRole('button',{name:/^第1封 · /}).click();
 check(!await page.locator('#trust-question').isVisible(),'Reopening does not remember completion');
 await button('關閉空白信託').click();
 report('PASS: five original letters, both versions, reveal/skip, no fields, no stored answers or read-state, narrow layout');
}
