#!/usr/bin/env bash
# Point every mention of The Niceville Agent Report at a new URL, in one command.
#
#   bash _tools/set-ranking-url.sh https://www.nicevilleagentreport.com
#
# Why this exists: the ranking site launched on a Vercel subdomain
# (jessica-mackrael-ranking-site.vercel.app). When it gets a real domain, this site's
# footer link and AI files have to follow, in 15 files. This does all of them and proves it.
#
# The ranking site has its own switch for its side:
#   cd ../Jessica-Mackrael-Ranking-Page && bash _build/set-domain.sh <new-url>
# Run BOTH, then push both repos.
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: bash _tools/set-ranking-url.sh https://your-domain.com"; exit 1; }
NEW="${1%/}"
case "$NEW" in https://*) ;; *) echo "refusing: URL must start with https://"; exit 1;; esac

cd "$(dirname "$0")/.."
OLD_HOST="jessica-mackrael-ranking-site.vercel.app"

BEFORE=$( { grep -rl "$OLD_HOST" . --include=*.html --include=*.txt --include=*.md 2>/dev/null || true; } | { grep -v '/\.git/' || true; } | sort)
if [ -z "$BEFORE" ]; then
  echo "Nothing references $OLD_HOST. Already switched, or the host constant in this script is stale."
  exit 1
fi
echo "Files to change:"; echo "$BEFORE" | sed 's/^/  /'
COUNT_BEFORE=$( { grep -ro "$OLD_HOST" . --include=*.html --include=*.txt --include=*.md 2>/dev/null || true; } | { grep -v '/\.git/' || true; } | wc -l | tr -d ' ')
echo "Mentions found: $COUNT_BEFORE"

# https://<old-host>/  ->  <NEW>/   (and bare host mentions too)
echo "$BEFORE" | while read -r f; do
  [ -n "$f" ] || continue
  python3 - "$f" "$OLD_HOST" "$NEW" <<'PY'
import sys
path, old_host, new = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(path, encoding='utf-8').read()
s = s.replace('https://' + old_host, new).replace('http://' + old_host, new).replace(old_host, new.split('//',1)[1])
open(path, 'w', encoding='utf-8').write(s)
PY
done

LEFT=$( { grep -ro "$OLD_HOST" . --include=*.html --include=*.txt --include=*.md 2>/dev/null || true; } | { grep -v '/\.git/' || true; } | wc -l | tr -d ' ')
NEWCOUNT=$( { grep -ro "${NEW#https://}" . --include=*.html --include=*.txt --include=*.md 2>/dev/null || true; } | { grep -v '/\.git/' || true; } | wc -l | tr -d ' ')
echo
echo "Old host mentions left: $LEFT   (must be 0)"
echo "New host mentions now:  $NEWCOUNT (was $COUNT_BEFORE)"
[ "$LEFT" = "0" ] || { echo "FAILED — old host still present. Nothing pushed. Check the files above."; exit 1; }
[ "$NEWCOUNT" -ge "$COUNT_BEFORE" ] || { echo "FAILED — fewer mentions than before. Nothing pushed."; exit 1; }

echo
echo "PASS. Now:"
echo "  cd ../Jessica-Mackrael-Ranking-Page && bash _build/set-domain.sh $NEW"
echo "  then commit and push BOTH repos, and load the live footer to confirm."
