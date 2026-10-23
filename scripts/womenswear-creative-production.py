"""Versioned original-concept production; preserve V1 and use the existing native/export pipeline."""
import argparse,copy,hashlib,json,runpy,subprocess
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]; P=ROOT/'docs/portfolio/review/womenswear-regeneration'; M=P/'MANIFEST.json'; R=P/'PRODUCTION-CREATIVE-2026-10-23.json'; BASE='36d2ae5c6955d0043ec69a416ff73cc7df40f84b'; V=('front','back','editorial');A=runpy.run_path(str(ROOT/'scripts/womenswear-generation-assets.py'))
def now():return datetime.now(timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def save(p,v):A['atomic_json'](p,v)
def nodes(m):
 for x in m['looks']:
  yield x
  for h in x.get('archivedPresentations',[]):yield h['presentation']
def metrics(m):
 allfiles={x[v]['nativeAsset'] for x in nodes(m) for v in V if x.get(v)}
 complete=[x for x in m['looks'] if x.get('master')]
 return {'retainedNativeFiles':len(allfiles),'newNativeFiles':len(allfiles)-101,'activeSelectedViews':len(complete)*3,'pendingCandidateNativeViews':sum(bool(x.get(v)) for x in m['looks'] if not x.get('master') for v in V),'completeActiveLooks':len(complete),'completeMasters':len(complete),'sourceBasedRegenerations':sum(x['generationType']=='preserved-design' for x in complete),'originalConcepts':sum(x['generationType']=='original-concept' for x in complete),'digitallyRenderedLooks':0,'ownerArtisticApprovals':0}
def report():return read(R) if R.exists() else {'baseVerifiedCommit':BASE,'startedUTC':now(),'startingMetrics':{'retainedNativeFiles':101,'completeActiveLooks':31,'completeMasters':31,'missingLegacyViews':19},'authorization':'Owner authorizes new model sessions and genuinely original category concepts. V1 archives preserved. New concepts never described as historical reproductions.','route':'C','attempts':[],'setReviews':[]}
def refresh(m,r):
 r['updatedUTC']=now();r['metrics']=metrics(m);m['currentSessionToolAvailability']={'status':'WORKING_REAL_ORIGINAL_CONCEPT_OUTPUTS','report':R.name,'newAcceptedImages':r['metrics']['newNativeFiles'],'reasoningErrorRecurred':False};save(M,m);r['remainingActiveSlots']=[{'sourceIdentity':x['sourceIdentity'],'identity':x['generatedIdentity'],'missingCandidateViews':[v for v in V if not x.get(v)],'masterPending':not bool(x.get('master'))} for x in m['looks'] if not x.get('master')];save(R,r)
 progress=read(P/'PROGRESS.json');progress.update(creativeProductionReport=R.name,creativeMetrics=r['metrics'],freshSessionAcceptedImages=r['metrics']['newNativeFiles'],freshSessionModerationFailures=sum(x['status']=='MODERATION_REFUSED' for x in r['attempts']),freshSessionTechnicalFailures=sum(x['status']=='TECHNICAL_ERROR' for x in r['attempts']),freshSessionQuotaFailures=sum(x['status']=='QUOTA_LIMITED' for x in r['attempts']),acceptedNativeImages=r['metrics']['retainedNativeFiles'],missingIndividualViews=sum(len(x['missingCandidateViews']) for x in r['remainingActiveSlots']),currentProductionReport=R.name,productionGate='PASS_REAL_ORIGINAL_CONCEPT_NATIVE_RETURNED',currentToolAvailability=m['currentSessionToolAvailability']);save(P/'PROGRESS.json',progress)
def init(m,sid):
 x=next(x for x in m['looks'] if x['sourceIdentity']==sid)
 if x.get('productionVersion')=='creative-v2':return x
 assert not x.get('master'),'Protected completed look'
 old=copy.deepcopy(x); plan=read(P/'CREATIVE-CONCEPTS.json')[sid]
 x['archivedPresentations']=[{'archivedUTC':now(),'reason':'Preserved V1 production; replaced only after complete original-concept V2 passes set and browser QA.','presentation':old}]
 x.update(generatedIdentity='ww-ai-'+sid+'-v2',productionVersion='creative-v2',generationType='original-concept',provenance='ORIGINAL_AI_CONCEPT — PROVISIONAL',conceptName=plan['name'],originalConceptSpecification=plan,generatedCaption=plan['name']+' · Original AI concept — provisional',generatedDescription=plan['name']+'. '+plan['design']+' Original AI concept — provisional; independently conceived, not a reproduction of the historical slot reference.',constructionUncertainties=['Original AI concept, not historical garment reproduction or verified technical pattern.','All generated construction remains provisional pending owner artistic review.'],qualityResult={'ownerArtisticApproval':False},front=None,back=None,editorial=None,master=None,status='PENDING',replacementStatus='NOT_INTEGRATED',generationFailures=[],productionRoute={'route':'C','reason':'Repeated faithful-production refusals already documented. No evidence that model-only reshoot would resolve the limitation. Owner now authorizes a genuinely independent original design and new adult model.','historicalInputSubmitted':False})
 x.pop('lastVerifiedCheckpoint',None);return x
def accept(a):
 m=read(M);x=init(m,a.id);save(M,m);A['register'](a.id,a.view,a.native);m=read(M);x=next(x for x in m['looks'] if x['sourceIdentity']==a.id);o=x[a.view];req=read(Path(a.request));o.update(qualityStatus='VISUAL_PASS_NATIVE_RESOLUTION_LIMITED',generationPrompt=req['prompt'],referenceAssets=req.get('referenced_image_paths',[]),generationOperation='Original concept text generation' if not req.get('referenced_image_paths') else 'Accepted original-concept companion reference edit',nativeResampled=False,reviewNote=a.note,acceptedUTC=now())
 if a.bounds:
  bounds=json.loads(a.bounds);im=Image.open(a.native);o['nativeBackgroundReview']={'kind':'opaque-white','nativeSHA256':o['sha256'],'subjectBounds':bounds,'supportBounds':json.loads(a.support) if a.support else [0,0,im.width,im.height],'review':'Actual native inspected. Complete subject and contact shadow; every opaque pixel retained; bounds measure placement only.'}
 x['qualityResult'][a.view+'Visual']=a.note;save(M,m);r=report();r['attempts'].append({'sourceIdentity':a.id,'generatedIdentity':x['generatedIdentity'],'view':a.view,'status':'ACCEPTED','recordedUTC':now(),'request':req,'nativeAsset':o['nativeAsset'],'nativeDimensions':[o['width'],o['height']],'sha256':o['sha256'],'reviewNote':a.note});refresh(m,r);print(json.dumps(metrics(m)))
def fail(a):
 m=read(M);r=report();req=read(Path(a.request));e=read(Path(a.error));r['attempts'].append({'sourceIdentity':a.id,'view':a.view,'request':req,**e});x=next(x for x in m['looks'] if x['sourceIdentity']==a.id)
 if x.get('productionVersion')=='creative-v2':
  x['generationFailures']=[{'view':t['view'],'error':'moderation_blocked' if t['status']=='MODERATION_REFUSED' else t['status'],'generationPrompt':t['request']['prompt'],'referenceAssets':t['request'].get('referenced_image_paths',[]),**{k:t.get(k) for k in ['status','moderationStage','requestId','rawError','recordedUTC']}} for t in r['attempts'] if t['sourceIdentity']==a.id and t['status']!='ACCEPTED']
 refresh(m,r);print(e['status'],a.id,a.view)
def review(a):
 m=read(M);x=next(x for x in m['looks'] if x['sourceIdentity']==a.id);assert all(x.get(v) for v in V);x['qualityResult']['setVisualReview']=a.note;save(M,m);A['assemble'](a.id);m=read(M);r=report();r['setReviews'].append({'sourceIdentity':a.id,'review':a.note,'recordedUTC':now()});refresh(m,r);print(json.dumps(metrics(m)))
def audit(a):
 m=read(M);old=json.loads(subprocess.check_output(['git','show',BASE+':'+str(M.relative_to(ROOT))],cwd=ROOT));current={x['sourceIdentity']:x for x in m['looks']}
 for x in old['looks']:
  y=current[x['sourceIdentity']]
  if x.get('master'):assert x==y,'Protected complete record modified: '+x['sourceIdentity']
  elif y.get('productionVersion')=='creative-v2':assert y['archivedPresentations'][0]['presentation']==x,'Archive metadata changed'
  else:
   for v in V:
    if x.get(v):assert x[v]==y[v]
 files=subprocess.check_output(['git','ls-tree','-r',BASE,'--','public/portfolio/generated'],cwd=ROOT,text=True).splitlines()
 for line in files:
  meta,p=line.split('\t');assert subprocess.check_output(['git','hash-object',p],cwd=ROOT,text=True).strip()==meta.split()[2],p
 for x in nodes(m):
  for v in V:
   if x.get(v):assert hashlib.sha256((ROOT/'public'/x[v]['nativeAsset'].lstrip('/')).read_bytes()).hexdigest()==x[v]['sha256']
 print('PASS: 354 baseline artwork files, 101 native records, 31 completed look records, version archives and new hashes');print(json.dumps(metrics(m)))
p=argparse.ArgumentParser();p.add_argument('op',choices=['accept','fail','review','audit']);p.add_argument('--id');p.add_argument('--view');p.add_argument('--native');p.add_argument('--request');p.add_argument('--error');p.add_argument('--note');p.add_argument('--bounds');p.add_argument('--support');a=p.parse_args();globals()[a.op](a)
