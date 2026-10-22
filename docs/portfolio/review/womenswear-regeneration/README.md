# Womenswear AI photography regeneration — IN PROGRESS

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
