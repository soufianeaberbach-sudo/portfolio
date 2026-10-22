"""Recovery regressions: preserve native artwork and the last valid manifest."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/womenswear-generation-assets.py'
spec = importlib.util.spec_from_file_location('assets', SCRIPT)
assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assets)


class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.manifest = self.root / 'MANIFEST.json'
        self.manifest.write_text(json.dumps({'looks': [{'sourceIdentity': 'look', 'generatedIdentity': 'ww-ai-look', 'status': 'PENDING'}]}))
        self.input = self.root / 'tool.png'
        Image.new('RGBA', (20, 30), (10, 20, 30, 255)).save(self.input)
        self.patches = [patch.object(assets, 'ROOT', self.root), patch.object(assets, 'MANIFEST', self.manifest)]
        for item in self.patches:
            item.start()
            self.addCleanup(item.stop)

    def test_retry_preserves_prior_review_metadata(self):
        assets.register('look', 'front', self.input)
        value = json.loads(self.manifest.read_text())
        value['looks'][0]['front']['qualityStatus'] = 'VISUAL_PASS_NATIVE_RESOLUTION_LIMITED'
        assets.save_manifest(value)
        before = self.manifest.read_bytes()
        assets.register('look', 'front', self.input)
        self.assertEqual(self.manifest.read_bytes(), before)

    def test_different_native_cannot_replace_checkpoint(self):
        assets.register('look', 'front', self.input)
        native = self.root / 'public/portfolio/generated/ww-ai-look/front-native.png'
        before_manifest, before_native = self.manifest.read_bytes(), native.read_bytes()
        Image.new('RGBA', (20, 30), (50, 60, 70, 255)).save(self.input)
        with self.assertRaises(ValueError):
            assets.register('look', 'front', self.input)
        self.assertEqual(native.read_bytes(), before_native)
        self.assertEqual(self.manifest.read_bytes(), before_manifest)

    def test_interrupted_json_replace_keeps_last_valid_snapshot(self):
        before = self.manifest.read_bytes()
        with patch.object(assets.os, 'replace', side_effect=OSError('simulated interruption')):
            with self.assertRaises(OSError):
                assets.save_manifest({'looks': []})
        self.assertEqual(self.manifest.read_bytes(), before)
        self.assertFalse(list(self.root.glob('MANIFEST.json.*.tmp')))

    def test_completed_master_cannot_be_reassembled(self):
        value = json.loads(self.manifest.read_text())
        value['looks'][0]['master'] = {'asset': '/existing-master.png'}
        assets.save_manifest(value)
        before = self.manifest.read_bytes()
        with self.assertRaisesRegex(ValueError, 'completed master is protected'):
            assets.assemble('look')
        self.assertEqual(self.manifest.read_bytes(), before)

    def test_invalid_aspect_does_not_create_asset_or_change_manifest(self):
        before = self.manifest.read_bytes()
        Image.new('RGBA', (30, 30)).save(self.input)
        with self.assertRaises(ValueError):
            assets.register('look', 'front', self.input)
        self.assertEqual(self.manifest.read_bytes(), before)
        self.assertFalse((self.root / 'public').exists())


if __name__ == '__main__':
    unittest.main()
