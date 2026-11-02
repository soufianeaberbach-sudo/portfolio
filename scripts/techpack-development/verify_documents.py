"""Read-only verification of the final PNG/PDF/reader/cover asset graph.

Does not regenerate artwork. Run from any directory with requirements.txt installed.
"""
from pathlib import Path
import hashlib
import json
import sys
import subprocess
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
REPORTS = ROOT / 'docs/techpack-refinement-2026-10-25'

def read(name):
    return json.loads((REPORTS / name).read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def url_path(url):
    from urllib.parse import urlsplit
    return PUBLIC / urlsplit(url).path.lstrip('/')

pngs = read('png-verification.json')
pdfs = read('pdf-verification.json')
manifest = read('document-manifest.json')
copies = read('reader-previews.json')
assert len(pngs) == len(copies) == 50
assert len(pdfs) == len(manifest) == 5
page_map = {(r['style'], r['page']): r for r in pngs}
assert len(page_map) == 50
checks = []

for record, doc in zip(pdfs, manifest):
    style = doc['styleCode']
    assert record['style'] == style
    path = PUBLIC / 'techpacks' / record['filename']
    assert path == url_path(doc['pdfUrl'])
    assert sha(path) == record['sha256']
    assert record['sha256'][:12] in doc['pdfUrl']
    assert len(doc['pageImages']) == doc['pageCount'] == 10
    with fitz.open(path) as pdf:
        assert len(pdf) == record['pages'] == 10
        for n, page in enumerate(pdf, 1):
            row = page_map[(style, n)]
            source = url_path(row['file'])
            assert sha(source) == row['sha256']
            assert url_path(doc['pageImages'][n-1]) == source
            assert row['sha256'][:12] in doc['pageImages'][n-1]
            assert abs(page.rect.width - 842) < .5
            assert abs(page.rect.height - 595) < .5
            images = page.get_images(full=True)
            assert len(images) == 1
            pix = fitz.Pixmap(pdf, images[0][0])
            with Image.open(source) as image:
                assert image.size == (3508, 2480)
                assert pix.samples == image.convert('RGB').tobytes()
            placement = page.get_image_rects(images[0][0])
            assert len(placement) == 1
            box = placement[0]
            assert abs(box.width / box.height - 3508 / 2480) < .0001
            assert box.x0 >= -.1 and box.y0 >= -.1
            assert box.x1 <= page.rect.width + .1 and box.y1 <= page.rect.height + .1
            assert abs(box.width-page.rect.width) < .5
            assert abs(box.height-page.rect.height) < .5
            checks.append(dict(style=style, page=n, pngSHA256=row['sha256'],
                               embeddedPixelsIdentical=True, a4Landscape=True,
                               aspectRatioPreserved=True, pageOrderCorrect=True))
    revision = hashlib.sha256(''.join(page_map[(style, n)]['sha256'] for n in range(1,11)).encode()).hexdigest()[:12]
    assert revision == doc['revision']
    assert sha(url_path(doc['previewUrl']))[:12] in doc['previewUrl']

for row in copies:
    assert sha(url_path(row['file'])) == row['sha256']
    assert sha(url_path(row['source'])) == row['sourceSHA256']
    with Image.open(url_path(row['file'])) as image:
        assert image.size == (row['width'],row['height']) == (1600,1131)

for row in json.loads((PUBLIC / 'techpacks/materials/material-credits.json').read_text()):
    assert sha(url_path(row['url'])) == row['sha256']
    assert row['license'] and row['source'] and row['changes']

# The owner authorized display-copy localization of these three exact PR54
# sources. Preserve the original SHA256 record, prove it matches current main,
# and require the final localized Git blob pinned by the common source receipt.
# Every other foundation file and all fifty PNG/PDF pages remain exact.
localized_pr54 = {
    'src/components/portfolio/GarmentInspection.astro',
    'src/scripts/photo-inspection.ts',
    'src/scripts/menswear-reader.ts',
}
receipt = json.loads((ROOT / 'tests/fixtures/localization-preservation.json').read_text())
assert receipt['parentMain'] == '6a487817cd4a585c5140547aa9b74e2b8c6dac35'
localized_foundations = []
for row in read('pr54-preservation.json'):
    path = row['file']
    if sha(ROOT / path) == row['sha256']:
        continue
    assert path in localized_pr54, 'Unapproved PR54 foundation change: ' + path
    update = (receipt['changes'] | receipt['currentMainChanges'])[path]
    original = subprocess.check_output(['git', 'show', receipt['parentMain'] + ':' + path], cwd=ROOT)
    assert hashlib.sha256(original).hexdigest() == row['sha256'], 'Original foundation proof changed: ' + path
    git_blob = lambda b: hashlib.sha1(('blob ' + str(len(b)) + chr(0)).encode() + b).hexdigest()
    assert git_blob(original) == update['previousMainSHA1'], 'Localization baseline differs: ' + path
    assert git_blob((ROOT / path).read_bytes()) == update['authorizedSHA1'], 'Localized source differs from exact receipt: ' + path
    localized_foundations.append(path)
assert set(localized_foundations) == localized_pr54

sys.path.insert(0, str(ROOT / 'scripts/techpack-development'))
import artwork
open_path_checks = []
for g in [artwork.G[0],artwork.G[1],artwork.G[3],artwork.G[4]]:
    with artwork.shell(g,10)[0] as source:
        page=source[0]
        artwork.FUNCS[9](page,g)
        curves=[p for p in page.get_drawings()
                if p.get('color') and all(abs(a-b)<.001 for a,b in zip(p['color'],artwork.RED))
                and len(p['items'])>=3 and all(item[0]=='l' for item in p['items'])]
        assert curves, 'No curved measurement paths found: '+g['code']
        assert all(not p['closePath'] for p in curves), 'Unintended closing chord: '+g['code']
        open_path_checks.append(dict(style=g['code'],curvedMeasurementPaths=len(curves),
                                     allOpen=True,noClosingChord=True))

print(json.dumps(dict(pdfs=5, pages=50, readingCopies=50,
                     pr54FoundationFilesPreservedExceptAuthorizedLocalization=True,
                     localizedPR54Sources=localized_foundations,
                     artworkRegenerated=False, pageChecks=checks,
                     sourceMeasurementPaths=open_path_checks), indent=2))
