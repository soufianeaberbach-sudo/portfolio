"""Refine the first recovery exports after actual browser critique.

Preserves all original, generated-native and first-pass recovery files. Only
new explicitly named exports become active. Masks are never RGB recolouring.
"""
import importlib.util
from pathlib import Path
import json
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('recovery', ROOT / 'scripts/womenswear-seamless-recovery.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
registry = json.loads(helper.REGISTRY.read_text())
manifest = json.loads(helper.MANIFEST.read_text())
for record in registry:
    identity = record['sourceIdentity']
    if not record['id'].startswith('ww-recovery-') or identity not in ['evening-ref-02', 'swimwear-ref-01', 'swimwear-ref-02', 'swimwear-ref-04', 'swimwear-ref-05']:
        continue
    receipt_path = helper.REVIEW / (identity + '.json')
    receipt = json.loads(receipt_path.read_text())
    for view, image in record['photography'].items():
        out = ROOT / 'public/portfolio/recovery' / record['id']
        source = out / (view + '-native.png')
        if Image.open(source).mode == 'RGB':
            source = ROOT / '.qa-director/seamless-mask' / f'{identity}-{view}-front.png'
        retained = out / (view + '-refined-alpha.png')
        if retained.exists():
            raise ValueError('Refinement already exists; preserve it')
        shutil.copy2(source, retained)
        rgba = Image.open(retained).convert('RGBA')
        alpha = rgba.getchannel('A')
        left, top, right, bottom = alpha.point(lambda v: 255 if v >= 160 else 0).getbbox()
        sl, st, sr, sb = alpha.point(lambda v: 255 if v >= 3 else 0).getbbox()
        scale = min(1476/(right-left), 2376/(bottom-top), 1656/(sr-sl), 2484/(sb-st))
        x = round(900-(left+right)*scale/2)
        y = round(2538-bottom*scale)
        x = max(round(-sl*scale), min(x, round(1800-sr*scale)))
        y = max(round(-st*scale), min(y, round(2700-sb*scale)))
        resized = rgba.resize((round(rgba.width*scale), round(rgba.height*scale)), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (1800,2700), 'white')
        canvas.alpha_composite(resized, (x,y))
        rgb = canvas.convert('RGB')
        export = out / (view + '-seamless.png')
        rgb.save(export, compress_level=6)
        prefix = '/' + str(out.relative_to(ROOT / 'public')) + '/' + view + '-seamless'
        variants = []
        for width in (450,900):
            rgb.resize((width,width*3//2), Image.Resampling.LANCZOS).save(out / f'{view}-seamless-{width}.webp', quality=94)
            variants.append(prefix + f'-{width}.webp {width}w')
        image['src'] = prefix + '.png'
        image['srcset'] = ', '.join(variants + [image['src'] + ' 1800w'])
        receipt['outputs'][view]['refinement'] = dict(alphaAsset='/' + str(retained.relative_to(ROOT/'public')), alphaSHA256=helper.digest(retained), exportSHA256=helper.digest(export), scale=scale, offset=[x,y], reason='Browser critique: remove visible RGB studio rectangles and normalize complete figure scale; keep all earlier files.')
    record['image'] = record['photography']['front']
    receipt['reviewNote'] += ' Browser refinement uses clean alpha and consistent figure scale; first-pass and native files remain preserved.'
    if identity == 'evening-ref-02':
        receipt['reviewNote'] = receipt['reviewNote'].replace('preserved through native alpha', 'preserved; Front RGB background refined with segmentation and Back native alpha retained')
    helper.write_json(receipt_path, receipt)
    next(x for x in manifest['looks'] if x['sourceIdentity'] == identity)['recoveryPresentation'] = receipt
helper.write_json(helper.REGISTRY, registry)
helper.write_json(helper.MANIFEST, manifest)
