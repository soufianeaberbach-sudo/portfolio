/** Background correction adds new presentation assets; all prior source blobs stay exact. */
import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const baseline=JSON.parse(fs.readFileSync('docs/portfolio/review/menswear-studio-v2-2026-10-24/BASELINE-PRESERVATION.json'));
// Later owner-authorized Womenswear recovery changes seven exact source/metadata
// blobs. Keep every Menswear, original artwork and remaining source check strict.
const recovery=JSON.parse(fs.readFileSync('tests/fixtures/womenswear-recovery-preservation.json'));
assert.equal(recovery.baseline,baseline.baseline);
// The subsequent owner directive replaces only three exact presentation blobs.
// Keep the original recovery receipt intact and pin this finishing pass separately.
const studio=JSON.parse(fs.readFileSync('tests/fixtures/studio-imagery-preservation.json'));
assert.equal(studio.baseline,baseline.baseline);
const studioPaths=new Set(['src/components/ExpertiseVisual.astro','src/pages/process.astro','src/data/womenswear-generated.json']);
assert.deepEqual(new Set(Object.keys(studio.changes)),studioPaths);
// The 25 October owner brief replaces the five Tech Pack records/reader content.
// Pin exactly these three source blobs; retain every photographic integrity check.
const techpack=JSON.parse(fs.readFileSync('tests/fixtures/techpack-audit-preservation.json'));
assert.equal(techpack.baseline,baseline.baseline);
const techpackPaths=new Set(['src/components/portfolio/TechPackWorld.astro','src/data/portfolio.ts','src/pages/portfolio.astro']);
assert.deepEqual(new Set(Object.keys(techpack.changes)),techpackPaths);
// Current owner brief explicitly changes both readers, Fashion-first selection
// and vertical traversal. Pin exactly those source blobs; no asset exemption.
const experience=JSON.parse(fs.readFileSync('tests/fixtures/portfolio-experience-preservation.json'));
assert.equal(experience.baseline,baseline.baseline);
const experiencePaths=new Set(['src/components/portfolio/FinalPhotoReader.astro','src/components/portfolio/MenswearAct.astro','src/components/portfolio/MenswearReader.astro','src/components/portfolio/WomenswearExhibition.astro','src/data/final-photography.ts','src/pages/portfolio.astro','src/scripts/garment-match-cut.ts','src/scripts/menswear-reader.ts','src/scripts/womenswear-reader.ts','src/styles/menswear-cinematic.css','src/styles/womenswear-cinematic.css']);
assert.deepEqual(new Set(Object.keys(experience.changes)),experiencePaths);
// Current owner completion brief changes eight exact presentation/metadata blobs.
// The original photography, inspection and traversal controllers remain protected.
const completion=JSON.parse(fs.readFileSync('tests/fixtures/portfolio-completion-preservation.json'));
assert.equal(completion.baseline,baseline.baseline);
const completionPaths=new Set(['src/components/portfolio/FinalPhotoReader.astro','src/components/portfolio/MenswearAct.astro','src/components/portfolio/MenswearReader.astro','src/components/portfolio/TechPackWorld.astro','src/components/portfolio/WomenswearAct.astro','src/components/portfolio/WomenswearExhibition.astro','src/data/portfolio.ts','src/pages/portfolio.astro']);
assert.deepEqual(new Set(Object.keys(completion.changes)),completionPaths);
// The current owner brief changes curation and browsing only; pin exact source blobs.
const business=JSON.parse(fs.readFileSync('tests/fixtures/business-browsing-preservation.json'));
assert.equal(business.baseline,baseline.baseline);
const businessPaths=new Set(['src/components/portfolio/MenswearAct.astro','src/components/portfolio/MenswearReader.astro','src/components/portfolio/WomenswearExhibition.astro','src/data/menswear-collection.ts','src/data/menswear-direction.ts','src/data/womenswear-collection.ts','src/data/womenswear-direction.ts','src/scripts/menswear-film.ts']);
assert.deepEqual(new Set(Object.keys(business.changes)),businessPaths);
// The owner activated the production KV/R2 bindings after the baseline capture.
// Preserve that ONE exact Wrangler blob, while keeping all other source locks.
const contact=JSON.parse(fs.readFileSync('tests/fixtures/contact-backend-preservation.json'));
assert.equal(contact.baseline,baseline.baseline);
const contactPaths=new Set(['wrangler.jsonc']);
assert.deepEqual(new Set(Object.keys(contact.changes)),contactPaths);
// PR #57 authorizes only the exact stacked-layout Contact CSS correction.
const contactLayout=JSON.parse(fs.readFileSync('tests/fixtures/contact-layout-preservation.json'));
assert.equal(contactLayout.baseline,baseline.baseline);
const contactLayoutPaths=new Set(['src/pages/contact.astro']);
assert.deepEqual(new Set(Object.keys(contactLayout.changes)),contactLayoutPaths);
// Contact QA found hidden-input overflow and error focus behind the header.
// Pin only that exact component correction; every other source stays locked.
const contactForm=JSON.parse(fs.readFileSync('tests/fixtures/contact-form-preservation.json'));
assert.equal(contactForm.baseline,baseline.baseline);
const contactFormPaths=new Set(['src/components/BriefForm.astro']);
assert.deepEqual(new Set(Object.keys(contactForm.changes)),contactFormPaths);
const raw=execFileSync('git',['ls-tree','-r','-z','HEAD'],{maxBuffer:16*1024*1024}).toString();
const current=new Map(raw.split('\0').filter(Boolean).map(line=>{const [meta,path]=line.split('\t');return[path,meta.split(' ')[2]]}));let checks=0;
for(const [path,baselineOid]of Object.entries(baseline.paths)){
 const update=contactLayout.changes[path]??contactForm.changes[path]??contact.changes[path]??business.changes[path]??completion.changes[path]??experience.changes[path]??techpack.changes[path]??studio.changes[path]??recovery.changes[path];
 if(update){
  assert(path.includes('womenswear')||path==='src/components/portfolio/FinalPhotoReader.astro'||studioPaths.has(path)||techpackPaths.has(path)||experiencePaths.has(path)||completionPaths.has(path)||businessPaths.has(path)||contactPaths.has(path)||contactLayoutPaths.has(path)||contactFormPaths.has(path),'authorization must name an exact owner-scoped source path');
  assert(!path.startsWith('public/'),'original photographic files remain immutable');
  assert.equal(update.baselineSHA1,baselineOid,'authorization must identify the original baseline blob');
 }
 const oid=update?.authorizedSHA1??baselineOid;
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
