import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
const result=await build({stdin:{contents:"export * from './src/data/menswear-collection';export {menswear} from './src/data/portfolio';export {menswearDirections} from './src/data/menswear-direction';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {menswear,menswearPool,menswearDisplayed,menswearHistoricalPool,menswearCredit,menswearActorSubject,menswearDirections,menswearSlots}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const catalog=JSON.parse(await fs.readFile('src/data/menswear-ai-production.json','utf8')).selectedCompleteLooks;
const registry=JSON.parse(await fs.readFile('docs/portfolio/review/menswear-full-production-2026-10-23/PRODUCTION.json','utf8'));
let checks=0;const check=(x,message)=>{assert(x,message);checks++};
check(JSON.stringify(menswear.categories.map(x=>x.label))===JSON.stringify(['Casualwear','Activewear','Outerwear','Tailoring']),'four authorized showroom labels');
check(catalog.length===registry.looks.filter(x=>x.master).length,'only completed sets integrated');
let legacy=0;
for(const c of menswear.categories){
 const pool=menswearPool(c.id),old=menswearHistoricalPool(c.id),display=menswearDisplayed(c.id,pool);legacy+=old.length;
 check(display.length===10&&new Set(display.map(x=>x.id)).size===10,c.id+' ten unique positions');
 for(const s of old){const preserved=pool.find(x=>x.id===s.id);check(preserved?.cover.src===s.cover.src,s.id+' historical media stable');check(menswearCredit(s.id)?.sourcePage?.includes('pexels.com'),s.id+' source attribution retained')}
 for(const motion of menswearDirections[c.id].cast)check(display.includes(menswearActorSubject(c.id,motion,display)),c.id+' motion key binds an actual featured subject');
}
check(legacy===50,'fifty historical routable identities');
for(const c of catalog){
 const s=menswearPool(c.category).find(x=>x.id===c.id);check(s?.id.startsWith('mw-r2-')&&!s.id.includes('pexels'),'new AI identity');check(s&&!s.verified&&!s.origin.length&&!s.build.length,'no manufactured project or invented evidence');check(menswearCredit(s.id)===undefined,'no inherited Pexels attribution');check(JSON.stringify(s.views.map(x=>x.key))===JSON.stringify(['front','back','editorial']),'three genuine separately mapped views');check(new Set(s.views.map(v=>v.image.src)).size===3,'three distinct active paths');check(s.views.every(v=>v.crop==='whole'&&v.image.width===1800&&v.image.height===2700),'uncropped normalized view geometry');check(s.caption.includes('AI fashion concept'),'truthful provenance');
 const sourcePosition=menswearSlots[c.category].findIndex(x=>x.id===c.id);check(sourcePosition===c.position-1,'stable source-slot mapping independent of curated display rank');
 for(const v of Object.values(c.views))check((await fs.stat('public'+v.src)).size>1000,'integrated image exists');
}
if(process.argv.includes('--require-complete')){check(catalog.length===40,'all forty complete looks');check(registry.statistics.acceptedActivePhotographs===120,'120 active photographs');check(!registry.statistics.unresolvedViews.length,'no unresolved views')}
console.log(checks+' Menswear AI identity, coverage and active-view checks passed');
