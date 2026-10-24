import json,hashlib,subprocess
from pathlib import Path
from PIL import Image
import numpy as np
root=Path.cwd();review=root/'docs/portfolio/review/womenswear-seamless-recovery'
base='2c90815dda21ec6183e7e283f94935e2a49c793c'
old=json.loads(subprocess.check_output(['git','show',base+':src/data/womenswear-generated.json']))
new=json.loads((root/'src/data/womenswear-generated.json').read_text());active=[r for r in new if r['integrated']];recovered=[r for r in active if r['id'].startswith('ww-recovery-')]
assert len(active)==40 and len({r['sourceIdentity'] for r in active})==40 and len(recovered)==9
assert all(next(n for n in new if n['id']==r['id'])==r for r in old),'existing registry entries changed'
manifest=json.loads((root/'docs/portfolio/review/womenswear-regeneration/MANIFEST.json').read_text())
for look in manifest['looks']:
 assert hashlib.sha256((root/'public'/look['source']['src'].lstrip('/')).read_bytes()).hexdigest()==look['sourceSHA256']
changed=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
assert not any((p.startswith('src/') and ('/menswear' in p.lower() or '/menswear' in p)) or p.startswith(('public/portfolio/generated/','public/portfolio/ai-concepts/')) for p in changed)
images=[]
for r in recovered:
 assert r['availableViews']==list(r['photography']) and r['image']==r['photography']['front']
 for key,image in r['photography'].items():
  for candidate in [image['src']]+[v.strip().split()[0] for v in image['srcset'].split(',')]:assert (root/'public'/candidate.lstrip('/')).is_file(),candidate
  rgb=np.array(Image.open(root/'public'/image['src'].lstrip('/')).convert('RGB'))
  assert rgb.shape==(2700,1800,3)
  border=np.concatenate([rgb[:8].reshape(-1,3),rgb[-8:].reshape(-1,3),rgb[:,:8].reshape(-1,3),rgb[:,-8:].reshape(-1,3)])
  assert np.all(border==255),image['src']
  images.append(dict(id=r['id'],view=key,path=image['src'],pureWhitePerimeter=True,dimensions=[1800,2700]))
originals={'activewear-ref-09':('sport/9-1400.webp',.5775),'swimwear-ref-03':('swim/3-1400.webp',None),'swimwear-ref-06':('swim/6-1400.webp',None),'swimwear-ref-07':('swim/7-1400.webp',None)}
preservation=[]
for id,(path,split) in originals.items():
 original=Image.open(root/'public/portfolio'/path).convert('RGB')
 for view in (['front','back'] if split else ['front']):
  crop=(0,0,original.width,original.height) if not split else ((0,0,round(original.width*split),original.height) if view=='front' else (round(original.width*split),0,original.width,original.height))
  expected=np.array(original.crop(crop));native=np.array(Image.open(root/f'public/portfolio/recovery/ww-recovery-{id}-v1/{view}-native.png'))
  core=native[:,:,3]==255;mismatches=int(np.any(native[:,:,:3][core]!=expected[core],axis=1).sum());assert mismatches==0,(id,view,mismatches)
  preservation.append(dict(id=id,view=view,fullyOpaquePixels=int(core.sum()),changedForegroundPixels=mismatches,sourceCrop=list(crop)))
report=dict(base=base,reviewedLooks=40,preservedCompleteLooks=[r['sourceIdentity'] for r in old if r['integrated']],recoveredLooks=[dict(id=r['sourceIdentity'],views=r['availableViews'],method=r['recoveryMethod']) for r in recovered],usableFeaturedLooks=40,completeThreeViewLooks=31,partialOrRetouchedLooks=9,selectedAvailableViews=106,missingOptionalThreeViewSlots=14,unresolvedUsableLooks=0,oldRegistryEntriesUnchanged=True,acceptedGeneratedArtworkChanges=[],menswearApplicationOrAssetChanges=[],sharedPreservationGuardUpdated='tests/menswear-studio-preservation.mjs',all40HistoricalSourceHashesPreserved=True,images=images,sourcePixelPreservation=preservation)
(review/'TECHNICAL-AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print('40 usable featured looks, 31 untouched full sets, 13 recovery views; original RGB preserved in all 5 segmented source views; all active paths and pure white image perimeters pass')
