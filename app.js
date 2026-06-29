const state = {
  screen: "welcome",
  name: "",
  mobile: "",
  portfolio: 500000,
  amount: 200000,
  consent: false,
  otp: "",
  verificationToken: "",
  loading: false,
  error: ""
};

const inr = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const phone = () => `+91${state.mobile}`;
const estimate = () => Math.round(state.portfolio * 0.5);
const detailsValid = () => state.name.trim().length >= 2
  && /^[6-9]\d{9}$/.test(state.mobile)
  && state.portfolio >= 50000
  && state.amount >= 25000
  && state.consent;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[character]);

function setState(patch, shouldRender = true) {
  Object.assign(state, patch);
  if (shouldRender) render();
}

function go(screen) {
  setState({ screen, error: "" });
}

function shell(content) {
  return `<section class="phone"><div class="screen">${content}</div></section>`;
}

const back = (target) => `<div class="back-row"><button class="back" data-go="${target}" aria-label="Back">‹</button></div>`;
const message = () => state.error ? `<div class="form-error" role="alert">${escapeHtml(state.error)}</div>` : "";

function welcome() {
  return shell(`<div class="welcome">
    <div class="welcome-main">
      <div class="logo" aria-hidden="true">⌁</div>
      <div class="mono product-label">Loan Against Mutual Funds</div>
      <h1 class="hero-title">Access funds without redeeming your investments.</h1>
      <p class="welcome-copy">Verify your mobile number, enter your portfolio value, and receive an instant eligibility estimate.</p>
    </div>
    <div class="welcome-bottom">
      <div class="chips"><span>Secure OTP</span><span>Instant estimate</span><span>No obligation</span></div>
      <button class="cta white" data-go="details">Check eligibility</button>
      <p class="legal-light">Eligibility is indicative and subject to lender assessment, KYC, and scheme-level lending limits.</p>
    </div>
  </div>`);
}

function details() {
  const valid = detailsValid();
  return shell(`${back("welcome")}
    <div class="scroll content onboarding-content">
      <div class="eyebrow">Eligibility check</div>
      <h1 class="title">Tell us about you</h1>
      <p class="sub">We use these details only to verify your number and calculate an estimate.</p>
      <form id="details-form" class="form-stack">
        <label class="field"><span>Full name</span><input id="name" autocomplete="name" value="${escapeHtml(state.name)}" placeholder="As shown on PAN" maxlength="80" /></label>
        <label class="field"><span>Mobile number</span><div class="phone-input"><b>+91</b><input id="mobile" autocomplete="tel-national" inputmode="numeric" value="${state.mobile}" placeholder="10-digit number" maxlength="10" /></div></label>
        <label class="field"><span>Mutual fund portfolio value</span><input id="portfolio" inputmode="numeric" value="${state.portfolio}" aria-describedby="portfolio-hint" /></label>
        <div id="portfolio-hint" class="hint">Enter the current approximate value across eligible mutual funds.</div>
        <label class="field"><span>Desired loan amount</span><input id="amount" inputmode="numeric" value="${state.amount}" /></label>
        <label class="consent"><input id="consent" type="checkbox" ${state.consent ? "checked" : ""} /><span>I consent to mobile verification and being contacted about this enquiry. I understand this is not a loan approval.</span></label>
        ${message()}
      </form>
    </div>
    <div class="bottom"><button class="cta" id="send-otp" ${valid && !state.loading ? "" : "disabled"}>${state.loading ? "Sending OTP…" : "Send OTP"}</button></div>`);
}

function otp() {
  return shell(`${back("details")}
    <div class="scroll content onboarding-content">
      <div class="eyebrow">Mobile verification</div>
      <h1 class="title">Enter the OTP</h1>
      <p class="sub">We sent a 6-digit code to +91 ${escapeHtml(state.mobile.slice(0, 2))}••••••${escapeHtml(state.mobile.slice(-2))}.</p>
      <form id="otp-form" class="form-stack otp-form">
        <label class="field"><span>One-time password</span><input id="otp" class="otp-input" autocomplete="one-time-code" inputmode="numeric" value="${state.otp}" placeholder="••••••" maxlength="6" /></label>
        ${message()}
        <button type="button" class="text-action" id="resend-otp" ${state.loading ? "disabled" : ""}>Resend OTP</button>
      </form>
    </div>
    <div class="bottom"><button class="cta" id="verify-otp" ${/^\d{6}$/.test(state.otp) && !state.loading ? "" : "disabled"}>${state.loading ? "Verifying…" : "Verify and continue"}</button></div>`);
}

function result() {
  const maximum = estimate();
  const withinEstimate = state.amount <= maximum;
  return shell(`${back("details")}
    <div class="scroll content onboarding-content">
      <div class="verified-line"><span class="tick">✓</span> Mobile verified</div>
      <h1 class="title">${withinEstimate ? "Your estimate is ready" : "Adjust your loan amount"}</h1>
      <div class="estimate-panel">
        <span>Indicative maximum</span>
        <strong>${inr(maximum)}</strong>
        <small>Based on 50% of the portfolio value entered</small>
      </div>
      <div class="summary-list">
        <div><span>Applicant</span><b>${escapeHtml(state.name)}</b></div>
        <div><span>Portfolio value</span><b>${inr(state.portfolio)}</b></div>
        <div><span>Requested amount</span><b class="${withinEstimate ? "" : "warning-text"}">${inr(state.amount)}</b></div>
      </div>
      <p class="disclosure">This estimate is not a sanction or offer. Final eligibility depends on KYC, credit checks, eligible schemes, current NAV, lender policy, and executed loan documents.</p>
      ${message()}
    </div>
    <div class="bottom"><button class="cta" id="submit-enquiry" ${withinEstimate && !state.loading ? "" : "disabled"}>${state.loading ? "Submitting…" : withinEstimate ? "Request a callback" : "Amount exceeds estimate"}</button></div>`);
}

function submitted() {
  return shell(`<div class="success simple-success">
    <div class="success-main">
      <div class="success-badge"><i>✓</i></div>
      <h1>Enquiry received</h1>
      <p>Thanks, ${escapeHtml(state.name)}. A lending representative can now contact you on your verified mobile number.</p>
      <div class="reference">Reference <b>LAMF-${Date.now().toString().slice(-8)}</b></div>
    </div>
    <div class="welcome-bottom"><button class="cta white" data-go="welcome">Start another enquiry</button></div>
  </div>`);
}

async function api(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

async function sendOtp() {
  setState({ loading: true, error: "" });
  try {
    await api("/.netlify/functions/send-otp", { phone: phone() });
    setState({ screen: "otp", loading: false, otp: "" });
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

async function verifyOtp() {
  setState({ loading: true, error: "" });
  try {
    const result = await api("/.netlify/functions/verify-otp", { phone: phone(), code: state.otp });
    setState({ screen: "result", loading: false, error: "", verificationToken: result.verificationToken });
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

async function submitEnquiry() {
  setState({ loading: true, error: "" });
  try {
    await api("/.netlify/functions/submit-enquiry", {
      name: state.name.trim(),
      phone: phone(),
      portfolio: state.portfolio,
      amount: state.amount,
      verificationToken: state.verificationToken
    });
    setState({ screen: "submitted", loading: false });
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

const renderers = { welcome, details, otp, result, submitted };

function render() {
  document.getElementById("app").innerHTML = renderers[state.screen]();
  bind();
}

function bind() {
  document.querySelectorAll("[data-go]").forEach((element) => element.addEventListener("click", () => go(element.dataset.go)));
  const fields = {
    name: (value) => value.slice(0, 80),
    mobile: (value) => value.replace(/\D/g, "").slice(0, 10),
    portfolio: (value) => Math.max(0, Number(value.replace(/\D/g, "")) || 0),
    amount: (value) => Math.max(0, Number(value.replace(/\D/g, "")) || 0),
    otp: (value) => value.replace(/\D/g, "").slice(0, 6)
  };
  Object.entries(fields).forEach(([id, normalize]) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", (event) => {
      const value = normalize(event.target.value);
      event.target.value = value;
      setState({ [id]: value, error: "" }, false);
      updateActionState();
    });
  });
  const consent = document.getElementById("consent");
  if (consent) consent.addEventListener("change", (event) => {
    setState({ consent: event.target.checked, error: "" }, false);
    updateActionState();
  });
  document.getElementById("send-otp")?.addEventListener("click", sendOtp);
  document.getElementById("resend-otp")?.addEventListener("click", sendOtp);
  document.getElementById("verify-otp")?.addEventListener("click", verifyOtp);
  document.getElementById("submit-enquiry")?.addEventListener("click", submitEnquiry);
}

function updateActionState() {
  const sendButton = document.getElementById("send-otp");
  if (sendButton) sendButton.disabled = !detailsValid() || state.loading;

  const verifyButton = document.getElementById("verify-otp");
  if (verifyButton) verifyButton.disabled = !/^\d{6}$/.test(state.otp) || state.loading;
}

render();
