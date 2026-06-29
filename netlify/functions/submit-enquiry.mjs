import { handleError, json } from "./_shared/twilio-verify.mjs";
import { verifyPortfolioToken, verifyVerificationToken } from "./_shared/verification-token.mjs";

const phonePattern = /^\+91[6-9]\d{9}$/;

export default async (request) => {
  try {
    if (request.method !== "POST") throw Object.assign(new Error("Method not allowed."), { status: 405 });
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "");
    const panLast4 = String(body.panLast4 || "");
    const consentId = String(body.consentId || "");
    const amount = Number(body.amount);
    if (name.length < 2 || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email) || !phonePattern.test(phone) || !/^\d{3}[A-Z]$/.test(panLast4) || !consentId || consentId.length > 100) {
      throw Object.assign(new Error("Enter valid applicant details."), { status: 400 });
    }
    if (body.riskAcknowledged !== true) throw Object.assign(new Error("Risk acknowledgement is required."), { status: 400 });
    if (!(await verifyVerificationToken(body.verificationToken, phone))) throw Object.assign(new Error("Mobile verification expired. Please verify again."), { status: 401 });
    const portfolioClaims = await verifyPortfolioToken(body.portfolioToken, phone);
    if (!portfolioClaims || portfolioClaims.panSuffix !== panLast4 || portfolioClaims.consentId !== consentId) {
      throw Object.assign(new Error("Portfolio verification expired. Please reconnect your mutual funds."), { status: 401 });
    }
    if (!Number.isFinite(amount) || amount < 50000 || amount > portfolioClaims.maxEligible) {
      throw Object.assign(new Error("Select a loan amount within the verified drawing power."), { status: 400 });
    }

    const applicationId = `FC-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;

    const form = new URLSearchParams({
      "form-name": "loan-application",
      applicationId,
      state: "APPLICATION_CREATED",
      name,
      email,
      phone,
      panLast4,
      consentId,
      portfolio: String(portfolioClaims.portfolioValue),
      holdingsCount: String(portfolioClaims.holdingsCount),
      maxEligible: String(portfolioClaims.maxEligible),
      ltv: String(portfolioClaims.ltv),
      amount: String(amount),
      riskAcknowledged: "true",
      mobileVerified: "true",
      portfolioVerified: "true",
      submittedAt: new Date().toISOString()
    });
    const formResponse = await fetch(new URL("/", request.url), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form
    });
    if (!formResponse.ok) throw Object.assign(new Error("The application could not be saved."), { status: 502 });
    return json({ ok: true, applicationId, state: "APPLICATION_CREATED" });
  } catch (error) {
    return handleError(error);
  }
};
