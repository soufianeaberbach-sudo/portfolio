"""Retained image counts must include archives without inflating active views."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('checkpoint', Path(__file__).resolve().parents[1] / 'scripts/womenswear-checkpoint.py')
checkpoint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checkpoint)

class VersionAccountingTests(unittest.TestCase):
    def test_archived_views_are_retained_but_not_selected(self):
        old = {'front': {'nativeAsset': '/v1/front.png', 'sha256': 'old'}}
        current = {'generationType': 'original-concept', 'master': {'asset': '/v2/master.png'},
                   'archivedPresentations': [{'presentation': old}],
                   **{v: {'nativeAsset': '/v2/' + v + '.png', 'sha256': v} for v in checkpoint.VIEWS}}
        counts = checkpoint.native_inventory({'looks': [current]})
        self.assertEqual(counts['retainedNativeFiles'], 4)
        self.assertEqual(counts['activeSelectedViews'], 3)
        self.assertEqual(counts['originalConcepts'], 1)
        current['master'] = None
        counts = checkpoint.native_inventory({'looks': [current]})
        self.assertEqual(counts['retainedNativeFiles'], 4)
        self.assertEqual(counts['activeSelectedViews'], 0)
        self.assertEqual(counts['pendingCandidateNativeViews'], 3)

    def test_conflicting_versions_cannot_alias_a_native_path(self):
        value = {'looks': [{'generationType': 'original-concept',
                 'front': {'nativeAsset': '/same.png', 'sha256': 'new'},
                 'archivedPresentations': [{'presentation': {'front': {'nativeAsset': '/same.png', 'sha256': 'old'}}}]}]}
        with self.assertRaisesRegex(AssertionError, 'Conflicting versions'):
            checkpoint.native_inventory(value)

    def test_owner_rejection_preserves_files_and_excludes_active_completion(self):
        look = {'generationType': 'original-concept', 'master': {'asset': '/v2/master.png'},
                'ownerReview': {'status': 'OWNER_REJECTED'},
                **{v: {'nativeAsset': '/v2/' + v + '.png', 'sha256': v} for v in checkpoint.VIEWS}}
        counts = checkpoint.native_inventory({'looks': [look]})
        self.assertEqual(counts['retainedNativeFiles'], 3)
        self.assertEqual(counts['retainedCompleteMasters'], 1)
        self.assertEqual(counts['activeSelectedViews'], 0)
        self.assertEqual(counts['completeActiveLooks'], 0)
        self.assertEqual(counts['originalConcepts'], 0)
        self.assertEqual(counts['ownerRejectedLooks'], 1)

if __name__ == '__main__':
    unittest.main()
