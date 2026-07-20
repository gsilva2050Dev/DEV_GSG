#!/bin/bash
# Headless-browser smoke test for the portfolio site.
# Requires Google Chrome. No node/npm dependency.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT=8766
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

cd "$DIR"
lsof -ti:$PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null || true
python3 -m http.server $PORT >/tmp/smoke-test-server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  curl -sf "http://localhost:$PORT/index.html" >/dev/null && break
  sleep 0.5
done

DUMP="/tmp/smoke-test-dump.html"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=5000 --dump-dom \
  "http://localhost:$PORT/tests/smoke-test.html" > "$DUMP" 2>/dev/null

TITLE=$(grep -o '<title>.*</title>' "$DUMP" | sed -e 's/<title>//' -e 's/<\/title>//')

echo "$TITLE" | python3 -c "
import sys, json
line = sys.stdin.read().strip()
status, _, payload = line.partition(' :: ')
print(f'Status: {status}')
if payload:
    try:
        results = json.loads(payload)
        for r in results:
            mark = 'PASS' if r['pass'] else 'FAIL'
            print(f\"  [{mark}] {r['name']}\")
        failed = [r for r in results if not r['pass']]
        sys.exit(1 if failed else 0)
    except json.JSONDecodeError:
        print(payload)
        sys.exit(1)
sys.exit(1 if status != 'ALL_PASS' else 0)
"
