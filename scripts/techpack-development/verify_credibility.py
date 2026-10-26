"""Regression for concrete construction and datum mistakes found in PR55 review."""
import json
from artwork import G, FUNCS, shell
leg, dress = G[1:3]
assert 'gusset' not in json.dumps(leg).lower()
assert len(leg['pom']) == 14
assert leg['trims'][2][4] == '0.68 m usage'
assert 'crotch intersection' in leg['front'][2].lower()
assert 'APEX TO HEM' in dress['pom'][0][0]
assert 'STRAP PATH' in dress['pom'][6][0]
assert dress['pom'][0][2][2] == 127
assert dress['pom'][6][2][2] == 36
for g in [leg,dress]:
 for n in [4,5,9,10]:
  doc,page=shell(g,n);FUNCS[n-1](page,g);text=page.get_text().replace(chr(160)," ")
  assert 'gusset' not in text.lower()
  if g is dress and n==9:
   assert 'FRONT BODICE APEX TO HEM' in text and 'FINISHED STRAP PATH' in text
  if g is dress and n==10:
   assert 'BODICE APEX' in text and 'STRAP TOP' not in text
   # A's actual red vertical path begins at the bodice, below the strap top.
   paths=[d for d in page.get_drawings() if d.get('color') and d['color'][0]>.8 and d['color'][1]<.3]
   assert any(d['rect'].height>300 and d['rect'].width<1 and d['rect'].y0>145 for d in paths)
  doc.close()
print('PASS: no unsupported gusset; fourteen relevant legging POMs; separate apex/body and strap datums in actual generated pages.')
