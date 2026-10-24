"""Encode delivery derivatives from selected panels; never modify native or production files."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / 'src/data/menswear-ai-production.json').read_text())
destination = ROOT / 'public/portfolio/ai-concepts/menswear-delivery-2026-2027'

def encode(item):
    look, view, source = item
    path = ROOT / ('public' + source['src'])
    source_hash = hashlib.sha256(path.read_bytes()).hexdigest()
    with Image.open(path) as image:
        image.load()
        assert image.size == (1800, 2700), str(path)
        folder = destination / look
        folder.mkdir(parents=True, exist_ok=True)
        exports = []
        for width in (1200, 1800):
            target = folder / f'{view}-{width}.webp'
            if not target.exists():
                image.convert('RGB').resize((width, width * 3 // 2), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=93, method=6)
            with Image.open(target) as decoded:
                decoded.load()
                assert decoded.size == (width, width * 3 // 2)
            exports.append({'src': '/' + str(target.relative_to(ROOT / 'public')), 'width': width,
                            'height': width * 3 // 2, 'bytes': target.stat().st_size,
                            'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
    assert hashlib.sha256(path.read_bytes()).hexdigest() == source_hash
    return source['src'], {'src': exports[-1]['src'],
        'srcset': source['preview'] + ' 600w, ' + ', '.join(f"{x['src']} {x['width']}w" for x in exports),
        'normalizedSource': source['src'], 'sourceSHA256': source_hash,
        'sourceBytes': path.stat().st_size, 'exports': exports}

items = [(look['id'], view, source) for look in catalog['selectedCompleteLooks'] for view, source in look['views'].items()]
assert len(items) == 120
with ThreadPoolExecutor(max_workers=4) as pool:
    images = dict(pool.map(encode, items))
report = {'schemaVersion': 1, 'collectionId': catalog['collectionId'], 'format': 'webp', 'quality': 93,
          'disclosure': 'Delivery derivatives from existing selected 1800x2700 panels. No new photography, cropping, stretching or modification of original files.',
          'images': images}
(ROOT / 'src/data/menswear-web-images.json').write_text(json.dumps(report, indent=2) + '\n')
before = sum(x['sourceBytes'] for x in images.values())
after = sum(x['exports'][-1]['bytes'] for x in images.values())
print(json.dumps({'views': len(images), 'derivatives': 240, 'originalPanelBytes': before,
                  'web1800Bytes': after, 'reductionPercent': round(100 * (1 - after / before), 1)}))
