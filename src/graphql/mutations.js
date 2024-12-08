/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createURL = /* GraphQL */ `
  mutation CreateURL(
    $input: CreateURLInput!
    $condition: ModelURLConditionInput
  ) {
    createURL(input: $input, condition: $condition) {
      id
      long
      short
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateURL = /* GraphQL */ `
  mutation UpdateURL(
    $input: UpdateURLInput!
    $condition: ModelURLConditionInput
  ) {
    updateURL(input: $input, condition: $condition) {
      id
      long
      short
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteURL = /* GraphQL */ `
  mutation DeleteURL(
    $input: DeleteURLInput!
    $condition: ModelURLConditionInput
  ) {
    deleteURL(input: $input, condition: $condition) {
      id
      long
      short
      createdAt
      updatedAt
      __typename
    }
  }
`;
