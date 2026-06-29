# LAMF BRD Implementation Map

This document converts the supplied LAMF BRD into a safe product boundary for FolioCredit. A checked-in UI is not evidence that FolioCredit may perform a regulated activity. Production enablement requires contracts, credentials, security review, legal review, and acceptance by the regulated lender.

## Product Principles

- Show an application state separately from eligibility, sanction, lien, and disbursal.
- Never infer or reveal holdings from PAN alone.
- Use explicit, revocable Account Aggregator consent for portfolio data.
- Keep full PAN, Aadhaar data, bank details, and portfolio payloads out of Netlify Forms.
- Calculate drawing power on the server and sign the result before accepting an application.
- Do not preselect consent or risk acknowledgements.
- Do not display invented lenders, APRs, fees, approval states, NAVs, KYC results, or disbursal promises.
- Provide the regulated lender's identity, KFS, APR, grievance channel, cooling-off terms, and recovery policy before contract execution.
- Apply scheme eligibility and haircuts before sanction. The configured headline LTV is only an upper policy bound.

## Requirement Coverage

| BRD module | Current implementation | Production dependency |
| --- | --- | --- |
| User registration | Mandatory PAN, name, email, registered mobile, OTP, consent | OTP provider production credentials, rate limits, fraud controls |
| Digital KYC | Represented as a pending lifecycle stage | RBI-regulated lender KYC policy and approved KYC/V-CIP provider |
| Customer profile | Minimal application profile and masked PAN suffix | Encrypted lender system of record, retention and deletion policy |
| Bank verification | Represented as a pending lifecycle stage | Penny-drop/account-validation provider and lender name-match rules |
| Mutual-fund portfolio | Setu AA consent and summary-data adapter | Setu FIU onboarding, production credentials, callbacks and FIP coverage |
| Portfolio valuation | Uses provider current-value summary | Approved NAV source, eligible-unit rules, lock-in and lienability checks |
| Eligibility | Server-side configurable LTV, hard-capped at 60%, signed portfolio token | Lender policy, scheme haircuts, concentration limits and credit rules |
| Loan selection | ₹50,000 minimum, accessible slider, verified maximum | Lender product limits and approved offer terms |
| Credit engine | No fake approve/reject result | Regulated lender underwriting and model governance |
| Pledge/lien | Represented as pending | RTA/depository/MF Central lender integration and customer authorization |
| Agreement and KFS | Required before disbursal, not fabricated | Lender document generation, KFS/APR, MITC, eSign and audit evidence |
| Disbursal | Explicitly blocked until prior stages complete | Partner-bank API and regulated lender controls |
| Customer dashboard | Lifecycle view for pre-sanction applications | Loan-account, repayment, accrual and portfolio-monitoring APIs |
| NAV and MTM | Product boundary documented | Business-day NAV feed, drawing-power engine, scheduler and alert service |
| Margin calls | Risk disclosed before application | Lender policy, cure period, notice workflow and liquidation controls |
| Closure and lien release | Product boundary documented | Loan ledger, repayment confirmation and RTA/depository release API |

## Before Production Launch

1. Contract with an RBI-regulated bank or NBFC and register FolioCredit as its approved lending service provider/digital lending application where applicable.
2. Complete lender-approved KYC, CKYCR, sanctions/PEP, fraud, bureau, bank-validation, and grievance workflows.
3. Complete Setu FIU production onboarding and verify mutual-fund FIP coverage.
4. Implement lender-owned product policy for scheme eligibility, haircuts, LTV, limits, APR, fees, tenor, margin-call cure periods, and liquidation.
5. Generate and present lender-specific KFS, sanction letter, loan agreement, MITC, privacy notice, and consent records before eSign.
6. Add immutable audit events for every consent, data fetch, decision, disclosure, document, lien, disbursal, MTM event, notice, payment, closure, and lien release.
7. Move applicant data from Netlify Forms to an encrypted, access-controlled system of record with retention, deletion, incident response, and reconciliation controls.
8. Complete application security, privacy, accessibility, resilience, capacity, DR, observability, and penetration testing before public acquisition.

## Regulatory References

- RBI Master Direction - Know Your Customer (KYC) Direction, 2016, as updated: https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11566
- RBI Annual Report discussion of Digital Lending Directions, KFS, lender-option display and dark patterns: https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436
- Sahamati Account Aggregator consent framework: https://sahamati.org.in/faq/
- Setu Account Aggregator integration: https://docs.setu.co/data/account-aggregator/quickstart
- SEBI materials describing pledge/lien restrictions and lender authority over pledged units: https://www.sebi.gov.in/sebi_data/mutualfundfile/jul-2018/1530853895651.pdf
