# Mutual-Fund

A high-fidelity mobile web app for a Loan Against Mutual Funds journey.

## Features

- Digital onboarding with mobile OTP validation
- KYC verification state
- MF Central-style portfolio fetch
- Eligibility calculation from portfolio value and lender LTV
- Lender comparison marketplace
- Loan amount slider with live monthly interest calculation
- Review and eSign consent gating
- Disbursement success state
- Loan dashboard with drawing power, available limit, LTV and interest metrics
- Margin-call / MTM simulation

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
