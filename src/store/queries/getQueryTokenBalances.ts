import { gql } from 'graphql-request'

export default function getQueryTokenBalances({
  marketName,
  tokenName,
  first,
  skip,
}: {
  marketName: string
  tokenName: string
  first: number
  skip: number
}): string {
  return gql`
    {
      ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
        tokens(where:{name:${'"' + tokenName + '"'}}) {
          balances(first: ${first}, skip: ${skip}) {
            id
            holder
            amount
            daiPNL
            token {
              name
            }
          }
        }
      }
    }`
}
