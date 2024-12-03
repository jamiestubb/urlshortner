// pages/api/verify-turnstile.js
import nextConnect from 'next-connect';
import bodyParser from 'body-parser';

const handler = nextConnect();

handler.use(bodyParser.urlencoded({ extended: true }));

handler.post(async (req, res) => {
  const { 'cf-turnstile-response': token, shortCode } = req.body;

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
  // Optionally include remoteip
  // formData.append("remoteip", req.headers["x-forwarded-for"] || req.socket.remoteAddress);

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

    // Fetch the long URL from the database based on shortCode
    const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
    const GRAPHQL_KEY = process.env.GRAPHQL_KEY;
    const query = /* GraphQL */ `
      query LIST_URLS($input: ModelURLFilterInput!) {
        listURLS(filter: $input) {
          items {
            long
            short
          }
        }
      }
    `;
    const variables = {
      input: { short: { eq: shortCode } },
    };
    const options = {
      method: "POST",
      headers: {
        "x-api-key": GRAPHQL_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    };
    const fetchResponse = await fetch(GRAPHQL_ENDPOINT, options);
    const data = await fetchResponse.json();
    const url = data.data.listURLS.items[0];

    if (!url) {
      console.error("No URL found for shortCode:", shortCode);
      res.status(404).json({ error: "URL not found" });
      return;
    }

    const longUrl = url.long;

    // Redirect to the long URL
    res.writeHead(302, { Location: longUrl });
    res.end();
  } catch (error) {
    console.error("Internal server error:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default handler;
