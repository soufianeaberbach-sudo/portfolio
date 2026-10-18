import {chromium} from 'playwright';
import {installFonts} from './fixtures/fonts.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
// Replays smoke's exact focus assertion. FOCUS_SETUP=smooth reproduces the old
// animated fixture setup; default instant matches the corrected smoke helper.
// Keep the build immutable and give this runner its own preview/fixture ports.
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4371',workers=Number(process.env.FOCUS_WORKERS||4),runs=Number(process.env.FOCUS_RUNS||3),rate=Number(process.env.FOCUS_CPU||1),setup=process.env.FOCUS_SETUP||'instant',input=process.env.FOCUS_INPUT||'locator';
const browser=await chromium.launch(),results=[];
async function run(worker,iteration){
 const c=await browser.newContext({viewport:{width:1440,height:900}});await installFonts(c);const p=await c.newPage();await p.route('**://fonts.googleapis.com/**',r=>r.abort());
 if(rate>1){const cd=await c.newCDPSession(p);await cd.send('Emulation.setCPUThrottlingRate',{rate});}
 await p.addInitScript(()=>{
  window.focusTrace=[];
  const describe=el=>el?{tag:el.tagName,id:el.id,cls:String(el.className),inert:!!el.closest('[inert]'),visibility:getComputedStyle(el).visibility,display:getComputedStyle(el).display,scrollY}:null;
  const log=(event,el,extra={})=>window.focusTrace.push({time:Math.round(performance.now()),event,element:describe(el),active:document.activeElement?.id||document.activeElement?.tagName,hash:location.hash,...extra});
  const focus=HTMLElement.prototype.focus;HTMLElement.prototype.focus=function(...args){log('focus-call',this);const out=focus.apply(this,args);log('focus-result',this);return out;};
  document.addEventListener('focusin',e=>log('focusin',e.target),true);document.addEventListener('focusout',e=>log('focusout',e.target),true);
  addEventListener('DOMContentLoaded',()=>{const threshold=document.querySelector('[data-women-threshold]');new MutationObserver(()=>log('threshold',threshold)).observe(threshold,{attributes:true,attributeFilter:['inert']});});
 });
 try{
 await p.goto(base+'/portfolio/',{waitUntil:'load'});await p.waitForTimeout(600);
 await p.evaluate(setup=>{const el=document.querySelector('.pf-cinema');if(setup==='smooth')scrollTo(0,el.offsetTop+el.offsetHeight-innerHeight);else scrollTo({top:el.offsetTop+el.offsetHeight-innerHeight,behavior:'instant'})},setup);await p.waitForTimeout(900);
 const trigger=p.locator('.pf-women-threshold__action');await trigger.evaluate(e=>e.id='smoke-trigger');if(input==='keyboard'){await trigger.focus();await p.keyboard.press('Enter');}else if(input==='pointer'){const r=await trigger.boundingBox();await p.mouse.click(r.x+r.width/2,r.y+r.height/2);}else await trigger.click();await p.waitForTimeout(800);
 await p.locator('[data-act-toggle]').evaluate(e=>e.click());await p.waitForTimeout(400);
 await p.locator('[data-act-link=evening]').evaluate(e=>e.click());await p.waitForTimeout(1400);
 await p.locator('[data-act-toggle]').evaluate(e=>e.click());await p.waitForTimeout(350);
 await p.keyboard.press('Escape');await p.waitForTimeout(500);
 await p.keyboard.press('Escape');await p.waitForTimeout(700);
 await p.keyboard.press('Escape');await p.waitForTimeout(700);
 const result=await p.evaluate(()=>({pass:document.activeElement?.id==='smoke-trigger'&&location.hash===''&&!document.querySelector('[data-world=womenswear][data-open]')&&!document.querySelector('[inert]'),active:document.activeElement?.id||document.activeElement?.tagName,hash:location.hash,open:!!document.querySelector('[data-world=womenswear][data-open]'),trace:window.focusTrace}));
 results.push({worker,iteration,...result});console.log(JSON.stringify({worker,iteration,pass:result.pass,active:result.active}));
 }catch(e){results.push({worker,iteration,error:e.message,trace:await p.evaluate(()=>window.focusTrace).catch(()=>[])});console.log(JSON.stringify({worker,iteration,error:e.message}));}finally{await c.close();}
}
try{await Promise.all(Array.from({length:workers},async(_,w)=>{for(let i=0;i<runs;i++)await run(w,i)}));}finally{await browser.close();}
await mkdir('.qa-director/rtw-pre-pr',{recursive:true});
const report={setup,input,date:new Date().toISOString(),base,workers,runs,rate,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};await writeFile(`.qa-director/rtw-pre-pr/focus-${setup}-${input}-${workers}x${runs}-cpu${rate}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({setup,input,workers,runs,rate,passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
