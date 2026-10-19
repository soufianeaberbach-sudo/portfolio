/** Reproducible browser evidence. Raw captures/videos stay outside Git. */
import{chromium}from'playwright';import{mkdir}from'node:fs/promises';
const out=process.env.MENSWEAR_CAPTURE_RAW??'/tmp/menswear-final',review='docs/portfolio/review/menswear-cinematic-concept';await mkdir(out,{recursive:true});await mkdir(`${review}/stills`,{recursive:true});await mkdir(`${out}/video`,{recursive:true});
const browser=await chromium.launch(),url='http://127.0.0.1:4357/lab/menswear/concept';const worlds=['m-streetwear','m-activewear','m-rtw','m-tailoring'];
async function ready(p){await p.goto(url);await p.waitForFunction(()=>document.querySelector('[data-ready=true]'));await p.evaluate(()=>document.fonts.ready);}
try{
if(!process.env.MENSWEAR_CAPTURE_ONLY_MOTION)for(const[w,h]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500}),p=await c.newPage();await ready(p);
 for(const world of worlds){await p.evaluate(w=>window.menswearConcept.jump(w),world);for(let i=0;i<5;i++){
  await p.evaluate(i=>window.menswearConcept.scene(i),i);await p.waitForTimeout(70);await p.screenshot({path:`${out}/${w}-${world}-${i}.jpg`,type:'jpeg',quality:91});
  if([1440,390].includes(w)&&(i===0||i===4||world==='m-streetwear'&&i===2||world==='m-activewear'&&i===2))await p.screenshot({path:`${review}/stills/${w}-${world}-${i}.jpg`,type:'jpeg',quality:91});
 }}
 if([1440,390].includes(w)){await p.evaluate(()=>window.menswearConcept.jump('m-streetwear'));await p.locator('[data-world-menu]').click();await p.screenshot({path:`${review}/stills/${w}-world-jump.jpg`,type:'jpeg',quality:91});await p.keyboard.press('Escape');await p.locator('[data-archive]').click();await p.screenshot({path:`${review}/stills/${w}-archive.jpg`,type:'jpeg',quality:91});await p.locator('[data-archive-look="statement"]').click();await p.waitForTimeout(600);await p.screenshot({path:`${review}/stills/${w}-reader.jpg`,type:'jpeg',quality:91});await p.locator('[data-inspect]').click();await p.screenshot({path:`${review}/stills/${w}-inspection.jpg`,type:'jpeg',quality:91});}
 await c.close();console.log(`Captured ${w}×${h}: four worlds / five authored keyframes`);
}
for(const[w,h,label]of[[1440,900,'desktop'],[390,844,'mobile']]){
 const c=await browser.newContext({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500,recordVideo:{dir:`${out}/video`,size:{width:w,height:h}}}),p=await c.newPage();await ready(p);await p.waitForTimeout(1100);
 const range=await p.locator('[data-experience]').evaluate(e=>e.scrollHeight-e.clientHeight);
 if(label==='desktop'){
  await p.mouse.move(w-12,h*.6);for(let phase=0;phase<4;phase++){for(let k=0;k<20;k++){await p.mouse.wheel(0,range/80);await p.waitForTimeout(15);}await p.waitForTimeout(850);}
 }else{
  const cdp=await c.newCDPSession(p);for(let phase=0;phase<4;phase++){const current=await p.locator('[data-experience]').evaluate(e=>e.scrollTop),distance=Math.min(470,range*(phase+1)/4-current+20);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:w-6,y:680,id:1}]});for(let step=1;step<=25;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:w-6,y:680-distance*step/25,id:1}]});await p.waitForTimeout(18);}await p.waitForTimeout(180);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(850);}
 }
 await p.waitForTimeout(700);await p.locator('[data-present]').click();await p.keyboard.press('Home');await p.waitForTimeout(650);
 await p.keyboard.press('PageDown');await p.waitForTimeout(900);await p.keyboard.press('PageDown');await p.waitForTimeout(180);await p.keyboard.press('PageUp');await p.waitForTimeout(900);await p.keyboard.press('PageDown');await p.waitForTimeout(1100);
 await p.locator('[data-world-menu]').click();await p.waitForTimeout(500);await p.locator('[data-world-to="m-tailoring"]').click();await p.waitForFunction(()=>window.menswearConcept.snapshot().world==='m-tailoring');await p.waitForTimeout(800);
 await p.locator('.mc-plate[data-look="steel"]').click();await p.waitForTimeout(900);await p.locator('[data-inspect]').click();await p.waitForTimeout(500);await p.locator('[data-inspection]').press('+');await p.locator('[data-inspection]').press('ArrowRight');await p.waitForTimeout(650);await p.locator('[data-fit]').click();await p.waitForTimeout(500);await p.locator('[data-reader-close]').click();await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);await p.waitForTimeout(800);
 await p.locator('[data-archive]').click();await p.waitForTimeout(800);await p.locator('[data-archive-look="ivory"]').click();await p.waitForTimeout(750);await p.locator('[data-reader-close]').click();await p.waitForFunction(()=>!document.querySelector('[data-reader]').open);await p.waitForTimeout(450);await p.locator('[data-archive-close]').click();await p.waitForTimeout(500);
 await p.locator('[data-experience]').focus();await p.keyboard.press('Escape');await p.locator('[data-world-menu]').click();await p.locator('[data-world-to="m-streetwear"]').click();await p.waitForFunction(()=>window.menswearConcept.snapshot().world==='m-streetwear');await p.locator('[data-experience]').focus();await p.keyboard.press('End');await p.waitForTimeout(1100);
 const video=p.video();await c.close();await video.saveAs(`${out}/${label}.webm`);console.log(`Recorded continuous ${label} sequence`);
}
}finally{await browser.close();}
