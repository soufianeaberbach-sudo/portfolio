# Menswear studio background correction — 24 October 2026

This is a narrowly scoped correction of the visible grey/off-white photographic rectangles in release `a806acf1d0da0df28b5e2c52aab468de577250ca`. That release's earlier image-integration assessment did not adequately distinguish the studio pixels from the white page. This report supersedes that assessment for background integration only; the original reports are preserved unchanged.

## Method validation

Six actual native-size [before/after comparisons](validation/) were inspected: cream knitwear, fine performance mesh and white running shoes, a structured bomber with pale trousers, light linen tailoring, darker double-breasted tailoring, and a walking ivory polo look with genuine gaps between limbs. Hair, fingers, cuffs, seams, textile colour/texture and complete footwear remain intact. The floor gradient and rectangular photo field are absent. Compact shadows derived from the original floor at each sole keep the figures grounded.

The pipeline uses IS-Net semantic foreground estimation (1024 input), a conservative trimap and closed-form matting only around uncertain edges. All trimap foreground-core RGB pixels are copied from the source unchanged. Local background estimation replaces the old light ground at anti-aliased hair/cloth boundaries without double-premultiplying their photographed edge. Background pixels outside the subject and intended sole shadow are exactly RGB 255/255/255. No global brightness filter, colour-key threshold, CSS blend, inpainting, new model/garment generation or geometric alteration is used.

The initial six [metrics](validation/metrics.json) show zero changed core RGB values and zero non-white exposed-background pixels across the entire field. These metrics supplement visual inspection; they do not independently prove semantic segmentation correctness. All remaining views require visual review before activation. Normalized 1800×2700 panels, 5400×2700 actual three-panel masters and 600/1200/1800 responsive images use versioned `menswear-studio-v2` URLs. Delivery WebP is lossless to preserve both texture and exact white.

## Reproduction and provenance

Use an isolated Python environment with [pinned dependencies](../../../../scripts/requirements-menswear-studio.txt), `U2NET_HOME` pointing to a writable model cache, and `OMP_NUM_THREADS=2 NUMBA_NUM_THREADS=2 NUMBA_CACHE_DIR=/tmp/menswear-numba-cache`. Run `scripts/menswear-studio-production.py process --all --checkpoint`. It saves masks, trimaps, source-derived shadows, corrected native-size intermediates, normalized panels, responsive files and masters, recording all source/output hashes. It processes failures independently and checkpoints every complete exported set. Activation is separately guarded by forty completed visual reviews.

Sources are discovered from the existing full-production registry, including original/corrected pilot paths. The original generation registry, native bytes/hashes, former normalized panels, masters and historical URLs remain untouched. [Previous active catalog](PREVIOUS-ACTIVE-CATALOG.json) and [delivery map](PREVIOUS-WEB-IMAGES.json) preserve the prior active selection independently of the new presentation records. Native files remain 1024×1536; larger exports are explicitly resampled presentation derivatives.

IS-Net: [upstream](https://github.com/xuebinqin/DIS), [Apache-2.0 license](https://github.com/xuebinqin/DIS/blob/main/LICENSE.md). The rembg public ONNX weights SHA256 is `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`. [rembg](https://github.com/danielgatis/rembg) and [PyMatting](https://github.com/pymatting/pymatting) provide the MIT-licensed orchestration/matting libraries. Model weights are cached outside Git and are not shipped to the website.

## Recorded method recovery

The first engine, BiRefNet-General-Lite at its supported 1024 input, exceeded the execution's 8 GB memory limit (exit 137, OOM kill). It produced no accepted masks or image exports. The pipeline switched to IS-Net with CPU memory arenas/patterns disabled and two inference threads. The six IS-Net inferences completed in 2.8–3.5 seconds each. This was an environment/model-resource failure, not a refusal or an accepted defective correction.

## Current state

The six-image method validation passed autonomous visual review. Full collection exports, all-view visual review, browser/background checks, merge and actual Cloudflare deployment verification are recorded separately as they complete. This document does not claim unexecuted release work or owner artistic acceptance.
