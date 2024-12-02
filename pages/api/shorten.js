import { customAlphabet, urlAlphabet } from "nanoid";

export default async function handler(req, res) {
  const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
  const GRAPH_KEY = process.env.GRAPHQL_KEY;

  if (!GRAPHQL_ENDPOINT || !GRAPH_KEY) {
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

  const options = {
    method: "POST",
    headers: {
      "x-api-key": GRAPH_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  };

  const response = {};
  try {
    const fetchResponse = await fetch(GRAPHQL_ENDPOINT, options);
    response.data = await fetchResponse.json();
    response.statusCode = 200;

    if (response.data.errors) response.statusCode = 400;
  } catch (error) {
    response.statusCode = 400;
    response.data = {
      errors: [
        {
          message: error.message,
          stack: error.stack,
        },
      ],
    };
  }
  res.status(response.statusCode).json(response.data);
}