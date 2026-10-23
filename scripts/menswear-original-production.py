"""Checkpoint immutable native outputs; export reviewed sets without retouching."""
from pathlib import Path
from PIL import Image, ImageChops
import argparse, hashlib, json, shutil, subprocess, urllib.request, urllib.parse, datetime, tempfile, os, fcntl

ROOT=Path(__file__).resolve().parents[1]
REVIEW=ROOT/'docs/portfolio/review/menswear-original-2026-2027'
REGISTRY=REVIEW/'PRODUCTION.json'
NATIVES=Path('assets/source/menswear-original-2026-2027')
EXPORTS=Path('public/portfolio/ai-concepts/menswear-2026-2027')

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def atomic(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 fd,tmp=tempfile.mkstemp(dir=path.parent,suffix='.tmp')
 try:
  with os.fdopen(fd,'w') as f:
   json.dump(value,f,indent=2); f.write('\n'); f.flush(); os.fsync(f.fileno())
  os.replace(tmp,path)
 finally:
  if os.path.exists(tmp): os.unlink(tmp)
def run(*args): return subprocess.check_output(args,cwd=ROOT,text=True).strip()

def validate_set(look):
 master=Image.open(ROOT/look['master']['path']);master.load()
 assert master.size==(5400,2700), 'Master geometry'
 assert len({look[v]['sha256'] for v in ('front','back','editorial')})==3, 'Views must be separate images'
 for i,view in enumerate(('front','back','editorial')):
  rec=look[view];native=ROOT/rec['nativePath'];im=Image.open(native);im.load()
  assert digest(native)==rec['sha256'], 'Native changed'
  assert im.size==(rec['nativeWidth'],rec['nativeHeight']), 'Native dimension mismatch'
  panel=Image.open(ROOT/rec['exportPath']);panel.load()
  assert panel.size==(1800,2700), 'Panel geometry'
  assert digest(ROOT/rec['exportPath'])==rec['exportSHA256'], 'Export changed'
  assert ImageChops.difference(master.crop((i*1800,0,(i+1)*1800,2700)),panel).getbbox() is None, 'Master panel differs'
  assert rec['nativeResolutionClaim'] is False, 'Resolution disclosure'
 out=ROOT/EXPORTS/look['id']
 for w in (900,1800,2700,3600):
  im=Image.open(out/f'master-{w}.webp');im.load();assert im.size==(w,w//2)
 return {'nativeHashes':True,'decoding':True,'individualGeometry':True,'masterGeometry':True,'exactMasterPanels':True,'responsiveGeometry':True,'threeDistinctFiles':True,'resolutionDisclosure':True}

def checkpoint(message,paths):
 run('git','add','--sparse','--',*[str(p) for p in paths])
 run('git','commit','-m',message)
 head=run('git','rev-parse','HEAD')
 run('git','push','origin',head+':refs/heads/feat/menswear-ai-photography-regeneration')
 verify_remote(head,paths)

def verify_remote(head,paths):
 remote=run('git','ls-remote','origin','refs/heads/feat/menswear-ai-photography-regeneration').split()[0]
 if head!=remote and subprocess.run(['git','merge-base','--is-ancestor',head,remote],cwd=ROOT).returncode:
  raise ValueError('Remote branch does not contain checkpoint')
 verified=[]
 for path in paths:
  path=Path(path)
  if not path.is_absolute(): path=ROOT/path
  if not path.is_file(): continue
  relative=str(path.relative_to(ROOT))
  if '/receipts/' in relative: continue
  committed=subprocess.check_output(['git','show',head+':'+relative],cwd=ROOT)
  expected=hashlib.sha256(committed).hexdigest()
  url='https://raw.githubusercontent.com/soufianeaberbach-sudo/portfolio/'+head+'/'+urllib.parse.quote(relative)
  with urllib.request.urlopen(url,timeout=60) as response: downloaded=response.read()
  if hashlib.sha256(downloaded).hexdigest()!=expected: raise ValueError('Remote byte verification failed: '+relative)
  verified.append({'path':relative,'sha256':expected,'gitBlob':run('git','rev-parse',head+':'+relative),'remoteBytesVerified':True})
 receipt=REVIEW/'receipts'/(head+'.json')
 atomic(receipt,{'commit':head,'branchHeadVerified':True,'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':verified})
 # Receipt is included by the next checkpoint (finalization commits all receipts).
 print('PUSHED_AND_REMOTE_BYTES_VERIFIED',head,len(verified),'files')

def register(a):
 registry=json.loads(REGISTRY.read_text()); look=next(l for l in registry['looks'] if l['id']==a.look)
 if not look['pilot']: raise ValueError('Owner gate: only eight pilots authorized')
 if look[a.view]: raise ValueError('Existing native protected; use an explicit version for any retry')
 source=Path(a.source); img=Image.open(source); img.load()
 if img.width>=img.height: raise ValueError('Expected individual portrait')
 target=ROOT/NATIVES/a.look/(a.view+'-native.png'); target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists(): raise ValueError('Native target already exists')
 shutil.copy2(source,target)
 if digest(source)!=digest(target): raise ValueError('Copy changed native bytes')
 if a.view!='front' and not look['front']: raise ValueError('Accepted Front required')
 look[a.view]={'nativePath':str(target.relative_to(ROOT)),'nativeWidth':img.width,'nativeHeight':img.height,
  'mode':img.mode,'bytes':target.stat().st_size,'sha256':digest(target),'tool':'OpenAI image_gen.imagegen',
  'toolOutputPath':str(source),'provenance':'Original AI fashion concept / visual exploration',
  'referenceInputs':[] if a.view=='front' else [look['front']['nativePath']],
  'agentVisualStatus':'PASS_FOR_OWNER_REVIEW','reviewNotes':a.notes,'ownerApproved':False,
  'exportPath':None,'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 look['productionStatus']='FRONT_REVIEWED' if a.view=='front' else 'COMPANIONS_IN_PROGRESS'
 atomic(REGISTRY,registry)
 paths=[target,REGISTRY]+list((REVIEW/'prompts').glob(a.look+'-*'))
 if (REVIEW/'receipts').exists(): paths+=list((REVIEW/'receipts').glob('*.json'))
 checkpoint('Save reviewed '+a.look+' '+a.view+' native and production record',paths)

def assemble(a):
 registry=json.loads(REGISTRY.read_text());look=next(l for l in registry['looks'] if l['id']==a.look)
 if look['master']: raise ValueError('Completed master protected')
 if not all(look[v] for v in ('front','back','editorial')): raise ValueError('Three genuine views required')
 out=ROOT/EXPORTS/a.look;out.mkdir(parents=True,exist_ok=True)
 panels=[]
 for view in ('front','back','editorial'):
  rec=look[view];im=Image.open(ROOT/rec['nativePath']).convert('RGB')
  # Uniform contain, never stretch or crop. White padding is outside native only.
  scale=min(1800/im.width,2700/im.height)
  size=(round(im.width*scale),round(im.height*scale)); resized=im.resize(size,Image.Resampling.LANCZOS)
  panel=Image.new('RGB',(1800,2700),'white');panel.paste(resized,((1800-size[0])//2,(2700-size[1])//2))
  path=out/(view+'.png');panel.save(path,compress_level=4)
  rec.update(exportPath=str(path.relative_to(ROOT)),exportDimensions=[1800,2700],uniformScale=scale,
   resampled=im.size!=(1800,2700),nativeResolutionClaim=False,exportSHA256=digest(path))
  panel.resize((600,900),Image.Resampling.LANCZOS).save(out/(view+'-600.webp'),quality=92,method=6)
  panels.append(panel)
 master=Image.new('RGB',(5400,2700),'white')
 for i,p in enumerate(panels):master.paste(p,(1800*i,0))
 master.save(out/'master.png',compress_level=4)
 for w in (900,1800,2700,3600):master.resize((w,w//2),Image.Resampling.LANCZOS).save(out/f'master-{w}.webp',quality=93,method=6)
 look['master']={'path':str((out/'master.png').relative_to(ROOT)),'dimensions':[5400,2700],
 'sha256':digest(out/'master.png'),'panelOrder':['front','back','editorial'],
 'disclosure':'Three separately generated native portraits uniformly resampled; 5400×2700 is export geometry, not native photographic resolution.'}
 look['setReview']={'agentVisualStatus':'PASS_FOR_OWNER_REVIEW','notes':a.notes,'ownerApproval':False,
 'scaleReview':'Full-length scale compared visually across native set; no anatomy or garment retouching',
 'limits':'Hidden construction, physical fit and performance not verified. Model continuity assessed visually.'}
 look['productionStatus']='PILOT_SET_READY_FOR_OWNER_REVIEW'
 look['focusedChecks']=validate_set(look)
 atomic(REGISTRY,registry)
 paths=list(out.glob('*'))+[REGISTRY]+list((REVIEW/'receipts').glob('*.json'))
 checkpoint('Assemble reviewed '+a.look+' three-view master and derivatives',paths)

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('operation',choices=['register','assemble']);p.add_argument('look')
 p.add_argument('--view',choices=['front','back','editorial']);p.add_argument('--source');p.add_argument('--notes',required=True)
 a=p.parse_args()
 # Serialize registry mutations, commits, pushes and verification in this clone.
 with open(ROOT/'.git/menswear-original-production.lock','w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if a.operation=='register':
   if not a.view or not a.source:p.error('register needs --view and --source')
   register(a)
  else:assemble(a)
