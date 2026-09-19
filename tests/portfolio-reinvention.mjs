import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { startPreview } from './preview.mjs';

/* Starts its own server on its own port; PORTFOLIO_QA_URL still overrides. */
const { base, stop } = await startPreview(Number(process.env.PORTFOLIO_QA_PORT ?? 4323));
const output = '.qa-director/reinvention';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
let checks = 0;
const check = (value, message) => { assert(value, message); checks++; };
try {
 for (const width of [1440,390,1024,768,430]) {
  const page = await browser.newPage({viewport:{width,height:1000},hasTouch:width<900});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/portfolio/');
  await page.addStyleTag({content:'astro-dev-toolbar{display:none!important}'});
  const shot = async name => {
   await page.waitForTimeout(700);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+' '+name+' overflow');
   await page.screenshot({path:output+'/'+width+'-'+name+'.png'});
  };
  const open=async hash=>{await page.evaluate(h=>{location.hash=h},hash);await page.waitForTimeout(700)};
  await shot('opening');
  await page.screenshot({path:output+'/'+width+'-flow.png',fullPage:true});
  if(width===1440){await page.locator('[data-chapter="tech-packs"]').hover();await shot('opening-expanded')}
  for(const [world,cat] of [['womenswear','rtw'],['menswear','m-streetwear']]){
   await open(world);await shot(world+'-categories');
   check(await page.locator('[data-world="'+world+'"] .pf-cat').count()>=4,'categories retained');
   await open(world+'/'+cat);await shot(world+'-viewer');
   const active=page.locator('[data-world="'+world+'"] [data-screen="category"]:not([hidden])');
   /* EVIDENCE PLATES ARE DRAWN ONLY FOR AUTHORED SURFACES.
      No authored asset exists in the repository yet, so there is nothing to
      enlarge and the reader cannot be exercised. The contract below is kept,
      not deleted: it runs the moment a real sketch, pattern or simulation is
      supplied. Until then the check is that NOTHING is drawn in its place and
      that the visitor is told what will publish there — which is the actual
      correction this pass made. */
   /* THE SURFACES LIVE INSIDE A DISCLOSURE NOW.
      Closed by default, because fashion keeps the screen; a visitor who wants
      the technical layer opens it. So the contract starts by opening it — and
      checks that it WAS closed, which is the part that protects the garment. */
   /* SCOPED TO THE LAYER THAT IS SHOWN. One <details> exists per garment, so
      an unscoped selector matched all fifty-one surfaces and walked into the
      hidden ones. */
   const layer=active.locator('.pf-dev:not([hidden])').first();
   const surfaces=active.locator('.pf-dev:not([hidden]) [data-evidence-open]');
   check(await layer.evaluate(e=>e.open===false),'the development layer is closed until it is asked for');
   await layer.evaluate(e=>{e.open=true});
   await page.waitForTimeout(250);
   const plateCount=await surfaces.count();
   const state=await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex);
   if(plateCount===0){
    check(await active.locator('.pf-dev:not([hidden]) .pf-plate img').count()===0,'no surface is drawn without an asset');
   } else {
    /* Every stand-in is stamped on its face and says so in its alt text. An
       unmarked borrowed photograph would be fabricated evidence. */
    const previews=await active.locator('.pf-dev:not([hidden]) .pf-plate[data-preview]').count();
    check(await active.locator('.pf-dev:not([hidden]) .pf-plate[data-preview] .pf-plate__stamp').count()===previews,'every stand-in is stamped');
    check(await active.locator('.pf-dev:not([hidden]) .pf-plate[data-preview] img').evaluateAll(
      els=>els.every(e=>/temporary preview/i.test(e.alt))),'every stand-in says so in its alt text');
    await surfaces.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    /* THE BASELINE IS TAKEN HERE, not before the layer was opened.
       What this protects is that opening and closing a surface does not lose
       the visitor's place — so the reference position is where the visitor
       actually is when they reach for a surface, after the layer has been
       opened and scrolled to. */
    const scroll=await page.locator('[data-world="'+world+'"]').evaluate(e=>e.scrollTop);
    for(let i=0;i<plateCount;i++){
     const target=surfaces.nth(i);
     await target.click();
     check(await page.locator('[data-evidence-reader]').evaluate(e=>e.open),'evidence opened');
     check(await page.locator('[data-evidence-mount]').evaluate(e=>e.clientHeight>500),'evidence enlarged');
     if(i===0)await shot(world+'-evidence-open');
     if(i%2===1)await page.keyboard.press('Escape');else await page.locator('[data-evidence-close]').click();
     check(await target.evaluate(e=>document.activeElement===e),'evidence focus restored');
     check(await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex)===state,'garment state preserved');
     check(await page.locator('[data-world="'+world+'"]').evaluate(e=>e.scrollTop)===scroll,'world scroll preserved');
    }
   }
  }
  await open('womenswear/rtw');
  const stage=page.locator('[data-world="womenswear"] [data-screen="category"]:not([hidden]) [data-stage]');
  await stage.scrollIntoViewIfNeeded();
  const box=await stage.boundingBox();
  for(const dir of [1,-1]){
   const current=await page.evaluate(()=>window.__portfolioRunway.getState());
   const tracked=stage.locator('[data-depth="1"]');
   const item=await tracked.getAttribute('data-item');
   const x0=(await tracked.boundingBox()).x;
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   await page.mouse.move(box.x+box.width/2+dir*120,box.y+box.height/2,{steps:10});
   const moving=stage.locator('[data-item="'+item+'"]:not([data-wheel-ghost])');
   const x1=(await moving.boundingBox()).x;
   check(dir*(x1-x0)>0,'drag follows hand '+width);
   await page.mouse.up();await page.waitForTimeout(60);
   const x2=(await moving.boundingBox()).x;
   check(dir*(x2-x1)>=-1,'release continues direction '+width);
   await page.waitForTimeout(700);
   check(await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex)===(current.activeIndex+dir+current.count)%current.count,'circular index '+width);
  }
  if(width===1440||width===390){
   const state=await page.evaluate(()=>window.__portfolioRunway.getState());
   await page.evaluate(n=>window.__portfolioRunway.goTo(n-1),state.count);await page.waitForTimeout(700);
   await page.evaluate(n=>window.__portfolioRunway.goTo(n),state.count);
   for(let i=0;i<6;i++){await stage.screenshot({path:output+'/'+width+'-wheel-'+i+'.png'});await page.waitForTimeout(50)}
   await page.waitForTimeout(700);
   check(await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex)===0,'last to first');
   await page.evaluate(()=>window.__portfolioRunway.goTo(-1));await page.waitForTimeout(700);
   check(await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex)===state.count-1,'first to last');
  }
  await open('tech-packs');await shot('tech-packs');
  const docs=page.locator('[data-open-pdf]');
  check(await docs.count()===5,'five documents');
  for(const mode of ['button','escape']){
   const opener=docs.nth(2);await opener.scrollIntoViewIfNeeded();
   /* THE RESTORE IS ONLY EXERCISED FROM A NON-ZERO POSITION, AND THE BASELINE
      HAS TO BE READ AFTER THE PAGE HAS SETTLED THERE.
      The third sheet of the cascade sits below the fold, so bringing it into
      view is what puts the world at a non-zero offset — and reading the
      baseline before that (or before the click's own auto-scroll) compared
      two different positions and failed on a taller layout rather than on a
      defect. */
   /* One pass from the top of the chapter and one from part-way down it, so
      the restore is exercised at zero and at a real offset without assuming
      how tall the cascade happens to be. The baseline is read after the
      element is in view, because the click does its own scrolling otherwise
      and the two positions would not be comparable. */
   if(mode==='escape')await page.locator('[data-world="tech-packs"]').evaluate(e=>{e.scrollTop=Math.min(260,e.scrollHeight-e.clientHeight)});
   await opener.scrollIntoViewIfNeeded();
   await page.waitForTimeout(250);
   const scroll=await page.locator('[data-world="tech-packs"]').evaluate(e=>e.scrollTop);
   await opener.click();
   check(await page.locator('[data-reader]').evaluate(e=>e.open),'reader open');
   const close=page.locator('[data-reader-close]');
   check(await close.evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-reader-close]')}),'reader close unobstructed');
   await shot('pdf-open');
   const captured=Number(await page.locator('[data-reader]').getAttribute('data-scroll-top'));
   check(Number.isFinite(captured)&&Math.abs(captured-scroll)<=1,'PDF origin scroll captured: '+scroll+' -> '+captured);
   if(mode==='button')await close.click();else await page.keyboard.press('Escape');
   await page.waitForTimeout(120);
   check(await opener.evaluate(e=>document.activeElement===e),'PDF focus restored');
   const restored=await page.locator('[data-world="tech-packs"]').evaluate(e=>e.scrollTop);
   check(Math.abs(restored-captured)<=1,'PDF scroll restored '+width+' '+mode+': '+captured+' -> '+restored);
   check(await page.evaluate(()=>document.body.classList.contains('no-scroll')),'world remains scroll locked');
  }
  await shot('pdf-closed');await open('3d-simulation');await shot('pattern');
  check(await page.locator('[data-video]').count()===5,'five videos');
  check(await page.locator('iframe').count()===0,'no initial iframe');
  check(errors.length===0,errors.join('\n'));
  await page.close();
 }
 console.log(checks+' reinvention checks passed; screenshots: '+output);
}finally{await browser.close();stop()}
