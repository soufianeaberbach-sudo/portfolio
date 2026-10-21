/** Owner acceptance: four + four worlds, original routes and genuinely native continuity. */
import assert from'node:assert/strict';import{chromium}from'playwright';import{build}from'esbuild';import{mkdirSync,writeFileSync}from'node:fs';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
const out=process.env.CORRECTION_QA_DIR||'.qa-director/correction/acceptance';mkdirSync(out,{recursive:true});
const bundled=await build({stdin:{contents:"export{womenswear}from'./src/data/portfolio';export*from'./src/data/womenswear-collection';export*from'./src/data/menswear-collection';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const data=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const pools=[...data.womenswear.categories.flatMap(c=>data.referenceCollection(c,'womenswear')),...['m-streetwear','m-activewear','m-rtw','m-tailoring'].flatMap(data.menswearPool)];
let checks=0;const records=[];function check(ok,label){assert(ok,label);checks++;records.push(label);}
check(pools.length===108&&new Set(pools.map(s=>s.id)).size===108,'108 unchanged unique subject identities');
const ww=['casualwear','activewear','evening','swimwear'],mw=['m-streetwear','m-activewear','m-rtw','m-tailoring'];
const labels=['Casualwear','Activewear','Occasionwear','Swimwear'];
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4431',b=await chromium.launch();
const visible=async(p,cat)=>p.waitForFunction(cat=>document.querySelector('[data-mw-film][data-current]')?.dataset.mwFilm===cat,cat);
const native=async(p,c,width,height)=>{if(width>500){await p.mouse.move(width-30,height*.5);await p.mouse.wheel(0,400);await p.waitForTimeout(80);}else{const cd=await c.newCDPSession(p),x=width-18,y=height*.77;await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let n=1;n<=8;n++){await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-height*.46*n/8}]});await p.waitForTimeout(14);}await p.waitForTimeout(75);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cd.detach();await p.waitForTimeout(65);}};
try{
 const c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();await p.goto(base+'/portfolio/#womenswear');await fontsReady(p);
 check(JSON.stringify(await p.locator('[data-ww-exhibition]').evaluateAll(es=>es.map(e=>e.dataset.wwExhibition)))===JSON.stringify(ww),'exactly four real Womenswear worlds, correct order');
 check(JSON.stringify(await p.locator('[data-act-link] .pf-act__label').allTextContents())===JSON.stringify(labels),'exact four Womenswear public labels');
 const archiveIds=[];for(const cat of[...ww,...mw]){const doors=p.locator(ww.includes(cat)?`[data-ww-archive=${cat}] .ww-rail a`:`[data-mw-film=${cat}] [data-mw-archive-door]`),ids=await doors.evaluateAll(es=>es.map(e=>e.dataset.openSubject));check(ids.length===10&&new Set(ids).size===10,cat+': ten primary unique looks');archiveIds.push(...ids);}
 check(archiveIds.length===80&&new Set(archiveIds).size===80,'80 unique primary displayed identities');
 check(await p.locator('[data-all-references] [data-reference-link]').count()===58,'discreet full Womenswear reference access');
 for(const s of pools){await p.evaluate(s=>location.hash=`#${s.world}/${s.category}/${s.id}`,s);await p.waitForFunction(id=>document.querySelector(`[data-subject="${id}"]:not([hidden])`),s.id);const r=p.locator(`[data-subject="${s.id}"]:not([hidden])`);check(await r.getAttribute('data-of')===s.category,`${s.id}: immutable source category`);check(await r.locator('img').first().getAttribute('src')===s.views[0].image.src,`${s.id}: original reader image at historical URL`);}
 for(const alias of['rtw','streetwear','casualwear']){await p.evaluate(alias=>location.hash='#womenswear/'+alias,alias);await p.waitForTimeout(120);check(await p.locator('[data-act-name]').textContent()==='Casualwear',alias+': arrives in Casualwear');check((await p.locator('[data-act-count]').textContent()).trim()==='01 / 04',alias+': four-world counter');}
 await p.goto(base+'/portfolio/#womenswear/rtw/rtw-ref-01');await p.keyboard.press('Escape');await p.waitForTimeout(150);check(await p.evaluate(()=>location.hash)==='#womenswear/casualwear','excluded historical garment closes into correct editorial context');check(await p.locator('[data-act-toggle]').evaluate(e=>e===document.activeElement),'historical no-source return focus');
 await p.locator('[data-all-references] summary').click();const historicalDoor=p.locator('[data-reference-link][data-open-subject=rtw-ref-01]');await historicalDoor.scrollIntoViewIfNeeded();const historicalTop=await p.locator('[data-world=womenswear]').evaluate(e=>e.scrollTop);await historicalDoor.click();await p.waitForFunction(()=>!!document.querySelector('[data-subject=rtw-ref-01]:not([hidden])'));await p.keyboard.press('Escape');await p.waitForTimeout(100);check(await historicalDoor.evaluate(e=>e===document.activeElement),'full-reference list restores exact text occurrence');check(Math.abs(await p.locator('[data-world=womenswear]').evaluate(e=>e.scrollTop)-historicalTop)<2,'full-reference list preserves source scroll');
 await c.close();
 for(const[width,height]of[[1440,900],[390,844]])for(const chapter of['womenswear','menswear']){
 const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,recordVideo:{dir:out,size:{width,height}}});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+`/portfolio/#${chapter}`);await fontsReady(p);await p.waitForTimeout(450);
 const worlds=chapter==='womenswear'?ww:mw;const seen=new Set();let gestures=0;
 // No category links or programmatic scrolling in this entire traversal.
 while(seen.size<4&&gestures++<170){const current=await p.evaluate(chapter=>chapter==='menswear'?document.querySelector('[data-mw-film][data-current]')?.dataset.mwFilm:document.querySelector('[data-act-link][aria-current]')?.dataset.actLink,chapter);if(worlds.includes(current))seen.add(current);await native(p,c,width,height);}
 check(JSON.stringify([...seen])===JSON.stringify(worlds),`${width}/${chapter}: real ${width<500?'touch':'wheel'} traverses four worlds in order, without links`);
 check(await p.locator(chapter==='menswear'?'[data-mw-reader]:not([hidden])':'[data-ww-reader]:not([hidden])').count()===0,'native film gestures do not open photographs');
 if(chapter==='menswear'){
 check(await p.locator('[data-mw-experience]').count()===1,'one native Menswear scroller, no nested world scrollers');
 check(await p.locator('[data-mw-film]').evaluateAll(es=>es.every(e=>!e.hidden&&getComputedStyle(e).display!=='none')),'four Menswear films remain in flow');
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link=m-streetwear]').click();await visible(p,'m-streetwear');
 const observed=[];await p.exposeFunction('observeWorld',id=>observed.push(id));await p.evaluate(()=>new MutationObserver(()=>window.observeWorld(document.querySelector('[data-mw-film][data-current]')?.dataset.mwFilm)).observe(document.querySelector('[data-mw-scroll]'),{subtree:true,attributes:true,attributeFilter:['data-current']}));
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link=m-tailoring]').click();await visible(p,'m-tailoring');check(!observed.includes('m-activewear')&&!observed.includes('m-rtw'),'direct jump does not play intermediate worlds');
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link=m-streetwear]').click();
 await p.locator('[data-mw-present]').click();await p.locator('[data-mw-scene="4"]').click();await p.waitForFunction(()=>document.querySelector('[data-mw-live]').textContent.endsWith('Open / compact'));
 await p.locator('[data-mw-next]').click();await visible(p,'m-activewear');check(await p.evaluate(()=>location.hash)==='#menswear/m-activewear','presentation Next crosses world via router');await p.locator('[data-mw-prev]').click();await visible(p,'m-streetwear');check(await p.locator('[data-mw-scene="4"]').getAttribute('aria-pressed')==='true','presentation Previous crosses to prior finale');await p.keyboard.press('Escape');check(await p.locator('[data-mw-world]').getAttribute('data-present')===null,'safe Presentation exit');
 await native(p,c,width,height);check(await p.locator('[data-mw-scroll]').evaluate(e=>e.scrollTop>0),'native Explore resumes after presentation');
 await p.locator('[data-mw-worlds-toggle]').click();await p.locator('[data-mw-world-link=m-tailoring]').click();
 for(let n=0;n<60&&await p.evaluate(()=>location.hash.startsWith('#menswear'));n++)await native(p,c,width,height);
 check(await p.evaluate(()=>location.hash)==='#3d-simulation','continued native gesture after Tailoring reaches Pattern Development without Next World');
 }
 check(errors.length===0,'no runtime errors '+errors.join(';'));writeFileSync(`${out}/${chapter}-${width}-video.txt`,await p.video().path());await c.close();console.log(chapter,width,'native continuity recorded');
 }
 writeFileSync(out+'/RESULTS.json',JSON.stringify({executedUTC:new Date().toISOString(),checks,records},null,2));console.log(checks+' owner-contract acceptance checks passed');
}finally{await b.close();}
