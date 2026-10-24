"""Export reviewed recovery views without changing accepted native artwork.

This is a separate, incremental recovery registry over the preserved production
manifest. It accepts partial sets; a missing view never becomes a blank panel.
Only uniform fit inside a white canvas is applied to the actual reviewed files.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import json
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'docs/portfolio/review/womenswear-seamless-recovery'
REGISTRY = ROOT / 'src/data/womenswear-generated.json'
MANIFEST = ROOT / 'docs/portfolio/review/womenswear-regeneration/MANIFEST.json'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix('.tmp')
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    tmp.replace(path)

def recover(source_id, files, retouched, note):
    manifest = json.loads(MANIFEST.read_text())
    look = next(x for x in manifest['looks'] if x['sourceIdentity'] == source_id)
    registry = json.loads(REGISTRY.read_text())
    if any(x['sourceIdentity'] == source_id and x['integrated'] for x in registry):
        raise ValueError('An active successful presentation is protected')
    identity = 'ww-recovery-' + source_id + '-v1'
    out = ROOT / 'public/portfolio/recovery' / identity
    if out.exists():
        raise ValueError('Recovery outputs are immutable; use an explicit new version')
    out.mkdir(parents=True)
    photography, provenance = {}, {}
    for key, supplied in files.items():
        source = Path(supplied)
        original = Image.open(source)
        original.load()
        native = out / (key + '-native.png')
        shutil.copy2(source, native)
        rgba = original.convert('RGBA')
        # Retain the complete composition and alpha shadow. Never threshold
        # whites, infer a garment mask, warp anatomy or crop photographic edges.
        scale = min(1656 / rgba.width, 2484 / rgba.height)
        resized = rgba.resize((round(rgba.width * scale), round(rgba.height * scale)), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (1800, 2700), 'white')
        offset = ((1800 - resized.width) // 2, (2700 - resized.height) // 2)
        canvas.alpha_composite(resized, offset)
        rgb = canvas.convert('RGB')
        export = out / (key + '.png')
        rgb.save(export, compress_level=6)
        src = '/' + str(export.relative_to(ROOT / 'public'))
        variants = []
        for width in (450, 900):
            path = out / f'{key}-{width}.webp'
            rgb.resize((width, width * 3 // 2), Image.Resampling.LANCZOS).save(path, quality=94)
            variants.append('/' + str(path.relative_to(ROOT / 'public')) + f' {width}w')
        alt = f'{key.capitalize()} view: ' + look['source']['alt']
        photography[key] = dict(src=src, srcset=', '.join(variants + [src + ' 1800w']), width=1800, height=2700, alt=alt, front=1, views=1)
        provenance[key] = dict(inputPath=str(source), inputSHA256=digest(source), nativeAsset='/' + str(native.relative_to(ROOT / 'public')), nativeSHA256=digest(native), nativeDimensions=list(original.size), nativeMode=original.mode, exportSHA256=digest(export), uniformScale=scale, offset=list(offset), resampled=True, nativeHighResolutionClaim=False)
    if 'front' not in photography:
        raise ValueError('A truthful Front or primary photograph is required')
    record = dict(id=identity, sourceIdentity=source_id, category=look['sourceCategory'], editorialWorld=look['category'], slot=look['currentSlot'], generationType='background-retouch' if retouched else 'preserved-design', provisional=True, integrated=True, nativeResolutionLimited=True, backInterpreted=bool(not retouched and 'back' in photography and look['source'].get('views', 1) == 1), uncertainties=look['constructionUncertainties'], credit=dict(source='AI-assisted background retouch of supplied reference' if retouched else 'AI-generated provisional presentation · OpenAI native image tool'), image=photography['front'], photography=photography, availableViews=list(photography), recoveryMethod='edited-existing' if retouched else 'retained-faithful-views', caption=look['source']['alt'].replace('Front and back views of ', '').replace(', photographed together on a white studio ground.', '.').replace(', photographed on a white studio ground.', '.'))
    registry.append(record)
    receipt = dict(sourceIdentity=source_id, identity=identity, recordedUTC=datetime.now(timezone.utc).isoformat(), availableViews=list(photography), threeViewComplete=set(photography) == {'front', 'back', 'editorial'}, method=record['recoveryMethod'], reviewNote=note, sourceSHA256=look['sourceSHA256'], outputs=provenance, ownerArtisticApproval=False, integratedInBranch=True)
    look['recoveryPresentation'] = receipt
    write_json(REVIEW / (source_id + '.json'), receipt)
    write_json(MANIFEST, manifest)
    write_json(REGISTRY, registry)
    print(json.dumps(dict(id=identity, availableViews=list(photography), method=receipt['method'])))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_id')
    parser.add_argument('--front', required=True)
    parser.add_argument('--back')
    parser.add_argument('--editorial')
    parser.add_argument('--retouched', action='store_true')
    parser.add_argument('--note', required=True)
    args = parser.parse_args()
    recover(args.source_id, {k: v for k in ('front', 'back', 'editorial') if (v := getattr(args, k))}, args.retouched, args.note)
