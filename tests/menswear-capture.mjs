/** Reproducible actual-Portfolio review capture; no synthetic animation frames. */
import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import{mkdirSync,writeFileSync}from'node:fs';
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4393',out=process.env.MENSWEAR_REVIEW_DIR||'.qa-director/menswear-production/final';mkdirSync(out,{recursive:true});const b=await chromium.launch(),worlds=process.env.MENSWEAR_CAPTURE_WORLD?[process.env.MENSWEAR_CAPTURE_WORLD]:['m-streetwear','m-activewear','m-rtw','m-tailoring'];
const viewports=[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[1920,1080]],results=[];
try{for(const[width,height]of(process.env.MENSWEAR_CAPTURE_WIDTH?viewports.filter(v=>String(v[0])===process.env.MENSWEAR_CAPTURE_WIDTH):viewports)){
 const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/portfolio/#menswear/m-streetwear');await fontsReady(p);
 for(const world of worlds){
  await p.evaluate(id=>location.hash=`#menswear/${id}`,world);await p.waitForTimeout(300);
  await p.locator('[data-mw-film][data-current] [data-mw-actor] img').evaluateAll(async ims=>Promise.all(ims.map(im=>im.decode().catch(()=>{}))));
  for(let n=0;n<5;n++){await p.locator(`[data-mw-scene="${n}"]`).click();await p.waitForTimeout(1150);await p.screenshot({path:`${out}/${world}-${n}-${width}.jpg`,quality:93});}
  await p.locator('[data-mw-archive-open]').click();await p.waitForTimeout(200);await p.screenshot({path:`${out}/${world}-archive-${width}.jpg`,quality:90});
  const source=p.locator('[data-mw-film][data-current] [data-mw-archive-door]').first();await source.click();await p.waitForTimeout(750);await p.screenshot({path:`${out}/${world}-reader-${width}.jpg`,quality:90});
  await p.keyboard.press('Escape');await p.waitForTimeout(650);results.push({width,height,world,sourceFocus:await source.evaluate(e=>e===document.activeElement),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
 if(width===1440||width===390){await p.goto(base+'/portfolio/#womenswear/activewear');await p.waitForTimeout(1000);await p.screenshot({path:`${out}/protected-womenswear-${width}.jpg`,quality:90});}
 if(errors.length)throw Error(errors.join('; '));await c.close();
}writeFileSync(out+'/capture-results.json',JSON.stringify(results,null,2));console.log(`${results.length} world/viewport reviews captured`);}finally{await b.close();}
