#!/bin/sh
# Package the addon as an .ankiaddon file for "Install from file..." in Anki.
set -e
cd "$(dirname "$0")"
out="again-tracker.ankiaddon"
rm -f "$out"
zip -q "$out" __init__.py config.json config.md manifest.json
echo "Built $out"
