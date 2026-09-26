/* Current-architecture smoke and accessibility checks. */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url); const {chromium}=require('playwright');
const HOST='127.0.0.1',PORT=Number(process.env.SMOKE_PORT??4321),BASE=`http://${HOST}:${PORT}`;
const astro=fileURLToPath(new URL('../node_modules/astro/astro.js',import.meta.url));
const server=spawn(process.execPath,[astro,'preview','--host',HOST,'--port',String(PORT)],{stdio:'ignore',detached:true});
const stop=()=>{try{process.kill(-server.pid,'SIGTERM')}catch{}}; process.on('exit',stop);
for(let i=0;i<60;i++){try{if((await fetch(BASE+'/portfolio/')).ok)break}catch{} await new Promise(r=>setTimeout(r,250)); if(i===59)throw Error('preview did not start')}
const browser=await chromium.launch(); let checks=0; const ok=(v,m)=>{assert(v,m);checks++};
try{
 const errors=[];
 for(const width of [390,430,768,1024,1440]){
  const c=await browser.newContext({viewport:{width,height:900}}); const p=await c.newPage();
  p.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
  await p.goto(BASE+'/portfolio/',{waitUntil:'networkidle'});
  ok(await p.locator('.pf-opening picture source').count()===2,`responsive master scene @${width}`);
  ok(await p.locator('[data-world]').count()===4,`four real worlds @${width}`);
  ok(await p.locator('[data-transition]').count()===4,`four semantic transitions @${width}`);
  ok(await p.locator('.pf-cinema__media').count()===0,`old cinema absent @${width}`);
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  ok(overflow===0,`horizontal overflow ${overflow}px @${width}`);
  const labels=await p.locator('.pf > .pf-continuity a',{hasText:'Pattern Development'}).allTextContents().catch(()=>[]);
  ok(labels.length===1 && labels[0].trim().includes('Pattern Development'),`full index label @${width}`);
  if(width<=430){const h=await p.locator('.pf > .pf-continuity a[href="#3d-simulation"]').evaluate(e=>e.getBoundingClientRect().height);ok(h>=44,`touch target ${h}px @${width}`)}
  await c.close();
 }
 ok(errors.length===0,errors.join('\n'));
 // Reduced motion retains meaningful visible and accessible content.
 {const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(BASE+'/portfolio/');
  ok(await p.locator('[data-transition]').first().isVisible(),'transition visible reduced motion');
  ok(await p.locator('#portfolio-ending').isVisible(),'ending visible reduced motion');await c.close()}
 // No-JS progressive baseline contains all worlds and their indexes.
 {const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:768,height:900}});const p=await c.newPage();await p.goto(BASE+'/portfolio/');
  ok(await p.locator('[data-world]').count()===4,'four worlds without JS');ok(await p.locator('#portfolio-ending').count()===1,'ending without JS');await c.close()}
 // Living index, keyboard entry, viewer focus isolation, Escape and scroll restore.
 {const c=await browser.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();await p.goto(BASE+'/portfolio/',{waitUntil:'networkidle'});
  const index=p.locator('.pf > .pf-continuity');ok(await index.count()===1,'one continuous living index');
  await p.locator('#womenswear').scrollIntoViewIfNeeded();await p.waitForTimeout(150);const y=await p.evaluate(()=>scrollY);
  const opener=p.locator('#womenswear a.pf-cat[href]').first();await opener.focus();await p.keyboard.press('Enter');await p.waitForTimeout(250);
  ok(await p.locator('#womenswear[data-open]').count()===1,'garment viewer opens from keyboard');
  ok(await p.locator('.pf-opening[inert]').count()===1,'opening inert behind viewer');
  ok(await p.locator('[data-world="menswear"][inert]').count()===1,'other world inert behind viewer');
  ok(await p.evaluate(()=>document.querySelector('#womenswear').contains(document.activeElement)),'focus moved into viewer');
  await p.keyboard.press('Escape');await p.waitForTimeout(250);ok(await p.locator('[data-world][data-open]').count()===0,'Escape closes viewer');
  ok(Math.abs((await p.evaluate(()=>scrollY))-y)<=2,'chapter scroll restored');
  await p.locator('.pf > .pf-continuity a[href="#tech-packs"]').focus();await p.keyboard.press('Enter');await p.waitForTimeout(250);
  ok(Math.abs((await p.locator('#tech-packs').boundingBox()).y)<150,'living index direct navigation');
  ok(await p.locator('#portfolio-ending a[href="/contact/"]').count()===1,'ending CTA exists');
  ok(await p.getByText(/Temporary visual references for interface demonstration/i).count()>0,'reference provenance retained');
  ok(await p.getByText(/Demo — interface prototype/i).count()>0,'tech-pack demo provenance retained');await c.close()}
 console.log(`${checks} smoke checks passed`);
}finally{await browser.close();stop()}
