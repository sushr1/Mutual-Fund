# Handoff: Loan Against Mutual Funds (LAMF) — Mobile App

## Overview
A fully-digital mobile app that lets a customer borrow against their mutual-fund
portfolio without redeeming units. The journey: digital onboarding → KYC →
portfolio fetch → eligibility → **lender comparison** → loan selection → eSign &
pledge → instant disbursement → dashboard → MTM / margin-call monitoring.

The prototype is an iOS phone app (single-column, portrait, 402 × 874 pt logical
canvas). It is a clickable state machine — one "screen" is shown at a time and
navigation advances the state.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working
prototype that shows intended look, copy, and behavior. They are **not production
code to copy verbatim**. The task is to **recreate these designs in your target
environment** (React Native, Flutter, SwiftUI, Jetpack Compose, etc.) using that
stack's established components, navigation, and state patterns. If no app
environment exists yet, pick the framework that best fits the project and
implement there.

- `LAMF App.dc.html` — the source prototype (a "Design Component": an HTML template
  + a small JS logic class holding state and financial calculations). **Read the
  logic class** — it is the single source of truth for the numbers and flow.
- `LAMF App (standalone).html` — the same prototype bundled into one self-contained
  file. **Open this in a browser** to click through all screens. Use the on-screen
  flow, or the logic hook `window.__lamfGo('<screen>')` in the console to jump to any
  screen (`welcome`, `login`, `otp`, `verify`, `fetch`, `eligible`, `lenders`,
  `loan`, `review`, `success`, `dash`, `mtm`).
- `ios-frame.jsx` — the device bezel/status-bar scaffold only. **Not part of the
  product** — your platform provides the real chrome. Ignore for implementation.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are
all specified below and present in the files. Recreate the UI pixel-accurately
using your codebase's component library, then wire it to real backend integrations.

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| Ink | `#16243B` | Primary text, headings |
| Muted | `#65718A` | Secondary text, labels |
| Faint | `#97A1B5` | Tertiary text, captions, hints |
| Line | `#E7EBF1` | Card borders, hairlines |
| Divider | `#EDF0F4` | Inner row dividers |
| Background | `#EDF0F4` | Light screen background |
| Card | `#FFFFFF` | Cards, inputs, list rows |
| Field tint | `#F1F4F8` | Lender logo chips |
| **Brand teal** | `#0E6E62` | Primary actions, key figures, accents |
| Brand teal dark | `#0A544A` / `#0A4A42` | Gradient ends, hover |
| Brand tint | `#E7F1EF` | Selected/positive chip backgrounds |
| Mint | `#5FE3C4` / `#7FE9CF` | Accents on dark screens |
| Positive green | `#128A5E` | "Verified", positive status dots |
| Dark gradient | `#0C4F47 → #0A3D39 → #072B2A` | Welcome & Success screens |
| Alert orange | `#C2410C` | Margin-call primary, errors |
| Alert orange dark | `#9A3208` | Margin-call gradient end |
| Alert tint | `#FBF1E7` | Margin-call banner bg (light) |
| Alert border | `#F0D9BE` | Margin-call banner border |
| Alert text | `#7A3908` / `#A56523` | Margin-call banner text |

### Typography
- **Primary family:** `Hanken Grotesk` (weights 400/500/600/700/800).
- **Mono family:** `IBM Plex Mono` (500/600) — used only for the step eyebrow
  ("STEP 4 OF 7"), small uppercase labels, logo-chip initials, and IDs.
- Numbers use `font-variant-numeric: tabular-nums`.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero (welcome/eligible/success) | 40–46px | 800 | letter-spacing −0.5 to −1px |
| Screen title | 28px | 700 | letter-spacing −0.4px |
| Big figure (amounts) | 34–46px | 800 | tabular-nums |
| Card stat value | 21–23px | 800 | |
| Body / list value | 15px | 600–700 | |
| Body text | 15px | 400 | line-height 1.5 |
| Label / secondary | 13–14px | 400–600 | |
| Caption / hint | 11.5–12.5px | 400 | Faint color |
| Mono eyebrow | 11px | 500 | uppercase, letter-spacing 1.5px, brand teal |

### Spacing, radius, shadow
- Screen horizontal padding: **24px** (dashboard 22px). Header top padding **64px**
  (to clear status bar / notch). Bottom CTA area padding **30px** bottom.
- Radius: inputs/buttons **16px**; cards **16–18px**; hero/big cards **20–24px**;
  device frame **48px**; pills/dots **999px**.
- Card shadow: `0 1px 3px rgba(20,36,59,0.04–0.10)`.
- Primary CTA shadow: `0 6px 16px rgba(14,110,98,0.26)`.
- Hero card shadow: `0 10–12px 24–28px` of the card's brand color at ~0.2 alpha.
- Primary CTA height **54px** (welcome/success use full-width **56px**, white on dark).

### Currency
Indian numbering, e.g. `₹18,40,000` (`Number.toLocaleString('en-IN')`, prefixed `₹`,
rounded to whole rupees).

---

## Core Data & Financial Logic
(Authoritative values — see the logic class in `LAMF App.dc.html`.)

- **Portfolio value:** ₹18,40,000, from 5 holdings:
  - Parag Parikh Flexi Cap — PPFAS — ₹5,60,000 (30%)
  - Axis Bluechip Fund — Axis — ₹4,20,000 (23%)
  - Mirae Asset Large Cap — Mirae — ₹3,85,000 (21%)
  - HDFC Mid-Cap Opportunities — HDFC — ₹2,95,000 (16%)
  - ICICI Pru Balanced Advantage — ICICI Pru — ₹1,80,000 (10%)
- **Eligibility:** `eligible = portfolio × LTV`. Display max uses 60% = **₹11,04,000**.
  Per-lender LTV can differ (see below); the loan slider max = selected lender's eligible.
- **Loan amount:** default ₹6,00,000. Slider min ₹25,000, max = eligible, step ₹5,000.
- **Monthly interest (interest-only):** `amount × rate% ÷ 100 ÷ 12`.
  e.g. ₹6,00,000 @ 9.75% → ₹4,875/mo.
- **Dashboard:** Outstanding = loan amount; Drawing Power = eligible; Available =
  DP − Outstanding; LTV = Outstanding ÷ Portfolio (e.g. 32.6% at default).
- **MTM / margin-call scenario:** portfolio drops to ₹9,40,000 → DP = ₹5,64,000 →
  shortfall = Outstanding − DP = **₹36,000**, LTV = 63.8% (breaches 60% cap).

### Lenders (marketplace)
Sorted by lowest rate. `rate` is p.a.; `maxLTV` drives that lender's eligible amount.
| Lender | Rate | Max LTV | Processing fee | Disbursal | Badge |
|---|---|---|---|---|---|
| IDFC FIRST Bank | 8.99% | 60% | ₹0 | ~3 min | Lowest rate |
| HDFC Bank | 9.50% | 60% | ₹999 | ~5 min | — |
| ICICI Bank | 9.75% | 60% | ₹999 | ~5 min | — |
| Kotak Mahindra | 9.99% | 55% | ₹1,499 | ~8 min | — |
| Bajaj Finserv | 10.50% | 60% | ₹1,999 | instant | Fastest |

The selected lender's rate flows into the loan, review, success and dashboard screens.

---

## Screens / Views
The journey is **7 numbered steps** (login→review) plus welcome, success, dashboard,
and margin-call. Every flow screen has a 38px circular white back button (top-left,
shadow `0 1px 3px rgba(20,36,59,.1)`) and most end in a full-width primary CTA pinned
to the bottom.

1. **Welcome** (`welcome`) — dark gradient hero. Logo tile, mono eyebrow "LOAN
   AGAINST MUTUAL FUNDS", headline "Your funds stay invested. Your cash arrives in
   minutes.", value-prop chips (Paperless · Instant disbursal · No foreclosure fee),
   white "Get started" CTA → login, "Sign in" link → dashboard.
2. **Mobile login** (`login`) — Step 1/7. `+91` prefix + 10-digit numeric input
   (default `9876543210`). Encryption/consent reassurance note. "Send OTP" CTA
   disabled until 10 digits → otp.
3. **OTP** (`otp`) — Step 1/7. Six filled digit boxes (teal border), "Code auto-read
   from SMS" note, resend countdown `00:24`. "Verify & continue" → verify.
4. **KYC** (`verify`) — Step 2/7. Four verified cards: Aadhaar (UIDAI), PAN (NSDL),
   Bank account (Penny-drop / NPCI), Consent & CKYC (eSign). Each shows a mono code
   chip + green "Verified". Consent footnote. "Continue to portfolio" → fetch.
5. **Portfolio** (`fetch`) — Step 3/7. "Fetched securely from MF Central". Teal hero
   card with total portfolio value. Holdings list (name, AMC · units, value, weight
   bar). "Check eligibility" → eligible.
6. **Eligibility** (`eligible`) — Step 4/7. Centered white card: "Maximum eligible
   loan" + big teal figure + "60% LTV approved" pill (pop animation). Breakdown rows:
   Portfolio value, LTV cap 60%, Interest from 8.99% p.a., Partner lenders 5 banks.
   "Compare lenders" → lenders.
7. **Choose lender** (`lenders`) — Step 5/7. "Live offers refreshed today" note.
   Cards (sorted by rate) — logo chip + name + optional badge ("Lowest rate"/"Fastest"),
   "Up to ₹X", big rate; footer row Max LTV / Processing / Disbursal. Selected card
   gets a 2px teal ring. CTA "Continue with {lenderName}" → loan.
8. **Loan selection** (`loan`) — Step 6/7. Tappable lender chip (shows selected bank +
   rate, "Change" → lenders). Big live amount, range slider (accent teal). Tenure
   2×2 grid (6/12/24/36 months; selected = teal radio check). Interest rate + monthly
   interest rows. Interest-only / no-foreclosure note. "Review & confirm" → review.
9. **Review & eSign** (`review`) — Step 7/7. Summary rows: Loan amount, Tenure,
   Interest (rate · monthly), Lender, Disbursed to (HDFC Bank ••6021), Units pledged
   (5 schemes · lien marked). Consent checkbox (toggles enabled state). "Secured by
   Aadhaar eSign" note. CTA "eSign & disburse ₹X" — **disabled until checkbox on** →
   success.
10. **Success** (`success`) — dark gradient. Animated check badge, "Disbursed to
    HDFC Bank ••6021", big amount "is on its way", Loan ID `LAMF-9XK4-2271`, IMPS
    note. White "Go to dashboard" CTA → dash.
11. **Dashboard** (`dash`) — Avatar + greeting + notification bell (red dot). Teal
    hero: Loan outstanding, "via {lender}", LTV chip, utilisation bar + "X% of
    drawing power used / ₹Y free". Quick actions (Draw more → loan, Repay, Statement).
    Amber "Margin-call simulation" card → mtm. "Loan health" + "MTM monitoring active".
    2-col metric grid: Portfolio value, Drawing power, Available limit, Current LTV,
    Interest rate, Next interest. "Today's NAV refresh" status card.
12. **Margin call / MTM** (`mtm`) — Orange gradient hero: "Margin call raised",
    "Shortfall to cover ₹36,000", resolve-by deadline. Rows: Portfolio value (↓),
    Revised drawing power, Loan outstanding, Current LTV (breached, orange).
    Resolution options (Repay shortfall, Pledge more units). Auto-liquidation +
    SMS/email/WhatsApp notice. Orange "Resolve now" CTA → dash.

---

## Interactions & Behavior
- **Navigation:** linear forward flow welcome→…→success→dash, plus back buttons and
  lateral jumps (dashboard ↔ loan, dashboard → mtm, loan → lenders). Recreate with
  your platform's navigation stack.
- **Validation:** Mobile "Send OTP" disabled until exactly 10 digits. Review "eSign"
  disabled until consent checkbox is checked. Disabled CTA = `#C9D2DE` bg, no shadow.
- **Live recalculation:** moving the amount slider or changing tenure/lender
  immediately recomputes the displayed monthly interest and all dependent figures.
- **Selection states:** tenure option and lender card show a teal radio/ring when
  selected; tapping a row selects it.
- **Animations:** eligibility card & success badge use a pop/scale-in
  (`scale .6→1.08→1`, opacity 0→1, ~0.5s ease). Keep subtle.
- **Loading states (to add for real backend):** OTP send, KYC fetch (UIDAI/NSDL/
  Penny-drop), MF Central portfolio fetch, eSign, and disbursement are all async —
  add spinners/skeletons. The prototype shows the resolved state only.

## State Management
State variables (see logic class): `screen` (current view), `mobile`, `amount`,
`tenure`, `agree` (consent checkbox), `lender` (selected lender id). Derived each
render: selected lender, rate, eligible, clamped amount, monthly interest, drawing
power, available limit, LTV, and the margin-call figures. Replace the in-memory
state with your app's store + real API calls.

## Backend Integrations (from the PRD — to implement, all mocked in the prototype)
- **UIDAI** — Aadhaar eKYC. **NSDL** — PAN validation. **NPCI Penny Drop** — bank
  account validation. **MF Central** — fetch MF holdings & NAV. **Partner Bank APIs**
  — eligibility, loan booking, disbursement (IMPS). **eSign** — Aadhaar eSign of loan
  agreement + lien/pledge marking via NSDL/CDSL. **SMS / Email / WhatsApp** —
  notifications (esp. MTM/margin calls).
- **MTM engine:** daily NAV refresh → recompute drawing power → raise margin call if
  outstanding > DP → notify → auto-liquidate per policy if unresolved by deadline.
- **Compliance:** RBI Digital Lending norms — explicit consent capture, signed consent
  artefact in an audit log, KFS (Key Fact Statement), encryption, OAuth-secured APIs.

## Assets
No raster images or external icons. All icons are inline SVGs (chevrons, checks,
bell, alert triangle, arrows, lock, info, clock, chart). Logo and lender marks are
simple SVG/monogram placeholders — **swap in your real brand assets and official
lender logos** (do not reproduce bank trademarks from this prototype). Fonts: Hanken
Grotesk + IBM Plex Mono (Google Fonts) — substitute with your design system's fonts
if different.

## Files
- `LAMF App.dc.html` — source prototype (template + logic class with all values).
- `LAMF App (standalone).html` — open in a browser to click through the full flow.
- `ios-frame.jsx` — device-bezel scaffold only; not part of the product.
