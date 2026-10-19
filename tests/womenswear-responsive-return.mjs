/* Responsive edits may omit a look from the equivalent shot. Return must keep
   the real occurrence and reframe that look, never focus an invisible actor. */
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import{photoReady}from'./fixtures/final-photo.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389',b=await chromium.launch();let checks=0;const results=[],check=(ok,msg)=>{assert(ok,msg);checks++;};
const cases=[['rtw','stone',1,.60],['activewear','black',.67,.46],['streetwear','burgundy',.41,0],['evening','black',.45,.20],['swimwear','black',.55,.52]];
try{for(const reverse of [false,true]){
 const from=reverse?{width:390,height:844}:{width:1440,height:900},to=reverse?{width:1440,height:900}:{width:390,height:844};
 const c=await b.newContext({viewport:from});await installFonts(c);
 for(const[cat,role,desktop,mobile]of cases)for(const kind of ['camera','archive']){
  const p=await c.newPage();await p.setViewportSize(from);await p.goto(base+`/portfolio/#womenswear/${cat}`);await fontsReady(p);await p.waitForTimeout(450);const root=p.locator(`[data-ww-exhibition=${cat}]`);
  let source;
  if(kind==='camera'){
   await root.evaluate((e,at)=>{const w=e.closest('[data-world]'),cam=e.querySelector('[data-ww-camera]'),bar=w.querySelector('.pf-act__bar').offsetHeight;w.scrollTo({top:w.scrollTop+cam.getBoundingClientRect().top-w.getBoundingClientRect().top-bar+(cam.offsetHeight-w.clientHeight+bar)*at,behavior:'instant'});},reverse?mobile:desktop);await p.waitForTimeout(350);source=root.locator(`[data-ww-actor=${role}]`);
  }else{await root.locator('.ww-archive').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));source=root.locator('.ww-rail a').last();await source.scrollIntoViewIfNeeded();}
  await source.locator('img').evaluate(i=>{i.loading='eager';return i.decode();});const id=await source.getAttribute('data-open-subject');await source.click();const reader=p.locator('[data-ww-reader]:not([hidden])');await photoReady(reader,0);await p.waitForFunction(()=>!document.querySelector('[data-ww-reader][data-ww-moving]'));
  check(await reader.getAttribute('data-subject')===id,`${cat}/${kind}: selected identity`);await p.setViewportSize(to);await p.waitForTimeout(150);await reader.locator('[data-subject-close]').click();await reader.waitFor({state:'hidden',timeout:3000});
  const actual=await source.evaluate(e=>{const r=e.getBoundingClientRect();return{focused:document.activeElement===e,x:r.x,y:r.y,right:r.right,bottom:r.bottom,opacity:Number(getComputedStyle(e).opacity),tab:e.tabIndex};});
  check(actual.focused,`${cat}/${kind}/${reverse}: same occurrence focus`);check(actual.opacity>.5&&actual.x>=-2&&actual.right<=to.width+2&&actual.y>=-2&&actual.bottom<=to.height+2,`${cat}/${kind}/${reverse}: actual occurrence is completely visible`);check(await p.locator('.ww-match').count()===0,`${cat}/${kind}: no stale cut`);results.push({category:cat,kind,from,to,id,...actual});await p.close();
 }
 await c.close();
}console.log(JSON.stringify({checks,results},null,2));console.log(`${checks} responsive source-return checks passed`);}finally{await b.close();}
