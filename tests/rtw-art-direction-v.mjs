/* Real-asset stress checks for the development-only proof, not visual approval. */
import { chromium } from 'playwright';
import { installFonts,fontsReady } from './fixtures/fonts.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.RTW_V_QA_URL??'http://127.0.0.1:4349';
const browser=await chromium.launch({args:['--no-sandbox']});let checks=0;
const check=(ok,message)=>{assert.ok(ok,message);checks++;};
const inside=(a,b)=>a.x>=b.x-1&&a.y>=b.y-1&&a.x+a.width<=b.x+b.width+1&&a.y+a.height<=b.y+b.height+1;
for(const [width,height]of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<768,isMobile:width<768});await installFonts(context);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/lab/rtw-v/journey/`);await fontsReady(page);await page.waitForFunction(()=>window.rtwV?.ready);
 const source=await page.locator('[data-enter]').boundingBox(),scroll=await page.evaluate(()=>scrollY);
 check(await page.locator('.v-media img').evaluateAll(imgs=>imgs.length===4&&imgs.every(i=>i.complete&&i.naturalWidth>500)),'Four decoded authentic sources');
 await page.locator('[data-enter]').focus();await page.keyboard.press('Enter');check(await page.locator('[data-reader]').isVisible(),'Keyboard entry');
 for(const k of ['A','B','C','D','E']){
  await page.locator(`[data-go="${k}"]`).click();await page.waitForFunction(k=>document.querySelector('[data-v]').dataset.settled===k,k);
  check(await page.locator(`[data-go="${k}"]`).getAttribute('aria-current')==='step',`${width} ${k} stage state`);
  check(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),`${width} ${k} overflow`);
  if(k==='A'||k==='E')check(inside(await page.locator('[data-photo]').boundingBox(),await page.locator('.v-stage').boundingBox()),`${width} ${k} complete original figure window`);
  else {
   check(await page.locator('[data-copy]').evaluate(e=>getComputedStyle(e).opacity==='1'),`${width} ${k} readable mobile context`);
   check((await page.locator('[data-provenance]').textContent()).includes('Not this garment'),`${width} ${k} independent origins`);
   check(await page.locator('[data-provenance]').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=11),'Essential provenance readable');
  }
 }
 check(await page.locator('[data-photo] [data-rtw-photo]').getAttribute('data-side')==='back','Genuine final back');
 await page.locator('[data-view="0"]').focus();await page.keyboard.press('Enter');check(await page.locator('[data-photo] [data-rtw-photo]').getAttribute('data-side')==='front','Keyboard front');
 await page.locator('[data-view="1"]').focus();await page.keyboard.press('Enter');await page.locator('[data-look]').click();await page.waitForFunction(()=>document.querySelector('[data-inspector-media]').style.height==='1867px');await page.keyboard.press('Escape');check(await page.locator('[data-look]').evaluate(e=>e===document.activeElement),'Look Closer focus return');
 for(const [key,kind,nw,nh]of [['B','sketch',1653,2338],['C','pattern',5378,6024],['C','flat',701,610],['D','digital',1000,1000]]){
  await page.locator(`[data-go="${key}"]`).focus();await page.keyboard.press('Enter');if(kind==='flat'){await page.locator('[data-flat]').focus();await page.keyboard.press('Enter');}
  await page.locator('[data-inspect]').click();await page.waitForFunction(()=>document.querySelector('dialog').dataset.ready==='true'&&document.querySelector('[data-inspector-position]').textContent.startsWith('WHOLE'));
  check(await page.locator('dialog').getAttribute('data-source')===kind,'Correct inspection source');
  check(await page.locator('[data-inspector-media]').evaluate((e,[w,h])=>e.style.width===`${w}px`&&e.style.height===`${h}px`,[nw,nh]),'Native source resolution/proportions');
  check(inside(await page.locator('[data-inspector-media]').boundingBox(),await page.locator('.v-inspector-window').boundingBox()),'Fit overview includes all document edges');
  check((await page.locator('[data-inspector-truth]').textContent()).includes('Independent example'),'Inspector attribution/truth');
  const fit=await page.locator('[data-inspector-media]').evaluate(e=>e.style.transform);
  for(let n=0;n<4;n++)await page.locator('[data-zoom="1"]').click();check(await page.locator('[data-inspector-media]').evaluate(e=>e.style.transform)!==fit,'Actual source zoom');
  await page.locator('.v-inspector-window').focus();await page.keyboard.press('ArrowRight');check(!(await page.locator('[data-inspector-position]').textContent()).startsWith('WHOLE'),'Zoomed position indication');
  // Drag to every document corner; clamping must leave each native edge reachable.
  const box=await page.locator('.v-inspector-window').boundingBox();
  for(const [dx,dy]of [[10000,10000],[-10000,10000],[-10000,-10000],[10000,-10000]]){
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+dx,box.y+box.height/2+dy);await page.mouse.up();
   const r=await page.locator('[data-inspector-media]').boundingBox();check(dx>0?r.x>=box.x-1:r.x+r.width<=box.x+box.width+1,'Horizontal source edge reachable');check(dy>0?r.y>=box.y-1:r.y+r.height<=box.y+box.height+1,'Vertical source edge reachable');
  }
  await page.locator('[data-reset]').click();check(await page.locator('[data-inspector-media]').evaluate(e=>e.style.transform)===fit,'Reset restores initial overview');
  await page.keyboard.press('Escape');check(!await page.locator('dialog').evaluate(d=>d.open),'Inspection exit');
 }
 await page.locator('[data-go="D"]').focus();await page.keyboard.press('Enter');await page.locator('[data-flat]').focus();await page.keyboard.press('Enter');
 check(await page.locator('[data-photo]').evaluate(e=>e.style.opacity==='1')&&await page.locator('[data-volume]').evaluate(e=>e.style.opacity==='0'),'Unrelated representations switch completely, never registered');
 await page.locator('[data-flat]').click();await page.locator('[data-go="B"]').click();await page.locator('[data-go="C"]').click();await page.locator('[data-go="E"]').click();await page.waitForFunction(()=>document.querySelector('[data-v]').dataset.settled==='E');
 await page.locator('[data-view="0"]').focus();await page.keyboard.press('Enter');await page.setViewportSize({width,height:height+1});await page.setViewportSize({width,height});check(await page.locator('[data-photo] [data-rtw-photo]').getAttribute('data-side')==='front','Resize preserves chosen view');await page.locator('[data-view="1"]').focus();await page.keyboard.press('Enter');
 await page.locator('[data-return]').click();await page.waitForTimeout(700);check(await page.locator('[data-exhibition]').isVisible(),'Interrupted sequence return');
 const returned=await page.locator('[data-enter]').boundingBox();check(Math.abs(source.x-returned.x)<1&&Math.abs(source.y-returned.y)<1,'Exact measured source return');check(await page.evaluate(()=>scrollY)===scroll,'Exact scroll return');check(await page.locator('[data-enter]').evaluate(e=>document.activeElement===e),'Return focus');check(await page.locator('[data-enter] [data-rtw-photo]').getAttribute('data-side')==='back','Return selected view');check(errors.length===0,errors.join('\n'));await context.close();
}
for(const [mode,expected]of [['none',['A']],['design',['A','B','E']],['construction',['A','C','E']]]){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await installFonts(context);const page=await context.newPage();await page.goto(`${base}/lab/rtw-v/journey/?evidence=${mode}`);await fontsReady(page);await page.waitForFunction(()=>window.rtwV?.ready);
 check(JSON.stringify(await page.evaluate(()=>window.rtwV.available))===JSON.stringify(expected),'Conditional evidence availability');await page.locator('[data-enter]').tap();
 for(const key of expected){await page.locator(`[data-go="${key}"]`).tap();check(await page.locator('[data-v]').getAttribute('data-settled')===key,'Reduced motion immediate');}
 check(await page.locator('[data-go]:visible').count()===expected.length,'No empty stages');await page.locator('[data-return]').tap();check(await page.locator('[data-exhibition]').isVisible(),'Reduced return immediate');await context.close();
}
{
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();
 for(const k of ['B','C','D']){await p.goto(`${base}/lab/rtw-v/journey/#${k}`);await fontsReady(p);await p.waitForFunction(k=>window.rtwV?.ready&&window.rtwV.stage===k,k);await p.locator('[data-return]').focus();await p.keyboard.press('Enter');check(await p.locator('[data-exhibition]').isVisible(),`Deep link ${k} direct return`);}
 await c.close();
}
const html=await fs.readFile('dist/portfolio/index.html','utf8');check(!html.includes('/lab/rtw-v/')&&!html.includes('Connolly'),'Public Portfolio excludes proof');check(!(await fs.access('dist/lab').then(()=>true,()=>false)),'No production lab paths');
const distFiles=[];async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.isDirectory())await walk(dir+'/'+e.name);else distFiles.push(dir+'/'+e.name);}}await walk('dist');check(!distFiles.some(f=>/connolly|momu-st656|cgelves/.test(f)),'No external example assets in production build');
await browser.close();console.log(`RTW V: ${checks} checks passed across six viewports, real sources, partial evidence and reduced motion.`);
