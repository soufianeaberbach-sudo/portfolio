"""PR55 continuation: specifications follow the visible garment, not invented detail."""
from completion import *

def revise(g,key,index,value,why,pages):
 old=g[key][index];g[key][index]=value
 finding(g,9 if key=='pom' else (2 if key in ['fabrics','trims'] else (4 if key=='front' else 5)),key+' / '+str(index+1),old,value,why,pages)

g=G[1]
revise(g,'fabrics',2,('—','No separate crotch insert. Both leg panels included in F01.','—','—','—','—'),'The approved flat does not establish a diamond insert. Remove the invented component.','04,05,09,10')
revise(g,'front',2,'CF rise: 514 four-thread overedge at 6 mm SA to the crotch intersection. Secure thread tails; retain seam extension.','Use the visible rise and inseam construction.','05,09,10')
revise(g,'front',5,'Inseams: 514 at 6 mm SA; match knee/ankle notches. Join the continuous crotch/rise seam through the inseam intersection; stagger allowances and secure tails.','No hidden gusset is justified by the flat. Use a standard leg/rise assembly.','02,05,09,10')
# Remove the duplicated inseam operation rather than retaining a fixed count.
del g['front'][6];del ANCHORS[2]['front'][6]
ANCHORS[2]['front'][5]=(.50,.26)
revise(g,'back',0,'CB rise: 514 four-thread overedge at 6 mm SA, continuous with CF rise through the crotch intersection. Match inseam joins; do not stretch the seat curve.','Remove the fictitious rear gusset tip.','04,09,10')
revise(g,'back',3,'Internal care label: insert soft satin tab in left waistband seam. Enclose cut edge; keep label clear of elastic lap and CB join.','Keep label placement specific to the actual waistband construction.','03,07')
for idx,name in [(3,'INSEAM, CROTCH INTERSECTION TO HEM'),(4,'FRONT RISE, FOLLOW CF SEAM INC. BAND'),(5,'BACK RISE, FOLLOW CB SEAM INC. BAND')]:
 old=g['pom'][idx];revise(g,'pom',idx,(name,old[1],old[2]),'Use the actual crotch intersection; no hidden-insert center datum.','04,05,10')
del g['pom'][10:12]
NOTES[2]=[
 'E/F: follow CF/CB rise seams from waistband top to the true crotch/inseam intersection. D follows inseam to hem.',
 'G/H: widths at 2.5/32 cm below crotch, measured down inseam. J: CF band height. K/L: stripe width/clear gap.',
 'Elastic cut = 2 x A + 1 cm lap. M: 65 cm cut, 64 cm loop; 68 cm usage includes waste. N: extend evenly to target.',
 'Tape cut = C - J + M + 0.6 cm waist SA: M-size 86.6 cm per run; six runs = 5.196 m net, 5.45 m supply.',
 'N circumference XS/S/M/L: 92/96/100/104 cm. Shell/elastic usable extension target at least 70%; confirm by sample.'
]
finding(g,10,'Remove unsupported gusset geometry','Dashed diamond, separate diamond detail and K/L gusset diagonals.','Standard rise/inseam junction; fourteen relevant POMs A–N.','The visible flat does not justify an internal diamond. Do not add hidden engineering to make a demonstration denser.','02,04,05,09')

g=G[2]
for idx,value in {
 0:('BODY LENGTH, FRONT BODICE APEX TO HEM',1,[125,126,127,128]),
 8:('FRONT V DROP FROM BODICE APEX LEVEL',.5,[15,15.5,16,16.5]),
 9:('BACK V DROP FROM FRONT APEX LEVEL',.5,[19,19.5,20,20.5]),
 10:('CF EMPIRE DROP FROM BODICE APEX LEVEL',.5,[15.5,16,16.5,17]),
}.items():revise(g,'pom',idx,value,'Use a fixed upper-bodice datum independent of adjustable strap length. Proposed demo values require fit review.','10')
NOTES[3]=[
 'A: vertical from front bodice apex (strap attachment seam) to front hem; exclude the strap. Do not start at CF empire point.',
 'I/J/K: vertical drops from the horizontal front-apex level to front V, back V and CF empire point respectively.',
 'G: finished wearable strap path from front join over shoulder to back ring, at mid adjustment; H: strap width.',
 'B: relaxed cup fullness, no stretching or flattening gathers. C: side-empire level. L: zip opening, excluding top setback.',
 'Hang bias shell 24 hours, level hem, then measure flat. Keep apex points level and neckline/zip edges supported.'
]
revise(g,'front',5,'Skirt: one front and two back panels on true 45° bias. Mark grain on each pattern piece; cut single ply and handle flat without stretching. Confirm balanced hang on sample.','A front panel cannot oppose two CB panels; remove unclear grain-direction instruction.','02,09')
revise(g,'back',2,'CB concealed zip: 30 cm opening, 1.5 cm SA. Stabilize shell allowances before insertion; 301 sew tapes with concealed-zip foot. Top stops 0.5 cm below neck; lining clear of coil.','Clarify fusible attachment to shell, not zipper tapes.','02,05')

# Small, confirmed cross-page discrepancies in the other three garments.
g=G[0]
revise(g,'front',2,'Patch pockets 11.5 x 12 cm (M). Top turn 0.5 + 1.5 cm; sides/base 1 cm. 301 edge stitch; reinforce top corners. Top 20 cm below HPS; inner edge 4 cm from CF. Grade per P09.','Differentiate M construction dimensions from the graded pocket table.','09,10')
g=G[3]
revise(g,'back',0,'Back darts: 10 cm from lower waistband seam to dart point at welt-opening level. Sew 301 towards point and tie off; press towards CB before making welts.','A dart ends at its point; distinguish level from pocket-opening attachment.','09,10')
g=G[4]
revise(g,'front',4,'Rib cuffs 6.5 cm finished; sample M relaxed closed circumference 19 cm. Close loop at underarm; quarter and join using 514, 6 mm SA, stretching rib only. Grade per P09.','Clarify size M so 19 cm is not misread as a constant for all sizes.','09')
