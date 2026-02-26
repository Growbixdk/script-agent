export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log("API key present:", !!apiKey);
  console.log("API key prefix:", apiKey ? apiKey.slice(0, 14) : "MISSING");

  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });
  }

  const passphrase = process.env.ACCESS_PASSPHRASE;
  if (passphrase) {
    const provided = req.headers["x-access-passphrase"];
    if (provided !== passphrase) {
      return res.status(401).json({ error: "Unauthorised" });
    }
  }

  try {
    console.log("Calling Anthropic API...");
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

    console.log("Anthropic response status:", response.status);
    const data = await response.json();
    console.log("Anthropic error field:", data.error || "none");
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy fetch error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
