// pages/api/verify-turnstile.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { "cf-turnstile-response": token, shortCode } = req.body;

  if (!token) {
    console.error("No CAPTCHA token provided.");
    res.status(400).json({ error: "No CAPTCHA token provided" });
    return;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing Turnstile secret key.");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const verificationURL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  formData.append("remoteip", req.headers["x-forwarded-for"] || req.socket.remoteAddress);

  try {
    const verificationResponse = await fetch(verificationURL, {
      method: "POST",
      body: formData,
    });

    if (!verificationResponse.ok) {
      console.error(
        "Turnstile verification request failed with status:",
        verificationResponse.status
      );
      res.status(500).json({ error: "Turnstile verification request failed" });
      return;
    }

    const verificationResult = await verificationResponse.json();
    console.log("Turnstile verification result:", verificationResult);

    if (!verificationResult.success) {
      console.error("CAPTCHA verification failed:", verificationResult["error-codes"]);
      res.status(400).json({
        error: "Turnstile verification failed",
        details: verificationResult["error-codes"],
      });
      return;
    }

    console.log("CAPTCHA verification succeeded.");

    // Placeholder for further actions (e.g., retrieving and redirecting to the long URL).
    res.status(200).json({ success: true, message: "Verification passed" });
  } catch (error) {
    console.error("Internal server error:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
