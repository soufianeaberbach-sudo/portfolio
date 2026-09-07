#!/usr/bin/env bash
# Generates the responsive renditions the portfolio carousel actually loads.
#
# The uploaded sources are ~6 MB PNGs (297 MB across 49 files) and must never
# reach a phone. They also must not sit in public/, because Astro publishes
# everything in there verbatim — that alone made dist/ 312 MB of which nothing
# but 7.2 MB was ever requested. Sources therefore live in
# assets/source/<CATEGORY>/ (versioned, never deployed) and this script derives
# what the site actually serves into public/portfolio/.
#
# Add or replace a source there, then re-run:  bash .devtools/gen-portfolio.sh
set -euo pipefail
FF=$(node -e "console.log(require('ffmpeg-static'))")
OUT=public/portfolio
declare -A MAP=(
  [evening]="EVENING & OCCASION"
  [jersey]="JERSEY & KNITS"
  [woven]="WOMENSWEAR - WOVEN"
  [sport]="SPORTSWEAR & ACTIVEWEAR"
  [swim]="SWIMWEAR"
)
for key in "${!MAP[@]}"; do
  src="assets/source/${MAP[$key]}"
  mkdir -p "$OUT/$key"
  for f in "$src"/*.png; do
    n=$(basename "$f" .png)
    for w in 900 1400; do
      dst="$OUT/$key/$n-$w.webp"
      [ -f "$dst" ] && continue
      "$FF" -hide_banner -v error -y -i "$f" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 82 -compression_level 5 "$dst"
    done
  done
  echo "$key: $(ls "$OUT/$key" | wc -l) renditions"
done
echo "TOTAL: $(du -sh $OUT | cut -f1)"
