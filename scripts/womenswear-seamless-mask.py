"""Background-only segmentation fallback explicitly authorized by the recovery brief.

Requires rembg[cpu] 2.0.86 and isnet-general-use. No RGB pixels are recoloured.
Review the returned alpha on white before using the separate recovery exporter.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy.ndimage import binary_fill_holes
from rembg import new_session

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.qa-director/seamless-mask'
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = {'activewear-ref-09': ('sport/9-1400.webp', .5775),
           'swimwear-ref-03': ('swim/3-1400.webp', None),
           'swimwear-ref-06': ('swim/6-1400.webp', None),
           'swimwear-ref-07': ('swim/7-1400.webp', None)}
# Also refine RGB partials with visible studio rectangles found in browser QA.
import sys
if '--partials' in sys.argv:
    SOURCES = {identity + '-' + view: (f'generated/ww-ai-{identity}-v1/{view}-native.png', None)
               for identity, view in [('evening-ref-02', 'front'), ('swimwear-ref-02', 'front'), ('swimwear-ref-02', 'back'), ('swimwear-ref-04', 'editorial')]}


session = new_session('isnet-general-use', providers=['CPUExecutionProvider'])
report = {}
for identity, (source, split) in SOURCES.items():
    path = ROOT / 'public/portfolio' / source
    rgb = Image.open(path).convert('RGB')
    raw = session.predict(rgb)[0]
    # Fill only enclosed mask holes, preserving opaque light cloth and mesh
    # texture. An enclosed studio-white region stays its existing white RGB.
    a = np.asarray(raw, dtype=np.float32) / 255
    core = binary_fill_holes(a > .82)
    a[core] = 1
    a = np.clip((a - .015) / .985, 0, 1)
    alpha = Image.fromarray(np.uint8(a * 255))
    raw.save(OUT / (identity + '-model-mask.png'))
    regions = {'front': (0, 0, rgb.width, rgb.height)} if split is None else {
        'front': (0, 0, round(rgb.width * split), rgb.height),
        'back': (round(rgb.width * split), 0, rgb.width, rgb.height)}
    report[identity] = {'source': str(path.relative_to(ROOT)), 'sourceSHA256': hashlib.sha256(path.read_bytes()).hexdigest(), 'model': 'isnet-general-use', 'rgbRecoloured': False, 'views': {}}
    for view, box in regions.items():
        original = rgb.crop(box)
        matte = alpha.crop(box)
        body = matte.point(lambda x: 255 if x > 180 else 0).getbbox()
        if body is None:
            raise ValueError('Empty subject')
        left, top, right, bottom = body
        # A minimal soft grounding shadow touches the lowest actual foot.
        # It never adds a coloured floor, heavy cast shadow or studio rectangle.
        feet = np.asarray(matte)[max(top, bottom - 14):bottom] > 180
        xs = np.where(feet)[1]
        cx = float(xs.mean())
        radius = max(15, min(65, (float(xs.max()) - float(xs.min())) / 2 + 8))
        shadow = Image.new('RGBA', original.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(shadow)
        d.ellipse((cx - radius, bottom - 5, cx + radius, bottom + 7), fill=(60, 55, 50, 24))
        shadow = shadow.filter(ImageFilter.GaussianBlur(6))
        foreground = original.convert('RGBA')
        foreground.putalpha(matte)
        shadow.alpha_composite(foreground)
        dest = OUT / (identity + '-' + view + '.png')
        shadow.save(dest)
        matte.save(OUT / (identity + '-' + view + '-mask.png'))
        report[identity]['views'][view] = {'file': str(dest.relative_to(ROOT)), 'crop': list(box), 'bodyBounds': list(body), 'shadow': 'minimal 24/255 alpha, 6px Gaussian contact ellipse'}
        print(identity, view, body, flush=True)
(OUT / 'SEGMENTATION.json').write_text(json.dumps(report, indent=2) + '\n')
