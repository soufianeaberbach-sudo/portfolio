"""Full selected-collection audit; technical assertions do not replace visual garment review."""
from pathlib import Path
from PIL import Image, ImageOps
import datetime, hashlib, json, subprocess
R=Path(__file__).resolve().parents[1];D=R/'docs/portfolio/review/menswear-full-production-2026-10-23'
d=json.loads((D/'PRODUCTION.json').read_text());checks=0

def check(ok,message):
 global checks
 assert ok,message
 checks+=1

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()

check(len(d['looks'])==40,'40 looks');check(len(d['queue'])==120,'120 queue entries')
check(d['statistics']['completedLooks']==40,'40 completed looks');check(d['statistics']['acceptedActivePhotographs']==120,'120 selected photos');check(not d['statistics']['unresolvedViews'],'no unresolved views')
pixels=set();native_paths=[];master_paths=[]
for look in d['looks']:
 thumbnails={}
 for view in ('front','back','editorial'):
  rec=look[view];check(bool(rec),look['id']+':'+view)
  for pk,hk in [('nativePath','sha256'),('exportPath','exportSHA256'),('previewPath','previewSHA256')]:
   path=R/rec[pk];check(path.is_file(),rec[pk]);check(digest(path)==rec[hk],rec[pk]+' SHA256')
  with Image.open(R/rec['nativePath']) as im:
   im.load();check(list(im.size)==rec['nativeDimensions'],'true native geometry');pixel=hashlib.sha256(im.convert('RGB').tobytes()).hexdigest();check(pixel not in pixels,'distinct decoded native pixels');pixels.add(pixel);thumbnails[view]=im.convert('RGB').resize((256,384))
  with Image.open(R/rec['exportPath']) as im:check(im.size==(1800,2700),'panel export dimensions')
  with Image.open(R/rec['previewPath']) as im:check(im.size==(600,900),'preview dimensions')
  check(rec['ownerArtisticAcceptance']=='PENDING' and rec['agentSelection']=='SELECTED_AUTONOMOUS','truthful selection status');check(not rec['nativeHighResolutionClaim'],'no false native resolution')
  native_paths.append(rec['nativePath'])
 check(thumbnails['front'].tobytes()!=ImageOps.mirror(thumbnails['back']).tobytes(),'Back is not a literal mirrored Front')
 master=look['master'];check(digest(R/master['path'])==master['sha256'],'master SHA256');master_paths.append(master['path'])
 with Image.open(R/master['path']) as im:
  im.load();check(im.size==(5400,2700),'master dimensions')
  for i,view in enumerate(('front','back','editorial')):
   with Image.open(R/look[view]['exportPath']) as panel:check(im.crop((i*1800,0,(i+1)*1800,2700)).tobytes()==panel.convert('RGB').tobytes(),'master exact panel '+view)
 for w in (900,1800,2700,3600):
  with Image.open((R/master['path']).with_name(f'master-{w}.webp')) as im:check(im.size==(w,w//2),'responsive master '+str(w))
 check(look['setReview']['modelAndOutfitContinuity']=='PASS_VISUAL' and look['setReview']['trueRear']=='PASS_VISUAL' and look['setReview']['editorialFashionPose']=='PASS_VISUAL','explicit visual set review')
for category in ('Casualwear','Activewear','Outerwear','Tailoring'):
 group=[x for x in d['looks'] if x['category']==category];check(len(group)==10 and len({x['productSubtype'] for x in group})==10,category+' coverage and distinct primary types')
start='a869cf755bd296d71cb2e89a8e4799cc1fb37082'
def tree(ref):
 raw=subprocess.check_output(['git','ls-tree','-r','-z',ref],cwd=R)
 return {entry.split(b'\t',1)[1].decode():entry.split(b'\t',1)[0].split()[2].decode() for entry in raw.split(b'\0') if entry}
old=tree(start);new=tree('HEAD');protected=[p for p in old if p.startswith(('assets/','public/','docs/portfolio/review/'))]
for path in protected:check(new.get(path)==old[path],'historical blob preserved: '+path)
allowed={'src/data/menswear-ai-production.json','src/data/menswear-collection.ts','src/data/portfolio.ts','src/components/portfolio/MenswearAct.astro','src/components/portfolio/MenswearReader.astro'}
changed=[p for p in set(old)|set(new) if p.startswith('src/') and old.get(p)!=new.get(p)]
check(set(changed)<=allowed,'source changes are scoped to authorized Menswear files: '+str(changed))
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'checksPassed':checks,'statistics':d['statistics'],'nativeDimensions':sorted({str(x[v]['nativeDimensions']) for x in d['looks'] for v in ('front','back','editorial')}),'protectedHistoricalBlobs':len(protected),'sourceChanges':changed,'nativePaths':native_paths,'masterPaths':master_paths,'limitations':'Garment continuity, true orientation, construction, casting and posing additionally reviewed visually; no automated face-identity or physical material certification claimed.'}
(D/'FINAL-TECHNICAL-AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ('nativePaths','masterPaths')},indent=2))
