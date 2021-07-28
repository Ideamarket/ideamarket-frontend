import { gql } from 'graphql-request'

export default function getQueryTokenBalances({
  marketName,
  tokenName,
  first,
  skip,
  holder,
}: {
  marketName: string
  tokenName: string
  first: number
  skip: number
  holder?: string
}): string {
  return gql`
    {
      ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
        tokens(where:{name:${'"' + tokenName + '"'}}) {
          balances(first: ${first}, skip: ${skip}
            ${holder ? `,where:{holder:"${holder}"}` : ''}) {
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
