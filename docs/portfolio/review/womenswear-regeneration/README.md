# Womenswear AI photography regeneration — IN PROGRESS

## Verified incremental recovery — 22 October 2026

Recovered the **existing branch** from remote `81b5a04c722095a2151bc6d1851f24026d369202`,
one descendant commit after owner-verified `92e2bc340aab6e8e26b73e5b542b68f1108c9753`.
Recovery found **22 complete sets** (3 INTEGRATED, 19 READY), 18 PENDING,
246 generated files / 300,756,940 bytes. No local prior session was available.
All 40 original source hashes and all registered native hashes/dimensions,
masters, derivatives and registry references passed local validation.
READY means a completed provisional review export registered for the website;
INTEGRATED additionally records the earlier browser checkpoint. Neither means
owner artistic approval, merge or deployment.

Read the current [progress snapshot](PROGRESS.json) and
[resource/retention audit](RECOVERY-AND-RETENTION.md) before continuing.
Three pre-existing output-moderation failures have no native asset:
`activewear-ref-09`, `swimwear-ref-06`, `swimwear-ref-08`. Preserve those source
slots and failure records; do not bypass tool safeguards or change their designs.
Continue the next actionable source, ordered Casualwear → Activewear → Occasionwear
→ Swimwear, then cinematic priority and slot within that world.

### Required checkpoint gate

After visually inspecting an actual Front, register its real file using the
existing command below, then atomically record the view's review, provenance and
`VISUAL_PASS_NATIVE_RESOLUTION_LIMITED` status in the manifest. Preserve native
dimensions; paths under a prior `/workspace/generated_images` are provenance only,
never recovery dependencies. The repository `nativeAsset` is the required copy.

```sh
python3 scripts/womenswear-checkpoint.py save --source-id SOURCE_ID --milestone front \
  --message 'photo: checkpoint SOURCE_ID front' \
  docs/portfolio/review/womenswear-regeneration/MANIFEST.json \
  public/portfolio/generated/GENERATED_ID/front-native.png
python3 scripts/womenswear-checkpoint.py verify-view --source-id SOURCE_ID --view front
```

Only then generate Back. Checkpoint validated Back separately before Editorial;
repeat with the actual view/path. Checkpoint Editorial before assembly. After
three-view visual review, assemble, inspect the actual white-ground master, run
focused validation, then checkpoint all new panel/master/derivative files plus
manifest and registry. Explicit file lists prevent unrelated staging. Never use
wildcard `git add .` or force-push. Run this helper with network access enabled.

The helper validates real files/source hashes, commits to this branch, pushes,
compares `git ls-remote` with local HEAD, and verifies named paths in the commit.
It retains local commits and prints `UNSAVED CHECKPOINT` on upload/verification
failure. Stop generating until safely retried; do not regenerate the saved view.
Use `git -c 'credential.helper=!gh auth git-credential' push origin HEAD:refs/heads/feat/womenswear-ai-photography-regeneration`
when retrying in this authenticated environment, then compare `git rev-parse HEAD`
with `git ls-remote origin refs/heads/feat/womenswear-ai-photography-regeneration`.

`PROGRESS.json` records the last SHA verified **before** its containing checkpoint;
the containing commit is the next checkpoint and is only protected after remote
verification. This avoids an impossible self-referential commit SHA. Per-look
`lastVerifiedCheckpoint` likewise names only files verified in the prior remote
commit. The latest exact branch SHA is always obtained with `git ls-remote`.

Atomic JSON/image replacement and native overwrite protection are covered by
`PYTHONDONTWRITEBYTECODE=1 python3 tests/test_womenswear_recovery.py`.
`python3 scripts/womenswear-checkpoint.py validate` checks the actual collection.
The existing browser test supports `GENERATION_REVIEW_IDS=ww-ai-SOURCE_ID-v1`
and `GENERATION_REVIEW_WIDTHS=1440,390` for proportional batch review. Full final
collection QA still requires all six standard sizes and the other relevant suites.

Base: main at `80ccdacb861fa63afedc5e593675e71a4f4dc42a` (merged PR #45).
Branch: `feat/womenswear-ai-photography-regeneration`. No merge or deployment.

This is a resumable production batch, not a forty-look completion claim. The
[manifest](MANIFEST.json) records every featured source, all nine additional stock
references, real per-view native files, dimensions, hashes, review findings and
integration state. Pending entries have no invented output paths.

## Resolution and provenance

The native image tool returns **1024×1536** for each separately generated portrait
despite a request for1800×2700. Native PNGs are retained untouched. The requested
1800×2700 panels and5400×2700 masters are **explicitly resampled review exports**;
they do not contain genuine native1800 detail. No small three-person image is used.
Front, true rear and Editorial are three separate image-generation operations.

Generated presentations have new `ww-ai-*` identities; all historical subject IDs,
URLs and original photographs remain intact. Stock replacements are original AI
concepts, not rebranded Pexels garments. All images are provisional AI presentation,
not ABERBACH design authorship, verified client work or manufacturing evidence.
Rear interpretations and other uncertainties remain explicit in the manifest and
reader. No Pexels photographer credit is copied to generated media.

## Resume safely

Do not rerun the inventory seed: it refuses to overwrite the existing manifest.
Continue the PENDING entries, prioritising remaining cinematic cast roles. Inspect
the actual source and all generated views before recording `setVisualReview`.
Use the native image tool with the existing photograph for preserved designs;
original concept Front generation must not attach the former stock photograph.

Register each real file immediately:

```sh
python3 scripts/womenswear-generation-assets.py register SOURCE_ID --view front --source /workspace/generated_images/ACTUAL_FILE.png
# repeat with actual separately generated back and editorial files
# record the visual review and literal generated description in MANIFEST.json
python3 scripts/womenswear-generation-assets.py assemble SOURCE_ID
```

Assembly preserves native files, scales uniformly, aligns the measured figure
floor, leaves safe margins, makes exact equal-width panels, creates actual WebP
responsive derivatives and updates the provisional registry. It never designs or
warps a garment. Use native alpha for subsequent images; the initial pink/beige
RGB set has a documented near-white exterior matte. Review final composites over
white before integration acceptance. New source URLs cannot reuse old photo windows.

## Checks and browser

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
ASTRO_TELEMETRY_DISABLED=1 npm run preview -- --host 127.0.0.1 --port 4441
PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers PORTFOLIO_QA_URL=http://127.0.0.1:4441 node tests/womenswear-generated.mjs
node tests/womenswear-ten-looks.mjs
CORRECTION_REVIEW_DIR=.qa-director/generation-integrity node tests/fashion-source-integrity.mjs
```

Browser checks verify exact new slot identity, all four view controls, full master
decode, proportions/thirds, AI disclosure, Look Closer, exact archive occurrence
return and original photographs at historical URLs. Final six-size journey review,
whole-site regression and final remote CI remain pending while the batch proceeds.

## Source inventory

[Forty-slot mapping](SOURCES.tsv) · [Casualwear](sources-casualwear.jpg) ·
[Activewear](sources-activewear.jpg) · [Occasionwear](sources-evening.jpg) ·
[Swimwear](sources-swimwear.jpg) · [All nine added placeholders](additional-placeholder-pool.jpg).
The five unused additions remain historical references; none is silently promoted
into the forty-look edit. Original versus regenerated comparisons use actual files.
For concept replacements, the old stock plate is explicitly a different design.
