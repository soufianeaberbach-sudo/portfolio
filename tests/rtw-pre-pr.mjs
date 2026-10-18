/* Final input checks complement the 17-source and six-viewport suites. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339',browser=await chromium.launch();let checks=0;
const check=(ok,label)=>{assert(ok,label);checks++;};
try{
 for(const width of [390,430,768,1024,1440]){
  const height=width===390?844:width===430?932:width===768?1024:width===1024?768:900;
  const c=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/portfolio/#womenswear/rtw');await fontsReady(p);
  const rail=p.locator('.rtw-rail'),links=rail.locator('a'),cue=p.locator('.rtw-archive-cue');
  await p.locator('.rtw-archive').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
  check(await cue.isVisible()===(width<1024),`${width}: cue belongs to compact composition only`);
  if(width<1024){const r=await cue.boundingBox();check(r.x>=0&&r.x+r.width<=width,`${width}: cue fits viewport`);check(parseFloat(await cue.evaluate(e=>getComputedStyle(e).fontSize))>=10,`${width}: cue readable`);}
  check(await links.count()===17,`${width}: all 17 original links`);
  await rail.focus();
  for(let i=0;i<17;i++){
   await p.keyboard.press('Tab');const link=links.nth(i);
   check(await link.evaluate(e=>e===document.activeElement),`${width}/${i+1}: native keyboard discovery`);
   check((await link.getAttribute('href'))===`#womenswear/rtw/rtw-ref-${String(i+1).padStart(2,'0')}`,`${width}/${i+1}: stable identity`);
   check(await link.evaluate(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return r.right>p.left&&r.left<p.right}),`${width}/${i+1}: focus scrolls garment into rail`);
  }
  // Keyboard opens the actual last occurrence, including exact horizontal return.
  const source=links.last(),left=await rail.evaluate(e=>e.scrollLeft),top=await p.locator('[data-act]').evaluate(e=>e.scrollTop);
  for(let i=0;i<3;i++){
   await p.keyboard.press('Enter');const r=p.locator('[data-rtw-reader]:not([hidden])');await r.waitFor();
   check(await r.evaluate(e=>e.contains(document.activeElement)),`${width}: keyboard reader focus ${i}`);
   await p.keyboard.press('Escape');await p.waitForTimeout(50);
   check(await source.evaluate(e=>e===document.activeElement),`${width}: repeated exact archive focus ${i}`);
   check(Math.abs(await rail.evaluate(e=>e.scrollLeft)-left)<1&&Math.abs(await p.locator('[data-act]').evaluate(e=>e.scrollTop)-top)<1,`${width}: repeated exact archive place ${i}`);
  }
  if(width<500){
   await rail.evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));const rect=await rail.boundingBox(),y=rect.y+rect.height*.5,cd=await c.newCDPSession(p);
   await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-70,y}]});
   for(let i=1;i<=8;i++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width-70-i*25,y}]});await p.waitForTimeout(20);}
   await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(400);
   check(await rail.evaluate(e=>e.scrollLeft)>40,`${width}: real touch explores archive`);await cd.detach();
  }
  // Repeated real pointer entry interrupted by the permanently available Return.
  await p.locator('[data-act-link=rtw]').evaluate(e=>e.click());await p.waitForTimeout(900);
  const actor=p.locator('[data-rtw-actor=anchor]');
  for(let i=0;i<3;i++){
   await actor.click();await p.waitForTimeout(40);await p.locator('[data-rtw-reader]:not([hidden]) [data-subject-close]').click();await p.waitForTimeout(650);
   check(await p.locator('[data-rtw-reader]:not([hidden])').count()===0,`${width}: rapid pointer return ${i}`);
   check(await actor.evaluate(e=>e===document.activeElement),`${width}: pointer source focus ${i}`);
   check(await p.locator('.rtw-match').count()===0,`${width}: no interrupted clone ${i}`);
  }
  await actor.focus();await p.keyboard.press('Enter');await p.emulateMedia({reducedMotion:'reduce'});await p.keyboard.press('Escape');await p.waitForTimeout(100);
  check(await actor.evaluate(e=>e===document.activeElement),`${width}: preference change retains source focus`);
  check(errors.length===0,`${width}: no runtime errors`);await c.close();
 }
 console.log(`${checks} RTW pre-PR input checks passed`);
}finally{await browser.close();}
