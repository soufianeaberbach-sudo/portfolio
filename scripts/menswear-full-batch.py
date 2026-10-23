"""Serialize reviewed selections, preserving each checkpoint before the next item."""
from pathlib import Path
import argparse,fcntl,importlib.util,json,types
R=Path(__file__).resolve().parents[1];s=importlib.util.spec_from_file_location('full',R/'scripts/menswear-full-production.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
p=argparse.ArgumentParser();p.add_argument('selection_json');a=p.parse_args()
with open(R/'.git/menswear-full-production.lock','w') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 for item in json.loads(Path(a.selection_json).read_text()):
  look=next(x for x in m.read()['looks'] if x['id']==item['look'])
  if not look[item['view']]:m.register(types.SimpleNamespace(**item))
  look=next(x for x in m.read()['looks'] if x['id']==item['look'])
  if all(look[v] for v in m.VIEWS) and not look['master']:
   m.assemble(look['id'],'Reviewed same adult model, complete outfit, hair/grooming, footwear, primary construction, neutral white studio and full-length framing. Genuine rear and separate natural fashion Editorial. Visible details described per selected view; no physical textile or manufacture claim.')
