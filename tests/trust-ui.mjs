export async function runTrustUI(page,{report=()=>{}}={}){
 const check=(v,m)=>{if(!v)throw Error(m)},d=page.locator('#trust-dialog');
 await page.getByRole('button',{name:'空白信託 · 紙上的提問',exact:true}).click();
 check(await d.getByRole('heading',{name:'空白信託 · 地標中的信封',exact:true}).isVisible(),'Title shows guide, not sequential question package');
 check(await d.locator('input,textarea,form,#trust-question').count()===0,'No questions or answer form on title');
 check(await d.getByRole('button',{name:/我已在現實中封存/}).count()===0,'Cannot claim seals away from landmarks');
 await d.getByRole('button',{name:'暫時離開',exact:true}).click();
 report('PASS: title explains contextual invitations without exposing letters or collecting answers.');
}
