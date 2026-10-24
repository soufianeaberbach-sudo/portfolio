/** Background correction adds new presentation assets; all prior source blobs stay exact. */
import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const baseline=JSON.parse(fs.readFileSync('docs/portfolio/review/menswear-studio-v2-2026-10-24/BASELINE-PRESERVATION.json'));
const raw=execFileSync('git',['ls-tree','-r','-z','HEAD'],{maxBuffer:16*1024*1024}).toString();
const current=new Map(raw.split('\0').filter(Boolean).map(line=>{const [meta,path]=line.split('\t');return[path,meta.split(' ')[2]]}));let checks=0;
for(const [path,oid]of Object.entries(baseline.paths)){
 assert.equal(current.get(path),oid,'original Git blob changed: '+path);checks++;
 if(path.startsWith('src/')||path.startsWith('worker/')||['wrangler.jsonc','package.json','package-lock.json'].includes(path)){
  const bytes=fs.readFileSync(path),actual=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');assert.equal(actual,oid,'protected working source changed: '+path);checks++;
 }
}
console.log(checks+' original asset, report, Womenswear and application-source preservation checks passed');
// Verify the complete correction evidence graph, including segmentation inputs
// and refinement constraints, rather than trusting descriptive QA metadata.
const registry=JSON.parse(fs.readFileSync('src/data/menswear-studio-v2.json'));
for(const [name,sha256]of Object.entries(registry.currentPipelineSHA256)){
 assert.equal(createHash('sha256').update(fs.readFileSync('scripts/'+name)).digest('hex'),sha256,'reproducible final pipeline hash: '+name);checks++;
}
const secondary=JSON.parse(fs.readFileSync('docs/portfolio/review/menswear-studio-v2-2026-10-24/SECONDARY-MASKS.json'));
const verified=new Set();
function walk(value){
 if(!value||typeof value!=='object')return;
 if(typeof value.path==='string'&&typeof value.sha256==='string'&&!verified.has(value.path)){
  assert.equal(createHash('sha256').update(fs.readFileSync(value.path)).digest('hex'),value.sha256,'presentation evidence SHA256: '+value.path);verified.add(value.path);checks++;
 }
 for(const child of Object.values(value))walk(child);
}
walk(registry);walk(secondary);
console.log(checks+' total protected-source and correction-evidence integrity checks passed; '+verified.size+' unique SHA256-verified evidence files');
