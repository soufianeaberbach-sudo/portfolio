"""A disposition for every old numbered operation, including consolidated/retained notes."""
from completion import PREVIOUS,G
MAPS={
1:{'front':['F1','F2','F3','F5','B2','F6','F7','F4','F3','F1/F4'],'back':['Material grain note','F1','F4','F5','B1','B2/F6','B3','F7','B4','Removed generic packing/fit check']},
2:{'front':['F1','F2','F3','F4','F5','F6','F7','F8','B3','F8'],'back':['F1/B2','B1','B2','F4/F5','F6','F7','Removed absence-of-feature filler','F8','B3','B4']},
3:{'front':['F1','F2','F3','F4','F5','F6','F7','F8','F8','F7'],'back':['B1','B2','B3','B4','B5','B3','F5','F8','B6','B7']},
4:{'front':['F1','F2','F3','F4','Retained flat-front/grain identity on cover/POM','F5','F6','F7','F8','F8'],'back':['B1','B2','B3','B4','F5','F1','Removed general seat-balance filler','F7','F8','B5/B6']},
5:{'front':['F1','F2','F3','F4','Retained clean-front identity on cover','F5','F6','F7','F4','Material nap/shrinkage target in BOM'],'back':['B1','B2','B1','Retained plain-back identity on cover','F3','F4','F5','F6','B3','B4']}}
def operation_review():
 rows=[]
 for old,g in zip(PREVIOUS,G):
  for view in ['front','back']:
   for i,text in enumerate(old[view]):
    destination=MAPS[g['id']][view][i];notes=[]
    for token in destination.split('/'):
     if len(token)>1 and token[0] in 'FB' and token[1:].isdigit():notes.append(g['front' if token[0]=='F' else 'back'][int(token[1:])-1])
    rows.append(dict(style_code=g['code'],page=4 if view=='front' else 5,element=f'Existing {view} callout {i+1:02}',existing_specification=text,problem='Review component, operation, stitch formation, seam allowance, arrow location and duplication.',corrected_specification=destination+': '+(' | '.join(notes) if notes else destination),technical_rationale='Final operation set is component-specific. Generic checks and repeated/absent-feature statements do not occupy numbered rows; retained sewing requirements are consolidated at the stated feature.',related_pages='02,04,05,07,09,10',severity='REVIEWED',correction_completed=True))
 return rows
