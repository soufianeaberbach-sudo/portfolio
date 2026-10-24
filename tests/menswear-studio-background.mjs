/** Entire-field white, protected foreground pixels, real views and lossless delivery. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const registry=JSON.parse(await fs.readFile('src/data/menswear-studio-v2.json','utf8'));
const original=JSON.parse(await fs.readFile('docs/portfolio/review/menswear-full-production-2026-10-23/PRODUCTION.json','utf8'));
const previous=JSON.parse(await fs.readFile('docs/portfolio/review/menswear-studio-v2-2026-10-24/PREVIOUS-ACTIVE-CATALOG.json','utf8'));
const catalog=JSON.parse(await fs.readFile('src/data/menswear-ai-production.json','utf8'));
const web=JSON.parse(await fs.readFile('src/data/menswear-web-images.json','utf8'));
const reviewedRegions=JSON.parse(await fs.readFile('docs/portfolio/review/menswear-studio-v2-2026-10-24/REGION-REVIEWS.json','utf8')).regions;
const views=['front','back','editorial'];let checks=0,protectedPixels=0,protectedLightPixels=0,backgroundPixels=0;
const check=(x,m)=>{assert(x,m);checks++};
const hash=b=>createHash('sha256').update(b).digest('hex');
const file=async record=>{const bytes=await fs.readFile(record.path);check(hash(bytes)===record.sha256,record.path+' SHA256');check(bytes.length===record.bytes,record.path+' byte count');return bytes};
const pixels=async bytes=>sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true});
const maskPixels=async bytes=>sharp(bytes).greyscale().raw().toBuffer({resolveWithObject:true});
// Binary union-of-neighbours with explicit white-foreground semantics; avoid
// library morphology conventions that may instead expand the black background.
function expand(mask,width,height,radius){
 const horizontal=Buffer.alloc(mask.length),result=Buffer.alloc(mask.length);
 for(let y=0;y<height;y++){
  let count=0;for(let x=0;x<=radius&&x<width;x++)count+=mask[y*width+x]>0;
  for(let x=0;x<width;x++){horizontal[y*width+x]=count?255:0;
   if(x-radius>=0)count-=mask[y*width+x-radius]>0;
   if(x+radius+1<width)count+=mask[y*width+x+radius+1]>0;}
 }
 for(let x=0;x<width;x++){
  let count=0;for(let y=0;y<=radius&&y<height;y++)count+=horizontal[y*width+x]>0;
  for(let y=0;y<height;y++){result[y*width+x]=count?255:0;
   if(y-radius>=0)count-=horizontal[(y-radius)*width+x]>0;
   if(y+radius+1<height)count+=horizontal[(y+radius+1)*width+x]>0;}
 }
 return result;
}
const lookHashes=[],allPaths=[];
check(registry.looks.length===40&&catalog.selectedCompleteLooks.length===40,'exact forty selected looks');
check(registry.presentationVersion==='menswear-studio-v2'&&catalog.presentationVersion===registry.presentationVersion,'explicit versioned active presentation');
check(web.lossless===true&&web.schemaVersion===2,'lossless exact-white delivery contract');
check(Object.keys(web.images).length===120,'120 separate actual views');
for(const category of ['m-streetwear','m-activewear','m-rtw','m-tailoring'])check(registry.looks.filter(x=>x.category===category).length===10,category+' ten looks');

for(const look of registry.looks){
 const source=original.looks.find(x=>x.id===look.id),active=catalog.selectedCompleteLooks.find(x=>x.id===look.id),old=previous.selectedCompleteLooks.find(x=>x.id===look.id);
 check(look.status==='PASS_VISUAL','actual visual review recorded '+look.id);
 check(active.category===old.category&&active.position===old.position,'original category/order '+look.id);
 for(const key of ['title','product','fabric','construction','styling','colour','provenance'])check(active[key]===old[key],'original concept '+look.id+'/'+key);
 const panels=[];
 for(const view of views){
  const record=look.views[view],native=await fs.readFile(record.originalNative.path);
  check(hash(native)===source[view].sha256&&hash(native)===record.originalNative.sha256,'generation native preserved '+look.id+'/'+view);
  check(hash(await fs.readFile(record.originalPanel.path))===source[view].exportSHA256,'historical normalized photograph preserved');
  const [raw,fixed,alpha,trimap,shadow]=await Promise.all([pixels(native),pixels(await file(record.correctedNativeSize)),maskPixels(await file(record.alpha)),maskPixels(await file(record.trimap)),maskPixels(await file(record.shadow))]);
  const {width,height}=raw.info;check(fixed.info.width===width&&fixed.info.height===height,'native-size intermediate geometry');
  check(record.newNativePhotography===false&&record.resampledExport===true,'truthful corrected-export provenance');
  let core=0,light=0,background=0,partial=0,shadowCount=0,maxShadow=0,coreDamage=0,bgDamage=0,matteDamage=0;
  const coverage=Buffer.alloc(width*height);
  for(let p=0;p<width*height;p++){
   const a=alpha.data[p],t=trimap.data[p],s=shadow.data[p],i=p*3;
   if(t===255){core++;if(Math.min(raw.data[i],raw.data[i+1],raw.data[i+2])>200)light++;
    if(a!==255)matteDamage++;
    if(fixed.data[i]!==raw.data[i]||fixed.data[i+1]!==raw.data[i+1]||fixed.data[i+2]!==raw.data[i+2])coreDamage++;
   }
   if(a===0&&s===0){background++;if(fixed.data[i]!==255||fixed.data[i+1]!==255||fixed.data[i+2]!==255)bgDamage++;}
   if(a>0&&a<255)partial++;
   if(s){shadowCount++;maxShadow=Math.max(maxShadow,s);}
   coverage[p]=(a||s)?255:0;
  }
  check(core>50000&&coreDamage===0&&matteDamage===0,'all protected foreground pixels untouched '+look.id+'/'+view);
  for(const region of reviewedRegions.filter(x=>x.look===look.id&&x.view===view)){
   const [left,top,right,bottom]=region.bounds;let damaged=0;
   for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const p=y*width+x,i=p*3;
    if(alpha.data[p]!==255||fixed.data[i]!==raw.data[i]||fixed.data[i+1]!==raw.data[i+1]||fixed.data[i+2]!==raw.data[i+2])damaged++;}
   check(damaged===0,'independently identified light-fabric detail retained: '+region.classification);
  }
  check(core===record.qa.preservedCorePixels&&light===record.qa.preservedLightCorePixels,'independently computed garment-preservation counts');
  check(background>width*height*.35&&bgDamage===0,'entire exposed background is exact #FFFFFF, including internal gaps');
  check(background===record.qa.exposedBackgroundPixels&&record.qa.nonWhiteExposedBackgroundPixels===0,'full-field metrics truthful');
  check(partial>100&&partial<width*height*.12,'localized matting at fine silhouette boundaries');
  check(maxShadow<=24&&shadowCount>10&&shadowCount<width*height*.04,'subtle localized grounding shadow');
  protectedPixels+=core;protectedLightPixels+=light;backgroundPixels+=background;
  const expandedCoverage=expand(coverage,width,height,12);
  const panelBytes=await file(record.panel),panel=await pixels(panelBytes);panels.push(panel.data);
  check(panel.info.width===1800&&panel.info.height===2700,'normalized panel geometry');
  check(active.views[view].src===record.panel.src&&active.views[view].preview===record.exports[0].src,'active corrected panel/preview '+look.id+'/'+view);
  check(record.panel.src.startsWith('/portfolio/ai-concepts/menswear-studio-v2/'),'cache-safe new path');
  // A generous 12-native-pixel silhouette ring covers the Lanczos filter support
  // at every delivery scale. All of the remaining full background field must
  // stay exactly white, not merely the corners or original photo perimeter.
  for(const [bytes,w,h,label] of [[panelBytes,1800,2700,'panel'],...await Promise.all(record.exports.map(async e=>[await file(e),e.width,e.height,'responsive']))]){
   const decoded=await pixels(bytes);
   const outside=await sharp(expandedCoverage,{raw:{width,height,channels:1}}).resize(w,h,{kernel:'nearest'}).greyscale().raw().toBuffer();
   check(decoded.info.width===w&&decoded.info.height===h,'delivery dimensions');
   let invalid=0,perimeter=0;
   for(let p=0;p<w*h;p++)if(outside[p]===0){let i=p*3;if(decoded.data[i]!==255||decoded.data[i+1]!==255||decoded.data[i+2]!==255)invalid++;}
   for(let x=0;x<w;x++)for(const y of [0,h-1]){const i=(y*w+x)*3;if(decoded.data[i]!==255||decoded.data[i+1]!==255||decoded.data[i+2]!==255)perimeter++;}
   for(let y=0;y<h;y++)for(const x of [0,w-1]){const i=(y*w+x)*3;if(decoded.data[i]!==255||decoded.data[i+1]!==255||decoded.data[i+2]!==255)perimeter++;}
   check(invalid===0,'no surviving studio field anywhere outside subject/shadow: '+look.id+'/'+view+'/'+label+'/'+w);
   check(perimeter===0,'no photographic rectangle or floor seam: '+look.id+'/'+view+'/'+w);
   if(w===1800&&label==='responsive')check(decoded.data.equals(panel.data),'1800 WebP is pixel-identical to corrected PNG');
  }
  check(record.exports.map(x=>x.width).join(',')==='600,1200,1800','three responsive sizes');
  const optimized=web.images[record.panel.src];check(optimized.lossless===true&&optimized.src===record.exports[2].src,'all viewer/cinema surfaces select the corrected lossless version');
  for(const e of record.exports){check(e.lossless===true,'truthful lossless export');allPaths.push(e.src);}
  lookHashes.push(record.panel.sha256);
 }
 const master=await pixels(await file(look.master));check(master.info.width===5400&&master.info.height===2700,'three-view master dimensions');
 check(active.master===look.master.src,'corrected active master');
 for(let v=0;v<3;v++)for(let y=0;y<2700;y++)assert(master.data.subarray((y*5400+v*1800)*3,(y*5400+(v+1)*1800)*3).equals(panels[v].subarray(y*1800*3,(y+1)*1800*3)),'master exact corrected panel');
 checks+=3;
 let seamDamage=0;for(let y=0;y<2700;y++)for(const x of [0,1799,1800,3599,3600,5399]){const i=(y*5400+x)*3;if(master.data[i]!==255||master.data[i+1]!==255||master.data[i+2]!==255)seamDamage++;}
 check(seamDamage===0,'uninterrupted white master panel seams');
 for(const record of look.masterResponsive){const image=await pixels(await file(record));check(image.info.width===record.dimensions[0]&&image.info.height===record.dimensions[1],'responsive master dimensions');}
 console.log(look.id,'foreground, full-field white and three-view master passed');
}
check(new Set(lookHashes).size===120,'120 distinct corrected genuine views');check(new Set(allPaths).size===360,'360 unique responsive derivatives');
check(protectedLightPixels>1000000,'collection-wide pale-fabric preservation was actually checked');
console.log(JSON.stringify({checks,looks:40,views:120,masters:40,protectedPixels,protectedLightPixels,exactWhiteBackgroundPixels:backgroundPixels}));
