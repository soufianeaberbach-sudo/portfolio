/* Focused checks for the isolated lab. No production composition assertions. */
import { chromium } from 'playwright';
import { installFonts, fontsReady } from './fixtures/fonts.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.RTW_IV_QA_URL??'http://127.0.0.1:4349';
const browser=await chromium.launch({args:['--no-sandbox']});let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
for(const [width,height]of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]) {
 const context=await browser.newContext({viewport:{width,height},isMobile:width<768,hasTouch:width<768});await installFonts(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/lab/rtw-iv/journey/`);await fontsReady(page);await page.waitForFunction(()=>window.rtwIV);
 const sourceRect=await page.locator('[data-enter]').boundingBox(),entryScroll=await page.evaluate(()=>scrollY);
 await page.locator('[data-enter]').focus();await page.keyboard.press('Enter');check(await page.locator('[data-reader]').isVisible(),'Keyboard entry');
 for(const k of ['A','B','C','D','E']){
  await page.locator(`[data-go="${k}"]`).click();await page.waitForFunction(k=>document.querySelector('[data-iv]').dataset.settled===k,k);
  check(await page.locator(`[data-go="${k}"]`).getAttribute('aria-current')==='step',`${width} ${k} current stage`);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${k} page overflow`);
  if(k==='A'||k==='E'){
   const photo=await page.locator('[data-photo]').boundingBox(),stage=await page.locator('.iv-stage').boundingBox();
   check(photo.y>=stage.y-1&&photo.y+photo.height<=stage.y+stage.height+1,`${width} ${k} full source height`);
   check(photo.x>=-1&&photo.x+photo.width<=width+1,`${width} ${k} full source width`);
  }
 }
 check(await page.locator('[data-photo] [data-rtw-photo]').getAttribute('data-side')==='back','Final real back view');
 await page.locator('[data-view="0"]').focus();await page.keyboard.press('Enter');check(await page.locator('[data-photo] [data-rtw-photo]').getAttribute('data-side')==='front','Keyboard front');
 await page.locator('[data-view="1"]').focus();await page.keyboard.press('Enter');check(await page.locator('[data-view="1"]').getAttribute('aria-pressed')==='true','Back control state');
 await page.locator('[data-look]').click();check(await page.locator('dialog').evaluate(d=>d.open),'Photo inspection');await page.keyboard.press('Escape');check(await page.locator('[data-look]').evaluate(b=>b===document.activeElement),'Inspector focus return');
 await page.locator('[data-go="C"]').click();await page.waitForFunction(()=>document.querySelector('[data-iv]').dataset.settled==='C');
 await page.locator('[data-inspect]').click();check((await page.locator('[data-inspector-media] svg').getAttribute('viewBox'))==='0 0 1500 1160','Full vector source, not mobile crop');
 const before=await page.locator('[data-inspector-media]').evaluate(e=>e.style.transform);await page.locator('[data-zoom="1"]').click();check(await page.locator('[data-inspector-media]').evaluate(e=>e.style.transform)!==before,'Uniform zoom');
 const canvas=page.locator('.iv-inspector-window');await canvas.focus();await page.keyboard.press('ArrowRight');await page.locator('[data-fit]').click();await page.keyboard.press('Escape');check(!await page.locator('dialog').evaluate(d=>d.open),'Document Escape');
 await page.locator('[data-go="D"]').click();await page.waitForFunction(()=>document.querySelector('[data-iv]').dataset.settled==='D');
 await page.locator('#iv-comparison').fill('100');check(await page.locator('[data-photo]').evaluate(e=>e.style.opacity==='1'&&e.style.clipPath==='none'),'Comparison leaves complete photo');
 await page.locator('[data-inspect]').click();check((await page.locator('#iv-inspector-title').textContent()).includes('photograph'),'Comparison source provenance');await page.keyboard.press('Escape');
 // Interrupt two editorial transitions without waiting for their completion.
 await page.locator('[data-go="B"]').click();await page.locator('[data-go="C"]').click();await page.locator('[data-go="E"]').click();await page.waitForFunction(()=>document.querySelector('[data-iv]').dataset.settled==='E');
 await page.locator('[data-return]').click();await page.waitForTimeout(620);check(await page.locator('[data-exhibition]').isVisible(),'Return exhibition');
 const returned=await page.locator('[data-enter]').boundingBox();check(Math.abs(returned.x-sourceRect.x)<1&&Math.abs(returned.y-sourceRect.y)<1,'Exact source position');check(await page.evaluate(()=>scrollY)===entryScroll,'Exact scroll return');check(await page.locator('[data-enter]').evaluate(b=>b===document.activeElement),'Return focus');
 check(await page.locator('[data-enter] [data-rtw-photo]').getAttribute('data-side')==='back','Returned view continuity');check(errors.length===0,errors.join('\n'));
 await context.close();
}
for(const [mode,expected]of [['none',['A']],['design',['A','B','E']],['construction',['A','C','E']]]){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true,isMobile:true});await installFonts(context);const page=await context.newPage();await page.goto(`${base}/lab/rtw-iv/journey/?evidence=${mode}`);await fontsReady(page);await page.waitForFunction(()=>window.rtwIV);check(JSON.stringify(await page.evaluate(()=>window.rtwIV.available))===JSON.stringify(expected),'Conditional stage sequence');
 await page.locator('[data-enter]').tap();for(const k of expected){await page.locator(`[data-go="${k}"]`).tap();check(await page.locator('.iv-stage').getAttribute('data-stage')===k,'Reduced motion immediate stage');}
 check(await page.locator('[data-go]:visible').count()===expected.length,'No empty navigation stages');await context.close();
}
{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await installFonts(context);const page=await context.newPage();
 await page.goto(`${base}/lab/rtw-iv/journey/?media=raster#C`);await fontsReady(page);await page.waitForFunction(()=>window.rtwIV?.ready&&window.rtwIV.stage==='C');
 check(await page.locator('.iv-media > img').count()===3,'Raster evidence surfaces');await page.locator('[data-inspect]').click();
 check(await page.locator('[data-inspector-media] img').evaluate(i=>i.naturalWidth===3000&&i.naturalHeight===2320),'Native-resolution raster source');
 check((await page.locator('[data-inspector-truth]').textContent()).includes('DEMO'),'Raster source provenance');await page.keyboard.press('Escape');
 await page.locator('[data-go="D"]').click();await page.locator('#iv-comparison').fill('100');check(await page.locator('[data-photo]').evaluate(e=>e.style.opacity==='1'),'Raster-to-photo comparison');
 await context.close();
}
{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await installFonts(context);const page=await context.newPage();
 for(const k of ['B','C','D']){await page.goto(`${base}/lab/rtw-iv/journey/#${k}`);await fontsReady(page);await page.waitForFunction(k=>window.rtwIV?.stage===k,k);await page.locator('[data-return]').focus();await page.keyboard.press('Enter');check(await page.locator('[data-exhibition]').isVisible(),`Direct return from ${k}`);check(await page.locator('[data-enter]').evaluate(b=>b===document.activeElement),`Direct return focus ${k}`);}
 await context.close();
}
const html=await fs.readFile('dist/portfolio/index.html','utf8');check(!html.includes('rtw-iv')&&!html.includes('UI contour'),'Public Portfolio excludes proof');check(!(await fs.access('dist/lab').then(()=>true,()=>false)),'No production lab paths');
await browser.close();console.log(`RTW IV: ${checks} checks passed across six viewports, partial evidence and reduced motion.`);
