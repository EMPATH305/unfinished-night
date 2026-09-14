export async function runTrustUI(page,{report=()=>{}}={}){
 const check=(v,m)=>{if(!v)throw Error(m)},d=page.locator('#trust-dialog');
 await page.getByRole('button',{name:'空白信託 · 紙上的提問',exact:true}).click();
 for(let i=1;i<=5;i++){
 check(await d.getByRole('heading',{name:'第'+i+'封',exact:true}).isVisible(),'Sequential stage');
 check(await d.locator('input,textarea,details,form').count()===0,'No answer collection');
 await d.getByRole('button',{name:'立即顯示全文',exact:true}).click();
 check((await d.locator('#trust-question').innerText()).endsWith('？'),'Public question');
 await d.getByRole('button',{name:'我已在現實中封存第 '+i+' 封信',exact:true}).click();
 }
 check(await d.getByRole('heading',{name:'五道提問暫告一段落',exact:true}).isVisible(),'Sixth requires Snowbell');
 await d.getByRole('button',{name:'暫時離開',exact:true}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('unfinished-night-save-v1')));
 check(saved.blank_trust_stage===5,'Only seal stage persisted');
 check(!saved.started&&Object.keys(saved.flags).length===0&&Object.keys(saved.choices).length===0,'No inferred story or psychological choices');
 await page.reload();
 await page.getByRole('button',{name:'空白信託 · 紙上的提問',exact:true}).click();
 check(await d.getByRole('heading',{name:'五道提問暫告一段落',exact:true}).isVisible(),'Stage survives reload');
 await d.getByRole('button',{name:'暫時離開',exact:true}).click();
 report('PASS: sequential physical sealing, persisted stage, no answer fields, chapter gate.');
}
