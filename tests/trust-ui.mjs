export async function runTrustUI(page,{report=()=>{}}={}){
 const check=(v,m)=>{if(!v)throw Error(m)},d=page.locator('#trust-dialog');
 const before=await page.evaluate(()=>({save:localStorage.getItem('unfinished-night-save-v1'),keys:Object.keys(localStorage),session:Object.keys(sessionStorage)}));
 await page.getByRole('button',{name:'空白信託 · 紙上的提問',exact:true}).click();
 for(let i=1;i<=5;i++){
 check(await d.getByRole('heading',{name:'第'+i+'封',exact:true}).isVisible(),'Sequential stage');
 check(await d.locator('input,textarea,details,form').count()===0,'No answers or collection fields');
 await d.getByRole('button',{name:'立即顯示全文',exact:true}).click();
 check((await d.locator('#trust-question').innerText()).endsWith('？'),'Question only');
 await d.getByRole('button',{name:'我已封信',exact:true}).click();
 }
 check(await d.getByRole('heading',{name:'五道提問暫告一段落',exact:true}).isVisible(),'Stop before unwritten sixth question');
 await d.getByRole('button',{name:'暫時離開',exact:true}).click();
 const after=await page.evaluate(()=>({save:localStorage.getItem('unfinished-night-save-v1'),keys:Object.keys(localStorage),session:Object.keys(sessionStorage)}));
 check(JSON.stringify(before)===JSON.stringify(after),'Sealing stage must not enter persistent save');
 report('PASS: questions-only sequential sealing, no creator responses, no stored content.');
}
