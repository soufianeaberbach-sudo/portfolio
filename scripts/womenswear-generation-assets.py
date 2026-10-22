"""Register real tool outputs and deterministically assemble reviewed individual views.

No garment generation or anatomy editing occurs here. Native files are never changed.
Resampling is explicit: the image tool currently returns 1024x1536 portraits.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
import argparse, hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'docs/portfolio/review/womenswear-regeneration'
MANIFEST = REVIEW / 'MANIFEST.json'
REGISTRY = ROOT / 'src/data/womenswear-generated.json'

def read_manifest():
    return json.loads(MANIFEST.read_text())

def save_manifest(manifest):
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')

def register(source_id, view, source_path):
    manifest = read_manifest()
    look = next(item for item in manifest['looks'] if item['sourceIdentity'] == source_id)
    source = Path(source_path)
    image = Image.open(source)
    if image.width * 3 != image.height * 2:
        raise ValueError('Native image is not a 2:3 portrait; retain as rejected evidence separately.')
    dest = ROOT / 'public/portfolio/generated' / look['generatedIdentity'] / f'{view}-native.png'
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
    look[view] = {
        'nativeAsset': '/' + str(dest.relative_to(ROOT / 'public')),
        'width': image.width, 'height': image.height, 'mode': image.mode,
        'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'toolOutputPath': str(source), 'qualityStatus': 'AWAITING_SET_QA',
    }
    look['status'] = 'GENERATED'
    save_manifest(manifest)
    print(source_id, view, image.size, image.mode)

def prepared_rgba(image, source_id):
    if image.mode == 'RGBA':
        return image.copy(), 'Native tool alpha; no background threshold or fabric recolouring.'
    if source_id != 'rtw-ref-02':
        raise ValueError('RGB background requires explicit review; automatic white removal is limited to the reviewed pink/beige set.')
    # The initial pink/beige test used a white RGB tool output. Only edge-connected
    # near-white is removed; its pink, beige, skin and hair pixels are outside this
    # threshold. All later generation uses native alpha, protecting white textiles.
    rgb = image.convert('RGB')
    channels = [channel.point(lambda value: 255 if value >= 248 else 0) for channel in rgb.split()]
    near_white = ImageChops.multiply(ImageChops.multiply(channels[0], channels[1]), channels[2])
    ImageDraw.floodfill(near_white, (0, 0), 128, thresh=0)
    removed = near_white.point(lambda value: 0 if value == 128 else 255)
    rgba = rgb.convert('RGBA')
    rgba.putalpha(removed)
    return rgba, 'Initial RGB pink/beige set only: edge-connected RGB>=248 background; original native file retained.'

def assemble(source_id):
    manifest = read_manifest()
    look = next(item for item in manifest['looks'] if item['sourceIdentity'] == source_id)
    if not look.get('qualityResult', {}).get('setVisualReview'):
        raise ValueError('Review the three real views and record setVisualReview before export.')
    panels = []
    metrics = []
    asset_dir = ROOT / 'public/portfolio/generated' / look['generatedIdentity']
    for view in ('front', 'back', 'editorial'):
        output = look.get(view)
        if not output:
            raise ValueError(f'Missing actual {view} image')
        native = Image.open(ROOT / 'public' / output['nativeAsset'].lstrip('/'))
        rgba, matte_method = prepared_rgba(native, source_id)
        alpha = rgba.getchannel('A')
        body_box = alpha.point(lambda value: 255 if value >= 160 else 0).getbbox()
        if body_box is None:
            raise ValueError('Empty subject')
        left, top, right, bottom = body_box
        # Uniform scaling only. Measured opaque figure is at most 88% high and
        # 82% wide. Floor aligns at 94%; soft alpha shadow remains below the sole.
        scale = min(2376 / (bottom - top), 1476 / (right - left))
        resized = rgba.resize((round(native.width * scale), round(native.height * scale)), Image.Resampling.LANCZOS)
        x = round(900 - (left + right) * scale / 2)
        y = round(2538 - bottom * scale)
        # An oversized transparent canvas is harmless; no non-transparent content
        # may leave the panel. Check actual support after the same uniform transform.
        support = alpha.point(lambda value: 255 if value >= 10 else 0).getbbox()
        sl, st, sr, sb = support
        if min(x + sl * scale, y + st * scale) < 0 or x + sr * scale > 1800 or y + sb * scale > 2700:
            raise ValueError(f'{view}: subject/shadow exceeds safe canvas; revise framing, never crop anatomy.')
        canvas = Image.new('RGBA', (1800, 2700), (255, 255, 255, 255))
        canvas.alpha_composite(resized, (x, y))
        panel = canvas.convert('RGB')
        panel.save(asset_dir / f'{view}.png', optimize=True)
        panels.append(panel)
        output.update({'asset': f'/portfolio/generated/{look["generatedIdentity"]}/{view}.png', 'exportWidth': 1800, 'exportHeight': 2700,
                       'resampled': native.size != (1800, 2700), 'qualityStatus': 'VISUAL_PASS_NATIVE_RESOLUTION_LIMITED'})
        metrics.append({'view': view, 'nativeDimensions': list(native.size), 'nativeOpaqueBox': list(body_box), 'uniformScale': scale,
                        'exportOpaqueBox': [round(x + left * scale), round(y + top * scale), round(x + right * scale), round(y + bottom * scale)],
                        'backgroundPreparation': matte_method})
    master = Image.new('RGB', (5400, 2700), 'white')
    for index, panel in enumerate(panels):
        master.paste(panel, (1800 * index, 0))
    master.save(asset_dir / 'master.png', optimize=True)
    srcset = []
    for width in (900, 1800, 2700, 3600):
        derivative = master.resize((width, width // 2), Image.Resampling.LANCZOS)
        derivative.save(asset_dir / f'master-{width}.webp', quality=94, method=6)
        srcset.append(f'/portfolio/generated/{look["generatedIdentity"]}/master-{width}.webp {width}w')
    master_url = f'/portfolio/generated/{look["generatedIdentity"]}/master.png'
    srcset.append(f'{master_url} 5400w')
    look['master'] = {'asset': master_url, 'width': 5400, 'height': 2700, 'panelWidth': 1800, 'panelHeight': 2700,
                      'srcset': ', '.join(srcset), 'nativePanelDimensions': [[look[v]['width'], look[v]['height']] for v in ('front', 'back', 'editorial')],
                      'resamplingDisclosure': 'Three separate native 1024×1536 generations, uniformly resampled for the requested review export. Not native 1800×2700 detail.'}
    look['qualityResult'].update({'exportGeometryPass': True, 'nativeResolutionPass': False,
                                 'reviewStatus': 'PROVISIONAL_REVIEW_ONLY', 'panelMetrics': metrics,
                                 'ownerArtisticApproval': False})
    look['status'] = 'READY'
    look['replacementStatus'] = 'READY_FOR_REVIEW_INTEGRATION'
    save_manifest(manifest)
    records = json.loads(REGISTRY.read_text()) if REGISTRY.exists() else []
    record = {'id': look['generatedIdentity'], 'sourceIdentity': source_id, 'category': look['sourceCategory'],
              'caption': look.get('generatedCaption', look.get('generatedDescription', look['source']['alt'])),
              'editorialWorld': look['category'], 'slot': look['currentSlot'], 'generationType': look['generationType'],
              'provisional': True, 'integrated': True, 'nativeResolutionLimited': True,
              'backInterpreted': (look['source'].get('views', 1) == 1),
              'uncertainties': look['constructionUncertainties'],
              'credit': {'source': 'AI-generated provisional presentation · OpenAI native image tool'},
              'image': {'src': master_url, 'srcset': ', '.join(srcset), 'width': 5400, 'height': 2700,
                        'alt': look.get('generatedDescription', 'AI-generated provisional presentation of ' + look['source']['alt']),
                        'front': 1/3, 'views': 3, 'thirdView': 'editorial', 'separable': True}}
    records = [r for r in records if r['id'] != record['id']] + [record]
    REGISTRY.write_text(json.dumps(records, indent=2) + '\n')
    print('READY review export:', source_id, '3 individual panels, 5400x2700 master, 4 WebP derivatives; native resolution limitation retained.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('operation', choices=['register', 'assemble'])
    parser.add_argument('source_id')
    parser.add_argument('--view', choices=['front', 'back', 'editorial'])
    parser.add_argument('--source')
    args = parser.parse_args()
    if args.operation == 'register':
        if not args.view or not args.source:
            parser.error('register requires --view and --source')
        register(args.source_id, args.view, args.source)
    else:
        assemble(args.source_id)
