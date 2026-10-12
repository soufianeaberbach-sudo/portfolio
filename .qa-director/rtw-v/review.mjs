import {chromium} from 'playwright';import {installFonts,fontsReady} from '../../tests/fixtures/fonts.mjs';import fs from 'node:fs/promises';import sharp from 'sharp';
const browser=await chromium.launch({args:['--no-sandbox']});
const out='.qa-director/rtw-v';const errors=[];
for(const [w,h]of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
 const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<768,isMobile:w<768});await installFonts(context);const page=await context.newPage();page.on('pageerror',e=>errors.push(`${w}: ${e.message}`));
 await page.goto('http://127.0.0.1:4349/lab/rtw-v/journey/');await fontsReady(page);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await page.waitForFunction(()=>!!window.rtwV);
 await page.screenshot({path:`${out}/${w}-exhibition.png`});await page.locator('[data-enter]').click();await page.waitForTimeout(700);
 for(const k of ['A','B','C','D','E']){await page.locator(`[data-go="${k}"]`).click();await page.waitForFunction(k=>document.querySelector('[data-v]').dataset.settled===k,k);await page.waitForTimeout(80);await page.evaluate(()=>document.activeElement.blur());await page.screenshot({path:`${out}/${w}-${k}.png`});}
 await context.close();
}
await browser.close();console.log({errors});await fs.writeFile(`${out}/errors.json`,JSON.stringify(errors));
for(const [w,h]of [[1440,900],[390,844]]){
 const tw=w===1440?720:w,th=h*tw/w,cols=w===1440?2:5,rows=Math.ceil(5/cols),layers=[];
 for(const [i,k]of ['A','B','C','D','E'].entries()){const x=(i%cols)*tw,y=Math.floor(i/cols)*(th+30);layers.push({input:Buffer.from(`<svg width="${tw}" height="30"><rect width="100%" height="100%" fill="#f3f0e9"/><text x="15" y="20" font-family="monospace" font-size="12">${k} / ${['LOOK','SKETCH — CC0','CONSTRUCTION — MoMu','3D — MARVELOUS DESIGNER','RESULT'][i]}</text></svg>`),left:x,top:y});layers.push({input:await sharp(`${out}/${w}-${k}.png`).resize(tw,th).toBuffer(),left:x,top:y+30});}
 await sharp({create:{width:tw*cols,height:rows*(th+30),channels:3,background:'white'}}).composite(layers).jpeg({quality:93}).toFile(`${out}/${w}-comparison.jpg`);
}
