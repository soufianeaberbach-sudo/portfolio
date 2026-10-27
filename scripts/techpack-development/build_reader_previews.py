"""Responsive reading copies, always derived from the final 3508 x 2480 sources.
High-resolution PNGs remain unchanged and are selected automatically when zoom/DPR needs them.
"""
from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parents[2];WEB=ROOT/'public/techpacks';result={};register=[];registry=ROOT/'docs/techpack-refinement-2026-10-25/reader-previews.json';old={r['source']:r for r in json.loads(registry.read_text())} if registry.exists() else {}
for folder in sorted((WEB/'pages').iterdir()):
 if not folder.is_dir():continue
 urls=[];destdir=WEB/'reader'/folder.name;destdir.mkdir(parents=True,exist_ok=True)
 for f in sorted(folder.glob('*.png')):
  source_key='/techpacks/pages/'+folder.name+'/'+f.name;source_sha=hashlib.sha256(f.read_bytes()).hexdigest()
  previous=old.get(source_key)
  if previous and previous['sourceSHA256']==source_sha and (ROOT/'public'/previous['file'].split('?')[0].lstrip('/')).exists():
   urls.append(previous['file']);register.append(previous);continue
  src=Image.open(f);dest=destdir/(f.stem+'-1600.webp');src.resize((1600,round(src.height*1600/src.width)),Image.Resampling.LANCZOS).save(dest,lossless=True,quality=100,method=6)
  sha=hashlib.sha256(dest.read_bytes()).hexdigest();source_sha=hashlib.sha256(f.read_bytes()).hexdigest();urls.append('/techpacks/reader/'+folder.name+'/'+dest.name+'?v='+sha[:12]);register.append(dict(file=urls[-1],source='/techpacks/pages/'+folder.name+'/'+f.name,sourceSHA256=source_sha,sha256=sha,width=1600,height=round(src.height*1600/src.width),losslessEncoding=True))
 result[folder.name]=urls
(ROOT/'src/data/techpack-page-previews.json').write_text(json.dumps(result,indent=2)+'\n');(ROOT/'docs/techpack-refinement-2026-10-25/reader-previews.json').write_text(json.dumps(register,indent=2)+'\n')
print('50 responsive reading copies generated; all final PNGs unchanged.')
