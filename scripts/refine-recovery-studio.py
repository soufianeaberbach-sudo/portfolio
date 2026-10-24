"""Non-generative finishing of the existing recovery mattes; originals stay intact.

Only alpha support and contact shadows change. Opaque interior RGB is retained.
The earlier normalization transforms are reused, so the site framing is stable.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy.ndimage import distance_transform_edt

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'src/data/womenswear-generated.json'
REVIEW = ROOT / 'docs/portfolio/review/studio-imagery-2026-10-24'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

records = json.loads(REGISTRY.read_text())
receipts = []
for record in records:
    if not record['id'].startswith('ww-recovery-'):
        continue
    folder = ROOT / 'public/portfolio/recovery' / record['id']
    previous = json.loads((ROOT / 'docs/portfolio/review/womenswear-seamless-recovery' / (record['sourceIdentity'] + '.json')).read_text())
    for view, asset in record['photography'].items():
        source = folder / (view + '-refined-alpha.png')
        if not source.exists():
            source = folder / (view + '-native.png')
        rgba = Image.open(source).convert('RGBA')
        pixels = np.array(rgba)
        a = pixels[:, :, 3].copy()
        core = a >= 160
        ys, xs = np.where(core)
        bottom = int(ys.max()) + 1
        # Remove distant translucent studio/shadow residue, never enclosed mesh.
        distance = distance_transform_edt(~core)
        a[(a <= 3) | (distance > 5)] = 0
        # The old baked/synthetic floor shadow is discarded before one new
        # neutral contact shadow is composited. Keep the actual sole feather.
        floor = np.indices(a.shape)[0] >= bottom - 4
        a[floor & (distance > 1.5) & (a < 160)] = 0
        matte = Image.fromarray(a)
        # Subpixel contour relaxation, with no broad blur, RGB painting or
        # erosion of internal garment details, mesh, ties or pale footwear.
        inset = matte.filter(ImageFilter.MinFilter(3))
        relaxed = Image.blend(matte, inset, .18).filter(ImageFilter.GaussianBlur(.28))
        refined = np.array(relaxed)
        refined[distance_transform_edt(core) > 2] = a[distance_transform_edt(core) > 2]
        pixels[:, :, 3] = refined
        foreground = Image.fromarray(pixels)
        info = previous['outputs'][view]
        transform = info.get('refinement', {})
        scale = transform.get('scale', info['uniformScale'])
        offset = transform.get('offset', info['offset'])
        # Ground the lowest sole or hem; airborne feet never receive a shadow.
        foot = core[max(0, bottom-5):bottom]
        fx = np.where(foot)[1]
        cx = float(np.median(fx))
        radius = max(12, min(80, (float(fx.max())-float(fx.min()))/2 + 9))
        shadow = Image.new('RGBA', rgba.size)
        draw = ImageDraw.Draw(shadow)
        draw.ellipse((cx-radius, bottom-3, cx+radius, bottom+5), fill=(80,80,80,19))
        shadow = shadow.filter(ImageFilter.GaussianBlur(5))
        shadow.alpha_composite(foreground)
        shadow = shadow.resize((round(rgba.width*scale), round(rgba.height*scale)), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (1800,2700), 'white')
        canvas.alpha_composite(shadow, tuple(offset))
        rgb = canvas.convert('RGB')
        target = folder / (view + '-studio-v2.png')
        rgb.save(target)
        variants = []
        for width in (450,900):
            path = folder / f'{view}-studio-v2-{width}.webp'
            # Lossless white preserves the page ground even around fine edges.
            rgb.resize((width,width*3//2), Image.Resampling.LANCZOS).save(path, lossless=True, method=6)
            variants.append(f'/{path.relative_to(ROOT / "public")} {width}w')
        old = asset['src']
        asset['src'] = '/' + str(target.relative_to(ROOT/'public'))
        asset['srcset'] = ', '.join(variants + [asset['src']+' 1800w'])
        border = np.array(rgb)
        assert np.all(border[:8] == 255) and np.all(border[-8:] == 255)
        assert np.all(border[:,:8] == 255) and np.all(border[:,-8:] == 255)
        receipts.append(dict(id=record['id'], view=view, previous=old, source=str(source.relative_to(ROOT)), sourceSHA256=sha(source), asset=asset['src'], sha256=sha(target), scale=scale, offset=offset, pureWhitePerimeter=True, interiorRGBRepainted=False))
    record['image'] = record['photography']['front']
REGISTRY.write_text(json.dumps(records, indent=2, ensure_ascii=False)+'\n')
REVIEW.mkdir(parents=True, exist_ok=True)
(REVIEW/'WOMENSWEAR.json').write_text(json.dumps(receipts, indent=2)+'\n')
print(f'Finished {len(receipts)} recovery views; original files preserved.')
