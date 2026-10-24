"""Reproducible, resumable foreground-preserving Menswear presentation exports.

Run with scripts/requirements-menswear-studio.txt in an isolated Python venv.
Model bytes are downloaded by rembg (public Apache-2.0 IS-Net); hashes are verified.
Never changes generation natives, historical normalized exports or old reports.
"""
from pathlib import Path
import argparse, datetime, hashlib, importlib.util, json, os, subprocess, time
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'menswear-studio-v2'
PUBLIC = ROOT/'public/portfolio/ai-concepts'/VERSION
EVIDENCE = ROOT/'assets/presentation'/VERSION
REVIEW = ROOT/'docs/portfolio/review/menswear-studio-v2-2026-10-24'
REGISTRY = ROOT/'src/data/menswear-studio-v2.json'
CATALOG = ROOT/'src/data/menswear-ai-production.json'
ORIGINAL = ROOT/'docs/portfolio/review/menswear-full-production-2026-10-23/PRODUCTION.json'
MODEL_HASH = '60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a'
VIEWS = ('front', 'back', 'editorial')
_session = None
spec = importlib.util.spec_from_file_location('studio_composite', ROOT/'scripts/menswear-studio-composite.py')
compositor = importlib.util.module_from_spec(spec); spec.loader.exec_module(compositor)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def atomic(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, indent=2)+'\n')
    temporary.replace(path)


def state():
    if REGISTRY.exists():
        return json.loads(REGISTRY.read_text())
    return {'schemaVersion': 1, 'presentationVersion': VERSION,
        'baselineCommit': 'a806acf1d0da0df28b5e2c52aab468de577250ca',
        'model': {'name': 'isnet-general-use', 'sha256': MODEL_HASH,
            'url': 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx',
            'upstream': 'https://github.com/xuebinqin/DIS', 'license': 'Apache-2.0'},
        'method': 'Semantic foreground trimap; narrow closed-form alpha matting; original foreground RGB; source-derived local sole shadows; exact-white background; proportional Lanczos exports and lossless WebP.',
        'disclosure': 'Presentation corrections from unchanged existing native photographs. No new generation, native-resolution claim, geometry change, face retouching or garment redesign.',
        'looks': [], 'failures': []}


def session():
    global _session
    if _session is None:
        import onnxruntime as ort
        from rembg.sessions.dis_general_use import DisSession
        opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
        opts.enable_cpu_mem_arena = False; opts.enable_mem_pattern = False
        _session = DisSession('isnet-general-use', opts, providers=['CPUExecutionProvider'])
        cache = Path(os.environ.get('U2NET_HOME', Path.home()/'.u2net'))/'isnet-general-use.onnx'
        assert digest(cache) == MODEL_HASH, 'segmentation model SHA256'
    return _session


def file_record(path, size=None):
    result = {'path': str(path.relative_to(ROOT)), 'bytes': path.stat().st_size, 'sha256': digest(path)}
    if str(path).startswith(str(ROOT/'public')+'/'):
        result['src'] = '/'+str(path.relative_to(ROOT/'public'))
    if size:
        result['dimensions'] = list(size)
    return result


def encode(look, view, source):
    folder = EVIDENCE/look['id']; folder.mkdir(parents=True, exist_ok=True)
    out = PUBLIC/look['id']; out.mkdir(parents=True, exist_ok=True)
    native = ROOT/source['nativePath']
    assert digest(native) == source['sha256'], 'original native hash'
    with Image.open(native) as image:
        image.load(); assert list(image.size) == source['nativeDimensions']
        original = image.convert('RGB')
    segmentation = folder/(view+'-segmentation.png')
    if not segmentation.exists():
        # The six independently reviewed sample masks can be reused byte-for-byte.
        sample = ROOT/'.qa-director/studio-validation'/f"{look['id']}-{view}-raw-mask.png"
        mask = Image.open(sample) if sample.exists() else session().predict(original)[0]
        mask.save(segmentation)
    corrected, alpha, trimap, shadow, metrics = compositor.composite(original, Image.open(segmentation))
    corrected_path = folder/(view+'-native-size-white.png')
    corrected.save(corrected_path, compress_level=4)
    records = {'segmentation': file_record(segmentation, original.size)}
    for name, image in [('alpha', alpha), ('trimap', trimap), ('shadow', shadow)]:
        path = folder/(view+'-'+name+'.png'); image.save(path)
        records[name] = file_record(path, image.size)
    panel = corrected.resize((1800,2700), Image.Resampling.LANCZOS)
    panel_path = out/(view+'.png'); panel.save(panel_path, compress_level=4)
    exports = []
    for width in (600,1200,1800):
        image = panel.resize((width, width*3//2), Image.Resampling.LANCZOS)
        path = out/f'{view}-{width}.webp'
        image.save(path, 'WEBP', lossless=True, quality=100, method=4, exact=True)
        with Image.open(path) as decoded:
            decoded.load(); assert decoded.tobytes() == image.tobytes(), 'lossless delivery fidelity'
        exports.append({**file_record(path,image.size), 'width': width, 'height': width*3//2, 'lossless': True})
    assert digest(native) == source['sha256'], 'native changed during correction'
    return {'originalNative': {'path': source['nativePath'], 'sha256': source['sha256'], 'dimensions': source['nativeDimensions']},
        'originalPanel': {'path': source['exportPath'], 'sha256': source['exportSHA256']},
        'correctedNativeSize': file_record(corrected_path, corrected.size), **records,
        'panel': file_record(panel_path, panel.size), 'exports': exports, 'qa': metrics,
        'resampledExport': True, 'newNativePhotography': False, 'status': 'EXPORTED_PENDING_VISUAL_REVIEW'}


def process(look_id):
    data = state()
    old = next((x for x in data['looks'] if x['id'] == look_id), None)
    if old:
        print(look_id, 'already preserved', flush=True)
        return False
    source = next(x for x in json.loads(ORIGINAL.read_text())['looks'] if x['id'] == look_id)
    start = time.monotonic()
    record = {'id': look_id, 'category': source['technicalCategoryId'], 'position': source['position'], 'views': {}}
    for view in VIEWS:
        record['views'][view] = encode(source, view, source[view])
        print(look_id, view, 'foreground/background checks passed', flush=True)
    master = Image.new('RGB', (5400,2700), 'white')
    for i, view in enumerate(VIEWS):
        with Image.open(ROOT/record['views'][view]['panel']['path']) as panel:
            master.paste(panel,(1800*i,0))
    path = PUBLIC/look_id/'master.png'; master.save(path,compress_level=4)
    record['master'] = file_record(path, master.size)
    record['masterResponsive'] = []
    for width in (900,1800,2700,3600):
        image=master.resize((width,width//2),Image.Resampling.LANCZOS)
        path=PUBLIC/look_id/f'master-{width}.webp'
        image.save(path,'WEBP',lossless=True,quality=100,method=4,exact=True)
        record['masterResponsive'].append(file_record(path,image.size))
    record['status'] = 'EXPORTED_PENDING_VISUAL_REVIEW'
    record['exportSeconds'] = round(time.monotonic()-start,2)
    data['looks'].append(record); atomic(REGISTRY,data)
    print(look_id, 'complete export',record['exportSeconds'],'seconds',flush=True)
    return True


def checkpoint(look_id):
    paths=[str((PUBLIC/look_id).relative_to(ROOT)),str((EVIDENCE/look_id).relative_to(ROOT)),str(REGISTRY.relative_to(ROOT))]
    subprocess.run(['git','add','--',*paths],cwd=ROOT,check=True)
    subprocess.run(['git','commit','-q','-m','fix(menswear): preserve seamless studio set '+look_id],cwd=ROOT,check=True)
    subprocess.run(['git','push','origin','HEAD:refs/heads/fix/menswear-seamless-studio-background'],cwd=ROOT,check=True)
    sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    remote=subprocess.check_output(['git','ls-remote','origin','refs/heads/fix/menswear-seamless-studio-background'],cwd=ROOT,text=True).split()[0]
    assert sha==remote
    print('REMOTE CHECKPOINT',look_id,sha,flush=True)


def activate():
    data=state(); assert len(data['looks'])==40
    assert all(x['status']=='PASS_VISUAL' for x in data['looks']), 'visual review before activation'
    catalog=json.loads(CATALOG.read_text()); images={}
    for concept in catalog['selectedCompleteLooks']:
        fixed=next(x for x in data['looks'] if x['id']==concept['id'])
        assert concept['category']==fixed['category'] and concept['position']==fixed['position']
        for view in VIEWS:
            rec=fixed['views'][view]; panel=rec['panel']; exports=rec['exports']
            concept['views'][view]['src']=panel['src'];concept['views'][view]['preview']=exports[0]['src']
            images[panel['src']]={'src':exports[-1]['src'],'srcset':', '.join(f"{x['src']} {x['width']}w" for x in exports),
                'normalizedSource':panel['src'],'sourceSHA256':panel['sha256'],'sourceBytes':panel['bytes'],
                'originalNative':rec['originalNative'],'lossless':True,'exports':exports}
        concept['master']=fixed['master']['src']
    catalog['presentationVersion']=VERSION
    atomic(CATALOG,catalog)
    atomic(ROOT/'src/data/menswear-web-images.json',{'schemaVersion':2,'collectionId':catalog['collectionId'],'presentationVersion':VERSION,
        'format':'webp','lossless':True,'quality':100,'disclosure':'Foreground-preserving, exact-white compositing of existing native sources. Versioned normalized panels and lossless delivery; native files and former exports preserved. Export geometry is resampled, not new native photography.','images':images})


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('operation',choices=['process','activate']);p.add_argument('--look');p.add_argument('--all',action='store_true');p.add_argument('--checkpoint',action='store_true');args=p.parse_args()
    if args.operation=='activate':
        activate()
    else:
        queue=[x['id'] for x in json.loads(ORIGINAL.read_text())['looks']] if args.all else [args.look]
        for look_id in queue:
            try:
                created=process(look_id)
                if args.checkpoint and created: checkpoint(look_id)
            except Exception as error:
                data=state();data['failures'].append({'look':look_id,'stage':'EXPORT_OR_CHECKPOINT','cause':repr(error),'at':datetime.datetime.now(datetime.timezone.utc).isoformat()});atomic(REGISTRY,data)
                print('RECORDED FAILURE; CONTINUING',look_id,repr(error),flush=True)
