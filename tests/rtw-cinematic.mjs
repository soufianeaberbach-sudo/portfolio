/* Functional continuity for the RTW prototype. Art direction is reviewed in
 * screenshots; these checks protect navigation, real views and exact return. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { installFonts, fontsReady } from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4350';
const browser=await chromium.launch();let checks=0;
const check=(value,label)=>{assert(value,label);checks++;};
try {
 for(const [width,height] of [[1440,900],[768,1024],[390,844],[1024,768],[430,932]]) {
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});await installFonts(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/portfolio/#womenswear/rtw`);await fontsReady(page);await page.waitForTimeout(400);
  check(await page.locator('.rtw-rail a').count()===17,`${width}: entire RTW archive`);
  check(await page.locator('[data-rtw-actor]:not([data-rtw-actor=anchor])').evaluateAll(els=>els.every(e=>e.tabIndex===-1)),`${width}: off-stage actors do not take keyboard focus`);
  const before=await page.locator('[data-act]').evaluate(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth}));check(before.scrollWidth<=before.width+1,`${width}: no world overflow`);
  const photo=page.locator('[data-rtw-actor="anchor"] [data-rtw-photo]');
  const front=await photo.evaluate(e=>e.querySelector('img').style.transform);
  await page.locator('[data-act]').evaluate(e=>{const camera=e.querySelector('[data-rtw-camera]');e.scrollTo({top:(camera.offsetHeight-innerHeight)*2.25/10.35,behavior:'instant'});});await page.waitForTimeout(450);
  check(await photo.evaluate(e=>e.dataset.side==='back' && e.querySelector('img').style.transform!==''),`${width}: actual source travels to back`);
  check((await photo.evaluate(e=>e.querySelector('img').style.transform))!==front,`${width}: the original source moves`);
  const place=await page.locator('[data-act]').evaluate(e=>e.scrollTop);
  await page.locator('[data-rtw-actor="anchor"]').click();await page.waitForTimeout(700);
  const reader=page.locator('[data-rtw-reader]:not([hidden])');
  check(await page.locator('[data-act] [data-territory=rtw]').evaluate(e=>e.inert),`${width}: exhibition is inert while reading`);
  check(await reader.evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(255, 255, 255)' && e.contains(document.activeElement)),`${width}: white reader owns focus`);
  check(await reader.locator('[data-rtw-photo]').getAttribute('data-side')==='back',`${width}: entry preserves the source view`);
  await page.keyboard.press('Tab');check(await reader.evaluate(e=>e.contains(document.activeElement)),`${width}: keyboard stays in reader`);
  await reader.locator('[data-rtw-view="0"]').click();await page.waitForTimeout(550);
  check(await reader.locator('[data-rtw-photo]').getAttribute('data-side')==='front',`${width}: front control`);
  await reader.locator('[data-rtw-view="1"]').click();await page.waitForTimeout(550);
  await reader.locator('[data-rd-inspect]').click();await page.waitForTimeout(320);
  check(await reader.evaluate(e=>e.hasAttribute('data-inspect') && e.querySelector('[data-rd-inspect]').getAttribute('aria-pressed')==='true'),`${width}: closer access`);
  if(width<500) {
   const image=reader.locator('[data-rtw-target]');const rect=await image.boundingBox();
   const session=await context.newCDPSession(page);
   const x=Math.min(width-20,Math.max(20,rect.x+rect.width/2));
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:height*.4}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+25,y:height*.45}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
   check(await reader.locator('[data-rtw-photo]').evaluate(e=>Number.isFinite(new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)),`${width}: touch inspection remains bounded`);
  }
  await page.keyboard.press('Escape');check(!await reader.evaluate(e=>e.hasAttribute('data-inspect')),`${width}: first Escape releases inspection`);
  await page.keyboard.press('Escape');await page.waitForTimeout(700);
  check(await page.locator('[data-rtw-reader]:not([hidden])').count()===0,`${width}: second Escape returns`);
  check(Math.abs(await page.locator('[data-act]').evaluate(e=>e.scrollTop)-place)<1,`${width}: exact exhibition scroll return`);
  check(await page.evaluate(()=>document.activeElement?.dataset.openSubject==='rtw-ref-01'),`${width}: exact source focus return`);
  // Rapid reversal must not let an obsolete exit hide the reopened reader.
  await page.locator('[data-rtw-actor=anchor]').click();await page.waitForTimeout(40);await page.keyboard.press('Escape');await page.waitForTimeout(40);await page.locator('[data-rtw-actor=anchor]').evaluate(e=>e.click());await page.waitForTimeout(650);
  check(await page.locator('[data-rtw-reader]:not([hidden])').count()===1 && await page.locator('.rtw-match').count()===0,`${width}: interrupted match cut resolves to the latest reader`);
  await page.keyboard.press('Escape');await page.waitForTimeout(620);
  // Utility swipe and any reference remain reachable without the camera choreography.
  await page.locator('.rtw-archive').evaluate(e=>e.scrollIntoView({behavior:'instant'}));
  await page.locator('.rtw-rail').evaluate(e=>e.scrollTo({left:e.scrollWidth,behavior:'instant'}));
  check(await page.locator('.rtw-rail').evaluate(e=>e.scrollLeft>0),`${width}: native horizontal archive`);
  await page.locator('.rtw-rail a').last().click();await page.waitForTimeout(600);check(page.url().endsWith('/rtw-ref-17'),`${width}: end of archive opens correct reference`);
  check(errors.length===0,`${width}: no runtime errors: ${errors.join('; ')}`);
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true});await installFonts(context);const page=await context.newPage();
 await page.goto(`${base}/portfolio/#womenswear/rtw`);await fontsReady(page);await page.waitForTimeout(300);
 check(await page.locator('[data-rtw-prototype]').getAttribute('data-static')!==null,'reduced motion: resting exhibition');
 check(await page.locator('[data-rtw-actor]').evaluateAll(els=>els.every(e=>getComputedStyle(e).opacity==='1')),'reduced motion: complete selected cast');
 for(let i=1;i<=17;i++) {
  const id=`rtw-ref-${String(i).padStart(2,'0')}`;await page.goto(`${base}/portfolio/#womenswear/rtw/${id}`);await page.waitForTimeout(100);
  const reader=page.locator('[data-rtw-reader]:not([hidden])');check(await reader.getAttribute('data-subject')===id,`${id}: reloadable deep link`);
  check(await reader.locator('.pf-rd__stage-item').count()===0,`${id}: no invented evidence`);
  if([8,16].includes(i)) check(await reader.locator('[data-rtw-view]').count()===0,`${id}: touching pair stays whole`);
 }
 await page.keyboard.press('Escape');await page.waitForTimeout(100);check(await page.locator('[data-rtw-reader]:not([hidden])').count()===0,'reduced motion: return works without animation');
 await context.close();console.log(`${checks} RTW continuity checks passed`);
} finally {await browser.close();}
