"""Register real tool outputs and deterministically assemble reviewed individual views.

No garment generation or anatomy editing occurs here. Native files are never changed.
Native portrait dimensions are recorded as returned. Review exports use uniform
scaling and placement; native artwork is never resampled or overwritten.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
import argparse, hashlib, json, os, shutil, tempfile

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'docs/portfolio/review/womenswear-regeneration'
MANIFEST = REVIEW / 'MANIFEST.json'
REGISTRY = ROOT / 'src/data/womenswear-generated.json'

def read_manifest():
    return json.loads(MANIFEST.read_text())

def atomic_json(path, value):
    fd, name = tempfile.mkstemp(prefix=path.name + '.', suffix='.tmp', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as stream:
            json.dump(value, stream, indent=2)
            stream.write('\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

def save_manifest(manifest):
    atomic_json(MANIFEST, manifest)

def save_image(image, path, **options):
    fd, name = tempfile.mkstemp(prefix=path.stem + '.', suffix=path.suffix, dir=path.parent)
    os.close(fd)
    try:
        image.save(name, **options)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

def register(source_id, view, source_path):
    manifest = read_manifest()
    look = next(item for item in manifest['looks'] if item['sourceIdentity'] == source_id)
    source = Path(source_path)
    image = Image.open(source)
    image.load()
    if image.width >= image.height:
        raise ValueError('Native image must be a portrait; retain other framing as rejected evidence separately.')
    dest = ROOT / 'public/portfolio/generated' / look['generatedIdentity'] / f'{view}-native.png'
    dest.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest() != digest:
        raise ValueError('Refusing to overwrite an existing native. Record a rejected/versioned generation explicitly.')
    if look.get(view):
        if look[view].get('sha256') == digest and dest.exists():
            print(source_id, view, 'already registered; existing QA and export metadata preserved')
            return
        raise ValueError('Existing registered view differs; preserve it and review explicitly.')
    if not dest.exists():
        fd, name = tempfile.mkstemp(prefix=view + '.', suffix='.tmp', dir=dest.parent)
        os.close(fd)
        try:
            shutil.copy2(source, name)
            os.replace(name, dest)
        finally:
            if os.path.exists(name):
                os.unlink(name)
    look[view] = {
        'nativeAsset': '/' + str(dest.relative_to(ROOT / 'public')),
        'width': image.width, 'height': image.height, 'mode': image.mode,
        'sha256': digest,
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

def reviewed_placement(image, source_id, output):
    review = output.get('nativeBackgroundReview')
    if image.mode == 'RGB' and review:
        if review.get('kind') != 'opaque-white' or review.get('nativeSHA256') != output.get('sha256'):
            raise ValueError('Opaque white placement review must identify this exact native.')
        body = review.get('subjectBounds')
        support = review.get('supportBounds')
        for bounds in (body, support):
            if not isinstance(bounds, list) or len(bounds) != 4 or not all(type(v) is int for v in bounds):
                raise ValueError('Opaque placement requires four reviewed integer bounds.')
            left, top, right, bottom = bounds
            if not (0 <= left < right <= image.width and 0 <= top < bottom <= image.height):
                raise ValueError('Reviewed opaque bounds exceed the native image.')
        if not (support[0] <= body[0] and support[1] <= body[1] and support[2] >= body[2] and support[3] >= body[3]):
            raise ValueError('Reviewed support must contain the complete subject.')
        # Keep every RGB pixel, including white fabric and highlights. The bounds
        # measure placement only; they never mask, recolour or remove background.
        return image.convert('RGBA'), tuple(body), tuple(support), 'Reviewed opaque white studio native; RGB pixels preserved, no background removal or colour threshold.'
    rgba, method = prepared_rgba(image, source_id)
    alpha = rgba.getchannel('A')
    body = alpha.point(lambda value: 255 if value >= 160 else 0).getbbox()
    support = alpha.point(lambda value: 255 if value >= 10 else 0).getbbox()
    if body is None or support is None:
        raise ValueError('Empty subject')
    return rgba, body, support, method

def studio_canvas(resized, x, y, opaque=False, size=(1800, 2700)):
    """Extend only outside a reviewed opaque photograph, preserving its pixels."""
    canvas = Image.new('RGBA', size, (255, 255, 255, 255))
    width, height = resized.size
    if opaque:
        if x > 0:
            canvas.alpha_composite(resized.crop((0, 0, 1, height)).resize((x, height)), (0, y))
        if x + width < size[0]:
            canvas.alpha_composite(resized.crop((width-1, 0, width, height)).resize((size[0]-x-width, height)), (x+width, y))
    canvas.alpha_composite(resized, (x, y))
    if opaque:
        if y > 0:
            canvas.paste(canvas.crop((0, y, size[0], y+1)).resize((size[0], y)), (0, 0))
        if y + height < size[1]:
            bottom = y + height
            canvas.paste(canvas.crop((0, bottom-1, size[0], bottom)).resize((size[0], size[1]-bottom)), (0, bottom))
    return canvas

def assemble(source_id):
    manifest = read_manifest()
    look = next(item for item in manifest['looks'] if item['sourceIdentity'] == source_id)
    if look.get('master'):
        raise ValueError('Existing completed master is protected; do not regenerate saved sets.')
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
        rgba, body_box, support, matte_method = reviewed_placement(native, source_id, output)
        left, top, right, bottom = body_box
        # Uniform scaling only. Measured opaque figure is at most 88% high and
        # 82% wide. Floor aligns at 94%; soft alpha shadow remains below the sole.
        scale = min(2376 / (bottom - top), 1476 / (right - left))
        resized = rgba.resize((round(native.width * scale), round(native.height * scale)), Image.Resampling.LANCZOS)
        x = round(900 - (left + right) * scale / 2)
        y = round(2538 - bottom * scale)
        # An oversized transparent canvas is harmless; no non-transparent content
        # may leave the panel. Check actual support after the same uniform transform.
        sl, st, sr, sb = support
        if min(x + sl * scale, y + st * scale) < 0 or x + sr * scale > 1800 or y + sb * scale > 2700:
            raise ValueError(f'{view}: subject/shadow exceeds safe canvas; revise framing, never crop anatomy.')
        opaque_studio = native.mode == 'RGB' and bool(output.get('nativeBackgroundReview'))
        canvas = studio_canvas(resized, x, y, opaque=opaque_studio)
        if opaque_studio:
            matte_method += ' Outside-photo canvas uses continuous edge extension; no native pixel masked or recoloured.'
        panel = canvas.convert('RGB')
        save_image(panel, asset_dir / f'{view}.png', compress_level=4)
        panels.append(panel)
        output.update({'asset': f'/portfolio/generated/{look["generatedIdentity"]}/{view}.png', 'exportWidth': 1800, 'exportHeight': 2700,
                       'resampled': native.size != (1800, 2700), 'qualityStatus': 'VISUAL_PASS_NATIVE_RESOLUTION_LIMITED'})
        bounds_key = 'nativeSubjectBox' if native.mode == 'RGB' and output.get('nativeBackgroundReview') else 'nativeOpaqueBox'
        metrics.append({'view': view, 'nativeDimensions': list(native.size), bounds_key: list(body_box), 'uniformScale': scale,
                        'exportOpaqueBox': [round(x + left * scale), round(y + top * scale), round(x + right * scale), round(y + bottom * scale)],
                        'backgroundPreparation': matte_method})
    master = Image.new('RGB', (5400, 2700), 'white')
    for index, panel in enumerate(panels):
        master.paste(panel, (1800 * index, 0))
    save_image(master, asset_dir / 'master.png', compress_level=4)
    srcset = []
    for width in (900, 1800, 2700, 3600):
        derivative = master.resize((width, width // 2), Image.Resampling.LANCZOS)
        save_image(derivative, asset_dir / f'master-{width}.webp', quality=94, method=6)
        srcset.append(f'/portfolio/generated/{look["generatedIdentity"]}/master-{width}.webp {width}w')
    master_url = f'/portfolio/generated/{look["generatedIdentity"]}/master.png'
    srcset.append(f'{master_url} 5400w')
    look['master'] = {'asset': master_url, 'width': 5400, 'height': 2700, 'panelWidth': 1800, 'panelHeight': 2700,
                      'srcset': ', '.join(srcset), 'nativePanelDimensions': [[look[v]['width'], look[v]['height']] for v in ('front', 'back', 'editorial')],
                      'resamplingDisclosure': 'Three separate native portraits (' + ', '.join(str(look[v]['width']) + '×' + str(look[v]['height']) for v in ('front', 'back', 'editorial')) + '), uniformly resampled and placed within the requested panels. Not native 1800×2700 detail.'}
    look['qualityResult'].update({'exportGeometryPass': True, 'nativeResolutionPass': False,
                                 'reviewStatus': 'PROVISIONAL_REVIEW_ONLY', 'panelMetrics': metrics,
                                 'ownerArtisticApproval': False})
    look['status'] = 'READY'
    look['replacementStatus'] = 'READY_FOR_REVIEW_INTEGRATION'
    records = json.loads(REGISTRY.read_text()) if REGISTRY.exists() else []
    record = {'id': look['generatedIdentity'], 'sourceIdentity': source_id, 'category': look['sourceCategory'],
              'caption': look.get('generatedCaption', look.get('generatedDescription', look['source']['alt'])),
              'editorialWorld': look['category'], 'slot': look['currentSlot'], 'generationType': look['generationType'],
              'provisional': True, 'integrated': True, 'nativeResolutionLimited': True,
              'backInterpreted': (look['generationType'] != 'original-concept' and look['source'].get('views', 1) == 1),
              'uncertainties': look['constructionUncertainties'],
              'credit': {'source': 'AI-generated provisional presentation · OpenAI native image tool'},
              'image': {'src': master_url, 'srcset': ', '.join(srcset), 'width': 5400, 'height': 2700,
                        'alt': look.get('generatedDescription', 'AI-generated provisional presentation of ' + look['source']['alt']),
                        'front': 1/3, 'views': 3, 'thirdView': 'editorial', 'separable': True}}
    if look.get('provenance'):
        record.update({'provenance': look['provenance'], 'conceptName': look['conceptName'],
                       'productionVersion': look['productionVersion'],
                       'historicalReproduction': False, 'ownerArtisticApproval': False})
    records = [r for r in records if r['id'] != record['id']] + [record]
    atomic_json(REGISTRY, records)
    # Publish manifest readiness last. If interrupted earlier, the three native
    # checkpoints still exist and deterministic assembly can safely be resumed.
    save_manifest(manifest)
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
