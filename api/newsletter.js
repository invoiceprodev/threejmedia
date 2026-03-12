const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  let payload;

  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  const { name, email } = payload;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  if (!emailPattern.test(String(email))) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
  const webhookToken = process.env.NEWSLETTER_WEBHOOK_TOKEN;

  if (!webhookUrl) {
    return res.status(503).json({ message: "Newsletter submissions are not configured yet." });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookToken ? { Authorization: `Bearer ${webhookToken}` } : {}),
      },
      body: JSON.stringify({
        name: String(name).trim(),
        email: String(email).trim(),
        source: "threejmedia.co.za",
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Newsletter service is temporarily unavailable." });
    }

    return res.status(200).json({ message: "Thanks. You're on the list." });
  } catch (error) {
    return res.status(502).json({ message: "Newsletter service is temporarily unavailable." });
  }
}
