#!/bin/bash
# Drop images in the blog root, run this script, done.
BLOG_ROOT="$(cd "$(dirname "$0")" && pwd)"
DEST="$BLOG_ROOT/public/assets"

moved=0
for f in "$BLOG_ROOT"/*.png "$BLOG_ROOT"/*.jpg "$BLOG_ROOT"/*.jpeg "$BLOG_ROOT"/*.webp; do
  [ -f "$f" ] || continue
  filename="$(basename "$f")"
  mv "$f" "$DEST/$filename"
  echo "  moved → public/assets/$filename"
  ((moved++))
done

if [ $moved -eq 0 ]; then
  echo "No image files found in blog root."
else
  echo "Done. $moved image(s) moved to public/assets/."
fi
