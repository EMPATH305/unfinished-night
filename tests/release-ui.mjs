export async function runReleaseUI(page,{firstPartSave,report=()=>{}}={}){
 const check=(ok,message)=>{if(!ok)throw Error(message)},button=name=>page.getByRole('button',{name,exact:true});
 check(await page.locator('#language-btn').isVisible(),'Language switch must be visible on the title');
 check((await page.locator('.title-bottom').innerText()).includes('I — V'),'Public title must advertise Chapters I–V');
 await page.locator('#language-btn').click();
 check(await page.getByRole('heading',{name:'The Unfinished Night',exact:true}).isVisible(),'Title must switch to English');
 check((await page.locator('#save-info').innerText()).startsWith('Five painted realms'),'Release description must say five realms');
 await button('Blank Trust · Questions on paper').click();
 check(await page.getByRole('heading',{name:'Blank Trust · Envelopes in the landscape',exact:true}).isVisible(),'Blank Trust guide must switch to English');
 check(await page.locator('#trust-dialog input,#trust-dialog textarea').count()===0,'Blank Trust must never collect letter contents');
 await button('Leave for now').click();
 await button('Enter the painting ↗').click();
 while(await button('Keep reading').isVisible())await button('Keep reading').click();
 await button('Begin exploring').click();
 check(await page.getByRole('heading',{name:'Starwheel Town',exact:true}).isVisible(),'Chapter title must be English');
 check(!/[\u3400-\u9fff]/.test(await page.locator('#quest-text').innerText()),'Current objective must be English');
 check(await button('ExploreThe lampmaker’s lamp').isVisible(),'Landmarks must be playable in English');
 await page.locator('#game-language-btn').click();
 check(await page.getByRole('heading',{name:'迴星鎮',exact:true}).isVisible(),'Language switch must work during play');
 await page.locator('#game-language-btn').click();
 const chooser=page.waitForEvent('filechooser');await page.locator('#import-btn').evaluate(el=>el.click());await (await chooser).setFiles(firstPartSave);
 await button('Load this save').click();
 check(await page.getByRole('heading',{name:'Ending · The Canvas Remains Wet',exact:true}).isVisible(),'Completed Part One save must open its English ending');
 check(await page.getByRole('button',{name:/Ochre Salt Market/}).count()===0,'Part Two continuation must be absent from the public ending');
 check((await page.locator('#chapter-nav button').count())===5,'Public chapter navigation must contain exactly five chapters');
 check(!('language' in await page.evaluate(()=>JSON.parse(localStorage.getItem('unfinished-night-save-v1')))),'Language preference must stay outside the journey JSON');
 await page.reload();check(await page.locator('#language-btn').filter({hasText:'中文'}).isVisible(),'English preference must persist independently');
 report('PASS: five-chapter seal, bilingual title/game/trust, shared save and English completed ending.');
}
