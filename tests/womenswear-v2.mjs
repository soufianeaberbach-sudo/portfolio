import{photoReady}from'./fixtures/final-photo.mjs';
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389',b=await chromium.launch();let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++;};
const categories={rtw:10,activewear:10,streetwear:10,evening:10,swimwear:10};const historical={rtw:17,activewear:10,streetwear:10,evening:11,swimwear:10};const whole=new Set(['rtw-ref-08','rtw-ref-16','activewear-ref-10','evening-ref-01']);
try{
 for(const[w,h]of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/portfolio/#womenswear/rtw');await fontsReady(p);await p.waitForTimeout(400);
  const ids=await p.locator('[data-ww-archive] a[data-open-subject]').evaluateAll(a=>a.map(e=>e.dataset.openSubject));check(ids.length===50&&new Set(ids).size===50,`${w}: complete unique archives`);
  check(await p.locator('[data-st],[data-subject-pending]').count()===0,`${w}: no technical story or repeated missing-story text`);
  for(const[category,count]of Object.entries(categories)){
   await p.locator(`[data-act-link=${category}]`).evaluate(e=>e.click());await p.waitForTimeout(850);const root=p.locator(`[data-ww-exhibition=${category}]`),rail=root.locator('.ww-rail');
   check(await root.locator('[data-ww-title]').evaluate(e=>Number(getComputedStyle(e).opacity)>.99),`${w}/${category}: category navigation arrives before the title departs`);
   check(await rail.locator('a').count()===count,`${w}/${category}: every reference`);check(await p.locator('[data-act]').evaluate(e=>e.scrollWidth<=e.clientWidth+1),`${w}/${category}: no overflow`);
   for(const f of [0,.2,.5,.8,1]){
    await root.evaluate((e,f)=>{const world=e.closest('[data-world]'),camera=e.querySelector('[data-ww-camera]'),bar=world.querySelector('.pf-act__bar').offsetHeight;world.scrollTo({top:world.scrollTop+camera.getBoundingClientRect().top-world.getBoundingClientRect().top-bar+(camera.offsetHeight-world.clientHeight+bar)*f,behavior:'instant'});},f);await p.waitForTimeout(270);
    if(f===.2&&category!=='streetwear')check(await root.locator('[data-ww-actor]').evaluateAll(a=>a.some(e=>e.getAttribute('aria-hidden')==='false'&&e.getBoundingClientRect().height>innerHeight*.7)),`${w}/${category}: full-look authority`);
    check(await root.locator('[data-ww-actor] [data-ww-photo]').evaluateAll(a=>a.every(e=>Number(e.style.getPropertyValue('--view'))===0&&e.dataset.side!=='back')),`${w}/${category}/${f}: primary only`);
   }
   await root.locator('.ww-archive').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await rail.focus();
   for(let i=0;i<count;i++){await p.keyboard.press('Tab');check(await rail.locator('a').nth(i).evaluate(e=>document.activeElement===e),`${w}/${category}/${i}: keyboard archive`);}
   const source=rail.locator('a').last();await source.scrollIntoViewIfNeeded();const before=await p.locator('[data-act]').evaluate(e=>e.scrollTop),left=await rail.evaluate(e=>e.scrollLeft);await source.click();await p.waitForTimeout(680);
   const reader=p.locator('[data-ww-reader]:not([hidden])'),id=await reader.getAttribute('data-subject');check(await reader.count()===1,`${w}/${category}: one shared reader`);check(await reader.evaluate(e=>e.contains(document.activeElement)),`${w}/${category}: reader focus`);
   const buttons=reader.locator('[data-ww-view]');check(await buttons.count()===(category==='swimwear'||whole.has(id)||(category==='streetwear'&&Number(id.slice(-2))>2)?0:3),`${w}/${category}: only genuine views plus original`);
   if(await buttons.count()){await buttons.nth(1).click();await photoReady(reader,1);check(await reader.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').getAttribute('data-side')==='back',`${w}/${category}: back`);await buttons.nth(2).click();await photoReady(reader,2);check(await reader.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').getAttribute('data-split')==='1',`${w}/${category}: complete original`);}
   await reader.locator('[data-rd-inspect]').click();await p.keyboard.press('+');await p.keyboard.press('ArrowDown');check(await reader.getAttribute('data-inspect')!==null,`${w}/${category}: inspect`);await reader.locator('[data-ww-fit]').click();await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(650);
   check(await source.evaluate(e=>e===document.activeElement),`${w}/${category}: exact source occurrence focus`);check(Math.abs(await rail.evaluate(e=>e.scrollLeft)-left)<1&&Math.abs(await p.locator('[data-act]').evaluate(e=>e.scrollTop)-before)<1,`${w}/${category}: exact source place`);
   check(await source.locator('[data-ww-photo]').evaluate(e=>Number(e.style.getPropertyValue('--view'))===0),`${w}/${category}: return never changes exhibition primary`);
   await p.goBack();await p.waitForTimeout(80);check(await reader.count()===1,`${w}/${category}: history back`);await p.goForward();await p.waitForTimeout(650);check(await p.locator('[data-ww-reader]:not([hidden])').count()===0,`${w}/${category}: history forward`);
  }
  await p.emulateMedia({reducedMotion:'reduce'});
  for(const[category,count]of Object.entries(historical))for(let i=1;i<=count;i++){
   const id=`${category}-ref-${String(i).padStart(2,'0')}`;await p.evaluate(({category,id})=>location.hash=`#womenswear/${category}/${id}`,{category,id});await p.waitForTimeout(35);const r=p.locator(`[data-subject=${id}]`);check(await r.isVisible(),`${w}/${id}: deep link`);
   check(await r.locator('[data-ww-view]').count()===(category==='swimwear'||whole.has(id)||(category==='streetwear'&&Number(id.slice(-2))>2)?0:3),`${w}/${id}: truthful availability`);
   const box=await r.locator('[data-photo-view]:not([hidden]) [data-ww-photo]').boundingBox();check(box.x>=-1&&box.x+box.width<=w+1&&box.y>=40&&box.y+box.height<=h,`${w}/${id}: entire primary photographic window`);
  }
  check(errors.length===0,`${w}: no page error ${errors}`);await c.close();console.log(`${w} reviewed`);
 }
 const c=await b.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});await installFonts(c);
 const p=await c.newPage();await p.goto(base+'/portfolio/#womenswear/evening/evening-ref-04');await fontsReady(p);
 check(await p.locator('[data-subject=evening-ref-04]').isVisible(),'native garment target without JS');
 check(await p.locator('[data-ww-archive] a[data-open-subject]').count()===50,'all 50 archive links without JS');
 check(await p.locator('[data-ww-exhibition][data-enhanced]').count()===0,'static resting compositions');
 const fallback=await c.newPage();await fallback.goto(base+'/portfolio/#womenswear');await fontsReady(fallback);
 const swim=fallback.locator('[data-ww-exhibition=swimwear] [data-ww-actor] .ww-photo').first();
 check(await swim.locator('img').evaluate(i=>new DOMMatrixReadOnly(getComputedStyle(i).transform).m41<0),'native primary window has its measured offset before JavaScript');
 const original=p.locator('[data-subject=evening-ref-04] [data-photo-view="0"] .ww-photo');
 check(await original.locator('img').evaluate(i=>getComputedStyle(i).transform==='none'),'native reader retains the whole original');await c.close();
 console.log(`${checks} Womenswear V2 checks passed`);
}finally{await b.close();}
