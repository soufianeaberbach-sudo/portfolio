import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { installFonts, fontsReady } from './fixtures/fonts.mjs';
const base = process.env.TECHPACK_QA_URL || 'http://127.0.0.1:4339';
const output = process.env.TECHPACK_QA_OUTPUT || '.qa-director/techpacks';
await fs.mkdir(output,{recursive:true});
const manifest=JSON.parse(await fs.readFile('docs/techpack-audit-2026-10-25/document-manifest.json','utf8'));
const titles=['Cropped Two-Pocket Shirt','High-Rise Stripe Legging','Gathered Bust Slip Maxi Dress','Flat-Front Tapered Trouser','Clean-Front Pullover Hoodie'];
const expected=JSON.parse(await fs.readFile('docs/techpack-audit-2026-10-25/pdf-verification.json','utf8'));
const hashes=new Map(expected.map(d=>[d.filename,d.sha256]));
const sha=b=>createHash('sha256').update(b).digest('hex');
const assetResults=[];
for (const [i,doc] of manifest.entries()) {
 const pdfPath=new URL(doc.pdfUrl).pathname;
 const response=await fetch(base+pdfPath);
 assert.equal(response.status,200,pdfPath);assert.match(response.headers.get('content-type'),/application\/pdf/);
 const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
 assert.equal((bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,10,doc.styleCode+' PDF pages');
 assert.equal(sha(bytes),hashes.get(pdfPath.split('/').pop()),doc.styleCode+' published PDF hash');
 const preview=await fetch(base+new URL(doc.previewUrl).pathname);assert.equal(preview.status,200);assert.match(preview.headers.get('content-type'),/image\/webp/);
 const dir='public/techpacks/pages/'+doc.styleCode;const pages=(await fs.readdir(dir)).filter(p=>p.endsWith('.png')).sort();assert.equal(pages.length,10);
 for (const page of pages) {const b=await fs.readFile(path.join(dir,page));assert.equal(b.readUInt32BE(16),3508);assert.equal(b.readUInt32BE(20),2480);}
 assetResults.push({style:doc.styleCode,pdfBytes:bytes.length,pages:10,previewStatus:200});
}
const browser=await chromium.launch({headless:true});
const screenshots=[];
try {
 for (const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]) {
  const mobile=width<600;
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,acceptDownloads:true,reducedMotion:'reduce'});
  await installFonts(context);const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let pdfRequests=[];page.on('request',r=>{if(/\.pdf(?:$|\?)/i.test(r.url()))pdfRequests.push(r.url());});
  await page.goto(base+'/portfolio/#tech-packs',{waitUntil:'load'});await fontsReady(page);
  const chapter=page.locator('[data-world="tech-packs"]');await page.waitForFunction(()=>document.querySelector('[data-world="tech-packs"]')?.hasAttribute('data-open'));
  await page.waitForTimeout(500);
  assert.deepEqual(await chapter.locator('.pf-doc__title').allTextContents(),titles);
  assert.equal(await chapter.locator('.pf-doc').count(),5);
  assert.equal(pdfRequests.length,0,'PDFs must not preload');
  for (let i=0;i<5;i++) {
   const row=chapter.locator('.pf-doc').nth(i),doc=manifest[i];
   assert.equal(await row.getAttribute('data-style-code'),doc.styleCode);
   assert.equal(await row.getAttribute('data-document-status'),'development-sample');
   assert.match(await row.locator('.pf-doc__line').first().textContent(),new RegExp((i<3?'Womenswear':'Menswear')+'.*10 pages'));
   assert.match(await row.locator('img').getAttribute('alt'),new RegExp(doc.styleCode));
   const href=await row.locator('[data-doc-open-link]').getAttribute('href');
   assert.equal(href,new URL(doc.pdfUrl).pathname);assert.equal(await row.locator('[data-doc-download]').getAttribute('href'),href);
  }
  const shot=path.join(output,`chapter-${width}x${height}.png`);await page.screenshot({path:shot});screenshots.push(shot);
  if ([1440,390].includes(width)) {
   for (let i=0;i<5;i++) {
    const row=chapter.locator('.pf-doc').nth(i),doc=manifest[i];await row.scrollIntoViewIfNeeded();
    const position=await chapter.evaluate(e=>e.scrollTop);
    await row.locator('[data-open-pdf]').click();
    const reader=page.locator('[data-reader]');await page.waitForFunction(()=>document.querySelector('[data-reader]')?.open);
    assert.equal((await reader.locator('[data-reader-title]').textContent()).trim(),titles[i]);
    const expected=new URL(doc.pdfUrl).pathname;
    assert.equal(await reader.locator('[data-reader-tab]').getAttribute('href'),expected);
    assert.equal(await reader.locator('[data-reader-download]').getAttribute('href'),expected);
    if (mobile) {assert.equal(await reader.locator('.pf-reader-mobile').count(),1);assert.equal(await reader.locator('object').count(),0);assert.equal(await reader.locator('.pf-reader-mobile a:not([download])').getAttribute('href'),expected);}
    else {assert.equal(await reader.locator('object').getAttribute('data'),expected);assert.equal(await reader.locator('object').getAttribute('type'),'application/pdf');}
    const tools=await reader.locator('[data-reader-close]').boundingBox();assert.ok(tools.x>=0 && tools.x+tools.width<=width+1,'close button must remain in viewport');
    const [download]=await Promise.all([page.waitForEvent('download'),reader.locator(mobile ? '[data-reader-mobile-download]' : '[data-reader-download]').click()]);
    assert.equal(download.suggestedFilename(),expected.split('/').pop());
    console.log(`${width}px ${doc.styleCode}: reader and download OK`);
    const saved=path.join(output,download.suggestedFilename());await download.saveAs(saved);assert.equal(sha(await fs.readFile(saved)),hashes.get(download.suggestedFilename()),'download must equal verified PDF');
    if (i===0 || i===4) {const s=path.join(output,`reader-${doc.styleCode}-${width}.png`);await page.screenshot({path:s});screenshots.push(s);}
    await page.keyboard.press('Escape');await page.waitForTimeout(200);assert.equal(await reader.isVisible(),false);assert.equal(await reader.locator('object,iframe').count(),0);
    assert.ok(Math.abs((await chapter.evaluate(e=>e.scrollTop))-position)<3,'reader closes to original document position');
   }
  }
  assert.deepEqual(errors,[]);await context.close();
 }
} finally {await browser.close();}
await fs.writeFile(path.join(output,'verification.json'),JSON.stringify({base,assets:assetResults,viewports:6,desktopReaders:5,mobileReaders:5,downloads:10,screenshots},null,2));
console.log('PASS: 5 PDFs x 10 pages, 50 source PNGs, metadata, six viewport previews, 5 desktop + 5 mobile readers, 10 downloads, close/focus return.');
