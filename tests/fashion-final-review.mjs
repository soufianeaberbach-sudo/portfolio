/** Actual Portfolio review. Raw captures stay ignored; publish only the selected evidence. */
import assert from'node:assert/strict';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import{mkdirSync,writeFileSync}from'node:fs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4431',out=process.env.PHOTO_REVIEW_DIR||'.qa-director/correction/final';mkdirSync(out,{recursive:true});const b=await chromium.launch(),results=[];
const names={casualwear:'Casualwear',activewear:'Activewear',evening:'Occasionwear',swimwear:'Swimwear','m-streetwear':'Streetwear','m-activewear':'Activewear','m-rtw':'Casualwear','m-tailoring':'Tailoring & Outerwear'};
try{for(const[width,height]of[[1440,900],[390,844],[1366,768],[1024,768],[768,1024],[430,932]].filter(v=>!process.env.PHOTO_REVIEW_WIDTH||String(v[0])===process.env.PHOTO_REVIEW_WIDTH)){
 const video=false,c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,...(video?{recordVideo:{dir:out,size:{width,height}}}:{})});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const[cat,name]of Object.entries(names)){
 const ww=!cat.startsWith('m-'),world=ww?'womenswear':'menswear';await p.goto(`${base}/portfolio/#${world}/${cat}`);await fontsReady(p);await p.waitForTimeout(450);
 const root=p.locator(ww?`[data-ww-exhibition=${cat}]`:`[data-mw-film=${cat}]`),doors=root.locator(ww?'.ww-rail a':'[data-mw-archive-door]');assert.equal(await doors.count(),10,cat+' ten archive links');
 if(ww){assert.equal(await p.locator('[data-act-name]').textContent(),name,'cold category arrival');assert(await root.locator('[data-ww-title]').isVisible());}
 else{assert.equal(await p.locator('[data-mw-world-link][aria-current=page] span').textContent(),name);}
 for(const[n,at]of[0,.58,1].entries()){
 if(ww)await root.evaluate((r,at)=>{const w=r.closest('[data-world]'),camera=r.querySelector('[data-ww-camera]'),stage=r.querySelector('[data-ww-stage]'),bar=w.querySelector('.pf-act__bar').offsetHeight;w.scrollTop+=camera.getBoundingClientRect().top-bar+(camera.offsetHeight-stage.offsetHeight)*at;},at);
 else await p.locator(`[data-mw-scene="${n*2}"]`).click();
 await p.waitForTimeout(ww?500:1100);await root.locator('img').evaluateAll(ims=>Promise.all(ims.filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;}).map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));
 await p.screenshot({path:`${out}/${cat}-${n}-${width}.jpg`,quality:92});
 assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),cat+' viewport overflow');
 }
 if(video){ // Native wheel input through the actual camera, separately from precisely positioned stills.
 if(ww)await root.evaluate(r=>{const w=r.closest('[data-world]');w.scrollTop+=r.querySelector('[data-ww-camera]').getBoundingClientRect().top-w.querySelector('.pf-act__bar').offsetHeight;});
 else{await p.locator('[data-mw-scene="0"]').click();await p.waitForTimeout(1050);}
 await p.mouse.move(width*.45,height*.45);for(let n=0;n<9;n++){await p.mouse.wheel(0,height*.35);await p.waitForTimeout(160);}
 }
 if(ww)await root.locator('[data-ww-archive]').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));else await p.locator('[data-mw-archive-open]').click();await p.waitForTimeout(150);await p.screenshot({path:`${out}/${cat}-archive-${width}.jpg`,quality:90});
 const source=doors.first();await source.scrollIntoViewIfNeeded();await source.click();await p.waitForTimeout(750);const reader=p.locator(ww?'[data-ww-reader]:not([hidden])':'[data-mw-reader]:not([hidden])');await reader.locator('img').first().evaluate(i=>i.decode());await p.screenshot({path:`${out}/${cat}-reader-${width}.jpg`,quality:92});
 const views=reader.locator(ww?'[data-ww-view]':'[data-mw-view]');if(await views.count()>1){await views.nth(1).click();await p.waitForTimeout(150);}
 await reader.locator('[data-rd-inspect]').click();await p.keyboard.press('+');await p.waitForTimeout(100);await p.keyboard.press('Escape');await reader.locator('[data-subject-close]').click();await p.waitForTimeout(700);const focus=await source.evaluate(e=>e===document.activeElement);assert(focus,cat+' actual archive occurrence focus');await p.screenshot({path:`${out}/${cat}-return-${width}.jpg`,quality:90});await root.locator(ww?'.ww-handoff':'.mw-handoff').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${cat}-handoff-${width}.jpg`,quality:90});
 const ids=await doors.evaluateAll(es=>es.map(e=>e.dataset.openSubject));assert.equal(new Set(ids).size,10);results.push({width,height,category:cat,label:name,archive:ids,sourceFocus:focus,overflow:false});
 }
 assert.equal(errors.length,0,errors.join('; '));if(video)writeFileSync(`${out}/${width}-video.txt`,await p.video().path());await c.close();console.log(width+' complete fashion review');
}writeFileSync(out+'/QA-RESULTS.json',JSON.stringify(results,null,2));}finally{await b.close();}
