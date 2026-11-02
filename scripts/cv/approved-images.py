#!/usr/bin/env python3
"""Package immutable owner-approved PNGs as lossless, fitted A4 PDFs.
This image-to-PDF converter never writes PNGs or renders a new CV design.
"""
import hashlib
import json
from pathlib import Path
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = Path(__file__).with_name('approved-images.json')
MM_TO_PT = 72 / 25.4

def export():
    manifest = json.loads(MANIFEST.read_text())
    for language, record in manifest['editions'].items():
        png = ROOT / record['png']
        original = png.read_bytes()
        assert hashlib.sha256(original).hexdigest() == record['pngSHA256'], png
        with Image.open(png) as image:
            assert list(image.size) == record['dimensions'], png
            width, height = image.size
            icc = image.info.get('icc_profile')
        with fitz.open() as document:
            page = document.new_page(width=210 * MM_TO_PT, height=297 * MM_TO_PT)
            scale = min(page.rect.width / width, page.rect.height / height)
            w, h = width * scale, height * scale
            x, y = (page.rect.width - w) / 2, (page.rect.height - h) / 2
            image_ref = page.insert_image(fitz.Rect(x, y, x + w, y + h),
                                         stream=original, keep_proportion=True)
            # Bind the exact PNG ICC profile: interpreting Display P3 samples
            # as untagged RGB would change the FR/ES colors.
            if icc:
                profile_ref = document.get_new_xref()
                document.update_object(profile_ref, '<< /N 3 /Alternate /DeviceRGB >>')
                document.update_stream(profile_ref, icc)
                document.xref_set_key(image_ref, 'ColorSpace', f'[/ICCBased {profile_ref} 0 R]')
            else:
                document.xref_set_key(image_ref, 'ColorSpace', '/DeviceRGB')
            document.set_metadata({
                'title': f'Soufiane Aberbach — CV — {record["language"]}',
                'author': 'Soufiane Aberbach',
                'subject': 'Owner-approved CV image, fitted to A4 without alteration',
                'producer': 'ABERBACH lossless A4 image exporter',
            })
            destination = ROOT / record['pdf']
            document.save(destination, garbage=4, deflate=True, no_new_id=True)
        assert png.read_bytes() == original, 'Source PNG changed during PDF export'
        print(f'{language}: {destination.name}: {hashlib.sha256(destination.read_bytes()).hexdigest()}')

if __name__ == '__main__':
    export()
