"""Download every selected native and master at an immutable commit, and verify actual bytes."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import datetime,hashlib,json,subprocess,urllib.parse,urllib.request
R=Path(__file__).resolve().parents[1];D=R/'docs/portfolio/review/menswear-full-production-2026-10-23'
d=json.loads((D/'PRODUCTION.json').read_text());head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();remote=subprocess.check_output(['git','ls-remote','origin','refs/heads/feat/menswear-ai-photography-regeneration'],cwd=R,text=True).split()[0]
assert head==remote,'push before final remote audit'
items=[]
for x in d['looks']:
 for v in ('front','back','editorial'):
  if x[v]:items.append((x[v]['nativePath'],x[v]['sha256'],'native'))
 if x['master']:items.append((x['master']['path'],x['master']['sha256'],'master'))
def verify(item):
 path,expected,kind=item
 url='https://raw.githubusercontent.com/soufianeaberbach-sudo/portfolio/'+head+'/'+urllib.parse.quote(path)
 for attempt in range(2):
  try:
   h=hashlib.sha256();size=0
   with urllib.request.urlopen(url,timeout=60) as response:
    while chunk:=response.read(1024*1024):h.update(chunk);size+=len(chunk)
   assert h.hexdigest()==expected,'SHA mismatch: '+path
   return {'path':path,'kind':kind,'sha256':expected,'bytes':size,'remoteBytesVerified':True}
  except Exception:
   if attempt:raise
verified=[];errors=[]
with ThreadPoolExecutor(max_workers=4) as pool:
 futures={pool.submit(verify,item):item for item in items}
 for future in as_completed(futures):
  try:verified.append(future.result())
  except Exception as e:errors.append({'path':futures[future][0],'error':str(e)})
  if (len(verified)+len(errors))%20==0:print('Remote byte verification',len(verified),'/',len(items),'errors',len(errors),flush=True)
report={'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commit':head,'remoteHead':remote,'remoteBranchHeadVerified':head==remote,'selectedNatives':sum(x['kind']=='native' for x in verified),'masters':sum(x['kind']=='master' for x in verified),'files':sorted(verified,key=lambda x:x['path']),'errors':errors}
(D/'FINAL-REMOTE-VERIFICATION.json').write_text(json.dumps(report,indent=2)+'\n');print('Verified',len(verified),'files; errors',len(errors));assert not errors
