#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
DIST_DIR="$ROOT_DIR/dist"
STAGE_DIR="$DIST_DIR/chrome"

if [[ ! -f "$SRC_DIR/manifest.json" ]]; then
  echo "Error: manifest.json not found in $SRC_DIR" >&2
  exit 1
fi

VERSION="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$SRC_DIR/manifest.json" | head -n1)"
if [[ -z "$VERSION" ]]; then
  echo "Error: Could not parse extension version from manifest.json" >&2
  exit 1
fi

ZIP_NAME="enhance-o-tron-for-plex-chrome-v${VERSION}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

rm -rf "$STAGE_DIR" "$ZIP_PATH"
mkdir -p "$STAGE_DIR"

rsync -a --delete \
  --exclude='.DS_Store' \
  "$SRC_DIR/" "$STAGE_DIR/"

(
  cd "$STAGE_DIR"
  zip -qr "$ZIP_PATH" .
)

echo "Built: $ZIP_PATH"
