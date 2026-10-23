"""Preserve unapproved corrected-direction Front candidates. No bulk-production gate bypass."""
from pathlib import Path
import argparse, datetime, fcntl, hashlib, importlib.util, json, shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
REVIEW=ROOT/'docs/portfolio/review/menswear-direction-reset-2026-10-23'
REGISTRY=REVIEW/'PRODUCTION.json'
spec=importlib.util.spec_from_file_location('menswear_original_production',ROOT/'scripts/menswear-original-production.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base);base.REVIEW=REVIEW

def register(look_id,source,notes):
 data=json.loads(REGISTRY.read_text());look=next(x for x in data['looks'] if x['id']==look_id)
 assert data['gate']=='FOUR_FRONT_CANDIDATES_ONLY' and look['representativeFront'], 'Only four representative Fronts authorized'
 assert not any(look[k] for k in ('front','back','editorial','master')), 'Existing result protected; explicit version required'
 source=Path(source);im=Image.open(source);im.load();assert im.height>im.width,'Portrait required'
 target=ROOT/'assets/source/menswear-corrected-2026-2027'/look_id/'front-native.png'
 assert not target.exists(),'Native target protected'
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target);assert base.digest(source)==base.digest(target)
 out=ROOT/'public/portfolio/ai-concepts/menswear-corrected-2026-2027'/look_id;out.mkdir(parents=True,exist_ok=True)
 scale=min(1800/im.width,2700/im.height);size=(round(im.width*scale),round(im.height*scale))
 panel=Image.new('RGB',(1800,2700),'white');panel.paste(im.convert('RGB').resize(size,Image.Resampling.LANCZOS),((1800-size[0])//2,(2700-size[1])//2))
 panel.save(out/'front.png',compress_level=4);panel.resize((600,900),Image.Resampling.LANCZOS).save(out/'front-600.webp',quality=93,method=6)
 prompt=REVIEW/'prompts'/(look_id+'-front.txt')
 look['front']={'nativePath':str(target.relative_to(ROOT)),'nativeDimensions':[im.width,im.height],'nativeMode':im.mode,'nativeBytes':target.stat().st_size,'sha256':base.digest(target),'tool':'OpenAI image_gen.imagegen','toolOutputPath':str(source),'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'referenceInputs':[],'promptPath':str(prompt.relative_to(ROOT)),'promptSHA256':base.digest(prompt),'exportPath':str((out/'front.png').relative_to(ROOT)),'exportDimensions':[1800,2700],'exportSHA256':base.digest(out/'front.png'),'previewPath':str((out/'front-600.webp').relative_to(ROOT)),'previewSHA256':base.digest(out/'front-600.webp'),'uniformScale':scale,'resampled':size!=im.size,'nativeHighResolutionClaim':False,'agentVisualQC':'PASS_FOR_OWNER_REVIEW','reviewNotes':notes,'ownerApproval':'PENDING','provenance':'Original AI fashion concept / visual exploration; no physical development or manufactured-product authorship claimed'}
 look['status']='FRONT_CANDIDATE_PENDING_OWNER';base.atomic(REGISTRY,data)
 paths=[target,REGISTRY,prompt]+list(out.iterdir())+list((REVIEW/'receipts').glob('*.json'))
 base.checkpoint('Preserve corrected-direction '+look_id+' Front candidate',paths)

def validate():
 data=json.loads(REGISTRY.read_text());plan=json.loads((REVIEW/'COLLECTION-PLAN.json').read_text())
 assert len(data['looks'])==40 and len({x['id'] for x in data['looks']})==40
 assert len(plan['looks'])==40
 for category in ('Casualwear','Activewear','Outerwear','Tailoring'):
  group=[x for x in plan['looks'] if x['category']==category];assert len(group)==10
  assert len({x['product'] for x in group})==10
  for x in group:
   for key in ('fabric','silhouette','fit','collar','shoulder','sleeves','seams','pockets','waist','fastenings','hem','colour','styling','casting','threeViewPlan'):assert x[key],(x['id'],key)
 assert sum(x['representativeFront'] for x in data['looks'])==4
 assert not data['ownerTaxonomyApproval'] and not data['ownerCreativeDirectionApproval']
 assert data['ownerApprovedActivePhotographs']==0
 count=0
 for look in data['looks']:
  assert look['ownerApproval']=='PENDING'
  assert all(look[k] is None for k in ('back','editorial','master')),'Stop at four Front gate'
  rec=look['front']
  if not rec:continue
  count+=1;assert look['representativeFront']
  assert not rec['referenceInputs'] and rec['ownerApproval']=='PENDING' and not rec['nativeHighResolutionClaim']
  for pkey,hkey in [('nativePath','sha256'),('exportPath','exportSHA256'),('previewPath','previewSHA256'),('promptPath','promptSHA256')]:assert base.digest(ROOT/rec[pkey])==rec[hkey]
  native=Image.open(ROOT/rec['nativePath']);native.load();assert list(native.size)==rec['nativeDimensions']
  ex=Image.open(ROOT/rec['exportPath']);ex.load();assert ex.size==(1800,2700)
  preview=Image.open(ROOT/rec['previewPath']);preview.load();assert preview.size==(600,900)
 return {'looks':40,'categories':4,'distinctProductTypesPerCategory':10,'frontCandidates':count,'ownerApprovedActivePhotographs':0,'remainingViews':120-count,'nativeHashesAndDecoding':True,'exportGeometry':True,'promptsAndProvenance':True,'approvalGateRespected':True}

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('operation',choices=['register','validate']);p.add_argument('--look');p.add_argument('--source');p.add_argument('--notes');a=p.parse_args()
 with open(ROOT/'.git/menswear-reset.lock','w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if a.operation=='register':
   if not all((a.look,a.source,a.notes)):p.error('register requires look, source, notes')
   register(a.look,a.source,a.notes)
  else:print(json.dumps(validate(),indent=2))
