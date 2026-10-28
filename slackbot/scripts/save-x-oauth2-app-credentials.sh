#!/usr/bin/env bash
set -euo pipefail

if ! command -v secret-tool >/dev/null 2>&1; then
  echo 'Install libsecret-tools before saving credentials.' >&2
  exit 1
fi

save_credential() {
  local prompt="$1" key="$2" secret
  IFS= read -r -s -p "$prompt: " secret
  printf '\n' >&2
  if [[ -z "$secret" ]]; then
    echo "$prompt was empty; nothing was saved." >&2
    return 1
  fi
  printf '%s' "$secret" | secret-tool store \
    --label="Lansing Codes Slackbot test X $prompt" \
    service lansingcodes-slackbot-test token "$key"
  unset secret
  echo "Saved $prompt in GNOME Keyring." >&2
}

save_credential 'OAuth 2.0 Client ID' x-oauth2-client-id
save_credential 'OAuth 2.0 Client Secret' x-oauth2-client-secret
