"""Commit and verify incremental Womenswear backups on the existing branch.

Run with network access. A failure never resets commits or deletes artwork.
The tracked progress snapshot names the previously verified remote SHA; its
containing commit is the new checkpoint (avoids a self-referential commit hash).
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRANCH = 'feat/womenswear-ai-photography-regeneration'
REVIEW = ROOT / 'docs/portfolio/review/womenswear-regeneration'
MANIFEST = REVIEW / 'MANIFEST.json'
PROGRESS = REVIEW / 'PROGRESS.json'
VIEWS = ('front', 'back', 'editorial')

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()

def atomic_json(path, value):
    fd, name = tempfile.mkstemp(prefix=path.name + '.', suffix='.tmp', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as stream:
            json.dump(value, stream, indent=2, ensure_ascii=False)
            stream.write('\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

def asset_path(url):
    path = (ROOT / 'public' / url.lstrip('/')).resolve()
    if not path.is_relative_to(ROOT / 'public/portfolio'):
        raise ValueError(f'Not a portfolio asset: {url}')
    if not path.is_file():
        raise ValueError(f'Missing actual file: {url}')
    return path

def validate(manifest):
    assert len(manifest['looks']) == 40, 'Preserve forty featured slots'
    assert Counter(x['category'] for x in manifest['looks']) == dict.fromkeys(
        ('casualwear', 'activewear', 'evening', 'swimwear'), 10)
    registry = json.loads((ROOT / 'src/data/womenswear-generated.json').read_text())
    records = {r['sourceIdentity']: r for r in registry}
    for look in manifest['looks']:
        source = asset_path(look['source']['src'])
        assert hashlib.sha256(source.read_bytes()).hexdigest() == look['sourceSHA256'], look['sourceIdentity'] + ': source changed'
        for view in VIEWS:
            item = look.get(view)
            if not item:
                continue
            native = asset_path(item['nativeAsset'])
            assert hashlib.sha256(native.read_bytes()).hexdigest() == item['sha256'], str(native)
            with Image.open(native) as image:
                assert image.size == (item['width'], item['height']), str(native)
                image.verify()
            if item.get('asset'):
                with Image.open(asset_path(item['asset'])) as panel:
                    assert panel.size == (1800, 2700), str(panel.filename)
        for rejection in look.get('rejections', []):
            asset_path(rejection['asset'])
        if look.get('master'):
            assert all(look.get(v) for v in VIEWS), look['sourceIdentity']
            assert look.get('qualityResult', {}).get('setVisualReview'), look['sourceIdentity']
            with Image.open(asset_path(look['master']['asset'])) as master:
                assert master.size == (5400, 2700), str(master.filename)
                master.verify()
            for entry in look['master']['srcset'].split(', '):
                url, width = entry.rsplit(' ', 1)
                with Image.open(asset_path(url)) as derivative:
                    expected = int(width[:-1])
                    assert derivative.size == (expected, expected // 2), url
            record = records[look['sourceIdentity']]
            assert record['image']['src'] == look['master']['asset'], look['sourceIdentity']
            assert record['provisional'] is True, look['sourceIdentity']
    print('PASS: 40 source hashes, actual native hashes/dimensions, masters, derivatives and registry')

def remote_head():
    lines = git('ls-remote', 'origin', 'refs/heads/' + BRANCH).splitlines()
    if len(lines) != 1:
        raise ValueError('Existing remote branch is unavailable; stop generation')
    return lines[0].split()[0]

def verify_view(source_id, view):
    sha = remote_head()
    git('fetch', 'origin', BRANCH)
    remote = json.loads(git('show', sha + ':' + str(MANIFEST.relative_to(ROOT))))
    look = next(x for x in remote['looks'] if x['sourceIdentity'] == source_id)
    item = look.get(view)
    assert item and item.get('qualityStatus', '').startswith('VISUAL_PASS'), 'View not visually validated remotely'
    path = asset_path(item['nativeAsset']).relative_to(ROOT).as_posix()
    assert git('rev-parse', sha + ':' + path) == git('hash-object', path), 'Native differs from remote'
    print(f'REMOTELY PROTECTED {source_id} {view}: {sha} {path}')
    return sha

def checkpoint(args, manifest):
    assert git('branch', '--show-current') == BRANCH, 'Wrong branch; do not create another'
    assert not git('diff', '--name-only', '--diff-filter=U'), 'Unresolved conflicts'
    assert not git('diff', '--cached', '--name-only'), 'Review existing staged changes first'
    validate(manifest)
    previous = remote_head()
    git('fetch', 'origin', BRANCH)
    git('merge-base', '--is-ancestor', previous, 'HEAD')
    if args.source_id:
        remote_manifest = json.loads(git('show', previous + ':' + str(MANIFEST.relative_to(ROOT))))
        remote_look = next(x for x in remote_manifest['looks'] if x['sourceIdentity'] == args.source_id)
        local_look = next(x for x in manifest['looks'] if x['sourceIdentity'] == args.source_id)
        protected = [v for v in VIEWS if remote_look.get(v) and local_look.get(v) and remote_look[v]['sha256'] == local_look[v]['sha256']]
        if protected:
            local_look['lastVerifiedCheckpoint'] = {'commit': previous, 'views': protected, 'master': bool(remote_look.get('master') and remote_look.get('master') == local_look.get('master'))}
            atomic_json(MANIFEST, manifest)
            manifest_name = str(MANIFEST.relative_to(ROOT))
            if manifest_name not in args.paths:
                args.paths.append(manifest_name)
    previous_progress = json.loads(PROGRESS.read_text()) if PROGRESS.exists() else {}
    worlds = ('casualwear', 'activewear', 'evening', 'swimwear')
    incomplete = [x for x in manifest['looks'] if not x.get('master')]
    incomplete.sort(key=lambda x: (worlds.index(x['category']), x.get('priority', 2), x['currentSlot']))
    blocked = [x for x in incomplete if any(f.get('error') == 'moderation_blocked' for f in x.get('generationFailures', []))]
    actionable = [x for x in incomplete if x not in blocked]
    completed = [x for x in manifest['looks'] if x.get('master')]
    current = next((x for x in manifest['looks'] if x['sourceIdentity'] == args.source_id), None)
    last_completed = args.source_id if current and current.get('master') else previous_progress.get('lastCompletedSourceIdentity')
    progress = {
        **previous_progress,
        'updatedUTC': datetime.now(timezone.utc).isoformat(),
        'branch': BRANCH,
        'completedLooks': len(completed),
        'remainingLooks': len(incomplete),
        'pendingLooks': sum(not any(x.get(v) for v in VIEWS) for x in incomplete),
        'partiallyGeneratedLooks': sum(any(x.get(v) for v in VIEWS) for x in incomplete),
        'productionState': 'IN_PROGRESS' if actionable else 'BLOCKED_ALL_REMAINING_SOURCES' if incomplete else 'READY_FOR_FINAL_COLLECTION_QA',
        'nextImage': {'sourceIdentity': actionable[0]['sourceIdentity'], 'view': next(v for v in VIEWS if not actionable[0].get(v))} if actionable and any(not actionable[0].get(v) for v in VIEWS) else None,
        'nextBlockedImage': {'sourceIdentity': blocked[0]['sourceIdentity'], 'view': blocked[0]['generationFailures'][-1]['view'], 'status': 'BLOCKED_MODERATION'} if blocked else None,
        'statusCounts': dict(Counter(x['status'] for x in manifest['looks'])),
        'currentCategory': current['category'] if current else incomplete[0]['category'] if incomplete else None,
        'currentSourceIdentity': args.source_id,
        'currentMilestone': args.milestone,
        'lastCompletedSourceIdentity': last_completed,
        'lastSuccessfullyPushedCommit': previous,
        'checkpointCommit': 'The commit containing this snapshot; verify with git log -1 -- this file and git ls-remote. The explicit SHA above was verified before this commit.',
        'nextIncompleteSourceIdentity': incomplete[0]['sourceIdentity'] if incomplete else None,
        'nextActionableSourceIdentity': actionable[0]['sourceIdentity'] if actionable else None,
        'blockedSources': [{'sourceIdentity': x['sourceIdentity'], 'failures': x['generationFailures']} for x in blocked],
        'nextAction': next((f'Generate and validate {v} for {actionable[0]["sourceIdentity"]}; checkpoint before the following view' for v in VIEWS if actionable and not actionable[0].get(v)), 'Review three views and assemble master' if actionable else 'Resolve remaining tool-blocked sources without bypassing safeguards; final collection QA remains pending' if incomplete else 'Full final QA before opening one PR'),
        'knownRejectedGenerations': [{'sourceIdentity': x['sourceIdentity'], 'rejections': x['rejections']} for x in manifest['looks'] if x.get('rejections')],
        'notes': args.note,
        'limitations': previous_progress.get('limitations', ['All photography remains provisional pending owner artistic approval.', 'Native resolution and inferred construction remain explicit in the manifest.', 'Full collection QA and final PR wait for all forty completed sets.']),
    }
    atomic_json(PROGRESS, progress)
    paths = list(dict.fromkeys(args.paths + [str(PROGRESS.relative_to(ROOT))]))
    for name in paths:
        path = (ROOT / name).resolve()
        assert path.is_relative_to(ROOT) and path.is_file(), f'Invalid checkpoint path: {name}'
    git('add', '--', *paths)
    git('commit', '-m', args.message)
    head = git('rev-parse', 'HEAD')
    try:
        git('-c', 'credential.helper=!gh auth git-credential', 'push', 'origin', 'HEAD:refs/heads/' + BRANCH)
        actual = remote_head()
        assert actual == head, f'Remote HEAD differs: {actual}; local {head}'
        for path in paths:
            assert git('ls-tree', head, '--', path), f'File absent from pushed tree: {path}'
    except Exception:
        print(f'UNSAVED CHECKPOINT {head}: keep files and local commits. Stop generating; retry push then verify remote SHA.')
        raise
    receipt_dir = ROOT / '.qa-director/womenswear-checkpoints'
    receipt_dir.mkdir(parents=True, exist_ok=True)
    atomic_json(receipt_dir / (head + '.json'), {'verifiedRemoteCommit': actual, 'paths': paths, 'sourceIdentity': args.source_id, 'milestone': args.milestone})
    print(f'VERIFIED GITHUB CHECKPOINT {head} ({len(paths)} paths)')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=('validate', 'verify-view', 'save'))
    parser.add_argument('--source-id')
    parser.add_argument('--view', choices=VIEWS)
    parser.add_argument('--milestone', default='recovery')
    parser.add_argument('--message')
    parser.add_argument('--note', default='')
    parser.add_argument('paths', nargs='*')
    args = parser.parse_intermixed_args()
    manifest = json.loads(MANIFEST.read_text())
    if args.operation == 'validate':
        validate(manifest)
    elif args.operation == 'verify-view':
        if not args.source_id or not args.view:
            parser.error('verify-view requires --source-id and --view')
        verify_view(args.source_id, args.view)
    else:
        if not args.message or not args.paths:
            parser.error('save requires --message and explicit file paths')
        checkpoint(args, manifest)
