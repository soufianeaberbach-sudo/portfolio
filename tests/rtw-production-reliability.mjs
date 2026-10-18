import assert from 'node:assert/strict';import {chromium} from 'playwright';import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339';let checks=0;const check=(ok,name)=>{assert(ok,name);checks++;};const browser=await chromium.launch();
try{
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(let i=1;i<=17;i++){
  const id='rtw-ref-'+String(i).padStart(2,'0');await p.goto(base+'/portfolio/#womenswear/rtw/'+id);await fontsReady(p);
  const r=p.locator(`[data-subject=${id}]`),photo=r.locator('[data-rtw-photo]');await photo.locator('img').evaluate(i=>i.decode());
  check(await r.isVisible(),id+': reloadable deep link');check(await photo.locator('img').evaluate(i=>i.naturalWidth>0),id+': source really decoded');
  if(![8,16].includes(i)){
   await r.locator('[data-rtw-view="1"]').focus();await p.keyboard.press('Enter');check(await photo.getAttribute('data-side')==='back',id+': actual back window');
   await r.locator('[data-rtw-view="0"]').focus();await p.keyboard.press('Enter');check(await photo.getAttribute('data-side')==='front',id+': actual front window');
  }else check(await photo.getAttribute('data-split')==='1',id+': inseparable source remains whole');
 }
 // Real CDP touch, including pinch and two-finger-to-one-finger continuation.
 await p.goto(base+'/portfolio/#womenswear/rtw/rtw-ref-01');const reader=p.locator('[data-subject=rtw-ref-01]'),photo=reader.locator('[data-rtw-photo]');await reader.locator('img').evaluate(i=>i.decode());
 const session=await c.newCDPSession(p);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:260,y:350}]});await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:110,y:350}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check(await photo.getAttribute('data-side')==='back','real touch swipe changes view');
 await reader.locator('[data-rd-inspect]').click();await p.waitForTimeout(100);const zoom=await photo.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:0,x:170,y:350},{id:1,x:220,y:350}]});await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:0,x:165,y:350},{id:1,x:225,y:350}]});await p.waitForTimeout(50);await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:0,x:140,y:350},{id:1,x:250,y:350}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check(await photo.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a)>zoom,'real pinch magnifies native photograph');await session.detach();
 await p.setViewportSize({width:430,height:932});await p.waitForTimeout(100);check(await photo.evaluate(e=>Number.isFinite(new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)),'resize during inspection remains finite');
 await p.keyboard.press('Escape');await p.keyboard.press('Escape');check(await p.locator('[data-rtw-reader]:not([hidden])').count()===0,'resized return releases reader');
 check(errors.length===0,'no runtime error in cold links/touch/resize');await c.close();
 const fail=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await installFonts(fail);await fail.route('**/portfolio/woven/1-*.webp',r=>r.abort());const f=await fail.newPage();await f.goto(base+'/portfolio/#womenswear/rtw/rtw-ref-01');await f.waitForTimeout(200);
 check((await f.locator('[data-subject=rtw-ref-01] [data-rtw-source-status]').textContent()).includes('unavailable'),'missing image provides a persistent error message');
 check(await f.locator('[data-subject=rtw-ref-01] [data-subject-close]').isVisible(),'missing image leaves return available');await f.keyboard.press('Escape');check(await f.locator('[data-rtw-reader]:not([hidden])').count()===0,'missing image does not trap visitor');await fail.close();
 console.log(`${checks} RTW reliability checks passed`);
}finally{await browser.close();}
