import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),url='http://127.0.0.1:4377/lab/menswear-v2/concept';let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const cases=[];
async function ready(p){await p.goto(url);await p.waitForFunction(()=>document.querySelector('[data-ready=true]'));await p.evaluate(()=>document.fonts.ready);}
const roles=['cream','city','booth','statement','statement'];
try{
 for(const[w,h]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[1920,1080]]){
  const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500}),p=await c.newPage();await ready(p);if(w===1920)await p.locator('[data-present]').click();
  for(let scene=0;scene<5;scene++){
   await p.evaluate(i=>window.menswearConcept.scene(i),scene);await p.waitForTimeout(80);
   const stage=await p.locator('[data-frame]').boundingBox(),photo=p.locator(`.mc-plate[data-look="${roles[scene]}"]`),rect=await photo.boundingBox();
   ok(await photo.evaluate(e=>!e.inert),'Complete primary look is interactive at every held act');
   ok(rect&&rect.x>=stage.x-1&&rect.y>=stage.y-1&&rect.x+rect.width<=stage.x+stage.width+1&&rect.y+rect.height<=stage.y+stage.height+1,'Held source window stays within stage');
   ok(await photo.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0),'Primary source decoded');
   const shape=await photo.locator('img').evaluate(e=>{const r=e.getBoundingClientRect();return Math.abs(r.width/r.height-e.naturalWidth/e.naturalHeight);});ok(shape<.006,'Photographic proportions unchanged');
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal viewport overflow');
   ok(await p.locator('.mc-plate').evaluateAll(nodes=>nodes.filter(e=>!e.inert).length===1),'No hidden/obstructed secondary look is interactive');
  }
  cases.push(`${w}×${h}: five complete photographic holds`);await c.close();
 }
 {
  const c=await browser.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();await ready(p);
  await p.locator('[data-present]').click();await p.keyboard.press('PageDown');await p.waitForTimeout(150);await p.keyboard.press('PageUp');await p.waitForTimeout(1100);ok(Math.abs(await p.evaluate(()=>window.menswearConcept.snapshot().position))<.005,'Interrupted remote progression settles at requested act');
  for(const world of['m-activewear','m-rtw','m-tailoring','m-streetwear']){await p.locator('[data-world-menu]').click();await p.locator(`[data-world-to="${world}"]`).click();await p.waitForFunction(w=>window.menswearConcept.snapshot().world===w,world);ok(await p.evaluate(()=>window.menswearConcept.snapshot().position===0),'World jumps directly to opening');ok(await p.evaluate(()=>window.menswearConcept.snapshot().present),'World jump retains keynote mode');}
  await p.locator('[data-experience]').focus();await p.keyboard.press('End');await p.waitForTimeout(80);const source=p.locator('.mc-plate[data-look="statement"]'),before=await p.evaluate(()=>window.menswearConcept.snapshot());await source.click();await p.waitForTimeout(650);ok(await p.locator('[data-reader]').evaluate(e=>e.open),'Hero opens reader');ok(await p.locator('[data-views]').innerText()==='PRIMARY PHOTOGRAPH','No fake Front/Back views');
  await p.locator('[data-inspect]').click();await p.locator('[data-inspection]').press('+');ok((await p.locator('[data-reader-status]').innerText()).includes('260%'),'Inspection zoom');await p.locator('[data-inspection]').press('ArrowRight');await p.locator('[data-fit]').click();ok((await p.locator('[data-reader-status]').innerText()).startsWith('100%'),'Fit resets');await p.keyboard.press('Escape');ok(await p.locator('[data-reader]').evaluate(e=>e.open&&!e.hasAttribute('data-inspecting')),'Escape first exits inspection');await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);ok(await source.evaluate(e=>e===document.activeElement),'Exact photo occurrence receives focus');ok(Math.abs((await p.evaluate(()=>window.menswearConcept.snapshot().position))-before.position)<.005,'Exact held scene preserved');
  await p.locator('[data-archive]').click();ok(await p.locator('[data-archive-look]').count()===4,'All four genuine Streetwear candidates accessible');const door=p.locator('[data-archive-look="city"]');await door.click();await p.waitForTimeout(600);await p.locator('[data-reader-close]').click();await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);ok(await door.evaluate(e=>e===document.activeElement),'Exact archive occurrence focus');await p.keyboard.press('Escape');await p.locator('[data-experience]').focus();await p.keyboard.press('Escape');ok(!await p.evaluate(()=>window.menswearConcept.snapshot().present),'Safe layered escape from presentation');
  await p.locator('[data-experience]').focus();await p.keyboard.press('Home');await p.mouse.move(750,500);await p.mouse.wheel(0,600);await p.waitForFunction(()=>window.menswearConcept.snapshot().position>.8);ok(await p.evaluate(()=>window.menswearConcept.snapshot().scroll>400),'Actual wheel advances film');await c.close();
 }
 {
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await c.newPage();await ready(p);const cdp=await c.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650,id:1}]});for(let y=630;y>=210;y-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y,id:1}]});await p.waitForTimeout(18);}await p.waitForTimeout(180);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForFunction(()=>window.menswearConcept.snapshot().position>.8);ok(await p.evaluate(()=>window.menswearConcept.snapshot().scroll>300),'Real touch on photograph advances Explore');
  await p.evaluate(()=>window.menswearConcept.scene(4));const hero=p.locator('.mc-plate[data-look="statement"]');await hero.tap();await p.waitForTimeout(650);await p.locator('[data-reader-close]').tap();await p.waitForTimeout(70);await p.setViewportSize({width:430,height:932});await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);ok(await hero.evaluate(e=>e===document.activeElement),'Resized interrupted crop return preserves source focus after repaint');ok(await p.locator('.mc-transfer').count()===0,'No stale resized crop clone');
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('[data-present]').click();await p.keyboard.press('End');ok(await p.evaluate(()=>window.menswearConcept.snapshot().position===4),'Reduced motion settles directly');await p.locator('.mc-plate[data-look="statement"]').tap();ok(await p.locator('[data-reader]').evaluate(e=>e.open),'Reduced touch reader');await p.locator('[data-reader-close]').tap();ok(!await p.locator('[data-reader]').evaluate(e=>e.open),'Reduced return');await c.close();
 }
 const report={date:new Date().toISOString(),checks,result:'PASS',cases:[...cases,'direct four-world jump; manual interruption; actual wheel/touch; reader inspection/Fit; source occurrence and scene return; archive; reduced motion'],scope:'Isolated Streetwear V2 only; public routing and hardware performance not claimed'};
 await writeFile('docs/portfolio/review/menswear-directors-cut-v2/RESULTS.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser.close();}
