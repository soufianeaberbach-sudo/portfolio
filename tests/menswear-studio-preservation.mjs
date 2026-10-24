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
