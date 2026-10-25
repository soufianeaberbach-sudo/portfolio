"""Regression tests deliberately corrupt independent engineering relationships."""
import unittest,json,copy
from pathlib import Path
from validate import validate_data,R
class EngineeringValidation(unittest.TestCase):
 def setUp(self):
  self.folder=R/'docs/techpacks/03-performance-legging'
  self.s=json.loads((self.folder/'style.json').read_text())
 def test_valid_style(self):self.assertEqual(validate_data(self.s,self.folder),[])
 def test_missing_trim_reference(self):
  self.s['bom']=[x for x in self.s['bom'] if x['id']!='E01']
  self.assertTrue(any('BOM reference' in e for e in validate_data(self.s,self.folder)))
 def test_wrong_grade(self):
  self.s['poms'][0]['values']['42']+=2
  self.assertTrue(any('grade arithmetic' in e for e in validate_data(self.s,self.folder)))
 def test_duplicate_pom(self):
  self.s['poms'].append(copy.deepcopy(self.s['poms'][0]))
  self.assertIn('duplicate POM ID',validate_data(self.s,self.folder))
 def test_missing_diagram_row(self):
  self.s['pomGroups'][0]['ids']=[]
  self.assertTrue(any('IDs mismatch' in e for e in validate_data(self.s,self.folder)))
 def test_waist_cannot_pass_hips(self):
  row=next(x for x in self.s['poms'] if x['id']=='B')
  row['base']=40;row['values']={s:40+(i-2)*row['grade'] for i,s in enumerate(self.s['sizes'])}
  self.assertIn('legging hip passage target',validate_data(self.s,self.folder))
if __name__=='__main__':unittest.main()
