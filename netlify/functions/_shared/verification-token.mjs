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

async function createToken(claims, ttlMs) {
  const payload = base64url(JSON.stringify({ ...claims, expires: Date.now() + ttlMs }));
  const signature = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(payload));
  return `${payload}.${base64url(signature)}`;
}

async function verifyToken(token) {
  try {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return null;
    const valid = await crypto.subtle.verify("HMAC", await key(), decode(signature), new TextEncoder().encode(payload));
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(decode(payload)));
    return Number(claims.expires) > Date.now() ? claims : null;
  } catch {
    return null;
  }
}

export async function createVerificationToken(phone) {
  return createToken({ type: "mobile", phone }, 30 * 60 * 1000);
}

export async function verifyVerificationToken(token, phone) {
  const claims = await verifyToken(token);
  return claims?.type === "mobile" && claims.phone === phone;
}

export async function createPortfolioToken(claims) {
  return createToken({ type: "portfolio", ...claims }, 30 * 60 * 1000);
}

export async function verifyPortfolioToken(token, phone) {
  const claims = await verifyToken(token);
  return claims?.type === "portfolio" && claims.phone === phone ? claims : null;
}
