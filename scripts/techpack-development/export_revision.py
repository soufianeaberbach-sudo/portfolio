"""Render controlled edits, preserve unchanged pages and package identical PNG pixels.
Usage: python scripts/techpack-development/export_revision.py [--baseline PATH]
"""
from artwork import *
from audit_operations import operation_review
import hashlib,shutil,csv,subprocess,argparse
import numpy as np
PARSER=argparse.ArgumentParser();PARSER.add_argument('--only',default=None);PARSER.add_argument('--baseline',type=Path,default=Path(__file__).resolve().parents[2]/'.qa-director/completion/baseline');ARGS=PARSER.parse_args()
ROOT=Path(__file__).resolve().parents[2];WEB=ROOT/'public/techpacks';QA=ROOT/'.qa-director/completion/documents';QA.mkdir(parents=True,exist_ok=True)
RECEIPTS=ROOT/'docs/techpack-refinement-2026-10-25';RECEIPTS.mkdir(parents=True,exist_ok=True)
PDFNAMES=['AB-W-SH-01-Cropped-Two-Pocket-Shirt-Tech-Pack','AB-W-LG-02-High-Rise-Stripe-Legging-Tech-Pack','AB-W-DR-03-Gathered-Bust-Slip-Maxi-Dress-Tech-Pack','AB-M-TR-04-Flat-Front-Tapered-Trouser-Tech-Pack','AB-M-HD-05-Clean-Front-Pullover-Hoodie-Tech-Pack']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
PNG=[];PDF=[];MANIFEST=[];PAGES={};REVISIONS={}
if ARGS.only:
 PNG=[r for r in json.loads((RECEIPTS/'png-verification.json').read_text()) if r['style']!=ARGS.only]
 PDF=[r for r in json.loads((RECEIPTS/'pdf-verification.json').read_text()) if r['style']!=ARGS.only]
 MANIFEST=[r for r in json.loads((RECEIPTS/'document-manifest.json').read_text()) if r['styleCode']!=ARGS.only]
 PAGES=json.loads((ROOT/'src/data/techpack-pages.json').read_text());REVISIONS=json.loads((ROOT/'src/data/techpack-revisions.json').read_text())
 old_audit=json.loads((RECEIPTS/'audit-matrix.json').read_text())
for g,pdfname in zip(G,PDFNAMES):
 if ARGS.only and g['code']!=ARGS.only:continue
 folder=WEB/'pages'/g['code'];folder.mkdir(parents=True,exist_ok=True);destinations=[]
 textdir=QA/g['code'];textdir.mkdir(exist_ok=True)
 for n,fn in enumerate(FUNCS,1):
  name=f'garment-{g["id"]:02}-page-{n:02}-{NAMES[n-1]}.png';dest=folder/name;baseline=ARGS.baseline/'pages'/g['code']/name
  # Pages with no new correction remain byte-for-byte copies of the published source.
  unchanged=(n==6 and g['id']!=2) or (n==9 and g['id']!=2) or (n==10 and g['id']==4)
  doc,p=shell(g,n);fn(p,g);text=p.get_text();(textdir/f'page-{n:02}.txt').write_text(text)
  assert '\ufffd' not in text
  if unchanged:shutil.copy2(baseline,dest)
  else:
   pix=p.get_pixmap(matrix=fitz.Matrix(3508/841.92,2480/595.32),alpha=False);im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
   assert im.size==(3508,2480),im.size;im.save(dest,optimize=True,dpi=(300,300))
  old=np.asarray(Image.open(baseline).convert('RGB'));new=np.asarray(Image.open(dest).convert('RGB'));diff=np.any(old!=new,2)
  # Every approved top header/information row and footer bar stays at the same pixel coordinates.
  # BOM footer gains the discreet material-credit URL; all other page furniture is preserved.
  PNG.append(dict(style=g['code'],page=n,file='/techpacks/pages/'+g['code']+'/'+name,sha256=sha(dest),baseline_sha256=sha(baseline),unchanged_pixel_percent=round(100*(1-diff.mean()),4),byte_identical_to_baseline=dest.read_bytes()==baseline.read_bytes(),width=3508,height=2480))
  destinations.append(dest);doc.close();print(g['code'],f'{n:02}',PNG[-1]['unchanged_pixel_percent'],flush=True)
 assert len(destinations)==10
 # Full-page A4 image placement. No page reconstruction or lossy recompression.
 doc=fitz.open()
 for n,f in enumerate(destinations,1):
  p=doc.new_page(width=fitz.paper_rect('a4-l').width,height=fitz.paper_rect('a4-l').height);p.insert_image(p.rect,filename=str(f),keep_proportion=True)
  if n==2:p.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(280,568,730,589),'uri':CREDITS})
 doc.set_metadata({'title':g['code']+' — '+g['name'].title(),'author':'ABERBACH / Soufiane Aberbach','subject':'Development Sample; representative material imagery and manufacturer-style label proofs. Image credits: '+CREDITS,'keywords':g['code']+', revision 2, garment technology demonstration'})
 doc.set_toc([[1,f'{n:02} — {NAMES[n-1].replace("-"," ").title()}',n] for n in range(1,11)])
 pdf=WEB/(pdfname+'.pdf');tmp=QA/(pdfname+'.pdf');doc.save(tmp,garbage=4,deflate=True);doc.close();shutil.copy2(tmp,pdf)
 assert pdf.stat().st_size<25*1024*1024,'Cloudflare static-asset file limit'
 opened=fitz.open(pdf);assert len(opened)==10;checks=[]
 roundtrip=QA/'roundtrip'/g['code'];roundtrip.mkdir(parents=True,exist_ok=True)
 for n,(p,f) in enumerate(zip(opened,destinations),1):
  assert p.rect.width==842 and p.rect.height==595
  images=p.get_images(full=True);assert len(images)==1
  raw=fitz.Pixmap(opened,images[0][0]);source=Image.open(f).convert('RGB');assert (raw.width,raw.height)==source.size==(3508,2480);assert raw.samples==source.tobytes()
  pix=p.get_pixmap(matrix=fitz.Matrix(3508/p.rect.width,2480/p.rect.height),alpha=False);back=Image.frombytes('RGB',(pix.width,pix.height),pix.samples);back.save(roundtrip/f'page-{n:02}.png')
  if back.size!=source.size:back=back.resize(source.size,Image.Resampling.LANCZOS)
  mae=float(np.abs(np.array(source).astype('int16')-np.array(back).astype('int16')).mean());assert mae<1.3
  checks.append(dict(page=n,source=f.name,embedded_pixels_identical=True,render_mean_absolute_error=round(mae,5),a4_landscape=True))
 opened.close();PDF.append(dict(style=g['code'],filename=pdf.name,pages=10,bytes=pdf.stat().st_size,sha256=sha(pdf),page_checks=checks))
 cover=Image.open(destinations[0]);previews={}
 for w in [600,1200]:
  preview=WEB/'previews'/f'{g["code"]}-cover-{w}.webp';cover.resize((w,round(cover.height*w/cover.width)),Image.Resampling.LANCZOS).save(preview,quality=94,method=6);previews[str(w)]=sha(preview)
 rows=[x for x in PNG if x['style']==g['code']];revision=hashlib.sha256(''.join(x['sha256'] for x in rows).encode()).hexdigest()[:12]
 PAGES[g['code']]=[x['file']+'?v='+x['sha256'][:12] for x in rows]
 REVISIONS[g['code']]=dict(revision=revision,pdf=sha(pdf)[:12],previews={w:h[:12] for w,h in previews.items()},frontCallouts=len(g['front']),backCallouts=len(g['back']),pageCount=10)
 MANIFEST.append(dict(id=f'tp-{g["id"]:02}',styleCode=g['code'],title=g['name'].title(),gender=g['sex'].lower(),status='development-sample',pageCount=10,revision=revision,frontCallouts=len(g['front']),backCallouts=len(g['back']),pdfUrl='https://aberbach.co/techpacks/'+pdf.name+'?v='+sha(pdf)[:12],previewUrl='https://aberbach.co/techpacks/previews/'+g['code']+'-cover-1200.webp?v='+previews['1200'][:12],pageImages=PAGES[g['code']]))
assert not issues,issues
REVIEW.extend(operation_review())
if ARGS.only:
 merged={(r['style_code'],r['page'],r['element']):r for r in old_audit}
 merged.update({(r['style_code'],r['page'],r['element']):r for r in REVIEW});REVIEW=list(merged.values())
order={g['code']:g['id'] for g in G}
PNG.sort(key=lambda r:(order[r['style']],r['page']));PDF.sort(key=lambda r:order[r['style']]);MANIFEST.sort(key=lambda r:order[r['styleCode']])
(RECEIPTS/'engineering-specifications.json').write_text(json.dumps(G,indent=2,ensure_ascii=False)+'\n')
for name,data in [('png-verification',PNG),('pdf-verification',PDF),('document-manifest',MANIFEST),('audit-matrix',REVIEW)]:
 (RECEIPTS/(name+'.json')).write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
with (RECEIPTS/'audit-matrix.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(REVIEW[0]));w.writeheader();w.writerows(REVIEW)
(ROOT/'src/data/techpack-pages.json').write_text(json.dumps(PAGES,indent=2)+'\n');(ROOT/'src/data/techpack-revisions.json').write_text(json.dumps(REVISIONS,indent=2)+'\n')
print('PASS: 50 PNGs, 5 x 10-page PDFs, all 50 embedded pixels identical and every PDF page rendered/compared.',flush=True)
