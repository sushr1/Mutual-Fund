const portfolio = 1840000;
const state = {
  screen: "welcome",
  mobile: "9876543210",
  amount: 600000,
  tenure: 12,
  agree: false,
  lender: "idfc"
};

const screens = ["welcome", "login", "otp", "verify", "fetch", "eligible", "lenders", "loan", "review", "success", "dash", "mtm"];
const lenders = [
  { id: "idfc", name: "IDFC FIRST Bank", short: "IDFC", rate: 8.99, ltv: 0.60, fee: "₹0", disbursal: "~3 min", badge: "Lowest rate" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", rate: 9.50, ltv: 0.60, fee: "₹999", disbursal: "~5 min", badge: "" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", rate: 9.75, ltv: 0.60, fee: "₹999", disbursal: "~5 min", badge: "" },
  { id: "kotak", name: "Kotak Mahindra", short: "KOTAK", rate: 9.99, ltv: 0.55, fee: "₹1,499", disbursal: "~8 min", badge: "" },
  { id: "bajaj", name: "Bajaj Finserv", short: "BAJAJ", rate: 10.50, ltv: 0.60, fee: "₹1,999", disbursal: "instant", badge: "Fastest" }
];
const holdings = [
  { name: "Parag Parikh Flexi Cap", amc: "PPFAS Mutual Fund", units: "4,182.55 units", value: 560000, pct: 30 },
  { name: "Axis Bluechip Fund", amc: "Axis Mutual Fund", units: "6,920.10 units", value: 420000, pct: 23 },
  { name: "Mirae Asset Large Cap", amc: "Mirae Asset", units: "2,540.88 units", value: 385000, pct: 21 },
  { name: "HDFC Mid-Cap Opportunities", amc: "HDFC Mutual Fund", units: "1,980.42 units", value: 295000, pct: 16 },
  { name: "ICICI Pru Balanced Advantage", amc: "ICICI Prudential", units: "3,110.75 units", value: 180000, pct: 10 }
];
const tenureLabels = { 6: "6 months", 12: "12 months", 24: "24 months", 36: "36 months" };

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const selectedLender = () => lenders.find((l) => l.id === state.lender) || lenders[0];
const vals = () => {
  const lender = selectedLender();
  const eligible = Math.round(portfolio * lender.ltv);
  const amount = Math.min(state.amount, eligible);
  const monthly = amount * (lender.rate / 100) / 12;
  const available = eligible - amount;
  const ltv = amount / portfolio * 100;
  const crashedPortfolio = 940000;
  const crashedDp = Math.round(crashedPortfolio * 0.6);
  return { lender, eligible, amount, monthly, available, ltv, crashedPortfolio, crashedDp, shortfall: amount - crashedDp, crashedLtv: amount / crashedPortfolio * 100 };
};

function go(screen) {
  if (!screens.includes(screen)) return;
  state.screen = screen;
  render();
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function shell(html) {
  return `<section class="phone"><div class="screen">${html}</div></section>`;
}

const back = (target, label = "") => `
  <div class="back-row">
    <button class="back" data-go="${target}" aria-label="Back">
      <svg viewBox="0 0 9 16" fill="none"><path d="M8 1 1.5 8 8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>${label ? `<span class="label">${label}</span>` : ""}
  </div>`;

const row = (label, value) => `<div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>`;

function welcome() {
  return shell(`
    <div class="welcome">
      <div class="welcome-main">
        <div class="logo">⌁</div>
        <div class="mono" style="font-size:12px;letter-spacing:2px;color:var(--mint);text-transform:uppercase;margin-bottom:14px">Loan Against Mutual Funds</div>
        <h1 class="hero-title">Your funds stay<br>invested.<br>Your cash arrives<br>in minutes.</h1>
        <p style="font-size:16px;line-height:1.5;color:rgba(255,255,255,.72);margin:18px 0 0;max-width:300px">Borrow up to 60% of your portfolio value without redeeming a single unit. Fully digital, RBI-compliant.</p>
      </div>
      <div class="welcome-bottom">
        <div class="chips"><span>Paperless</span><span>Instant disbursal</span><span>No foreclosure fee</span></div>
        <button class="cta white" data-go="login">Get started</button>
        <div class="signin">Already a customer? <button data-go="dash">Sign in</button></div>
      </div>
    </div>`);
}

function login() {
  return shell(`${back("welcome")}
    <div class="scroll content">
      <div class="eyebrow">Step 1 of 7</div>
      <h1 class="title">Enter your mobile<br>number</h1>
      <p class="sub">We'll send a one-time password to verify it's you.</p>
      <label class="mobile-field"><span>+91</span><i class="divider-v"></i><input id="mobile" value="${state.mobile}" inputmode="numeric" maxlength="10" autocomplete="tel" aria-label="Mobile number" /></label>
      <div class="check-line"><span class="tick">✓</span><span>Your number is encrypted and never shared. Consent is captured per RBI Digital Lending guidelines.</span></div>
    </div>
    <div class="bottom"><button class="cta" data-go="otp" ${state.mobile.length === 10 ? "" : "disabled"}>Send OTP</button></div>`);
}

function otp() {
  const masked = state.mobile.replace(/(\d{5})(\d{0,5})/, (_, a, b) => `${a.replace(/\d/g, "•")} ${b}`);
  return shell(`${back("login")}
    <div class="scroll content">
      <div class="eyebrow">Step 1 of 7</div><h1 class="title">Verify OTP</h1>
      <p class="sub">Enter the 6-digit code sent to<br><b style="color:var(--ink)">+91 ${masked}</b></p>
      <div class="otp-grid">${["2","4","8","1","9","6"].map((d) => `<div class="otp-box">${d}</div>`).join("")}</div>
      <div style="display:flex;align-items:center;gap:7px;margin-top:20px;font-size:13px;color:var(--brand)"><span class="tick">✓</span>Code auto-read from SMS</div>
      <p style="font-size:14px;color:var(--faint);margin-top:24px">Resend code in <b style="color:var(--ink);font-variant-numeric:tabular-nums">00:24</b></p>
    </div>
    <div class="bottom"><button class="cta" data-go="verify">Verify & continue</button></div>`);
}

function verify() {
  const items = [
    ["AADH", "Aadhaar", "eKYC via UIDAI · XXXX XXXX 4471"],
    ["PAN", "PAN", "Validated via NSDL · ABCPK••••F"],
    ["BANK", "Bank account", "Penny-drop verified · HDFC ••6021"],
    ["CKYC", "Consent & CKYC", "eSign captured · 14:32 IST"]
  ];
  return shell(`${back("otp")}
    <div class="scroll content">
      <div class="eyebrow">Step 2 of 7</div><h1 class="title">Complete your KYC</h1>
      <p class="sub">Verified instantly against official registries. No documents to upload.</p>
      <div class="kyc-list">${items.map(([code, title, detail]) => `<div class="kyc-card"><div class="code-chip">${code}</div><div style="flex:1;min-width:0"><b>${title}</b><div class="label" style="margin-top:2px">${detail}</div></div><div class="verified"><span>●</span>Verified</div></div>`).join("")}</div>
      <div class="card" style="margin-top:18px;border-style:dashed;padding:14px 16px"><p class="hint" style="margin:0">Data fetched via UIDAI, NSDL & NPCI with your explicit consent. A signed consent artefact is stored in your audit log.</p></div>
    </div>
    <div class="bottom"><button class="cta" data-go="fetch">Continue to portfolio</button></div>`);
}

function fetchPortfolio() {
  return shell(`${back("verify")}
    <div class="scroll content">
      <div class="eyebrow">Step 3 of 7</div><h1 class="title">Your portfolio</h1>
      <div style="display:flex;align-items:center;gap:7px;margin-top:8px;font-size:13px;color:var(--muted)"><span class="tick">✓</span>Fetched securely from <b style="color:var(--ink)">MF Central</b></div>
      <div class="portfolio-hero"><div style="color:rgba(255,255,255,.75);font-size:13px">Total portfolio value</div><div class="big-figure">${inr(portfolio)}</div></div>
      <div class="holding-list">${holdings.map((h) => `<div class="holding-card"><div style="flex:1;min-width:0"><b>${h.name}</b><div class="label" style="font-size:13px;margin-top:2px">${h.amc} · ${h.units}</div><div class="bar"><i style="width:${h.pct}%"></i></div></div><div style="text-align:right"><div class="value">${inr(h.value)}</div><div class="hint">${h.pct}%</div></div></div>`).join("")}</div>
    </div>
    <div class="bottom"><button class="cta" data-go="eligible">Check eligibility</button></div>`);
}

function eligible() {
  return shell(`${back("fetch")}
    <div class="scroll content">
      <div class="eyebrow">Step 4 of 7</div><h1 class="title">You're eligible</h1>
      <p class="sub">Based on your current mutual fund portfolio and lender-approved LTV caps.</p>
      <div class="card eligible-card"><div class="label">Maximum eligible loan</div><div class="amount">${inr(Math.round(portfolio * 0.6))}</div><div class="pill">✓ 60% LTV approved</div></div>
      <div class="card" style="margin-top:18px;padding:6px 18px">${row("Portfolio value", inr(portfolio))}${row("LTV cap", "60%")}${row("Interest from", "8.99% p.a.")}${row("Partner lenders", `${lenders.length} banks`)}</div>
    </div>
    <div class="bottom"><button class="cta" data-go="lenders">Compare lenders</button></div>`);
}

function lenderCards() {
  return lenders.map((l) => `<button class="lender-card ${state.lender === l.id ? "selected" : ""}" data-lender="${l.id}">
    <div class="lender-top"><div class="logo-chip">${l.short}</div><div class="lender-main"><div class="lender-name">${l.name}</div><div class="hint">Up to ${inr(portfolio * l.ltv)}</div></div>${l.badge ? `<span class="badge">${l.badge}</span>` : ""}<div class="rate">${l.rate.toFixed(2)}%</div></div>
    <div class="lender-foot"><span><small>Max LTV</small><b>${(l.ltv * 100).toFixed(0)}%</b></span><span><small>Processing</small><b>${l.fee}</b></span><span><small>Disbursal</small><b>${l.disbursal}</b></span></div>
  </button>`).join("");
}

function chooseLender() {
  return shell(`${back("eligible")}
    <div class="scroll content">
      <div class="eyebrow">Step 5 of 7</div><h1 class="title">Choose your lender</h1><p class="sub">Live offers refreshed today. Select the option that fits your rate, fee and speed.</p>
      <div class="option-list">${lenderCards()}</div>
    </div>
    <div class="bottom"><button class="cta" data-go="loan">Continue with ${selectedLender().name}</button></div>`);
}

function loan() {
  const v = vals();
  return shell(`${back("lenders")}
    <div class="scroll content">
      <div class="eyebrow">Step 6 of 7</div><h1 class="title">Select loan amount</h1>
      <button class="lender-chip" data-go="lenders"><span class="logo-chip">${v.lender.short}</span><span style="flex:1"><b>${v.lender.name}</b><span class="label" style="display:block">${v.lender.rate.toFixed(2)}% p.a.</span></span><b style="color:var(--brand)">Change</b></button>
      <div style="margin-top:22px"><div class="label">Loan amount</div><div class="amount-live">${inr(v.amount)}</div><input id="amount" type="range" min="25000" max="${v.eligible}" step="5000" value="${v.amount}" /><div class="range-limits"><span>₹25,000</span><span>${inr(v.eligible)}</span></div></div>
      <div style="margin-top:22px"><div class="label" style="font-weight:700;color:var(--ink)">Tenure</div><div class="tenure-grid">${[6,12,24,36].map((m) => `<button class="tenure ${state.tenure === m ? "selected" : ""}" data-tenure="${m}"><span>${tenureLabels[m]}</span><span class="radio">${state.tenure === m ? "✓" : ""}</span></button>`).join("")}</div></div>
      <div class="card" style="margin-top:22px;padding:6px 18px">${row("Interest rate", `${v.lender.rate.toFixed(2)}% p.a.`)}${row("Monthly interest", `<span style="color:var(--brand)">${inr(v.monthly)}</span>`)}</div>
      <p class="hint" style="display:flex;gap:8px;margin-top:12px"><span class="tick">i</span><span>Pay interest-only monthly. Repay principal anytime with zero foreclosure charges.</span></p>
    </div>
    <div class="bottom"><button class="cta" data-go="review">Review & confirm</button></div>`);
}

function review() {
  const v = vals();
  return shell(`${back("loan")}
    <div class="scroll content">
      <div class="eyebrow">Step 7 of 7</div><h1 class="title">Review & sign</h1>
      <div class="card" style="margin-top:20px;padding:8px 20px">${row("Loan amount", inr(v.amount))}${row("Tenure", tenureLabels[state.tenure])}${row("Interest", `${v.lender.rate.toFixed(2)}% · ${inr(v.monthly)}/mo`)}${row("Lender", v.lender.name)}${row("Disbursed to", "HDFC Bank ••6021")}${row("Units pledged", "5 schemes · lien marked")}</div>
      <button class="card agree" id="agree"><span class="box ${state.agree ? "on" : ""}">${state.agree ? "✓" : ""}</span><span class="hint" style="font-size:13px">I have read the <b style="color:var(--brand)">Loan Agreement</b> & <b style="color:var(--brand)">KFS</b>, and authorise marking a lien on the pledged units via NSDL/CDSL.</span></button>
      <p class="hint">🔒 Secured by Aadhaar eSign · 256-bit encrypted</p>
    </div>
    <div class="bottom"><button class="cta" data-go="success" ${state.agree ? "" : "disabled"}>${state.agree ? `eSign & disburse ${inr(v.amount)}` : "eSign & disburse"}</button></div>`);
}

function success() {
  const v = vals();
  return shell(`<div class="success">
    <div class="success-main"><div class="success-badge"><i>✓</i></div><div style="font-size:15px;color:rgba(255,255,255,.7);margin-top:28px">Disbursed to HDFC Bank ••6021</div><div style="font-size:46px;font-weight:800;letter-spacing:-1px;margin-top:6px;font-variant-numeric:tabular-nums">${inr(v.amount)}</div><div style="font-size:17px;font-weight:700;margin-top:8px">is on its way</div><div class="loan-id">Loan ID <span class="mono" style="color:#fff">LAMF-9XK4-2271</span><br><span style="color:rgba(255,255,255,.6)">Credited via IMPS · usually within 5 minutes</span></div></div>
    <div class="welcome-bottom"><button class="cta white" data-go="dash">Go to dashboard</button></div>
  </div>`);
}

function dash() {
  const v = vals();
  const util = (v.amount / v.eligible * 100).toFixed(0);
  const metrics = [
    ["Portfolio value", inr(portfolio), "NAV today"],
    ["Drawing power", inr(v.eligible), "60% of holdings"],
    ["Available limit", inr(v.available), "ready to draw"],
    ["Current LTV", `${v.ltv.toFixed(1)}%`, "healthy · cap 60%"],
    ["Interest rate", `${v.lender.rate.toFixed(2)}%`, v.lender.name],
    ["Next interest", inr(v.monthly), "due 05 Jul"]
  ];
  return shell(`<div class="scroll">
    <div class="dash-pad dash-head"><div style="display:flex;align-items:center;gap:12px"><div class="avatar">A</div><div><div class="label" style="font-size:13px">Good afternoon,</div><b>Aarav Mehta</b></div></div><button class="bell" aria-label="Notifications">⌁</button></div>
    <div class="dash-hero"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="color:rgba(255,255,255,.75);font-size:13px">Loan outstanding</div><div style="font-size:38px;font-weight:800;letter-spacing:-.8px;font-variant-numeric:tabular-nums">${inr(v.amount)}</div><div style="font-size:12px;color:rgba(255,255,255,.7)">via ${v.lender.name}</div></div><div style="text-align:right;background:rgba(255,255,255,.12);border-radius:12px;padding:8px 12px"><div style="font-size:11px;color:rgba(255,255,255,.7)">LTV</div><b>${v.ltv.toFixed(1)}%</b></div></div><div class="progress"><i style="width:${util}%"></i></div><div style="display:flex;justify-content:space-between;margin-top:9px;font-size:12.5px;color:rgba(255,255,255,.78)"><span>${util}% of drawing power used</span><span>${inr(v.available)} free</span></div></div>
    <div class="actions"><button class="action" data-go="loan"><i>↓</i>Draw more</button><button class="action"><i>↑</i>Repay</button><button class="action"><i>□</i>Statement</button></div>
    <button class="alert-card" data-go="mtm"><span style="width:38px;height:38px;border-radius:11px;background:#f4e0c5;display:grid;place-items:center;color:#b4540a">!</span><span style="flex:1;text-align:left"><b style="color:#7a3908">Margin-call simulation</b><span style="display:block;color:#a56523;font-size:12.5px;margin-top:2px">See what happens if your NAV drops sharply</span></span><b style="color:#b4540a">›</b></button>
    <div style="display:flex;align-items:center;justify-content:space-between;margin:24px 22px 12px"><b>Loan health</b><span class="label" style="font-size:12px">● MTM monitoring active</span></div>
    <div class="metrics">${metrics.map(([a,b,c]) => `<div class="card metric"><span class="label">${a}</span><b>${b}</b><span class="hint">${c}</span></div>`).join("")}</div>
    <div class="card" style="margin:20px 22px 30px;padding:16px"><b style="font-size:13px">Today's NAV refresh</b><p class="hint" style="margin:10px 0 0;line-height:1.6">NAV updated at 21:30 IST · Drawing power recalculated to <b style="color:var(--ink)">${inr(v.eligible)}</b>. No action needed, you're well within the 60% limit.</p></div>
  </div>`);
}

function mtm() {
  const v = vals();
  return shell(`${back("dash", "Margin-call simulation")}
    <div class="scroll content" style="padding-top:8px">
      <div class="mtm-hero"><span class="alert-pill">! Margin call raised</span><div style="font-size:15px;color:rgba(255,255,255,.85);margin-top:16px">Shortfall to cover</div><div style="font-size:40px;font-weight:800;letter-spacing:-.8px;font-variant-numeric:tabular-nums">${inr(v.shortfall)}</div><div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:6px">Resolve by <b style="color:#fff">02 Jul, 5:00 PM</b> to avoid auto-liquidation</div></div>
      <div class="card" style="margin-top:16px;padding:6px 18px">${row("Portfolio value", `<span style="color:var(--alert)">${inr(v.crashedPortfolio)} ↓</span>`)}${row("Revised drawing power", inr(v.crashedDp))}${row("Loan outstanding", inr(v.amount))}${row("Current LTV", `<span style="color:var(--alert)">${v.crashedLtv.toFixed(1)}% · breached</span>`)}</div>
      <div class="label" style="font-weight:800;margin:22px 0 12px">HOW TO RESOLVE</div>
      <div class="option-list" style="margin-top:0"><div class="resolve-card"><span class="logo-chip">₹</span><span style="flex:1"><b>Repay ${inr(v.shortfall)}</b><span class="label" style="display:block;font-size:12.5px">Bring LTV back under 60%</span></span><b>›</b></div><div class="resolve-card"><span class="logo-chip">+</span><span style="flex:1"><b>Pledge more units</b><span class="label" style="display:block;font-size:12.5px">Add holdings to lift drawing power</span></span><b>›</b></div></div>
      <p class="hint" style="display:flex;gap:8px"><span class="tick">i</span><span>If unresolved by the deadline, units worth the shortfall are auto-liquidated as per the pledge agreement and RBI norms. You're notified at every step via SMS, email & WhatsApp.</span></p>
    </div>
    <div class="bottom"><button class="cta alert" data-go="dash">Resolve now</button></div>`);
}

const renderers = { welcome, login, otp, verify, fetch: fetchPortfolio, eligible, lenders: chooseLender, loan, review, success, dash, mtm };

function render() {
  document.getElementById("app").innerHTML = renderers[state.screen]();
  bind();
}

function bind() {
  document.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => go(el.dataset.go)));
  document.querySelectorAll("[data-lender]").forEach((el) => el.addEventListener("click", () => setState({ lender: el.dataset.lender })));
  document.querySelectorAll("[data-tenure]").forEach((el) => el.addEventListener("click", () => setState({ tenure: Number(el.dataset.tenure) })));
  const mobile = document.getElementById("mobile");
  if (mobile) mobile.addEventListener("input", (event) => setState({ mobile: event.target.value.replace(/\D/g, "").slice(0, 10) }));
  const amount = document.getElementById("amount");
  if (amount) amount.addEventListener("input", (event) => setState({ amount: Number(event.target.value) }));
  const agree = document.getElementById("agree");
  if (agree) agree.addEventListener("click", () => setState({ agree: !state.agree }));
}

window.__lamfGo = go;
render();
