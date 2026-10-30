#!/usr/bin/env python3
"""After PNG visual review, put each approved image on an exact A4 PDF page.
The original HTML text remains underneath the opaque image for search/copy and
accessibility. There is no second visible rendering or reflow during conversion.
"""
import hashlib
import argparse
import json
import os
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / os.getenv('CV_OUTPUT_DIR', 'public/cv')
QA = ROOT / os.getenv('CV_QA_DIR', '.qa-director/cv')
A4 = fitz.Rect(0, 0, 210 / 25.4 * 72, 297 / 25.4 * 72)
parser=argparse.ArgumentParser()
parser.add_argument('--proof',action='store_true',help='Unpublished review PDFs outside public/ only; never authorizes release')
proof=parser.parse_args().proof
if proof: assert not OUT.resolve().is_relative_to((ROOT/'public').resolve()), 'Proof PDFs must remain outside public/'
layout = json.loads((QA / 'layout-report.json').read_text())
portrait = json.loads((ROOT / 'scripts/cv/portrait-source.json').read_text())
assert len(layout) == 3 and all(r.get('layoutPreview') is proof and r.get('careerVerified',False) and r['portraitColor']['fraction'] >= .03 for r in layout), 'PDF source does not match the requested review/release state.'
if not proof: assert all(r['linkedinVerified'] for r in layout), 'Final PDFs require complete primary-source verification or explicit owner release authorization.'
assert all(r['sourceSHA256']==hashlib.sha256((ROOT/'scripts/cv/career.json').read_bytes()).hexdigest() and r['portraitSHA256']==hashlib.sha256((ROOT/'scripts/cv'/portrait['file']).read_bytes()).hexdigest() for r in layout), 'Stale career or portrait source; render and inspect fresh PNG masters first.'
assert all(all(hashlib.sha256((ROOT/'scripts/cv'/file).read_bytes()).hexdigest()==sha for file,sha in r['productionSources'].items()) for r in layout),'Production artwork/layout changed after rendering'
review=json.loads((QA/'image-review.json').read_text())
assert all(review[r['locale']]['pngSHA256']==hashlib.sha256((OUT/(r['stem']+'.png')).read_bytes()).hexdigest() and review[r['locale']]['fullResolutionInspected'] for r in layout),'All PNG images must be visually reviewed before PDF conversion'
report = []
for locale in ['EN', 'FR', 'ES']:
    stem = f'Soufiane-Aberbach-CV-{locale}'
    png = OUT / f'{stem}.png'
    with Image.open(png) as image:
        assert image.size == (2480, 3508), (locale, image.size)
        assert all(abs(n - 300) < .01 for n in image.info['dpi'])
        expected_pixels = image.convert('RGB').tobytes()
    doc = fitz.open(QA / f'{stem}-text.pdf')
    assert len(doc) == 1, 'Source layout overflowed to another page'
    page = doc[0]
    page.set_mediabox(A4)
    page.set_cropbox(page.mediabox)
    # The opaque reviewed master supplies all visible photography. Discard
    # redundant source-layer photos while retaining selectable text and links.
    for resource in page.get_images(full=True):
        page.delete_image(resource[0])
    xref = page.insert_image(A4, filename=str(png), overlay=True, keep_proportion=False)
    doc.set_metadata({
        'title': f'Soufiane Aberbach — CV — {locale}'+(' — Unpublished design proof' if proof else ''),
        'author': 'Soufiane Aberbach',
        'subject': 'Senior Fashion Designer & Product Developer',
        'keywords': 'CV, fashion design, product development, Aberbach',
        'creator': 'ABERBACH deterministic CV production',
    })
    doc.save(OUT / f'{stem}.pdf', garbage=4, deflate=True)
    doc.close()
    # Reopen the delivered PDF, verify exact page size, searchability and the
    # embedded raster's decoded pixels. This proves the PDF uses the actual
    # approved PNG, rather than an independently typeset approximation.
    with fitz.open(OUT / f'{stem}.pdf') as final:
        p = final[0]
        assert len(final) == 1
        assert abs(p.rect.width - A4.width) < .001
        assert abs(p.rect.height - A4.height) < .001
        text = p.get_text()
        assert all(word in text for word in ['Soufiane', 'Aberbach', 'Ava Marie', 'Lariconf', 'Roadtex', '2014', '2022'])
        raster = [i for i in p.get_images() if i[2:4] == (2480, 3508)]
        assert len(raster) == 1
        pix = fitz.Pixmap(final, raster[0][0])
        assert pix.samples == expected_pixels, f'{locale}: PDF pixels differ from the approved PNG'
        report.append({'locale': locale, 'pageMm': [210, 297], 'pixelSize': [2480, 3508], 'dpi': 300, 'pages': 1, 'searchable': True, 'rasterIdentical': True, 'pixelSha256': hashlib.sha256(expected_pixels).hexdigest()})
    print(f'{stem}.pdf: exact A4; embedded image pixel-identical; text searchable')
(QA / 'pdf-report.json').write_text(json.dumps(report, indent=2) + '\n')
