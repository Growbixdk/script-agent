// pages/api/claude.js
// This is the secure server-side proxy.
// The ANTHROPIC_API_KEY environment variable is never exposed to the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server." });
  }

  // Optional: simple passphrase protection so only your team can use the tool.
  // Set ACCESS_PASSPHRASE in your Vercel environment variables.
  // If you don't set it, the check is skipped.
  const passphrase = process.env.ACCESS_PASSPHRASE;
  if (passphrase) {
    const provided = req.headers["x-access-passphrase"];
    if (provided !== passphrase) {
      return res.status(401).json({ error: "Unauthorised" });
    }
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
