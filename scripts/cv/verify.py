#!/usr/bin/env python3
"""Independent factual, source, typography and print QA. Proofs cannot approve release."""
import argparse
import base64
import hashlib
import json
import re
from pathlib import Path
import fitz
from PIL import Image, ImageChops

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'scripts/cv'
DATA=json.loads((SRC/'career.json').read_text())
PHOTO=json.loads((SRC/'portrait-source.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(SRC/PHOTO['file'])==PHOTO['sourceSHA256'],'Original owner photograph changed'
assert sha(SRC/PHOTO['maskFile'])==PHOTO['maskSHA256'],'Background-removal mask changed'
with Image.open(SRC/PHOTO['file']) as im:
    assert list(im.size)==PHOTO['pixelSize'] and im.mode=='RGB'
with Image.open(SRC/PHOTO['maskFile']) as im:
    assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255)
atmosphere=json.loads((SRC/'atmosphere-source.json').read_text())
assert sha(SRC/atmosphere['file'])==atmosphere['sha256']
template=(SRC/'template.html').read_text()
assert 'mask-image:url("{{portraitMask}}")' in template and 'src="{{portrait}}"' in template
assert 'construction-detail' not in template and 'name__outline' not in template
assert DATA['schemaVersion']==4 and set(DATA['editions'])=={'en','fr','es'}
assert DATA['workingLanguages']==['ar','zgh','fr','en']
assert DATA['software']==['Gerber AccuMark','CLO3D','Lectra','Vetigraph','Optitex','Adobe Illustrator','Adobe Photoshop','Microsoft Excel']
expected=[
 ('Ava Marie','2022-05',None,'Senior Fashion Designer & Product Developer'),
 ('Lariconf','2021-06','2022-05','CAD Fashion Developer'),
 ('Loratex','2018-09','2021-05','CAD Development Supervisor'),
 ('Loratex','2017-09','2018-09','Production Planning Coordinator'),
 ('Roadtex','2016-02','2017-08','Quality Control & Production Specialist'),
 ('Loratex','2014-02','2016-01','Operations & Warehouse Coordinator')]
assert [(r['company'],r['start'],r['end'],r['title']['en']) for r in DATA['roles']]==expected
assert DATA['contentVerification']['status']=='verified-owner-site-facts-only'
for role in DATA['roles']:
    assert set(role['title'])=={'en','fr','es'}
    assert role['factSource']=='owner-confirmed-and-current-site'
    assert role['scope']=={'en':[],'fr':[],'es':[]},'Do not publish unsupported employer-specific duties'
assert DATA['experienceYearsMinimum']==12
assert 'education' not in DATA and 'certifications' not in DATA
parser=argparse.ArgumentParser()
parser.add_argument('--proof-dir',help='Inspect all six unpublished PNG/PDF review editions outside public/')
parser.add_argument('--layout-preview-dir',help='Inspect unpublished PNG-only layout outside public/')
args=parser.parse_args()
proof=bool(args.proof_dir or args.layout_preview_dir)
OUT=(ROOT/(args.proof_dir or args.layout_preview_dir)).resolve() if proof else ROOT/'public/cv'
if proof: assert not OUT.is_relative_to((ROOT/'public').resolve()),'Proof mode cannot approve public downloads'
else: assert DATA['authoritativeSource']['status']=='verified','Primary LinkedIn verification/release authorization is pending'
manifest=OUT/'layout-report.json' if proof else SRC/'export-layout.json'
assert manifest.exists(),'Render current A4 images first'
rows=json.loads(manifest.read_text());assert len(rows)==3 and {r['locale'] for r in rows}=={'en','fr','es'}
normalize=lambda s:re.sub(r'\s+',' ',s.replace('-\n','-')).strip()
photo_reference=None
for row in rows:
    l=row['locale'];stem=row['stem'];g=row['geometry']
    assert row['sourceSHA256']==sha(SRC/'career.json')
    assert row['portraitSHA256']==PHOTO['sourceSHA256'] and row['portraitMaskSHA256']==PHOTO['maskSHA256']
    assert all(sha(SRC/file)==digest for file,digest in row['productionSources'].items()),'Stale production source'
    assert row['layoutPreview'] is proof and row['careerVerified']
    if not proof: assert row['linkedinVerified']
    assert abs(g['brand']['width']-36.15625)<.05 and abs(g['brand']['height']-31.1875)<.05,'SA. differs from actual site mark'
    assert not g['clipped'] and g['lastRoleBottom']<=g['footerTop']-15
    assert g['languagesBottom']+8<=g['atelier']['y'],'Dress form interferes with sidebar text'
    assert all(f['status']=='loaded' for f in g['fonts'])
    with Image.open(OUT/(stem+'.png')) as raw:
        assert raw.size==(2480,3508) and all(abs(n-300)<.01 for n in raw.info.get('dpi',(0,0)))
        image=raw.convert('RGB');bounds=ImageChops.difference(image,Image.new('RGB',image.size,'white')).getbbox()
        assert bounds and min(bounds[0],bounds[1],image.width-bounds[2],image.height-bounds[3])>=118,bounds
        scale=2480/g['sheet']['width'];p=g['portrait']
        region=image.crop((round(p['x']*scale),round(p['y']*scale),round((p['x']+p['width'])*scale),round((p['y']+p['height'])*scale)))
        pixels=list(zip(*(region.getchannel(c).tobytes() for c in 'RGB')))
        assert sum(max(p)-min(p)>12 for p in pixels)/len(pixels)>.03
        if photo_reference is None:photo_reference=region.tobytes()
        else: assert region.tobytes()==photo_reference,'Portrait differs between language editions'
        expected_pixels=image.tobytes()
    pdf=OUT/(stem+'.pdf')
    if args.proof_dir or not proof:
        with fitz.open(pdf) as doc:
            assert len(doc)==1
            page=doc[0]
            assert abs(page.rect.width*25.4/72-210)<.001 and abs(page.rect.height*25.4/72-297)<.001
            images=[i for i in page.get_images() if i[2:4]==(2480,3508)]
            assert len(images)==1 and fitz.Pixmap(doc,images[0][0]).samples==expected_pixels,'PDF differs from reviewed PNG'
            text=normalize(page.get_text())
            assert all(s in text for s in ['Soufiane','Aberbach',DATA['email'],'aberbach.co','2014','2022'])
            for role in DATA['roles']: assert normalize(role['title'][l]) in text
            for tool in DATA['software']: assert tool in text
            for group in DATA['editions'][l]['skills']:
                assert normalize(group['heading']) in text
                for item in group['items']:assert normalize(item) in text
            for paragraph in DATA['editions'][l]['practice']:assert normalize(paragraph) in text
            assert DATA['editions'][l]['languages'] in text
            assert text.count('Loratex')==3 and text.index('Ava Marie')<text.index('Lariconf')<text.index('Roadtex')
            assert all(s not in text for s in ['Spanish','Espagnol','Español','Lorem ipsum','verification pending','vérification','verificación','11+'])
            assert '12 years' in text or '12 ans' in text or '12 años' in text
            assert len(page.get_links())>=4
            if proof:assert 'Unpublished design proof' in doc.metadata['title']
    print(f'{l.upper()}: A4 / 300 DPI / white safe margins / authentic SA / original-color RGB / known facts / '+('matching searchable PDF — pass' if args.proof_dir or not proof else 'PNG composition — pass'))
print('Unpublished design proofs verified; public release remains blocked.' if proof else 'All three final CV editions verified.')
