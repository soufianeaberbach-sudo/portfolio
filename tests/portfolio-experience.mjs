/** Current owner contract: Fashion exhibition, paired real views, independent inspection,
 * native vertical traversal, immutable identities and graceful missing photographs. */
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {build} from 'esbuild';import {chromium} from 'playwright';import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4339',out=process.env.EXPERIENCE_QA_DIR||'.qa-director/portfolio-refinement/final';await fs.mkdir(out,{recursive:true});
const compiled=await build({stdin:{contents:"export{womenswear,menswear}from'./src/data/portfolio';export*from'./src/data/womenswear-collection';export*from'./src/data/menswear-collection';export*from'./src/data/final-photography';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});const d=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const wwPool=d.womenswear.categories.flatMap(c=>d.referenceCollection(c,'womenswear')),mwPool=d.menswear.categories.flatMap(c=>d.menswearPool(c.id)),pools=[...wwPool,...mwPool];
const ww=d.womenswearWorlds.flatMap(w=>d.displayedCollection(w.id,wwPool)),mw=d.menswear.categories.flatMap(c=>d.menswearDisplayed(c.id)),featured=[...ww,...mw];
let checks=0;const check=(ok,label)=>{assert.ok(ok,label);checks++;};const screenshots=[],errors=[];
const fallback=featured.filter(s=>d.exhibitionPhotograph(s).key!=='editorial').map(s=>({id:s.id,world:s.world,category:s.category,selected:d.exhibitionPhotograph(s),reason:'No dedicated Fashion photograph is supplied; retain the available actual garment view.'}));
await fs.writeFile(path.join(out,'fashion-fallbacks.json'),JSON.stringify(fallback,null,2));
const browser=await chromium.launch();
const scale=loc=>loc.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e.firstElementChild).transform).a);
const screenshot=async(page,name)=>{const p=path.join(out,name+'.png');await page.screenshot({path:p});screenshots.push(p);};
async function swipe(page,context,x,y,distance=280){const cd=await context.newCDPSession(page);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let n=1;n<=7;n++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-distance*n/7}]});await page.waitForTimeout(15);}await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cd.detach();await page.waitForTimeout(120);}
try{
 for(const[width,height]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
  const mobile=width<700,stacked=width<900,c=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/portfolio/#womenswear');await fontsReady(p);
  if(width===1440){
   check(await p.locator('[data-ww-reader],[data-mw-reader]').count()===pools.length,'all original and generated subject routes remain');
   for(const s of featured){const photo=d.exhibitionPhotograph(s),door=p.locator(s.world==='womenswear'?`.ww-rail [data-open-subject="${s.id}"]`:`[data-mw-archive-door="${s.id}"]`);check(await door.count()===1,s.id+': one featured exhibition occurrence');check(await door.getAttribute('data-exhibition-view')===photo.key,s.id+': Fashion first or explicit real-view fallback');check(await door.locator('img').getAttribute('src')===photo.image.src,s.id+': correct garment-specific photograph');}
   for(const s of pools){const r=p.locator(`[data-subject="${s.id}"]`),photos=d.finalPhotographs(s);check(await r.locator('[data-photo-panel]').count()===photos.length,s.id+': only genuine individual photographs');check(!(await r.textContent()).match(/Complete original|Full original|Combined view/i),s.id+': no redundant master view');const pair=await r.locator('[data-photo-pair] [data-photo-panel]').evaluateAll(es=>es.map(e=>e.dataset.photoPanel));if(photos.some(v=>v.key==='front')&&photos.some(v=>v.key==='back'))check(JSON.stringify(pair)===JSON.stringify(['front','back']),s.id+': Front and Back together, in order');if(!photos.some(v=>v.key==='back'))check(await r.locator('.garment-inspection__missing').count()===1,s.id+': missing Back handled without fabrication');}
  }
  for(const s of[ww[0],mw[0]]){
   await p.goto(base+`/portfolio/#${s.world}/${s.category}/${s.id}`);await fontsReady(p);const r=p.locator(`[data-subject="${s.id}"]`);await r.waitFor({state:'visible'});await r.locator('[data-photo-pair] img').evaluateAll(ims=>Promise.all(ims.map(im=>im.decode())));await p.waitForTimeout(100);
   const front=r.locator('[data-photo-panel=front] [data-photo-viewport]'),back=r.locator('[data-photo-panel=back] [data-photo-viewport]');
   const geometry=await r.locator('[data-photo-pair]').evaluate(el=>[...el.querySelectorAll('[data-photo-viewport]')].map(v=>{const p=v.firstElementChild.getBoundingClientRect(),b=v.getBoundingClientRect();return {x:b.x,y:b.y,bottom:b.bottom,width:b.width,height:b.height,photoWidth:p.width,photoHeight:p.height};}));
   check(geometry.every(g=>g.photoWidth<=g.width+1&&g.photoHeight<=g.height+1),s.world+'/'+width+': complete photo proportions at Fit');
   check(stacked?geometry[1].y>geometry[0].bottom:Math.abs(geometry[0].y-geometry[1].y)<2&&geometry[1].x>geometry[0].x,s.world+'/'+width+': responsive Front/Back order');
   if(!stacked)check(geometry.every(g=>g.y>=0&&g.bottom<=height-20),s.world+'/'+width+': both complete frames fit initial desktop screen');
   await screenshot(p,`${s.world}-reader-${width}x${height}`);
   await front.scrollIntoViewIfNeeded();await front.click();check(await scale(front)>1.5&&await scale(back)===1,s.world+'/'+width+': Front zoom is independent');
   await front.focus();await p.keyboard.press('+');const before=await front.evaluate(e=>e.firstElementChild.style.transform);await p.keyboard.press('ArrowRight');check(await front.evaluate(e=>e.firstElementChild.style.transform)!==before,s.world+'/'+width+': keyboard pans selected photograph');
   const panBefore=await front.evaluate(e=>e.firstElementChild.style.transform),dragBox=await front.boundingBox(),dragY=Math.max(100,Math.min(height-120,dragBox.y+dragBox.height/2));await p.mouse.move(dragBox.x+dragBox.width/2,dragY);await p.mouse.down();await p.mouse.move(dragBox.x+dragBox.width/2+60,dragY+20,{steps:60});await p.mouse.up();check(await scale(front)>1.5&&await scale(back)===1&&await front.evaluate(e=>e.firstElementChild.style.transform)!==panBefore,s.world+'/'+width+': slow native mouse drag pans without triggering a Fit click');
   await r.locator('[data-photo-panel=back] [data-photo-zoom=in]').click();check(await scale(front)>1&&await scale(back)>1,s.world+'/'+width+': separate Back zoom retained');
   await r.locator('[data-photo-panel=front] [data-photo-fit]').click();check(await scale(front)===1&&await scale(back)>1,s.world+'/'+width+': Fit resets only selected photograph');
   await p.keyboard.press('Escape');check(await r.isVisible()&&await scale(back)===1,s.world+'/'+width+': Escape fits before closing reader');
   if(mobile){
    await front.scrollIntoViewIfNeeded();const box=await front.boundingBox(),x=box.x+box.width/2,y=Math.max(120,Math.min(height-180,box.y+box.height/2)),cd=await c.newCDPSession(p);
    await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-35,y},{x:x+35,y}]});
    for(let n=1;n<=6;n++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-35-8*n,y},{x:x+35+8*n,y}]});await p.waitForTimeout(20);}await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cd.detach();
    check(await scale(front)>1.6&&await scale(back)===1,s.world+'/'+width+': native two-finger pinch only enlarges Front');
    await r.evaluate(e=>e.scrollTop+=100);const fitBox=await r.locator('[data-photo-panel=front] [data-photo-fit]').boundingBox();check(fitBox.y>=45&&fitBox.y+fitBox.height<height,s.world+'/'+width+': selected photo Fit control remains visible during touch inspection');
    await r.locator('[data-photo-panel=front] [data-photo-fit]').click();await front.scrollIntoViewIfNeeded();const old=await r.evaluate(e=>e.scrollTop),b=await front.boundingBox();await swipe(p,c,b.x+b.width/2,Math.min(height-100,b.y+b.height*.7),220);check(await r.evaluate(e=>e.scrollTop)>old+40,s.world+'/'+width+': normal swipe over fitted photo scrolls reader');
   }
   await p.keyboard.press('Escape');await r.waitFor({state:'hidden'});check(await p.locator('[data-world="'+s.world+'"]').getAttribute('data-open')!==null,s.world+'/'+width+': reader returns to chapter');
  }
  check(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),width+': no document overflow');await c.close();
 }
 // Real wheel and touch, no Next/Explore/world clicks or programmatic seeks.
 for(const[width,height]of[[1440,900],[390,844]]){
  const mobile=width<700,stacked=width<900,c=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/portfolio/#womenswear');await fontsReady(p);
  await p.evaluate(()=>{window.__experienceSeen=new Set();for(const selector of ['[data-world=womenswear]','[data-mw-scroll]']){const root=document.querySelector(selector);const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&entry.target.closest('[data-world]').hasAttribute('data-open'))window.__experienceSeen.add(entry.target.dataset.openSubject);},{root,threshold:.01});root.querySelectorAll('.ww-rail [data-open-subject],[data-mw-archive-door]').forEach(e=>observer.observe(e));}});
  const seen=new Set(),worlds=new Set();let gestures=0;
  while(!await p.locator('[data-world="3d-simulation"]').evaluate(e=>e.hasAttribute('data-open'))&&gestures++<320){
   const now=await p.evaluate(()=>({chapter:document.querySelector('[data-world][data-open]')?.getAttribute('data-world'),ids:[...document.querySelectorAll('.ww-rail [data-open-subject],[data-mw-archive-door]')].filter(e=>e.closest('[data-world]').hasAttribute('data-open')).filter(e=>{const r=e.getBoundingClientRect();return r.bottom>100&&r.top<innerHeight-80;}).map(e=>e.dataset.openSubject)}));worlds.add(now.chapter);now.ids.forEach(id=>seen.add(id));
   if(mobile)await swipe(p,c,width-10,height-100,Math.min(450,height*.52));else{await p.mouse.move(width-16,height/2);await p.mouse.wheel(0,650);await p.waitForTimeout(85);}
  }
  check(worlds.has('womenswear')&&worlds.has('menswear'),width+': native scroll crosses fashion chapters');
  check(await p.locator('[data-world="3d-simulation"]').evaluate(e=>e.hasAttribute('data-open')),width+': continuous scrolling reaches Development');
  (await p.evaluate(()=>[...window.__experienceSeen])).forEach(id=>seen.add(id));const missed=featured.filter(s=>!seen.has(s.id));await fs.writeFile(path.join(out,`native-scroll-${width}.json`),JSON.stringify({gestures,seen:[...seen],chapters:[...worlds],missing:missed.map(s=>s.id)},null,2));check(!missed.length,width+': all 80 garments seen in vertical flow; missing '+missed.map(s=>s.id).join(','));check(await p.locator('[data-ww-reader]:not([hidden]),[data-mw-reader]:not([hidden])').count()===0,width+': exhibition gestures do not accidentally open garments');
  await fs.writeFile(path.join(out,`native-scroll-${width}.json`),JSON.stringify({gestures,seen:[...seen],chapters:[...worlds]},null,2));await c.close();
 }
 check(!errors.length,'no browser runtime errors: '+errors.join(';'));
 await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({checks,featured:80,fashion:80-fallback.length,fallbacks:fallback.length,viewports:6,independentZoom:true,nativeTouchPinch:true,nativeContinuousScroll:true,screenshots,errors},null,2));console.log(checks+' Portfolio experience acceptance checks passed');
}finally{await browser.close();}
