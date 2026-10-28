#!/usr/bin/env python3
"""Verify the delivered CVs independently of the browser/render pipeline."""
import hashlib
import json
import re
from pathlib import Path

import fitz
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[2]
CAREER = json.loads((ROOT / 'scripts/cv/career.json').read_text())
OUT = ROOT / 'public/cv'
expected_chronology = [
    ('Ava Marie', '2022-05', None),
    ('Lariconf', '2021-06', '2022-05'),
    ('Loratex', '2018-09', '2021-05'),
    ('Loratex', '2017-09', '2018-09'),
    ('Roadtex', '2016-02', '2017-08'),
    ('Loratex', '2014-02', '2016-01'),
]
assert [(r['company'], r['start'], r['end']) for r in CAREER['roles']] == expected_chronology
assert set(CAREER['editions']) == {'en', 'fr', 'es'}
assert CAREER['workingLanguages'] == ['ar', 'fr', 'en'], 'Publication languages must not become spoken-language claims'
normalize = lambda text: re.sub(r'\s+', ' ', text).strip()
portrait_reference = None
checks = 0
for locale in ['EN', 'FR', 'ES']:
    stem = f'Soufiane-Aberbach-CV-{locale}'
    png = OUT / f'{stem}.png'
    pdf = OUT / f'{stem}.pdf'
    with Image.open(png) as image:
        assert image.size == (2480, 3508)
        assert all(abs(n - 300) < .01 for n in image.info.get('dpi', (0, 0)))
        image = image.convert('RGB')
        # All four printer-safe edges must be true #FFFFFF, not transparent,
        # cream, off-white, or a full-bleed photo/background.
        white = Image.new('RGB', image.size, '#FFFFFF')
        ink = ImageChops.difference(image, white).getbbox()
        assert ink and min(ink[0], ink[1], image.width - ink[2], image.height - ink[3]) >= 118, ink
        # One consistent photo composition in every edition. This rectangle is
        # inside the portrait only, independent of translated text geometry.
        portrait = image.crop((1900, 270, 2300, 810)).tobytes()
        if portrait_reference is None:
            portrait_reference = portrait
        else:
            assert portrait == portrait_reference, 'Portrait differs between editions'
        expected_pixels = image.tobytes()
    with fitz.open(pdf) as document:
        assert len(document) == 1
        page = document[0]
        assert abs(page.rect.width * 25.4 / 72 - 210) < .001
        assert abs(page.rect.height * 25.4 / 72 - 297) < .001
        raster = [i for i in page.get_images() if i[2:4] == (2480, 3508)]
        assert len(raster) == 1
        assert fitz.Pixmap(document, raster[0][0]).samples == expected_pixels
        text = normalize(page.get_text())
        assert CAREER['email'] in text and 'aberbach.co' in text
        assert all(normalize(role['title'][locale.lower()]) in text for role in CAREER['roles'])
        assert all(tool in text for tool in CAREER['software'])
        assert text.index('Ava Marie') < text.index('Lariconf') < text.index('Roadtex')
        assert text.count('Loratex') == 3
        for year in ['2014', '2016', '2017', '2018', '2021', '2022']:
            assert year in text
        assert CAREER['editions'][locale.lower()]['languages'] in text
        assert 'Spanish' not in text and 'Espagnol' not in text and 'Español' not in text, 'Spanish proficiency is unverified'
        assert page.get_links(), 'Public contact links should remain usable in the PDF'
    checks += 1
    print(f'{locale}: A4 / 300 DPI / white printer margins / six positions / consistent portrait / searchable / exact raster — pass')
print(f'{checks} CV editions passed all print, content and image checks')
