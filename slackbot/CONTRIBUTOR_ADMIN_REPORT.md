# Lansing Codes: local slackbot and stack repair report

**Prepared:** October 28, 2026  
**Status:** This report began as a local snapshot; it now includes a dated personal staging addendum at the end. An earlier copy was shared on Lansing Codes Slack. The contributor's [stack backup](https://github.com/rhamenator/lansingcodes-local-stack-backup) is public. Proposed website changes are in [PR #18](https://github.com/lansingcodes/website/pull/18) and [PR #19](https://github.com/lansingcodes/website/pull/19); proposed Slackbot changes are in [PR #100](https://github.com/lansingcodes/slackbot/pull/100). No Lansing Codes production deployment was made by this work.

## Summary

The clean `slackbot` checkout did not pass its full test suite: the TinyURL test depended on a live service and received `Error`. It also used an old Hubot and Slack adapter, and several commands depended on Slack's removed RTM data store or on an event field that the current API does not provide. The local branch repairs these paths, updates the runtime, retains the purpose of all eleven legacy script integrations, and adds deterministic unit coverage. Three retired or unreliable integrations now have local replacements. Local changes also repair `website`, `newsletter-events`, `slide`, `sign-in-sheet`, `slackin-redirect`, and the legacy `api` checkout. Core event replies and X posting have passed in an isolated live Slack workspace; production deployment has **not** been tested.

### Production ownership update

In a message sent October 22, 2026, an admin said that `website` had been deployed to production the previous night and that Lansing Codes was no longer using the old `www` or `api` repositories. The published [`website` README](https://github.com/lansingcodes/website/blob/main/README.md) describes a combined Next.js frontend and data-sync backend hosted by Netlify. Its [production workflow](https://github.com/lansingcodes/website/blob/main/.github/workflows/deploy-production.yml) builds `main` and deploys it to the `lansingcodes-www` Netlify site on demand after required environment approval; merging to `main` deploys staging. GitHub records successful [October 21](https://github.com/lansingcodes/website/actions/runs/39700286471) and [October 22](https://github.com/lansingcodes/website/actions/runs/39888382971) production workflow runs. Treat `website` as the production site and Firestore sync owner. The old repositories remain in the local backup for history and comparison; their local fixes are not prerequisites for deploying slackbot. Confirm the old deployment endpoints and any external callers before turning them off.

## Changes in slackbot

- Upgrade to Node 24, Hubot 14, the maintained `@hubot-friends/hubot-slack` Socket Mode adapter, Firebase 13, and patched dependency versions. `.nvmrc`, `package.json`, `package-lock.json`, and CircleCI now describe the same runtime. The Heroku process uses `npm start`.
- Keep eight legacy Hubot packages and replace `hubot-appearin`, `hubot-maps`, and `hubot-shipit` with maintained local commands. The video-room command creates HTTPS Jitsi links because appear.in has become Whereby; map and directions commands use HTTPS Google Maps URLs, with inline directions still available when a Google API key is configured; shipit uses checked HTTPS image links. `scripts/load-legacy-scripts.js` loads the remaining CoffeeScript commands directly because Hubot 14 silently skips `.coffee` files passed through the packages' old wrappers. A smoke test now verifies commands from all eight packages and all three replacements.
- Replace the old TinyURL package call with HTTPS, response validation, a five second timeout, and a fallback to the original link. The unit test no longer calls the public service. A manual HTTPS check also returned a short link for a generated welcome template.
- Replace Slack RTM channel lookup with the current Conversations API and native channel mention IDs. Preserve references to plain `#channel` names. Reconnection monitoring now uses socket events instead of scraping log output.
- Correct event group lookup for organizer emails and scheduled channel reminders. Use the Meetup event URL for the welcome email link's group slug and event ID, rather than the Firestore document ID. Send welcome notices with separate room and message arguments.
- Support configured Slack user IDs for organizers, channel welcomers, and tweet approval. Legacy mappings remain as fallbacks. Configure current group and channel IDs before production use.
- Delay the daily greeting until the Firestore fetch succeeds, and cache each reminder stage to prevent repeated same day announcements. Missing or malformed Firebase configuration now produces an error that handlers can report. Set `FIRESTORE_EMULATOR_HOST` for local integration testing.
- Add `.env.example`, ignore `.env`, document local startup, add lint and audit CI gates, and expand the Jasmine suite for these behaviors.

## Changes in the other local checkouts

| Repository and local branch | Changes |
| --- | --- |
| `api` — `fix/security-runtime` | Replaced deprecated `netlify-lambda` with native Netlify function bundling, updated Firebase Admin and CLI dependencies, set Node 22 and a dedicated public directory, repaired Firestore emulator port 8085, rebuilt its emulator image on Java 21 without mounting host Firebase credentials, removed credential fragments from diagnostic output, protected manual sync with `POST` and `SYNC_SECRET`, and added `DATA_SYNC_OWNER` to disable API writes when website owns the collections. Package overrides removed low/moderate deepmerge and uuid advisories in development tooling. |
| `website` — `fix/security-quality` | Upgraded Next.js and Firebase Admin, switched to modular Admin imports, fixed an `ical2json` import, made a failed or malformed Meetup feed abort the full replacement, added unit tests, and supported credential-free emulator testing. |
| `newsletter-events` — `fix/browser-deps-xss` | Replaced the obsolete Firebase browser SDK with a public Firestore REST read, bundled the updated Moment browser file locally, and preserved direct GitHub Pages hosting. Event names render as text and only HTTP(S) links become anchors. Added three unit tests. |
| `slide` — `fix/security-runtime` | Replaced `live-server` with Vite, bundled Bootstrap CSS, removed unused jQuery/Popper/Bootstrap scripts, updated Bootstrap class names, replaced broken Nuxt image URLs with a local placeholder, and configured the Netlify build. |
| `sign-in-sheet` — `fix/title-rendering` | Renders the user-entered title as text, clamps page count to at least one, and adds a rendering regression test. |
| `slackin-redirect` — `fix/http-redirect-docs` | Adds a forced HTTP 302 for the shared Slack invite and corrects the README's outdated Heroku description. |

The old `www` and `slackin` application checkouts remain unchanged because their live public addresses now resolve through the newer website and static invite service. The admin confirmed that `www` and `api` are no longer used in production. The old Slackin repository also exposes badge and live user count endpoints; check for callers before retirement. The resource and webfont repositories contain no runtime dependencies. `promotion` already passes its 19 tests and dependency audit.

## Verification performed

| Check | Result |
| --- | --- |
| Clean `npm ci` on Node 24 | Passed |
| `slackbot` Jasmine unit suite | 41 specs passed, including X v2 posting helper success, missing credentials, API failure, configured channel ID routing, maps, and video rooms. |
| `slackbot` legacy command smoke | Ten commands passed with a real local Hubot robot, covering the eight retained legacy packages and three local replacements. This includes the CoffeeScript loader path that previously skipped several commands. |
| `slackbot` lint | Passed after the final clean install. |
| Local `npm audit` | 0 findings after the final clean install. |
| `npm start -- --config-check` with dummy Slack tokens | Passed; all local and external scripts loaded. The HTTP route warning is expected in this disabled HTTP check. |
| Firestore emulator | Passed: an API shaped event in `events` was read by `slackbot` as `group: catech` with its Meetup URL and document ID. |
| `api` unit suite | 8 suites, 26 tests passed after the dependency overrides; lint and native Netlify bundling passed. Its Firebase CLI also launched and stopped the Firestore emulator during the bot stack rehearsal. Production dependency audit: 0 findings. |
| `api` local function server | Unauthenticated manual sync returned HTTP 401. Only four intended functions were packaged. |
| `api` Docker Compose | Both images built. An authorized group sync wrote 11 groups into the containerized Firestore emulator and returned HTTP 200; with `DATA_SYNC_OWNER=website`, the same endpoint returned HTTP 409. Containers were shut down after testing. |
| `website` unit suite, lint, build, audit | 3 tests passed, lint and Next.js production build passed, 0 audit findings. |
| Firestore stack integration | Website sync wrote 7 events, 11 groups, and 7 sponsors to a local emulator. Slackbot fetched 5 upcoming events; newsletter reader fetched all 7. Event fields had the expected types. |
| `newsletter-events` | 3 tests and 0 audit findings; the page displayed five current public Firestore events in a local browser preview. |
| `slide` | Vite build passed with local placeholder asset; 0 audit findings. |
| `sign-in-sheet` | 2 title and page count regression tests passed. |
| `promotion` | 19 existing tests passed; 0 audit findings. |
| Live Slack | Socket Mode connection, both event reply commands, the approved tweet failure path, and a corrected cross-channel reference passed in Lansing Codes System. Other live commands remain to be checked. |
| Live X | Passed: the approved Slack command posted to the isolated `@snarkykatx` account and the exact text was visible on its profile. |
| Staging and production deployment | Not tested; deployment settings and admin review are still needed. |

### Local stack rehearsal

`npm run test:stack` now starts the sibling API repository's Firestore emulator under the isolated `demo-lansingcodes` project. It seeds a temporary event and drives the real Hubot message handlers with simulated Slack users and channels. The rehearsal passed seven checks: upcoming event listing, group-specific event link, scheduled announcement to a configured channel, cross-channel reference, join notice to a configured welcomer, rejected tweet by an unapproved user, and an approved tweet delivered to a simulated X client. The emulator shut down cleanly afterward. This needs Node 24 and dependencies installed in both the `api` and `slackbot` checkouts; no service tokens are used.

The rehearsal verifies bot logic and its Firestore read contract. It does not test Slack's Socket Mode connection, live scopes and membership, X posting, or scheduled jobs across restarts. A separate local smoke test verifies command registration and representative replies for the legacy integrations; their external services and Slack permissions still need live checks.

### Isolated Slack workspace setup

On October 28, 2026, the contributor created the `Lansing Codes System` workspace. A `Lansing Codes Slackbot Test` app was created there using [`configuration/slack-test-app.yaml`](configuration/slack-test-app.yaml), installed into that workspace, and joined to `#new-channel` and `#upcoming-events`. Its app-level and bot tokens are stored in the host's GNOME Keyring under `service=lansingcodes-slackbot-test` with `token=app` and `token=bot`; no token is in this checkout. Slack accepted both credentials, and the local bot logged in as `@lansing_test_bot` and connected through Socket Mode. The user sent `upcoming events` and `next devops event` in `#upcoming-events`. The bot replied with the demo event list and its link, proving the Slack event path and Firestore read with a real workspace. The launcher checks the workspace ID before connecting and sets test organizer, welcomer, and tweeter IDs. Other live commands and downstream integrations still need acceptance checks.

The Slack adapter changes Hubot's primary name to the Slack bot username after authentication. In this workspace that name is `lansing_test_bot`, so plain `slackbot tweet ...` initially did not match Hubot's `respond` pattern. `bin/hubot` now defaults `HUBOT_ALIAS=slackbot`, preserving the historical command prefix regardless of Slack's assigned username. After a restart, the approved test user sent `slackbot tweet local test` and received `Tweet failed. :-( Error: X API credentials are not configured`. No X post was made. The event help text also now says `next GROUP event` so Slack does not escape angle brackets as `&lt;` and `&gt;`.

A live `#social` reference from `#upcoming-events` exposed a hard-coded production Slack domain in the generated message link. The referencer now uses the URL returned by the connected Slack workspace. A second live reference produced a link under `lansingcodessystem.slack.com`, and the unit suite checks the same behavior. Scheduled event notifications now accept `EVENT_ANNOUNCEMENT_CHANNEL_ID` and `EVENT_GROUP_CHANNEL_IDS` so workspace-specific channel IDs can be configured without changing their existing channel-name defaults.

The user created the `@snarkykatx` X test account. The old `twitter-node-client` v0.0.6 integration has been replaced locally by `twitter-api-v2` and the supported X v2 Post endpoint while retaining the four existing `TWITTER_*` configuration names and command behavior. Unit tests cover posting, missing credentials, and API failure without a network call. The app has user access with Read and write permission as described in [X's Post API quickstart](https://github.com/xdevplatform/docs/blob/main/x-api/posts/manage-tweets/quickstart.mdx). Its credentials are in the host keyring. On October 28, the approved test user sent `slackbot tweet Lansing Codes Slackbot integration test 2026-10-28` in `#upcoming-events`; the bot replied `Tweet sent!`, and the exact text appeared publicly on [@snarkykatx](https://x.com/snarkykatx/status/2115352418552512991). This verifies the Slack command, approval mapping, X user authentication, and X v2 Post API together.

X currently advertises pay-per-use developer access and lists [Post Create at $0.015 per API request](https://developer.x.com/). The contributor funded the isolated `@snarkykatx` developer account with $5 and received $5 in promotional credits, giving the test account a $10 balance. The app's permission is Read and write, and its OAuth 1.0a user credentials are stored in GNOME Keyring. The OAuth 2.0 Client ID and Client Secret cannot be used alone for posting; OAuth 2.0 user access and refresh tokens would require an additional flow and token rotation support. Admins should separately decide whether to fund production API access. Do not work around API access with browser automation of an account session.

The contributor completed Developer Program enrollment and created an app in the pay-per-use project. The OAuth 1.0a Consumer Key, Consumer Key Secret, Access Token, and Access Token Secret are now saved in GNOME Keyring using `bash scripts/save-x-test-credentials.sh`. The separate OAuth 2.0 Client ID and Client Secret are also stored there using `bash scripts/save-x-oauth2-app-credentials.sh`; the current bot does not use those two values to post. The local launcher loads all four OAuth 1.0a values into the `TWITTER_*` variables. A restart confirmed that the bot received all four and connected to Lansing Codes System, the 41 unit tests now pass, and the real post succeeded. Do not paste credentials in Slack, chat, source, or this report.

These checks show that the local code loads and its tested paths work. They do not prove that each legacy script's external service still accepts its calls or that the deployed app has the required Slack scopes. Jitsi requires the person creating a room to sign in; guests can join without an account. Maps links work without a key, while inline turn-by-turn directions still require `HUBOT_GOOGLE_API_KEY`. Map style prefixes remain accepted, but the no-key Google Maps URL may not open directly in the requested satellite, terrain, or hybrid view.

## Stack work needed before deployment

1. **Verify the production `website` data sync.** The admin identified [`website`](https://github.com/lansingcodes/website) as the deployed site and replacement for `api` and `www`. Its Netlify scheduled function calls `/api/sync/all` every two hours and its own routes write Firestore. The website sync now aborts on failed or invalid Meetup feeds so it will not delete existing events on a partial fetch. Confirm that the production schedule, credentials, and monitoring work, and compare Firestore counts before and after a staging rehearsal. The old `api` writer should remain inactive; if its endpoint is still reachable, identify callers before disabling it.
2. **Complete test workspace configuration.** The isolated Slack app and basic event replies work. Continue testing channel membership, member join notices, organizer emails, and current ID mappings, then have admins approve corresponding production IDs and scopes. The bot needs membership in the channels it posts to, or `chat:write.public` where appropriate. Slack documents [Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/), [channel posting](https://docs.slack.dev/reference/methods/chat.postMessage/), and [Conversations API scopes](https://docs.slack.dev/reference/methods/conversations.list/).
3. **Verify the remaining commands in a test workspace.** Event replies, cross channel references, and X posting to the test account passed live checks. Test scheduled reminders, new participant notices, welcome template delivery, the eight retained legacy packages, and the three replacement commands. Their local smoke test passed, but external service behavior and Slack permissions remain unverified. Confirm that Jitsi room creation works with the organization's chosen host account and that Google Maps links meet the requested map-style behavior.
4. **Review event content and persistence.** The welcome email still contains old venue, food, phone, and topic placeholders. Admins should update the copy and current organizer mappings. The event notification cache is stored in Hubot's brain; verify a persistent brain is configured on the deployment or repeated announcements may occur after a restart. This may require Redis or another shared store.
5. **Validate deployment.** Use Node 24 in the hosting environment, provide secrets through host configuration, and confirm process restart after a missed Slack reconnect. The local branch updates CircleCI, but its Heroku deployment job and the production host were not exercised. Heroku currently supports Node 24 and recommends specifying the major version in `engines` ([Heroku Node support](https://devcenter.heroku.com/articles/nodejs-support)).
6. **Plan to replace the remaining legacy plugin packages.** Eight still use the CoffeeScript compatibility loader; several declare peer support only for older Hubot versions. `.npmrc` uses `legacy-peer-deps=true` so clean installs are reproducible. The local smoke test captures representative behavior. Replace or maintain the packages as modern Hubot modules after full acceptance tests, then remove this compatibility setting.
7. **Keep the `api` repair as a contingency, not a deployment step.** Its local branch fixes the emulator port, packaging, and authentication, and the Docker Compose rehearsal passed an authorized write and writer-disabled check. The admin says this repository is no longer used in production. Do not deploy it alongside `website`; retain the repair only if a remaining caller or rollback plan requires it. If an old API deployment still exists, retire it after checking callers and revoking unneeded secrets.
8. **Retire unused applications after an admin check.** The admin says the old `www` repository no longer powers production. The live `www.lansing.codes` response identifies Next.js, and its home, code of conduct, and sponsor signup routes returned HTTP 200. The live `slack.lansing.codes` response is a static Netlify invite page, while `slackin` is the old Heroku invite service with badge and live user count features. Check for old site endpoints, embedded badges, or external clients before archiving repositories and disabling deployments. The shared Slack invite followed a redirect to Slack but returned HTTP 403 to an automated client; verify it in a browser with an admin account.

### Recommended rollout order

1. **Verify the current writer and protect data.** `website` is the production writer for `events`, `groups`, and `sponsors`; its output passed the emulator contract test. Back up Firestore before any production full-replacement sync. Rehearse changes in staging, compare document counts and representative records, and confirm that slackbot and newsletter-events still read them. Confirm the website's two-hour scheduled sync actually runs and that failures are monitored. Check whether an old `api` deployment is still reachable and disable it after confirming no callers remain.
2. **Finish the isolated live tests.** The separate Slack workspace and app are configured; both event commands, cross channel references, and a public X test post passed. Complete the remaining Slack commands and joins. Keep API credentials in an owner-only keyring, never in a repository or this report.
3. **Run acceptance checks before a PR.** Exercise core messages, channel references, joins, reminders, organizer emails, tweet approval/posting, reconnects, and the eleven legacy capabilities in the test workspace. Restart the bot and verify reminders are not repeated; configure a persistent Hubot brain if needed. Replace any remaining script whose external service no longer works while preserving its user-facing purpose.
4. **Review and release in stages.** Have admins review the local branches and report, then authorize PRs. Run CI and dependency audits on the proposed revisions. A merge to `website/main` deploys to Netlify staging; its `Deploy to production` GitHub Actions workflow manually deploys `main` to the Netlify production site after required environment approval. Verify secrets, function authorization, scheduled sync, and bot restart behavior in staging. Promote with a Firestore backup and rollback plan after staging passes. Deploy slackbot separately with Node 24.
5. **Close legacy risk.** Confirm no deployment or clients still depend on old `api`, `www`, or `slackin` routes, including badges. Archive or remove their deploys only after that check; otherwise migrate the remaining feature first. Treat legacy repository advisories as retirement work and prioritize code scanning on the active `website` and `slackbot` repositories.

## Security and quality alert inventory

GitHub alert counts below are **open alerts on the repositories' remote default branches**, captured October 28, 2026. They will not reflect this local branch until maintainers review and merge it. `npm audit` counts vulnerable packages in the local lockfile, so its totals are not directly comparable with GitHub's advisory counts.

| Repository | Open Dependabot alerts on remote `main` | Current local audit | Action |
| --- | ---: | ---: | --- |
| [`slackbot`](https://github.com/lansingcodes/slackbot) | 66 (8 critical) | **0 after local repairs** | Review this branch and run CI in a private test workspace. |
| [`api`](https://github.com/lansingcodes/api) | 269 (11 critical) | **3 moderate** in Firebase CLI/OpenTelemetry development tooling; **0 in production dependencies** | The remaining issue has no patched compatible OpenTelemetry 1.x release in the current Firebase CLI dependency path. Avoid forcing a major SDK override without a tested upstream fix. Admin says this repo is retired from production; verify no old deployment or callers remain, then retire it. |
| [`website`](https://github.com/lansingcodes/website) | 144 (6 critical) | **0** | Next.js and Firebase Admin upgraded; build, tests, and emulator sync passed. |
| [`www`](https://github.com/lansingcodes/www) | 198 (5 critical) | 141 (6 critical), unchanged legacy checkout | Admin says `website` replaced it in production. Confirm no remaining Nuxt deployment or route before archiving; if still used, migrate its remaining behavior first. |
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
- Verify `website` is the only production Firestore sync owner, check the Slack shared invite in a browser, and confirm legacy app retirement before a coordinated deployment.

The earlier report was shared on Slack by the contributor. Later PRs and personal staging results are recorded above. The original `tinyurl-hardening` checkout remains untouched.
# Personal staging verification (October 28, 2026)

The contributor created a **separate personal test environment**. Firebase
project `lansing-codes-test-staging` and Netlify site
<https://lansingcodes-test-staging-rhamenator.netlify.app/> are owned by the
contributor; neither is Lansing Codes production or the organization's
staging deployment. The Netlify site uses the `staging/website-safe-sync`
branch of the public `rhamenator/lansingcodes-local-stack-backup` repository.
The site is currently deployed through Netlify CLI, without a Git link.

Local website checks passed: lint, nine unit tests, Next build, Firestore
emulator sync safety test, and a zero-finding npm audit. A separate Firestore
rules emulator test confirmed public reads of `events`, `groups`, and
`sponsors`, denial of client writes, and denial of other collection reads.
These rules were published **only** to the personal Firebase project. A live
Firebase client then read 5 events, 11 groups, and 7 sponsors; a private read
and client write were denied. The Netlify `scheduled-sync` function ran on
Node 22 and reported success, and an unauthenticated `/api/sync/all` request
returned HTTP 401. A local PR #100 bot connected to the separate Lansing Codes
System Slack workspace, read a temporary `stagingcheck` event from the
personal Firebase project, and returned its unique event link in response to
`next stagingcheck event`. The temporary event was removed afterward.

The website and bot PRs should identify this as **personal staging evidence**,
not as a production validation. Administrators still need to run their own
deployment and acceptance checks against Lansing Codes' managed staging and
production environments.

To isolate merge dependencies, a clean local checkout of the current
`lansingcodes/website` `main` (`38bacdd`) merged website PR #18 (`6827e42`)
and then PR #19 (`c1dfd83`) without conflicts. On that exact merge result,
`npm ci`, `npm run build` (lint plus 9 unit tests), `npm run test:stack`, and
`npm audit --audit-level=low` passed with 0 audit findings. Slackbot PR #100's
8-check stack smoke also passed against that merged website checkout,
including the notification restart check. PR #19 is based on #18, so #18 must
merge first and #19 must then be retargeted to `main`. The personal staging
site includes an additional mobile title contrast fix and does not represent
the exact code of either organization PR by itself. Verification details are
recorded in comments on [website #18](https://github.com/lansingcodes/website/pull/18#issuecomment-6485931011),
[website #19](https://github.com/lansingcodes/website/pull/19#issuecomment-6485935525),
and [slackbot #100](https://github.com/lansingcodes/slackbot/pull/100#issuecomment-6485938134).
