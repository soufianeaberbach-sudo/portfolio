/* Varied real licensed photographs: readable attribution without obscuring a look. */
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';import{photoReady}from'./fixtures/final-photo.mjs';
const rows=JSON.parse(await fs.readFile('src/data/womenswear-references.json','utf8')),b=await chromium.launch(),base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4389';let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++;};
try{for(const[width,height]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
 const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage();
 for(const row of rows){
  await p.goto(`${base}/portfolio/#womenswear/${row.category}/${row.id}`);await fontsReady(p);const r=p.locator(`[data-subject=${row.id}]`);await photoReady(r,0);
  check(await r.locator('[data-photo-view]').count()===1&&await r.locator('[data-ww-view]').count()===0,`${width}/${row.id}: no fabricated alternate photograph`);
  check((await r.locator('.ww-photo-credit').textContent()).includes(row.credit.photographer),`${width}/${row.id}: creator visible`);
  check(await r.locator('.ww-photo-credit a').getAttribute('href')===row.credit.sourcePage,`${width}/${row.id}: exact source credit`);
  const fits=await r.evaluate(e=>{const a=e.querySelector('[data-photo-view="0"] .ww-photo').getBoundingClientRect(),b=e.querySelector('.ww-reader-copy').getBoundingClientRect(),c=e.querySelector('.ww-reader-controls').getBoundingClientRect();return {noOverlap:a.right<=b.left||b.right<=a.left||a.bottom+6<=b.top||b.bottom+6<=a.top,copyAboveControls:b.bottom+6<=c.top,overflow:e.scrollWidth>e.clientWidth+1,creditSize:parseFloat(getComputedStyle(e.querySelector('.ww-photo-credit')).fontSize)};});
  check(fits.noOverlap&&fits.copyAboveControls&&!fits.overflow&&fits.creditSize>=10,`${width}/${row.id}: source, caption, credit and controls have clear separate space ${JSON.stringify(fits)}`);
  await r.locator('[data-rd-inspect]').click();await p.keyboard.press('+');await r.locator('[data-ww-fit]').click();check(new URL(await r.locator('[data-original-source]').getAttribute('href'),base).pathname===row.image.src,`${width}/${row.id}: whole local source remains inspectable`);await p.keyboard.press('Escape');await p.keyboard.press('Escape');
 }
 await c.close();
}console.log(`${checks} licensed-reference reader and caption checks passed`);}finally{await b.close();}
