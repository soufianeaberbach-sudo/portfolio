"""Internal artwork replacement only; approved page geometry and table grid remain."""
from credibility import *
ASSETS=Path(__file__).resolve().parents[2]/'public/techpacks/materials'
CREDITS='https://aberbach.co/techpacks/material-credits/'

def art(p,name,bb):
 rect(p,bb,(1,1,1),None,0);return image(p,ASSETS/(name+'.png'),bb)
def woven(p,bb,size='M',kind='brand'):
 ratio=fitz.Rect(bb).width/fitz.Rect(bb).height
 name=('size-transfer' if ratio>.8 else 'size-pip') if kind=='size' else ('brand-transfer' if ratio>4 else 'woven-main-label')
 return art(p,name,bb)
def care(p,g,bb):return art(p,'care-'+g['code'],bb)
def tag(p,bb,back=False,g=None):return art(p,'hangtag-'+('back-'+g['code'] if back and g else 'front'),bb)
engine.brandlabel=woven;engine.carelabel=care;engine.hangtag=tag
oldbag=engine.bag
def bag_art(p,bb,g=None,back=False):
 oldbag(p,bb,g,back)
 if g and not back:
  r=fitz.Rect(bb);w=r.width*.57;h=w*24/38
  art(p,'sticker-'+g['code'],(r.x1-w-4,r.y0+19,r.x1-4,r.y0+19+h))
engine.bag=bag_art
# Preserve instructions and dimensions, correcting the care artwork's 35:70 proportion.
oldlabels=engine.labels
def labels_refined(p,g):
 oldlabels(p,g)
 rect(p,(264,355,446,543),(1,1,1),None,0)
 care(p,g,(294,376,371.5,531));dim(p,(294,365),(371.5,365),'35 mm');dim(p,(418,376),(418,531),'70 mm',(17,0))
 rect(p,(25,548,817,563),(1,1,1),None,0)
 txt(p,'MANUFACTURER-STYLE ARTWORK PROOFS; DIMENSIONS GOVERN. MAIN / SIZE SUBSTRATE VISUALIZATIONS; CARE TEXT IS DEVELOPMENT COPY.',421,559,7.5,'r',RED,'center')
 finding(g,7,'Label artwork and proportions','Basic rectangular wordmark, size and care placeholders; care art wider than specified.','Woven end-fold wordmark, folded size pip and composition/care satin proof; care art 35:70 aspect.','Keep exact specification dimensions, placement, folds and attachment; improve only internal component artwork.','03,08','MINOR')
FUNCS[6]=labels_refined
oldcover=engine.cover
def cover_refined(p,g):
 oldcover(p,g)
 rect(p,(36,497,251,551),(1,1,1),None,0)
 boxtext(p,'SURFACE DETAIL\n'+g['fabric']+'\nRepresentative textile photograph;\ncolour-retouched reference.',(36,497,251,551),9.5,align='center')
 finding(g,1,'Shell material reference','Previous fabric illustration','Licensed photographic / photogrammetric texture appropriate to shell family, colour-retouched.','Same shell image on cover and BOM; clearly identified as representative.','02','MINOR')
FUNCS[0]=cover_refined
# Cell references intentionally repeat only for self-fabric components.
IMAGES={
1:['main-01',None,'woven-fusible','buttons-01','thread-01','woven-tape'],
2:['main-02','main-02',None,'stripe-tape','thread-02','waist-elastic'],
3:['main-03','dress-lining','woven-fusible','dress-concealed-zip','ring-slider','thread-03'],
4:['main-04','trouser-pocketing','woven-fusible','trouser-coil-zip','buttons-04','thread-04'],
5:['main-05','main-05','hoodie-rib','woven-tape','thread-05','clear-stay']}
VISUALS={'stripe-tape','clear-stay','waist-elastic'}
def bom_refined(p,g):
 txt(p,'FABRICS',421,109,12,'b',(1,1,1),'center');txt(p,'TRIMS',421,354,12,'b',(1,1,1),'center')
 xs=[23.5,83.4,203.4,398.4,503.4,608.4,713.4,818.4]
 for i,t in enumerate(['ITEM','IMAGE','DESCRIPTION','COLOUR','CODE','QTY','SUPPLIER']):boxtext(p,t,(xs[i],114.3,xs[i+1],131.7),10,'b',align='center',pad=1)
 for j,row in enumerate(g['fabrics']+g['trims']):
  a=132.72+j*69.6 if j<3 else 359.28+(j-3)*69.6;b=a+69.6
  lab,desc,col,code,qty,supp=row
  for i,t in enumerate([lab,'',desc,col,code,qty,supp]):
   if i!=1:boxtext(p,t,(xs[i]+1,a+1,xs[i+1]-1,b-1),10.5,'b' if i==0 else 'r',align='center',pad=4,minsize=9)
  name=IMAGES[g['id']][j]
  if name:
   image(p,ASSETS/(name+'.png'),(89,a+4,197,b-13))
   caption='SLIDER' if name=='ring-slider' else ('SELF FABRIC' if j in [1,2] and name==f'main-{g["id"]:02}' else 'MATERIAL REFERENCE')
   txt(p,caption,143,b-5,6.8,'r',align='center')
  else:txt(p,'—',143,(a+b)/2+3,12,align='center')
 txt(p,'Reference images / colour treatments / licences: aberbach.co/techpacks/material-credits/',492,582,6.9,'r',(1,1,1),'center')
 finding(g,2,'Materials, trims and industrial thread imagery','Swatch reused for other materials; schematic trim and thread icons.',IMAGES[g['id']],'Use distinct appropriate material references and a real photographed cone with coordinating colour retouching. Disclose exact trim visualizations rather than mislabeling them as genuine photography.','01,03,06,07','MINOR')
FUNCS[1]=bom_refined
finding(G[2],2,'Installed slider photographic reference','Generated ring/slider component visualization.','Genuine CC BY-SA 4.0 coated-metal slider photograph; caption identifies slider only.','An actual installed-slider reference is appropriate to the adjuster family. The photograph does not authenticate the 6 mm opening, companion ring or low-nickel finish; the written development specification governs.','02','MINOR')
# Main label attachment leaves both end folds available for the hangtag string.
# Care artwork shows the same composition as each cover, including separate hoodie rib.
for g in G:
 finding(g,3,'Main/size/care/hangtag artwork','Basic placeholders','Final label proofs shared with page 07; style-specific tag/sticker shared with page 08.','A single set of component assets prevents contradictory artwork between BOM and specification.','07,08','MINOR')
 finding(g,8,'Hangtag and packaging sticker','Basic brand rectangle / SKU placeholder','Proportioned 55 x 90 mm front/back tag and human-readable style/size/colour sticker.','Preserve attachment and folding instructions; avoid dummy barcodes or unverified certification.','03,07','MINOR')
