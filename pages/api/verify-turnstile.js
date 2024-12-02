// pages/api/verify-turnstile.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.status(405).end(); // Method Not Allowed
      return;
    }
  
    const { "cf-turnstile-response": token, shortCode } = req.body;
  
    if (!token) {
      res.status(400).json({ error: "No token provided" });
      return;
    }
  
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    const verificationURL =
      "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
  
    try {
      const verificationResponse = await fetch(verificationURL, {
        method: "POST",
        body: formData,
      });
      const verificationResult = await verificationResponse.json();
  
      if (verificationResult.success) {
        // Verification succeeded
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
        const longUrl = url.long;
  
        // Redirect to the long URL
        res.writeHead(302, { Location: longUrl });
        res.end();
      } else {
        // Verification failed
        res.status(400).json({ error: "Turnstile verification failed" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  