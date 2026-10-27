/** Owner-selected hooks, compact complete edits, direct category access and source return. */
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339',out=process.env.BUSINESS_QA_DIR||'.qa-director/business-pass/final';await fs.mkdir(out,{recursive:true});
const ww={casualwear:['ww-ai-rtw-ref-03-v1','ww-ai-streetwear-ref-01-v1'],activewear:['ww-ai-activewear-ref-01-v1','ww-ai-activewear-ref-08-v1'],evening:['ww-ai-evening-ref-01-v1','ww-ai-evening-ref-05-v1'],swimwear:['ww-recovery-swimwear-ref-01-v1','ww-ai-swimwear-ref-08-v1']};
const mw={'m-streetwear':['mw-r2-casualwear-01','mw-r2-casualwear-02','mw-r2-casualwear-05'],'m-activewear':['mw-r2-activewear-01','mw-r2-activewear-02','mw-r2-activewear-08'],'m-rtw':['mw-r2-outerwear-01','mw-r2-outerwear-02','mw-r2-outerwear-09'],'m-tailoring':['mw-r2-tailoring-01','mw-r2-tailoring-02','mw-r2-tailoring-06']};
let checks=0;const errors=[],measurements=[];const check=(x,m)=>{assert.ok(x,m);checks++;};const b=await chromium.launch();
try{for(const [width,height]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
 const c=await b.newContext({viewport:{width,height},isMobile:width<700,hasTouch:width<700});await installFonts(c);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/portfolio/#womenswear');await fontsReady(p);
 for(const [chapter,groups]of Object.entries({womenswear:ww,menswear:mw}))for(const [cat,leads]of Object.entries(groups)){
  await p.evaluate(hash=>location.hash=hash,`#${chapter}/${cat}`);await p.waitForTimeout(950);
  console.log(width,cat,'curated edit');const root=p.locator(chapter==='womenswear'?`[data-ww-exhibition=${cat}]`:`[data-mw-film=${cat}]`),rail=root.locator('.ww-rail,.mw-rail');
  const ids=await rail.locator('a').evaluateAll(es=>es.map(e=>e.dataset.openSubject));check(ids.length===10&&new Set(ids).size===10,cat+' all ten remain');check(JSON.stringify(ids.slice(0,leads.length))===JSON.stringify(leads),cat+' exact selected lead order');
  const actors=await root.locator(chapter==='womenswear'?'[data-ww-actor]':'[data-mw-lead]').evaluateAll(es=>es.sort((a,b)=>Number(a.dataset.mwLead??0)-Number(b.dataset.mwLead??0)).map(e=>e.dataset.openSubject));check(JSON.stringify(actors)===JSON.stringify(leads),cat+' film uses selected hooks');
  await root.locator('img[src]').evaluateAll(ims=>Promise.all(ims.map(im=>{im.loading='eager';return im.decode();})));
  if(width===1440||width===390||cat==='casualwear'||cat==='m-streetwear')await p.screenshot({path:`${out}/${cat}-lead-${width}.png`});
  if(chapter==='womenswear')await root.locator('[data-edit-browse]').click();else await p.locator('[data-mw-archive-open]').click();
  await rail.waitFor({state:'visible'});await rail.locator('img').evaluateAll(ims=>Promise.all(ims.map(im=>{im.loading='eager';return im.decode();})));
  check(await rail.evaluate(e=>e.scrollWidth>e.clientWidth+10),cat+' controlled horizontal overflow');
  const h=await root.locator('.ww-archive,.mw-archive').evaluate(e=>e.getBoundingClientRect().height);check(h<height*1.25,cat+' edit and handoff fit compact section');measurements.push({width,cat,archiveHeight:h});
  const button=root.locator('[data-edit-step="1"]');await button.click();await p.waitForTimeout(420);check(await rail.evaluate(e=>e.scrollLeft>20),cat+' arrow reveals further looks');
  await rail.focus();await p.keyboard.press('End');const last=rail.locator('a').last();check(await last.evaluate(e=>document.activeElement===e),cat+' keyboard reaches final look');
  await last.scrollIntoViewIfNeeded();await p.waitForTimeout(150);const state=await rail.evaluate(e=>({left:e.scrollLeft,top:e.closest('[data-world]').scrollTop,mw:e.closest('[data-mw-scroll]')?.scrollTop}));await last.click();const reader=p.locator(`[data-subject="${ids.at(-1)}"]`);await reader.waitFor({state:'visible'});await p.keyboard.press('Escape');await reader.waitFor({state:'hidden'});await p.waitForTimeout(350);
  check(await last.evaluate(e=>document.activeElement===e),cat+' return restores exact door');const back=await rail.evaluate(e=>({left:e.scrollLeft,top:e.closest('[data-world]').scrollTop,mw:e.closest('[data-mw-scroll]')?.scrollTop}));check(Math.abs(back.left-state.left)<2&&Math.abs(back.top-state.top)<2&&Math.abs((back.mw??0)-(state.mw??0))<2,cat+' rail and chapter scroll restored '+JSON.stringify({state,back}));
  await rail.focus();await p.keyboard.press('Home');check(await rail.locator('a').first().evaluate(e=>document.activeElement===e),cat+' Home returns first look');
  if(width===1440||width===390||cat==='casualwear'||cat==='m-streetwear')await p.screenshot({path:`${out}/${cat}-edit-${width}.png`});
 }
 check(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),width+' no document overflow');await c.close();
}check(!errors.length,'no browser errors '+errors);await fs.writeFile(out+'/verification.json',JSON.stringify({checks,viewports:6,measurements,errors},null,2));console.log(checks+' business-browsing checks passed');}finally{await b.close();}
