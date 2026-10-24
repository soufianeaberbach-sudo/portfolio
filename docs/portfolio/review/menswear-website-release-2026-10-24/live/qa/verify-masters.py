"""Verify unchanged masters by downloading and decoding actual production responses."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import datetime, hashlib, io, json, urllib.request

root=Path('/workspace/portfolio-menswear-release')
looks=json.loads((root/'src/data/menswear-ai-production.json').read_text())['selectedCompleteLooks']
def verify(look):
    expected=hashlib.sha256((root/('public'+look['master'])).read_bytes()).hexdigest()
    request=urllib.request.Request('https://aberbach.co'+look['master'],headers={'User-Agent':'Aberbach-Menswear-Release-Verification/1.0','Accept-Encoding':'identity'})
    with urllib.request.urlopen(request,timeout=90) as response:
        data=response.read();assert response.status==200
    actual=hashlib.sha256(data).hexdigest();assert actual==expected,look['id']
    with Image.open(io.BytesIO(data)) as image:
        size=image.size;assert size==(5400,2700),look['id'];image.verify()
    return {'look':look['id'],'path':look['master'],'bytes':len(data),'sha256':actual,'dimensions':size,'decoding':'passed','matchesMergedMain':True}
with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(verify,looks))
report={'url':'https://aberbach.co','sourceCommit':'a806acf1d0da0df28b5e2c52aab468de577250ca','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':len(results),'downloadedBytes':sum(r['bytes'] for r in results),'masters':results}
Path('/workspace/menswear-release-live-2026-10-24/MASTER-BYTES.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='masters'}))
