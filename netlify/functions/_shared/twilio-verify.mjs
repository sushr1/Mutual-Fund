const phonePattern = /^\+91[6-9]\d{9}$/;

function env(name) {
  return globalThis.Netlify?.env?.get(name) || process.env[name];
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function readRequest(request, includeCode = false) {
  if (request.method !== "POST") throw Object.assign(new Error("Method not allowed."), { status: 405 });
  const body = await request.json().catch(() => ({}));
  if (!phonePattern.test(body.phone || "")) throw Object.assign(new Error("Enter a valid Indian mobile number."), { status: 400 });
  if (includeCode && !/^\d{4,10}$/.test(body.code || "")) throw Object.assign(new Error("Enter the verification code."), { status: 400 });
  return body;
}

export async function twilioVerify(path, form) {
  const serviceSid = env("TWILIO_VERIFY_SERVICE_SID");
  const apiKey = env("TWILIO_API_KEY");
  const apiSecret = env("TWILIO_API_SECRET");
  if (!serviceSid || !apiKey || !apiSecret) throw Object.assign(new Error("OTP service is not configured."), { status: 503 });

  const response = await fetch(`https://verify.twilio.com/v2/Services/${encodeURIComponent(serviceSid)}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(form)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error("The OTP service could not complete this request."), { status: response.status >= 500 ? 502 : 400 });
  return data;
}

export function handleError(error) {
  console.error("OTP function error", { message: error.message, status: error.status });
  return json({ error: error.message || "Something went wrong." }, error.status || 500);
}
