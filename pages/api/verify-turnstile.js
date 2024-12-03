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

  console.log("Form data received:", data);

  // Ensure token and shortCode are strings
  const token = Array.isArray(data["cf-turnstile-response"])
    ? data["cf-turnstile-response"][0]
    : data["cf-turnstile-response"];

  const shortCode = Array.isArray(data.shortCode)
    ? data.shortCode[0]
    : data.shortCode;

  const path = Array.isArray(data.path) ? data.path[0] : data.path || "";

  console.log("Token:", token);
  console.log("ShortCode:", shortCode);
  console.log("Path:", path);

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

    // Fetch the long URL from the database based on shortCode
    const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
    const GRAPHQL_KEY = process.env.GRAPHQL_KEY;

    console.log("Environment Variables in /api/verify-turnstile:");
    console.log(
      "GRAPHQL_ENDPOINT:",
      GRAPHQL_ENDPOINT ? "Loaded" : "Not Loaded"
    );
    console.log("GRAPHQL_KEY:", GRAPHQL_KEY ? "Loaded" : "Not Loaded");

    if (!GRAPHQL_ENDPOINT || !GRAPHQL_KEY) {
      console.error("Missing GraphQL configuration.");
      res.status(500).json({ error: "GraphQL Server configuration error" });
      return;
    }

    console.log("Proceeding to fetch long URL for shortCode:", shortCode);

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

    console.log("Variables for GraphQL query:", variables);

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

    const graphqlData = graphqlResponse.data;
    console.log("Response from GraphQL API:", graphqlData);

    const url = graphqlData.data.listURLS.items[0];

    if (!url) {
      console.error("No URL found for shortCode:", shortCode);
      res.status(404).json({ error: "URL not found" });
      return;
    }

    console.log("Found URL:", url);

    let longUrl = url.long;

    // Append the path to the long URL
    if (path) {
      // Ensure there is a slash between longUrl and path
      longUrl = longUrl.replace(/\/?$/, "/") + path;
    }

    // Redirect to the long URL
    console.log("Redirecting to:", longUrl);
    res.writeHead(302, { Location: longUrl });
    res.end();
  } catch (error) {
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
