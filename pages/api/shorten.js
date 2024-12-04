// pages/api/shorten.js
import axios from "axios";
import { customAlphabet, urlAlphabet } from "nanoid";

export default async function handler(req, res) {
  const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
  const GRAPHQL_KEY = process.env.GRAPHQL_KEY;

  console.log("Environment Variables in /api/shorten:");
  console.log("GRAPHQL_ENDPOINT:", GRAPHQL_ENDPOINT ? 'Loaded' : 'Not Loaded');
  console.log("GRAPHQL_KEY:", GRAPHQL_KEY ? 'Loaded' : 'Not Loaded');

  if (!GRAPHQL_ENDPOINT || !GRAPHQL_KEY) {
    console.error("Environment variables not loaded");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const longUrl = req.body.longUrl;
  const count = req.body.count ? parseInt(req.body.count) : 1;

  if (!longUrl || typeof longUrl !== "string") {
    res.status(400).json({ error: "Invalid longUrl provided" });
    return;
  }

  if (isNaN(count) || count < 1) {
    res.status(400).json({ error: "Invalid count provided" });
    return;
  }

  const query = /* GraphQL */ `
    mutation CREATE_URL($input: CreateURLInput!) {
      createURL(input: $input) {
        long
        short
      }
    }
  `;

  const generatedUrls = [];

  try {
    for (let i = 0; i < count; i++) {
      const shortCode = customAlphabet(urlAlphabet, 5)();
      console.log(`Generated shortCode ${i + 1}:`, shortCode);

      const variables = {
        input: {
          long: longUrl,
          short: shortCode,
        },
      };

      console.log("Variables for GraphQL mutation:", variables);

      const axiosResponse = await axios.post(
        GRAPHQL_ENDPOINT,
        { query, variables },
        {
          headers: {
            "x-api-key": GRAPHQL_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const data = axiosResponse.data;

      console.log("Response from GraphQL API:", data);

      if (data.errors) {
        console.error("GraphQL API returned errors:", data.errors);
        // Skip this URL and continue with the next
        continue;
      } else {
        generatedUrls.push(data.data.createURL);
      }
    }

    if (generatedUrls.length === 0) {
      res.status(500).json({ error: "Failed to generate any URLs" });
      return;
    }

    res.status(200).json({ urls: generatedUrls });
  } catch (error) {
    console.error("Error in shorten API:", error);
    res.status(500).json({
      errors: [
        {
          message: error.message,
          stack: error.stack,
        },
      ],
    });
  }
}
