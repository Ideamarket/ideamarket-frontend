import { GraphQLClient } from 'graphql-request'

export function createGraphCMSClient() {
  const endpoint = process.env.GRAPHCMS_ENDPOINT
  const authToken = process.env.GRAPHCMS_API_KEY
  const client = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
  return client
}
