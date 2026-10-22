/** Delayed/failed real sources must be understandable and must never trap world navigation. */
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import{mkdirSync}from'node:fs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4431',b=await chromium.launch();let checks=0;const unblock=[];const check=(ok,label)=>{assert(ok,label);checks++;};
mkdirSync('.qa-director/photo-final',{recursive:true});
try{for(const[width,height]of[[1440,900],[390,844]]){
 const c=await b.newContext({viewport:{width,height}});await installFonts(c);let release;const gate=new Promise(r=>{release=r;unblock.push(r);});
 await c.route('**/pexels-16711124*',async route=>{await gate;await route.continue();});const p=await c.newPage();
 await p.goto(base+'/portfolio/#menswear/m-rtw',{waitUntil:'domcontentloaded'});await fontsReady(p);const frame=p.locator('[data-mw-film][data-current] [data-mw-frame]'),status=frame.locator('[data-mw-media-status]');await status.waitFor({state:'visible'});
 check((await status.textContent()).includes('Loading photograph'),`${width}: delayed opening has honest loading feedback`);check(await frame.getAttribute('aria-busy')==='true',`${width}: loading state exposed accessibly`);
 await p.screenshot({path:`.qa-director/photo-final/loading-${width}.jpg`,quality:92});
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link=m-tailoring]').click();check(await p.locator('[data-mw-film][data-current]').getAttribute('data-mw-film')==='m-tailoring',`${width}: delayed image cannot trap direct navigation`);
 release();await p.locator('[data-mw-film][data-current] [data-mw-actor="6097464"] img').evaluate(im=>im.decode());await p.waitForTimeout(100);
 check(await p.locator('[data-mw-film][data-current]').getAttribute('data-mw-film')==='m-tailoring',`${width}: late source completion cannot reactivate a stale world`);
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link=m-rtw]').click();await p.locator('[data-mw-film][data-current] [data-mw-actor="16711124"] img').evaluate(im=>im.decode());await status.waitFor({state:'hidden'});
 check(!await frame.evaluate(e=>e.hasAttribute('aria-busy')),`${width}: decoded opening clears its busy state`);check(await p.locator('[data-mw-film][data-current] [data-mw-actor="16711124"] img').getAttribute('fetchpriority')==='high',`${width}: opening photograph prioritized`);await c.close();
 const failed=await b.newContext({viewport:{width,height}});await installFonts(failed);await failed.route('**/pexels-16711124*',route=>route.abort());const q=await failed.newPage();await q.goto(base+'/portfolio/#menswear/m-rtw');await fontsReady(q);const failure=q.locator('[data-mw-film][data-current] [data-mw-media-status]');await failure.waitFor({state:'visible'});
 check((await failure.textContent()).includes('Photograph unavailable'),`${width}: failed source retains the existing recovery message`);await q.locator('[data-mw-archive-open]').click();check(await q.locator('[data-mw-film][data-current] [data-mw-archive-door]').count()===10,`${width}: archive remains accessible after failure`);await failed.close();
}console.log(`${checks} Menswear delayed/failed-media checks passed`);}finally{for(const release of unblock)release();await b.close();}
