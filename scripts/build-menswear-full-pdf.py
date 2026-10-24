"""Portable review book from the forty selected triptych exports; never source replacement."""
from pathlib import Path
from PIL import Image
from io import BytesIO
import fitz,json
R=Path(__file__).resolve().parents[1];D=R/'docs/portfolio/review/menswear-full-production-2026-10-23'
d=json.loads((D/'PRODUCTION.json').read_text());assert d['statistics']['completedLooks']==40
pdf=fitz.open();cover=pdf.new_page(width=1400,height=1040)
cover.insert_image(fitz.Rect(0,0,1400,985),filename=str(D/'FORTY-LOOK-CONTACT-SHEET.jpg'),keep_proportion=True)
cover.insert_text((30,1010),'40 complete looks / 120 selected photographs / 40 masters. Original AI concepts; physical manufacture is not claimed.',fontsize=12)
toc=[[1,'Collection contact sheet',1]]
for i,x in enumerate(d['looks']):
 c=x['concept'];page=pdf.new_page(width=1400,height=900)
 page.insert_text((45,45),'ABERBACH / MENSWEAR 2026/2027',fontsize=14)
 title=f"{x['category'].upper()} / {x['position']:02d} / {c['name']} - {x['productSubtype']}"
 page.insert_text((45,85),title,fontsize=23)
 for n,label in enumerate(('FRONT','BACK','EDITORIAL')):page.insert_text((45+n*436,115),label,fontsize=10,color=(.4,.4,.4))
 preview=(R/x['master']['path']).with_name('master-2700.webp')
 with Image.open(preview) as im:
  b=BytesIO();im.convert('RGB').save(b,format='JPEG',quality=94,subsampling=0)
 page.insert_image(fitz.Rect(40,130,1360,790),stream=b.getvalue(),keep_proportion=True)
 page.insert_textbox(fitz.Rect(45,802,1355,834),'Proposed material: '+c['fabric']+'. Styling: '+c['styling'],fontsize=10,lineheight=1.2)
 page.insert_text((45,860),x['id']+' / Separate generated photographs. Native files retained. 1800 x 2700 panels; 5400 x 2700 assembled master; resampled exports.',fontsize=9,color=(.4,.4,.4))
 page.insert_text((45,880),'Autonomous visual selection. Final personal owner acceptance pending. No physical sample, manufacturing or certified textile performance claimed.',fontsize=9,color=(.4,.4,.4))
 toc.append([1,title,i+2])
pdf.set_toc(toc);pdf.set_metadata({'title':'ABERBACH - Menswear 2026/2027 - 40 looks / 120 selected photographs','author':'ABERBACH - original AI fashion concepts','subject':'Complete selected three-view collection; native resolution and physical provenance disclosed'})
pdf.save(D/'COLLECTION-REVIEW.pdf',garbage=4,deflate=True);print('Saved',len(pdf),'pages with all 40 selected masters')
