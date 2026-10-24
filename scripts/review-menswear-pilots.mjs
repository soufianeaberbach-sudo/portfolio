import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

const review=resolve('docs/portfolio/review/menswear-original-2026-2027');
const evidence=resolve(review,'evidence');await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
try{
 for(const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600});
  const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve(review,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode();})));
  assert.equal(await page.locator('.pilot').count(),8);assert.equal(await page.locator('.pilot figure').count(),24);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');
  assert(await page.evaluate(()=>document.fonts.check('600 35px Archivo')&&document.fonts.check('400 15px Inter')),'Embedded fonts loaded');
  await page.screenshot({path:resolve(evidence,`${width}x${height}-overview.jpg`),type:'jpeg',quality:90});
  const original=await page.locator('[data-look] img').first().getAttribute('src');
  for(const view of ['back','editorial','front']){
   const button=page.locator(`[data-view="${view}"]`);await button.focus();await page.keyboard.press('Enter');
   await page.locator('#overview img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
   assert.equal(await button.getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[aria-pressed="true"]').count(),1);
   assert((await page.locator('[data-look] img').first().getAttribute('alt')).endsWith(', '+view[0].toUpperCase()+view.slice(1)));
  }
  assert.equal(await page.locator('[data-look] img').first().getAttribute('src'),original,'Front restored');
  await page.locator('[data-look]').first().click();await page.waitForTimeout(350);
  assert(page.url().endsWith('#mw26-streetwear-03'),'Real look anchor');
  const first=page.locator('.pilot').first();
  await first.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
  await page.waitForTimeout(100);
  const strip=first.locator('.three-views');
  if(width<600){
   const metrics=await strip.evaluate(e=>({visible:e.clientWidth,content:e.scrollWidth}));assert(metrics.content>metrics.visible,'Mobile three-view strip scrolls');
   await strip.evaluate(e=>e.scrollLeft=e.scrollWidth);await page.waitForTimeout(150);
   assert(await strip.evaluate(e=>e.scrollLeft>0),'Mobile rear/editorial access');
  }
  await page.screenshot({path:resolve(evidence,`${width}x${height}-look.jpg`),type:'jpeg',quality:90});
  await first.locator('summary').click();assert(await first.locator('details').evaluate(e=>e.open),'Notes open');
  await first.locator('.return').click();await page.waitForTimeout(250);assert(page.url().endsWith('#compare'));
  if(width===1440){
   await page.locator('#overview').screenshot({path:resolve(evidence,'eight-fronts-browser.jpg'),type:'jpeg',quality:92});
   await page.pdf({path:resolve(review,'PILOT-REVIEW.pdf'),printBackground:true,preferCSSPageSize:true});
  }
  assert.equal(errors.length,0,'No browser errors');
  results.push({width,height,selectedPhotographsDecoded:24,overviewLooks:8,pageOverflow:false,fontsLoaded:true,keyboardViewSwitching:true,lookAnchors:true,notesAccess:true,mobileThreeViewScroll:width<600?'PASS':'not applicable',browserErrors:errors});
  await context.close();
 }
 await writeFile(resolve(evidence,'BROWSER-RESULTS.json'),JSON.stringify({review:'Standalone owner review; public Portfolio code unchanged',executedAt:new Date().toISOString(),results},null,2)+'\n');
 console.log('Six viewport reviews passed: 24 embedded selected photos, view switching, anchors, notes, mobile strip, fonts and overflow.');
}finally{await browser.close();}
