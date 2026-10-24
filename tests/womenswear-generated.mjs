/** Real generated files in the existing Portfolio, alongside exact historical routes. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const selectedIds=process.env.GENERATION_REVIEW_IDS?.split(',');
const records=JSON.parse(readFileSync('src/data/womenswear-generated.json','utf8')).filter(r=>r.integrated&&(!selectedIds||selectedIds.includes(r.id)));
assert(records.length>0,'at least one actual generated record selected');
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4441';
const out=process.env.GENERATION_REVIEW_DIR||'.qa-director/womenswear-generation';
mkdirSync(out,{recursive:true});
const viewports=[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]].filter(([w])=>!process.env.GENERATION_REVIEW_WIDTHS||process.env.GENERATION_REVIEW_WIDTHS.split(',').includes(String(w)));
const browser=await chromium.launch();let checks=0;const results=[];
const check=(condition,message)=>{assert(condition,message);checks++;};
try{
 for(const [width,height] of viewports){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});
  await installFonts(context);const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const record of records){
   await page.goto(`${base}/portfolio/#womenswear/${record.editorialWorld}`);await fontsReady(page);
   const exhibition=page.locator(`[data-ww-exhibition="${record.editorialWorld}"]`);
   check(await exhibition.locator('.ww-rail a').count()===10,'exactly ten featured looks per world');
   const source=exhibition.locator(`.ww-rail [data-open-subject="${record.id}"]`);
   check(await source.count()===1,record.id+' appears once in the public edit');
   check(await exhibition.locator(`.ww-rail [data-open-subject="${record.sourceIdentity}"]`).count()===0,'old reference is removed by slot remapping');
   await source.scrollIntoViewIfNeeded();await source.click();
   const reader=page.locator(`[data-ww-reader][data-subject="${record.id}"]`);await reader.waitFor({state:'visible'});
   await page.waitForFunction(()=>!document.querySelector('.ww-match')&&!document.querySelector('[data-ww-moving]'));
   check(await reader.getAttribute('data-verified')==='no','AI presentation never becomes a verified project');
   check((await reader.locator('.ww-reader-head').innerText()).includes(record.generationType==='background-retouch'?'AI-RETOUCHED':'AI-GENERATED'),'truthful AI provenance is visible');
   const separate=record.photography?Object.entries(record.photography):null;
   const count=separate?.length??4;
   check(await reader.locator('[data-ww-view]').count()===(count===1?0:count),'only actual supplied views have controls');
   for(let view=0;view<count;view++){
    const control=reader.locator(`[data-ww-view="${view}"]`);if(count>1)await control[width<500?'tap':'click']();
    const panel=reader.locator(`[data-photo-view="${view}"]`);await panel.waitFor({state:'visible'});
    await panel.locator('img').evaluate(image=>image.decode());
    // Decode/visibility can resolve before the compositor paints the new view.
    // Capture the selected photograph, not the previous frame's pixels.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(count>1)check(await control.getAttribute('aria-pressed')==='true','selection matches visible view');
    const geometry=await panel.locator('[data-ww-photo]').evaluate(photo=>{
     const box=photo.getBoundingClientRect(),image=photo.querySelector('img'),frame=image.getBoundingClientRect();
     return {aspect:box.width/box.height,left:(box.left-frame.left)/frame.width,right:(box.right-frame.left)/frame.width,source:image.currentSrc,naturalWidth:image.naturalWidth};
    });
    const image=separate?separate[view][1]:record.image;
    check(Math.abs(geometry.aspect-(separate?image.width/image.height:view===3?2:2/3))<.002,'correct undistorted panel aspect');
    check(Math.abs(geometry.left-(separate||view===3?0:view/3))<.002&&Math.abs(geometry.right-(separate||view===3?1:(view+1)/3))<.002,'actual whole photograph or exact master panel');
    check(geometry.source.endsWith(image.src)&&geometry.naturalWidth===image.width,'reader prepares actual full source');
    check(!await panel.locator('[data-ww-photo]').evaluate(p=>p.dataset.surface==='plate'&&p.querySelector('img').currentSrc.includes('/recovery/')),'recovery has no legacy plate border');
    if(process.env.GENERATION_CAPTURE!=='0'&&(!separate||[1440,390].includes(width)||record.sourceIdentity==='swimwear-ref-06'))await page.screenshot({path:`${out}/${record.id}-${view}-${width}.jpg`,quality:92});
   }
   await reader.locator('[data-rd-inspect]').click();await page.keyboard.press('+');
   check(await reader.evaluate(r=>r.hasAttribute('data-inspect')),'Look Closer remains functional');
   await page.keyboard.press('Escape');await page.keyboard.press('Escape');await reader.waitFor({state:'hidden'});
   check(await source.evaluate(element=>element===document.activeElement),'exact archive occurrence/focus return');
   // A direct old URL must continue to expose the actual old source image.
   await page.goto(`${base}/portfolio/#womenswear/${record.category}/${record.sourceIdentity}`);
   const historical=page.locator(`[data-ww-reader][data-subject="${record.sourceIdentity}"]`);await historical.waitFor({state:'visible'});
   const historicalImage=historical.locator('[data-photo-view="0"] img');await historicalImage.evaluate(image=>image.decode());
   check(!await historicalImage.evaluate(image=>image.currentSrc.includes('/generated/')),'historical URL still shows its original photography');
   check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no document overflow');
   results.push({width,height,id:record.id,views:count,sourceReturn:true,historicalSourcePreserved:true});
  }
  check(errors.length===0,'no runtime errors: '+errors.join(';'));
  await context.close();console.log(width+' generated photography and historical-source checks passed');
 }
 writeFileSync(out+'/RESULTS.json',JSON.stringify({checks,records:records.length,viewports,results},null,2)+'\n');
 console.log(checks+' generated photography browser checks passed');
}finally{await browser.close();}
