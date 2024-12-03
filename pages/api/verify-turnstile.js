export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { "cf-turnstile-response": token, shortCode } = req.body;

  console.log("Received token:", token);
  console.log("Received shortCode:", shortCode);

  if (!token) {
    console.error("No CAPTCHA token provided.");
    res.status(400).json({ error: "No CAPTCHA token provided" });
    return;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const verificationURL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);

  try {
    console.log("Sending verification request to Turnstile...");
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

    console.log("Fetching long URL from GraphQL...");
    const fetchResponse = await fetch(GRAPHQL_ENDPOINT, options);

    if (!fetchResponse.ok) {
      console.error(
        "GraphQL request failed with status:",
        fetchResponse.status
      );
      res.status(500).json({ error: "Failed to fetch data from GraphQL" });
      return;
    }

    const data = await fetchResponse.json();
    console.log("GraphQL response data:", data);

    if (!data.data || !data.data.listURLS.items.length) {
      console.error("Short URL not found in the database.");
      res.status(404).json({ error: "Short URL not found" });
      return;
    }

    const longUrl = data.data.listURLS.items[0].long;

    console.log("Redirecting to:", longUrl);
    res.writeHead(302, { Location: longUrl });
    res.end();
  } catch (error) {
    console.error("Internal server error:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
