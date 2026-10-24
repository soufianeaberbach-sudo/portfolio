"""Prepare all-view review plates and report potentially ambiguous enclosed gaps."""
from pathlib import Path
import argparse,json,shutil
import numpy as np
from scipy import ndimage as ndi
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[1]
REVIEW=ROOT/'docs/portfolio/review/menswear-studio-v2-2026-10-24'
parser=argparse.ArgumentParser();parser.add_argument('--boards',action='store_true');parser.add_argument('--final',action='store_true');args=parser.parse_args()
data=json.loads((ROOT/'src/data/menswear-studio-v2.json').read_text())
flags=[]
for look in data['looks']:
 for view,rec in look['views'].items():
  mask=np.asarray(Image.open(ROOT/rec['segmentation']['path']))>127
  filled=ndi.binary_fill_holes(mask);holes,n=ndi.label(filled&~mask)
  ys,xs=np.where(mask);top=ys.min();height=ys.max()-top;cx=(xs.max()+xs.min())/2;half=(xs.max()-xs.min())/2
  counts=np.bincount(holes.ravel())
  for label in range(1,n+1):
   if counts[label]<20:continue
   y,x=np.where(holes==label)
   if len(x)<20:continue
   if abs(x.mean()-cx)<half*.38 and top+height*.13<y.mean()<top+height*.56:
    flags.append({'look':look['id'],'view':view,'area':len(x),'bounds':[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)],'reason':'Enclosed gap near torso centre requires visual classification, not automatic deletion.'})
if args.boards:
 folder=REVIEW/('final-view-plates' if args.final else 'all-view-plates');folder.mkdir(parents=True,exist_ok=True)
 for i in range(0,len(data['looks'])-1,2):
  pair=data['looks'][i:i+2];path=folder/f"{i//2+1:02d}-{pair[0]['id']}-{pair[1]['id']}.png"
  if path.exists():continue
  original=REVIEW/'all-view-plates'/path.name
  if args.final and original.exists() and not any('rejectedPresentation' in x for x in pair):
   shutil.copyfile(original,path);continue
  board=Image.new('RGB',(1536,1600),'white');d=ImageDraw.Draw(board)
  for row,look in enumerate(pair):
   for col,view in enumerate(('front','back','editorial')):
    with Image.open(ROOT/look['views'][view]['correctedNativeSize']['path']) as image:board.paste(image.resize((512,768),Image.Resampling.LANCZOS),(col*512,row*800+32))
    d.text((col*512+16,row*800+10),look['id']+' / '+view,fill='black')
  board.save(path,compress_level=4)
REVIEW.mkdir(parents=True,exist_ok=True);(REVIEW/'SEGMENTATION-REVIEW-FLAGS.json').write_text(json.dumps({'exportedLooks':len(data['looks']),'flags':flags},indent=2)+'\n')
print(json.dumps({'exportedLooks':len(data['looks']),'flags':flags}))
