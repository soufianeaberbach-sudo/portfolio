/** Actual browser stills and continuous input recordings; raw output stays in /tmp. */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const review='docs/portfolio/review/menswear-directors-cut-v2',raw='/tmp/menswear-directors-cut-v2';
await mkdir(raw,{recursive:true});for(const d of ['stills','motion','presentation'])await mkdir(`${review}/${d}`,{recursive:true});
const browser=await chromium.launch(),url='http://127.0.0.1:4377/lab/menswear-v2/concept';
async function ready(p){await p.goto(url);await p.waitForFunction(()=>document.querySelector('[data-ready=true]'));await p.evaluate(()=>document.fonts.ready);}
try{
if(!process.env.MENSWEAR_V2_MOTION_ONLY){
 for(const[w,h]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[1920,1080]]){
  const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500}),p=await c.newPage();await ready(p);
  if(w===1920)await p.locator('[data-present]').click();
  for(let i=0;i<5;i++){await p.evaluate(i=>window.menswearConcept.scene(i),i);await p.waitForTimeout(90);const path=w===1920?`${review}/presentation/1920-act-${i+1}.jpg`:[1440,390].includes(w)?`${review}/stills/${w}-act-${i+1}.jpg`:`${raw}/${w}-act-${i+1}.jpg`;await p.screenshot({path,quality:93,type:'jpeg'});}
  if([1440,390].includes(w))for(const pos of[1.2,1.34,1.65,2.25,2.6,3.5]){await p.evaluate(n=>window.menswearConcept.position(n),pos);await p.screenshot({path:`${raw}/${w}-transition-${pos}.jpg`,quality:91,type:'jpeg'});}
  await c.close();console.log(`Captured ${w}×${h}`);
 }
 // Re-render the early alternatives after correcting the explicit phone studies.
 for(const[w,h]of[[1440,900],[390,844]]){const p=await browser.newPage({viewport:{width:w,height:h}});for(const t of['room','chorus','cut'])for(const after of[0,1]){await p.goto(`http://127.0.0.1:4369/${review}/previs.html?t=${t}&after=${after}`);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${raw}/${w}-alternative-${t}-${after}.jpg`,quality:90,type:'jpeg'});}await p.close();}
}
if(!process.env.MENSWEAR_V2_STILLS_ONLY)for(const[w,h,label]of[[1440,900,'desktop'],[390,844,'mobile']]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500,recordVideo:{dir:`${raw}/video`,size:{width:w,height:h}}}),p=await c.newPage();await ready(p);await p.waitForTimeout(900);
 const range=await p.locator('[data-experience]').evaluate(e=>e.scrollHeight-e.clientHeight);
 if(w>500){await p.mouse.move(w*.55,h*.6);for(let phase=0;phase<4;phase++){for(let k=0;k<40;k++){await p.mouse.wheel(0,range/160);await p.waitForTimeout(35);}await p.waitForTimeout(1000);}}
 else{const cdp=await c.newCDPSession(p);for(let phase=0;phase<4;phase++){const now=await p.locator('[data-experience]').evaluate(e=>e.scrollTop),distance=Math.min(450,range*(phase+1)/4-now+20);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:w*.5,y:680,id:1}]});for(let n=1;n<=35;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:w*.5,y:680-distance*n/35,id:1}]});await p.waitForTimeout(28);}await p.waitForTimeout(180);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(1000);}}
 await p.locator('[data-present]').click();await p.keyboard.press('Home');await p.waitForTimeout(750);
 // Remote-led full passage, then a deliberately interrupted transition.
 for(let i=0;i<4;i++){await p.keyboard.press('PageDown');await p.waitForTimeout(i===1?2100:1700);}
 await p.keyboard.press('Home');await p.keyboard.press('PageDown');await p.waitForTimeout(130);await p.keyboard.press('PageUp');await p.waitForTimeout(1100);
 await p.locator('[data-world-menu]').click();await p.waitForTimeout(400);await p.locator('[data-world-to="m-tailoring"]').click();await p.waitForFunction(()=>window.menswearConcept.snapshot().world==='m-tailoring');await p.waitForTimeout(700);
 await p.locator('[data-world-menu]').click();await p.locator('[data-world-to="m-streetwear"]').click();await p.waitForFunction(()=>window.menswearConcept.snapshot().world==='m-streetwear');await p.locator('[data-experience]').focus();await p.keyboard.press('End');await p.waitForTimeout(750);
 await p.locator('.mc-plate[data-look="statement"]').click();await p.waitForTimeout(750);await p.locator('[data-inspect]').click();await p.waitForTimeout(600);await p.locator('[data-fit]').click();await p.waitForTimeout(500);await p.locator('[data-reader-close]').click();await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);await p.waitForTimeout(650);
 await p.locator('[data-archive]').click();await p.waitForTimeout(800);await p.locator('[data-archive-look="cream"]').click();await p.waitForTimeout(700);await p.locator('[data-reader-close]').click();await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);await p.waitForTimeout(350);await p.locator('[data-archive-close]').click();await p.waitForTimeout(600);
 const video=p.video();await c.close();await video.saveAs(`${raw}/${label}.webm`);console.log(`Recorded continuous ${label}`);
}
}finally{await browser.close();}
