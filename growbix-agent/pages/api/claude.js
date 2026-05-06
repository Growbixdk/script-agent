export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
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

    const text = await response.text();

    // Truncate if over 3MB to avoid Vercel's 4.5MB body limit
    const safe = text.length > 3_000_000 ? text.slice(0, 3_000_000) + '"}]}' : text;

    try {
      const data = JSON.parse(safe);
      return res.status(response.status).json(data);
    } catch {
      // If truncation broke the JSON, return just the text content we have
      const match = safe.match(/"text"\s*:\s*"([\s\S]*?)"\s*[,}]/);
      const extracted = match ? match[1] : "";
      return res.status(200).json({ content: [{ type: "text", text: extracted }] });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
