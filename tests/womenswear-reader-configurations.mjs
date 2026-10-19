/* Controller stress with explicit neutral UI fixtures, not garment evidence.
   The response override exists only in this test; no route or asset is shipped. */
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
import{photoReady}from'./fixtures/final-photo.mjs';
const b=await chromium.launch(),base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389';let checks=0;const check=(ok,label)=>{assert(ok,label);checks++;};
try{for(const[width,height]of [[1440,900],[390,844]]){
 const c=await b.newContext({viewport:{width,height},reducedMotion:'reduce',isMobile:width<500,hasTouch:width<500});await installFonts(c);
 const fixtures=[['Front',1200,1800],['Back',1800,1200],['Side',900,2400],['Editorial',2400,1200],['Detail',1000,1000]];
 await c.route('**/test-only/*.svg',async r=>{const i=Number(r.request().url().match(/(\d+)\.svg/)[1]),[label,w,h]=fixtures[i];if(i===3)await new Promise(resolve=>setTimeout(resolve,500));await r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="10%" y="50%" font-size="50">UI TEST ONLY / ${label}</text></svg>`});});
 await c.route('**/portfolio/',async r=>{
  const response=await r.fetch();let html=await response.text();html=html.replace(/<article[^>]*data-ww-reader[^>]*data-subject="rtw-ref-01"[^>]*>[\s\S]*?<\/article>/,article=>{
   const panels=fixtures.map(([label,w,h],i)=>`<div data-photo-view="${i}" ${i?'hidden':''}><span class="ww-photo" data-ww-photo data-split="1" data-front="0,1" data-back="0,1" style="--aspect:${w/h};--window:1;--view:0"><img src="/test-only/${i}.svg" width="${w}" height="${h}" alt="TEST CONFIGURATION ONLY" loading="lazy"/></span></div>`).join('');
   article=article.replace(/(<div class="ww-reader-image"[^>]*>)[\s\S]*?(<\/div>\s*<div class="ww-reader-controls")/,'$1'+panels+'$2');
   article=article.replace(/(<div class="ww-reader-controls"[^>]*>)[\s\S]*?(<button class="label" data-rd-inspect)/,'$1'+fixtures.map(([label],i)=>`<button class="label" data-ww-view="${i}" aria-pressed="${i===0}">${label.toUpperCase()}</button>`).join('')+'$2');return article;
  });await r.fulfill({response,body:html});
 });
 const p=await c.newPage();await p.goto(base+'/portfolio/#womenswear/rtw/rtw-ref-01');await fontsReady(p);const reader=p.locator('[data-subject=rtw-ref-01]');check(await reader.locator('[data-ww-view]').count()===5,`${width}: all supplied controls`);
 await photoReady(reader,0);await reader.locator('[data-ww-view="3"]').click();
 check(await reader.locator('[data-photo-view="0"]').isVisible(),`${width}: cold replacement retains the complete current photograph`);
 check(await reader.getAttribute('aria-busy')==='true',`${width}: cold replacement announces loading`);
 await reader.locator('[data-ww-view="0"]').click();await p.waitForTimeout(600);
 check(await reader.locator('[data-photo-view="0"]').isVisible()&&await reader.getAttribute('aria-busy')===null,`${width}: cancelled decode cannot overwrite the later selection`);
 for(let i=0;i<fixtures.length;i++){
  await reader.locator(`[data-ww-view="${i}"]`).click();await photoReady(reader,i);const image=reader.locator('[data-photo-view]:not([hidden]) img');
  check((await image.getAttribute('src')).endsWith(`/test-only/${i}.svg`),`${width}/${i}: exact separate source`);
  const r=await reader.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').boundingBox();check(r.x>=-1&&r.x+r.width<=width+1&&r.y>=40&&r.y+r.height<=height,`${width}/${i}: portrait/landscape source fits`);
  const button=reader.locator(`[data-ww-view="${i}"]`);check(await button.getAttribute('aria-pressed')==='true',`${width}/${i}: selection`);
  check(await reader.evaluate(e=>{const copy=e.querySelector('.ww-reader-copy').getBoundingClientRect(),controls=e.querySelector('.ww-reader-controls').getBoundingClientRect();return copy.bottom<=controls.top||copy.right<=controls.left;}),`${width}/${i}: caption clears optional controls`);
  await reader.locator('[data-rd-inspect]').click();await p.keyboard.press('+');await reader.locator('[data-ww-fit]').click();await p.keyboard.press('Escape');
 }
 check(await reader.evaluate(e=>e.scrollWidth<=e.clientWidth+1),`${width}: no control or photo overflow`);await p.keyboard.press('Escape');check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${width}: route return`);await c.close();
}console.log(`${checks} optional-view UI checks passed`);}finally{await b.close();}
