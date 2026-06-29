import { json } from "./_shared/twilio-verify.mjs";
import { verifyVerificationToken } from "./_shared/verification-token.mjs";
import { appBaseUrl, setuRequest } from "./_shared/setu.mjs";

const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const phonePattern = /^\+91[6-9]\d{9}$/;

export default async (request) => {
  try {
    if (request.method !== "POST") throw Object.assign(new Error("Method not allowed."), { status: 405 });
    const body = await request.json().catch(() => ({}));
    const pan = String(body.pan || "").toUpperCase();
    const phone = String(body.phone || "");
    if (!panPattern.test(pan) || !phonePattern.test(phone)) throw Object.assign(new Error("Enter valid PAN and mobile details."), { status: 400 });
    if (!(await verifyVerificationToken(body.verificationToken, phone))) throw Object.assign(new Error("Mobile verification expired. Please verify again."), { status: 401 });

    const response = await setuRequest("/v2/consents", {
      method: "POST",
      body: {
        consentDuration: { unit: "DAY", value: "1" },
        consentMode: "STORE",
        fetchType: "ONETIME",
        consentTypes: ["PROFILE", "SUMMARY"],
        fiTypes: ["MUTUAL_FUNDS"],
        vua: phone.slice(3),
        purpose: {
          code: "105",
          text: "One-time mutual fund portfolio verification for loan eligibility",
          refUri: "https://api.rebit.org.in/aa/purpose/105.xml",
          category: { type: "string" }
        },
        dataLife: { unit: "DAY", value: 1 },
        frequency: { unit: "DAY", value: 1 },
        redirectUrl: `${appBaseUrl(request)}/?portfolio=return`,
        context: [{ key: "purposeDescription", value: "Verify mutual fund current value for a loan eligibility estimate" }]
      }
    });
    if (!response.id || !response.url) throw Object.assign(new Error("The consent journey could not be created."), { status: 502 });
    return json({ consentId: response.id, consentUrl: response.url });
  } catch (error) {
    console.error("Portfolio consent error", { message: error.message, status: error.status });
    return json({ error: error.message || "Something went wrong." }, error.status || 500);
  }
};
