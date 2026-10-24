"""Read-only SHA256 proof for every selected studio-v2 public presentation file."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import argparse, datetime, hashlib, json, urllib.request

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
source = parser.add_mutually_exclusive_group(required=True)
source.add_argument('--commit', help='Immutable GitHub commit containing the selected files')
source.add_argument('--base', help='Deployed site origin, for example https://aberbach.co')
parser.add_argument('--report', type=Path, required=True)
args = parser.parse_args()
registry = json.loads((ROOT / 'src/data/menswear-studio-v2.json').read_text())
files = {}
for look in registry['looks']:
    assert look['status'] == 'PASS_VISUAL'
    for view in look['views'].values():
        for record in [view['panel'], *view['exports']]:
            files[record['path']] = record
    for record in [look['master'], *look['masterResponsive']]:
        files[record['path']] = record
assert len(files) == 680, len(files)

def verify(record):
    url = ('https://raw.githubusercontent.com/soufianeaberbach-sudo/portfolio/'
           + args.commit + '/' + record['path']) if args.commit else args.base.rstrip('/') + record['src']
    request = urllib.request.Request(url, headers={
        'User-Agent': 'Aberbach-Studio-Correction/1.0',
        'Accept-Encoding': 'identity', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(request, timeout=90) as response:
        body = response.read()
        actual = hashlib.sha256(body).hexdigest()
        assert response.status == 200 and actual == record['sha256'], record['path']
        assert len(body) == record['bytes'], record['path']
        return {'path': record['path'], 'url': url, 'status': response.status,
                'bytes': len(body), 'sha256': actual, 'verified': True}

with ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(verify, files.values()))
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'commit': args.commit, 'base': args.base, 'looks': 40, 'views': 120,
          'masters': 40, 'files': len(results), 'allSHA256Matched': True,
          'bytesDownloaded': sum(x['bytes'] for x in results), 'results': results}
args.report.parent.mkdir(parents=True, exist_ok=True)
args.report.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k != 'results'}))
