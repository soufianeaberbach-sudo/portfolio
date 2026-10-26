"""Photographic reference derivatives and exact label artwork; no generated page layouts.
Photo colour treatments are disclosed in material-credits.json. Vector/texture label
proofs are manufacturer-style visualizations, not manufactured sample evidence.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageOps
import json,hashlib,re,math
import numpy as np
from completion import G
ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).with_name('assets')/'source-photographs';OUT=ROOT/'public/techpacks/materials';OUT.mkdir(exist_ok=True)
META=json.loads((SOURCE/'commons-metadata.json').read_text());REG=[]
FONTS=Path(__file__).with_name('assets')
def font(size,b=False):return ImageFont.truetype(str(FONTS/('CIDFont+F1.ttf' if b else 'CIDFont+F2.ttf')),size)
def rgb(c):return tuple(bytes.fromhex(c.lstrip('#')))
def recolor(im,c,contrast=1,reference=None):
 a=np.array(im.convert('RGB'),dtype=float);l=a@np.array([.2126,.7152,.0722]);m=reference if reference is not None else np.percentile(l,85);shade=(l/max(m,1))**contrast
 return Image.fromarray(np.clip(shade[:,:,None]*np.array(rgb(c))[None,None,:],0,255).astype('uint8'))
def save(name,im,source,kind='photographic reference',changes='Cropped and colour-retouched; representative material/form only.'):
 dest=OUT/(name+'.png');im.convert('RGB').save(dest,optimize=True)
 if isinstance(source,int):
  r=next(x for x in META if x['n']==source);m=r['extmetadata'];author=re.sub('<[^>]+>','',m.get('Artist',{}).get('value','Henna (uploader)'))
  reg=dict(source=r['descriptionurl'],original=r['url'],title=r['title'][5:],author=author,license=m['LicenseShortName']['value'],licenseUrl=m.get('LicenseUrl',{}).get('value',''),changes=changes)
 elif source.startswith('poly:'):
  k=source[5:];p=json.loads((SOURCE/'polyhaven-metadata.json').read_text())[k];reg=dict(source='https://polyhaven.com/a/'+k,title=p['name'],author=' / '.join(p['authors']),license='CC0',licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/',changes=changes)
 else:reg=dict(source=source,title=name,author='ABERBACH / OpenAI' if kind=='component visualization' else 'ABERBACH',license='ABERBACH development artwork',licenseUrl='',changes=changes)
 REG.append(dict(id=name,url='/techpacks/materials/'+dest.name,kind=kind,sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),**reg));return im
# True photographic/photogrammetric textile references; only shell/self components reuse an image.
main={1:('rough_linen.jpg','poly:rough_linen'),2:('commons-19.jpg',19),3:('commons-135.jpg',135),4:('denim_fabric_03.jpg','poly:denim_fabric_03'),5:('knitted_fleece.jpg','poly:knitted_fleece')}
for g in G:
 f,source=main[g['id']];im=Image.open(SOURCE/f).convert('RGB');im=recolor(im,g['hex'],.8 if g['id'] in [1,4] else 1)
 if g['id'] in [1,4,5]: # Macro crop, preserving the original yarn texture rather than decorative folds.
  w,h=im.size;im=im.crop((w*.18,h*.18,w*.82,h*.82))
 im.thumbnail((1200,1200));save(f'main-{g["id"]:02}',im,source)
 im.save(FONTS/f'swatch-{g["id"]:02}.png',optimize=True)
# Different material structures use different references.
lining=recolor(Image.open(SOURCE/'crepe_satin.jpg'),'#efe6d5');save('dress-lining',lining,'poly:crepe_satin')
pocketing=recolor(Image.open(SOURCE/'stretch_poplin.jpg'),'#dce1d5');save('trouser-pocketing',pocketing,'poly:stretch_poplin')
fuse=Image.open(SOURCE/'commons-136.jpg').convert('RGB');fuse=fuse.crop((200,50,970,770));fuse=recolor(ImageOps.invert(fuse),'#ecebea',.65);save('woven-fusible',fuse,136,changes='Cropped; inverted luminance/colour treatment to illustrate white woven fusible. Reference structure; not an approved swatch.')
rib=Image.open(SOURCE/'commons-152.jpg').convert('RGB');w,h=rib.size;rib=rib.crop((w*.04,h*.46,w*.70,h*.91));save('hoodie-rib',recolor(rib,'#e9dfc7',.7),152)
tape=Image.open(SOURCE/'commons-77.jpg').convert('RGB');w,h=tape.size;tape=tape.crop((w*.28,h*.15,w*.89,h*.80));save('woven-tape',recolor(tape,'#ece9df'),77)
# Genuine photographed industrial cone, with a neutral desaturated photograph ground.
# Preserve the complete original contour rather than synthesizing or over-masking it.
cone=Image.open(SOURCE/'commons-134.jpg').convert('RGB');w,h=cone.size
original=np.asarray(cone,dtype=float);luma=original@np.array([.2126,.7152,.0722]);sat=(original.max(2)-original.min(2))/np.maximum(1,original.max(2))
region=np.zeros((h,w));region[int(h*.20):int(h*.835),int(w*.22):int(w*.70)]=1
mask=Image.fromarray(np.clip((luma-65)/50,0,1).__mul__(np.clip((.45-sat)/.2,0,1)).__mul__(region).__mul__(255).astype('uint8')).filter(ImageFilter.GaussianBlur(2))
def cone_colour(colour):
 gray=ImageOps.grayscale(cone).convert('RGB');toned=recolor(cone,colour,.9,reference=210);gray.paste(toned,(0,0),mask)
 gray=gray.crop((int(w*.17),int(h*.14),int(w*.75),int(h*.90)));gray.thumbnail((500,800));return gray
for g in G:
 clean=cone_colour(g['hex'] if g['id'] not in [2,5] else ('#f7f5ef' if g['id']==2 else '#e8dfc9'))
 if g['id']==2:
  red=cone_colour('#bb1832');both=Image.new('RGB',(clean.width*2+20,max(clean.height,red.height)),'white');both.paste(clean,(0,0));both.paste(red,(clean.width+20,0));clean=both
 save(f'thread-{g["id"]:02}',clean,134,changes='Genuine industrial thread-cone photograph. Cropped, ground desaturated, thread colour retouched to coordinate with the garment; original core and complete silhouette retained. Legging pairs white/red treatments. No physical fibre/Tex authentication claimed.')
# An actual small four-hole shirt sew-through, with existing sewing threads visible.
b=Image.open(SOURCE/'commons-141.jpg').convert('RGB').crop((407,478,617,699));bw,bh=b.size;m=Image.new('L',b.size,0);ImageDraw.Draw(m).ellipse((8,9,202,211),fill=255);m=m.filter(ImageFilter.GaussianBlur(.8))
for i,c in [(1,'#e3a4be'),(4,'#8e9c84')]:
 clean=Image.new('RGB',b.size,'white');clean.paste(recolor(b,c,.8,reference=191),(0,0),m)
 save(f'buttons-{i:02}',clean,141,changes='Actual photographed four-hole shirt sew-through, isolated and colour-retouched. Representative button family; diameter is governed by the written 11/17 mm specification, not the photograph scale.')
# Correct zipper families: installed concealed zipper detail vs nylon-coil fly zipper.
z=Image.open(SOURCE/'commons-140.jpg').convert('RGB');w,h=z.size;z=z.crop((w*.20,0,w*.58,h*.74));save('dress-concealed-zip',recolor(z,'#d9c3a9'),140,changes='Installed concealed-zip detail, cropped and colour-retouched; illustrates the correct concealed zipper family, not a verified length.')
z=Image.open(SOURCE/'commons-63.jpg').convert('RGB');w,h=z.size;z=z.crop((w*.52,0,w,h));save('trouser-coil-zip',recolor(z,'#8b9c80'),63,changes='Right-hand nylon coil zipper only, cropped and colour-retouched; source photograph is public domain; no supplier endorsement is implied. No end-construction or size authentication claimed.')
# Explicitly disclosed component visualizations for exact trims without usable licensed photography.
v=Image.open(SOURCE/'component-visualizations.png').convert('RGB');w,h=v.size
for name,bb in [('stripe-tape',(0,0,w/3,h)),('clear-stay',(w/3,0,w*2/3,h)),('ring-slider',(w*2/3,0,w,h))]:save(name,v.crop(bb),'OpenAI image-generation tool',kind='component visualization',changes='AI-generated representative component visualization; not genuine supplier/product photography. Width/material/performance governed by the written development specification.')
e=Image.open(SOURCE/'elastic-visualization.png').convert('RGB');save('waist-elastic',e,'OpenAI image-generation tool',kind='component visualization',changes='AI-generated representative 8 mm flat knitted elastic visualization; not genuine product photography or supplier approval.')
# Label proofs: exact physical proportions and legible typography on a woven/printed substrate visualization.
def textile(w,h,satin=False):
 y,x=np.mgrid[:h,:w];grain=(np.sin(x*math.pi)+np.cos(y*math.pi/2))*1.5
 if not satin:grain+=np.sin(x*math.pi/4)*np.cos(y*math.pi/3)*1.2
 shade=249+grain-7*np.exp(-x/14)-7*np.exp(-(w-1-x)/14)
 return Image.fromarray(np.repeat(np.clip(shade,0,255)[:,:,None],3,2).astype('uint8'))
def center(d,text,y,f,fill='#111',spacing=0,w=1100):
 if not spacing:d.text((w/2,y),text,font=f,anchor='mt',fill=fill)
 else:
  widths=[d.textlength(c,font=f) for c in text];x=(w-sum(widths)-spacing*(len(text)-1))/2
  for c,cw in zip(text,widths):d.text((x,y),c,font=f,fill=fill);x+=cw+spacing
lab=textile(1100,500);d=ImageDraw.Draw(lab);d.line((12,2,12,498),fill='#d3d3d3',width=2);d.line((1087,2,1087,498),fill='#d3d3d3',width=2)
# A subtle end-fold shading and stitch line, no decorative frame.
for x in [40,1060]:
 for y in range(14,487,17):d.line((x,y,x,y+7),fill='#aaa',width=2)
center(d,'ABERBACH',198,font(90,True),spacing=12);save('woven-main-label',lab,'ABERBACH artwork',kind='label visualization',changes='Manufacturer-style woven wordmark proof; 55 x 25 mm finished, 5 mm end turns specified separately. Synthetic substrate texture; not a physical sample photograph.')
# Extend the blank woven bands, preserving letter and yarn proportions, to the 55:25 proof ratio.
photo=Image.open(SOURCE/'woven-label-visualization.png').convert('RGB');w,h=photo.size
photo=photo.crop((int(w*.025),int(h*.15),int(w*.975),int(h*.72)));w,h=photo.size
extra=max(0,round(w/2.2)-h);top=int(h*.16);bottom=int(h*.80)
if extra:
 canvas=Image.new('RGB',(w,h+extra),'white');canvas.paste(photo.crop((0,0,w,top)),(0,0))
 band=photo.crop((0,top,w,top+20));y=top
 while y<top+extra//2:
  n=min(20,top+extra//2-y);canvas.paste(band.crop((0,0,w,n)),(0,y));y+=n
 canvas.paste(photo.crop((0,top,w,bottom)),(0,y));y+=bottom-top
 band=photo.crop((0,bottom-20,w,bottom));end=y+extra-extra//2
 while y<end:
  n=min(20,end-y);canvas.paste(band.crop((0,0,w,n)),(0,y));y+=n
 canvas.paste(photo.crop((0,bottom,w,h)),(0,y));photo=canvas
save('woven-main-label',photo,'OpenAI image-generation tool + ABERBACH artwork',kind='label visualization',changes='AI-generated manufacturer-style woven-label proof. Blank woven bands extended without stretching letters/yarns to the specified 55:25 ratio; no physically manufactured label claim.')
pip=textile(480,1000);d=ImageDraw.Draw(pip);d.line((0,500,480,500),fill='#b9b9b9',width=2);center(d,'M',640,font(160,True),w=480);save('size-pip',pip,'ABERBACH artwork',kind='label visualization',changes='12 x 25 mm unfolded proof; centre fold yields 12 x 12.5 mm tab. M printed on outward lower half.')
transfer=Image.new('RGB',(1125,200),'white');d=ImageDraw.Draw(transfer);center(d,'ABERBACH',58,font(95,True),fill='#555',spacing=10,w=1125);save('brand-transfer',transfer,'ABERBACH artwork',kind='label artwork',changes='45 x 8 mm stretch-transfer artwork; no woven substrate claim.')
size=Image.new('RGB',(400,400),'white');d=ImageDraw.Draw(size);center(d,'M',100,font(150,True),fill='#555',w=400);save('size-transfer',size,'ABERBACH artwork',kind='label artwork',changes='8 x 8 mm size-transfer artwork.')
for g in G:
 care=textile(700,1400,True);d=ImageDraw.Draw(care);center(d,'ABERBACH',64,font(53,True),spacing=6,w=700);d.line((55,165,645,165),fill='#222',width=2)
 center(d,'SIZE '+g['sample'],192,font(47,True),w=700)
 comp=('MAIN: '+g['composition']+'\nRIB: 95% COTTON / 5% ELASTANE' if g['id']==5 else g['composition'])
 y=300
 for line in comp.split('\n'):
  f=font(42,True)
  if d.textlength(line,font=f)>620:f=font(35,True)
  center(d,line,y,f,w=700);y+=65
 y=max(y+50,490)
 for line in g['care'].split('\n'):center(d,line,y,font(42),w=700);y+=72
 d.line((55,1100,645,1100),fill='#aaa',width=2);center(d,g['code'],1140,font(42,True),w=700);center(d,'DEVELOPMENT SAMPLE',1230,font(26),w=700)
 save('care-'+g['code'],care,'ABERBACH artwork',kind='label visualization',changes='35 x 70 mm finished printed-satin proof; composition/care are development specifications, no certified results or unverified origin claim.')
 # Proper style/size packaging sticker, no dummy or unscannable barcode.
 sticker=Image.new('RGB',(950,600),'white');d=ImageDraw.Draw(sticker);d.rectangle((2,2,947,597),outline='#222',width=3);center(d,'ABERBACH',40,font(58,True),spacing=9,w=950);d.line((35,140,915,140),fill='black',width=3);center(d,g['code'],185,font(60,True),w=950);center(d,'SIZE '+g['sample']+'  /  '+g['color'],295,font(48),w=950);center(d,'DEVELOPMENT SAMPLE',455,font(29),w=950)
 save('sticker-'+g['code'],sticker,'ABERBACH artwork',kind='packaging artwork',changes='38 x 24 mm proof; human-readable style, size and colour; no invented barcode or certification.')
 for back in [False,True]:
  tag=Image.new('RGB',(1100,1800),'#fafafa');d=ImageDraw.Draw(tag);d.ellipse((530,140,570,180),fill='#ddd',outline='#888',width=3)
  if not back:
   center(d,'ABERBACH',765,font(100,True),spacing=12);d.line((430,950,670,950),fill='#111',width=3);center(d,'BETWEEN INSTINCT',1040,font(33));center(d,'& CONSTRUCTION',1100,font(33))
  else:
   center(d,'ABERBACH',420,font(65,True),spacing=9);center(d,g['code'],690,font(67,True));words=g['name'].split();lines=[];line=''
   for word in words:
    if len(line+' '+word)>24:lines.append(line);line=word
    else:line=(line+' '+word).strip()
   lines.append(line)
   for k,line in enumerate(lines):center(d,line,850+k*70,font(40))
   center(d,'SIZE '+g['sample']+'  /  '+g['color'],1180,font(42));center(d,'DEVELOPMENT SAMPLE',1510,font(31))
  save('hangtag-'+('back-'+g['code'] if back else 'front'),tag,'ABERBACH artwork',kind='hangtag artwork',changes='55 x 90 mm, black on white uncoated card, manufacturer artwork proof.')
# Last duplicate IDs are deliberate revised treatments; publish the final value only.
unique={r['id']:r for r in REG};(OUT/'material-credits.json').write_text(json.dumps(list(unique.values()),indent=2,ensure_ascii=False)+'\n')
print('Prepared',len(unique),'material / component / label assets with source and licence records.')
