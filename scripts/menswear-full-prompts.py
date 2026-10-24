"""Persist auditable product-specific prompts; companions use only selected AI Fronts."""
import importlib.util,json
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'docs/portfolio/review/menswear-full-production-2026-10-23';data=json.loads((D/'PRODUCTION.json').read_text())
studio='One individual photorealistic premium full-length fashion photograph, portrait 2:3, single adult male. Pure neutral white seamless studio and white floor, balanced soft light, realistic contact shadow only beneath shoes, accurate neutral colour. Full head and complete footwear, body about 87–89% of frame, comfortable white margins. Same long-lens perspective and subject scale throughout the set. No text, watermark, brand logo, props, furniture, graphic layout or extra person. Commercially sellable original clothing, natural hands/anatomy and realistic material behaviour. Do not use historical portfolio images or branded product photos.'
for x in data['looks']:
 c=x['concept'];design='; '.join(k+': '+str(c[k]) for k in ('product','silhouette','fabric','collar','shoulder','sleeves','seams','pockets','waist','fastenings','hem','colour','styling','casting'))
 for view in ('front','back','editorial'):
  path=D/'prompts'/(x['id']+'-'+view+'.txt')
  if path.exists():continue
  if view=='front':p=studio+'\n\nCreate a completely new original garment concept from this text, not a copy of any other image. FRONT product photograph, face and body straight toward camera, natural standing posture, arms relaxed slightly clear of outfit, fingers visible.\n\n'+design+'\n\nNatural handsome adult commercial menswear model, young-adult appearance appropriate to a 22–35 audience. Believable natural grooming and clothing proportions. Primary garment immediately readable.'
  else:
   treatment='TRUE BACK commercial photograph. Model rotated 180 degrees with face looking away; back of head, shoulders, garment back and heels visible. Natural arms resting clear. Rear-facing shoes and hands anatomically correct. Never mirror Front. Render specified rear yokes, seams, vents, rear pockets and hems plausibly, but do not move front closures/pockets onto the back.' if view=='back' else 'EDITORIAL fashion campaign photograph: '+c['editorial']+'. A noticeably stylish natural moving/three-quarter fashion pose, distinct from a static catalogue Front. Keep face recognizable and outfit readable. No awkward crouch, theatrical gestures or exaggerated limbs.'
   p=studio+'\n\nUse the supplied accepted new AI Front as the continuity reference. This must be the EXACT SAME adult man, face, hair, grooming, complete outfit, accessories, shoes, colours and visible construction. Do not redesign, recolour, change buttons/pockets or recast. The supplied Front is authoritative for visible styling, trim and proportions even when a proposed hidden technical detail cannot be seen.\n\n'+treatment+'\n\nOriginal design intent and hidden construction: '+design+'\n\nMaintain studio scale and light. Generate ONE genuine separate '+view.upper()+' photograph only, no triptych or multiple panels.'
  path.write_text(p+'\n')
print('Persisted all 120 view prompts')
