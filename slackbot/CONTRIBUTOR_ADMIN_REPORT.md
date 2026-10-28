# Lansing Codes: local slackbot and stack repair report

**Prepared:** October 28, 2026  
**Status:** Local code changes only, in separate branches of the fresh checkout. An earlier copy of this report was shared on Lansing Codes Slack. No code has been pushed, deployed, or submitted as a PR.

## Summary

The clean `slackbot` checkout did not pass its full test suite: the TinyURL test depended on a live service and received `Error`. It also used an old Hubot and Slack adapter, and several commands depended on Slack's removed RTM data store or on an event field that the current API does not provide. The local branch repairs these paths, updates the runtime, retains all eleven external script integrations, and adds deterministic unit coverage. Local changes now also repair the active `api`, `website`, `newsletter-events`, `slide`, `sign-in-sheet`, and `slackin-redirect` repositories. Core event replies have passed in an isolated live Slack workspace; production deployment has **not** been tested.

## Changes in slackbot

- Upgrade to Node 24, Hubot 14, the maintained `@hubot-friends/hubot-slack` Socket Mode adapter, Firebase 13, and patched dependency versions. `.nvmrc`, `package.json`, `package-lock.json`, and CircleCI now describe the same runtime. The Heroku process uses `npm start`.
- Preserve the eleven external Hubot scripts. `legacy-scripts.json` lists them, and `scripts/initialize.js` loads CoffeeScript packages through a compatibility loader. The boot check loads them without errors. Their individual commands still need live behavior checks.
- Replace the old TinyURL package call with HTTPS, response validation, a five second timeout, and a fallback to the original link. The unit test no longer calls the public service. A manual HTTPS check also returned a short link for a generated welcome template.
- Replace Slack RTM channel lookup with the current Conversations API and native channel mention IDs. Preserve references to plain `#channel` names. Reconnection monitoring now uses socket events instead of scraping log output.
- Correct event group lookup for organizer emails and scheduled channel reminders. Use the Meetup event URL for the welcome email link's group slug and event ID, rather than the Firestore document ID. Send welcome notices with separate room and message arguments.
- Support configured Slack user IDs for organizers, channel welcomers, and tweet approval. Legacy mappings remain as fallbacks. Configure current group and channel IDs before production use.
- Delay the daily greeting until the Firestore fetch succeeds, and cache each reminder stage to prevent repeated same day announcements. Missing or malformed Firebase configuration now produces an error that handlers can report. Set `FIRESTORE_EMULATOR_HOST` for local integration testing.
- Add `.env.example`, ignore `.env`, document local startup, add lint and audit CI gates, and expand the Jasmine suite for these behaviors.

## Changes in the other local checkouts

| Repository and local branch | Changes |
| --- | --- |
| `api` — `fix/security-runtime` | Replaced deprecated `netlify-lambda` with native Netlify function bundling, updated Firebase Admin and CLI dependencies, set Node 22 and a dedicated public directory, repaired Firestore emulator port 8085, rebuilt its emulator image on Java 21 without mounting host Firebase credentials, removed credential fragments from diagnostic output, protected manual sync with `POST` and `SYNC_SECRET`, and added `DATA_SYNC_OWNER` to disable API writes when website owns the collections. |
| `website` — `fix/security-quality` | Upgraded Next.js and Firebase Admin, switched to modular Admin imports, fixed an `ical2json` import, made a failed or malformed Meetup feed abort the full replacement, added unit tests, and supported credential-free emulator testing. |
| `newsletter-events` — `fix/browser-deps-xss` | Replaced the obsolete Firebase browser SDK with a public Firestore REST read, bundled the updated Moment browser file locally, and preserved direct GitHub Pages hosting. Event names render as text and only HTTP(S) links become anchors. Added three unit tests. |
| `slide` — `fix/security-runtime` | Replaced `live-server` with Vite, bundled Bootstrap CSS, removed unused jQuery/Popper/Bootstrap scripts, updated Bootstrap class names, replaced broken Nuxt image URLs with a local placeholder, and configured the Netlify build. |
| `sign-in-sheet` — `fix/title-rendering` | Renders the user-entered title as text, clamps page count to at least one, and adds a rendering regression test. |
| `slackin-redirect` — `fix/http-redirect-docs` | Adds a forced HTTP 302 for the shared Slack invite and corrects the README's outdated Heroku description. |

The old `www` and `slackin` application checkouts remain unchanged because their live public addresses now resolve through the newer website and static invite service. The old Slackin repository also exposes badge and live user count endpoints; check for callers before retirement. The resource and webfont repositories contain no runtime dependencies. `promotion` already passes its 19 tests and dependency audit.

## Verification performed

| Check | Result |
| --- | --- |
| Clean `npm ci` on Node 24 | Passed |
| `slackbot` Jasmine unit suite | 36 specs passed, including X v2 posting helper success, missing credentials, API failure, and configured channel ID routing. |
| `slackbot` lint | Passed after the final clean install. |
| Local `npm audit` | 0 findings after the final clean install. |
| `npm start -- --config-check` with dummy Slack tokens | Passed; all local and external scripts loaded. The HTTP route warning is expected in this disabled HTTP check. |
| Firestore emulator | Passed: an API shaped event in `events` was read by `slackbot` as `group: catech` with its Meetup URL and document ID. |
| `api` unit suite | 8 suites, 26 tests passed; lint and native Netlify bundling passed. |
| `api` local function server | Unauthenticated manual sync returned HTTP 401. Only four intended functions were packaged. |
| `api` Docker Compose | Both images built. An authorized group sync wrote 11 groups into the containerized Firestore emulator and returned HTTP 200; with `DATA_SYNC_OWNER=website`, the same endpoint returned HTTP 409. Containers were shut down after testing. |
| `website` unit suite, lint, build, audit | 3 tests passed, lint and Next.js production build passed, 0 audit findings. |
| Firestore stack integration | Website sync wrote 7 events, 11 groups, and 7 sponsors to a local emulator. Slackbot fetched 5 upcoming events; newsletter reader fetched all 7. Event fields had the expected types. |
| `newsletter-events` | 3 tests and 0 audit findings; the page displayed five current public Firestore events in a local browser preview. |
| `slide` | Vite build passed with local placeholder asset; 0 audit findings. |
| `sign-in-sheet` | 2 title and page count regression tests passed. |
| `promotion` | 19 existing tests passed; 0 audit findings. |
| Live Slack | Socket Mode connection, both event reply commands, the approved tweet failure path, and a corrected cross-channel reference passed in Lansing Codes System. Other live commands remain to be checked. |
| Live X, staging, production | Not tested; developer API access and deployment settings are still needed. |

### Local stack rehearsal

`npm run test:stack` now starts the sibling API repository's Firestore emulator under the isolated `demo-lansingcodes` project. It seeds a temporary event and drives the real Hubot message handlers with simulated Slack users and channels. The rehearsal passed seven checks: upcoming event listing, group-specific event link, scheduled announcement to a configured channel, cross-channel reference, join notice to a configured welcomer, rejected tweet by an unapproved user, and an approved tweet delivered to a simulated X client. The emulator shut down cleanly afterward. This needs Node 24 and dependencies installed in both the `api` and `slackbot` checkouts; no service tokens are used.

The rehearsal verifies bot logic and its Firestore read contract. It does not test Slack's Socket Mode connection, live scopes and membership, X posting, scheduled jobs across restarts, or the eleven external integrations. Those still need the isolated live workspace checks below.

### Isolated Slack workspace setup

On October 28, 2026, the contributor created the `Lansing Codes System` workspace. A `Lansing Codes Slackbot Test` app was created there using [`configuration/slack-test-app.yaml`](configuration/slack-test-app.yaml), installed into that workspace, and joined to `#new-channel` and `#upcoming-events`. Its app-level and bot tokens are stored in the host's GNOME Keyring under `service=lansingcodes-slackbot-test` with `token=app` and `token=bot`; no token is in this checkout. Slack accepted both credentials, and the local bot logged in as `@lansing_test_bot` and connected through Socket Mode. The user sent `upcoming events` and `next devops event` in `#upcoming-events`. The bot replied with the demo event list and its link, proving the Slack event path and Firestore read with a real workspace. The launcher checks the workspace ID before connecting and sets test organizer, welcomer, and tweeter IDs. Other live commands and downstream integrations still need acceptance checks.

The Slack adapter changes Hubot's primary name to the Slack bot username after authentication. In this workspace that name is `lansing_test_bot`, so plain `slackbot tweet ...` initially did not match Hubot's `respond` pattern. `bin/hubot` now defaults `HUBOT_ALIAS=slackbot`, preserving the historical command prefix regardless of Slack's assigned username. After a restart, the approved test user sent `slackbot tweet local test` and received `Tweet failed. :-( Error: X API credentials are not configured`. No X post was made. The event help text also now says `next GROUP event` so Slack does not escape angle brackets as `&lt;` and `&gt;`.

A live `#social` reference from `#upcoming-events` exposed a hard-coded production Slack domain in the generated message link. The referencer now uses the URL returned by the connected Slack workspace. A second live reference produced a link under `lansingcodessystem.slack.com`, and the unit suite checks the same behavior. Scheduled event notifications now accept `EVENT_ANNOUNCEMENT_CHANNEL_ID` and `EVENT_GROUP_CHANNEL_IDS` so workspace-specific channel IDs can be configured without changing their existing channel-name defaults.

The user created the `@snarkykatx` X test account. The old `twitter-node-client` v0.0.6 integration has been replaced locally by `twitter-api-v2` and the supported X v2 Post endpoint while retaining the four existing `TWITTER_*` configuration names and command behavior. Unit tests cover posting, missing credentials, and API failure without a network call. The app has user access with Read and write permission as described in [X's Post API quickstart](https://github.com/xdevplatform/docs/blob/main/x-api/posts/manage-tweets/quickstart.mdx). Its credentials are in the host keyring. On October 28, the approved test user sent `slackbot tweet Lansing Codes Slackbot integration test 2026-10-28` in `#upcoming-events`; the bot replied `Tweet sent!`, and the exact text appeared publicly on [@snarkykatx](https://x.com/snarkykatx/status/2115352418552512991). This verifies the Slack command, approval mapping, X user authentication, and X v2 Post API together.

X currently advertises pay-per-use developer access and lists [Post Create at $0.015 per API request](https://developer.x.com/). The contributor funded the isolated `@snarkykatx` developer account with $5 and received $5 in promotional credits, giving the test account a $10 balance. The app's permission is Read and write, and its OAuth 1.0a user credentials are stored in GNOME Keyring. The OAuth 2.0 Client ID and Client Secret cannot be used alone for posting; OAuth 2.0 user access and refresh tokens would require an additional flow and token rotation support. Admins should separately decide whether to fund production API access. Do not work around API access with browser automation of an account session.

The contributor completed Developer Program enrollment and created an app in the pay-per-use project. The OAuth 1.0a Consumer Key, Consumer Key Secret, Access Token, and Access Token Secret are now saved in GNOME Keyring using `bash scripts/save-x-test-credentials.sh`. The separate OAuth 2.0 Client ID and Client Secret are also stored there using `bash scripts/save-x-oauth2-app-credentials.sh`; the current bot does not use those two values to post. The local launcher loads all four OAuth 1.0a values into the `TWITTER_*` variables. A restart confirmed that the bot received all four and connected to Lansing Codes System, the 36 unit tests still pass, and the real post succeeded. Do not paste credentials in Slack, chat, source, or this report.

These checks show that the local code loads and its tested paths work. They do not prove that each legacy script's external service still accepts its calls or that the deployed app has the required Slack scopes.

## Stack work needed before deployment

1. **Choose one Firestore data sync owner.** Both [`api`](https://github.com/lansingcodes/api) and [`website`](https://github.com/lansingcodes/website) can write `events` and `groups`. Website output now passed a real emulator read through slackbot and newsletter-events. The website sync now aborts on failed or invalid Meetup feeds so it will not delete existing events on a partial fetch. Set `DATA_SYNC_OWNER=website` on the API deployment after designating website as writer; this disables API deploy event and manual sync writes while preserving its other endpoints. The default remains `api` for existing deployments until admins make that choice. Coordinate the website scheduler and API deployment timing.
2. **Complete test workspace configuration.** The isolated Slack app and basic event replies work. Continue testing channel membership, member join notices, organizer emails, and current ID mappings, then have admins approve corresponding production IDs and scopes. The bot needs membership in the channels it posts to, or `chat:write.public` where appropriate. Slack documents [Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/), [channel posting](https://docs.slack.dev/reference/methods/chat.postMessage/), and [Conversations API scopes](https://docs.slack.dev/reference/methods/conversations.list/).
3. **Verify the remaining commands in a test workspace.** Event replies, cross channel references, and X posting to the test account passed live checks. Test scheduled reminders, new participant notices, welcome template delivery, and each of the eleven external scripts. This includes the old `hubot-appearin`, maps, shipit, darts, thank-you, bikeshed, principles, help, rules, diagnostics, and keepalive integrations. They load locally, but service behavior and permissions remain unverified. If a service has been retired, replace that integration with a supported equivalent while keeping its user facing purpose.
4. **Review event content and persistence.** The welcome email still contains old venue, food, phone, and topic placeholders. Admins should update the copy and current organizer mappings. The event notification cache is stored in Hubot's brain; verify a persistent brain is configured on the deployment or repeated announcements may occur after a restart. This may require Redis or another shared store.
5. **Validate deployment.** Use Node 24 in the hosting environment, provide secrets through host configuration, and confirm process restart after a missed Slack reconnect. The local branch updates CircleCI, but its Heroku deployment job and the production host were not exercised. Heroku currently supports Node 24 and recommends specifying the major version in `engines` ([Heroku Node support](https://devcenter.heroku.com/articles/nodejs-support)).
6. **Plan to replace legacy plugin packages.** Their functionality is retained through the CoffeeScript compatibility loader, but several declare peer support only for older Hubot versions. `.npmrc` uses `legacy-peer-deps=true` so clean installs are reproducible. Replace or maintain these packages as modern Hubot modules after their behavior is captured in acceptance tests, then remove this compatibility setting.
7. **Apply the API's new deployment settings.** Its local branch fixes the emulator port, publishes only `public/`, packages only four actual functions, replaces deprecated `netlify-lambda`, uses Node 22, and separates a normal Netlify build from an intentional Firebase rules deploy. Configure `SYNC_SECRET` in Netlify and in trusted manual callers. The full Docker Compose stack passed an authorized Firestore write and writer-disabled check locally.
8. **Retire unused applications after an admin check.** The live `www.lansing.codes` response identifies Next.js, and its home, code of conduct, and sponsor signup routes returned HTTP 200. Those are the same three routes in the old Nuxt `www` repository. The live `slack.lansing.codes` response is a static Netlify invite page, while `slackin` is the old Heroku invite service with badge and live user count features. Admins should confirm no separate deployment, embedded badge, or client uses these legacy apps before archiving their repositories and disabling old deploys. The shared Slack invite followed a redirect to Slack but returned HTTP 403 to an automated client; verify it in a browser with an admin account.

### Recommended rollout order

1. **Agree on ownership and protect data.** Designate `website` as the writer for `events`, `groups`, and `sponsors`; its output passed the emulator contract test. Back up Firestore before any production full-replacement sync. Rehearse the transition in staging, compare document counts and representative records, and confirm that slackbot and newsletter-events still read them. Set `DATA_SYNC_OWNER=website` on the API deployment and verify its manual sync endpoints return HTTP 409. Confirm the website's two-hour scheduled sync actually runs and that failures are monitored.
2. **Finish the isolated live tests.** The separate Slack workspace and app are configured; both event commands, cross channel references, and a public X test post passed. Complete the remaining Slack commands and joins. Keep API credentials in an owner-only keyring, never in a repository or this report.
3. **Run acceptance checks before a PR.** Exercise core messages, channel references, joins, reminders, organizer emails, tweet approval/posting, reconnects, and all eleven retained external scripts in the test workspace. Restart the bot and verify reminders are not repeated; configure a persistent Hubot brain if needed. Replace any script whose external service no longer works while preserving its user-facing purpose.
4. **Review and release in stages.** Have admins review the local branches and report, then authorize PRs. Run CI and dependency audits on the proposed revisions. Deploy to staging first with Node 24 for slackbot and the declared versions for other apps; verify secrets, function authorization, scheduled sync, and bot restart behavior. Promote to production with a Firestore backup and rollback plan after staging passes.
5. **Close legacy risk.** Confirm no deployment or clients still depend on old `www` or `slackin` routes, including badges. Archive or remove their deploys only after that check; otherwise migrate the remaining feature first. Keep the residual API CLI/tooling advisories tracked and enable code scanning on active repositories.

## Security and quality alert inventory

GitHub alert counts below are **open alerts on the repositories' remote default branches**, captured October 28, 2026. They will not reflect this local branch until maintainers review and merge it. `npm audit` counts vulnerable packages in the local lockfile, so its totals are not directly comparable with GitHub's advisory counts.

| Repository | Open Dependabot alerts on remote `main` | Current local audit | Action |
| --- | ---: | ---: | --- |
| [`slackbot`](https://github.com/lansingcodes/slackbot) | 66 (8 critical) | **0 after local repairs** | Review this branch and run CI in a private test workspace. |
| [`api`](https://github.com/lansingcodes/api) | 269 (11 critical) | 15 low/moderate in development and CLI tooling; **0 in production dependencies** | Native Netlify build and authenticated sync are fixed locally. Toolchain advisories still need upstream updates or a tool replacement. |
| [`website`](https://github.com/lansingcodes/website) | 144 (6 critical) | **0** | Next.js and Firebase Admin upgraded; build, tests, and emulator sync passed. |
| [`www`](https://github.com/lansingcodes/www) | 198 (5 critical) | 141 (6 critical), unchanged legacy checkout | Next.js website appears live. Confirm no remaining Nuxt deployment or route before archiving; if still used, migrate its remaining behavior first. |
| [`slackin`](https://github.com/lansingcodes/slackin) | Dependabot disabled | 63 (12 critical), unchanged legacy checkout | Static invite redirect appears live. Confirm no badge or invite API clients before archiving; otherwise this service needs a separate migration. |
| [`slide`](https://github.com/lansingcodes/slide) | 9 (1 critical) | **0** | Replaced the old live server and CDN scripts with Vite and bundled Bootstrap; fixed broken placeholder image URLs. |
| [`newsletter-events`](https://github.com/lansingcodes/newsletter-events) | 0 reported | **0** | Direct GitHub Pages hosting preserved; public Firestore read and safe DOM rendering work in a browser; 3 tests pass. |
| `promotion`, `sign-in-sheet`, `slackin-redirect`, `webfont`, `beginner-resources`, `organizer-resources` | 0 reported or alerts disabled for the two resource repositories | `promotion`: **0**; others have no runtime package lock | `sign-in-sheet` title XSS fixed; redirect now sends HTTP 302; static/resource repositories have no dependency alerts to patch locally. |

GitHub Code Scanning reported one **fixed** alert in `website` and no analysis found for `slackbot`, `api`, `www`, or `slide`. Admins should enable a code scanning workflow for active application repositories; "no analysis found" is not evidence of no code issues. Secret scanning status was not available through this review.

## Release criteria for admins and contributors

- Run `npm ci`, `npm test`, `npm run lint`, `npm audit --audit-level=low`, and the bot configuration check in slackbot CI using Node 24. Use each other repository's declared Node version for its build and tests.
- Prove the Firestore schema from the chosen data writer through the bot's event fetcher and message handlers with representative events.
- Complete a test workspace checklist for every retained command, including the legacy scripts and outbound API calls.
- Confirm current Slack app scopes, channel membership, organizer and welcomer IDs, Twitter/X test credentials, persistent brain storage, and monitored restart behavior.
- Select one Firestore sync owner, verify the Slack shared invite in a browser, and confirm legacy app retirement before a coordinated deployment.

The earlier report was shared on Slack by the contributor. This revised local copy and all code changes remain unpublished. The original `tinyurl-hardening` checkout remains untouched. No PR has been created.
