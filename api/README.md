[![Netlify Status](https://api.netlify.com/api/v1/badges/b772609a-aedb-45c7-8298-f4623db20ecc/deploy-status)](https://app.netlify.com/sites/lansingcodes-api-staging/deploys)

# Firebase-backed API for Lansing Codes

This repository consists of tooling to manage Firebase rules, indexes, etc. and
lambda functions deployed to Netlify to manage the data collected in Firebase.

## Local verification

Use Node.js 22 or later. Run `npm ci`, `npm run build`, and `npm run compile`.
The build runs lint and unit tests; compile runs a local Netlify build and
packages only the four files in `functions/`. `npm run dev` serves those
functions locally on port 9000. The Firestore emulator uses port 8085
(`firebase emulators:start --only firestore --project lansingcodes-dev`).
For the container path, run `docker compose up --build` with `SYNC_SECRET`
set in your shell. Published ports bind to the host loopback address;
stop the stack with `docker compose down`.

Set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` and
`FIREBASE_PROJECT=lansingcodes-dev` to test against the emulator. Production
functions require `FIREBASE_SERVICE_ACCOUNT`; keep it in the host or deployment
secret store. Manual `load-events`, `load-groups`, and `load-sponsors` calls
require `POST` with `Authorization: Bearer <SYNC_SECRET>`. Set `SYNC_SECRET`
in the deployment environment and in any trusted caller. The
`deploy-succeeded` function is invoked by Netlify's signed platform event.

The Netlify build now packages functions without deploying Firebase rules.
Run `npm run deploy` only when intentionally deploying rules and indexes.
Coordinate this repository's event and group sync with `website` so only one
writer owns those collections in each environment. API sync remains enabled
by default for existing deployments. Set `DATA_SYNC_OWNER=website` on the
API deployment when the website is designated the writer; this suppresses
the deploy event sync and makes the manual sync functions return HTTP 409.

## Code of Conduct

All participants are expected to treat others with respect and follow our [Code of Conduct](https://www.lansing.codes/code-of-conduct/).

## Using the data

The Lansing Codes data is publicly available. Here's the data model:

![Lansing Codes Data Model](https://i.imgur.com/L2Xl8zt.jpg)

To access the data, you must use a
[Firebase client](https://firebase.google.com/docs/firestore/quickstart#set_up_your_development_environment)
to connect to the Firebase Firestore of the appropriate environment.

### Firebase config

To access the data, you must configure your Firebase client to connect to the
right data store. The following list of publicly available data stores are
available.

All configurations are shown in JavaScript.

#### Staging

``` js
const firebaseConfig = {
  apiKey: "AIzaSyBukJRUN9wfHFnZc_fjBRRHNsLSCTxqhGQ",
  authDomain: "lansing-codes-staging.firebaseapp.com",
  databaseURL: "https://lansing-codes-staging.firebaseio.com",
  projectId: "lansing-codes-staging",
  storageBucket: "lansing-codes-staging.appspot.com",
  messagingSenderId: "36794992743",
  appId: "1:36794992743:web:2350879a650f171e"
}
```

#### Production

``` js
var firebaseConfig = {
  apiKey: "AIzaSyCMw8mZ1D1GAYpeotAqVCaYAMtn3URVOok",
  authDomain: "lansing-codes.firebaseapp.com",
  databaseURL: "https://lansing-codes.firebaseio.com",
  projectId: "lansing-codes",
  storageBucket: "lansing-codes.appspot.com",
  messagingSenderId: "647280182517",
  appId: "1:647280182517:web:779f72d0b90c0dd4"
}
```

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

You are welcome and encouraged to make changes to this repository by submitting
pull requests or forking our code to support your city of coders!

Before you get ahead of yourself, though, please read our
[Contributing Guide](https://github.com/lansingcodes/api/blob/main/.github/CONTRIBUTING.md).

## License

[Hippocratic 2.1](https://firstdonoharm.dev)

Copyright (c) 2015-present, Michigan Technology Network LLC
