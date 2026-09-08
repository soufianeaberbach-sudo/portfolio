#!/usr/bin/env bash
# Evidence stills for the Expertise services, derived from Soufiane's own
# development work in assets/source/. Each source is a full-length front+back
# pair at 1792x2390; the panels are ~680px wide, so a full-length portrait
# would make each service ~1000px tall. They are cropped to a 3:2 band across
# shoulders-to-thigh — reads as technical documentation rather than lookbook —
# and lightly desaturated so they sit inside the page's ink/line language
# without losing fabric colour, which is itself technical information here.
set -euo pipefail
FF=$(node -e "console.log(require('ffmpeg-static'))")
OUT=public/evidence
mkdir -p "$OUT"
# service-key  source-file
ENTRIES=(
  "development|assets/source/WOMENSWEAR - WOVEN/3.png"
  "monitoring|assets/source/SPORTSWEAR & ACTIVEWEAR/3.png"
  "consulting|assets/source/EVENING & OCCASION/2.png"
  "tracking|assets/source/JERSEY & KNITS/1.png"
)
CROP="crop=1792:1195:0:287"
GRADE="eq=saturation=0.58:contrast=1.05:brightness=0.012"
for e in "${ENTRIES[@]}"; do
  key="${e%%|*}"; src="${e##*|}"
  for w in 640 1000; do
    "$FF" -hide_banner -v error -y -i "$src" \
      -vf "$CROP,$GRADE,scale=$w:-2:flags=lanczos" \
      -c:v libwebp -quality 84 -compression_level 5 "$OUT/$key-$w.webp"
  done
  echo "  $key <- $src"
done
echo "TOTAL: $(du -sh $OUT | cut -f1)"
