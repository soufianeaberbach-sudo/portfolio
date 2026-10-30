#!/usr/bin/env python3
"""Independent CV source, image and print checks. Drafts never pass release QA."""
import argparse
import json
import hashlib
import re
from pathlib import Path
import fitz
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / 'scripts/cv/career.json').read_text())
PORTRAIT = json.loads((ROOT / 'scripts/cv/portrait-source.json').read_text())
portrait_bytes = (ROOT / 'scripts/cv' / PORTRAIT['file']).read_bytes()
assert hashlib.sha256(portrait_bytes).hexdigest() == PORTRAIT['sourceSHA256'], 'Owner portrait source has changed'
with Image.open(ROOT / 'scripts/cv' / PORTRAIT['file']) as photo:
    assert list(photo.size) == PORTRAIT['pixelSize'] and photo.mode == 'RGB'
parser = argparse.ArgumentParser()
parser.add_argument('--layout-preview-dir', help='Inspect draft PNG composition only; does not approve release exports')
args = parser.parse_args()
preview = bool(args.layout_preview_dir)
OUT = ROOT / args.layout_preview_dir if preview else ROOT / 'public/cv'
layout_path = OUT / 'layout-report.json' if preview else ROOT / 'scripts/cv/export-layout.json'
assert DATA['schemaVersion'] == 3
provenance=json.loads((ROOT/'scripts/cv/construction-detail-source.json').read_text())
source=ROOT/provenance['source']
assert hashlib.sha256(source.read_bytes()).hexdigest()==provenance['sourceSHA256']
with Image.open(source) as original,Image.open(ROOT/'scripts/cv/construction-detail.png') as detail:
    assert original.crop(tuple(provenance['cropPixels'])).tobytes()==detail.tobytes(),'Construction signature differs from source geometry'
assert set(DATA['editions']) == {'en', 'fr', 'es'}
assert DATA['workingLanguages'] == ['ar', 'zgh', 'fr', 'en']
assert len(DATA['software']) == 8 and len(set(DATA['software'])) == 8
chronology = [('Ava Marie','2022-05',None),('Lariconf','2021-06','2022-05'),('Loratex','2018-09','2021-05'),('Loratex','2017-09','2018-09'),('Roadtex','2016-02','2017-08'),('Loratex','2014-02','2016-01')]
assert [(r['company'],r['start'],r['end']) for r in DATA['roles']] == chronology
for role in DATA['roles']:
    assert set(role['title']) == {'en','fr','es'} and set(role['scope']) == {'en','fr','es'}
    assert len({len(role['scope'][l]) for l in DATA['editions']}) == 1
    assert all(s.strip() for l in DATA['editions'] for s in role['scope'][l])
assert all(len(role['scope']['en']) >= 1 for role in DATA['roles'])
assert DATA['experienceYearsMinimum']==12
if not preview:assert DATA['authoritativeSource']['status']=='verified','Full LinkedIn source verification is required before release'
assert layout_path.exists(), 'Natural-color release master has not been rendered. Original color portrait required.'
layout = json.loads(layout_path.read_text())
assert len(layout) == 3
normalize = lambda text: re.sub(r'\s+',' ',text.replace('-\n','-')).strip()
portrait_reference = None
for row in layout:
    lang = row['locale'];stem = row['stem'];g = row['geometry']
    assert row['sourceSHA256']==hashlib.sha256((ROOT/'scripts/cv/career.json').read_bytes()).hexdigest()
    assert row['portraitSHA256']==PORTRAIT['sourceSHA256']
    assert row['layoutPreview'] is preview
    if not preview:assert row['careerVerified']
    assert abs(g['brand']['width']-36.15625)<.05 and abs(g['brand']['height']-31.1875)<.05,'SA. proportions differ from site reference'
    assert not g['clipped'] and g['lastRoleBottom'] <= g['footerTop']-15
    with Image.open(OUT / (stem+'.png')) as raw:
        assert raw.size == (2480,3508)
        assert all(abs(n-300)<.01 for n in raw.info.get('dpi',(0,0)))
        im=raw.convert('RGB');ink=ImageChops.difference(im,Image.new('RGB',im.size,'white')).getbbox()
        assert ink and min(ink[0],ink[1],im.width-ink[2],im.height-ink[3]) >= 118, ink
        scale=2480/g['sheet']['width'];p=g['portrait']
        box=(round(p['x']*scale)+4,round(p['y']*scale)+4,round((p['x']+p['width'])*scale)-4,round((p['y']+p['height'])*scale)-4)
        photo=im.crop(box);pixels=list(zip(*(photo.getchannel(c).tobytes() for c in 'RGB')))
        color=sum(max(px)-min(px)>12 for px in pixels)/len(pixels)
        assert color >= .03 and row['portraitColor']['fraction'] >= .03, 'Monochrome portrait is prohibited'
        if portrait_reference is None:portrait_reference=photo.tobytes()
        else:assert photo.tobytes()==portrait_reference,'Inconsistent portrait across editions'
        expected_pixels=im.tobytes()
    if not preview:
        with fitz.open(OUT/(stem+'.pdf')) as doc:
            assert len(doc)==1
            page=doc[0];assert abs(page.rect.width*25.4/72-210)<.001 and abs(page.rect.height*25.4/72-297)<.001
            rasters=[i for i in page.get_images() if i[2:4]==(2480,3508)]
            assert len(rasters)==1 and fitz.Pixmap(doc,rasters[0][0]).samples==expected_pixels
            text=normalize(page.get_text())
            assert DATA['email'] in text and 'aberbach.co' in text
            for role in DATA['roles']:
                assert normalize(role['title'][lang]) in text
            assert all(tool in text for tool in DATA['software'])
            assert DATA['editions'][lang]['languages'] in text
            assert '11+' not in text and ('12+' in text or '12 ans' in text or '12 años' in text)
            assert text.index('Ava Marie') < text.index('Lariconf') < text.index('Roadtex') and text.count('Loratex')==3
            assert 'Spanish' not in text and 'Espagnol' not in text and 'Español' not in text
            assert page.get_links()
    print(f'{lang.upper()}: '+('draft A4 composition and real color portrait checked; LinkedIn source still required' if preview else 'A4 /300 DPI/natural-color portrait/exact PDF raster/searchable/chronology — pass'))
print('Layout previews only — not a release approval.' if preview else 'All three redesigned CV editions passed release verification.')
