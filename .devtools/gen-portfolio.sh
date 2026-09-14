#!/usr/bin/env bash
# Generates the responsive renditions the Portfolio deck actually loads.
#
# The uploaded sources are ~6 MB PNGs (297 MB across 49 files) and must never
# reach a phone. They also must not sit in public/, because Astro publishes
# everything in there verbatim. Sources therefore live in
# assets/source/<CATEGORY>/ (versioned, never deployed) and this script derives
# what the site serves into public/portfolio/<key>/N-{900,1400}.webp.
#
# The derivation now also normalises the studio ground. The 49 frames were shot
# on backgrounds running roughly #eeeeee to #ffffff; on the Portfolio stage the
# garments overlap, so two adjacent frames with different whites met along a
# hard seam and the deck read as a row of tiles rather than one photographic
# space. normalise-ground.mjs resolves every ground to white using an
# edge-connected flood fill with a tight tolerance and a feathered mask, so
# white lace, ivory fabric, highlights and skin are left alone. The masters are
# never touched.
#
# Add or replace a source, then re-run:  bash .devtools/gen-portfolio.sh
#   ...--check  reports each frame's ground without writing
#   ...--sample evening/1 woven/3   writes before/after PNG comparisons
set -euo pipefail
cd "$(dirname "$0")/.."
node .devtools/normalise-ground.mjs --write
echo "TOTAL: $(du -sh public/portfolio | cut -f1)"
