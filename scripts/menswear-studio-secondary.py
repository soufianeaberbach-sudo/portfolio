"""Reproduce independent person-silhouette evidence without editing any photograph."""
from pathlib import Path
import hashlib,json,os
import onnxruntime as ort
from PIL import Image
from rembg.sessions.u2net_human_seg import U2netHumanSegSession

ROOT=Path(__file__).resolve().parents[1]
EXPECTED='01eb6a29a5c4d8edb30b56adad9bb3a2a0535338e480724a213e0acfd2d1c73c'
opts=ort.SessionOptions();opts.intra_op_num_threads=1;opts.inter_op_num_threads=1;opts.enable_cpu_mem_arena=False;opts.enable_mem_pattern=False
session=U2netHumanSegSession('u2net_human_seg',opts,providers=['CPUExecutionProvider'])
model=Path(os.environ.get('U2NET_HOME',Path.home()/'.u2net'))/'u2net_human_seg.onnx'
assert hashlib.sha256(model.read_bytes()).hexdigest()==EXPECTED
source=json.loads((ROOT/'docs/portfolio/review/menswear-full-production-2026-10-23/PRODUCTION.json').read_text())
for look in source['looks']:
    out=ROOT/'assets/presentation/menswear-studio-v2-crosscheck'/look['id'];out.mkdir(parents=True,exist_ok=True)
    for view in ('front','back','editorial'):
        native=ROOT/look[view]['nativePath'];assert hashlib.sha256(native.read_bytes()).hexdigest()==look[view]['sha256']
        target=out/(view+'.png')
        if not target.exists():session.predict(Image.open(native).convert('RGB'))[0].save(target)
    print(look['id'],'independent silhouette preserved',flush=True)
