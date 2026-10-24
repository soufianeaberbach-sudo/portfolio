"""Read-only live verification of the forty concepts, delivery bytes and preserved sources."""
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin
import argparse, datetime, hashlib, json, urllib.request

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--base',default='https://aberbach.co')
parser.add_argument('--report',type=Path,required=True)
args=parser.parse_args()
catalog=json.loads((ROOT/'src/data/menswear-ai-production.json').read_text())['selectedCompleteLooks']
delivery=json.loads((ROOT/'src/data/menswear-web-images.json').read_text())['images']
historical=json.loads((ROOT/'docs/portfolio/review/menswear-full-production-2026-10-23/qa/SHARED-SOURCE-INTEGRITY.json').read_text())['subjects']
women=[x for x in json.loads((ROOT/'src/data/womenswear-generated.json').read_text()) if x['integrated']]

def request(path,method='GET'):
    req=urllib.request.Request(urljoin(args.base,path),method=method,
        headers={'User-Agent':'Aberbach-Menswear-Release-Verification/1.0','Cache-Control':'no-cache','Accept-Encoding':'identity'})
    with urllib.request.urlopen(req,timeout=45) as response:
        return response.status,{k.lower():v for k,v in response.headers.items()},response.read() if method=='GET' else b''

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.readers={};self.current=None;self.doors=[];self.films=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'data-mw-film' in a:self.films.append(a['data-mw-film'])
        if 'data-mw-archive-door' in a:self.doors.append(a['data-mw-archive-door'])
        if tag=='article' and ('data-mw-reader' in a or 'data-ww-reader' in a):
            self.current=a['data-subject'];self.readers[self.current]={'category':a['data-of'],'ai':a.get('data-ai-concept'),'images':[],'lookLinks':[]}
        if self.current and tag=='img':self.readers[self.current]['images'].append(a.get('src'))
        if self.current and 'data-mw-garment' in a:self.readers[self.current]['lookLinks'].append(a.get('href'))
    def handle_endtag(self,tag):
        if tag=='article':self.current=None

status,headers,body=request('/portfolio/');assert status==200
page=Page();page.feed(body.decode())
assert page.films==['m-streetwear','m-activewear','m-rtw','m-tailoring']
assert len(page.doors)==40 and len(set(page.doors))==40
assert set(page.doors)=={x['id'] for x in catalog}
selected=[]
for look in catalog:
    r=page.readers[look['id']]
    assert r['category']==look['category'] and r['ai']=='true' and len(r['lookLinks'])==2,look['id']
    expected=[delivery[look['views'][v]['src']]['src'] for v in ('front','back','editorial')]
    assert r['images']==expected,(look['id'],r['images'])
    selected.extend(delivery[look['views'][v]['src']]['exports'][-1] for v in ('front','back','editorial'))
for source in historical:
    r=page.readers[source['id']]
    assert r['category']==source['category'] and r['images'][0]==source['src'],source['id']
for source in women:
    r=page.readers[source['id']]
    assert r['category']==source['category'] and r['images'][0]==source['image']['src'],source['id']

def verify_image(image):
    status,headers,body=request(image['src'])
    actual=hashlib.sha256(body).hexdigest()
    assert status==200 and actual==image['sha256'],image['src']
    return {'path':image['src'],'bytes':len(body),'sha256':actual,'verified':True}

def verify_master(look):
    status,headers,_=request(look['master'],'HEAD')
    assert status==200 and 'image/png' in headers.get('content-type',''),look['master']
    return {'look':look['id'],'path':look['master'],'status':status,'contentType':headers.get('content-type'),'contentLength':headers.get('content-length')}

with ThreadPoolExecutor(max_workers=6) as pool:images=list(pool.map(verify_image,selected))
with ThreadPoolExecutor(max_workers=6) as pool:masters=list(pool.map(verify_master,catalog))
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':urljoin(args.base,'/portfolio/'),
    'htmlSHA256':hashlib.sha256(body).hexdigest(),'httpStatus':status,'cfRay':headers.get('cf-ray'),
    'categories':page.films,'featuredLooks':40,'selectedViewsMappedAndByteVerified':len(images),'mastersAvailable':len(masters),
    'historicalSubjectsWithExactSourcePreserved':len(historical),'womenswearAIIdentitiesAndImagesPreserved':len(women),
    'imageFiles':images,'masters':masters,'method':'All 120 live delivery files downloaded and SHA256 matched; all forty live masters checked by HEAD. Master/native decoding and hashes additionally audited locally and in Git. No form submissions or remote mutations.'}
args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('imageFiles','masters')},indent=2))
