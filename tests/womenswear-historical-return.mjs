import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const b=await chromium.launch(),base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389';let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++;};
try{for(const width of[1440,390]){
 const c=await b.newContext({viewport:{width,height:width===390?844:900},isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();
 for(const id of['rtw-ref-08','rtw-ref-09','rtw-ref-12','rtw-ref-13','rtw-ref-14','rtw-ref-16','rtw-ref-17','evening-ref-09']){
  const cat=id.startsWith('rtw')?'rtw':'evening';await p.goto(`${base}/portfolio/#womenswear/${cat}/${id}`);await fontsReady(p);const r=p.locator(`[data-subject=${id}]`);check(await r.isVisible(),id+': old address opens');check(await p.locator(`[data-ww-archive] [data-open-subject=${id}]`).count()===0,id+': excluded from visible ten');
  await r.locator('[data-subject-close]').click();await r.waitFor({state:'hidden'});check(await p.evaluate(()=>document.activeElement.matches('[data-act-toggle]')),id+': visible category control receives focus');check(await p.evaluate(cat=>location.hash===`#womenswear/${cat}`,cat),id+': valid category return');await p.goBack();await r.waitFor();check(await r.isVisible(),id+': browser Back reopens original historical reader');await p.goForward();await r.waitFor({state:'hidden'});check(await p.evaluate(()=>document.activeElement.matches('[data-act-toggle]')),id+': Forward restores category focus');
 }
 await c.close();
}console.log(`${checks} historical deep-link and focus-return checks passed`);}finally{await b.close();}
