/** Actual image delivery, responsive crop, stage selection and anchor access. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {installFonts, fontsReady} from './fixtures/fonts.mjs';

const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339';
const out=process.env.STUDIO_QA_DIR||'.qa-director/studio-final';
await fs.mkdir(out,{recursive:true});
const viewports=[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]];
const browser=await chromium.launch();let checks=0;const results=[];
function check(ok,label){assert(ok,label);checks++;}
try {
 for(const [width,height] of viewports){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});
  await installFonts(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const section of ['expertise','process']){
   await page.goto(`${base}/${section}/`);await fontsReady(page);
   const chapters=page.locator(section==='expertise'?'[data-stage-index]':'.pr-stage');
   check(await chapters.count()===(section==='expertise'?4:5),`${section} complete sections`);
   for(let i=0;i<await chapters.count();i++){
    const chapter=chapters.nth(i),n=String(i+1).padStart(2,'0');
    const frame=section==='expertise'?(width>=1100?page.locator('.ex-stack__rail .exv__frame'):chapter.locator('.exv__frame')):chapter.locator('.pr-media__frame');
    if(section==='expertise'&&width>=1100){
     await chapter.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-130,behavior:'instant'}));
     await page.waitForFunction(n=>document.querySelector('.ex-stack__rail .exv').dataset.active===n,n);
    } else await frame.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    const image=section==='expertise'&&width>=1100?frame.locator(`[data-stage="${n}"]`):frame.locator('img');
    await page.waitForFunction(e=>e.complete&&e.naturalWidth>0,await image.elementHandle());
    await image.evaluate(e=>e.decode());await page.waitForTimeout(800);
    const geometry=await image.evaluate(e=>{const r=e.getBoundingClientRect(),f=e.parentElement.getBoundingClientRect(),style=getComputedStyle(e.parentElement);return{src:e.currentSrc,w:e.naturalWidth,h:e.naturalHeight,ratio:f.width/f.height,imageRatio:r.width/r.height,fit:getComputedStyle(e).objectFit,alt:e.alt,border:style.borderTopWidth,left:f.left,right:f.right};});
    check(geometry.src.includes(`/${section}-reset/`),`${section} ${n}: new reset asset`);
    check(geometry.w>0&&geometry.h>0,`${section} ${n}: decoded`);
    check(geometry.alt.length>30,`${section} ${n}: meaningful alternative text`);
    check(geometry.border==='0px',`${section} ${n}: no frame rule`);
    check(Math.abs(geometry.imageRatio-geometry.ratio)<.01&&geometry.fit==='cover',`${section} ${n}: fills frame without distortion`);
    check(geometry.left>=-1&&geometry.right<=width+1,`${section} ${n}: within viewport`);
    check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${section} ${n}: no overflow`);
    if([1440,390].includes(width)||i===0)await page.screenshot({path:`${out}/${section}-${n}-${width}.jpg`,quality:92});
    results.push({section,n,width,height,...geometry});
   }
   // Native index links still reach the correct section with keyboard access.
   const first=page.locator(section==='expertise'?'.ex-index a':'.pr-ledger a').first();
   await first.focus();await page.keyboard.press('Enter');
   check(await page.evaluate(()=>location.hash)===(section==='expertise'?'#design-intent':'#brief'),`${section}: keyboard index anchor`);
   await page.emulateMedia({reducedMotion:'reduce'});
   check(await page.locator('main').isVisible(),`${section}: reduced-motion content accessible`);
   await page.emulateMedia({reducedMotion:'no-preference'});
  }
  check(errors.length===0,`no runtime errors ${width}: ${errors.join(';')}`);
  await context.close();console.log(`${width}x${height}: studio imagery passed`);
 }
 await fs.writeFile(`${out}/RESULTS.json`,JSON.stringify({checks,viewports,results},null,2)+'\n');
 console.log(`${checks} studio imagery checks passed`);
}finally{await browser.close();}
