"""Independent human-segmentation review of potentially omitted foreground cores."""
from pathlib import Path
import json
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

ROOT=Path(__file__).resolve().parents[1];review=ROOT/'docs/portfolio/review/menswear-studio-v2-2026-10-24'
registry=json.loads((ROOT/'src/data/menswear-studio-v2.json').read_text());flags=[];checked=0
for look in registry['looks']:
 for view,rec in look['views'].items():
  secondary=ROOT/'assets/presentation/menswear-studio-v2-crosscheck'/look['id']/(view+'.png')
  if not secondary.exists():continue
  human=np.asarray(Image.open(secondary));alpha=np.asarray(Image.open(ROOT/rec['alpha']['path']))
  core=ndi.binary_erosion(human>247,iterations=3)
  missing=core&(alpha<128);h,w=missing.shape;lower=missing.copy();lower[:int(h*.78)]=False
  checked+=1
  if missing.sum()>1000 or lower.sum()>250:
   yy,xx=np.where(missing);flags.append({'look':look['id'],'view':view,'independentCorePixelsAbsent':int(missing.sum()),'footRegionCorePixelsAbsent':int(lower.sum()),'bounds':[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)],'decision':'REQUIRES_VISUAL_CLASSIFICATION'})
(review/'SECONDARY-CROSSCHECK.json').write_text(json.dumps({'checkedViews':checked,'method':'Independent U2Net human foreground core versus final primary alpha; disagreements are review flags, not automatic foreground edits.','flags':flags},indent=2)+'\n');print(json.dumps({'checkedViews':checked,'flags':flags}))
