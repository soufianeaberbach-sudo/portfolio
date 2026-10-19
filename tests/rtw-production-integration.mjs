import{photoReady}from'./fixtures/final-photo.mjs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339';
const browser=await chromium.launch();let checks=0;
const check=(ok,message)=>{assert(ok,message);checks++;};
const sizes=process.env.RTW_QUICK?[[1440,900]]:[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]];
const files=['woven/1','woven/2','woven/3','woven/4','woven/5','woven/6','woven/8','woven/9','woven/10','jersey/1','jersey/2','jersey/3','jersey/4','jersey/7','jersey/8','jersey/9','jersey/10'];
try{
for(const[w,h]of sizes){
 const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<500,isMobile:w<500});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/portfolio/#womenswear/rtw');await fontsReady(p);await p.waitForTimeout(500);
 check(await p.locator('[data-ww-exhibition=rtw] .ww-rail a').count()===10,`${w}: ten-look archive, historical 17 deep links retained`);
 check(await p.locator('[data-act-link]').count()===5,`${w}: all categories`);
 check(await p.locator('[data-act-toggle]').isVisible(),`${w}: category control visible`);
 check(await p.locator('[data-act]').evaluate(e=>e.scrollWidth<=e.clientWidth+1),`${w}: world fits`);
 check(await p.locator('[data-ww-actor=print]').getAttribute('tabindex')==='-1',`${w}: offstage not focusable`);
 const source=p.locator('[data-ww-actor=silk]');
 const before=await p.locator('[data-act]').evaluate(e=>e.scrollTop);
 await source.click();await p.waitForTimeout(800);
 const reader=p.locator('[data-ww-reader]:not([hidden])');
 check(await reader.count()===1,`${w}: single reader`);
 check(await reader.evaluate(e=>e.contains(document.activeElement)),`${w}: reader focus`);
 check(await p.locator('[data-territory=rtw]').evaluate(e=>e.inert),`${w}: floor inert`);
 await reader.locator('[data-ww-view="1"]').click();await photoReady(reader,1);
 check(await reader.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').getAttribute('data-side')==='back',`${w}: real back`);
 await reader.locator('[data-rd-inspect]').click();
 check(await reader.getAttribute('data-inspect')!==null,`${w}: inspect`);
 await p.keyboard.press('ArrowDown');await p.keyboard.press('+');
 check(await reader.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a>1),`${w}: native photo zoom`);
 await reader.locator('[data-ww-fit]').click();
 check(await reader.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a===1),`${w}: fit`);
 await p.keyboard.press('Escape');check(await reader.getAttribute('data-inspect')===null,`${w}: first Escape inspect only`);
 await p.keyboard.press('Escape');await p.waitForTimeout(650);
 check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${w}: return closed`);
 check(Math.abs(await p.locator('[data-act]').evaluate(e=>e.scrollTop)-before)<1,`${w}: exact scroll`);
 check(await source.evaluate(e=>e===document.activeElement),`${w}: exact occurrence focus`);
 check(await source.locator('[data-ww-photo]').getAttribute('data-side')==='front',`${w}: exhibition stays on primary after deliberate back viewing`);
 await p.goBack();await p.waitForTimeout(100);check(await reader.count()===1,`${w}: back reopens reader`);
 await p.goForward();await p.waitForTimeout(650);check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${w}: forward closes`);
 // A second occurrence must return to the archive link, including horizontal place.
 await p.locator('[data-ww-exhibition=rtw] .ww-archive').evaluate(e=>e.scrollIntoView({behavior:'instant'}));const link=p.locator('[data-ww-exhibition=rtw] .ww-rail a').last();await link.scrollIntoViewIfNeeded();
 const place=await p.locator('[data-act]').evaluate(e=>e.scrollTop),rail=await p.locator('[data-ww-exhibition=rtw] .ww-rail').evaluate(e=>e.scrollLeft);
 await link.click();await p.waitForTimeout(650);await p.keyboard.press('Escape');await p.waitForTimeout(650);
 check(await link.evaluate(e=>document.activeElement===e),`${w}: actual archive occurrence`);
 check(Math.abs(await p.locator('[data-act]').evaluate(e=>e.scrollTop)-place)<1,`${w}: archive vertical place`);
 check(Math.abs(await p.locator('[data-ww-exhibition=rtw] .ww-rail').evaluate(e=>e.scrollLeft)-rail)<1,`${w}: archive horizontal place`);
 // All references, original mapping, valid views and truthful absence of evidence.
 await p.emulateMedia({reducedMotion:'reduce'});
 for(let i=1;i<=17;i++){
  const id='rtw-ref-'+String(i).padStart(2,'0');await p.evaluate(id=>{location.hash='#womenswear/rtw/'+id},id);await p.waitForTimeout(50);
  const r=p.locator(`[data-subject=${id}]`);check(await r.isVisible(),`${w}/${id}: deep link`);
  check((await r.locator('img').first().getAttribute('src')).endsWith(files[i-1]+'-1400.webp'),`${w}/${id}: original source mapping`);
  check(await r.locator('[data-ww-view]').count()===([8,16].includes(i)?0:3),`${w}/${id}: genuine supported views`);
  check(await r.locator('.pf-rd__stage-item,[data-st],[data-go]').count()===0,`${w}/${id}: no process fabrication`);
  const box=await r.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').boundingBox();check(box.x>=-1&&box.x+box.width<=w+1,`${w}/${id}: complete photo width`);check(box.y>=40&&box.y+box.height<=h-30,`${w}/${id}: complete photo height`);
 }
 await p.keyboard.press('Escape');await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(100);
 await p.locator('[data-act-link=rtw]').evaluate(e=>e.click());await p.waitForTimeout(1000);
 await source.click();await p.waitForTimeout(50);await p.keyboard.press('Escape');await p.waitForTimeout(30);await source.evaluate(e=>e.click());await p.waitForTimeout(850);
 check(await p.locator('[data-ww-reader]:not([hidden])').count()===1,`${w}: interrupted latest entry wins`);
 check(await p.locator('.ww-match').count()===0,`${w}: no stale clone`);
 await p.setViewportSize({width:w,height:h-40});await p.waitForTimeout(100);check(await p.locator('.ww-match').count()===0,`${w}: resize settles`);
 await p.keyboard.press('Escape');await p.waitForTimeout(650);check(await source.evaluate(e=>{const stage=e.closest('[data-ww-stage]').getBoundingClientRect(),r=e.getBoundingClientRect(),compact=stage.width<768||(stage.width<1024&&stage.height>stage.width);return Math.abs(r.x+r.width/2-(stage.x+stage.width*(compact?.57:.66)))<2;}),`${w}: camera reframed after reader resize`);await p.evaluate(()=>location.hash='#womenswear/activewear');await p.waitForTimeout(600);
 check(await p.locator('[data-territory=activewear] .ww-stage').isVisible(),`${w}: protected Activewear`);
 check(errors.length===0,`${w}: no page errors ${errors}`);await c.close();
}
// Native links and the full archive survive without enhancement.
const staticContext=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});await installFonts(staticContext);const staticPage=await staticContext.newPage();await staticPage.goto(base+'/portfolio/#womenswear/rtw/rtw-ref-01');
check(await staticPage.locator('[data-ww-exhibition=rtw] .ww-rail a').count()===10,'no JavaScript: complete ten-look archive');
check(await staticPage.locator('[data-ww-exhibition=rtw]').getAttribute('data-enhanced')===null,'no JavaScript: resting composition');
check(await staticPage.locator('[data-subject=rtw-ref-01]').isVisible(),'no JavaScript: native garment deep link');await staticContext.close();
console.log(`${checks} RTW production checks passed`);
}finally{await browser.close();}
