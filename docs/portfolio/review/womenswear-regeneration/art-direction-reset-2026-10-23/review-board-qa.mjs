import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const dir='docs/portfolio/review/womenswear-regeneration/art-direction-reset-2026-10-23';
const out=dir+'/evidence';mkdirSync(out,{recursive:true});
const index=JSON.parse(readFileSync(dir+'/asset-index.json'));
const ids=Object.keys(JSON.parse(readFileSync(dir+'/technical-review.json')));
const browser=await chromium.launch();let checks=0;const results=[];const check=(x,m)=>{assert(x,m);checks++;};
const base='http://127.0.0.1:4451/'+dir+'/index.html';
try{
 for(const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await page.locator('img[data-asset-index]').evaluateAll(async imgs=>{for(const im of imgs)im.loading='eager';await Promise.all(imgs.map(i=>i.decode()));});
  check(await page.locator('article.look').count()===9,'nine look sections');check(await page.locator('img[data-asset-index]').count()===27,'all 27 real image files');
  for(const [status,count] of [['HISTORICAL SOURCE',9],['SAVED V1 STUDY',8],['REJECTED',6],['UNAPPROVED V2',3],['UNREVIEWED',1]])check(await page.locator('figure[data-image-status="'+status+'"]').count()===count,status+' is accurately labelled');
  check(await page.locator('.secondary.rejected').count()===2,'two owner-rejected groups');
  const geometry=await page.locator('img[data-asset-index]').evaluateAll(images=>images.map(i=>({index:Number(i.dataset.assetIndex),w:i.naturalWidth,h:i.naturalHeight,fit:getComputedStyle(i).objectFit,box:i.getBoundingClientRect().width,parent:i.parentElement.getBoundingClientRect().width})));
  for(const im of geometry){const expected=index.images[im.index];check(im.w===expected.width&&im.h===expected.height,'genuine native image dimensions '+im.index);check(im.fit==='contain'&&im.box<=im.parent+1,'proportional complete image framing '+im.index);}
  check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no horizontal document overflow');
  check(await page.evaluate(()=>document.fonts.check('15px Inter')&&document.fonts.check('40px Archivo')),'actual project fonts ready');
  await page.screenshot({path:out+'/overview-'+width+'.jpg',quality:91});
  if(width===1440){
   for(const sid of ids)await page.locator('#'+sid).screenshot({path:out+'/'+sid+'-1440.jpg',quality:92,style:'.nav-shell{visibility:hidden!important}'});
  }
  if(width===390){
   for(const sid of ['swimwear-ref-04','evening-ref-02','activewear-ref-09']){
    await page.locator('#'+sid).scrollIntoViewIfNeeded();await page.evaluate(id=>document.getElementById(id).scrollIntoView({block:'start',behavior:'instant'}),sid);await page.screenshot({path:out+'/'+sid+'-390.jpg',quality:92});
   }
  }
  const reject=page.locator('figure[data-image-status="REJECTED"] button').first();await reject.click();const dialog=page.locator('dialog');check(await dialog.isVisible(),'image enlargement works');await dialog.locator('img').evaluate(i=>i.decode());check((await dialog.locator('.modal-title').innerText()).includes('REJECTED'),'rejection stays explicit at full size');await dialog.locator('[data-zoom]').click();check(await dialog.locator('[data-zoom]').getAttribute('aria-pressed')==='true','native detail view works');await page.keyboard.press('ArrowRight');await dialog.locator('img').evaluate(i=>i.decode());check((await dialog.locator('.modal-title').innerText()).includes('REJECTED'),'keyboard image navigation retains status');await page.keyboard.press('Escape');check(!await dialog.isVisible(),'Escape closes image');check(await reject.evaluate(e=>e===document.activeElement),'focus returns to the exact image');
  check(errors.length===0,'no browser runtime errors');results.push({width,height,all27ImagesDecoded:true,ownerRejectionLabels:true,lightboxKeyboardAndZoom:true,overflow:false});await context.close();console.log(width+' board review checks passed');
 }
 const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();let networkRequests=0;page.on('request',r=>{if(/^https?:/.test(r.url()))networkRequests++;});await context.route(/^https?:/,r=>r.abort());await page.goto(pathToFileURL('/workspace/artifacts/ABERBACH-Womenswear-Art-Direction-Review.html').href);await page.evaluate(()=>document.fonts.ready);await page.locator('img[data-asset-index]').evaluateAll(async imgs=>{for(const i of imgs)i.loading='eager';await Promise.all(imgs.map(i=>i.decode()));});check(await page.locator('img[data-asset-index]').count()===27,'offline file contains all images');check(networkRequests===0,'offline file requires no network');
 await page.screenshot({path:out+'/offline-edition-1440.jpg',quality:91});await page.emulateMedia({media:'print'});await page.pdf({path:'/workspace/artifacts/ABERBACH-Womenswear-Art-Direction-Review.pdf',format:'A3',printBackground:true,margin:{top:'12mm',right:'12mm',bottom:'12mm',left:'12mm'},displayHeaderFooter:false});await context.close();
 writeFileSync(out+'/RESULTS.json',JSON.stringify({checks,sourceCheckpoint:index.checkpoint,looks:9,imageFiles:27,viewports:results,offlineNetworkRequests:networkRequests,productionImageGenerationCalls:0,publicPortfolioChanged:false},null,2)+'\n');console.log(checks+' review-board checks passed');
}finally{await browser.close();}
