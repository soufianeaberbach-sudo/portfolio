#!/usr/bin/env python3
"""After PNG visual review, put each approved image on an exact A4 PDF page.
The original HTML text remains underneath the opaque image for search/copy and
accessibility. There is no second visible rendering or reflow during conversion.
"""
import hashlib
import json
import os
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / os.getenv('CV_OUTPUT_DIR', 'public/cv')
QA = ROOT / os.getenv('CV_QA_DIR', '.qa-director/cv')
A4 = fitz.Rect(0, 0, 210 / 25.4 * 72, 297 / 25.4 * 72)
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
    xref = page.insert_image(A4, filename=str(png), overlay=True, keep_proportion=False)
    doc.set_metadata({
        'title': f'Soufiane Aberbach — CV — {locale}',
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
        assert all(word in text for word in ['SOUFIANE', 'ABERBACH', 'Ava Marie', 'Lariconf', 'Roadtex', '2014', '2022'])
        raster = [i for i in p.get_images() if i[2:4] == (2480, 3508)]
        assert len(raster) == 1
        pix = fitz.Pixmap(final, raster[0][0])
        assert pix.samples == expected_pixels, f'{locale}: PDF pixels differ from the approved PNG'
        report.append({'locale': locale, 'pageMm': [210, 297], 'pixelSize': [2480, 3508], 'dpi': 300, 'pages': 1, 'searchable': True, 'rasterIdentical': True, 'pixelSha256': hashlib.sha256(expected_pixels).hexdigest()})
    print(f'{stem}.pdf: exact A4; embedded image pixel-identical; text searchable')
(QA / 'pdf-report.json').write_text(json.dumps(report, indent=2) + '\n')
