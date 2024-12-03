// pages/api/verify-turnstile.js
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

  const token = data["cf-turnstile-response"];
  const shortCode = data.shortCode;

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

    const graphqlResponse = await axios.post(
      GRAPHQL_ENDPOINT,
      { query, variables },
      {
        headers: {
          "x-api-key": GRAPHQL_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const data = graphqlResponse.data;
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
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
