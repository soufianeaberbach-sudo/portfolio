import { chromium } from 'playwright';
import { installFonts } from './fixtures/fonts.mjs';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.PORTFOLIO_QA_URL ?? 'http://127.0.0.1:4339';
const output = '.qa-director/reinvention';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
/* Every context in this file renders with the site's real faces — see
   fixtures/fonts.mjs for why that is not a detail. */
const ctxWithFonts = async (options) => {
  const context = await browser.newContext(options);
  await installFonts(context);
  return context;
};
const pageWithFonts = async (options) => {
  const context = await ctxWithFonts(options);
  return context.newPage();
};

let checks = 0;
const check = (value, message) => { assert(value, message); checks++; };
try {
 for (const width of [1440,390,1024,768,430]) {
  const page = await pageWithFonts({viewport:{width,height:1000},hasTouch:width<900});
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
  /* The sequence: each chapter arrives as its own cover, and the Tech Packs
     file answers to attention. There is no chapter-list screen in the middle
     of this any more, so what is captured is the covers themselves. */
  for(const chapter of ['menswear','3d-simulation','tech-packs']){
   await page.locator('[data-cover="'+chapter+'"]').scrollIntoViewIfNeeded();
   await page.waitForTimeout(900);
   check(await page.locator('[data-cover="'+chapter+'"] .pf-cover__action').count()===1,chapter+' cover offers its way in');
   await shot('cover-'+chapter);
  }
  if(width===1440){
   await page.locator('[data-cover="tech-packs"] .pf-file__front').hover();
   await page.waitForTimeout(900);
   await shot('tech-packs-file-open');
  }
  await page.locator('.pf-outro').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  /* The ending resolves the journey instead of repeating it: one line, one
     word in the site's signal, one way on. It is no longer a directory. */
  check(await page.locator('.pf-outro a').count()===1,'the ending offers one way on, not a directory');
  check((await page.locator('.pf-outro__title').innerText()).replace(/\s+/g,' ').trim()==='One practice. From design to production.','the ending states the practice');
  await shot('ending');
  /* Protect real category names, access and truthful evidence, not a layout score. */
  await open('womenswear');await shot('womenswear-act');
  check(await page.locator('[data-world="womenswear"] [data-territory]').count()===5,'five territories retained');
  check(await page.locator('[data-world="womenswear"] [data-act-link]').count()===5,'all five reachable by name');
  {
   const names=await page.locator('[data-world="womenswear"] [data-territory]').evaluateAll(
     (els)=>els.map((e)=>e.dataset.actTitle));
   check(names.join(',')==='Ready-to-Wear,Activewear,Streetwear,Occasion,Swim','the real categories are the titles');
   /* A CATEGORY IS THE ATMOSPHERE; A PROJECT IS THE STORY. Every garment the
      chapter shows is a door into its own, and the evidence belongs to the
      project that produced it rather than to a category. */
   check(await page.locator('[data-world="womenswear"] [data-open-subject]').count()
     === await page.locator('[data-world="womenswear"] .pf-rd__subject').count(),'every garment is a door into its own story');
   check(await page.locator('[data-world="womenswear"] [data-scene="evidence"]').count()===0,'no category carries a generic proof band');
   check(await page.locator('[data-world="womenswear"] .pf-rd__stage-item').count()===0,'and no stage is invented for a photograph');
   check(await page.locator('[data-world="womenswear"] [data-subject-pending]').count()
     === await page.locator('[data-world="womenswear"] .pf-rd__subject').count(),'each unverified garment says what is missing');
  }
  for(const id of ['rtw','activewear','streetwear','evening','swimwear']){
   await open('womenswear/'+id);
   await page.waitForTimeout(500);
   /* The category supplies a visible, inspectable image. */
   check(await page.locator('[data-territory="'+id+'"] img').first().evaluate(
     (img)=>img.offsetHeight>window.innerHeight*0.3),'the garment owns the frame in '+id);
   await shot('womenswear-'+id);
  }
  /* THE GARMENT, ENTERED. The point of a range is that it is a way in, so the
     thing worth proving is that the garment gets bigger, keeps the chapter's
     ground, and can be left again from where it was entered. */
  {
   await open('womenswear/rtw');
   await page.waitForTimeout(400);
   const thumb=await page.locator('[data-territory="rtw"] [data-weight="supporting"] .pf-fig__door img').first().evaluate((i)=>Math.round(i.getBoundingClientRect().height));
   const id=await page.locator('[data-territory="rtw"] [data-weight="supporting"] .pf-fig__door').first().getAttribute('data-open-subject');
   await page.locator('[data-territory="rtw"] [data-weight="supporting"] .pf-fig__door').first().click();
   await page.waitForTimeout(700);
   const big=await page.locator(`[data-subject="${id}"] .pf-rd__window img`).first().evaluate((i)=>Math.round(i.getBoundingClientRect().height));
   check(big>thumb*1.8,'the entered garment is far bigger than its cell: '+thumb+' → '+big);
   check(await page.evaluate(()=>getComputedStyle([...document.querySelectorAll('.pf-rd__subject')].find(e=>!e.hidden)).backgroundColor)==='rgb(243, 240, 233)','and it stays on the chapter\'s own ground');
   await shot('womenswear-garment');
   await page.keyboard.press('Escape');
   await page.waitForTimeout(600);
   check(await page.evaluate(()=>location.hash)==='#womenswear/rtw','leaving lands back in the territory');
   check(await page.evaluate((sid)=>document.activeElement?.dataset?.openSubject===sid,id),'on the frame the visitor chose');
  }

  for(const [world,cat] of [['menswear','m-streetwear']]){
   await open(world);await shot(world+'-categories');
   check(await page.locator('[data-world="'+world+'"] .pf-cat').count()>=4,'categories retained');
   await open(world+'/'+cat);await shot(world+'-viewer');
   const active=page.locator('[data-world="'+world+'"] [data-screen="category"]:not([hidden])');
   const plate=active.locator('[data-evidence-open]').first();
   await plate.scrollIntoViewIfNeeded();
   const scroll=await page.locator('[data-world="'+world+'"]').evaluate(e=>e.scrollTop);
   const state=await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex);
   for(let i=0;i<3;i++){
    const target=active.locator('[data-evidence-open]').nth(i);
    await target.click();
    check(await page.locator('[data-evidence-reader]').evaluate(e=>e.open),'evidence opened');
    check(await page.locator('[data-evidence-mount]').evaluate(e=>e.clientHeight>500),'evidence enlarged');
    if(i===0)await shot(world+'-evidence-open');
    if(i===1)await page.keyboard.press('Escape');else await page.locator('[data-evidence-close]').click();
    check(await target.evaluate(e=>document.activeElement===e),'evidence focus restored');
    check(await page.evaluate(()=>window.__portfolioRunway.getState().activeIndex)===state,'garment state preserved');
   }
   check(await page.locator('[data-world="'+world+'"]').evaluate(e=>e.scrollTop)===scroll,'world scroll preserved');
  }
  /* The deck itself is unchanged. Womenswear's worlds no longer use it, so
     it is proved on Menswear, which still does. */
  await open('menswear/m-rtw');
  const stage=page.locator('[data-world="menswear"] [data-screen="category"]:not([hidden]) [data-stage]');
  await stage.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
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
   const scroll=await page.locator('[data-world="tech-packs"]').evaluate(e=>e.scrollTop);
   await opener.click();
   check(await page.locator('[data-reader]').evaluate(e=>e.open),'reader open');
   const close=page.locator('[data-reader-close]');
   check(await close.evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-reader-close]')}),'reader close unobstructed');
   await shot('pdf-open');
   const captured=Number(await page.locator('[data-reader]').getAttribute('data-scroll-top'));
   check(Number.isFinite(captured)&&captured>0,'PDF origin scroll captured');
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
}finally{await browser.close()}
