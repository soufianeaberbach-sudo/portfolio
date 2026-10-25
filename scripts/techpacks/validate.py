"""Cross-reference, dimensional and PDF checks. Visual/sample review remains separate."""
from pathlib import Path
import json,math,re,xml.etree.ElementTree as ET,argparse
R=Path(__file__).resolve().parents[2]
def validate_data(s,folder):
 errors=[]
 def check(ok,msg):
  if not ok:errors.append(msg)
 check(s['baseSize'] in s['sizes'],'base size missing')
 check(s['sizes']==['34','36','38','40','42'],'size order mismatch')
 for key in ['bom','operations','poms','details','assembly','pattern','qc','risks','evidence','assumptions','consumption']:
  check(bool(s.get(key)),f'{key} empty')
 ids=[b['id'] for b in s['bom']];check(len(ids)==len(set(ids)),'duplicate BOM ID')
 pids=[p['id'] for p in s['poms']];check(len(pids)==len(set(pids)),'duplicate POM ID')
 oids=[o['id'] for o in s['operations']];check(len(oids)==len(set(oids)),'duplicate operation ID')
 for o in s['operations']:
  check(o['view'] in ['front','back'],f'{o["id"]} invalid view')
  check(len(o['method'])>90,f'{o["id"]} incomplete method')
  check(set(o['bom'])<=set(ids),f'{o["id"]} missing BOM reference')
  check(len(o['point'])==2,f'{o["id"]} missing anchor')
 for b in s['bom']:
  check(all(str(b.get(k,'')) for k in ['item','specification','composition','colour','placement','quantity','unit','supplier','status']),f'{b["id"]} missing field')
  check(b['status']=='PROPOSED',f'{b["id"]} unsupported confirmed material')
 seen=[]
 for g in s['pomGroups']:
  f=folder/'drawings'/g['file'];check(f.exists(),f'missing diagram {f.name}')
  if f.exists():
   try:tree=ET.fromstring(f.read_text())
   except ET.ParseError:errors.append(f'invalid SVG {f.name}');continue
   actual=[n.attrib['data-pom'] for n in tree.iter() if 'data-pom' in n.attrib]
   check(actual==g['ids'],f'diagram {f.name} IDs mismatch');seen+=actual
 check(sorted(seen)==sorted(pids),'POM-to-diagram coverage mismatch')
 for p in s['poms']:
  check(p['unit']=='cm',f'{p["id"]} unit')
  check(set(p['values'])==set(s['sizes']),f'{p["id"]} missing size')
  check(p['tolerance']>=0 and p['tolerance']<=1.5,f'{p["id"]} tolerance')
  check(p['kind'] in ['half-flat','vertical','component','contour'],f'{p["id"]} measurement kind')
  check(p['grade']>=0,f'{p["id"]} unexpected negative grade')
  check(p['status']=='PROPOSED',f'{p["id"]} unverified approval')
  check(len(p['method'])>35,f'{p["id"]} method missing')
  check(p['points'][0]!=p['points'][1],f'{p["id"]} zero length arrow')
  for i,size in enumerate(s['sizes']):
   val=p['values'].get(size);check(isinstance(val,(int,float)) and val>0,f'{p["id"]} invalid dimension')
   if isinstance(val,(int,float)):check(math.isclose(val,p['base']+(i-2)*p['grade'],abs_tol=.011),f'{p["id"]} grade arithmetic')
 # Independent product-level constraints catch mistakes beyond schema validation.
 m={p['id']:p for p in s['poms']}
 if s['slot']==2:
  for size in s['sizes']:
   check(2*m['A']['values'][size]>s['bodyBasis'][size]['waist'],'trouser waist ease')
   check(2*m['B']['values'][size]>s['bodyBasis'][size]['hip'],'trouser seat ease')
   check(m['D']['values'][size]>m['E']['values'][size]+20,'trouser length/rise plausibility')
 if s['slot']==3:
  for size in s['sizes']:
   check(2*m['A']['values'][size]<s['bodyBasis'][size]['waist'],'legging negative waist ease')
   check(2*m['B']['values'][size]>=s['bodyBasis'][size]['hip'],'legging hip passage target')
   check(m['K']['values'][size]>m['E']['values'][size]+20,'legging length/rise plausibility')
 if s['slot']==4:
  check(m['F']['base']>m['E']['base'],'dress hem sweep insufficient')
  check(m['A']['base']>m['L']['base']+45,'dress upper/lower length mismatch')
 for file in ['front.svg','back.svg','colour-front.svg','colour-back.svg','callouts-front.svg','callouts-back.svg']:
  check((folder/'drawings'/file).exists(),f'{file} absent')
 for file in (folder/'drawings').rglob('*.svg'):
  try:ET.parse(file)
  except ET.ParseError:errors.append(f'malformed vector {file.name}')
 return errors

def main():
 import fitz
 from PIL import Image
 records=json.load(open(R/'src/data/techpacks.json'));results=[]
 for r in records:
  folder=R/'docs/techpacks'/r['slug'];s=json.load(open(folder/'style.json'));errors=validate_data(s,folder)
  f=R/'public'/r['pdfUrl'].lstrip('/');pages=[]
  if not f.exists():errors.append('PDF missing')
  else:
   doc=fitz.open(f)
   if len(doc)!=r['pageCount']:errors.append('page count mismatch')
   for i,page in enumerate(doc):
    txt=page.get_text()
    if len(txt.strip())<150:errors.append(f'page {i+1} insufficient selectable text')
    if page.rect.width<800 or page.rect.height<590:errors.append('incorrect landscape A4 geometry')
    for block in page.get_text('dict')['blocks']:
     for ln in block.get('lines',[]):
      for span in ln['spans']:
       x0,y0,x1,y1=span['bbox']
       if x0<0 or y0<0 or x1>page.rect.width+1 or y1>page.rect.height+1:errors.append(f'page {i+1} text off page')
       if '\ufffd' in span['text']:errors.append(f'page {i+1} replacement glyph')
    # Preserve every rendered page for actual visual review; this check alone is not visual approval.
    dest=f.parent/'review';dest.mkdir(exist_ok=True)
    for stale in dest.glob('page-*.png'):
     if int(stale.stem.split('-')[-1])>len(doc):stale.unlink()
    pix=page.get_pixmap(matrix=fitz.Matrix(1.8,1.8),alpha=False);pix.save(dest/f'page-{i+1:02}.png')
    if i==0:
     im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
     for w,name in [(1400,'cover.webp'),(900,'cover-900.webp')]:
      out=im.copy();out.thumbnail((w,2000));out.save(f.parent/name,quality=95,method=6)
    pages.append({'page':i+1,'selectableCharacters':len(txt),'vectorPaths':len(page.get_drawings())})
  for name in ['cover.webp','cover-900.webp']:
   if not (f.parent/name).exists():errors.append(name+' missing')
  results.append({'slug':r['slug'],'errors':errors,'pages':pages,'checks':'schema, BOM references, POM/diagram bijection, grade arithmetic, product dimensional relationships, vector XML, PDF page count/geometry/text bounds, page renders and previews'})
 out=R/'docs/techpacks/review/document-results.json';out.parent.mkdir(exist_ok=True);out.write_text(json.dumps(results,indent=2)+'\n')
 print(json.dumps([{k:r[k] for k in ['slug','errors']} for r in results],indent=2))
 if any(r['errors'] for r in results):raise SystemExit(1)
if __name__=='__main__':main()
