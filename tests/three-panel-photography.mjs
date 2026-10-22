/** Real Portfolio components in a disposable build. No fixture route/media enters production. */
import assert from'node:assert/strict';
import{mkdtempSync,mkdirSync,writeFileSync,symlinkSync}from'node:fs';
import{resolve,join}from'node:path';import{spawnSync,spawn}from'node:child_process';import{deflateSync}from'node:zlib';
import{createServer}from'node:net';
import{chromium}from'playwright';import{installFonts,fontsReady}from'./fixtures/fonts.mjs';
mkdirSync(resolve('.qa-director'),{recursive:true});
const repo=process.cwd(),root=mkdtempSync(join(repo,'.qa-director/three-panel-')),out=resolve(process.env.PHOTO_REVIEW_DIR||'.qa-director/photo-final/three-panel');mkdirSync(out,{recursive:true});mkdirSync(join(root,'src/pages'),{recursive:true});mkdirSync(join(root,'public/test-only'),{recursive:true});symlinkSync(join(repo,'node_modules'),join(root,'node_modules'),'dir');symlinkSync(join(repo,'public/portfolio'),join(root,'public/portfolio'),'dir');writeFileSync(join(root,'package.json'),'{"type":"module"}');
// Three coloured registration fields with transparent/white margins. Geometry QA, never garment evidence.
const crc=b=>{let c=0xffffffff;for(const n of b){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
const chunk=(name,data)=>{const t=Buffer.from(name),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,sum]);};
for(const alpha of[true,false]){const w=5400,h=2700,row=w*4+1,data=Buffer.alloc(row*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=y*row+1+x*4,inside=x%1800>=120&&x%1800<1680&&y>=120&&y<2580;const colour=inside?[[200,30,30],[20,145,55],[30,70,205]][Math.floor(x/1800)]:[255,255,255];data[n]=colour[0];data[n+1]=colour[1];data[n+2]=colour[2];data[n+3]=inside||!alpha?255:0;}const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=6;writeFileSync(join(root,`public/test-only/${alpha?'transparent':'white'}.png`),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(data)),chunk('IEND',Buffer.alloc(0))]));}
// This isolated module graph mutates fixture slots only inside its own build process.
writeFileSync(join(root,'src/pages/portfolio.astro'),`---\nimport Portfolio from '${repo}/src/pages/portfolio.astro';\nimport{collectionSlots}from'${repo}/src/data/womenswear-collection';\nimport{menswearSlots}from'${repo}/src/data/menswear-collection';\nimport{womenswear}from'${repo}/src/data/portfolio';\nconst master=(kind,thirdView)=>({src:'/test-only/'+kind+'.png',srcset:'',width:5400,height:2700,alt:'TEST ONLY: three-panel registration fields; not garment evidence',front:1/3,views:3,thirdView});\ncollectionSlots.rtw[1].photography={composite:master('transparent','editorial')};\nmenswearSlots['m-streetwear'][0].photography={composite:master('white','detail')};\n// Real legacy two-up source, used only to exercise the Menswear adapter, not published as a Menswear project.\nmenswearSlots['m-activewear'][0].photography={composite:womenswear.categories.find(c=>c.id==='rtw').references.find(r=>r.id==='rtw-ref-03').image};\nmenswearSlots['m-activewear'][1].photography={composite:{...womenswear.categories.find(c=>c.id==='rtw').references.find(r=>r.id==='rtw-ref-08').image,separable:false}};\n---\n<Portfolio/>`);
writeFileSync(join(root,'astro.config.mjs'),"import{defineConfig}from'astro/config';export default defineConfig({site:'https://aberbach.co',vite:{css:{postcss:{plugins:[]}}}});");
const build=spawnSync(process.execPath,[join(repo,'node_modules/astro/astro.js'),'build','--root',root],{cwd:root,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},encoding:'utf8'});writeFileSync(join(out,'fixture-build.log'),build.stdout+build.stderr);assert.equal(build.status,0,build.stderr);
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const available=probe.address().port;await new Promise(r=>probe.close(r));
const port=Number(process.env.PHOTO_FIXTURE_PORT||available),server=spawn(process.execPath,[join(repo,'node_modules/astro/astro.js'),'preview','--root',root,'--host','127.0.0.1','--port',String(port)],{cwd:root,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'ignore'});let b,checks=0;const check=(ok,label)=>{assert(ok,label);checks++;};
try{for(let i=0;i<50;i++){try{if((await fetch(`http://127.0.0.1:${port}/portfolio/`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}b=await chromium.launch();
for(const[width,height]of[[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){const c=await b.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});await installFonts(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{
 window.__photoTestEvents=[];
 document.addEventListener('click',event=>{const button=event.target.closest('[data-ww-view],[data-mw-view]');if(button)window.__photoTestEvents.push({at:performance.now(),view:button.dataset.wwView??button.dataset.mwView,text:button.textContent});},true);
});
for(const world of['womenswear','menswear']){const ww=world==='womenswear',id=ww?'rtw-ref-02':'m-streetwear-pexels-6311316',cat=ww?'rtw':'m-streetwear',reader=ww?'[data-ww-reader]':'[data-mw-reader]',panel=ww?'[data-photo-view]':'[data-mw-view-panel]',view=ww?'data-ww-view':'data-mw-view',photo=ww?'[data-ww-photo]':'[data-mw-photo]';
await p.goto(`http://127.0.0.1:${port}/portfolio/#${world}/${cat}/${id}`);await fontsReady(p);const r=p.locator(reader+':not([hidden])');check(await r.locator(`[${view}]`).count()===4,'three genuine panel choices and complete original');
for(let n=0;n<4;n++){console.log(`three-panel ${world} ${width}×${height}: selecting ${n}`);await r.locator(`[${view}="${n}"]`)[width<500?'tap':'click']();const selected=r.locator(`${panel}[${ww?'data-photo-view':'data-mw-view-panel'}="${n}"]`);try{await selected.waitFor({state:'visible'});}catch(error){
 console.error('three-panel failure diagnostics',JSON.stringify(await r.evaluate(reader=>({url:location.href,subject:reader.dataset.subject,busy:reader.getAttribute('aria-busy'),inspect:reader.hasAttribute('data-inspect'),status:reader.querySelector('[role=status]')?.textContent,events:window.__photoTestEvents,buttons:[...reader.querySelectorAll('[data-ww-view],[data-mw-view]')].map(b=>({view:b.dataset.wwView??b.dataset.mwView,pressed:b.getAttribute('aria-pressed')})),panels:[...reader.querySelectorAll('[data-photo-view],[data-mw-view-panel]')].map(p=>{const im=p.querySelector('img');return{view:p.dataset.photoView??p.dataset.mwViewPanel,hidden:p.hidden,complete:im.complete,naturalWidth:im.naturalWidth,source:im.currentSrc,loading:im.loading};})})),null,2));
 await p.screenshot({path:join(out,`failure-${world}-${width}-${n}.jpg`)});throw error;
}check(await r.locator(`[${view}="${n}"]`).getAttribute('aria-pressed')==='true',`${world}/${width}/${n}: selected state matches visible photograph`);const visible=selected.locator(photo);await visible.locator('img').evaluate(im=>im.decode());const geo=await visible.evaluate(e=>{const r=e.getBoundingClientRect(),im=e.querySelector('img'),i=im.getBoundingClientRect();return{aspect:r.width/r.height,left:(r.left-i.left)/i.width,right:(r.right-i.left)/i.width};});check(Math.abs(geo.aspect-(n===3?2:2/3))<.002,`${world}/${width}/${n}: native panel/source proportions ${JSON.stringify(geo)}`);check(Math.abs(geo.left-(n===3?0:n/3))<.002&&Math.abs(geo.right-(n===3?1:(n+1)/3))<.002,`${world}/${width}/${n}: exact source thirds ${JSON.stringify(geo)}`);if(width===1440||width===390)await p.screenshot({path:join(out,`${world}-${n}-${width}.jpg`),quality:92});}
// Real native race: selecting an already-prefetched original must not cancel its decode.
await r.locator(`[${view}="2"]`).click();
check(await r.evaluate(async(reader,{panel,view})=>{const im=reader.querySelectorAll(panel)[3].querySelector('img');const decoded=im.decode().then(()=>true,()=>false);reader.querySelector(`[${view}="3"]`).click();return decoded;},{panel,view}),`${world}/${width}: selection preserves native in-flight decode`);
check(await r.locator(panel).nth(3).isVisible(),`${world}/${width}: native-decode race resolves into Complete Original`);
// A loaded master can reject a redundant hidden-image decode (observed CI failure).
// Reproduce the request outcome without changing pixels or relaxing visibility/ARIA assertions.
await r.locator(`[${view}="2"]`).click();await r.locator(`${panel}:not([hidden]) img`).evaluate(im=>im.decode());
const originalImage=r.locator(`${panel}`).nth(3).locator('img');
await originalImage.evaluate(im=>{im.loading='eager';});
await p.waitForFunction(selector=>{const im=document.querySelector(selector);return im.complete&&im.naturalWidth===5400;},`${reader}:not([hidden]) ${panel.slice(0,-1)}="3"] img`);
await originalImage.evaluate(im=>{im.__nativeDecode=im.decode;im.decode=function(){const panel=this.closest('[data-photo-view],[data-mw-view-panel]');return panel.hidden?Promise.reject(new DOMException('Controlled loaded-source decode rejection','EncodingError')):this.__nativeDecode();};});
await r.locator(`[${view}="3"]`).click();await r.locator(`${panel}:not([hidden])`).nth(0).waitFor({state:'visible'});
check(await r.locator(`[${view}="3"]`).getAttribute('aria-pressed')==='true',`${world}/${width}: loaded original survives hidden-image decode rejection`);
check(await r.locator(panel).nth(3).isVisible(),`${world}/${width}: complete original really visible after rejection scenario`);
await originalImage.evaluate(im=>{im.decode=im.__nativeDecode;delete im.__nativeDecode;});
// A distinct source still waits for decode. A newer request wins over the held request.
await r.locator(`[${view}="0"]`).click();
await originalImage.evaluate(im=>{im.__source=im.src;im.src=im.src.includes('transparent')?'/test-only/white.png':'/test-only/transparent.png';im.__nativeDecode=im.decode;im.decode=()=>new Promise((resolve,reject)=>{window.__releasePhoto=()=>im.__nativeDecode().then(resolve,reject);});});
await r.locator(`[${view}="3"]`).click();
check(await r.getAttribute('aria-busy')==='true',`${world}/${width}: distinct source announces pending decode`);
check(await r.locator(panel).nth(0).isVisible(),`${world}/${width}: pending source retains previous photograph`);
await r.locator(`[${view}="1"]`).click();
await p.evaluate(()=>window.__releasePhoto());
check(await r.locator(`[${view}="1"]`).getAttribute('aria-pressed')==='true',`${world}/${width}: late decode cannot overwrite newer view`);
await originalImage.evaluate(im=>{im.decode=im.__nativeDecode;im.src='/test-only/missing.png';});
await r.locator(`[${view}="3"]`).click();
await p.waitForFunction(selector=>document.querySelector(selector)?.textContent.includes('unavailable'),`${reader}:not([hidden]) [role=status]`);
check(await r.locator(panel).nth(1).isVisible(),`${world}/${width}: failed distinct source retains available photograph`);
check(await r.getAttribute('aria-busy')===null,`${world}/${width}: failed source clears pending state`);
await originalImage.evaluate(im=>{im.src=im.__source;delete im.__source;delete im.__nativeDecode;});
// Genuine view keyboard selection remains functional after failed/interrupted requests.
await r.focus();await p.keyboard.press('ArrowRight');
await p.waitForFunction(({reader,view})=>document.querySelector(`${reader}:not([hidden]) [${view}="2"]`)?.getAttribute('aria-pressed')==='true',{reader,view});
check(await r.locator(panel).nth(2).isVisible(),`${world}/${width}: keyboard recovers after failed request`);
const alpha=await r.locator('img').first().evaluate(async im=>{await im.decode();const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);return x.getImageData(0,0,1,1).data[3];});check(alpha===(ww?0:255),'original PNG alpha/white background preserved');
check(await r.locator('button').evaluateAll(bs=>bs.filter(b=>b.getBoundingClientRect().width>0).every(b=>{const r=b.getBoundingClientRect();return r.width>=43.9&&r.height>=43.9;})),'view controls retain touch targets');
await r.locator(`[${view}="2"]`).click();await r.locator('[data-rd-inspect]').click();await p.keyboard.press('+');check(await r.evaluate(e=>e.hasAttribute('data-inspect')),'third panel supports existing inspection');await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(650);check(await r.count()===0,'Escape exits inspection and reader');
// Reader inspection must never change the film/archive to Back or third view.
for(const selector of [ww?'[data-ww-exhibition=casualwear] [data-ww-actor] [data-door-source]':'[data-mw-film=m-streetwear] [data-mw-actor="6311316"] [data-door-source]',ww?'[data-ww-exhibition=casualwear] .ww-rail [data-door-source]':'[data-mw-film=m-streetwear] .mw-rail [data-door-source]']){const bounds=await p.locator(selector).first().evaluate(e=>{const r=e.getBoundingClientRect(),im=e.querySelector('img').getBoundingClientRect();return{left:(r.left-im.left)/im.width,right:(r.right-im.left)/im.width};});check(Math.abs(bounds.left)<.002&&Math.abs(bounds.right-1/3)<.002,`${world}/${width}: film/archive remain on the complete Front panel ${JSON.stringify(bounds)}`);}
check(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no document overflow');
}
for(const[world,cat,id,count]of[['womenswear','swimwear','swimwear-ref-06',1],['womenswear','rtw','rtw-ref-03',3],['womenswear','rtw','rtw-ref-08',1],['womenswear','rtw','rtw-ref-16',1],['menswear','m-tailoring','m-tailoring-pexels-6097464',1],['menswear','m-activewear','m-activewear-pexels-7648388',3],['menswear','m-activewear','m-activewear-pexels-30954220',1]]){
 const ww=world==='womenswear';await p.goto(`http://127.0.0.1:${port}/portfolio/#${world}/${cat}/${id}`);const r=p.locator(`[data-subject=${id}]:not([hidden])`),panels=r.locator(ww?'[data-photo-view]':'[data-mw-view-panel]');check(await panels.count()===count,`${world}/${width}: genuine legacy ${count===1?'single':'two-up'} compatibility`);
 for(let n=0;n<count;n++){if(count>1)await r.locator(ww?`[data-ww-view="${n}"]`:`[data-mw-view="${n}"]`).click();const panel=panels.nth(n);await panel.waitFor({state:'visible'});await panel.locator('img').evaluate(im=>im.decode());check(await panel.locator('img').evaluate(im=>im.naturalWidth>0),`${world}/${width}/${n}: real source decoded`);}
}
check(errors.length===0,'no fixture runtime errors');await c.close();}
console.log(`${checks} real-Portfolio three-panel/alpha browser checks passed`);
}finally{await b?.close();server.kill('SIGTERM');}
