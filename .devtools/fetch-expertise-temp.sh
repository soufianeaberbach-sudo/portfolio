#!/usr/bin/env bash
# Downloads the four TEMPORARY placeholder photographs for the Expertise page
# and writes the eight WebP renditions the page already references. Run from
# the repository root on a machine with network access:
#
#   bash .devtools/fetch-expertise-temp.sh
#
# No code change is needed afterwards — the filenames are fixed.
# Sources, photographers and licence: assets/source/expertise-temp/SOURCES.md
#
# Uses only what the repo already has: curl and ffmpeg-static.
set -euo pipefail

FF=$(node -e "console.log(require('ffmpeg-static'))")
OUT=public/expertise-temp
RAW=$(mktemp -d)
trap 'rm -rf "$RAW"' EXIT
mkdir -p "$OUT"

# stage-file|pexels photo id
ENTRIES=(
  "01-design-intent|7256861"
  "02-fit-system|9852972"
  "03-technical-translation|36731157"
  "04-production-control|31091547"
)

for e in "${ENTRIES[@]}"; do
  name="${e%%|*}"; id="${e##*|}"
  # Pexels serves originals from images.pexels.com under a predictable path;
  # the ?auto=compress&w= query keeps the download modest.
  url="https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800"
  echo "  $name  <- pexels $id"
  if ! curl -fsSL --max-time 60 -o "$RAW/$name.jpg" "$url"; then
    echo "  !! could not download $id — check network access to images.pexels.com" >&2
    exit 1
  fi
  for w in 800 1400; do
    # 4:3 centre crop matches the widest frame the stage uses; the component
    # fine-tunes the focal point per stage with object-position.
    "$FF" -hide_banner -v error -y -i "$RAW/$name.jpg" \
      -vf "scale=${w}:-2:flags=lanczos,crop=${w}:$(( w * 3 / 4 ))" \
      -c:v libwebp -quality 82 -compression_level 5 "$OUT/$name-$w.webp"
  done
done

echo "TOTAL: $(du -sh "$OUT" | cut -f1)"
echo "Delete the 'Current state of the files' section of"
echo "assets/source/expertise-temp/SOURCES.md once these are the real photos."
