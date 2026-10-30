#!/usr/bin/env python3
"""Independent canonical-data and A4 export checks; visual review is a separate step."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET
import fitz
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'scripts/cv'
DATA=json.loads((SRC/'career.json').read_text())
PHOTO=json.loads((SRC/'portrait-source.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(SRC/PHOTO['file'])==PHOTO['sourceSHA256'],'Original owner photograph changed'
with Image.open(SRC/PHOTO['file']) as im:assert list(im.size)==PHOTO['pixelSize'] and im.mode=='RGB'
art=json.loads((SRC/'fashion-signature-source.json').read_text())
assert sha(SRC/art['file'])==art['sha256']
svg=(SRC/art['file']).read_text()
tree=ET.fromstring(svg)
assert list(tree.iter('{http://www.w3.org/2000/svg}path')),'Signature must contain editable vector paths'
assert all(word not in svg for word in ['<image','<filter','<rect','<circle','feGaussianBlur'])
assert tree[0].attrib['fill']=='none'
template=(SRC/'template.html').read_text()
assert 'src="{{portrait}}"' in template and 'mask-image' not in template and 'filter:' not in template
assert 'atelier-dress-form' not in template and 'portrait-cutout' not in template
assert DATA['schemaVersion']==5 and set(DATA['editions'])=={'en','fr','es'}
assert DATA['authoritativeSource']['kind']=='owner-canonical-fallback' and DATA['authoritativeSource']['status']=='owner-confirmed'
assert DATA['workingLanguages']==['ar','zgh','fr','en']
assert DATA['software']==['Gerber AccuMark','CLO3D','Lectra','Vetigraph','Optitex','Adobe Illustrator','Adobe Photoshop','Microsoft Excel']
assert DATA['editions']['en']['expertiseItems']==['Fashion Design & Product Development','Pattern Making & Grading','Fit & Construction','CAD / 3D','Technical Flats & Tech Packs','Womenswear & Menswear']
assert DATA['editions']['en']['summary']=='Fashion design with industrial depth. Over 12 years linking womenswear and menswear concepts to pattern engineering, fit and production requirements.'
assert DATA['editions']['en']['languageItems']==['Arabic','Amazigh','French','English']
expectedFacts=[
 ('Ava Marie','2022-05',None,'Senior Fashion Designer & Product Developer'),
 ('Lariconf','2021-06','2022-05','CAD Fashion Developer'),
 ('Loratex','2018-09','2021-05','CAD Development Supervisor'),
 ('Loratex','2017-09','2018-09','Production Planning Coordinator'),
 ('Roadtex','2016-02','2017-08','Quality Control & Production Specialist'),
 ('Loratex','2014-02','2016-01','Operations & Warehouse Coordinator')]
assert [(r['company'],r['start'],r['end'],r['title']['en']) for r in DATA['roles']]==expectedFacts
assert DATA['contentVerification']['status']=='owner-confirmed-canonical'
for role in DATA['roles']:
    assert set(role['title'])=={'en','fr','es'}
    assert role['scope']=={'en':[],'fr':[],'es':[]},'Unsupported employer-specific claims must not be added'
assert DATA['experienceYearsMinimum']==12 and 'education' not in DATA and 'certifications' not in DATA
parser=argparse.ArgumentParser()
parser.add_argument('--proof-dir',help='Inspect unpublished PNG/PDF review files outside public/')
parser.add_argument('--layout-preview-dir',help='Inspect unpublished PNG composition outside public/')
parser.add_argument('--locale',choices=['en','fr','es'],help='Explicit single-edition review')
args=parser.parse_args()
proof=bool(args.proof_dir or args.layout_preview_dir)
OUT=(ROOT/(args.proof_dir or args.layout_preview_dir)).resolve() if proof else ROOT/'public/cv'
expected={args.locale} if args.locale else {'en','fr','es'}
if proof:assert not OUT.is_relative_to((ROOT/'public').resolve())
else:assert expected.issubset(set(DATA['workflow']['approvedLocales'])),'Owner visual review is pending'
manifest=OUT/'layout-report.json' if proof else SRC/'export-layout.json'
assert manifest.exists(),'Render current PNG master first'
rows=json.loads(manifest.read_text())
assert len(rows)==len(expected) and {r['locale'] for r in rows}==expected
normalize=lambda s:re.sub(r'\s+',' ',s.replace('-\n','-')).strip()
photo_reference=None
for row in rows:
    l=row['locale'];stem=row['stem'];g=row['geometry']
    assert row['sourceSHA256']==sha(SRC/'career.json') and row['portraitSHA256']==PHOTO['sourceSHA256']
    assert all(sha(SRC/file)==digest for file,digest in row['productionSources'].items()),'Stale production source'
    assert row['layoutPreview'] is proof and row['careerVerified']
    if not proof:assert row['ownerVisualApproved']
    assert abs(g['brand']['width']-36.15625)<.05 and abs(g['brand']['height']-31.1875)<.05
    assert not g['clipped'] and g['lastRoleBottom']<=g['footerTop']-15
    assert all(f['status']=='loaded' for f in g['fonts'])
    assert g['portrait']['filter']=='none' and g['portrait']['maskImage']=='none','Portrait must stay sharp without blur/fade/masking'
    assert .08<=float(g['signature']['opacity'])<=.14
    assert g['signature']['x']>=g['copyRight']+4,'Fashion line art must be clear of professional text'
    with Image.open(OUT/(stem+'.png')) as raw:
        assert raw.size==(2480,3508) and all(abs(n-300)<.01 for n in raw.info.get('dpi',(0,0)))
        image=raw.convert('RGB')
        bounds=ImageChops.difference(image,Image.new('RGB',image.size,'white')).getbbox()
        assert bounds and min(bounds[0],bounds[1],image.width-bounds[2],image.height-bounds[3])>=118,bounds
        scale=2480/g['sheet']['width'];p=g['portrait']
        region=image.crop((round(p['x']*scale),round(p['y']*scale),round((p['x']+p['width'])*scale),round((p['y']+p['height'])*scale)))
        pixels=list(zip(*(region.getchannel(c).tobytes() for c in 'RGB')))
        assert sum(max(p)-min(p)>12 for p in pixels)/len(pixels)>.03
        if photo_reference is None:photo_reference=region.tobytes()
        else:assert region.tobytes()==photo_reference
        expected_pixels=image.tobytes()
    if args.proof_dir or not proof:
        with fitz.open(OUT/(stem+'.pdf')) as doc:
            assert len(doc)==1
            page=doc[0]
            assert abs(page.rect.width*25.4/72-210)<.001 and abs(page.rect.height*25.4/72-297)<.001
            rasters=[i for i in page.get_images() if i[2:4]==(2480,3508)]
            assert len(rasters)==1 and fitz.Pixmap(doc,rasters[0][0]).samples==expected_pixels
            text=normalize(page.get_text())
            assert all(s in text for s in ['Soufiane','Aberbach',DATA['email'],'aberbach.co','2014','2022'])
            for role in DATA['roles']:assert normalize(role['title'][l]) in text
            for tool in DATA['software']:assert tool in text
            for item in DATA['editions'][l]['expertiseItems']+DATA['editions'][l]['languageItems']:assert item in text
            assert normalize(DATA['editions'][l]['summary']) in text
            for paragraph in DATA['editions'][l]['practice']:assert normalize(paragraph) in text
            assert text.count('Loratex')==3 and text.index('Ava Marie')<text.index('Lariconf')<text.index('Roadtex')
            assert all(s not in text for s in ['Spanish','Espagnol','Español','Lorem ipsum','verification pending','11+'])
            assert len(page.get_links())>=4
            if proof:assert 'Unpublished design proof' in doc.metadata['title']
    print(l.upper()+': canonical data / A4 / 300 DPI / white safe margins / crisp original portrait / authentic SA / original transparent SVG / '+('exact searchable PDF — pass' if args.proof_dir or not proof else 'PNG composition — pass'))
print('English master prepared for requested owner visual review; no public replacement.' if proof else 'Release editions verified.')
