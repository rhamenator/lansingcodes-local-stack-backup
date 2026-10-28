#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  echo 'The stack smoke test needs Node 24 (see .nvmrc).' >&2
  exit 1
fi
if [[ ! -x "$root/api/node_modules/.bin/firebase" ]]; then
  echo 'Install API dependencies with npm ci in the sibling api checkout first.' >&2
  exit 1
fi

cd "$root/api"
"$root/api/node_modules/.bin/firebase" emulators:exec \
  --only firestore \
  --project demo-lansingcodes \
  --config firebase.json \
  'node ../slackbot/dev-tools/local-stack-smoke.js'
