# Lansing Codes Slackbot

[![Circle CI](https://circleci.com/gh/lansingcodes/slackbot.svg?style=svg)](https://circleci.com/gh/lansingcodes/slackbot)

You've found Lansing Codes's helpful, neighborhood robot! It runs as a member of
[our Slack](https://slack.lansing.codes/) and does a lot of cool stuff, like
notifying us of upcoming events and helping organizers do their work faster.

## Code of Conduct
All participants are expected to treat others with respect and follow our [Code of Conduct](https://www.lansing.codes/code-of-conduct/).

## Questions

For general support, direct your questions to the
[Lansing Codes Slack team](http://slack.lansing.codes). The issue list for this
project is exclusively for bug reports and feature requests.

## Stay in touch

- [Slack](http://slack.lansing.codes)
- [Twitter](https://twitter.com/lansingcodes)
- [Facebook](https://www.facebook.com/lansingcodes)
- [Website](https://www.lansing.codes)
- [Newsletter](http://bit.ly/lansing-codes-newsletter)

## Contribution

You are welcome and encouraged to make changes to this website by submitting
pull requests or forking our code to make your own community website!

Before you get ahead of yourself, though, please read our
[Contributing Guide](https://github.com/lansingcodes/slackbot/blob/main/.github/CONTRIBUTING.md).

## Running locally

Install Node.js 24 and run `npm ci`. Copy `.env.example` to `.env`, then set the Slack app and bot tokens and `FIREBASE_WEB_CONFIG`. Set `ORGANIZER_BY_GROUP` to a JSON map from event group keys to Slack user IDs for groups whose organizers should receive welcome templates, and `ORGANIZER_FIRST_NAME_BY_GROUP` for their email signatures. Set `WELCOMER_BY_CHANNEL` to a JSON map from Slack channel IDs to welcomer user IDs. Run `npm run start:local` to load `.env`, or `npm start` when the host provides environment variables.

For local Firestore testing, set `FIRESTORE_EMULATOR_HOST` to the emulator host and port. Use a Firebase project ID beginning with `demo-` so test traffic cannot reach a real project. Run `npm test`, `npm run lint`, and `npm audit` before submitting changes.

To rehearse core bot behavior without Slack or X accounts, install dependencies in the sibling `api` checkout (`cd ../api && npm ci`), then run `npm run test:stack` from this checkout using Node 24 while the live bot launcher is stopped. The command starts the API repository's Firestore emulator with the `demo-lansingcodes` project, seeds a temporary event, and sends simulated Slack messages and join events through Hubot. It verifies event replies, scheduled announcements, channel references, welcomer notices, and both denied and approved tweet paths with a local X stub. The emulator stops and its temporary data is removed when the test ends. No Slack or X token is needed.

For the isolated Lansing Codes System workspace, [`configuration/slack-test-app.yaml`](configuration/slack-test-app.yaml) records the test app's scopes and event subscriptions. Store its app-level and bot tokens in GNOME Keyring with attributes `service=lansingcodes-slackbot-test` and `token=app` or `token=bot`. With Node 24 and the sibling API dependencies installed, run `npm run start:slack-test`. It reads those two tokens from the keyring, starts the Firestore emulator under `demo-lansingcodes`, seeds one clearly labeled demo event, and connects the real Slack adapter. The `.test` event link is intentionally not a real Meetup. Stop the command with Ctrl+C when the live test is done; the emulator then stops too. No token is written to `.env` or the repository.

The local test launcher checks that the bot token belongs to Lansing Codes System and sets that workspace's test organizer, welcomer, and approved tweeter IDs. X posting uses the X v2 Post API with the existing four `TWITTER_*` environment variables. A normal X account does not supply these API credentials; a developer app with OAuth 1.0a user access and write permission is required. After generating the Consumer Key, Consumer Key Secret, Access Token, and Access Token Secret in the X Developer Console, run `bash scripts/save-x-test-credentials.sh` to enter them into GNOME Keyring without terminal echo. The launcher reads them from the keyring at startup. To keep the separate OAuth 2.0 Client ID and Client Secret in GNOME Keyring as well, run `bash scripts/save-x-oauth2-app-credentials.sh`; the current bot does not use those two values for posting. Until all four OAuth 1.0a credentials are configured, approved tweet commands fail with a clear message and cannot publish a post.

The launcher keeps `slackbot` as a Hubot command alias even if Slack assigns the installed bot a different username. For example, `slackbot tweet ...` still works in the test workspace where the bot appears as `@lansing_test_bot`.

Set `EVENT_ANNOUNCEMENT_CHANNEL_ID` and `EVENT_GROUP_CHANNEL_IDS` when scheduled event messages should go to Slack channel IDs. The JSON group map uses the same event group keys as Firestore. When unset, the existing channel names remain in use for current deployments.

Set `APPROVED_TWEETER_IDS` to a comma-separated list of Slack user IDs to authorize tweet commands by immutable identity. When unset, the previous username list remains in effect for compatibility.

## License

[Hippocratic 2.1](https://firstdonoharm.dev)

Copyright (c) 2015-Present, Michigan Technology Network
