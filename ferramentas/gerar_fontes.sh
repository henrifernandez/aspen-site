#!/usr/bin/env bash
# Recorta as fontes da marca para o alfabeto latino e converte para WOFF2.
# Requer fontTools e brotli (pip install --break-system-packages fonttools brotli).
set -euo pipefail
ORIGEM="${1:-/home/claude/aspen-social-agent/brand/fonts}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/assets/fonts"
U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2018-201E,U+2022,U+2026,U+20AC,U+2122,U+2212,U+FEFF,U+FFFD"
sub() { pyftsubset "$ORIGEM/$1" --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file="$DEST/$2"; }
sub Poppins-Regular.ttf poppins-400.woff2
sub Poppins-SemiBold.ttf poppins-600.woff2
sub Poppins-Bold.ttf poppins-700.woff2
sub SpaceMono-Regular.ttf spacemono-400.woff2
sub SpaceMono-Bold.ttf spacemono-700.woff2
cp "$ORIGEM/Poppins-OFL.txt" "$DEST/OFL-Poppins.txt"
cp "$ORIGEM/OFL-SpaceMono.txt" "$DEST/OFL-SpaceMono.txt"
ls -l "$DEST"
