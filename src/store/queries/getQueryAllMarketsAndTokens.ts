import { gql } from 'graphql-request'

export default function getQueryAllMarketsAndTokens() {
  return gql`
    {
      ideaMarkets {
        name
        tokens {
          name
        }
      }
    }
  `
}
