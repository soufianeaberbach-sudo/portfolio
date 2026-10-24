/** Actual website evidence: full white integration, all worlds, readers and live motion. */
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import sharp from 'sharp';
import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4356';
const out=process.env.STUDIO_QA_DIR||'docs/portfolio/review/menswear-studio-v2-2026-10-24/local';await fs.mkdir(out,{recursive:true});
const looks=JSON.parse(await fs.readFile('src/data/menswear-ai-production.json')).selectedCompleteLooks;
const worlds=['m-streetwear','m-activewear','m-rtw','m-tailoring'];
const samples=['mw-r2-casualwear-01','mw-r2-activewear-02','mw-r2-outerwear-01','mw-r2-tailoring-04','mw-r2-tailoring-06','mw-r2-casualwear-03'];
const sizes=[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]];
const report={url:base,checks:0,errors:[],viewports:[],motion:[],screenshots:[],womenswear:[]};
const check=(x,m)=>{assert(x,m);report.checks++};
const b=await chromium.launch();
const shot=async(p,file,locator)=>{const target=path.join(out,file);if(locator)await locator.screenshot({path:target});else await p.screenshot({path:target});report.screenshots.push(file)};
const world=async(p,id)=>{await p.evaluate(id=>location.hash='#menswear/'+id,id);await p.waitForFunction(id=>document.querySelector('[data-mw-film][data-current]')?.dataset.mwFilm===id,id);};
const settled=async(p,n)=>{const name=(await p.locator(`[data-mw-scene="${n}"]`).getAttribute('aria-label')).replace(/^\d+: /,'');await p.waitForFunction(({n,name})=>document.querySelector('[data-mw-film][data-current] [data-mw-frame]')?.dataset.composition===String(n)&&document.querySelector('[data-mw-live]')?.textContent.endsWith('. '+name),{n,name},{timeout:8000});};
try{
 for(let si=0;si<sizes.length;si++){
  const [width,height]=sizes[si],context=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});await installFonts(context);const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+'/portfolio/#menswear/m-streetwear');await fontsReady(p);
  const mapping=await p.evaluate(()=>({readers:[...document.querySelectorAll('[data-mw-reader][data-ai-concept=true] img')].map(i=>i.getAttribute('src')),actors:[...document.querySelectorAll('[data-mw-actor] img')].map(i=>i.getAttribute('src')),archive:[...document.querySelectorAll('[data-mw-archive-door] img')].map(i=>i.getAttribute('src'))}));
  check(mapping.readers.length===120&&mapping.actors.length===21&&mapping.archive.length===40,'all active photographic surfaces present');check(Object.values(mapping).flat().every(s=>s.includes('/menswear-studio-v2/')),'no old studio background selected on any surface');
  for(const id of worlds){await world(p,id);const film=p.locator('[data-mw-film][data-current]');await p.locator('[data-mw-scene="0"]').click();await settled(p,0);await film.locator('[data-mw-actor] img').first().evaluate(i=>i.decode());await p.waitForTimeout(100);check(await film.locator('[data-mw-frame]').evaluate(e=>getComputedStyle(e).backgroundColor)==='rgb(255, 255, 255)','painted cinematic ground uses exact white');check(await film.locator('[data-mw-archive-door]').count()===10,'ten looks');await shot(p,`${id}-opening-${width}x${height}.png`);}
  const sample=looks.find(l=>l.id===samples[si]);await world(p,sample.category);await p.locator('[data-mw-scene="1"]').click();await settled(p,1);await p.waitForTimeout(100);await shot(p,`${sample.category}-second-${width}x${height}.png`);
  await p.locator('[data-mw-archive-open]').click();const door=p.locator(`[data-mw-archive-door="${sample.id}"]`);await door.scrollIntoViewIfNeeded();await door.locator('img').evaluate(i=>i.decode());await p.waitForTimeout(80);await shot(p,`archive-${width}x${height}.png`);await door.click();const reader=p.locator(`[data-mw-reader][data-subject="${sample.id}"]`);await reader.waitFor({state:'visible'});
  for(const [i,name]of ['front','back','editorial'].entries()){
   await reader.locator(`[data-mw-view="${i}"]`).click();const panel=reader.locator(`[data-mw-view-panel="${i}"]`);await panel.waitFor({state:'visible'});const img=panel.locator('img');await img.evaluate(i=>i.decode());
   const g=await img.evaluate(i=>{const r=i.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,nw:i.naturalWidth,nh:i.naturalHeight,src:i.currentSrc}});
   check(g.src.includes('/menswear-studio-v2/')&&g.nw*3===g.nh*2,'correct proportional corrected view');check(g.x>=-1&&g.y>=0&&g.right<=width+1&&g.bottom<=height+1,'whole image inside viewport');check(await reader.locator(`[data-mw-view="${i}"]`).getAttribute('aria-pressed')==='true','active real view indicator');await shot(p,`reader-${name}-${width}x${height}.png`);
  }
  await p.keyboard.press('Escape');await reader.waitFor({state:'hidden'});check(await door.evaluate(e=>e===document.activeElement),'source focus retained');report.viewports.push({width,height,sample:sample.id});await context.close();
 }
 // Real motion is captured separately so a deterministic reduced-motion gallery
 // cannot masquerade as evidence of a functioning animated handoff.
 for(const [width,height]of [[1440,900],[390,844]]){
  const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'no-preference'});await installFonts(c);const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+'/portfolio/#menswear/m-streetwear');await fontsReady(p);
  for(const id of worlds){await world(p,id);await p.locator('[data-mw-scene="0"]').click();await settled(p,0);await p.locator('[data-mw-film][data-current] [data-mw-actor] img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode()})));await p.locator('[data-mw-scene="1"]').click();await p.waitForTimeout(450);const state=await p.locator('[data-mw-film][data-current] [data-mw-actor]').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).visibility!=='hidden').map(n=>({key:n.getAttribute('data-mw-actor'),transform:getComputedStyle(n).transform})));await shot(p,`${id}-motion-${width}x${height}.png`);await settled(p,1);check(state.length>0,'actual cinematic handoff surfaces visible');report.motion.push({width,height,category:id,state});}
  await c.close();
 }
 // The actual served master is captured from its image document, without adding
 // a new Portfolio feature or altering the image's pixels for the screenshot.
 const mc=await b.newContext({viewport:{width:1440,height:900}}),mp=await mc.newPage();await mp.goto(base+looks[0].master);const mi=mp.locator('img');await mi.evaluate(i=>i.decode());check(await mi.evaluate(i=>i.naturalWidth===5400&&i.naturalHeight===2700),'actual served corrected master');await shot(mp,'three-view-master.png',mi);await mc.close();
 for(const [width,height,id]of [[1440,900,'m-streetwear'],[390,844,'m-rtw']]){
  const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();await p.goto(base+'/portfolio/#menswear/'+id);await fontsReady(p);await p.locator('[data-mw-film][data-current] [data-mw-actor] img').first().evaluate(i=>i.decode());await p.evaluate(()=>location.hash='#womenswear/casualwear');await p.locator('[data-ww-exhibition=casualwear] [data-ww-actor] img').first().evaluate(i=>i.decode());await p.waitForTimeout(150);const file=`womenswear-${width}x${height}.png`;await shot(p,file);
  const before=`docs/portfolio/review/menswear-studio-v2-2026-10-24/before/${file}`;const [a,z]=await Promise.all([sharp(before).raw().toBuffer(),sharp(path.join(out,file)).raw().toBuffer()]);let changed=0;for(let i=0;i<a.length;i++)if(a[i]!==z[i])changed++;report.womenswear.push({width,height,changedColourChannels:changed,totalChannels:a.length});await c.close();
 }
 check(report.errors.length===0,'no page errors');await fs.writeFile(path.join(out,'RESULTS.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks,screenshots:report.screenshots.length,viewports:report.viewports.length,motionStates:report.motion.length,errors:report.errors,womenswear:report.womenswear}));
}finally{await b.close()}
