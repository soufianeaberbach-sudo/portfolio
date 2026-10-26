"""Targeted corrections within the approved page system; no garment regeneration."""
from render import *
from revisions import AUDIT,note
# Datums clarified without changing otherwise plausible base values.
for g,i,name in [(G[0],6,'ARMHOLE DEPTH FROM HPS, STRAIGHT'),(G[2],1,'HALF BUST ACROSS CUP FULLNESS'),(G[4],5,'ARMHOLE DEPTH FROM HPS, STRAIGHT')]:
 old=g['pom'][i];g['pom'][i]=(name,old[1],old[2]);note(g,9,'POM '+chr(65+i)+' datum clarification',old,g['pom'][i],'Use the stated anatomical datum, not an arbitrary line across the flat.','10')
# The tape zone is applied while the joined outer-leg assembly still lies flat.
G[1]['front'][3]='Join outseams with 514, 6 mm SA; open panels flat. Center the 26 mm band over seam: three 6 mm tapes, 4 mm gaps.'
G[1]['front'][4]='Before inseams, apply tapes with guided 406 bottom coverstitch, 3.2 mm gauge centered on each 6 mm tape; no tape tension.'
for a in AUDIT:
 if a['style_code']==G[1]['code'] and a['element'] in ['front callout 4','front callout 5']:
  a['corrected_specification']=G[1]['front'][int(a['element'].split()[-1])-1]
# Arrows use the actual local construction features. Internal details are explicitly identified.
ANCHORS.update({
1:{'front':[(.50,.065),(.50,.36),(.36,.33),(.22,.29),(.89,.81),(.93,.94),(.50,.63),(.76,.125),(.43,.33),(.45,.63)],'back':[(.50,.37),(.50,.06),(.74,.125),(.79,.27),(.10,.60),(.065,.88),(.75,.54),(.50,.64),(.50,.075),(.50,.63)]},
2:{'front':[(.50,.06),(.50,.015),(.50,.18),(.96,.25),(.88,.59),(.50,.27),(.43,.60),(.72,.98),(.74,.155),(.88,.70)],'back':[(.50,.06),(.50,.19),(.50,.075),(.96,.27),(.50,.27),(.43,.61),(.63,.36),(.71,.98),(.50,.045),(.25,.10)]},
3:{'front':[(.43,.145),(.30,.205),(.50,.18),(.72,.055),(.27,.23),(.61,.57),(.88,.82),(.73,.983),(.35,.975),(.36,.38)],'back':[(.50,.215),(.70,.075),(.50,.265),(.50,.65),(.38,.31),(.50,.29),(.72,.28),(.65,.985),(.34,.22),(.26,.27)]},
4:{'front':[(.50,.025),(.55,.13),(.53,.03),(.08,.13),(.29,.29),(.72,.025),(.94,.54),(.43,.57),(.25,.98),(.78,.66)],'back':[(.31,.075),(.29,.105),(.70,.14),(.50,.20),(.50,.025),(.70,.03),(.50,.29),(.43,.64),(.25,.98),(.50,.035)]},
5:{'front':[(.49,.185),(.30,.10),(.18,.27),(.10,.53),(.50,.49),(.095,.95),(.50,.94),(.50,.885),(.22,.68),(.68,.63)],'back':[(.50,.115),(.50,.035),(.50,.25),(.50,.53),(.20,.28),(.23,.50),(.10,.95),(.50,.955),(.50,.04),(.22,.81)]}})

NOTES={
1:['HPS = body neck/shoulder seam junction; exclude collar/stand from A, K and L.',
   'A: vertical HPS to hem. E: follow sleeve outer edge from shoulder seam to cuff end.',
   'C: 2.5 cm below underarm. G: vertical HPS to underarm level. H: cuff buttoned, laid flat.',
   'Patch pockets (M): top 20 cm below HPS; nearest edge 4 cm from CF. N/O are finished patch size.'],
2:['E/F: tape along rise seam, then through gusset center X. D starts at the gusset side/inseam junction.',
   'K/L: finished gusset seam-line diagonals. P: waist extended flat without damaging fabric or stitches.',
   'Elastic cut = 2 x A + 1 cm lap. M: 65 cm cut, 64 cm closed loop; 68 cm usage includes 3 cm waste.',
   'Tape cut per run = C - J + O: M 86 cm; 6 runs = 5.16 m net, 5.45 m estimated supply.'],
3:['Set G to the stated finished strap path at mid adjustment before measuring A/I/J/K from strap-top datum.',
   'I stops at front V edge; J at CB V edge; K at CF empire seam apex. Do not substitute one point for another.',
   'B: cup fullness relaxed; C: side-empire level. L: zipper opening, excluding 0.5 cm top-stop setback.',
   'Hang bias shell 24 hours before hem leveling; keep neckline and zipper edges supported.'],
4:['E/F: follow curved CF/CB rise seams from waistband top to the true crotch/inseam junction.',
   'C: follow outseam. D: follow inseam. Arrows are offset from seam lines for visibility.',
   'Darts N end at welt opening; dart length 10 cm from lower waistband seam. L/M are finished welt opening.',
   'Close waist button and fly for A/B. Keep legs aligned and relaxed; do not measure across the crotch gap.'],
5:['HPS = body neck/shoulder junction with hood lifted. A excludes hood; N/O measure body neckline depth.',
   'D follows sleeve outer edge from dropped-shoulder seam to cuff end. F is HPS to underarm level.',
   'G/H: rib relaxed, loops closed and laid flat; M sample hem circumference 98 cm, cuff circumference 19 cm.',
   'K/L are hood seam-line height/depth on side view. P is overlap at CF neckline, not placket width.']}

def measurements_fixed(p,g):
 # All sixteen data rows retain the existing coordinates, borders, shading and typography.
 measurements(p,g)
 # The former empty table cells become a deliberate, full-width notes field.
 rect(p,(23.4,402.84,818.4,560.04),(1,1,1),None,0)
 line(p,(23.4,402.84),(818.4,402.84),BLACK,.96)
 txt(p,'MEASUREMENT NOTES',35,420,10.5,'b')
 lines=['All values in cm; half widths are edge to edge. Sample size is marked [SAMPLE].']+NOTES[g['id']]+['Development Sample: proposed dimensions; review fit and seam stretch before size-set approval.']
 y=429
 for t in lines:
  ls=wrapped(t,764,9.5)
  for z in ls:txt(p,z,36,y+10,9.5);y+=12
  y+=4
 if y>557:issues.append(('merged-notes-overflow',g['id'],y))

def ends(p,a,b,both=True):
 def h(q,other):
  ang=math.atan2(other[1]-q[1],other[0]-q[0]);l=4
  for da in [-.38,.38]:line(p,q,(q[0]+l*math.cos(ang+da),q[1]+l*math.sin(ang+da)),RED,.65)
 h(b,a)
 if both:h(a,b)

def follow(p,r,pts,lab,pos):
 ps=[at(r,z) for z in pts]
 sh=p.new_shape()
 for a,b in zip(ps,ps[1:]):sh.draw_line(a,b)
 sh.finish(color=RED,width=.65);sh.commit();ends(p,ps[1],ps[0],False);ends(p,ps[-2],ps[-1],False)
 txt(p,lab,*at(r,pos),10,'b',RED,'center')

def diagram_fixed(p,g):
 if g['id'] in [1,5]:bbs=[(108,151,360,462),(480,151,732,462)]
 else:bbs=[(135,121,354,523),(500,121,719,523)]
 rs={'f':flat(p,g,'front',bbs[0]),'b':flat(p,g,'back',bbs[1])}
 txt(p,'FRONT',244,112,10,'b',align='center');txt(p,'BACK',609,112,10,'b',align='center')
 def d(v,a,b,lab,off=(0,-4)):
  dim(p,at(rs[v],a),at(rs[v],b),lab,off)
 def vert(v,y0,y1,x,lab,off=(9,0)):
  r=rs[v];aa=(r.x0+x*r.width,r.y0+y0*r.height);bb=(aa[0],r.y0+y1*r.height);dim(p,aa,bb,lab,off)
 def datum(v,xy,text):
  q=at(rs[v],xy);p.draw_circle(q,1,color=RED,fill=RED);txt(p,text,q[0]+3,q[1]-5,7,'r',RED)
 i=g['id']
 if i==1:
  r=rs['f'];datum('f',(.63,.07),'HPS');vert('f',.07,.635,1.13,'A')
  # Witnesses locate the length datum and hem; do not include collar height.
  line(p,at(r,(.63,.07)),at(r,(1.13,.07)),RED,.3);line(p,at(r,(.75,.635)),at(r,(1.13,.635)),RED,.3)
  d('b',(.205,.14),(.795,.14),'B');d('f',(.245,.51),(.755,.51),'C');d('f',(.245,.635),(.755,.635),'D')
  follow(p,rs['b'],[(.205,.14),(.14,.42),(.06,.76),(.025,.97)],'E',(.10,.68))
  d('b',(.09,.565),(.235,.59),'F');vert('f',.07,.48,.84,'G')
  d('b',(.02,.955),(.14,.977),'H');d('b',(.08,.89),(.055,.98),'I',(10,0))
  vert('f',.07,.153,.50,'K');vert('b',.015,.06,.635,'M')
  d('f',(.275,.325),(.44,.325),'N');vert('f',.325,.505,.285,'O');d('f',(.48,.55),(.523,.55),'P')
  # Short back neck drop is shown with the collar lifted, not through the collar fall.
  txt(p,'BACK NECK / COLLAR LIFTED',608,487,8,'b',align='center')
  sh=p.new_shape();sh.draw_bezier((581,499),(595,511),(621,511),(635,499));sh.finish(color=BLACK,width=.7);sh.commit()
  line(p,(581,499),(635,499),(.5,.5,.5),.3);dim(p,(581,518),(635,518),'J');dim(p,(649,499),(649,508),'L',(10,0))
  txt(p,'L: HPS LEVEL TO BODY NECK SEAM',608,532,7.5,align='center')
 elif i==2:
  d('f',(.18,.015),(.82,.015),'A');d('b',(.045,.194),(.955,.194),'B')
  follow(p,rs['b'],[(1.01,.015),(1.055,.19),(1.04,.45),(.97,.70),(.91,.985)],'C',(1.17,.59))
  follow(p,rs['b'],[(.45,.30),(.43,.55),(.37,.80),(.34,.985)],'D',(.39,.67))
  for v in ['f','b']:
   pts=[at(rs[v],z) for z in [(.50,.265),(.45,.30),(.50,.335),(.55,.30),(.50,.265)]]
   sh=p.new_shape()
   for a,b in zip(pts,pts[1:]):sh.draw_line(a,b)
   sh.finish(color=(.5,.5,.5),width=.45,dashes='[2 2] 0');sh.commit()
  for v,lab,xoff in [('f','E',-.08),('b','F',.09)]:
   r=rs[v];follow(p,r,[(.50,.015),(.50,.15),(.50,.265),(.50,.30)],lab,(.50+xoff,.18));datum(v,(.50,.30),'X')
  d('f',(.09,.327),(.46,.327),'G');d('f',(.16,.65),(.42,.65),'H');d('f',(.17,.985),(.35,.985),'I');vert('f',.015,.105,.18,'J')
  # Finished gusset and hem details remain in the approved left/right drawing margins.
  pts=[(430,447),(448,477),(430,507),(412,477)]
  for a,b in zip(pts,pts[1:]+pts[:1]):line(p,a,b)
  datumtxt='X';txt(p,'X',430,479,8,'b',RED,'center');dim(p,(459,447),(459,507),'K',(9,0));dim(p,(412,521),(448,521),'L')
  txt(p,'INTERNAL GUSSET',430,541,7.5,'b',align='center')
  rect(p,(49,346,111,436),(1,1,1))
  for xx in [57,75,93]:rect(p,(xx,348,xx+10,434),(.72,.1,.16),BLACK,.4)
  dim(p,(57,337),(67,337),'M');dim(p,(67,448),(75,448),'N');txt(p,'STRIPE DETAIL',80,464,8,'b',align='center')
  rect(p,(759,411,780,456),(1,1,1));line(p,(759,447),(780,447));dim(p,(792,447),(792,456),'O',(8,0))
  rect(p,(47,196,119,211),(1,1,1));line(p,(47,202),(119,202),BLACK,.4);dim(p,(47,219),(119,219),'P');txt(p,'EXTENDED WAIST',83,237,7.5,'b',align='center');txt(p,'MEASURE FLAT',83,249,7.5,align='center')
 elif i==3:
  r=rs['f'];datum('f',(.28,.01),'STRAP TOP');vert('f',.01,.985,1.22,'A')
  line(p,at(r,(.28,.01)),at(r,(1.22,.01)),RED,.3)
  d('f',(.225,.16),(.775,.16),'B');d('f',(.26,.225),(.74,.225),'C');d('f',(.30,.335),(.70,.335),'D');d('b',(.21,.48),(.79,.48),'E');d('f',(.03,.985),(.97,.985),'F')
  # Separate neckline points, not the underbust baseline.
  vert('f',.01,.178,-.10,'I',(-9,0));line(p,at(r,(-.10,.178)),at(r,(.50,.178)),RED,.3)
  vert('b',.01,.215,-.10,'J',(-9,0));line(p,at(rs['b'],(-.10,.215)),at(rs['b'],(.50,.215)),RED,.3)
  vert('f',.01,.182,1.08,'K');line(p,at(r,(.50,.182)),at(r,(1.08,.182)),RED,.3)
  vert('b',.219,.438,.50,'L');vert('b',.225,.36,.36,'M');d('f',(.28,.082),(.72,.082),'O');d('b',(.31,.185),(.69,.185),'P')
  rect(p,(58,267,73,339),(1,1,1));dim(p,(58,254),(73,254),'H');dim(p,(87,267),(87,339),'G',(8,0))
  txt(p,'FINISHED STRAP',73,358,7.5,'b',align='center');txt(p,'PATH UNFOLDED',73,369,7.5,align='center')
  rect(p,(767,425,795,477),(1,1,1));line(p,(767,465),(795,465));line(p,(767,471),(795,471));dim(p,(753,471),(753,477),'N',(-9,0));txt(p,'HEM DETAIL',777,495,8,'b',align='center')
 elif i==4:
  d('f',(.10,.015),(.91,.015),'A');d('b',(.04,.206),(.96,.206),'B')
  follow(p,rs['b'],[(1.01,.015),(1.055,.17),(1.04,.49),(.96,.75),(.93,.985)],'C',(1.18,.59))
  follow(p,rs['b'],[(.50,.255),(.44,.46),(.40,.70),(.37,.985)],'D',(.43,.67))
  follow(p,rs['f'],[(.50,.015),(.50,.14),(.50,.22),(.515,.255)],'E',(.58,.17))
  follow(p,rs['b'],[(.50,.015),(.50,.13),(.515,.22),(.50,.255)],'F',(.63,.15))
  d('f',(.05,.28),(.465,.28),'G');d('f',(.075,.615),(.43,.615),'H');d('f',(.085,.985),(.38,.985),'I')
  d('f',(.12,.055),(.025,.195),'K');d('b',(.18,.105),(.41,.105),'L');vert('b',.045,.105,.31,'N');vert('f',.01,.06,.72,'O')
  rect(p,(45,267,109,310),(1,1,1));rect(p,(51,283,103,291),(1,1,1));dim(p,(119,283),(119,291),'M',(9,0));txt(p,'BACK WELT',80,330,8,'b',align='center')
  rect(p,(765,423,793,471),(1,1,1));line(p,(765,456),(793,456));dim(p,(751,456),(751,471),'P',(-9,0));txt(p,'HEM',779,489,8,'b',align='center')
  rect(p,(391,469,455,493),(1,1,1));line(p,(391,478),(455,478));dim(p,(470,469),(470,493),'J',(9,0));txt(p,'WAISTBAND',423,521,8,'b',align='center')
 elif i==5:
  r=rs['f'];datum('f',(.29,.15),'HPS');vert('f',.15,.96,1.11,'A');line(p,at(r,(.29,.15)),at(r,(1.11,.15)),RED,.3)
  d('f',(.23,.535),(.78,.535),'B');d('b',(.20,.28),(.80,.28),'C')
  follow(p,rs['b'],[(.20,.28),(.12,.49),(.055,.76),(.045,.975)],'D',(.10,.70));d('b',(.06,.57),(.23,.60),'E');vert('f',.15,.50,.84,'F')
  d('f',(.23,.96),(.78,.96),'G');d('b',(.05,.975),(.17,.99),'H');vert('b',.895,.98,.10,'I');vert('f',.89,.96,.73,'J')
  # M is shown on the body neckline inset with the hood lifted.
  # Existing enlarged cuff/hood area: use body-neck seams with hood lifted.
  x,y=100,492;rect(p,(x,y,x+80,y+39),(1,1,1))
  for xx in range(x+3,x+80,3):line(p,(xx,y+1),(xx,y+38),(.5,.5,.5),.25)
  dim(p,(190,y),(190,y+39),'I',(9,0));dim(p,(x,y+48),(x+80,y+48),'H')
  sh=p.new_shape();sh.draw_bezier((530,533),(505,485),(547,472),(581,487));sh.draw_line((581,487),(594,533));sh.draw_line((594,533),(530,533));sh.finish(color=BLACK,width=.7);sh.commit()
  dim(p,(528,510),(589,510),'L');dim(p,(607,485),(607,533),'K',(9,0))
  txt(p,'CB',530,545,7,align='center');txt(p,'OPENING',586,545,7,align='center')
  sh=p.new_shape();sh.draw_bezier((286,488),(304,514),(327,514),(345,488));sh.finish(color=BLACK,width=.7);sh.commit()
  line(p,(286,488),(345,488),(.5,.5,.5),.3);dim(p,(286,478),(345,478),'M');dim(p,(358,488),(358,507),'N',(9,0))
  line(p,(304,494),(324,505));line(p,(311,494),(331,505));dim(p,(324,520),(331,520),'P');txt(p,'HOOD LIFTED / FRONT',316,539,7.5,'b',align='center')
  sh=p.new_shape();sh.draw_bezier((675,490),(684,501),(698,501),(707,490));sh.finish(color=BLACK,width=.7);sh.commit()
  line(p,(675,490),(707,490),(.5,.5,.5),.3);dim(p,(719,490),(719,498),'O',(9,0));txt(p,'BACK NECK',691,530,8,'b',align='center')
 # Concise method key in the same bottom drawing margin as the baseline.
 key={1:'HPS = BODY NECK/SHOULDER JOIN; COLLAR EXCLUDED. A–P: PAGE 09. DIAGRAMS NOT TO SCALE.',2:'DASHED = INTERNAL GUSSET. E/F TO X; D FROM SIDE CORNER. A–P: PAGE 09. NOT TO SCALE.',3:'I = FRONT V; J = BACK V; K = CF EMPIRE APEX. G IS THE UNFOLDED STRAP PATH. A–P: PAGE 09.',4:'E/F FOLLOW CF/CB SEAMS TO CROTCH; C/D FOLLOW LEG SEAMS. A–P: PAGE 09. NOT TO SCALE.',5:'HPS AND NECK DROPS ARE BODY SEAM DATUMS WITH HOOD LIFTED. A–P: PAGE 09. NOT TO SCALE.'}[i]
 txt(p,key,421,564 if i in [1,5] else 555,8,align='center')

FUNCS[8]=measurements_fixed;FUNCS[9]=diagram_fixed
