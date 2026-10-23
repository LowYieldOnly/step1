#!/usr/bin/env bash
# The rebuild kit: everything needed to rebuild BRODY MODE exactly as it is, in one zip.
#
#   brodymode.bundle   the whole repository — every branch, full history. `git clone` it.
#   site/              the live site, exactly as GitHub Pages serves it from main
#   REBUILD.md         how to put it all back, the branches as they stood, the standing rules
#   MANIFEST.txt       what was captured, with SHA-256 checksums
#
# Run it from a full clone (every branch fetched, full history — the weekly workflow,
# .github/workflows/rebuild-kit.yml, checks out with fetch-depth 0). Writes
# <out-dir>/brodymode-rebuild-kit-<date>.zip and prints its path.
#
#   bash tools/backup/make-kit.sh [out-dir]
set -euo pipefail

OUT="$(cd "${1:-.}" && pwd)"
DATE="$(date -u +%F)"
NAME="brodymode-rebuild-kit-$DATE"
ROOT="$(git rev-parse --show-toplevel)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
KIT="$WORK/$NAME"
mkdir -p "$KIT/site"
cd "$ROOT"
if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
  echo "make-kit: this clone is shallow, so its history is partial — run: git fetch --unshallow" >&2
  exit 1
fi

MAIN_REF=refs/remotes/origin/main
git rev-parse --verify -q "$MAIN_REF" >/dev/null || MAIN_REF=refs/heads/main
MAIN_SHA="$(git rev-parse "$MAIN_REF")"

# ---- the repository: every branch on GitHub, as a branch of the bundle ----
git init -q --bare "$WORK/repo.git"
refspecs=()
while read -r ref; do
  b="${ref#refs/remotes/origin/}"
  [ "$b" = "HEAD" ] && continue
  refspecs+=("$ref:refs/heads/$b")
done < <(git for-each-ref --format='%(refname)' refs/remotes/origin)
[ ${#refspecs[@]} -gt 0 ] || refspecs=("refs/heads/*:refs/heads/*")
git -c push.negotiate=false push -q "$WORK/repo.git" "${refspecs[@]}"
git -C "$WORK/repo.git" symbolic-ref HEAD refs/heads/main
git -C "$WORK/repo.git" bundle create -q "$KIT/brodymode.bundle" --all
git bundle verify -q "$KIT/brodymode.bundle"

# ---- the live site: main's tree, file for file ----
git archive "$MAIN_SHA" | tar -x -C "$KIT/site"

# ---- REBUILD.md: the template, with today's facts filled in ----
BRANCHES="$(git -C "$WORK/repo.git" for-each-ref --sort=-committerdate \
  --format='| `%(refname:short)` | %(committerdate:short) | %(subject) |' refs/heads)"
FILES="$(find "$KIT/site" -type f | wc -l | tr -d ' ')"
python3 - "$ROOT/tools/backup/REBUILD.template.md" "$KIT/REBUILD.md" "$DATE" "$MAIN_SHA" "$FILES" "$BRANCHES" <<'PY'
import sys
src, dst, date, sha, files, branches = sys.argv[1:7]
t = open(src, encoding='utf8').read()
for k, v in {'{{DATE}}': date, '{{MAIN}}': sha, '{{FILES}}': files, '{{BRANCHES}}': branches}.items():
    t = t.replace(k, v)
open(dst, 'w', encoding='utf8').write(t)
PY

# ---- MANIFEST.txt ----
{
  echo "BRODY MODE rebuild kit · $DATE (UTC)"
  echo "main @ $MAIN_SHA"
  echo
  (cd "$KIT" && sha256sum brodymode.bundle && find site -type f | LC_ALL=C sort | xargs -d '\n' sha256sum)
} > "$KIT/MANIFEST.txt"

(cd "$WORK" && zip -qr "$OUT/$NAME.zip" "$NAME")
echo "$OUT/$NAME.zip"
