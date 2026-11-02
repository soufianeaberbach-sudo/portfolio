#!/usr/bin/env python3
"""Independently verify the actual owner-approved deliverables.

The 2 November 2026 images supersede generated-layout/content assumptions.
Exact source hashes protect every word, portrait, bar, QR code and decoration.
"""
import hashlib
import json
import re
from pathlib import Path
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads(Path(__file__).with_name('approved-images.json').read_text())
assert set(manifest['editions']) == {'en', 'fr', 'es'}
checks = 0

def check(condition, label):
    global checks
    assert condition, label
    checks += 1

for locale, record in manifest['editions'].items():
    png, pdf = ROOT / record['png'], ROOT / record['pdf']
    check(hashlib.sha256(png.read_bytes()).hexdigest() == record['pngSHA256'], f'{locale}: original PNG bytes')
    check(hashlib.sha256(pdf.read_bytes()).hexdigest() == record['pdfSHA256'], f'{locale}: reviewed PDF bytes')
    with Image.open(png) as image:
        check(image.format == 'PNG' and list(image.size) == record['dimensions'], f'{locale}: native PNG dimensions')
        check(image.mode == record['mode'], f'{locale}: original pixel mode')
        if 'A' in image.getbands():
            check(image.getchannel('A').getextrema() == (255, 255), f'{locale}: original opaque alpha')
        pixels = image.convert('RGB').tobytes()
        width, height = image.size
        profile = image.info.get('icc_profile', b'')
        check(hashlib.sha256(pixels).hexdigest() == record['rgbSHA256'], f'{locale}: approved native RGB pixels')
        check((hashlib.sha256(profile).hexdigest() if profile else None) == record['iccSHA256'], f'{locale}: original color profile')
    with fitz.open(pdf) as document:
        check(len(document) == 1 and not document.is_encrypted, f'{locale}: one readable PDF page')
        page = document[0]
        check(abs(page.rect.width * 25.4 / 72 - 210) < .001 and
              abs(page.rect.height * 25.4 / 72 - 297) < .001, f'{locale}: exact A4 portrait')
        check(page.rotation == 0, f'{locale}: upright page')
        images = page.get_images(full=True)
        check(len(images) == 1 and images[0][2:5] == (width, height, 8), f'{locale}: one image at actual resolution')
        image_ref = images[0][0]
        check(fitz.Pixmap(document, image_ref).samples == pixels, f'{locale}: lossless embedded RGB pixels')
        check(images[0][8] == 'FlateDecode', f'{locale}: lossless image compression')
        color_type, color_space = document.xref_get_key(image_ref, 'ColorSpace')
        if profile:
            match = re.fullmatch(r'\[/ICCBased (\d+) 0 R\]', color_space)
            check(color_type == 'array' and match is not None, f'{locale}: ICC color space retained')
            check(document.xref_stream(int(match[1])) == profile, f'{locale}: exact ICC profile bytes embedded')
        else:
            check(color_space == '/DeviceRGB', f'{locale}: RGB source interpretation retained')
        placements = page.get_image_rects(image_ref)
        check(len(placements) == 1, f'{locale}: complete image placed exactly once')
        box = placements[0]
        check(abs(box.width / box.height - width / height) < .000001, f'{locale}: no distortion')
        check(box.x0 >= -.001 and box.y0 >= -.001 and
              box.x1 <= page.rect.width + .001 and box.y1 <= page.rect.height + .001, f'{locale}: no cropping')
        scale = min(page.rect.width / width, page.rect.height / height)
        check(abs(box.width - width * scale) < .001 and abs(box.height - height * scale) < .001,
              f'{locale}: largest aspect-preserving fit, no additional margins')
        check(abs(box.x0 - (page.rect.width - box.width) / 2) < .001 and
              abs(box.y0 - (page.rect.height - box.height) / 2) < .001, f'{locale}: centered fit')
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
        check(pixmap.width > 590 and pixmap.height > 840 and len(set(pixmap.samples)) > 100,
              f'{locale}: PDF opens and renders the actual artwork')
    print(f'{locale.upper()}: original bytes / native resolution / ICC / exact A4 / lossless pixels / no crop or distortion — pass')
print(f'{checks} approved-CV checks passed across all three editions')
