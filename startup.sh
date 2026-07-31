#!/bin/sh
set -eu
cd /workspace

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/api/health; then
  exit 0
fi

if [ ! -f apps/web/dist/web/browser/index.html ]; then
  npm run build --workspace=@forgeledger/web >>/tmp/app-startup.log 2>&1 || true
fi

if [ ! -f apps/api/dist/main.js ]; then
  npm run build --workspace=@forgeledger/api >>/tmp/app-startup.log 2>&1 || true
fi

mkdir -p /workspace/data
cd /workspace/apps/api
PORT=8080 HOST=0.0.0.0 SQLITE_PATH=/workspace/data/forgeledger.sqlite \
  node dist/main.js >>/tmp/app-startup.log 2>&1 &
echo $! > /tmp/forgeledger.pid
