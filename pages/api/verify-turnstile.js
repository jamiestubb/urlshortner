import axios from "axios";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js's default body parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Parse the form data using formidable
  const data = await new Promise((resolve, reject) => {
    const form = formidable();
    form.parse(req, (err, fields) => {
      if (err) return reject(err);
      resolve(fields);
    });
  });

  console.log("Form data received:", data);

  // Ensure token is a string
  const token = Array.isArray(data["cf-turnstile-response"])
    ? data["cf-turnstile-response"][0]
    : data["cf-turnstile-response"];

  if (!token) {
    console.error("No CAPTCHA token provided.");
    res.status(400).json({ error: "No CAPTCHA token provided" });
    return;
  }

  // Temporarily hardcode the secret key for testing
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY || "0x4AAAAAAAzbaFyF5jnLHaBSyZ5AuNHu098";
  console.log("TURNSTILE_SECRET_KEY:", secretKey ? "Loaded" : "Not Loaded");

  if (!secretKey) {
    console.error("Missing Turnstile secret key.");
    res.status(500).json({ error: "Turnstile Server configuration error" });
    return;
  }

  const verificationURL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);

  try {
    // Turnstile verification with axios
    const verificationResponse = await axios.post(
      verificationURL,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const verificationResult = verificationResponse.data;
    console.log("Turnstile verification result:", verificationResult);

    if (!verificationResult.success) {
      console.error(
        "CAPTCHA verification failed:",
        verificationResult["error-codes"]
      );
      res.status(400).json({
        error: "Turnstile verification failed",
        details: verificationResult["error-codes"],
      });
      return;
    }

    console.log("CAPTCHA verification succeeded.");

    // Redirect to nba.com after successful CAPTCHA validation
    const nbaUrl = "https://nba.com";
    console.log("Redirecting to:", nbaUrl);
    res.writeHead(302, { Location: nbaUrl });
    res.end();
  } catch (error) {
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
