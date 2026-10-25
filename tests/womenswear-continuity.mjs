import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const b=await chromium.launch(),base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389';let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++;};
try{for(const[width,height]of [[1440,900],[390,844]]){
 const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/portfolio/#womenswear/rtw');await fontsReady(p);
 for(const cat of ['casualwear','activewear','evening','swimwear']){
  await p.locator(`[data-act-link=${cat}]`).evaluate(e=>e.click());await p.waitForTimeout(950);const root=p.locator(`[data-ww-exhibition=${cat}]`),source=root.locator('[data-ww-actor]').first(),primarySide=await source.locator('[data-ww-photo]').getAttribute('data-side');
  for(let n=0;n<2;n++){
   await source.click();await p.waitForTimeout(40);await p.keyboard.press('Escape');await p.waitForTimeout(30);await source.evaluate(e=>e.click());await p.waitForTimeout(750);
   const r=p.locator('[data-ww-reader]:not([hidden])');check(await r.count()===1,`${width}/${cat}: interrupted latest entry wins`);check(await p.locator('.ww-match').count()===0,`${width}/${cat}: decoded cut settles without stale clone`);
   if(await r.locator('[data-photo-panel=back]').count())await r.locator('[data-photo-panel=back] [data-photo-viewport]').focus();
   await p.setViewportSize({width,height:height-40});await p.waitForTimeout(100);await p.keyboard.press('Escape');await p.waitForTimeout(650);
   check(await source.evaluate(e=>e===document.activeElement),`${width}/${cat}: source focus after resize`);check(await source.locator('[data-ww-photo]').evaluate((e,side)=>e.dataset.side===side,primarySide),`${width}/${cat}: source stays primary`);
   await p.setViewportSize({width,height});await p.waitForTimeout(150);
  }
  await source.click();await p.waitForTimeout(40);const leaving=p.locator('[data-ww-reader]:not([hidden])');await leaving.locator('[data-subject-close]').click();
  check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${width}/${cat}: pointer Return during entry settles immediately`);
  check(await source.evaluate(e=>e===document.activeElement),`${width}/${cat}: interrupted pointer return restores source focus`);
  await source.focus();await p.keyboard.press('Enter');await p.emulateMedia({reducedMotion:'reduce'});await p.keyboard.press('Escape');await p.waitForTimeout(80);check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${width}/${cat}: preference change does not trap reader`);check(await source.evaluate(e=>e===document.activeElement),`${width}/${cat}: keyboard preference return`);await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(150);
 }
 check(errors.length===0,`${width}: no interrupted-navigation error`);await c.close();
}console.log(`${checks} Womenswear continuity checks passed`);}finally{await b.close();}
