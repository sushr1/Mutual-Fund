import { json } from "./_shared/twilio-verify.mjs";
import { createPortfolioToken, verifyVerificationToken } from "./_shared/verification-token.mjs";
import { setuRequest } from "./_shared/setu.mjs";

const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const phonePattern = /^\+91[6-9]\d{9}$/;

function eligibilityLtv() {
  const configured = Number(globalThis.Netlify?.env?.get("ELIGIBILITY_MAX_LTV") || process.env.ELIGIBILITY_MAX_LTV || 0.5);
  return Math.min(0.6, Math.max(0.1, Number.isFinite(configured) ? configured : 0.5));
}

function accountPayload(item) {
  return item?.data?.account
    || item?.data?.decryptedFI?.account
    || item?.decryptedFI?.account
    || item?.account
    || null;
}

function holderPans(account) {
  const holder = account?.profile?.holders?.holder;
  const holders = Array.isArray(holder) ? holder : holder ? [holder] : [];
  return holders.map((entry) => String(entry.pan || "").toUpperCase()).filter(Boolean);
}

function portfolioSummary(response, expectedPan) {
  const holdings = [];
  const discoveredPans = new Set();
  for (const fip of response.fips || []) {
    for (const item of fip.accounts || fip.data || []) {
      const account = accountPayload(item);
      if (!account) continue;
      holderPans(account).forEach((pan) => discoveredPans.add(pan));
      const type = String(account.type || "").toLowerCase();
      if (type !== "mutual_funds" && type !== "mutual-funds") continue;
      const currentValue = Number(account.summary?.currentValue || 0);
      if (!Number.isFinite(currentValue) || currentValue <= 0) continue;
      holdings.push({
        maskedAccount: account.maskedAccNumber || account.masked_account_number || item.maskedAccNumber || "Connected folio",
        currentValue
      });
    }
  }
  if (discoveredPans.size && !discoveredPans.has(expectedPan)) throw Object.assign(new Error("The connected portfolio does not match the application PAN."), { status: 403 });
  const portfolioValue = holdings.reduce((total, holding) => total + holding.currentValue, 0);
  if (!portfolioValue) throw Object.assign(new Error("No mutual fund current value was returned for this consent."), { status: 422 });
  return { portfolioValue, holdings };
}

export default async (request) => {
  try {
    if (request.method !== "POST") throw Object.assign(new Error("Method not allowed."), { status: 405 });
    const body = await request.json().catch(() => ({}));
    const pan = String(body.pan || "").toUpperCase();
    const phone = String(body.phone || "");
    const consentId = String(body.consentId || "");
    const sessionId = String(body.sessionId || "");
    if (!panPattern.test(pan) || !phonePattern.test(phone) || !consentId || consentId.length > 100) throw Object.assign(new Error("Portfolio request details are invalid."), { status: 400 });
    if (!(await verifyVerificationToken(body.verificationToken, phone))) throw Object.assign(new Error("Mobile verification expired. Please verify again."), { status: 401 });

    if (!sessionId) {
      const consent = await setuRequest(`/v2/consents/${encodeURIComponent(consentId)}`);
      const status = String(consent.status || consent.detail?.status || "").toUpperCase();
      if (status === "PENDING") return json({ status: "PENDING_CONSENT" });
      if (status !== "APPROVED" && status !== "READY") throw Object.assign(new Error("Portfolio consent was not approved."), { status: 409 });
      const to = new Date();
      const from = new Date(to);
      from.setFullYear(from.getFullYear() - 1);
      const session = await setuRequest("/v2/sessions", {
        method: "POST",
        body: { consentId, dataRange: { from: from.toISOString(), to: to.toISOString() }, format: "json" }
      });
      if (!session.id) throw Object.assign(new Error("Portfolio preparation could not be started."), { status: 502 });
      return json({ status: "PREPARING", sessionId: session.id });
    }

    if (sessionId.length > 100) throw Object.assign(new Error("Portfolio session is invalid."), { status: 400 });
    const portfolio = await setuRequest(`/v2/sessions/${encodeURIComponent(sessionId)}`);
    const status = String(portfolio.status || "").toUpperCase();
    if (status === "PENDING") return json({ status: "PREPARING", sessionId });
    if (status !== "PARTIAL" && status !== "COMPLETED") throw Object.assign(new Error("Portfolio data is not available for this session."), { status: 409 });
    const summary = portfolioSummary(portfolio, pan);
    const ltv = eligibilityLtv();
    const maxEligible = Math.floor((summary.portfolioValue * ltv) / 1000) * 1000;
    const portfolioToken = await createPortfolioToken({
      phone,
      panSuffix: pan.slice(-4),
      consentId,
      portfolioValue: summary.portfolioValue,
      holdingsCount: summary.holdings.length,
      ltv,
      maxEligible
    });
    return json({ status: "READY", ...summary, ltv, maxEligible, portfolioToken });
  } catch (error) {
    console.error("Portfolio fetch error", { message: error.message, status: error.status });
    return json({ error: error.message || "Something went wrong." }, error.status || 500);
  }
};
