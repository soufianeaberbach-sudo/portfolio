# Recovery and asset retention — 22 October 2026

Recovered the existing production branch at
`81b5a04c722095a2151bc6d1851f24026d369202`, one descendant of owner-verified
`92e2bc340aab6e8e26b73e5b542b68f1108c9753`. Full history was cloned, all remote
branches fetched, the existing branch checked out, and local/remote divergence
was **0 / 0**. The initial checkout was clean. This environment contained no
prior checkout or recoverable uncommitted photography. No reset, history rewrite,
new photography branch, merge, deployment or asset deletion occurred.

Recovery verified 40 featured sources, ten per public world; 22 complete native
Front/Back/Editorial sets and masters; 3 INTEGRATED + 19 READY + 18 PENDING;
22 provisional registry entries; 246 generated files, 300,756,940 bytes.
All original source SHA256s and registered native SHA256s/dimensions, master and
responsive dimensions, and registry/master references passed. The additional
remote commit saved eleven more sets than the owner's earlier snapshot.

## Measured resources

Exact dated byte measurements are in [RESOURCE-AUDIT.json](RESOURCE-AUDIT.json),
captured after recovery and dependency installation at 16:13 UTC.

| Resource | Measurement |
| --- | --- |
| Workspace disk | 33.77 GB total; 29.70 GB free |
| RAM | 10.45 GB total; 9.61 GB available; no swap |
| Working tree excluding .git | 1.321 GB, including dependencies |
| Git directory after fetching all branches | 964.88 MB |
| Generated assets | 300.76 MB / 246 files |
| QA directory | 284 bytes apparent file data at this checkpoint |
| Build directory | Absent; no build had run yet |
| node_modules | 518.30 MB |
| Native generation scratch | /workspace/generated_images absent |
| /tmp | 125.27 MB measurable data; inaccessible daemon files excluded |
| Reproducible npm cache in /tmp | 123.62 MB |

Disk and RAM are healthy. These measurements do **not** establish the cause of
the previous inaccessible Codex task. Full-history Git download was large but
succeeded. An initial network-disabled clone could not reach the proxy; retrying
with network enabled succeeded. Initial npm installation could not write its
default home cache; retrying with a writable /tmp cache succeeded. Neither is
evidence of disk exhaustion or a photography/model limit.

## Protected files and proposed future policy

| Asset | Retention decision |
| --- | --- |
| Genuine native outputs, 98.19 MB | Keep exact bytes, dimensions and hashes. Required for recovery and fidelity review. |
| Composite masters, 90.98 MB | Keep all committed review masters; new approved masters remain protected. |
| Responsive WebP derivatives, 13.82 MB | Keep all required variants; these are referenced by the site. |
| Individual resampled PNG panels, 90.69 MB | Keep every committed panel. Future policy proposal below; not implemented. |
| Four rejected native attempts, 7.09 MB | Keep committed evidence and rejection reasons. Never use in READY masters. |
| Manifest, registry, original sources and historical routes | Preserve. Recovery uses repository asset paths, not prior session scratch. |
| Necessary visual QA/provenance | Keep concise reports and representative evidence. Reproducible bulk scratch stays ignored. |

The application registry references composite masters and their WebP derivatives;
source search found no runtime references to individual generated panel PNGs.
Their exact 1800×2700 pixels also exist as equal thirds of the 5400×2700 master,
and they can be reproduced from retained natives using the assembly script and
recorded geometry. Existing panels occupy 90,687,363 bytes (about 30% of generated
file bytes). A lean **future** policy could keep native files, master, derivatives
and geometry, and emit separate resampled panels only on demand. This is a
proposal: current exports and all committed files remain intact, preserving the
owner's requested panel delivery contract. No LFS or external storage introduced.

After an exact native copy is committed and the remote SHA/file inclusion verified,
its named generation scratch duplicate can be removed after a hash comparison.
Never clean unknown temporary paths or a locally unique output. Failed build
scratch and reproducible QA captures may be removed only when identified as
disposable; keep required representative evidence. No committed artwork was
deleted during recovery. Do not prune .git or force-push.

## Existing failures and continuation

Four native rejects remain recorded: activewear-ref-04 Front stripe count;
activewear-ref-10 first Front stripe count and first Back diptych; evening-ref-03
first Back diptych. Their corrected sets are complete and must not be regenerated.

Three PENDING sources carry prior output-moderation failures with **no asset**:
activewear-ref-09, swimwear-ref-06, swimwear-ref-08. Their failure request IDs and
unchanged source references remain in the manifest. Do not misreport them as
generated or READY, bypass safeguards, or silently substitute a different design.

First actionable source on recovery: **evening-ref-01**, design-preserving
Occasionwear, with supplied Front and Back. Preserve the grey botanical-print
gown's boat neckline, tiered flared sleeves, fitted hips, cascading skirt flounces,
full train and deep rear opening with neck tie. Fine motif/hidden construction
detail remains provisional. Follow [README.md](README.md) checkpoint gates and
[PROGRESS.json](PROGRESS.json) for the current exact next action.

The five recovery regression tests passed. Build, browser and full collection QA
are separate checks and are recorded only when actually executed. The collection
remains provisional; final forty-look QA and the final PR remain pending.
