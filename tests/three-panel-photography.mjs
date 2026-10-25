/** Real Portfolio components in a disposable build. No fixture route/media enters production. */
import assert from'node:assert/strict';
import{mkdtempSync,mkdirSync,writeFileSync,symlinkSync,readFileSync}from'node:fs';
import{resolve,join}from'node:path';import{spawnSync,spawn}from'node:child_process';import{deflateSync}from'node:zlib';
import{createServer}from'node:net';
import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
mkdirSync(resolve('.qa-director'),{recursive:true});
const repo=process.cwd(),root=mkdtempSync(join(repo,'.qa-director/three-panel-')),out=resolve(process.env.PHOTO_REVIEW_DIR||'.qa-director/photo-final/three-panel');mkdirSync(out,{recursive:true});mkdirSync(join(root,'src/pages'),{recursive:true});mkdirSync(join(root,'public/test-only'),{recursive:true});symlinkSync(join(repo,'node_modules'),join(root,'node_modules'),'dir');symlinkSync(join(repo,'public/portfolio'),join(root,'public/portfolio'),'dir');writeFileSync(join(root,'package.json'),'{"type":"module"}');
const womenswearFixtureIdentity=JSON.parse(readFileSync(join(repo,'src/data/womenswear-generated.json'),'utf8')).find(x=>x.integrated&&x.sourceIdentity==='rtw-ref-02')?.id??'rtw-ref-02';
const menswearConcepts=JSON.parse(readFileSync(join(repo,'src/data/menswear-ai-production.json'),'utf8')).selectedCompleteLooks;
const menswearFixtureIdentity=(category,position,historical)=>menswearConcepts.find(x=>x.category===category&&x.position===position)?.id??historical;
// Three coloured registration fields with transparent/white margins. Geometry QA, never garment evidence.
const crc=b=>{let c=0xffffffff;for(const n of b){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
const chunk=(name,data)=>{const t=Buffer.from(name),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,sum]);};
for(const alpha of[true,false]){const w=5400,h=2700,row=w*4+1,data=Buffer.alloc(row*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=y*row+1+x*4,inside=x%1800>=120&&x%1800<1680&&y>=120&&y<2580;const colour=inside?[[200,30,30],[20,145,55],[30,70,205]][Math.floor(x/1800)]:[255,255,255];data[n]=colour[0];data[n+1]=colour[1];data[n+2]=colour[2];data[n+3]=inside||!alpha?255:0;}const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=6;writeFileSync(join(root,`public/test-only/${alpha?'transparent':'white'}.png`),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(data)),chunk('IEND',Buffer.alloc(0))]));}
// This isolated module graph mutates fixture slots only inside its own build process.
writeFileSync(join(root,'src/pages/portfolio.astro'),`---\nimport Portfolio from '${repo}/src/pages/portfolio.astro';\nimport{collectionSlots,editorialSlots}from'${repo}/src/data/womenswear-collection';\nimport{menswearSlots}from'${repo}/src/data/menswear-collection';\nimport{womenswear}from'${repo}/src/data/portfolio';\nconst master=(kind,thirdView)=>({src:'/test-only/'+kind+'.png',srcset:'',width:5400,height:2700,alt:'TEST ONLY: three-panel registration fields; not garment evidence',front:1/3,views:3,thirdView});\ncollectionSlots.rtw[1].photography={composite:master('transparent','editorial')};\nif(editorialSlots.casualwear[0].id!=='rtw-ref-02')collectionSlots.rtw.push({id:editorialSlots.casualwear[0].id,photography:{composite:master('transparent','editorial')}});\nmenswearSlots['m-streetwear'][0].photography={composite:master('white','detail')};\n// Real legacy two-up source, used only to exercise the Menswear adapter, not published as a Menswear project.\nmenswearSlots['m-activewear'][0].photography={composite:womenswear.categories.find(c=>c.id==='rtw').references.find(r=>r.id==='rtw-ref-03').image};\nmenswearSlots['m-activewear'][1].photography={composite:{...womenswear.categories.find(c=>c.id==='rtw').references.find(r=>r.id==='rtw-ref-08').image,separable:false}};\n---\n<Portfolio/>`);
writeFileSync(join(root,'astro.config.mjs'),"import{defineConfig}from'astro/config';export default defineConfig({site:'https://aberbach.co',vite:{css:{postcss:{plugins:[]}}}});");
const build=spawnSync(process.execPath,[join(repo,'node_modules/astro/astro.js'),'build','--root',root],{cwd:root,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},encoding:'utf8'});writeFileSync(join(out,'fixture-build.log'),build.stdout+build.stderr);assert.equal(build.status,0,build.stderr);
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const available=probe.address().port;await new Promise(r=>probe.close(r));
const port=Number(process.env.PHOTO_FIXTURE_PORT||available),server=spawn(process.execPath,[join(repo,'node_modules/astro/astro.js'),'preview','--root',root,'--host','127.0.0.1','--port',String(port)],{cwd:root,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'ignore'});let b,checks=0;const check=(ok,label)=>{assert(ok,label);checks++;};
try{
 for(let i=0;i<50;i++){try{if((await fetch(`http://127.0.0.1:${port}/portfolio/`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 b=await chromium.launch();
 for(const[width,height]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
  const c=await b.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500,reducedMotion:'reduce'});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const world of ['womenswear','menswear']){
   const ww=world==='womenswear',id=ww?womenswearFixtureIdentity:menswearFixtureIdentity('m-streetwear',1,'m-streetwear-pexels-6311316'),cat=ww?'rtw':'m-streetwear';
   await p.goto(`http://127.0.0.1:${port}/portfolio/#${world}/${cat}/${id}`);await fontsReady(p);const r=p.locator(`[data-subject="${id}"]:not([hidden])`),panels=r.locator('[data-photo-panel]');
   check(await panels.count()===3,world+'/'+width+': exactly three individual source regions, no master panel');
   check(JSON.stringify(await r.locator('[data-photo-pair] [data-photo-panel]').evaluateAll(es=>es.map(e=>e.dataset.photoPanel)))===JSON.stringify(['front','back']),world+'/'+width+': Front and Back present together');
   check(!/Complete original|Full original|Combined view/i.test(await r.textContent()),world+'/'+width+': no redundant master control');
   for(let n=0;n<3;n++){
    const panel=panels.nth(n),viewport=panel.locator('[data-photo-viewport]');await viewport.scrollIntoViewIfNeeded();await panel.locator('img').evaluate(im=>im.decode());
    const geo=await viewport.evaluate(e=>{const p=e.firstElementChild.getBoundingClientRect(),im=e.querySelector('img').getBoundingClientRect();return{aspect:p.width/p.height,left:(p.left-im.left)/im.width,right:(p.right-im.left)/im.width};});
    check(Math.abs(geo.aspect-2/3)<.002,world+'/'+width+'/'+n+': native source proportions');
    check(Math.abs(geo.left-n/3)<.002&&Math.abs(geo.right-(n+1)/3)<.002,world+'/'+width+'/'+n+': exact source thirds, without destructive cropping');
    await panel.locator('[data-photo-zoom=in]').click();check(await viewport.getAttribute('aria-pressed')==='true',world+'/'+width+'/'+n+': individual zoom works');
    check(await panels.locator('[data-photo-viewport][aria-pressed=true]').count()===1,world+'/'+width+'/'+n+': zoom never spreads to other photographs');
    await panel.locator('[data-photo-fit]').click();
   }
   const alpha=await panels.first().locator('img').evaluate(async im=>{const canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);return ctx.getImageData(0,0,1,1).data[3];});check(alpha===(ww?0:255),'source alpha preserved');
   // One unavailable view must not remove or replace the other real views.
   await panels.nth(1).locator('img').evaluate(im=>{im.src='/test-only/missing.png';im.removeAttribute('srcset');});await p.waitForFunction(id=>document.querySelector(`[data-subject="${id}"] [data-photo-panel=back] [data-photo-status]`).textContent.includes('unavailable'),id);
   check(await panels.first().locator('img').evaluate(im=>im.complete&&im.naturalWidth===5400),'failed Back leaves real Front available');
   await p.keyboard.press('Escape');await r.waitFor({state:'hidden'});
   const selector=ww?`[data-ww-exhibition=casualwear] .ww-rail [data-open-subject="${id}"]`:`[data-mw-archive-door="${id}"]`;
   const door=p.locator(selector);await door.scrollIntoViewIfNeeded();
   check(await door.getAttribute('data-exhibition-view')===(ww?'editorial':'front'),world+'/'+width+': Fashion used only when a genuine Fashion panel exists');
   const window=await door.locator(ww?'[data-ww-photo]':'[data-mw-photo]').evaluate(e=>{const p=e.getBoundingClientRect(),im=e.querySelector('img').getBoundingClientRect();return[(p.left-im.left)/im.width,(p.right-im.left)/im.width];});
   check(Math.abs(window[0]-(ww?2/3:0))<.002&&Math.abs(window[1]-(ww?1:1/3))<.002,world+'/'+width+': exhibition uses correct individual source panel');
  }
  check(errors.length===0,'no fixture runtime errors');await c.close();
 }
 console.log(checks+' paired three-panel, source geometry, alpha, failure and independent inspection checks passed');
}finally{await b?.close();server.kill('SIGTERM');}
