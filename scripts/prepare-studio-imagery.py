"""Reproduce responsive delivery files from the retained new studio originals."""
from pathlib import Path
import hashlib
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'assets/source/studio-imagery-2026-10-24'
manifest = []
for section, widths, ratio in [('expertise', (800,1400), 3/4), ('process', (900,1440), 2/3)]:
    for path in sorted((source/section).glob('*.png')):
        image = Image.open(path).convert('RGB')
        assert abs(image.height/image.width-ratio)<.001
        item = dict(section=section, source=str(path.relative_to(root)), nativeDimensions=list(image.size), sourceSHA256=hashlib.sha256(path.read_bytes()).hexdigest(), delivery=[])
        for width in widths:
            target = root / f'public/{section}-studio/{path.stem}-{width}.webp'
            target.parent.mkdir(parents=True, exist_ok=True)
            image.resize((width,round(width*ratio)), Image.Resampling.LANCZOS).save(target, quality=91, method=6)
            item['delivery'].append(dict(path='/'+str(target.relative_to(root/'public')), width=width, height=round(width*ratio), bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
        manifest.append(item)
(source/'MANIFEST.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(f'{len(manifest)} selected photographs, {sum(len(i["delivery"]) for i in manifest)} delivery files')
