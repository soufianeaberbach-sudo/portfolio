/** Every delivery file derives from a selected panel; original image identities stay intact. */
import assert from'node:assert/strict';import{readFileSync,statSync}from'node:fs';import{createHash}from'node:crypto';
const catalog=JSON.parse(readFileSync('src/data/menswear-ai-production.json')).selectedCompleteLooks;
const web=JSON.parse(readFileSync('src/data/menswear-web-images.json')).images;
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');let checks=0;const check=(x,m)=>{assert(x,m);checks++};
check(catalog.length===40&&Object.keys(web).length===120,'exact forty-look, 120-view delivery mapping');
const paths=[];let sourceBytes=0,deliveryBytes=0;
for(const look of catalog)for(const[view,photo]of Object.entries(look.views)){
 const optimized=web[photo.src];check(optimized?.normalizedSource===photo.src,'selected normalized source retained');check(optimized.sourceSHA256===hash('public'+photo.src),'original panel unchanged');
 check(optimized.exports.length===2,'two delivery sizes');check(optimized.srcset.includes(photo.preview+' 600w'),'existing small preview reused');
 for(const image of optimized.exports){check(image.width===1200||image.width===1800,'supported responsive width');check(image.height===image.width*1.5,'portrait proportions');check(image.src.includes('/'+look.id+'/'+view+'-'),'correct look and view');check(hash('public'+image.src)===image.sha256,'delivery SHA256');check(statSync('public'+image.src).size===image.bytes,'true byte count');paths.push(image.src)}
 check(optimized.src===optimized.exports[1].src,'full responsive source');sourceBytes+=optimized.sourceBytes;deliveryBytes+=optimized.exports[1].bytes;
}
check(new Set(paths).size===240,'unique responsive paths, not duplicate active views');check(deliveryBytes<sourceBytes*.25,'delivery meaningfully reduces original PNG payload');
console.log(checks+' Menswear responsive-source integrity checks passed; '+Math.round(100*(1-deliveryBytes/sourceBytes))+'% fewer bytes at 1800px');
