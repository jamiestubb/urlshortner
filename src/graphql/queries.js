/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getURL = /* GraphQL */ `
  query GetURL($id: ID!) {
    getURL(id: $id) {
      id
      long
      short
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listURLS = /* GraphQL */ `
  query ListURLS(
    $filter: ModelURLFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listURLS(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        long
        short
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
