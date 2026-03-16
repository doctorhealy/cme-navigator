// Anthropic API Proxy — Cloudflare Worker
// Allows browser-hosted apps on GitHub Pages to call the Anthropic API
// without exposing the API key in client-side HTML.
//
// SETUP:
// 1. Deploy this Worker in your Cloudflare dashboard
// 2. Add your Anthropic API key as a secret:
//    Settings → Variables → Add variable → Name: ANTHROPIC_API_KEY → Encrypt
// 3. Update ALLOWED_ORIGIN below to your GitHub Pages URL

const ALLOWED_ORIGIN = "https://doctorhealy.github.io";  // ← your GitHub Pages domain

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Only allow POST from your GitHub Pages domain
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const origin = request.headers.get("Origin") || "";
    if (!origin.startsWith(ALLOWED_ORIGIN)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Forward the request to Anthropic with the secret key
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicResp.json();

    return new Response(JSON.stringify(data), {
      status: anthropicResp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  },
};
