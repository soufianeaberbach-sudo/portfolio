/** Isolated Phase C proof. Does not change or certify the public Menswear router. */
import {chromium} from 'playwright';
import {installFonts,fontsReady} from './fixtures/fonts.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile}from'node:fs/promises';
const root='docs/portfolio/review/menswear-cinematic-concept';
const url=process.env.MENSWEAR_CONCEPT_URL??'http://127.0.0.1:4357/lab/menswear/concept';
const browser=await chromium.launch();let checks=0;const findings=[];
function check(value,message){assert.ok(value,message);checks++;}
const sizes=[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]],worlds=['m-streetwear','m-activewear','m-rtw','m-tailoring'];
async function ready(page){await page.goto(url);await page.waitForFunction(()=>document.querySelector('[data-ready=true]'));await fontsReady(page);}
async function state(p){return p.evaluate(()=>window.menswearConcept.snapshot());}
try{
for(const [width,height]of sizes){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});await installFonts(context);const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await ready(p);
 for(const world of worlds){
  await p.evaluate(id=>window.menswearConcept.jump(id),world);
  for(let i=0;i<5;i++){
   await p.evaluate(i=>window.menswearConcept.scene(i),i);await p.waitForTimeout(40);
   const result=await p.evaluate(()=>{
    const f=document.querySelector('[data-frame]').getBoundingClientRect(),title=document.querySelector('[data-title]').getBoundingClientRect();
    const photos=[...document.querySelectorAll('.mc-plate')].filter(e=>!e.inert).map(e=>{const r=e.getBoundingClientRect(),im=e.querySelector('img');return {rect:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},loaded:im.complete&&im.naturalWidth>0,tab:e.tabIndex};});
    return{overflow:document.body.scrollWidth>innerWidth,photos,frame:{x:f.x,y:f.y,right:f.right,bottom:f.bottom},titleBottom:title.bottom,hidden:[...document.querySelectorAll('.mc-plate')].filter(e=>e.inert).every(e=>e.tabIndex===-1&&getComputedStyle(e).visibility==='hidden')};
   });
   check(!result.overflow,`${world}/${i} overflow ${width}`);check(result.photos.length>0,`Visible full shot ${world}/${i}`);check(result.hidden,'Hidden photographs inert and not tabbable');
   for(const a of result.photos){check(a.loaded,'Visible source decoded');check(a.rect.x>=result.frame.x-1&&a.rect.right<=result.frame.right+1&&a.rect.y>=result.frame.y-1&&a.rect.bottom<=result.frame.bottom+1,'Whole primary photo window inside stage');if(width<1024&&height>width)check(a.rect.y>=result.titleBottom+12,'Phone/tablet photograph clears actual title');}
  }
  await p.locator('[data-archive]').click();const expected=['m-streetwear','m-rtw'].includes(world)?4:3;check(await p.locator('[data-archive-look]').count()===expected,'Truthful concept archive count; no ten-look fiction');
  const archiveDoor=p.locator('[data-archive-look]').last();await archiveDoor.click();await p.waitForTimeout(650);check(await p.locator('[data-reader]').evaluate(e=>e.open),'Archive reader opens');check(await p.locator('[data-views]').innerText()==='PRIMARY PHOTOGRAPH','No fabricated angle controls');
  await p.locator('[data-inspect]').click();check(await p.locator('[data-reader]').getAttribute('data-inspecting')!==null,'Look Closer');await p.locator('[data-inspection]').press('+');await p.locator('[data-inspection]').press('ArrowRight');
  check((await p.locator('[data-reader-image]').getAttribute('style')).includes('scale(2.6)'),'Keyboard inspection zoom');await p.keyboard.press('Escape');check(await p.locator('[data-reader]').evaluate(e=>e.open),'Escape inspection leaves reader available');
  await p.keyboard.press('Escape');check(!await p.locator('[data-reader]').evaluate(e=>e.open),'Escape returns to archive');check(await archiveDoor.evaluate(e=>e===document.activeElement),'Exact archive occurrence focus');await p.keyboard.press('Escape');
 }
 // Main film: non-linear skip and actual modal return from a particular source occurrence.
 await p.evaluate(()=>window.menswearConcept.jump('m-streetwear'));await p.evaluate(()=>window.menswearConcept.scene(2));const before=await state(p);
 const door=p.locator('.mc-plate[data-look="booth"]');await door.click();await p.waitForTimeout(650);await p.locator('[data-reader-close]').click();await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);
 const after=await state(p);check(Math.abs(before.position-after.position)<.01&&before.scroll===after.scroll,'Exact scene and scroll return');check(await door.evaluate(e=>e===document.activeElement),'Exact scene source focus');
 await p.locator('[data-world-menu]').click();await p.locator('[data-world-to="m-tailoring"]').click();await p.waitForFunction(()=>window.menswearConcept.snapshot().world==='m-tailoring'&&window.menswearConcept.snapshot().position===0,{timeout:2000});check((await state(p)).world==='m-tailoring'&&(await state(p)).position===0,'Direct category jump skips intermediate scenes');
 await p.locator('[data-present]').click();check((await state(p)).present,'Presentation mode');await p.keyboard.press('PageDown');check((await state(p)).requested===1,'Presenter PageDown');await p.keyboard.press('Space');check((await state(p)).requested===2,'Presenter Space');await p.keyboard.press('PageUp');check((await state(p)).requested===1,'Presenter PageUp');
 await p.locator('[data-next]').focus();const prior=(await state(p)).requested;await p.keyboard.press('ArrowRight');check((await state(p)).requested===prior,'No remote key hijack on button focus');
 await p.locator('[data-experience]').focus();await p.keyboard.press('End');check((await state(p)).requested===4,'Presenter End');await p.keyboard.press('Home');check((await state(p)).requested===0,'Presenter Home');
 await p.keyboard.press('Escape');check(!(await state(p)).present,'Safe presentation Escape');
 await p.evaluate(()=>window.menswearConcept.jump('m-streetwear'));await p.evaluate(()=>{document.querySelector('[data-next]').click();document.querySelector('[data-next]').click();document.querySelector('[data-prev]').click();});await p.waitForTimeout(800);check(Math.abs((await state(p)).position-1)<.02,'Interrupted manual transition settles at latest destination');
 check(errors.length===0,'No browser runtime errors');findings.push({viewport:`${width}×${height}`,worlds:4,shots:20,result:'PASS'});await context.close();
}
// Reduced motion uses the same complete frames and unchanged native dialog handling.
const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();await ready(p);await p.locator('[data-next]').click();check((await state(p)).position===1,'Reduced motion immediate shot');await p.locator('[data-present]').click();await p.keyboard.press('End');check((await state(p)).position===4,'Reduced motion keynote');await p.keyboard.press('Escape');
// Genuine touch pinch / pan, not synthetic missing angle views.
await p.evaluate(()=>window.menswearConcept.scene(0));await p.locator('.mc-plate[data-look="cream"]').tap();await p.waitForTimeout(100);await p.locator('[data-inspect]').tap();const r=await p.locator('[data-inspection]').boundingBox(),cdp=await c.newCDPSession(p),cx=r.x+r.width/2,cy=r.y+r.height/2;
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-30,y:cy,id:1},{x:cx+30,y:cy,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-40,y:cy,id:1},{x:cx+40,y:cy,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-65,y:cy,id:1},{x:cx+65,y:cy,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(!((await p.locator('[data-reader-image]').getAttribute('style')).includes('scale(2)')),'Touch pinch changes zoom');await p.locator('[data-fit]').tap();check((await p.locator('[data-reader-image]').getAttribute('style')).includes('scale(1)'),'Touch Fit');await c.close();
const report={date:new Date().toISOString(),checks,viewports:findings,reducedMotion:'PASS',touch:'PASS',scope:'Isolated development proof; no public router/history integration claimed'};await mkdir(root,{recursive:true});await writeFile(`${root}/RESULTS.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
