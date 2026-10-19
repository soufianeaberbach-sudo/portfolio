import{photoReady}from'./fixtures/final-photo.mjs';
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const b=await chromium.launch(),base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389';let checks=0;const check=(ok,label)=>{assert(ok,label);checks++;};
const categories={rtw:17,activewear:10,streetwear:2,evening:11,swimwear:9},whole=new Set(['rtw-ref-08','rtw-ref-16','activewear-ref-10','evening-ref-01']);
try{
 const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const[cat,count]of Object.entries(categories))for(let i=1;i<=count;i++){
  const id=`${cat}-ref-${String(i).padStart(2,'0')}`;await p.goto(`${base}/portfolio/#womenswear/${cat}/${id}`);await fontsReady(p);const r=p.locator(`[data-subject=${id}]`),photo=()=>r.locator('[data-photo-view]:not([hidden]) [data-ww-photo]');await photo().locator('img').evaluate(i=>i.decode());check(await photo().locator('img').evaluate(i=>i.naturalWidth>0),`${id}: cold source decoded`);
  if(cat!=='swimwear'&&!whole.has(id)){
   await r.locator('[data-ww-view="1"]').focus();await p.keyboard.press('Enter');await photoReady(r,1);check(await photo().getAttribute('data-side')==='back',`${id}: genuine back`);await r.locator('[data-ww-view="2"]').click();await photoReady(r,2);check(await photo().getAttribute('data-split')==='1',`${id}: full original`);await r.locator('[data-ww-view="0"]').click();await photoReady(r,0);check(await photo().getAttribute('data-side')==='front',`${id}: front`);
  }else check(await r.locator('[data-ww-view]').count()===0,`${id}: no fabricated controls`);
  await photo().locator('img').evaluate(i=>i.decode());const rendition=await photo().locator('img').evaluate(i=>i.currentSrc);await r.locator('[data-rd-inspect]').click();await photo().locator('img').evaluate(i=>i.decode());check(await photo().locator('img').evaluate(i=>i.currentSrc)===rendition,`${id}: inspection keeps the decoded rendition`);await p.keyboard.press('+');check(await photo().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a>1),`${id}: inspect original pixels`);await r.locator('[data-ww-fit]').click();check(await photo().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a===1),`${id}: fit`);await p.keyboard.press('Escape');await p.keyboard.press('Escape');check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${id}: closes after inspection`);
 }
 // Actual browser touch: swipe between genuine views, pinch, and pan in every world.
 const cd=await c.newCDPSession(p);
 for(const cat of Object.keys(categories)){
  await p.goto(`${base}/portfolio/#womenswear/${cat}/${cat}-ref-${cat==='evening'?'04':'01'}`);await fontsReady(p);const r=p.locator('[data-ww-reader]:not([hidden])'),photo=()=>r.locator('[data-photo-view]:not([hidden]) [data-ww-photo]');await photo().locator('img').evaluate(i=>i.decode());
  await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:260,y:330}]});await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:330}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  if(cat!=='swimwear')await photoReady(r,1);check(cat==='swimwear'?await r.locator('[data-ww-view]').count()===0:await photo().getAttribute('data-side')==='back',`${cat}: deliberate touch view, no invented swim back`);
  await r.locator('[data-rd-inspect]').click();const initial=await photo().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a);
  await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:0,x:170,y:350},{id:1,x:220,y:350}]});await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:0,x:165,y:350},{id:1,x:225,y:350}]});await p.waitForTimeout(50);await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:0,x:140,y:350},{id:1,x:250,y:350}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  check(await photo().evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a)>initial,`${cat}: real pinch`);await p.setViewportSize({width:430,height:932});await p.keyboard.press('Escape');await p.keyboard.press('Escape');check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${cat}: resize/return`);await p.setViewportSize({width:390,height:844});
 }
 await cd.detach();check(errors.length===0,'cold source and touch have no runtime errors');await c.close();
 const fail=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await installFonts(fail);await fail.route('**/portfolio/woven/1-*.webp',r=>r.abort());const f=await fail.newPage();await f.goto(base+'/portfolio/#womenswear/rtw/rtw-ref-01');await f.waitForTimeout(200);check((await f.locator('[data-subject=rtw-ref-01] [data-ww-source-status]').textContent()).includes('unavailable'),'failed source remains truthful');await f.keyboard.press('Escape');check(await f.locator('[data-ww-reader]:not([hidden])').count()===0,'failed source leaves return usable');await fail.close();
 console.log(`${checks} Womenswear photographic reliability checks passed`);
}finally{await b.close();}
