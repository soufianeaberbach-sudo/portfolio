/** Cold category routes must survive fonts/ScrollTrigger startup; URL labels are not route IDs. */
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4431',b=await chromium.launch();let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++;};
const labels={rtw:'Dresses, Tops & Jumpsuits',activewear:'Activewear',streetwear:'Streetwear',evening:'Occasionwear',swimwear:'Swimwear','m-streetwear':'Streetwear','m-activewear':'Activewear','m-rtw':'Casualwear','m-tailoring':'Tailoring & Outerwear'};
try{for(const[width,height]of[[1440,900],[390,844]]){const c=await b.newContext({viewport:{width,height}});await installFonts(c);const p=await c.newPage();
for(const[id,label]of Object.entries(labels)){const ww=!id.startsWith('m-'),world=ww?'womenswear':'menswear';await p.goto(`${base}/portfolio/#${world}/${id}`);await fontsReady(p);await p.waitForTimeout(650);
check(await p.evaluate(()=>location.hash)===`#${world}/${id}`,`${width}/${id}: stable category URL`);
if(ww){check(await p.locator('[data-act-name]').textContent()===label,`${width}/${id}: correct cold category after layout refresh`);check(await p.locator(`[data-ww-exhibition=${id}] [data-ww-title]`).evaluate(e=>Number(getComputedStyle(e).opacity)>.99),`${width}/${id}: initial full-look title retained`);}
else check(await p.locator('[data-mw-world-link][aria-current=page] span').textContent()===label,`${width}/${id}: correct retail category label`);
}await c.close();}console.log(`${checks} cold category/navigation checks passed`);}finally{await b.close();}
