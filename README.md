# FolioCredit

FolioCredit is a mobile-first loan-against-mutual-funds origination application. It verifies an Indian mobile number, starts a consented Account Aggregator journey, retrieves a mutual-fund current-value summary, calculates server-signed drawing power, lets the customer select an amount, records mandatory risk acknowledgement, and creates a traceable application.

## Customer Journey

1. Enter PAN and approve account-discovery consent.
2. Enter full name, registered mobile number, and desired loan amount.
3. Verify the mobile number with an OTP.
4. Approve one-time mutual-fund data sharing through Setu Account Aggregator.
5. Retrieve the current-value summary and calculate configurable drawing power.
6. Select a loan amount and acknowledge market, margin-call, and liquidation risk.
7. Create a verified application with an immutable reference.

PAN alone never reveals holdings. The Account Aggregator discovers accounts using PAN and the registered mobile number, then shares data only after the customer approves its consent screen. The callback form stores only the PAN suffix, not the full PAN.

## Production Boundaries

This repository implements onboarding, consent, portfolio retrieval, server-side eligibility, amount selection, disclosures, and application intake. It does not sanction a loan, determine scheme-level haircuts, perform complete KYC or credit underwriting, create or enforce a lien, issue a KFS, execute loan documents, collect repayments, or disburse funds. Those functions require contracts and APIs from a regulated bank or NBFC and the relevant KYC, bank-validation, RTA/depository, eSign, and payment ecosystems.

See [`docs/brd-implementation.md`](docs/brd-implementation.md) for the requirement coverage and regulated-partner boundaries.

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
ELIGIBILITY_MAX_LTV=0.50
```

`APP_SIGNING_SECRET` must be a random value of at least 32 characters. `ELIGIBILITY_MAX_LTV` is capped by code at `0.60`; production policy must still apply scheme-level haircuts and lender rules. Never place credentials in browser code or commit them to Git.

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
