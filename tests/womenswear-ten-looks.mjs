/* Contract tests: display slots, historical URLs, attribution, replacement media. */
import assert from'node:assert/strict';import fs from'node:fs/promises';import{build}from'esbuild';
const result=await build({stdin:{contents:"export {womenswear} from './src/data/portfolio';export * from './src/data/womenswear-collection';export {finalPhotographs} from './src/data/final-photography';export {directions} from './src/data/womenswear-direction';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const{womenswear,referenceCollection,displayedCollection,collectionSlots,slotPhotographs,finalPhotographs,directions}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++;};
const historical=JSON.parse(await fs.readFile('docs/portfolio/review/womenswear-v2/REFERENCES.json','utf8')),added=JSON.parse(await fs.readFile('src/data/womenswear-references.json','utf8'));
const displayed=[],pool=[];
for(const category of womenswear.categories){
 const all=referenceCollection(category,'womenswear'),edit=displayedCollection(category.id,all);pool.push(...all);displayed.push(...edit);
 check(edit.length===10&&new Set(edit.map(s=>s.id)).size===10,category.id+': exactly ten unique slots');
 check(directions[category.id].cast.every(c=>edit.some(s=>s.id===c.id)),category.id+': camera cannot feature an excluded look');
 for(const original of historical.categories.find(c=>c.category===category.id).references){
  const subject=all.find(s=>s.id===original.id);check(subject?.cover.src===original.source&&subject.cover.width===original.sourceMetadata.width&&subject.cover.height===original.sourceMetadata.height,original.id+': original source identity and dimensions retained');
 }
}
check(displayed.length===50&&new Set(displayed.map(s=>s.id)).size===50,'fifty displayed garments');
check(pool.length===58&&new Set(pool.map(s=>s.id)).size===58,'all 49 historical URLs plus nine independent additions');
check(new Set(displayed.map(s=>s.cover.src)).size===50,'no duplicated photograph masquerades as a new garment');
for(const ref of added){
 check(ref.license.url==='https://www.pexels.com/license/'&&ref.license.pageFreeMarker&&!!ref.credit.photographer&&ref.credit.sourcePage.startsWith('https://www.pexels.com/photo/'),ref.id+': verified reuse source and creator');
 for(const entry of ref.image.srcset.split(',')){const src=entry.trim().split(' ')[0];check((await fs.stat('public'+src)).size>1000,ref.id+': local responsive source exists');}
 const subject=pool.find(s=>s.id===ref.id);check(!subject.verified&&!subject.origin.length&&!subject.build.length&&finalPhotographs(subject).length===1,ref.id+': one honest primary view, no invented back or evidence');
}
const base=pool[0],image=(name,width=1200,height=1800)=>({src:`/fixture-only/${name}.webp`,srcset:'',width,height,alt:`TEST ONLY ${name}`,front:1,views:1});
const two={...image('two-up',1800,1200),views:2,front:.48};
for(const[final,keys]of [[{composite:two},['front','back','original']],[{composite:{...two,separable:false}},['front']],[{front:image('front'),back:image('back')},['front','back']],[{front:image('front'),back:image('back'),side:image('side',900,2200)},['front','back','side']],[{front:image('front'),back:image('back'),editorial:image('fashion',2400,1200),details:[{image:image('detail')}]},['front','back','editorial','detail']]]){
 const resolved=slotPhotographs(base,{id:base.id,photography:final});check(resolved.id===base.id&&resolved.category===base.category&&!resolved.verified,'photo replacement preserves URL and truthful status');check(JSON.stringify(finalPhotographs(resolved).map(v=>v.key))===JSON.stringify(keys),'replacement renders precisely supplied views');check(resolved.caption===resolved.cover.alt,'replacement does not retain the previous garment description');
}
console.log(`${checks} ten-look identity, licensing and replacement checks passed`);
