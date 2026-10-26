import fitz,math,io,json,zipfile
from pathlib import Path
from PIL import Image
from specs import BASE
from revisions import G
MASTER=Path(__file__).with_name('template.pdf')
OUT=Path(__file__).resolve().parents[2]/'.qa-director/completion/pages';OUT.mkdir(parents=True,exist_ok=True)
SRC=fitz.open(MASTER)
FONT={'r':fitz.Font(fontfile=str(BASE/'CIDFont+F2.ttf')),'b':fitz.Font(fontfile=str(BASE/'CIDFont+F1.ttf'))}
BLACK=(0,0,0);RED=(.85,.19,.24);GRAY=(.95,.95,.95)
issues=[]
FALL={'r':fitz.Font('helv'),'b':fitz.Font('hebo')}
def runfont(font,c):
 return font if FONT[font].has_glyph(ord(c)) else 'f'+font
def tw(s,size,font):
 return sum((FONT[font] if runfont(font,c)==font else FALL[font]).text_length(c,fontsize=size) for c in str(s))
NAMES=['cover-sheet','bill-of-materials','labels-packaging-bom','front-callouts','back-callouts','colorways','label-specifications','packaging-specifications','measurement-specification','point-of-measurement-diagram']
TITLES=['COVER SHEET','BILL OF MATERIALS','BILL OF MATERIALS','CALLOUTS','CALLOUTS','COLORWAYS','LABELS','PACKAGING','MEASUREMENT SPECIFICATION','POINT OF MEASUREMENT DIAGRAM']
def rect(p,bb,fill=None,color=BLACK,width=.6):p.draw_rect(fitz.Rect(bb),fill=fill,color=color,width=width,overlay=True)
def line(p,a,b,color=BLACK,width=.6):p.draw_line(a,b,color=color,width=width,overlay=True)
def txt(p,s,x,y,size=11,font='r',color=BLACK,align='left',maxw=None):
 s=str(s);w=tw(s,size,font)
 if maxw and w>maxw:size*=maxw/w;w=maxw
 if align=='center':x-=w/2
 if align=='right':x-=w
 runs=[]
 for c in s:
  f=runfont(font,c)
  if runs and runs[-1][0]==f:runs[-1][1]+=c
  else:runs.append([f,c])
 for f,t in runs:
  p.insert_text((x,y),t,fontname=f,fontsize=size,color=color,overlay=True)
  metric=FONT[f] if f in FONT else FALL[f[1:]]
  x+=metric.text_length(t,fontsize=size)
def wrapped(s,w,size=10,font='r'):
 a=[]
 for para in str(s).split('\n'):
  cur=''
  for v in para.split():
   test=cur+' '+v if cur else v
   if tw(test,size,font)>w and cur:a.append(cur);cur=v
   else:cur=test
  a.append(cur)
 return a

def boxtext(p,s,bb,size=10,font='r',color=BLACK,align='left',valign='center',pad=5,minsize=8):
 x0,y0,x1,y1=bb;w=x1-x0-2*pad;h=y1-y0-2*pad
 while True:
  ls=wrapped(s,w,size,font);lead=size*1.18
  if len(ls)*lead<=h or size<=minsize:break
  size-=.25
 if len(ls)*lead>h+.5:issues.append(('text-overflow',str(s)[:50],bb))
 y=y0+pad+size+(h-len(ls)*lead)/2 if valign=='center' else y0+pad+size
 for z in ls:
  x=x0+pad
  if align=='center':x=(x0+x1)/2
  if align=='right':x=x1-pad
  txt(p,z,x,y,size,font,color,align,maxw=w);y+=lead

def arrow(p,a,b,label=None,both=False,off=(0,-5),width=.65):
 line(p,a,b,RED,width)
 def head(q,other):
  ang=math.atan2(other[1]-q[1],other[0]-q[0]);l=4
  for ang2 in [ang+.38,ang-.38]:line(p,q,(q[0]+l*math.cos(ang2),q[1]+l*math.sin(ang2)),RED,width)
 head(b,a)
 if both:head(a,b)
 if label:txt(p,label,(a[0]+b[0])/2+off[0],(a[1]+b[1])/2+off[1],10,'b',RED,'center')

def dim(p,a,b,label,off=(0,-4)):
 arrow(p,a,b,label,True,off)
 # ticks perpendicular to the dimension line
 dx=b[0]-a[0];dy=b[1]-a[1];l=math.hypot(dx,dy) or 1
 for q in [a,b]:line(p,(q[0]-dy/l*3,q[1]+dx/l*3),(q[0]+dy/l*3,q[1]-dx/l*3),RED,.4)

def shell(g,n):
 doc=fitz.open();p=doc.new_page(width=841.92,height=595.32)
 for k in ['r','b']:p.insert_font(fontname=k,fontfile=str(BASE/('CIDFont+F1.ttf' if k=='b' else 'CIDFont+F2.ttf')))
 p.insert_font(fontname='fr',fontbuffer=FALL['r'].buffer);p.insert_font(fontname='fb',fontbuffer=FALL['b'].buffer)
 # Reuse every neutral vector path from the supplied master page.
 # Garment sketches and red arrows are replaced; the original document geometry is retained.
 for d in SRC[n-1].get_drawings():
  c=d['fill'] or d['color']
  if c and max(c)-min(c)>.05:continue
  sh=p.new_shape()
  for it in d['items']:
   if it[0]=='re':sh.draw_rect(it[1])
   elif it[0]=='l':sh.draw_line(it[1],it[2])
   elif it[0]=='c':sh.draw_bezier(*it[1:])
   elif it[0]=='qu':sh.draw_quad(it[1])
  sh.finish(fill=d['fill'],color=d['color'],width=d['width'] or .1,closePath=d.get('closePath',False),even_odd=d.get('even_odd',False));sh.commit()
 # Master header / footer positions differ slightly by page and are preserved.
 bars=[d['rect'] for d in SRC[n-1].get_drawings() if d['fill']==(0.,0.,0.) and d['rect'].width>750 and d['rect'].height>15]
 top=min(bars,key=lambda r:r.y0);bottom=max(bars,key=lambda r:r.y0)
 txt(p,'A B E R B A C H',37.44,top.y0+18,12,'b',(1,1,1))
 txt(p,TITLES[n-1],806,top.y0+19.2,15.5,'b',(1,1,1),'right')
 y=top.y1+14
 for label,value,x0,x1 in [('BRAND:','ABERBACH',60,100),('DESIGNER:','SOUFIANE ABERBACH',361.92,415.32),('DESCRIPTION:',g['sex'],631.68,700.32)]:
  txt(p,label,x0,y,10.7,'b');txt(p,value,x1,y,10.7,maxw=(145 if x1<600 else 113))
 y+=21.12
 for label,value,x0,x1 in [('SEASON:','SPRING / SUMMER 2027',56.28,100.32),('DATE:','25/10/2026',383.88,415.32),('MAIN FABRIC:',g['fabric'],631.2,700.32)]:
  txt(p,label,x0,y,10.7,'b');txt(p,value,x1,y,10.7,maxw=(140 if x1<600 else 113))
 y+=21.12
 txt(p,'STYLE NAME:',35.4,y,10.7,'b');txt(p,g['name'],100.32,y,10.7,maxw=249)
 txt(p,'STYLE:',381.96,y,10.7,'b');txt(p,g['code'],415.32,y,10.7,maxw=135)
 txt(p,'SIZE RANGE & [SAMPLE SIZE]:',560.52,y,10.7,'b')
 txt(p,'  '.join('['+z+']' if z==g['sample'] else z for z in g['sizes']),700.32,y,10.7)
 txt(p,g['code']+'  |  DEVELOPMENT SAMPLE',35,bottom.y0+14,9,'r',(1,1,1))
 txt(p,f'{n:02} / 10',806,bottom.y0+14,9,'b',(1,1,1),'right')
 return doc,p

def image(p,path,bb):
 return p.insert_image(fitz.Rect(bb),filename=str(path),keep_proportion=True,overlay=True)

def flat(p,g,view,bb,cw=None):
 path=BASE/f'flat-{g["id"]:02}-{view}{"-cw"+cw if cw else ""}.png'
 im=Image.open(path);r=fitz.Rect(bb);scale=min(r.width/im.width,r.height/im.height);w,h=im.width*scale,im.height*scale
 rr=fitz.Rect(r.x0+(r.width-w)/2,r.y0+(r.height-h)/2,r.x0+(r.width+w)/2,r.y0+(r.height+h)/2)
 image(p,path,rr);return rr

def at(r,xy):return (r.x0+xy[0]*r.width,r.y0+xy[1]*r.height)

def brandlabel(p,bb,size='M',kind='brand'):
 r=fitz.Rect(bb);rect(p,bb,(1,1,1),BLACK,.8)
 if kind=='brand':
  rect(p,(r.x0+3,r.y0+3,r.x1-3,r.y1-3),None,(.6,.6,.6),.25)
  txt(p,'ABERBACH',r.x0+r.width/2,r.y0+r.height*.58,min(17,r.width/7),'b',align='center')
 elif kind=='size':txt(p,size,r.x0+r.width/2,r.y0+r.height*.65,min(20,r.width*.5),'b',align='center')

def carelabel(p,g,bb,full=True):
 r=fitz.Rect(bb);rect(p,bb,(1,1,1));sz=min(9,r.width/12)
 txt(p,'ABERBACH',r.x0+r.width/2,r.y0+sz*1.7,sz+2,'b',align='center')
 s=f'SIZE {g["sample"]}\n'+('MAIN: '+g['composition']+'\nRIB: 95% COTTON / 5% ELASTANE' if g['id']==5 else g['composition'])+'\n\n'+g['care']+'\n\n'+g['code']+'\nMADE IN MOROCCO'
 # Country of origin is a planned production field; avoid asserting unverified origin.
 s=s.replace('MADE IN MOROCCO','ORIGIN: PER PRODUCTION ORDER')
 boxtext(p,s,(r.x0+3,r.y0+sz*2,r.x1-3,r.y1-3),sz,align='center',minsize=3,pad=2)

def hangtag(p,bb,back=False,g=None):
 r=fitz.Rect(bb);rect(p,bb,(1,1,1));p.draw_circle((r.x0+r.width/2,r.y0+10),2,color=BLACK,width=.6)
 if not back:txt(p,'ABERBACH',r.x0+r.width/2,r.y0+r.height*.55,min(14,r.width/7),'b',align='center')
 elif g:
  boxtext(p,f'{g["name"]}\n\n{g["code"]}\nSIZE: {g["sample"]}\n{g["color"]}\n\nSKU / BARCODE',(r.x0+3,r.y0+25,r.x1-3,r.y1-5),8,align='center',minsize=6)

def bag(p,bb,g=None,back=False):
 r=fitz.Rect(bb);rect(p,bb,(1,1,1));line(p,(r.x0,r.y0+12),(r.x1,r.y0+12))
 if not back:txt(p,'ABERBACH',r.x0+r.width/2,r.y1-12,min(14,r.width/7),'b',align='center')
 else:boxtext(p,'WARNING\nKEEP THIS BAG AWAY\nFROM BABIES AND CHILDREN.\nTHIS BAG IS NOT A TOY.\n\nLDPE 04  |  RECYCLE',(r.x0+8,r.y0+30,r.x1-8,r.y1-15),8,align='center',minsize=6)

def trimicon(p,g,label,bb):
 r=fitz.Rect(bb);cx=(r.x0+r.x1)/2;cy=(r.y0+r.y1)/2
 if 'BUTTON' in label:
  for off in [-15,15]:
   p.draw_circle((cx+off,cy),12,color=BLACK,fill=(.97,.97,.97),width=.7)
   for dx in [-2.5,2.5]:
    for dy in [-2.5,2.5]:p.draw_circle((cx+off+dx,cy+dy),.9,color=BLACK,fill=BLACK)
 elif 'ZIP' in label:
  rect(p,(cx-8,r.y0+6,cx+8,r.y1-6),(.96,.96,.96),BLACK,.5)
  line(p,(cx, r.y0+8),(cx,r.y1-8))
  for y in range(int(r.y0+9),int(r.y1-8),3):line(p,(cx-3,y),(cx+3,y+.7),BLACK,.7)
  rect(p,(cx-3,r.y0+12,cx+3,r.y0+23),(1,1,1));rect(p,(cx-2,r.y0+17,cx+2,r.y0+28),(1,1,1))
 elif 'THREAD' in label:
  p.draw_oval((cx-17,cy-20,cx+17,cy-13),color=BLACK,fill=(.96,.96,.96));rect(p,(cx-14,cy-16,cx+14,cy+21),(1,1,1));p.draw_oval((cx-17,cy+17,cx+17,cy+24),color=BLACK,fill=(.96,.96,.96))
  for y in range(int(cy-12),int(cy+18),3):line(p,(cx-14,y),(cx+14,y-3),(.5,.5,.5),.4)
 elif 'ADJUST' in label:
  for off in [-20,15]:
   rect(p,(cx+off-6,cy-9,cx+off+6,cy+9),None,BLACK,1);line(p,(cx+off-6,cy),(cx+off+6,cy),BLACK,1)
 else:
  rect(p,(r.x0+12,cy-8,r.x1-12,cy+8),(.93,.93,.93),BLACK,.5)
  for x in range(int(r.x0+14),int(r.x1-12),3):line(p,(x,cy-7),(x,cy+7),(.65,.65,.65),.25)
  if 'STRIPE' in label:
   for dy in [-5,0,5]:line(p,(r.x0+14,cy+dy),(r.x1-14,cy+dy),(.7,.1,.16),1.8)

def cover(p,g):
 txt(p,'FABRIC SWATCH',144,118,11,'b',align='center');txt(p,'SKETCH',541,118,11,'b',align='center')
 image(p,BASE/f'swatch-{g["id"]:02}.png',(40,141,247,302))
 boxtext(p,f'F01  {g["color"]}\n{g["composition"]}\n{g["weight"]}  |  MAIN FABRIC',(36,306,251,356),10,align='center')
 # Second sample is a close view of the same source textile, as in the master swatch column.
 image(p,BASE/f'swatch-{g["id"]:02}.png',(40,370,247,492))
 boxtext(p,'SURFACE DETAIL\n'+g['fabric']+'\nSoft handle; match source face and drape.',(36,497,251,551),9.5,align='center')
 flat(p,g,'front',(285,145,525,512));flat(p,g,'back',(550,145,790,512))
 txt(p,'FRONT',405,138,10,'b',align='center');txt(p,'BACK',670,138,10,'b',align='center')
 boxtext(p,g['summary'],(279,520,806,553),10,align='center')

def bom(p,g):
 txt(p,'FABRICS',421,109,12,'b',(1,1,1),'center');txt(p,'TRIMS',421,354,12,'b',(1,1,1),'center')
 xs=[23.5,83.4,203.4,398.4,503.4,608.4,713.4,818.4]
 for i,t in enumerate(['ITEM','IMAGE','DESCRIPTION','COLOUR','CODE','QTY','SUPPLIER']):boxtext(p,t,(xs[i],114.3,xs[i+1],131.7),10,'b',align='center',pad=1)
 for j,row in enumerate(g['fabrics']+g['trims']):
  a=132.72+j*69.6 if j<3 else 359.28+(j-3)*69.6;b=a+69.6
  lab,desc,col,code,qty,supp=row
  for i,t in enumerate([lab,'',desc,col,code,qty,supp]):
   if i!=1:boxtext(p,t,(xs[i]+1,a+1,xs[i+1]-1,b-1),10.5,'b' if i==0 else 'r',align='center',pad=4,minsize=9)
  if j==0:image(p,BASE/f'swatch-{g["id"]:02}.png',(89,a+6,197,b-6))
  elif j<3:
   if qty=='—':txt(p,'—',143,(a+b)/2+3,12,align='center')
   else:trimicon(p,g,'FABRIC',(86,a+4,200,b-4))
  else:trimicon(p,g,lab,(86,a+4,200,b-4))

def labels_bom(p,g):
 txt(p,'LABELS & PACKAGING',421,117,12,'b',(1,1,1),'center')
 xs=[23.5,83.4,203.4,398.4,503.4,608.4,713.4,818.4]
 for i,t in enumerate(['ITEM','IMAGE','DESCRIPTION','COLOUR','CODE','QTY','SUPPLIER']):boxtext(p,t,(xs[i],122.4,xs[i+1],139.8),10,'b',align='center',pad=1)
 rows=[('BRAND\nLABEL','Soft woven polyester; 55 x 25 mm finished; 65 x 25 mm cut incl. 5 mm end turns.','BLACK / WHITE','L01'),('SIZE PIP','Soft woven size tab, 12 x 25 mm unfolded. Fold at center.','BLACK / WHITE','L02'),('CARE\nLABEL','Printed soft satin, 35 x 70 mm; composition, care, style and origin.','WHITE / BLACK','L03'),('HANG TAG','300 gsm recycled card, 55 x 90 mm, with cotton string; 2 mm punched hole.','WHITE / BLACK','P01'),('POLY BAG',f'Clear recycled LDPE, 40 microns; {g["bag"][0]} x {g["bag"][1]} cm + 4 cm flap. Style/size sticker 38 x 24 mm.','CLEAR / BLACK','P02')]
 if g['id']==2:
  rows[0]=('BRAND\nTRANSFER','Soft stretch heat transfer, 45 x 8 mm; inside back waistband.','GREY','L01')
  rows[1]=('SIZE\nTRANSFER','Heat transfer size M, 8 x 8 mm. Apply with brand transfer.','GREY','L02')
 ys=[140.76,217.08,293.4,382.44,471.48,560.04]
 for j,(lab,desc,col,code) in enumerate(rows):
  a,b=ys[j:j+2]
  for i,t in enumerate([lab,'',desc,col,code,'1 pc','Buyer nominated']):
   if i!=1:boxtext(p,t,(xs[i]+1,a+1,xs[i+1]-1,b-1),10.5,'b' if i==0 else 'r',align='center',pad=4,minsize=9)
  if j==0:brandlabel(p,(94,a+30,193,a+47) if g['id']==2 else (94,a+23,193,b-20))
  elif j==1:brandlabel(p,(130,a+24,158,a+52) if g['id']==2 else (130,a+17,158,b-17),g['sample'],'size')
  elif j==2:carelabel(p,g,(117,a+6,171,b-6))
  elif j==3:hangtag(p,(121,a+8,168,b-8))
  else:bag(p,(114,a+8,177,b-8),g)
ANCHORS={
1:{'front':[(.47,.06),(.51,.40),(.29,.39),(.21,.30),(.90,.83),(.91,.95),(.47,.64),(.70,.12),(.70,.37),(.37,.64)],'back':[(.48,.35),(.50,.04),(.70,.12),(.78,.30),(.16,.64),(.11,.95),(.75,.48),(.49,.65),(.50,.08),(.75,.64)]},
2:{'front':[(.50,.06),(.52,.015),(.50,.20),(.83,.24),(.77,.64),(.50,.29),(.39,.56),(.74,.97),(.72,.14),(.18,.87)],'back':[(.50,.04),(.50,.20),(.50,.07),(.86,.29),(.50,.28),(.38,.62),(.63,.37),(.72,.97),(.50,.035),(.23,.085)]},
3:{'front':[(.41,.13),(.29,.21),(.50,.19),(.75,.03),(.72,.21),(.67,.61),(.79,.80),(.72,.985),(.32,.97),(.29,.37)],'back':[(.50,.19),(.71,.07),(.50,.27),(.50,.62),(.38,.31),(.51,.28),(.69,.27),(.66,.985),(.44,.19),(.28,.30)]},
4:{'front':[(.49,.025),(.53,.125),(.51,.025),(.18,.10),(.32,.29),(.27,.025),(.20,.54),(.43,.57),(.25,.97),(.79,.65)],'back':[(.31,.08),(.29,.11),(.69,.15),(.50,.20),(.50,.025),(.70,.025),(.50,.29),(.42,.64),(.24,.98),(.50,.035)]},
5:{'front':[(.50,.12),(.37,.10),(.20,.25),(.13,.56),(.50,.48),(.08,.93),(.50,.94),(.40,.89),(.28,.66),(.72,.65)],'back':[(.50,.13),(.50,.03),(.50,.22),(.50,.51),(.19,.26),(.27,.47),(.08,.94),(.50,.95),(.52,.055),(.27,.80)]}}

def callouts(p,g,view):
 start=99.72 if view=='front' else 93.12
 bounds=[start,start+(63.36 if view=='front' else 65.16)]
 for i in range(8):bounds.append(bounds[-1]+(42.24 if view=='front' else 43.44))
 bounds.append(564.36 if view=='front' else 570.96)
 txt(p,view.upper(),271,116 if view=='front' else 110,12,'b',align='center')
 r=flat(p,g,view,(135,145,414,518))
 anchors=ANCHORS[g['id']][view]
 # Distribute leaders on both sides in vertical order to keep the garment readable.
 for side in [0,1]:
  inds=[i for i,a in enumerate(anchors) if (0 if a[0]<.5 else 1)==side]
  inds.sort(key=lambda i:anchors[i][1])
  ys=[]
  for i in inds:
   y=at(r,anchors[i])[1];ys.append(max(145,y,ys[-1]+27 if ys else 145))
  if ys and ys[-1]>522:
   diff=ys[-1]-522;ys=[y-diff for y in ys]
  for i,yy in zip(inds,ys):
   target=at(r,anchors[i]);lx=82 if side==0 else 464
   txt(p,str(i+1),lx,yy+3,11,'b',RED,'center')
   arrow(p,(lx+10 if side==0 else lx-10,yy),target)
 for j,note in enumerate(g[view]):
  a,b=bounds[j:j+2];boxtext(p,str(j+1),(520,a,547,b),11,'b',RED,align='center',pad=1)
  boxtext(p,note,(549,a+2,816,b-2),10.5,pad=4,minsize=9)

def colorways(p,g):
 for j,(code,name,col) in enumerate(g['colors']):
  x=30+j*263
  txt(p,'COLORWAY '+code,x+125,129,11,'b',align='center')
  flat(p,g,'front',(x+7,145,x+124,446),code);flat(p,g,'back',(x+131,145,x+248,446),code)
  rgb=tuple(v/255 for v in bytes.fromhex(col.lstrip('#')))
  rect(p,(x+93,459,x+157,483),rgb,BLACK,.5)
  txt(p,name,x+125,500,11,'b',align='center')
  txt(p,'FRONT / BACK  |  '+g['code'],x+125,516,8.5,align='center')
 boxtext(p,('01: WHITE / RED TAPES; 02: BLACK / IVORY TAPES; 03: NAVY / WHITE TAPES. NO EXTERIOR BRAND MARK.\nCOLOR REFERENCES ARE SIMULATIONS; MATCH STRIPE TAPE STRETCH AND SHADE TO EACH COLORWAY.' if g['id']==2 else 'COLOR REFERENCES ARE DEVELOPMENT SIMULATIONS. APPROVE BULK SHADE AGAINST PHYSICAL FABRIC AND TRIM STANDARDS.\nMATCH ALL COMPONENTS WITHIN EACH COLORWAY; CHECK COLORFASTNESS BEFORE BULK CUTTING.'),(29,533,812,556),8,'r',RED,align='center',pad=0,minsize=7)

def labels(p,g):
 txt(p,'MAIN LABEL',38,130,22,'b');txt(p,'SIZE PIP',555,130,20,'b')
 if g['id']==2:
  # Same artwork zone as the master label; skin-contact method varies by garment.
  brandlabel(p,(73,192,258,225))
  txt(p,'SOFT STRETCH TRANSFER',165,269,9,'b',align='center')
  boxtext(p,'Brand transfer 45 x 8 mm.\nInside center back waistband.\nSize transfer 8 x 8 mm, 5 mm below.\nApply on flat fabric before assembly.\nTrial heat / pressure on shell first.',(281,158,500,279),10.5,valign='top')
  dim(p,(73,257),(258,257),'45 mm');dim(p,(60,192),(60,225),'8 mm',(-16,0))
 else:
  brandlabel(p,(73,162,258,246));dim(p,(73,259),(258,259),'55 mm');dim(p,(60,162),(60,246),'25 mm',(-16,0))
  boxtext(p,'Soft woven polyester; end-fold label.\n55 x 25 mm finished; 65 x 25 mm cut.\n5 mm end turns; artwork 45 x 25 mm.\n'+g['labelplace']+'\n'+('301 tack upper 6 mm of end folds to tape.\nPip sewn to lower brand-label edge.' if g['id']==5 else '301 stitch both ends, 2 mm from fold.')+'\nWhite ground / black woven wordmark.',(281,157,510,283),10.5,valign='top')
 if g['id']==2:
  brandlabel(p,(644,182,691,229),g['sample'],'size')
  dim(p,(644,165),(691,165),'8 mm');dim(p,(706,182),(706,229),'8 mm',(18,0))
  txt(p,'SOFT SIZE TRANSFER',665,258,9,'b',align='center')
  txt(p,'5 mm below brand transfer.',664,287,9,align='center')
 else:
  brandlabel(p,(644,161,691,256),g['sample'],'size');line(p,(644,210),(691,210),(.6,.6,.6),.4)
  dim(p,(644,149),(691,149),'12 mm');dim(p,(706,161),(706,256),'25 mm',(18,0))
  txt(p,'FOLD',620,213,9,'r',RED,'center');txt(p,'Place size below main label.',664,287,9,align='center')
 txt(p,'WASH CARE LABEL',38,346,21,'b')
 carelabel(p,g,(270,376,405,531));dim(p,(270,365),(405,365),'35 mm');dim(p,(418,376),(418,531),'70 mm',(17,0))
 boxtext(p,'INCLUDE:\nSIZE\nFIBRE COMPOSITION\nCARE INSTRUCTIONS\nCOUNTRY OF ORIGIN\nSTYLE CODE / BRAND',(37,384,249,520),10.5,valign='top')
 boxtext(p,'Soft printed satin; 35 x 70 mm finished.\nAdd 10 mm insertion allowance at top.\n'+('Insert in left waistband seam.' if g['id']==2 else 'Insert in left inside seam; see callouts.')+'\nBlack print on white. Do not stitch shell face.\nVerify care by wash test on final materials.\nSet actual origin from production order.',(462,384,797,528),10.5,valign='top')
 txt(p,'ARTWORK SHOWN FOR DIMENSIONS AND PLACEMENT; USE SEPARATE VECTOR ARTWORK AT ACTUAL SIZE.',421,561,8,'r',RED,'center')

def packaging(p,g):
 # Original left/right packaging page division.
 line(p,(428,121),(428,539),BLACK,.7)
 txt(p,'HANG TAG',38,132,21,'b');txt(p,'PACKAGING',446,132,21,'b')
 txt(p,'FRONT',177,157,10,'b',align='center');txt(p,'BACK',323,157,10,'b',align='center')
 hangtag(p,(121,172,230,357));hangtag(p,(268,172,377,357),True,g)
 dim(p,(121,372),(230,372),'55 mm');dim(p,(243,172),(243,357),'90 mm',(16,0))
 boxtext(p,'300 gsm recycled uncoated card.\nBlack print front and back; matte finish.\n2 mm hole, 8 mm below top edge.\nAttach with cotton string through label;\nnever pierce shell fabric.',(39,397,405,473),10.5,valign='top')
 txt(p,'TAG ATTACHMENT',48,493,10,'b');boxtext(p,g['tagplace'],(43,500,400,540),10.5,valign='top')
 txt(p,'FRONT',531,157,10,'b',align='center');txt(p,'BACK',716,157,10,'b',align='center')
 bag(p,(470,172,592,357),g);bag(p,(653,172,775,357),g,True)
 dim(p,(470,371),(592,371),f'{g["bag"][0]} cm');dim(p,(606,172),(606,357),f'{g["bag"][1]} cm',(15,0))
 boxtext(p,f'BAG: {g["bag"][0]} x {g["bag"][1]} cm + 4 cm self-seal flap.\n40 micron recycled LDPE; 2 x 6 mm vents.\nOne garment per bag; 38 x 24 mm style / size sticker at upper right.\n'+g['fold'],(448,397,797,478),10.5,valign='top')
 boxtext(p,f'Folded garment target: {g["foldsize"][0]} x {g["foldsize"][1]} cm.\nPlace tissue over face. Keep bag free of trapped air.\nPack flat, same size / color together; carton by order.\nNeedle / metal check before final sealing.',(448,480,797,541),10.5,valign='top')

def measurements(p,g):
 xs=[23.4,53.4,398.4,458.4,548.4,638.4,728.4,818.4]
 heads=['ID','MEASUREMENT — CM','TOL ±']+[s+(' [SAMPLE]' if s==g['sample'] else '') for s in g['sizes']]
 for j,s in enumerate(heads):boxtext(p,s,(xs[j],104.9,xs[j+1],121.1),10,'b',align='center',pad=1,minsize=8)
 for j,(name,tol,values) in enumerate(g['pom']):
  a=123+j*17.52;b=a+16.08
  row=[chr(65+j),name,f'{tol:g}']+[f'{v:g}' for v in values]
  for k,v in enumerate(row):boxtext(p,v,(xs[k]+1,a,xs[k+1]-1,b),10.5,'b' if k==0 or (k>=3 and g['sizes'][k-3]==g['sample']) else 'r',RED if k==0 else BLACK,align='left' if k==1 else 'center',pad=2,minsize=8)
 # Template's unused specification rows hold concise measurement handling notes.
 notes=['MEASURE GARMENT FLAT; ALL VALUES IN CENTIMETRES.','HALF WIDTHS ARE EDGE TO EDGE; DO NOT DOUBLE FOR CHECKING.','SAMPLE SIZE SHOWN IN BRACKETS; TOLERANCE APPLIES TO ALL SIZES.','MEASURE AFTER 24 HOUR RELAXATION; CLOSE ALL FASTENINGS.','CHECK POM LETTERS AGAINST PAGE 10 BEFORE SAMPLE REVIEW.','DEVELOPMENT SPECIFICATIONS — ADJUST AFTER FIRST FIT.']
 if g['id']==2:notes[3]='RELAX FOR 24 HOURS; MEASURE UNSTRETCHED EXCEPT POM P.'
 if g['id']==3:notes[3]='HANG FOR 24 HOURS; MEASURE WITH STRAPS AT SPECIFIED LENGTH.'
 for j,s in enumerate(notes,17):
  a=123+j*17.52
  boxtext(p,s,(57,a,394,a+16),8,'r',align='left',pad=2,minsize=7)
# Each diagram's A–P identifiers correspond exactly to page 09.
# Coordinates follow the actual extracted flat, not a generic garment silhouette.
POMS={
1:[('f',(.77,.11),(.77,.65)),('b',(.23,.13),(.77,.13)),('f',(.23,.34),(.77,.34)),('f',(.23,.65),(.77,.65)),('b',(.18,.17),(.04,.94)),('b',(.12,.35),(.26,.38)),('f',(.82,.14),(.82,.34)),('b',(.02,.95),(.13,.97)),('b',(.10,.89),(.10,.98)),('b',(.40,.06),(.60,.06)),('f',(.50,.02),(.50,.15)),('b',(.50,.02),(.50,.055)),('b',(.62,.015),(.62,.06)),('f',(.25,.36),(.42,.36)),('f',(.28,.36),(.28,.51)),('f',(.48,.55),(.52,.55))],
2:[('f',(.19,.02),(.81,.02)),('b',(.07,.18),(.93,.18)),('b',(.96,.02),(.96,.99)),('b',(.49,.28),(.70,.99)),('f',(.50,.02),(.50,.28)),('b',(.50,.02),(.50,.28)),('f',(.11,.32),(.46,.32)),('f',(.16,.65),(.42,.65)),('f',(.18,.98),(.35,.98)),('f',(.19,.02),(.19,.095)),('b',(.50,.235),(.50,.30)),('b',(.47,.27),(.53,.27)),('f',(.073,.43),(.090,.43)),('f',(.090,.48),(.105,.48)),('b',(.74,.97),(.74,.99)),('f',(.19,.00),(.81,.00))],
3:[('f',(.89,.01),(.89,.985)),('f',(.25,.20),(.75,.20)),('f',(.28,.24),(.72,.24)),('f',(.35,.33),(.65,.33)),('b',(.25,.47),(.75,.47)),('f',(.04,.99),(.96,.99)),('b',(.72,.015),(.69,.18)),('f',(.73,.035),(.75,.035)),('f',(.50,.015),(.50,.19)),('b',(.50,.015),(.50,.20)),('f',(.50,.015),(.50,.24)),('b',(.50,.20),(.50,.42)),('b',(.37,.24),(.37,.37)),('b',(.80,.98),(.80,.99)),('f',(.27,.10),(.73,.10)),('b',(.29,.18),(.71,.18))],
4:[('f',(.18,.02),(.82,.02)),('b',(.09,.19),(.91,.19)),('b',(.98,.015),(.98,.99)),('b',(.50,.24),(.70,.99)),('f',(.50,.02),(.50,.24)),('b',(.50,.02),(.50,.24)),('f',(.10,.29),(.46,.29)),('f',(.15,.64),(.43,.64)),('f',(.19,.99),(.40,.99)),('f',(.16,.02),(.16,.045)),('f',(.17,.05),(.08,.16)),('b',(.18,.09),(.40,.09)),('b',(.61,.085),(.61,.10)),('b',(.31,.045),(.31,.105)),('f',(.71,.01),(.71,.05)),('b',(.29,.97),(.29,.99))],
5:[('f',(.80,.23),(.80,.985)),('f',(.22,.47),(.78,.47)),('b',(.20,.26),(.80,.26)),('b',(.17,.28),(.04,.93)),('b',(.10,.45),(.24,.49)),('f',(.77,.26),(.77,.49)),('f',(.22,.96),(.78,.96)),('b',(.02,.96),(.13,.98)),('b',(.10,.90),(.10,.98)),('f',(.72,.90),(.72,.98)),('b',(.50,.02),(.50,.245)),('b',(.34,.13),(.66,.13)),('f',(.37,.23),(.63,.23)),('f',(.50,.18),(.50,.24)),('b',(.50,.215),(.50,.24)),('f',(.47,.21),(.53,.21))]
}

def pom_diagram(p,g):
 # Same two-view technical area used on page 10 of the master.
 if g['id'] in [1,5]:bbs=[(108,151,360,462),(480,151,732,462)]
 else:bbs=[(135,121,354,523),(500,121,719,523)]
 rs={'f':flat(p,g,'front',bbs[0]),'b':flat(p,g,'back',bbs[1])}
 txt(p,'FRONT',244,112,10,'b',align='center');txt(p,'BACK',609,112,10,'b',align='center')
 small=[]
 for j,(v,a,b) in enumerate(POMS[g['id']]):
  r=rs[v];aa=at(r,a);bb=at(r,b);lab=chr(65+j)
  if g['id']==5 and lab in ['K','L','N','P']:continue
  # Short construction details are called out in enlarged views below.
  if math.dist(aa,bb)<12:small.append(lab);continue
  off=(10 if abs(aa[0]-bb[0])<4 else 0,-4)
  # Offset adjacent vertical dimensions to preserve the seam line underneath.
  if g['id']==3 and lab in ['I','K']:
   xx=r.x0-17 if lab=='I' else r.x1+12;aa=(xx,aa[1]);bb=(xx,bb[1])
  if lab=='A' and g['id'] in [1,3,5]:
   xx=r.x1+(36 if g['id']==3 else 24);aa=(xx,aa[1]);bb=(xx,bb[1])
  if g['id'] in [2,4] and lab=='C':aa=(r.x1+25,aa[1]);bb=(r.x1+25,bb[1])
  if g['id'] in [2,4] and lab=='D':aa=(r.x0+r.width*.49,aa[1]);bb=(r.x0+r.width*.49,bb[1])
  if g['id']==2 and lab=='P':aa=(aa[0],aa[1]-15);bb=(bb[0],bb[1]-15)
  dim(p,aa,bb,lab,off)
 # Compact enlarged technical details occupy the lower drawing margin when needed.
 if g['id'] in [1,5]:
  # Cuff / placket or hood detail: dimensions repeat the main POM IDs.
  x,y=100,492;rect(p,(x,y,x+80,y+39),(1,1,1));line(p,(x+16,y),(x+16,y+39))
  if g['id']==1:
   for yy in [y+10,y+29]:p.draw_circle((x+9,yy),2,color=BLACK,width=.5)
   dim(p,(x+90,y),(x+90,y+39),'I',(9,0));dim(p,(x,y+48),(x+80,y+48),'H')
   rect(p,(346,493,377,531),(1,1,1));line(p,(362,493),(362,531));dim(p,(346,540),(377,540),'P')
   txt(p,'CUFF / PLACKET DETAIL',243,552,8.5,align='center')
  else:
   for xx in range(x+3,x+80,3):line(p,(xx,y+1),(xx,y+38),(.5,.5,.5),.25)
   dim(p,(x+90,y),(x+90,y+39),'I',(9,0));dim(p,(x,y+48),(x+80,y+48),'H')
   # Hood side schematic supports depth measurement L.
   sh=p.new_shape();sh.draw_bezier((530,533),(505,485),(547,472),(581,487));sh.draw_line((581,487),(594,533));sh.draw_line((594,533),(530,533));sh.finish(color=BLACK,width=.7);sh.commit()
   dim(p,(528,510),(589,510),'L');dim(p,(607,485),(607,533),'K',(9,0))
   txt(p,'CUFF / HOOD SIDE DETAIL',421,552,8.5,align='center')
 elif g['id']==2:
  # Stripe width and gap detail, isolated from the narrow leg drawing.
  rect(p,(49,346,111,436),(1,1,1))
  for xx in [57,75,93]:rect(p,(xx,348,xx+10,434),(.72,.1,.16),BLACK,.4)
  dim(p,(57,337),(67,337),'M');dim(p,(67,448),(75,448),'N')
  txt(p,'STRIPE DETAIL',80,464,8,'b',align='center')
  rect(p,(759,411,780,456),(1,1,1));line(p,(759,447),(780,447));dim(p,(792,447),(792,456),'O',(8,0))
  # Diamond gusset shown separately for K/L.
  pts=[(430,447),(443,471),(430,495),(417,471)]
  for a,b in zip(pts,pts[1:]+pts[:1]):line(p,a,b)
  dim(p,(451,447),(451,495),'K',(8,0));dim(p,(417,510),(443,510),'L')
 elif g['id']==3:
  # Enlarged strap cross-section and rolled hem.
  rect(p,(58,267,73,339),(1,1,1));dim(p,(58,254),(73,254),'H')
  txt(p,'STRAP',66,356,8,'b',align='center')
  rect(p,(767,425,795,477),(1,1,1));line(p,(767,465),(795,465));line(p,(767,471),(795,471))
  dim(p,(753,465),(753,477),'N',(-9,0));txt(p,'HEM DETAIL',777,495,8,'b',align='center')
 else:
  # Pocket welt, belt loop and turned hem construction details.
  rect(p,(45,267,109,310),(1,1,1));rect(p,(51,283,103,291),(1,1,1));dim(p,(119,283),(119,291),'M',(9,0))
  txt(p,'BACK WELT',80,330,8,'b',align='center')
  rect(p,(765,274,779,320),(1,1,1));dim(p,(794,274),(794,320),'O',(9,0))
  rect(p,(765,423,793,471),(1,1,1));line(p,(765,456),(793,456));dim(p,(751,456),(751,471),'P',(-9,0))
  txt(p,'HEM',779,489,8,'b',align='center')
 if g['id']==5:
  # Enlarged front neck profile resolves N (drop) and P (hood overlap).
  line(p,(286,488),(318,505));line(p,(318,505),(345,488))
  line(p,(300,488),(325,505));line(p,(325,505),(345,488))
  line(p,(286,488),(345,488),(.6,.6,.6),.3)
  dim(p,(358,488),(358,505),'N',(9,0));dim(p,(318,520),(325,520),'P')
  txt(p,'FRONT NECK',316,538,8,'b',align='center')
 if g['id']==1:
  # Back neck detail for the short back neck drop L.
  line(p,(586,494),(609,504));line(p,(609,504),(632,494));line(p,(586,494),(632,494),(.6,.6,.6),.3)
  dim(p,(645,494),(645,504),'L',(10,0));txt(p,'BACK NECK',608,529,8,'b',align='center')
 if g['id']==4:
  rect(p,(391,469,455,493),(1,1,1));line(p,(391,478),(455,478));dim(p,(470,469),(470,493),'J',(9,0));txt(p,'WAISTBAND',423,521,8,'b',align='center')
 if g['id']==5:
  line(p,(675,490),(691,498));line(p,(691,498),(707,490));line(p,(675,490),(707,490),(.6,.6,.6),.3)
  dim(p,(719,490),(719,498),'O',(9,0));txt(p,'BACK NECK',691,530,8,'b',align='center')
 txt(p,'POM A–P REFER TO PAGE 09  |  MEASURE FLAT IN CM  |  DIAGRAMS NOT TO SCALE',421,551 if g['id'] not in [1,5] else 564,8.5,align='center')

FUNCS=[cover,bom,labels_bom,lambda p,g:callouts(p,g,'front'),lambda p,g:callouts(p,g,'back'),colorways,labels,packaging,measurements,pom_diagram]
def render_all():
 counts={}
 for g in G:
  folder=OUT/f'garment-{g["id"]:02}-{g["slug"]}';folder.mkdir(exist_ok=True)
  for n,fn in enumerate(FUNCS,1):
   doc,p=shell(g,n);fn(p,g)
   # Render vector document composition directly to PNG; no PDF is written.
   pix=p.get_pixmap(matrix=fitz.Matrix(3508/841.92,2480/595.32),alpha=False)
   im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
   if im.size!=(3508,2480):im=im.resize((3508,2480),Image.Resampling.LANCZOS)
   dest=folder/f'garment-{g["id"]:02}-page-{n:02}-{NAMES[n-1]}.png'
   im.save(dest,dpi=(300,300),optimize=True)
   # Geometry and text verification are captured privately for quality control.
   counts[str(dest)]={'size':im.size,'text_chars':len(p.get_text()),'page':n,'garment':g['id']}
   print(f'Exported garment {g["id"]} page {n:02}',flush=True);doc.close()
 (BASE/'render-checks.json').write_text(json.dumps({'pages':counts,'issues':issues},indent=2))
 print('COUNT',len(counts),'ISSUES',len(issues));print(issues[:10])
if __name__=='__main__':render_all()
