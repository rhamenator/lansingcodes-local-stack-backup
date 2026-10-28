#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  echo 'The Slack test needs Node 24 (see .nvmrc).' >&2
  exit 1
fi
if [[ ! -x "$root/api/node_modules/.bin/firebase" ]]; then
  echo 'Install API dependencies with npm ci in the sibling api checkout first.' >&2
  exit 1
fi

export HUBOT_SLACK_APP_TOKEN="$(secret-tool lookup service lansingcodes-slackbot-test token app)"
export HUBOT_SLACK_BOT_TOKEN="$(secret-tool lookup service lansingcodes-slackbot-test token bot)"
if [[ "$HUBOT_SLACK_APP_TOKEN" != xapp-* || "$HUBOT_SLACK_BOT_TOKEN" != xoxb-* ]]; then
  echo 'Lansing Codes test tokens are missing from GNOME Keyring.' >&2
  exit 1
fi

# Load optional X OAuth 1.0a credentials without storing them in the checkout.
for name in TWITTER_CONSUMER_KEY TWITTER_CONSUMER_SECRET TWITTER_ACCESS_TOKEN TWITTER_ACCESS_TOKEN_SECRET; do
  if [[ -z "${!name:-}" ]]; then
    key="${name#TWITTER_}"
    key="${key,,}"
    value="$(secret-tool lookup service lansingcodes-slackbot-test token "x-$key" || true)"
    if [[ -n "$value" ]]; then
      export "$name=$value"
    fi
  fi
done
unset name key value

node "$root/slackbot/dev-tools/check-slack-test-auth.js"

export FIREBASE_WEB_CONFIG='{"apiKey":"local-test-only","appId":"local-test-only","projectId":"demo-lansingcodes"}'
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8085
export APPROVED_TWEETER_IDS=U0CCU2SBABB
export ORGANIZER_BY_GROUP='{"devops":"U0CCU2SBABB"}'
export ORGANIZER_FIRST_NAME_BY_GROUP='{"devops":"Test Organizer"}'
export WELCOMER_BY_CHANNEL='{"C0CCS5NLDEW":"U0CCU2SBABB"}'
export EVENT_ANNOUNCEMENT_CHANNEL_ID=C0CCS5NLDEW
export EVENT_GROUP_CHANNEL_IDS='{"devops":"C0CCS5NLDEW"}'

cd "$root/api"
"$root/api/node_modules/.bin/firebase" emulators:exec \
  --only firestore \
  --project demo-lansingcodes \
  --config firebase.json \
  'node ../slackbot/dev-tools/seed-demo-event.js && cd ../slackbot && npm start'
