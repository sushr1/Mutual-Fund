import { handleError, json, readRequest, twilioVerify } from "./_shared/twilio-verify.mjs";

export default async (request) => {
  try {
    const { phone } = await readRequest(request);
    const verification = await twilioVerify("Verifications", { To: phone, Channel: "sms" });
    if (verification.status !== "pending") throw Object.assign(new Error("OTP could not be sent."), { status: 502 });
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
};
