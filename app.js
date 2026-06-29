const defaultState = {
  screen: "welcome",
  pan: "",
  panConsent: false,
  name: "",
  email: "",
  mobile: "",
  amount: 0,
  contactConsent: false,
  portfolioConsent: false,
  otp: "",
  verificationToken: "",
  consentId: "",
  sessionId: "",
  portfolio: 0,
  holdings: [],
  maxEligible: 0,
  ltv: 0,
  portfolioToken: "",
  selectedAmount: 0,
  riskAcknowledged: false,
  applicationId: "",
  loading: false,
  error: "",
  notice: ""
};

const state = { ...defaultState };
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const mobilePattern = /^[6-9]\d{9}$/;
const inr = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const phone = () => `+91${state.mobile}`;
const welcomeValid = () => panPattern.test(state.pan) && state.panConsent;
const detailsValid = () => state.name.trim().length >= 2
  && /^\S+@\S+\.\S+$/.test(state.email)
  && mobilePattern.test(state.mobile)
  && state.amount >= 50000
  && state.contactConsent
  && state.portfolioConsent;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[character]);
const maskedPan = () => `${state.pan.slice(0, 2)}••••${state.pan.slice(-4)}`;

function setState(patch, shouldRender = true) {
  Object.assign(state, patch);
  if (shouldRender) render();
}

function go(screen) {
  setState({ screen, error: "", notice: "" });
}

function shell(content) {
  return `<section class="phone"><div class="screen">${content}</div></section>`;
}

const back = (target) => `<div class="back-row"><button class="back" data-go="${target}" aria-label="Back">‹</button><span class="brand-mini">FolioCredit</span></div>`;
const message = () => state.error ? `<div class="form-error" role="alert">${escapeHtml(state.error)}</div>` : "";
const notice = () => state.notice ? `<div class="form-notice" role="status">${escapeHtml(state.notice)}</div>` : "";

function welcome() {
  return shell(`<div class="welcome">
    <div class="welcome-main">
      <div class="logo" aria-hidden="true">FC</div>
      <div class="mono product-label">FolioCredit</div>
      <h1 class="hero-title">Your mutual funds can keep growing while you borrow.</h1>
      <p class="welcome-copy">Start with your PAN. Holdings are accessed only after mobile verification and your explicit Account Aggregator consent.</p>
    </div>
    <div class="welcome-bottom pan-start">
      <label class="hero-field"><span>PAN number</span><input id="pan" autocomplete="off" autocapitalize="characters" value="${escapeHtml(state.pan)}" placeholder="ABCDE1234F" maxlength="10" required /></label>
      <label class="consent consent-light"><input id="pan-consent" type="checkbox" ${state.panConsent ? "checked" : ""} required /><span>I consent to using my PAN and registered mobile to discover mutual-fund accounts for this eligibility check.</span></label>
      ${message()}
      <button class="cta white" id="continue-details" ${welcomeValid() ? "" : "disabled"}>Continue securely</button>
      <p class="legal-light">PAN alone cannot reveal holdings. Final approval, pricing, and disbursal are provided only by a regulated lending partner.</p>
    </div>
  </div>`);
}

function details() {
  return shell(`${back("welcome")}
    <div class="scroll content onboarding-content">
      <div class="eyebrow">Application details</div>
      <h1 class="title">Tell us what you need</h1>
      <p class="sub">Use the mobile number registered with your mutual-fund folios.</p>
      <form id="details-form" class="form-stack">
        <label class="field"><span>Full name</span><input id="name" autocomplete="name" value="${escapeHtml(state.name)}" placeholder="As shown on PAN" maxlength="80" required /></label>
        <label class="field"><span>Email address</span><input id="email" type="email" autocomplete="email" value="${escapeHtml(state.email)}" placeholder="name@example.com" maxlength="120" required /></label>
        <label class="field"><span>Registered mobile number</span><div class="phone-input"><b>+91</b><input id="mobile" autocomplete="tel-national" inputmode="numeric" value="${state.mobile}" placeholder="10-digit number" maxlength="10" required /></div></label>
        <label class="field"><span>Desired loan amount</span><input id="amount" inputmode="numeric" value="${state.amount || ""}" placeholder="Minimum ₹50,000" required /></label>
        <label class="consent"><input id="contact-consent" type="checkbox" ${state.contactConsent ? "checked" : ""} required /><span>I agree to mobile verification and to be contacted about this application.</span></label>
        <label class="consent"><input id="portfolio-consent" type="checkbox" ${state.portfolioConsent ? "checked" : ""} required /><span>I request a one-time, consented fetch of my mutual-fund profile and current-value summary for loan eligibility.</span></label>
        ${message()}
      </form>
    </div>
    <div class="bottom"><button class="cta" id="send-otp" ${detailsValid() && !state.loading ? "" : "disabled"}>${state.loading ? "Sending OTP…" : "Verify mobile"}</button></div>`);
}

function otp() {
  return shell(`${back("details")}
    <div class="scroll content onboarding-content">
      <div class="eyebrow">Mobile verification</div>
      <h1 class="title">Enter the OTP</h1>
      <p class="sub">We sent a code to +91 ${escapeHtml(state.mobile.slice(0, 2))}••••••${escapeHtml(state.mobile.slice(-2))}.</p>
      <form id="otp-form" class="form-stack otp-form">
        <label class="field"><span>One-time password</span><input id="otp" class="otp-input" autocomplete="one-time-code" inputmode="numeric" value="${state.otp}" placeholder="••••••" maxlength="6" required /></label>
        ${message()}
        <button type="button" class="text-action" id="resend-otp" ${state.loading ? "disabled" : ""}>Resend OTP</button>
      </form>
    </div>
    <div class="bottom"><button class="cta" id="verify-otp" ${/^\d{6}$/.test(state.otp) && !state.loading ? "" : "disabled"}>${state.loading ? "Verifying…" : "Verify and continue"}</button></div>`);
}

function connect() {
  return shell(`${back("details")}
    <div class="scroll content onboarding-content">
      <div class="verified-line"><span class="tick">✓</span> Mobile verified</div>
      <h1 class="title">Connect your mutual funds</h1>
      <p class="sub">A regulated Account Aggregator will ask you to review the request, discover accounts using PAN and mobile, and choose what to share.</p>
      <div class="connection-list">
        <div><span>1</span><p><b>Review consent</b><small>One-time profile and current-value summary</small></p></div>
        <div><span>2</span><p><b>Link eligible folios</b><small>Use PAN ${escapeHtml(maskedPan())} and your registered mobile</small></p></div>
        <div><span>3</span><p><b>Calculate eligibility</b><small>Based only on data you approve</small></p></div>
      </div>
      <p class="disclosure">FolioCredit cannot access holdings without your approval. You can reject or revoke consent through the Account Aggregator.</p>
      ${message()}
    </div>
    <div class="bottom"><button class="cta" id="connect-portfolio" ${state.loading ? "disabled" : ""}>${state.loading ? "Preparing consent…" : "Connect mutual funds"}</button></div>`);
}

function portfolioPending() {
  return shell(`${back("connect")}
    <div class="scroll content onboarding-content">
      <div class="eyebrow">Portfolio connection</div>
      <h1 class="title">Finish your secure connection</h1>
      <p class="sub">After approving the Account Aggregator request, check again to retrieve the portfolio summary.</p>
      <div class="status-panel"><span class="status-dot"></span><div><b>Consent reference</b><small>${escapeHtml(state.consentId || "Awaiting consent")}</small></div></div>
      ${notice()}
      ${message()}
    </div>
    <div class="bottom"><button class="cta" id="check-portfolio" ${state.loading ? "disabled" : ""}>${state.loading ? "Checking portfolio…" : "Check portfolio"}</button></div>`);
}

function result() {
  const eligible = state.maxEligible >= 50000;
  return shell(`${back("portfolioPending")}
    <div class="scroll content onboarding-content">
      <div class="verified-line"><span class="tick">✓</span> Consented portfolio received</div>
      <h1 class="title">${eligible ? "Choose your loan amount" : "Portfolio below current lending threshold"}</h1>
      <div class="estimate-panel">
        <span>Indicative drawing power</span>
        <strong>${inr(state.maxEligible)}</strong>
        <small>${Math.round(state.ltv * 100)}% policy LTV before scheme-level lender haircuts</small>
      </div>
      <div class="summary-list">
        <div><span>Portfolio current value</span><b>${inr(state.portfolio)}</b></div>
        <div><span>Connected accounts</span><b>${state.holdings.length}</b></div>
      </div>
      ${eligible ? `<section class="loan-selector" aria-labelledby="loan-amount-label">
        <div id="loan-amount-label" class="field-label">Selected loan amount</div>
        <div class="amount-live" id="selected-amount">${inr(state.selectedAmount)}</div>
        <input id="loan-amount" type="range" min="50000" max="${state.maxEligible}" step="5000" value="${state.selectedAmount}" aria-label="Selected loan amount" />
        <div class="range-limits"><span>${inr(50000)}</span><span>${inr(state.maxEligible)}</span></div>
      </section>
      <section class="risk-block" aria-labelledby="risk-title">
        <h2 id="risk-title">Before you apply</h2>
        <ul>
          <li>Mutual-fund values and drawing power can fall.</li>
          <li>A margin call may require repayment or more collateral.</li>
          <li>Failure to cure a shortfall may lead to liquidation of pledged units.</li>
          <li>Interest continues until the lender records repayment.</li>
        </ul>
        <label class="consent"><input id="risk-acknowledged" type="checkbox" ${state.riskAcknowledged ? "checked" : ""} required /><span>I understand these risks. This is an application, not a sanction or disbursal.</span></label>
      </section>` : ""}
      <p class="disclosure">The regulated lender must complete KYC, bank verification, underwriting, scheme eligibility, KFS and APR disclosure, lien confirmation, and executed documents before disbursal.</p>
      ${message()}
    </div>
    <div class="bottom"><button class="cta" id="submit-enquiry" ${eligible && state.riskAcknowledged && !state.loading ? "" : "disabled"}>${state.loading ? "Creating application…" : eligible ? "Create application" : "Not currently eligible"}</button></div>`);
}

function submitted() {
  return shell(`<div class="scroll content lifecycle-screen">
    <div class="verified-line"><span class="tick">✓</span> Application created</div>
    <h1 class="title">We have recorded your request</h1>
    <p class="sub">No loan has been sanctioned yet. Your regulated lending partner must complete the remaining checks.</p>
    <div class="reference reference-light">Reference <b>${escapeHtml(state.applicationId)}</b></div>
    <div class="lifecycle-list">
      <div class="done"><i>✓</i><p><b>Mobile verified</b><small>Completed</small></p></div>
      <div class="done"><i>✓</i><p><b>Portfolio fetched</b><small>Completed with Account Aggregator consent</small></p></div>
      <div class="current"><i>3</i><p><b>KYC and bank verification</b><small>Pending regulated partner journey</small></p></div>
      <div><i>4</i><p><b>Credit decision and KFS</b><small>Pending lender approval and pricing</small></p></div>
      <div><i>5</i><p><b>Lien, agreement and eSign</b><small>Pending customer authorization</small></p></div>
      <div><i>6</i><p><b>Disbursal</b><small>Only after all preceding stages complete</small></p></div>
    </div>
    <p class="disclosure">After disbursal, daily NAV-based drawing power, repayment, margin alerts, closure, and lien release belong in the servicing dashboard supplied by the lending partner.</p>
    <button class="cta" id="restart">Start another application</button>
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
    setState({ screen: "connect", loading: false, error: "", verificationToken: result.verificationToken });
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

function persistJourney() {
  sessionStorage.setItem("folioCreditJourney", JSON.stringify({
    pan: state.pan,
    name: state.name,
    email: state.email,
    mobile: state.mobile,
    amount: state.amount,
    contactConsent: state.contactConsent,
    portfolioConsent: state.portfolioConsent,
    verificationToken: state.verificationToken,
    consentId: state.consentId,
    sessionId: state.sessionId
  }));
}

async function connectPortfolio() {
  setState({ loading: true, error: "" });
  try {
    const result = await api("/.netlify/functions/start-portfolio-consent", {
      pan: state.pan,
      phone: phone(),
      verificationToken: state.verificationToken
    });
    setState({ consentId: result.consentId, loading: false }, false);
    persistJourney();
    window.location.assign(result.consentUrl);
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

async function checkPortfolio() {
  setState({ loading: true, error: "", notice: "" });
  try {
    const result = await api("/.netlify/functions/fetch-portfolio", {
      pan: state.pan,
      phone: phone(),
      verificationToken: state.verificationToken,
      consentId: state.consentId,
      sessionId: state.sessionId
    });
    if (result.status === "READY") {
      sessionStorage.removeItem("folioCreditJourney");
      const selectedAmount = Math.max(50000, Math.min(state.amount, result.maxEligible));
      setState({
        screen: "result",
        loading: false,
        portfolio: result.portfolioValue,
        holdings: result.holdings,
        maxEligible: result.maxEligible,
        ltv: result.ltv,
        portfolioToken: result.portfolioToken,
        selectedAmount
      });
      return;
    }
    setState({
      loading: false,
      sessionId: result.sessionId || state.sessionId,
      notice: result.status === "PENDING_CONSENT" ? "Approve the consent request, then check again." : "Your portfolio is being prepared. Check again shortly."
    });
    persistJourney();
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

async function submitEnquiry() {
  setState({ loading: true, error: "" });
  try {
    const result = await api("/.netlify/functions/submit-enquiry", {
      name: state.name.trim(),
      email: state.email.trim(),
      phone: phone(),
      panLast4: state.pan.slice(-4),
      amount: state.selectedAmount,
      consentId: state.consentId,
      verificationToken: state.verificationToken,
      portfolioToken: state.portfolioToken,
      riskAcknowledged: state.riskAcknowledged
    });
    setState({ screen: "submitted", loading: false, applicationId: result.applicationId });
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

const renderers = { welcome, details, otp, connect, portfolioPending, result, submitted };

function render() {
  document.getElementById("app").innerHTML = renderers[state.screen]();
  bind();
}

function bindCheckbox(id, key) {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener("change", (event) => {
    setState({ [key]: event.target.checked, error: "" }, false);
    updateActionState();
  });
}

function bind() {
  document.querySelectorAll("[data-go]").forEach((element) => element.addEventListener("click", () => go(element.dataset.go)));
  const fields = {
    pan: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
    name: (value) => value.slice(0, 80),
    email: (value) => value.trim().slice(0, 120),
    mobile: (value) => value.replace(/\D/g, "").slice(0, 10),
    amount: (value) => Math.max(0, Number(value.replace(/\D/g, "")) || 0),
    otp: (value) => value.replace(/\D/g, "").slice(0, 6)
  };
  Object.entries(fields).forEach(([id, normalize]) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", (event) => {
      const value = normalize(event.target.value);
      event.target.value = value || "";
      setState({ [id]: value, error: "" }, false);
      updateActionState();
    });
  });
  bindCheckbox("pan-consent", "panConsent");
  bindCheckbox("contact-consent", "contactConsent");
  bindCheckbox("portfolio-consent", "portfolioConsent");
  bindCheckbox("risk-acknowledged", "riskAcknowledged");
  document.getElementById("continue-details")?.addEventListener("click", () => go("details"));
  document.getElementById("send-otp")?.addEventListener("click", sendOtp);
  document.getElementById("resend-otp")?.addEventListener("click", sendOtp);
  document.getElementById("verify-otp")?.addEventListener("click", verifyOtp);
  document.getElementById("connect-portfolio")?.addEventListener("click", connectPortfolio);
  document.getElementById("check-portfolio")?.addEventListener("click", checkPortfolio);
  document.getElementById("submit-enquiry")?.addEventListener("click", submitEnquiry);
  const loanAmount = document.getElementById("loan-amount");
  if (loanAmount) loanAmount.addEventListener("input", (event) => {
    const selectedAmount = Number(event.target.value);
    setState({ selectedAmount }, false);
    document.getElementById("selected-amount").textContent = inr(selectedAmount);
  });
  document.getElementById("restart")?.addEventListener("click", () => {
    sessionStorage.removeItem("folioCreditJourney");
    window.location.assign(window.location.pathname);
  });
}

function updateActionState() {
  const continueButton = document.getElementById("continue-details");
  if (continueButton) continueButton.disabled = !welcomeValid() || state.loading;
  const sendButton = document.getElementById("send-otp");
  if (sendButton) sendButton.disabled = !detailsValid() || state.loading;
  const verifyButton = document.getElementById("verify-otp");
  if (verifyButton) verifyButton.disabled = !/^\d{6}$/.test(state.otp) || state.loading;
  const submitButton = document.getElementById("submit-enquiry");
  if (submitButton) submitButton.disabled = state.maxEligible < 50000 || !state.riskAcknowledged || state.loading;
}

function restoreJourney() {
  if (!new URLSearchParams(window.location.search).has("portfolio")) return;
  try {
    const saved = JSON.parse(sessionStorage.getItem("folioCreditJourney") || "null");
    if (!saved?.consentId || !saved?.verificationToken) return;
    Object.assign(state, saved, { screen: "portfolioPending" });
  } catch {
    sessionStorage.removeItem("folioCreditJourney");
  }
}

restoreJourney();
render();
