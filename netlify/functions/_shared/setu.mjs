function env(name) {
  return globalThis.Netlify?.env?.get(name) || process.env[name];
}

function configuration() {
  const clientId = env("SETU_CLIENT_ID");
  const clientSecret = env("SETU_CLIENT_SECRET");
  const productInstanceId = env("SETU_PRODUCT_INSTANCE_ID");
  const environment = env("SETU_ENV") === "production" ? "production" : "sandbox";
  if (!clientId || !clientSecret || !productInstanceId) {
    throw Object.assign(new Error("Mutual fund connection is awaiting provider setup."), { status: 503 });
  }
  return { clientId, clientSecret, productInstanceId, environment };
}

async function accessToken(config) {
  const host = config.environment === "production" ? "https://prod.setu.co" : "https://uat.setu.co";
  const response = await fetch(`${host}/api/v2/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ clientID: config.clientId, secret: config.clientSecret })
  });
  const data = await response.json().catch(() => ({}));
  const token = data.data?.token || data.token || data.access_token;
  if (!response.ok || !token) throw Object.assign(new Error("Portfolio provider authentication failed."), { status: 502 });
  return token;
}

export async function setuRequest(path, options = {}) {
  const config = configuration();
  const token = await accessToken(config);
  const host = config.environment === "production" ? "https://fiu.setu.co" : "https://fiu-sandbox.setu.co";
  const response = await fetch(`${host}${path}`, {
    method: options.method || "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-product-instance-id": config.productInstanceId
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Setu request failed", { path, status: response.status, traceId: data.traceId || data.traceID });
    throw Object.assign(new Error("The mutual fund provider could not complete this request."), { status: response.status >= 500 ? 502 : 400 });
  }
  return data;
}

export function appBaseUrl(request) {
  return env("APP_BASE_URL") || new URL(request.url).origin;
}
