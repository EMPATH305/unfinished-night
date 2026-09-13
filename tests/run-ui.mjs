import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runUIRegression } from './ui-regression.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch();
 for(const mode of [
  {name:'desktop',viewport:{width:1366,height:900}},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true},
  {name:'compact',viewport:{width:320,height:740},isMobile:true,hasTouch:true},
  {name:'landscape',viewport:{width:844,height:390},isMobile:true,hasTouch:true},
  {name:'reduced-motion',viewport:{width:1366,height:900},reducedMotion:'reduce'}
 ]){
  const {name,...options}=mode,context=await browser.newContext(options),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{await page.goto('http://127.0.0.1:'+server.address().port);await runUIRegression(page,{report:line=>console.log(name+': '+line)});if(errors.length)throw Error(errors.join('\n'));}
  finally{await page.screenshot({path:'ui-'+name+'.png',fullPage:true});await context.close()}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
