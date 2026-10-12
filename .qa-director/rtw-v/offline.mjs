import {chromium} from 'playwright';import path from 'node:path';import fs from 'node:fs/promises';
const b=await chromium.launch({args:['--no-sandbox']}),results=[];
for(const[width,height]of [[1440,900],[390,844]]){
 const c=await b.newContext({viewport:{width,height},hasTouch:width<768,isMobile:width<768}),p=await c.newPage(),requests=[],errors=[];p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('file://'+path.resolve('docs/portfolio/review/rtw-art-direction-v/interactive-proof.html'));await p.waitForFunction(()=>window.rtwV?.ready);await p.evaluate(()=>document.fonts.ready);await p.locator('[data-enter]').click();await p.waitForTimeout(700);
 for(const k of ['B','C','D','E']){await p.locator(`[data-go="${k}"]`).click();await p.waitForFunction(k=>document.querySelector('[data-v]').dataset.settled===k,k);if(k==='C'){await p.locator('[data-inspect]').click();await p.waitForFunction(()=>document.querySelector('dialog').dataset.ready==='true');await p.screenshot({path:`.qa-director/rtw-v/${width}-offline-inspection.png`});await p.keyboard.press('Escape');}}
 await p.locator('[data-return]').click();await p.waitForTimeout(700);const result={width,requests,errors,returned:await p.locator('[data-enter]').evaluate(e=>e===document.activeElement),fonts:await p.evaluate(()=>['Archivo','Inter','JetBrains Mono'].map(f=>[f,document.fonts.check(`12px "${f}"`)]))};results.push(result);await c.close();
 if(requests.length||errors.length||!result.returned||result.fonts.some(([,ready])=>!ready))throw Error(JSON.stringify(result));
}
await b.close();console.log(results);await fs.writeFile('.qa-director/rtw-v/offline-results.json',JSON.stringify(results,null,2));
