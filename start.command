#!/bin/bash
# 더블클릭하면 Paper Reader 서버를 켜고 브라우저를 연다
cd "$(dirname "$0")"
if ! lsof -iTCP:8765 -sTCP:LISTEN >/dev/null 2>&1; then
  python3 server.py &
  sleep 1
fi
open "http://localhost:8765"
wait
