import { handleError, json } from "./_shared/twilio-verify.mjs";
import { verifyVerificationToken } from "./_shared/verification-token.mjs";

const phonePattern = /^\+91[6-9]\d{9}$/;

export default async (request) => {
  try {
    if (request.method !== "POST") throw Object.assign(new Error("Method not allowed."), { status: 405 });
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "");
    const portfolio = Number(body.portfolio);
    const amount = Number(body.amount);
    if (name.length < 2 || name.length > 80 || !phonePattern.test(phone)) throw Object.assign(new Error("Enter valid applicant details."), { status: 400 });
    if (!Number.isFinite(portfolio) || !Number.isFinite(amount) || portfolio < 50000 || amount < 25000 || amount > portfolio * 0.5) {
      throw Object.assign(new Error("Enter a valid portfolio and loan amount."), { status: 400 });
    }
    if (!(await verifyVerificationToken(body.verificationToken, phone))) throw Object.assign(new Error("Mobile verification expired. Please verify again."), { status: 401 });

    const form = new URLSearchParams({
      "form-name": "loan-enquiry",
      name,
      phone,
      portfolio: String(portfolio),
      amount: String(amount),
      verified: "true"
    });
    const formResponse = await fetch(new URL("/", request.url), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form
    });
    if (!formResponse.ok) throw Object.assign(new Error("The enquiry could not be saved."), { status: 502 });
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
};
