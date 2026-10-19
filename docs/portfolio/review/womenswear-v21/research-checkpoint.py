import requests,concurrent.futures
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
out=Path('.qa-director/womenswear-v21/candidates');out.mkdir(exist_ok=True)
ids=[16982847,6311663,9514687,18532851,8423863,6780037,19220706,15591952,12093815,19132425,19132420,11931374]
def get(i):
 p=out/f'{i}.jpg'
 if not p.exists():
  r=requests.get(f'https://images.pexels.com/photos/{i}/pexels-photo-{i}.jpeg?auto=compress&cs=tinysrgb&h=1100',timeout=35);r.raise_for_status();p.write_bytes(r.content)
 im=Image.open(p);im.verify();return i
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as e: print(list(e.map(get,ids)))
sheet=Image.new('RGB',(1440,1100),'#eee');d=ImageDraw.Draw(sheet)
for n,i in enumerate(ids):
 im=Image.open(out/f'{i}.jpg');im.thumbnail((235,490));x=(n%6)*240;y=(n//6)*550;sheet.paste(im,(x+(240-im.width)//2,y+30));d.text((x+12,y+8),str(i),fill='black')
sheet.save(out/'contact.jpg',quality=94)
