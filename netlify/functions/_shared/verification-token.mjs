function env(name) {
  return globalThis.Netlify?.env?.get(name) || process.env[name];
}

function base64url(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function key() {
  const secret = env("APP_SIGNING_SECRET");
  if (!secret || secret.length < 32) throw Object.assign(new Error("Application signing is not configured."), { status: 503 });
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createVerificationToken(phone) {
  const payload = base64url(JSON.stringify({ phone, expires: Date.now() + 10 * 60 * 1000 }));
  const signature = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(payload));
  return `${payload}.${base64url(signature)}`;
}

export async function verifyVerificationToken(token, phone) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return false;
  const valid = await crypto.subtle.verify("HMAC", await key(), decode(signature), new TextEncoder().encode(payload));
  if (!valid) return false;
  const claims = JSON.parse(new TextDecoder().decode(decode(payload)));
  return claims.phone === phone && Number(claims.expires) > Date.now();
}
