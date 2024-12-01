import React from "react";

function Short() {
  return <div></div>;
}

export async function getServerSideProps(context) {
  const { short, ...extraPaths } = context.params; // Capture the short code and additional paths
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
    input: { short: { eq: short } },
  };
  const options = {
    method: "POST",
    headers: {
      "x-api-key": GRAPHQL_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  };
  const res = await fetch(GRAPHQL_ENDPOINT, options);
  const data = await res.json();
  const url = data.data.listURLS.items[0];

  if (!url) {
    return {
      notFound: true, // Return a 404 if the short URL doesn't exist
    };
  }

  // Build the new destination URL by appending extra paths
  const extraPathString = Object.values(extraPaths).join("/");
  const redirectTo = extraPathString
    ? `${url.long}/${extraPathString}`
    : url.long;

  return {
    redirect: {
      destination: redirectTo,
      permanent: false,
    },
  };
}

export default Short;
