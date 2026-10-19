/** Serve the repository root on 4369; all non-local browser requests are blocked. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const raw='/tmp/menswear-directors-cut-v2',record=!!process.env.MENSWEAR_V2_VERIFICATION_VIDEO;
await mkdir(`${raw}/verification`,{recursive:true});
const b=await chromium.launch(),c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,...(record?{recordVideo:{dir:`${raw}/verification`,size:{width:430,height:932}}}:{})});
let checks=0;const ok=(v,message)=>{assert.ok(v,message);checks++;};
try{
 await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const p=await c.newPage();await p.goto('http://127.0.0.1:4369/docs/portfolio/review/menswear-directors-cut-v2/index.html');await p.waitForFunction(()=>document.querySelector('[data-ready=true]'));await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>window.menswearConcept.scene(4));await p.waitForTimeout(450);const source=p.locator('.mc-plate[data-look="statement"]');await source.tap();await p.waitForTimeout(100);
 ok(await p.locator('[data-reader]').evaluate(e=>e.open),'Offline original source reader');const clone=p.locator('.mc-transfer');ok(await clone.count()===1,'Measured crop expansion clone');
 const shape=await clone.evaluate(e=>{const r=e.getBoundingClientRect();return Math.abs(r.width/r.height-e.naturalWidth/e.naturalHeight);});ok(shape<.01,'Native proportions during crop expansion');
 await p.waitForTimeout(650);await p.locator('[data-reader-close]').tap();await p.waitForTimeout(80);await p.setViewportSize({width:430,height:932});await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);await p.waitForTimeout(350);
 ok(await source.evaluate(e=>e===document.activeElement),'Source focus survives resized return and repaint');ok(await clone.count()===0,'Interrupted clone cleaned up');
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('[data-present]').click();await p.locator('[data-experience]').focus();await p.keyboard.press('Home');await p.waitForTimeout(450);await p.keyboard.press('End');ok(await p.evaluate(()=>window.menswearConcept.snapshot().position===4),'Reduced motion direct held frame');await p.waitForTimeout(450);
 await p.evaluate(()=>Object.defineProperty(document.querySelector('[data-concept]'),'requestFullscreen',{value:()=>Promise.reject(new Error('denied'))}));await p.locator('[data-fullscreen]').click();ok(await p.evaluate(()=>window.menswearConcept.snapshot().present),'Fullscreen denial retains in-page mode');
 await p.locator('[data-world-menu]').click();await p.locator('[data-world-to="m-tailoring"]').click();await p.waitForFunction(()=>window.menswearConcept.snapshot().world==='m-tailoring');ok(await p.evaluate(()=>window.menswearConcept.snapshot().position===0),'Direct world jump without traversal');await p.waitForTimeout(550);
 const video=p.video();await c.close();if(record)await video.saveAs(`${raw}/verification.webm`);
 const result={date:new Date().toISOString(),checks,result:'PASS',scope:'No external requests; crop registration; resized interrupted focus; reduced motion; fullscreen refusal; direct jump'};
 await writeFile('docs/portfolio/review/menswear-directors-cut-v2/OFFLINE.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await b.close();}
