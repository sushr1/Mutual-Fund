# Mutual-Fund

A mobile web app for verified loan-against-mutual-funds enquiries. It collects user-entered details, verifies Indian mobile numbers with Twilio Verify, calculates an indicative estimate, and submits verified enquiries through Netlify Forms.

## Features

- User-entered name, mobile, portfolio value, and desired amount
- Real SMS OTP through Twilio Verify and Netlify Functions
- Indicative eligibility calculation using a conservative 50% estimate
- Netlify Forms submission after successful mobile verification
- Clear disclosures that an estimate is not a sanction or loan offer

This app does not perform KYC, fetch holdings, approve credit, create a lien, or disburse funds. Those capabilities require regulated providers and lender APIs.

## Run Locally

Use the bundled Node runtime in this Codex workspace:

```bash
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.mjs
```

Then open:

```text
http://127.0.0.1:4173
```

## Check

```bash
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server.mjs
```

## Deploy to Netlify

Create a Twilio Verify Service and set these environment variables in Netlify:

```text
TWILIO_VERIFY_SERVICE_SID
TWILIO_API_KEY
TWILIO_API_SECRET
APP_SIGNING_SECRET
```

Then connect the repository in Netlify or deploy the static files and functions with Netlify CLI:

```bash
npm run build
netlify deploy --prod --dir=dist --functions=netlify/functions
```

Dragging only `index.html`, `styles.css`, and `app.js` into Netlify Drop will not deploy the OTP functions. Keep all Twilio credentials in Netlify environment variables, never in browser code or this repository.
