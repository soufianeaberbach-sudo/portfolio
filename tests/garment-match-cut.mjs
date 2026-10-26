/** Inspect the real opaque reader transition, including midpoint and interruption. */
import assert from 'node:assert/strict';import {chromium} from 'playwright';import {installFonts,fontsReady} from './fixtures/fonts.mjs';import {featuredWomenswearIdentity} from './fixtures/womenswear-presentation.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339',b=await chromium.launch({slowMo:Number(process.env.MATCH_CUT_QA_SLOWMO_MS||0)});let checks=0;const check=(ok,label)=>{assert(ok,label);checks++;};
// Arm capture before the click. Waiting for an animation in one browser call and
// pausing it in another races its natural 220/320ms finish on a busy CI runner.
// The mutation microtask sees the actual clip animation in the same event turn;
// production durations, keyframes and completion/interrupt behavior are untouched.
async function captureMidpoint(page,action,time){
 await page.evaluate(ms=>{
  const state=window.__garmentMidpoint={result:null};
  const observer=new MutationObserver(()=>{
   const e=document.querySelector('[data-ww-reader]:not([hidden])');
   const a=e?.getAnimations().find(animation=>animation.effect?.getKeyframes().some(frame=>'clipPath'in frame));
   if(!a)return;
   a.pause();a.currentTime=ms;
   const css=getComputedStyle(e);state.result={clip:css.clipPath,opacity:Number(css.opacity),images:e.querySelectorAll('[data-photo-pair] img').length};observer.disconnect();
  });
  observer.observe(document.querySelector('[data-world=womenswear]'),{attributes:true,subtree:true,attributeFilter:['hidden','data-ww-moving','style','inert']});
 },time);
 await action();await page.waitForFunction(()=>window.__garmentMidpoint?.result);
 return page.evaluate(()=>window.__garmentMidpoint.result);
}
try{for(const[width,height]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){const c=await b.newContext({viewport:{width,height}});await installFonts(c);const p=await c.newPage();await p.goto(base+'/portfolio/#womenswear/evening');await fontsReady(p);const source=p.locator(`[data-ww-exhibition=evening] .ww-rail [data-open-subject="${featuredWomenswearIdentity('evening-ref-05')}"]`);await source.scrollIntoViewIfNeeded();const position=await p.locator('[data-world=womenswear]').evaluate(e=>e.scrollTop);const mid=await captureMidpoint(p,()=>source.click(),160);const reader=p.locator('[data-ww-reader]:not([hidden])');await reader.waitFor({state:'visible'});check(mid.clip!=='none'&&mid.clip!=='inset(0%)',width+': entry has a measured clipped midpoint');check(mid.images===2,width+': actual Front/Back pair is the only inspection surface');check(await p.locator('.ww-match,.mw-match').count()===0,width+': no duplicate enlarged-image clone');await reader.evaluate(e=>e.getAnimations()[0].finish());await p.waitForFunction(()=>!document.querySelector('[data-ww-reader]:not([hidden])').hasAttribute('data-ww-moving'));
await reader.locator('[data-photo-panel=back] [data-photo-zoom=in]').click();await reader.locator('[data-photo-panel=back] [data-photo-fit]').click();const exit=await captureMidpoint(p,()=>reader.locator('[data-subject-close]').click(),110);check(exit.clip!=='none'&&exit.opacity===1,width+': opaque return avoids a photographic ghost');check(!await source.locator('img').isVisible(),width+': source photograph stays hidden until return completes');await reader.evaluate(e=>e.getAnimations()[0].finish());await reader.waitFor({state:'hidden'});check(await source.evaluate(e=>e===document.activeElement)&&await source.locator('img').isVisible(),width+': exact source focus and photograph restored');check(Math.abs(await p.locator('[data-world=womenswear]').evaluate(e=>e.scrollTop)-position)<2,width+': exact source scroll');
await source.click();await reader.waitFor({state:'visible'});await reader.locator('[data-subject-close]').focus();check(await reader.evaluate(e=>e.getAnimations().length===0&&!e.hasAttribute('data-ww-moving')),width+': keyboard focus interrupts entry immediately');await p.keyboard.press('Escape');await reader.waitFor({state:'hidden'});await c.close();}console.log(checks+' paired-reader transition/midpoint/return checks passed');}finally{await b.close();}
