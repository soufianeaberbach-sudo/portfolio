"""Revision 2: scoped engineering edits in the approved technical page system."""
from precision import *
import render as engine
import copy
PREVIOUS=copy.deepcopy(G)
REVIEW=[]
def finding(g,page,element,old,new,why,related,severity='MAJOR'):
 REVIEW.append(dict(style_code=g['code'],page=page,element=element,existing_specification=old,problem=why,corrected_specification=new,technical_rationale=why,related_pages=related,severity=severity,correction_completed=True))
# Each pair is (feature-specific operation, normalized target on unchanged flat).
OPS={
1:{'front':[
('Collar and 2.5 cm stand: fuse one layer; 301 join at 1 cm SA. Grade/turn collar; enclose neck join in stand; edge stitch 2 mm.',(.5,.065)),
('Front placket 2.5 cm finished. Five front buttons and five holes including collar; body holes vertical, collar hole horizontal.',(.5,.36)),
('Patch pockets 11.5 x 12 cm (M). Top turn 0.5 + 1.5 cm; sides/base 1 cm. 301 edge stitch; reinforce top corners. Top 20 cm below HPS; inner edge 4 cm from CF.',(.36,.33)),
('Shoulders: 301 at 1 cm SA, 10–12 SPI; insert 6 mm woven stay. 504 finish allowances together; press towards back.',(.76,.125)),
('Set-in sleeves: 301 armhole at 1 cm SA, then 504 finish together. Distribute crown ease smoothly; no visible gathers.',(.24,.29)),
('Cuffs 5 cm finished: fuse outer, attach at 1 cm SA, enclose inner edge. Two buttons and two holes per cuff, 2 cm apart.',(.93,.94)),
('Body hem: double turn 0.6 + 0.6 cm; 301 edge stitch 2 mm from fold. Keep front and back level; no side vents.',(.5,.63))],
'back':[
('Sleeve underarm seams: 301 join at 1 cm SA, then 504 finish together. Press allowances towards back; match wrist plackets.',(.1,.60)),
('Back-wrist sleeve slit 10 cm: bind with a continuous self strip, enclose raw edges and secure the slit base before cuff attachment.',(.065,.88)),
('Side seams: 301 at 1 cm SA, then 504 finish allowances together. Press to back; align underarm joins and hem.',(.75,.54)),
('Internal main label: centered on back body, 1 cm below stand seam. Stitch end folds only; size pip below. Keep collar stand free.',(.5,.075)),
('Internal care label: insert in left side seam, 10 cm above finished hem. Secure insertion tab in allowance; soft printed face to inside.',(.25,.56))]},
2:{'front':[
('Contoured waistband: double self-fabric layer, 9 cm finished at CF/CB. Join lower edges to body with 514, 6 mm SA; match quarter marks.',(.5,.06)),
('Top-edge elastic: M cut 65 cm including 1 cm lap = 64 cm closed loop. Secure lap with zigzag; enclose between layers. Spread evenly without shell distortion.',(.5,.015)),
('CF rise: 514 four-thread overedge at 6 mm SA to front gusset tip. Secure thread tails. Preserve extension through crotch curve.',(.5,.18)),
('Outseams: 514, 6 mm SA. Lay joined panels flat; center three 6 mm stretch tapes over each seam with 4 mm clear gaps (26 mm band).',(.96,.25)),
('Apply tapes before inseams: guided 406 bottom coverstitch, 3.2 mm gauge centered on each tape; no tape tension. Carry ends into waistband join and 2 cm hem turn.',(.88,.59)),
('Internal diamond gusset: 10 x 6 cm finished. Join front/back tips at rise ends; side corners meet inseams. 514, 6 mm SA; stagger junction bulk.',(.5,.27)),
('Inseams: from gusset side junction to ankle, 514 at 6 mm SA. Press to back; match knee/ankle notches and secure tails without hard knots.',(.43,.60)),
('Ankle hem: turn 2 cm; 406 two-needle bottom coverstitch, 6.4 mm gauge. Trial shell/tape assembly for full extension and recovery without stitch break.',(.72,.98))],
'back':[
('CB rise: 514 four-thread overedge at 6 mm SA to rear gusset tip. Follow seat curve without stretching; secure seam ends.',(.5,.19)),
('Waistband CB join: 514 at 6 mm SA. Place elastic lap 2 cm away from CB seam to reduce stacked bulk; maintain 9 cm finished band height.',(.5,.075)),
('Internal brand/size: soft stretch transfers at center back waistband; size 5 mm below brand. Trial heat/pressure on shell before application. No exterior logo.',(.5,.045)),
('Internal care label: insert soft satin tab in left waistband seam. Enclose cut edge; keep label clear of elastic lap and gusset junctions.',(.25,.10))]},
3:{'front':[
('V neckline: stay to seam-line length; 301 join shell and lining at 1 cm SA. Grade/clip as needed; understitch on lining 1 mm from seam where accessible.',(.43,.145)),
('Bust gathers: two temporary gathering rows within 1 cm SA; draw up between notches on each lower bust panel. Distribute evenly, then 301 join to skirt.',(.30,.205)),
('CF empire point: staystitch in SA; 301 pivot accurately at apex. Clip concave allowance close to stitching without cutting it; grade and press allowances down.',(.5,.18)),
('Spaghetti straps: self-fabric, 5 mm finished. Turn without twisting; reinforce front attachment inside neckline SA before bagging lining.',(.72,.055)),
('Partial bust/upper-body lining: attach at neck and zipper tapes. Finish free lower edge 1 cm below empire level; tack at side allowances only, clear of bias skirt.',(.27,.23)),
('Skirt grain: one front and two CB panels on true 45° bias, with opposing front/back grain. Cut single ply, support edges and handle flat without stretching.',(.61,.57)),
('Side seams: 301 at 1 cm SA; narrow 504 finish together and press to back. Fine needle/low tension; protect satin face from press shine.',(.88,.82)),
('Hang shell 24 hours, then level hem. Turn 0.6 + 0.6 cm and 301 edge stitch 2 mm from fold without roping; retain gentle A-line flare.',(.73,.983))],
'back':[
('Low V back: stabilize neckline to seam-line length with lightweight stay. Bag with lining, grade/turn and understitch where accessible; no separate facing.',(.5,.215)),
('Strap adjusters: one 6 mm ring and slider each side for 5 mm strap. Fold rear anchor around ring; bury and reinforce ends in neckline SA. Check both adjusters slide.',(.70,.075)),
('CB concealed zip: 30 cm opening, 1.5 cm SA; stabilize tapes area with 6 mm fusible stay. Top stops 0.5 cm below neck edge; attach lining clear of coil.',(.5,.265)),
('CB seam below zip: 301 at 1.5 cm SA up to zip base without a step. 504 finish edges separately and press open; secure lower zip tapes to allowances only.',(.5,.65)),
('Back waist darts: 301 from wide end to point, taper to zero and tie off. Press towards CB on a shaped support; do not flatten dart tips.',(.38,.31)),
('Internal brand/size label: on back lining, 2 cm below neck edge; nearest label edge 2 cm to wearer left of zip. Stitch lining only; keep coil free.',(.34,.22)),
('Internal care label: left lining side seam, 10 cm below underarm. Secure insertion tab to lining allowance; no stitches through shell.',(.26,.27))]},
4:{'front':[
('Waistband 4 cm finished: fuse outer layer; 301 attach at 1 cm SA. Turn ends, grade corners and enclose body join with clean inner edge.',(.5,.025)),
('Fly: 15 cm locking coil zip, 3 cm fly facing and separate self shield. Attach tapes to extension/facing; shield behind zip. 301 J-stitch 3 cm from CF; bartack base clear of coil.',(.55,.13)),
('Closure: one 17 mm waist button and horizontal buttonhole. Check overlap/CF alignment with fly closed. Attach one spare button to hangtag string.',(.53,.03)),
('Slant pockets 16 cm: stay opening with 6 mm F03 strip; self facings on F02 bags. 301 join, turn/understitch and edge stitch; close bags with 301 + 504. Bartack opening ends.',(.08,.13)),
('Five belt loops: 1 cm finished width, 5 cm clear length. Enclose raw edges; secure each end. CB loop centered; side loops align with pocket mouths.',(.72,.025)),
('Outseams: 301 at 1 cm SA; 504 finish allowances together and press towards back. Match hip/knee notches without stretching pocket opening.',(.94,.54)),
('Inseams: 301 at 1 cm SA; 504 finish together, press towards back. Match crotch/knee notches and avoid leg rotation.',(.43,.57)),
('Hem: 504 finish raw edge, turn 2.5 cm and blind hem with minimal face pickup. Keep opening level; no turn-up cuff. Press without flattening twill texture.',(.25,.98))],
'back':[
('Back darts: 10 cm from lower waistband seam to welt opening. 301 taper to zero; tie ends and press towards CB before making pockets.',(.31,.075)),
('Single-welt pockets: fuse F03 opening area. Finished opening 13 x 1 cm. 301 welt/bag seams, slash to corners, turn and secure corner triangles without cutting stitches.',(.29,.105)),
('F02 back bags: self facing above opening, finished depth 16 cm below welt; 301 + 504 close edges and catch bag tops at waistband. Welt 10 cm below band; inner end 5 cm from CB.',(.70,.14)),
('Seat seam: 301 at 1.5 cm SA with second reinforcing row on crotch curve. 504 edges separately and press open. Match true crotch intersection without bulky folded allowances.',(.5,.20)),
('Internal brand label: center back waistband, 1 cm below top edge. 301 stitch end folds to inner waistband only; insert size pip below.',(.5,.035)),
('Internal care label: secure in left front pocket-bag seam, printed face inside bag. Keep clear of pocket opening; no label stitching through trouser face.',(.10,.16))]},
5:{'front':[
('Self-lined hood: two outer and two inner pieces. After joining CB seams and bagging opening, baste 2 cm CF overlap in SA. 514 attach both layers to body neck at 6 mm SA.',(.49,.185)),
('Hood opening: outer/inner right sides together, 514 at 6 mm SA, turn and press. Secondary 406 bottom coverstitch, 3.2 mm gauge, 6 mm from edge.',(.30,.10)),
('Dropped shoulders: 514 four-thread overedge at 6 mm SA; enclose 6 mm clear elastic stay without stretching it. Press allowances towards sleeves.',(.18,.27)),
('Set sleeves flat to dropped armholes: 514, 6 mm SA. Then close sleeve underarm and body side in one run, matching underarm junctions; no side split.',(.10,.53)),
('Rib cuffs 6.5 cm finished; M closed circumference 19 cm. Close loop with seam at underarm; quarter and join using 514, 6 mm SA, stretching rib only.',(.095,.95)),
('Hem rib 7 cm finished; M relaxed circumference 98 cm. Close loop at left side; quarter to body and attach using 514 at 6 mm SA with even distribution.',(.5,.94)),
('Cuff/hem finishing: after 514 attachment, lay allowances towards body and add 406 bottom coverstitch, 6.4 mm gauge, 8–10 SPI. This is secondary topstitching; retain seam extension.',(.5,.885))],
'back':[
('Hood CB: join outer and inner center seams separately with 514 at 6 mm SA. Nest allowances in opposite directions before joining the opening; self lining remains free of body back.',(.5,.115)),
('Back neck covering: 10 mm cotton herringbone tape, shoulder to shoulder; turn ends and 301 stitch both edges over neck SA. Leave front neck untaped for pull-on extension.',(.5,.035)),
('Internal brand label: centered on back neck tape; 301 secure both end folds to tape only. Size pip below; keep neckline free of extra rigid stitching.',(.5,.04)),
('Internal care label: insert in left side seam, 10 cm above rib join. Secure tab within allowance, soft face inside; keep label clear when trimming overlock.',(.22,.81))]}}
for g in G:
 for view in ['front','back']:
  before=g[view][:];g[view]=[x[0] for x in OPS[g['id']][view]];ANCHORS[g['id']][view]=[x[1] for x in OPS[g['id']][view]]
  finding(g,4 if view=='front' else 5,view+' operation set',before,g[view],'Remove fixed-ten padding, consolidate duplicated operations and map every remaining instruction to its component.', '02,07,09,10')
 # Existing measurements/diagrams are rechecked; no arbitrary value changes.
 for page,name in [(1,'Identity and technical flats'),(3,'Label/packaging BOM'),(6,'Colorways'),(8,'Packaging'),(9,'Measurement rows and grading'),(10,'A–P measurement datums and geometry')]:
  finding(g,page,name,'Current published revision', 'Retained after cross-check; artwork updates recorded separately where applicable.','Existing corrected measurements, geometry and garment identities are coherent; retain approved information.', '01–10','RETAINED')
# Secondary thread colours matter where the contrast tapes are sewn through.
g=G[1];old=g['trims'][1];g['trims'][1]=('THREAD','Core-spun polyester Tex 24 needles; textured polyester loopers. White assembly / red stripe-application needle thread; match other colorways.','WHITE / RED*','T02','180 m est.','Thread mill');finding(g,2,'Stripe sewing-thread colour',old,g['trims'][1],'White-only needle thread would visibly cross red tapes; coordinate application needles with tape colour.','04,06')
g=G[3];old=g['fabrics'][0];g['fabrics'][0]=tuple(str(x).replace('pocket facings, welts and loops.','pocket facings, welts and loops.') for x in old) # keep approved shell specification
# Explicitly account for four hood panels in an illustrative cutting allowance.
g=G[4];old=g['fabrics'][0];g['fabrics'][0]=('MAIN FABRIC','Brushed-back fleece; 340 gsm; 170 cm usable width. Includes four self hood panels; nap one way. Confirm marker.','CREAM','F01','1.90 m est.','Fabric mill');finding(g,2,'Self-lined hood consumption',old,g['fabrics'][0],'Keep self lining in shell usage and allow for four hood panels; estimate is not a proven marker yield.','01,04,05')

def callouts_variable(p,g,view):
 start=99.72 if view=='front' else 93.12;end=564.36 if view=='front' else 570.96
 # Replace only the ruled callout field; preserve the master sketch and information zones.
 rect(p,(519.18,start,818.4,end),(1,1,1),None,0)
 notes=g[view];weights=[max(3,len(wrapped(note,255,10.5))+1) for note in notes]
 bounds=[start]
 for w in weights:bounds.append(bounds[-1]+(end-start)*w/sum(weights))
 for j in range(len(notes)):
  if j%2==0:rect(p,(519.18,bounds[j],818.4,bounds[j+1]),GRAY,None,0)
 for x in [519.18,548.4,818.4]:line(p,(x,start),(x,end),BLACK,.72)
 for y in bounds:line(p,(519.18,y),(818.4,y),BLACK,.72)
 txt(p,view.upper(),271,116 if view=='front' else 110,12,'b',align='center')
 r=flat(p,g,view,(135,145,414,518));anchors=ANCHORS[g['id']][view]
 special={1:(230,531),2:(270,537)} if g['id']==5 and view=='back' else {}
 if special:
  txt(p,'INSIDE BACK NECK / HOOD LIFTED',271,508,7.5,'b',align='center')
  sh=p.new_shape();sh.draw_bezier((205,522),(231,542),(309,542),(335,522));sh.draw_line((335,522),(335,527));sh.draw_bezier((335,527),(309,547),(231,547),(205,527));sh.draw_line((205,527),(205,522));sh.finish(fill=GRAY,color=BLACK,width=.45);sh.commit()
  image(p,Path(__file__).resolve().parents[2]/'public/techpacks/materials/woven-main-label.png',(252,530,287.2,546))
  image(p,Path(__file__).resolve().parents[2]/'public/techpacks/materials/size-pip.png',(266,546,273.7,554))
 def target(i):return special[i] if i in special else at(r,anchors[i])
 for side in [0,1]:
  inds=sorted([i for i,a in enumerate(anchors) if (0 if a[0]<.5 else 1)==side],key=lambda i:target(i)[1]);ys=[]
  for i in inds:
   y=target(i)[1];ys.append(max(145,y,ys[-1]+27 if ys else 145))
  if ys and ys[-1]>522:ys=[y-(ys[-1]-522) for y in ys]
  for i,y in zip(inds,ys):
   x=82 if side==0 else 464;txt(p,str(i+1),x,y+3,11,'b',RED,'center');arrow(p,(x+10 if side==0 else x-10,y),target(i))
 for j,note in enumerate(notes):
  a,b=bounds[j:j+2];boxtext(p,str(j+1),(520,a,547,b),11,'b',RED,align='center',pad=1);boxtext(p,note,(549,a+2,816,b-2),10.5,pad=4,minsize=10)
 assert len(anchors)==len(notes)
FUNCS[3]=lambda p,g:callouts_variable(p,g,'front')
FUNCS[4]=lambda p,g:callouts_variable(p,g,'back')

finding(G[2],10,'N — finished hem-turn depth','Arrow covered both folds (465 to 477).','Arrow measures last fold to hem edge (471 to 477); N remains 0.6 cm.','Finished turn depth is one 0.6 cm turn, not the 1.2 cm total cut allowance.','04,09')

# Donning clearance: extended waist is an operating target, not an undefined maximum.
g=G[1];old=g['pom'][15];g['pom'][15]=('HALF WAIST, COMFORTABLY EXTENDED',1,[46,48,50,52])
finding(g,9,'P — extended waist / hip clearance',old,g['pom'][15],'The former M target 88 cm circumference is inadequate as a pull-on clearance target for the intended negative-ease hip. Set a 100 cm M operating target while retaining relaxed waist and all other body POMs.','02,04,10')
old=g['fabrics'][0];g['fabrics'][0]=('MAIN FABRIC','4-way stretch interlock; 250 gsm; 150 cm usable width. Target at least 70% usable crosswise extension with good recovery.','WHITE','F01','1.05 m','Fabric mill')
finding(g,2,'Shell extension for pull-on clearance',old,g['fabrics'][0],'Specify the functional crosswise stretch needed by the negative-ease waist and donning target, without claiming a tested result.','09,10')
old=g['trims'][2];g['trims'][2]=('ELASTIC','8 mm knit elastic; usable extension at least 70%. M: 65 cm cut incl. 1 cm lap = 64 cm loop; 0.68 m usage incl. waste.','WHITE','T03','0.68 m usage','Trim mill')
finding(g,2,'Waist elastic functional extension',old,g['trims'][2],'Retain correct cut/lap/loop/consumption arithmetic; require enough usable extension for the XS–L donning targets.','04,09')
NOTES[2][1]='K/L: finished gusset seam-line diagonals. P: extend waistband evenly to the stated operating target; no stitch break.'
NOTES[2].append('P circumference targets XS/S/M/L: 92/96/100/104 cm; shell and elastic target at least 70% usable crosswise/lengthwise extension respectively.')
# Keep the sensible existing wash-shrinkage target as a material requirement, not a numbered sewing operation.
g=G[4];r=list(g['fabrics'][0]);r[1]='Brushed-back fleece; 340 gsm; 170 cm usable width. Includes four hood panels; nap one way. Wash shrinkage target max 3%; confirm marker.';g['fabrics'][0]=tuple(r)
finding(G[0],4,'Sleeve-placket arrow on front flat','Back-wrist operation on front page points to unfeatured sleeve face.','Move placket operation and leader to the visible back-wrist placket on page 05.','An arrow should identify the actual feature; keep front cuff attachment on page 04.','05')
finding(G[0],10,'J — body neck width','Arrow over collar/stand area.','Measure J between body-neck/shoulder junctions in the collar-lifted inset.','Neck width excludes the collar; preserve the 16 cm M value.','09')
finding(G[4],10,'M — body neck width','Arrow spans hood opening.','Measure M across body neck in hood-lifted front inset.','Hood-opening width is not body-neck seam width; preserve 23 cm M.','09')

# Final leader endpoints reviewed directly over the unchanged flat artwork.
ANCHORS[1]['front'][4]=(.24,.29)
ANCHORS[1]['back'][0]=(.21,.64)
ANCHORS[2]['front'][3]=(.935,.25)
ANCHORS[2]['front'][6]=(.395,.60)
ANCHORS[4]['back'][0]=(.265,.075)
ANCHORS[5]['front'][2]=(.18,.235)
ANCHORS[5]['front'][3]=(.19,.337)
ANCHORS[5]['back'][3]=(.205,.81)
# A 25 mm label cannot be stitched full-height to 10 mm tape; specify short upper tacks.
G[4]['back'][2]='Internal brand label: on back neck tape, hood lifted. 301 tack upper 6 mm of each end fold to tape only. Sew folded size pip to lower brand-label edge before attaching label; keep body free.'
finding(G[4],5,'Neck tape / brand label geometry','Neck tape and brand leaders pointed to hood crown; label end attachment was ambiguous on 10 mm tape.','Add an inside-back-neck inset with hood lifted; point tape and label leaders to actual detail. Attach upper 6 mm of end folds to tape; pip to label edge.','25 mm-high end folds cannot be fully sewn to a 10 mm tape without catching the body. Short upper tacks preserve label size and keep the face free.','03,07,08')
finding(G[1],5,'CB waistband seam shown on flat','CB ring join specified but absent on back waistband artwork.','Add only the matching fine CB join line between top and lower waistband seam; synchronize four back-flat assets.','The approved contour is unchanged; the seam makes the proposed 514 ring assembly explicit.','01,06,10')

G[1]['front'][0]='Contoured waistband, 9 cm finished at CF/CB. Join outer/inner top edge with 514, 6 mm SA; turn. Quarter lower edges and attach to body using 514, 6 mm SA.'
G[1]['front'][1]='Top elastic: M cut 65 cm incl. 1 cm lap = 64 cm loop; zigzag lap. Secure elastic to inner band only with narrow zigzag, upper edge 1 mm below top seam line; keep top join clear.'
finding(G[1],4,'Elastic anchorage / top-edge sequence','Elastic enclosed between broad waistband layers without a defined anchorage.','Secure elastic to inner band with narrow zigzag below top seam line, then bag outer/inner top edge and join lower band to body.','Prevents elastic migrating within the 9 cm band while keeping the external top edge clean and extensible.','02,05,09')

# Tape cut length includes both the waistband capture allowance and the hem turn.
g=G[1];old=g['trims'][0];g['trims'][0]=('STRIPE TAPE','6 mm nylon/elastane knit tape; 6 x 86.6 cm cuts (M), incl. 6 mm waist SA + 2 cm hem turn. Knit selvedges; lengthwise stretch at least 50%.','RED*','T01','5.45 m est.','Trim mill')
NOTES[2][3]='Tape cut per run = C - J + O + 0.6 cm waist SA: M 86.6 cm; six runs = 5.196 m net, 5.45 m supply.'
finding(g,2,'Stripe tape capture allowance',old,g['trims'][0],'The previous 86 cm cut included the 2 cm hem but omitted 6 mm captured at the waistband join. Add that allowance without changing visible stripe placement or 5.45 m estimated supply.','04,09')
finding(g,10,'Gusset measurement projection','X and inseam start shown without the hidden gusset outline.','Show a dashed internal-gusset projection; D starts at its side corner; E/F continue to center X.','A hidden construction needs explicit geometry to make the measurement starting points understandable.','04,05,09')
