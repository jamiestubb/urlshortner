// pages/api/shorten.js
import axios from "axios";
import { customAlphabet, urlAlphabet } from "nanoid";

export default async function handler(req, res) {
  const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
  const GRAPHQL_KEY = process.env.GRAPHQL_KEY;

  if (!GRAPHQL_ENDPOINT || !GRAPHQL_KEY) {
    console.error("Environment variables not loaded");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const shortCode = customAlphabet(urlAlphabet, 5)();

  const query = /* GraphQL */ `
    mutation CREATE_URL($input: CreateURLInput!) {
      createURL(input: $input) {
        long
        short
      }
    }
  `;

  const variables = {
    input: {
      long: req.body.longUrl,
      short: shortCode,
    },
  };

  try {
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

    if (data.errors) {
      res.status(400).json(data);
    } else {
      res.status(200).json(data);
    }
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
