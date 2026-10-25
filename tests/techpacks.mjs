import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {installFonts,fontsReady} from './fixtures/fonts.mjs';
const base=process.env.PORTFOLIO_QA_URL??'http://127.0.0.1:4339';
const records=JSON.parse(await fs.readFile(new URL('../src/data/techpacks.json',import.meta.url),'utf8'));
const out=new URL('../docs/techpacks/review/browser/',import.meta.url);await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium'});
const results=[];
try{
 for(const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',acceptDownloads:true});
  await installFonts(ctx);const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/portfolio/#tech-packs');await fontsReady(page);
  await page.locator('#tech-packs[data-open]').waitFor();
  assert.equal(await page.locator('#tech-packs [data-doc]').count(),5);
  assert.equal(await page.locator('[data-demo-notice]').count(),0);
  assert.equal(await page.locator('[data-development-notice]').count(),1);
  assert.equal(await page.locator('#tech-packs .pf-doc__title').allTextContents().then(v=>v.join('|')),records.map(r=>r.title).join('|'));
  for(let i=0;i<records.length;i++){
   const r=records[i],slot=page.locator(`[data-doc="tp-0${i+1}"]`);
   const cover=slot.locator('img');await cover.scrollIntoViewIfNeeded();
   await cover.evaluate(im=>im.decode());
   assert(await cover.evaluate(im=>im.naturalWidth>0));
   assert.equal(await slot.locator('[data-open-pdf]').getAttribute('href'),r.pdfUrl);
   const response=await page.request.get(base+r.pdfUrl);
   assert.equal(response.status(),200);assert.match(response.headers()['content-type'],/application\/pdf/);
   assert((await response.body()).subarray(0,5).toString()==='%PDF-');
   const download=page.waitForEvent('download');await slot.locator('a[download]').click();
   const dl=await download;assert.equal(dl.suggestedFilename(),r.pdfUrl.split('/').pop());
   const opener=slot.locator('[data-open-pdf]');await opener.focus();await page.keyboard.press('Enter');
   const dialog=page.locator('#tech-packs [data-reader]');await dialog.waitFor({state:'visible'});
   assert.match(await dialog.locator('[data-reader-title]').textContent(),new RegExp(r.title));
   if(width<900){assert.equal(await dialog.locator('object').count(),0);assert.equal(await dialog.locator('.pf-reader-mobile a').getAttribute('href'),r.pdfUrl);}
   else assert.equal(await dialog.locator('object').getAttribute('data'),r.pdfUrl);
   if(width<900)await dialog.locator('.pf-reader-mobile img').evaluate(im=>{im.loading='eager';return im.decode();});
   if(i===0){await page.waitForTimeout(width<900?100:3000);await page.screenshot({path:new URL(`${width}-reader.png`,out).pathname});}
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   assert(await opener.evaluate(el=>document.activeElement===el));
  }
  await page.waitForTimeout(200);
  await page.locator('#tech-packs').evaluate(el=>{document.activeElement?.blur();el.scrollTop=0;});
  await page.waitForTimeout(200);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert(!overflow,'horizontal page overflow');
  await page.screenshot({path:new URL(`${width}-chapter.png`,out).pathname});
  assert.deepEqual(errors,[]);
  results.push({width,height,documents:5,previews:'decoded',pdfLinks:'HTTP 200 / application/pdf',downloads:'matching filenames',reader:'keyboard open / Escape / restored focus',pageErrors:errors,horizontalOverflow:overflow});
  await ctx.close();
 }
}finally{await browser.close();}
await fs.writeFile(new URL('results.json',out),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
