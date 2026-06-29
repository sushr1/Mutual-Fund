import { handleError, json, readRequest, twilioVerify } from "./_shared/twilio-verify.mjs";
import { createVerificationToken } from "./_shared/verification-token.mjs";

export default async (request) => {
  try {
    const { phone, code } = await readRequest(request, true);
    const verification = await twilioVerify("VerificationCheck", { To: phone, Code: code });
    if (verification.status !== "approved") return json({ error: "The OTP is incorrect or expired." }, 400);
    return json({ ok: true, verified: true, verificationToken: await createVerificationToken(phone) });
  } catch (error) {
    return handleError(error);
  }
};
