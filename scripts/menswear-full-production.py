"""Versioned 120-view queue, immutable sources, proportional exports and remote checkpoints."""
from pathlib import Path
import argparse,datetime,fcntl,importlib.util,json,shutil
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1]
REVIEW=ROOT/'docs/portfolio/review/menswear-full-production-2026-10-23'
MANIFEST=REVIEW/'PRODUCTION.json'
EXPORTS=ROOT/'public/portfolio/ai-concepts/menswear-full-2026-2027'
spec=importlib.util.spec_from_file_location('original_production',ROOT/'scripts/menswear-original-production.py');base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base);base.REVIEW=REVIEW
VIEWS=('front','back','editorial')
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def read():return json.loads(MANIFEST.read_text())
def sync(data):
 for item in data['queue']:
  look=next(x for x in data['looks'] if x['id']==item['look'])
  if look[item['view']]:item['state']='SELECTED'
  elif item['state']=='SELECTED':raise ValueError('Selected view disappeared')
 data['statistics']={'targetLooks':40,'targetViews':120,'completedLooks':sum(bool(x.get('master')) for x in data['looks']),'acceptedActivePhotographs':sum(bool(x[v]) for x in data['looks'] for v in VIEWS),'incompleteLooks':sum(not x.get('master') for x in data['looks']),'completedMasters':sum(bool(x.get('master')) for x in data['looks']),'unresolvedViews':[x['key'] for x in data['queue'] if x['state']!='SELECTED'],'failedGenerationAttempts':sum(x['outcome'] in ('PROVIDER_ERROR','REJECTED_VISUAL','INTERRUPTED_NO_OUTPUT') for x in data['attempts'])}
 base.atomic(MANIFEST,data)
 publish_catalog(data)

def publish_catalog(data):
 records=[]
 for x in data['looks']:
  if not x['master']:continue
  c=x['concept'];views={}
  for v in VIEWS:
   rec=x[v];views[v]={'src':'/'+rec['exportPath'].removeprefix('public/'),'preview':'/'+rec['previewPath'].removeprefix('public/'),'width':1800,'height':2700,'alt':c['name']+' — '+x['productSubtype']+', '+v+' view. Original AI fashion concept.'}
  records.append({'id':x['id'],'category':x['technicalCategoryId'],'position':x['position'],'title':c['name'],'product':x['productSubtype'],'fabric':c['fabric'],'construction':c.get('actualSelectedDesign',c['silhouette']+'; '+c['seams']+'; '+c['pockets']),'styling':c['styling'],'colour':c['colour'],'views':views,'master':'/'+x['master']['path'].removeprefix('public/'),'ownerArtisticAcceptance':'PENDING','provenance':'Original AI fashion concept / visual exploration. Material and construction are design intent; no physical sample or manufactured project is claimed.'})
 base.atomic(ROOT/'src/data/menswear-ai-production.json',{'collectionId':data['collectionId'],'selectedCompleteLooks':records})

def normalize(rec):
 rec=dict(rec)
 rec['nativeDimensions']=rec.get('nativeDimensions',[rec.get('nativeWidth'),rec.get('nativeHeight')]);rec['agentSelection']='SELECTED_AUTONOMOUS';rec['ownerArtisticAcceptance']='PENDING';rec['nativeHighResolutionClaim']=False
 im=Image.open(ROOT/rec['nativePath']);im.load();assert list(im.size)==rec['nativeDimensions'];assert base.digest(ROOT/rec['nativePath'])==rec['sha256']
 rec['nativeBytes']=(ROOT/rec['nativePath']).stat().st_size
 ex=Image.open(ROOT/rec['exportPath']);ex.load();assert ex.size==(1800,2700)
 rec['previewPath']=rec.get('previewPath',str(Path(rec['exportPath']).with_name(Path(rec['exportPath']).stem+'-600.webp')))
 rec['previewSHA256']=base.digest(ROOT/rec['previewPath']);return rec

def checkpoint(message,paths):
 paths=[Path(p) for p in paths]+[MANIFEST,ROOT/'src/data/menswear-ai-production.json']+list((REVIEW/'receipts').glob('*.json'))
 base.checkpoint(message,list(dict.fromkeys(paths)))

def register(a):
 data=read();look=next(x for x in data['looks'] if x['id']==a.look)
 assert not look[a.view],'Selected view protected: use explicit supersession/version workflow'
 if a.view!='front':assert look['front'],'Companion needs accepted Front'
 im=Image.open(a.source);im.load();assert im.height>im.width
 version=1+sum(t['outcome']=='REJECTED_VISUAL' and t['look']==a.look and t['view']==a.view for t in data['attempts'])
 target=ROOT/'assets/source/menswear-full-2026-2027'/a.look/(a.view+f'-v{version:02d}-native.png');assert not target.exists()
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(a.source,target);assert base.digest(Path(a.source))==base.digest(target)
 out=EXPORTS/a.look;out.mkdir(parents=True,exist_ok=True);scale=min(1800/im.width,2700/im.height);size=(round(im.width*scale),round(im.height*scale))
 panel=Image.new('RGB',(1800,2700),'white');panel.paste(im.convert('RGB').resize(size,Image.Resampling.LANCZOS),((1800-size[0])//2,(2700-size[1])//2));panel.save(out/(a.view+'.png'),compress_level=4);panel.resize((600,900),Image.Resampling.LANCZOS).save(out/(a.view+'-600.webp'),quality=93,method=6)
 prompt=ROOT/a.prompt if getattr(a,'prompt',None) else REVIEW/'prompts'/(a.look+'-'+a.view+'.txt')
 rec={'nativePath':str(target.relative_to(ROOT)),'nativeDimensions':list(im.size),'nativeBytes':target.stat().st_size,'nativeMode':im.mode,'sha256':base.digest(target),'tool':'OpenAI image_gen.imagegen','toolOutputPath':a.source,'generatedAt':now(),'referenceInputs':getattr(a,'references',[]) if a.view=='front' else [look['front']['nativePath']],'promptPath':str(prompt.relative_to(ROOT)),'promptSHA256':base.digest(prompt),'exportPath':str((out/(a.view+'.png')).relative_to(ROOT)),'exportSHA256':base.digest(out/(a.view+'.png')),'previewPath':str((out/(a.view+'-600.webp')).relative_to(ROOT)),'previewSHA256':base.digest(out/(a.view+'-600.webp')),'exportDimensions':[1800,2700],'uniformScale':scale,'resampled':size!=im.size,'nativeHighResolutionClaim':False,'agentSelection':'SELECTED_AUTONOMOUS','ownerArtisticAcceptance':'PENDING','reviewNotes':a.notes,'provenance':'Original AI fashion concept / visual exploration; no physical development or client manufacturing claimed'}
 look[a.view]=rec;look['status']='VIEWS_IN_PROGRESS';data['attempts'].append({'look':a.look,'view':a.view,'pass':data['currentPass'],'outcome':'SELECTED','at':now(),'notes':a.notes,'nativePath':rec['nativePath']});sync(data)
 checkpoint('feat(menswear): save '+a.look+' '+a.view,[target,prompt,out/(a.view+'.png'),out/(a.view+'-600.webp')])

def assemble(look_id,notes):
 data=read();look=next(x for x in data['looks'] if x['id']==look_id);assert not look['master'];assert all(look[v] for v in VIEWS)
 assert len({look[v]['sha256'] for v in VIEWS})==3
 out=EXPORTS/look_id;out.mkdir(parents=True,exist_ok=True);master=Image.new('RGB',(5400,2700),'white')
 for i,v in enumerate(VIEWS):
  rec=look[v];im=Image.open(ROOT/rec['exportPath']);im.load();assert im.size==(1800,2700);master.paste(im,(i*1800,0))
 master.save(out/'master.png',compress_level=4)
 for w in (900,1800,2700,3600):master.resize((w,w//2),Image.Resampling.LANCZOS).save(out/f'master-{w}.webp',quality=93,method=6)
 look['master']={'path':str((out/'master.png').relative_to(ROOT)),'sha256':base.digest(out/'master.png'),'dimensions':[5400,2700],'panelOrder':list(VIEWS),'disclosure':'Three genuinely separate generated portraits, uniformly resampled. Export geometry is not native photographic detail.'}
 look['status']='COMPLETE_AUTONOMOUS_SELECTION';look['setReview']={'at':now(),'modelAndOutfitContinuity':'PASS_VISUAL','trueRear':'PASS_VISUAL','editorialFashionPose':'PASS_VISUAL','notes':notes,'ownerArtisticAcceptance':'PENDING','limitations':'Visual assessment only; no physical fit, hidden construction or material/performance testing.'};sync(data)
 checkpoint('feat(menswear): complete '+look_id,[*out.glob('*')])

def validate():
 data=read();assert len(data['looks'])==40 and len(data['queue'])==120;assert len({x['key'] for x in data['queue']})==120
 hashes=[]
 for look in data['looks']:
  assert look['ownerArtisticAcceptance']=='PENDING'
  for v in VIEWS:
   rec=look[v]
   if not rec:continue
   for pk,hk in [('nativePath','sha256'),('exportPath','exportSHA256'),('previewPath','previewSHA256')]:assert base.digest(ROOT/rec[pk])==rec[hk],rec[pk]
   im=Image.open(ROOT/rec['nativePath']);im.load();assert list(im.size)==rec['nativeDimensions'];assert not rec['nativeHighResolutionClaim'];hashes.append(rec['sha256'])
   im=Image.open(ROOT/rec['exportPath']);im.load();assert im.size==(1800,2700)
  if look['master']:
   assert all(look[v] for v in VIEWS);im=Image.open(ROOT/look['master']['path']);im.load();assert im.size==(5400,2700);assert base.digest(ROOT/look['master']['path'])==look['master']['sha256']
   for i,v in enumerate(VIEWS):assert ImageChops.difference(im.crop((i*1800,0,(i+1)*1800,2700)),Image.open(ROOT/look[v]['exportPath']).convert('RGB')).getbbox() is None
 assert len(hashes)==len(set(hashes)),'Duplicate selected native'
 for cat in ('Casualwear','Activewear','Outerwear','Tailoring'):assert len([x for x in data['looks'] if x['category']==cat])==10
 sync(data);print(json.dumps(data['statistics'],indent=2))

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('operation',choices=['register','assemble','validate']);p.add_argument('--look');p.add_argument('--view',choices=VIEWS);p.add_argument('--source');p.add_argument('--notes');a=p.parse_args()
 with open(ROOT/'.git/menswear-full-production.lock','w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if a.operation=='register':register(a)
  elif a.operation=='assemble':assemble(a.look,a.notes)
  else:validate()
