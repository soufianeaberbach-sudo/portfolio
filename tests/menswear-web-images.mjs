/** Every delivery file derives from a selected panel; original image identities stay intact. */
import assert from'node:assert/strict';import{readFileSync,statSync}from'node:fs';import{createHash}from'node:crypto';
const catalog=JSON.parse(readFileSync('src/data/menswear-ai-production.json')).selectedCompleteLooks;
const delivery=JSON.parse(readFileSync('src/data/menswear-web-images.json'));
const web=delivery.images,studio=delivery.presentationVersion==='menswear-studio-v2';
const widths=studio?[600,1200,1800]:[1200,1800];
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');let checks=0;const check=(x,m)=>{assert(x,m);checks++};
check(catalog.length===40&&Object.keys(web).length===120,'exact forty-look, 120-view delivery mapping');
const paths=[];let sourceBytes=0,deliveryBytes=0;
for(const look of catalog)for(const[view,photo]of Object.entries(look.views)){
 const optimized=web[photo.src];check(optimized?.normalizedSource===photo.src,'selected normalized source retained');check(optimized.sourceSHA256===hash('public'+photo.src),'active normalized panel SHA256');
 check(optimized.exports.length===widths.length,'complete delivery sizes');check(optimized.srcset.includes(photo.preview+' 600w'),'correct active small preview');
 check(optimized.exports.map(x=>x.width).join(',')===widths.join(','),'intended responsive width sequence');
 for(const image of optimized.exports){check(widths.includes(image.width),'supported responsive width');check(image.height===image.width*1.5,'portrait proportions');check(image.src.includes('/'+look.id+'/'+view+'-'),'correct look and view');check(hash('public'+image.src)===image.sha256,'delivery SHA256');check(statSync('public'+image.src).size===image.bytes,'true byte count');if(studio)check(image.lossless===true,'exact-white lossless delivery');paths.push(image.src)}
 check(optimized.src===optimized.exports.at(-1).src,'full responsive source');sourceBytes+=optimized.sourceBytes;deliveryBytes+=optimized.exports.at(-1).bytes;
}
check(new Set(paths).size===120*widths.length,'unique responsive paths, not duplicate active views');
// V1 used lossy delivery; V2 deliberately preserves exact white and texture.
// Its independent background test also proves full-size WebP/PNG pixel equality.
check(deliveryBytes<sourceBytes*(studio?.85:.25),'delivery meaningfully reduces active PNG payload under its fidelity contract');
console.log(checks+' Menswear responsive-source integrity checks passed; '+Math.round(100*(1-deliveryBytes/sourceBytes))+'% fewer bytes at 1800px');
