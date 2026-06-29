# FolioCredit

FolioCredit is a mobile-first loan-against-mutual-funds onboarding application. It verifies an Indian mobile number, starts a consented Account Aggregator journey, retrieves a mutual-fund current-value summary, calculates an indicative eligibility amount, and records a verified callback request.

## Customer Journey

1. Enter PAN and approve account-discovery consent.
2. Enter full name, registered mobile number, and desired loan amount.
3. Verify the mobile number with an OTP.
4. Approve one-time mutual-fund data sharing through Setu Account Aggregator.
5. Retrieve the current-value summary and calculate an indicative 50% ceiling.
6. Submit a verified callback request.

PAN alone never reveals holdings. The Account Aggregator discovers accounts using PAN and the registered mobile number, then shares data only after the customer approves its consent screen. The callback form stores only the PAN suffix, not the full PAN.

## Production Boundaries

This repository implements onboarding, consent, portfolio retrieval, and an indicative estimate. It does not sanction a loan, determine scheme-level haircuts, perform complete KYC or credit underwriting, create or enforce a lien, execute loan documents, collect repayments, or disburse funds. Those functions require contracts and APIs from a regulated bank or NBFC and the relevant RTA/depository ecosystem.

`FolioCredit` is a provisional product name. Complete trademark, company-name, and domain clearance before launch.

## Required Services

### Twilio Verify

Create a Verify Service and configure:

```text
TWILIO_VERIFY_SERVICE_SID
TWILIO_API_KEY
TWILIO_API_SECRET
```

### Setu Account Aggregator

Create an FIU product in Setu Bridge, enable `MUTUAL_FUNDS` with `PROFILE` and `SUMMARY`, configure the production callback/webhook, and set:

```text
SETU_ENV=sandbox
SETU_CLIENT_ID
SETU_CLIENT_SECRET
SETU_PRODUCT_INSTANCE_ID
```

Change `SETU_ENV` to `production` only after Setu FIU onboarding and production approval.

### Application

Configure:

```text
APP_SIGNING_SECRET
APP_BASE_URL=https://your-domain.example
```

`APP_SIGNING_SECRET` must be a random value of at least 32 characters. Never place credentials in browser code or commit them to Git.

## Local Checks

```bash
node --check app.js
node build.mjs
```

For the complete serverless flow, use Netlify Dev so Functions and environment variables are available.

## Netlify

The repository includes `netlify.toml`. Connect the GitHub repository to Netlify or deploy with:

```bash
netlify deploy --prod --dir=dist --functions=netlify/functions
```

After changing environment variables, trigger a new production deployment.
