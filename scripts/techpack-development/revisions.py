from copy import deepcopy
from specs import G as ORIGINAL
G=deepcopy(ORIGINAL)
AUDIT=[]
def note(g,p,e,old,new,why,related='',severity='MAJOR'):
 AUDIT.append(dict(style_code=g['code'],page=p,element=e,existing_specification=old,problem=why if old!=new else 'No defect found; retained.',corrected_specification=new,technical_rationale=why,related_pages=related,severity=severity if old!=new else 'REVIEWED',correction_completed=True))
def change(g,key,index,new,why,related='',severity='MAJOR'):
 old=g[key][index];g[key][index]=new;note(g,4 if key=='front' else 5,key+' callout '+str(index+1),old,new,why,related,severity)
def item(g,key,index,new,why,related='',severity='MAJOR'):
 old=g[key][index];g[key][index]=new;note(g,2,key+' row '+str(index+1),old,new,why,related,severity)
def pom(g,i,name=None,vals=None,why='Clarify measurement datum and map it to the corresponding feature.'):
 old=g['pom'][i];new=(name or old[0],old[1],vals or old[2]);g['pom'][i]=new;note(g,9,'POM '+chr(65+i),old,new,why,'10')
# 01 — preserve the five-button artwork.
g=G[0]
item(g,'fabrics',1,('LINING','Unlined. Two chest patch pockets in shell; included in F01.','SELF','—','—','—'),'Patch pockets are applied pieces, not internal pocket bags.','04')
item(g,'trims',0,('BUTTONS','11 mm 4-hole; 5 front, 4 cuff, 1 spare. Match each colorway.','MATCH','T01','10 pcs','Trim mill'),'Artwork has five front buttons, including the collar button; 5+4+1=10.','01,04,06')
change(g,'front',0,'Two-piece collar and 2.5 cm stand; 1 cm SA. Fuse one layer; trim/grade, turn, enclose neck join and edge stitch 2 mm.','Distinguish collar/stand assembly and enclosed raw edges.','02')
change(g,'front',1,'Front placket 2.5 cm finished: 5 buttons and 5 holes, including collar. Body holes vertical; collar hole horizontal.','Match the five visible functional front buttons without changing artwork.','02')
change(g,'front',2,'Patch pockets 11.5 x 12 cm (M): turn top 0.5 + 1.5 cm; turn sides/base 1 cm; 301 edge stitch; bartack top corners.','Define a closed top turn, attachment and stress reinforcement.','02,09')
change(g,'front',4,'Sleeve placket 10 cm: bind slit with continuous strip; enclose cut edges and secure slit base before attaching cuff.','A machinist needs an executable continuous-placket operation.')
change(g,'front',5,'Cuffs 5 cm finished; fuse outer, join to sleeve at 1 cm SA, enclose inner edge. Two buttons/holes per cuff, 2 cm apart.','Specify attachment and synchronize four cuff buttons and holes.','02,09')
change(g,'front',8,'Pocket top 20 cm below HPS, parallel to CF (M); inner edge 4 cm from CF. Mirror pockets; keep tops level.','The sketch places pockets above the underarm; the former below-armhole datum was wrong.','09,10')
change(g,'back',4,'Sleeve seams: 301 assembly at 1 cm SA, then 504 edge finish; press allowance towards back.','Overedge finishing alone was not a clear woven assembly instruction.')
change(g,'back',6,'Side seams: 301 at 1 cm SA; 504 finish allowances together, press to back. No vent at side hem.','Separate seam joining from edge finishing.')
# 02 — stretch construction and materials.
g=G[1]
item(g,'trims',0,('STRIPE TAPE','6 mm nylon/elastane knit tape; 6 x 86 cm cuts (M), including hem turn. Lengthwise stretch at least 50%.','RED*','T01','5.45 m est.','Trim mill'),'Six finished 84 cm runs plus 2 cm hem turn require 5.16 m net; allowance increases supply to 5.45 m.','04,06,09')
item(g,'trims',2,('ELASTIC','8 mm knit elastic. M: cut 65 cm incl. 1 cm lap = 64 cm loop; 0.68 m usage includes 3 cm waste.','WHITE','T03','0.68 m usage','Trim mill'),'Distinguish cutting length, closed loop, overlap and consumption; loop equals 2 x relaxed half waist.','04,05,09')
change(g,'front',1,'8 mm waist elastic: M cut 65 cm, lap 1 cm to form 64 cm loop. Secure lap; enclose at top edge without stretching shell.','The old 68 cm quantity was ambiguous; 64 cm closed loop matches relaxed garment waist.','02,09')
change(g,'front',2,'CF rise: 514 four-thread overedge, 6 mm SA, to front gusset tip; secure seam ends. Do not call this a flatseam.','514 is a joining overedge stitch, distinct from 607 flatseam.','05')
change(g,'front',3,'Three stretch tapes each outer leg: 6 mm wide, 4 mm clear gaps; total band 26 mm. Start at lower waistband seam.','Define placement and total stripe assembly width.','02,06,09')
change(g,'front',4,'Apply tapes to flat leg panels: 406 bottom coverstitch, 3.2 mm gauge, centered on each 6 mm tape; use tape guides.','A 6 mm needle gauge on 6 mm tape cannot give a robust edge margin; 3.2 mm leaves 1.4 mm each side.','02')
change(g,'front',5,'Internal diamond gusset 10 x 6 cm finished. Join tips at rise ends, then sides/inseams with 514, 6 mm SA; stagger bulk.','Define a plausible gusset sequence and lateral inseam junctions.','05,09,10')
change(g,'front',6,'Inseam from gusset side junction to ankle: 514, 6 mm SA; press to back. Secure thread tails without hard knots.','Locate inseam start at the actual gusset junction and retain seam extension.','09,10')
change(g,'front',8,'Unbranded thigh: omit all exterior logo artwork and heat transfers. Keep the approved three-stripe placement.','Remove unauthorized third-party-like artwork consistently from every front flat.','01,06,10')
change(g,'front',9,'Feed shell/tapes evenly; do not tension tapes. Trial stretch to POM P without stitch break or restricted recovery; check opacity.','Require compatibility of the sewn stripe assembly with the extended waist/leg fabric rather than claiming test results.','02,09')
change(g,'back',1,'CB rise: 514 four-thread overedge, 6 mm SA, ending at rear gusset tip; smooth seat curve, no puckering.','Use exact joining terminology and coherent gusset end points.','04,10')
change(g,'back',2,'Waistband join at CB: 514, 6 mm SA. Offset elastic lap 2 cm from CB seam; enclose elastic between layers.','Avoid stacking elastic lap, waistband seam and rise seam at one position.')
change(g,'back',3,'Keep tapes parallel through hip/calf; 6 x 86 cm cuts for M. Match ends below waist and carry tape into ankle hem turn.','Synchronize net tape use and termination with the BOM.','02,04')
change(g,'back',4,'Gusset rear tip meets CB rise; side corners meet inseams. Use 514, not a butt flatseam; keep allowances soft and flat.','The former generic flat-join wording could imply an incorrect machine class.','04,10')
pom(g,3,'INSEAM, GUSSET SIDE JUNCTION TO HEM')
pom(g,4,'FRONT RISE TO GUSSET CENTER X, INC. WAIST')
pom(g,5,'BACK RISE TO GUSSET CENTER X, INC. WAIST')
pom(g,15,'HALF WAIST, EXTENDED WITHOUT STRAIN')
change(g,'front',7,'Ankle hem 2 cm turn; 406 two-needle bottom coverstitch, 6.4 mm gauge; trial for full seam extension.','Use a conventional industrial gauge and preserve the stretch function.','05')
# 03 — neckline geometry, lining and bias architecture.
g=G[2]
item(g,'fabrics',0,('MAIN FABRIC','Satin 140 gsm; 145 cm usable width. True-bias skirt; estimated usage includes self straps; confirm marker.','CHAMPAGNE','F01','3.20 m est.','Fabric mill'),'2.35 m was too tight as an asserted bias yield; provide a reasoned estimate with marker confirmation.','04')
change(g,'front',0,'V neckline: join shell to lining at 1 cm SA, trim/grade and understitch 1 mm on lining where accessible; turn clean.','Specify a practical clean-finish operation without attempting understitch through the CF point.')
change(g,'front',1,'Gather shell bust lower edges between notches; distribute at each side of CF. Join to skirt with 301, 1 cm SA.','Separate gathering from the permanent underbust seam and avoid gathers in the central point.')
change(g,'front',2,'CF empire point: staystitch within SA, pivot 301 at apex; clip concave SA close to stitch, not through it. Press SA down.','Control the pointed join, concave clipping and pressing; do not slash a convex seam edge.')
change(g,'front',4,'Bust/upper-body lining joins at neckline and zip; finish lower edge 1 cm below empire level. Tack to side seam allowances only.','Define partial lining with a free lower edge rather than trapping it inconsistently into the gathered empire seam.','02,05')
change(g,'front',5,'Skirt: one front and two CB panels, on true 45° bias with opposing front/back grain. Handle flat; stay zip edges, do not pull.','Retain bias cut with explicit pattern architecture and balanced handling.','02,05')
change(g,'back',2,'CB concealed zip, 30 cm opening: top stops 0.5 cm below finished neck edge. Attach lining to tapes clear of coil.','Relate opening, top finish and lining attachment.','02,09,10')
change(g,'back',3,'CB below zip: 301 at 1.5 cm SA, close seam to zip base; 504 edges separately, press open. Avoid a step at zip base.','Clarify seam completion and finish at the concealed-zip transition.')
change(g,'back',6,'Lining ends 1 cm below empire level; attach at neck/zip, tack sides to allowances. Leave lower edge free from bias skirt.','Reconcile the partial lining architecture across the document.','02,04')
change(g,'back',8,'Brand/size on back lining only, 2 cm below neck edge; nearest label edge 2 cm to wearer left of zip. No facing.','There is no back neck facing; label must stay clear of zipper and shell.','03,07')
pom(g,6,'FINISHED STRAP PATH, FRONT JOIN TO BACK RING')
pom(g,8,'FRONT V DROP FROM STRAP-TOP DATUM',why='Stop at the V neckline, not the empire seam; retain the plausible 26 cm M front value.')
pom(g,9,'BACK V DROP FROM STRAP-TOP DATUM',[29,29.5,30,30.5],'The drawn low back center is lower than the front V; use a distinct 30 cm M drop.')
pom(g,10,'STRAP TOP TO CENTER-FRONT EMPIRE APEX',[25.5,26,26.5,27],'The empire apex meets just below the neckline point; the former 32 cm contradicted this junction.')
old=g['labelplace'];g['labelplace']='Back lining only: 2 cm below edge; nearest label edge 2 cm left of zip.';note(g,7,'Brand label placement',old,g['labelplace'],'Use the lining and avoid zip interference.','05')
# 04 — fly, pocket and seat assembly.
g=G[3]
item(g,'fabrics',0,('MAIN FABRIC','Cotton stretch twill; 220 gsm; 145 cm width. Includes fly facing/shield, pocket facings, welts and loops.','SAGE','F01','1.55 m est.','Fabric mill'),'Account for actual shell components without adding another garment design.','04,05')
item(g,'fabrics',2,('FUSING','Woven fusible 45 gsm: waistband, fly/welt areas and 6 mm pocket-opening stays.','WHITE','F03','0.22 m','Trim mill'),'Pocket stay strips must have a BOM source.','04,05')
change(g,'front',1,'Fly: 15 cm coil zip, 3 cm facing and separate shield. 301 J-stitch 3 cm from CF; bartack base clear of zip teeth.','Specify facing, shield, zipper and reinforcement as one coherent assembly.','02')
change(g,'front',2,'17 mm waist button with one horizontal hole. Secure spare button to hangtag string, not inside the care label.','Separate the functional closure and spare-button packaging.','02,08')
change(g,'front',3,'Slant pockets 16 cm: self facings, F02 bags; 6 mm fusible stay cut from F03. 301 edge stitch; bartack both ends.','Explain bag/facing construction and use an existing BOM material for staying.','02')
change(g,'front',7,'Inseams: 301 at 1 cm SA; 504 finish allowances together, press to back. Match crotch/knee notches; no leg twist.','Provide a joining and finishing operation for the load-bearing woven inseam.')
change(g,'back',0,'Back darts 10 cm from lower waistband seam to welt opening; 301, taper to zero; press towards CB.','Resolve dart end relationship to welt placement.','09,10')
change(g,'back',1,'Fuse welt opening with F03. 301 welt/bag seams; slash, turn and secure corner triangles. Finished single welt 13 x 1 cm.','A functional welt pocket needs a cut opening, internal turning and secured corners.','02,09')
change(g,'back',2,'F02 bags extend 16 cm below welt; catch bag tops into waistband. Welt 10 cm below band seam; inner end 5 cm from CB.','Specify bag depth, anchoring and placement relative to the darts.','02,09,10')
change(g,'back',3,'Seat seam: 301 at 1.5 cm SA; second reinforcing row on crotch curve. 504 edges separately, press open.','Clarify seat reinforcement and pressing without contradicting inseam finishing.')
change(g,'back',7,'Inseam allowances 504 finished together after 301 assembly; press to back. Keep crotch intersection flat.','Overedge is the edge finish after joining, not the unspecified assembly operation.','04')
pom(g,3,'INSEAM, FOLLOW SEAM FROM CROTCH TO HEM')
pom(g,4,'FRONT RISE, FOLLOW CF SEAM INCLUDING BAND')
pom(g,5,'BACK RISE, FOLLOW CB SEAM INCLUDING BAND')
# 05 — layered hood assembly and rib attachment.
g=G[4]
change(g,'front',0,'Two-piece outer hood plus two-piece self lining. Baste 2 cm CF overlap in SA; attach both layers to neck with 514, 6 mm SA.','Define four hood pieces and the hood-to-neckline joining operation.','02,05')
change(g,'front',1,'Join hood opening outer/inner right sides together, 514 at 6 mm SA; turn. 406 topstitch, 3.2 mm gauge, 6 mm from edge.','Explain clean-turn sequence and distinguish the joining seam from topstitching.','05')
change(g,'front',5,'Cuffs 6.5 cm finished; M closed circumference 19 cm. Close rib loop; quarter and join with 514, 6 mm SA, stretching rib only.','Use the existing finished cuff POM instead of an arbitrary rib ratio.','09')
change(g,'front',6,'Hem rib 7 cm finished; M lower-edge circumference 98 cm. Join loop at left side; quarter and attach with 514, 6 mm SA.','Reconcile finished hem POM and the rib joining operation.','09')
change(g,'front',7,'After 514 joining, lay cuff/hem SA to body and topstitch with 406 bottom coverstitch, 6.4 mm gauge, 8–10 SPI.','Coverstitch is secondary topstitching over the already joined overedge seam, not a substitute join.','04,05')
change(g,'back',0,'Close outer/inner hood CB seams separately: 514, 6 mm SA. Nest allowances opposite ways; then bag the opening.','Make the assembly sequence for a self-lined two-piece hood executable.','04')
change(g,'back',1,'Cover back neck SA shoulder-to-shoulder with 10 mm tape; 301 both edges. Keep front neck untaped for pull-on extension.','A nonstretch tape must not constrain the entire pull-on neckline.','02,04')
# Review every numbered instruction, including those correctly retained.
for g,original in zip(G,ORIGINAL):
 for view,page in [('front',4),('back',5)]:
  for i,(old,new) in enumerate(zip(original[view],g[view])):
   if not any(a['style_code']==g['code'] and a['element']==view+' callout '+str(i+1) for a in AUDIT):
    note(g,page,view+' callout '+str(i+1),old,new,'Operation, allowance, stitch function and arrow feature reviewed; existing specification is defensible.')
 for i,(name,tol,vals) in enumerate(g['pom']):
  if not any(a['style_code']==g['code'] and a['page']==9 and a['element']=='POM '+chr(65+i) for a in AUDIT):
   note(g,9,'POM '+chr(65+i),original['pom'][i],(name,tol,vals),'Size progression and development dimension are plausible; preserve the values.','10')
 note(g,9,'Measurement table notes','Notes occupy measurement cells; other columns blank; unused data rows.','16 complete POM rows followed by a full-width merged notes area.','General notes are not incomplete measurements; retain table columns only for actual POM data.','10','MINOR')
 note(g,10,'POM mapping','Approximate generic arrows; some wrong datums/directions.','Individual A–P paths and datum/measurement-method notes; preserve black flats.','Measured feature, endpoints and path must agree with page 09.','09')
 note(g,8,'Hangtag attachment','At main label loop or waistband label.','Garment-specific label loop/insertion-tab attachment; no shell piercing.','Remove copied waistband terminology from shirts, dresses and hoodies.','03','MINOR')
 note(g,3,'Main label size','55 x 25 mm with unspecified cut/finished convention.','55 x 25 mm finished; 65 x 25 mm cut, including 5 mm end turns.','Clarify cut versus finished size without changing the approved 55 x 25 mm dimensions.','07','MINOR')
 for p in [1,2,3,6,7,8]:
  note(g,p,'Whole-page cross-check','Approved baseline page.','Preserve design, garment, swatch and colorway; synchronize only related corrected fields.','Cover/BOM/label/packaging/colorway identity and component relationships reviewed.','01–10','REVIEWED')
 g['tagplace']={1:'Loop string under the inside back-neck brand label. Include 1 spare shirt button on the tag string.',2:'Loop string through the care-label insertion tab inside left waistband; no exterior logo tag.',3:'Loop string under the back-lining brand label; keep clear of zip coil and satin face.',4:'Loop string under inside back-waist brand label. Include 1 spare waist button on the tag string.',5:'Loop string under the inside back-neck label; do not attach to rib hem or pierce fleece.'}[g['id']]
