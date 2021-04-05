import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import type { NextApiRequest, NextApiResponse } from 'next'
import { request, gql } from 'graphql-request'

export type TokenAmount = {
  name: string
  rank: number
  market: string
  dayChange: number
  price: number
  lockedPercentage: number
  marketCap: number
  stats: {
    amount: number
    holders: number
    timestamp: number
  }
}

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK
  ? process.env.NEXT_PUBLIC_NETWORK
  : 'rinkeby'

const HTTP_GRAPHQL_ENDPOINT =
  NETWORK === 'rinkeby'
    ? 'https://subgraph-rinkeby.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketRINKEBY'
    : NETWORK === 'test'
    ? 'https://subgraph-test.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTEST'
    : 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket'

function capitalize(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

type Balance = {
  amount: string
  holder: string
  id: string
  token: {
    name: string
    rank: number
    dayChange: number
    latestPricePoint: {
      price: number
      timestamp: number
    }
    market: {
      name: string
    }
    lockedPercentage: number
    marketCap: number
  }
}

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenAmount[]>
) {
  const rawMarket = req.query.market as string
  const rawToken = req.query.token as string
  const marketSpecifics = getMarketSpecificsByMarketNameInURLRepresentation(
    rawMarket
  )
  const market = marketSpecifics.getMarketName()
  const token = marketSpecifics.getTokenNameFromURLRepresentation(rawToken)

  const holdersOfTokenQuery = gql`
    {
      ideaMarkets(where: { name: "${market}" }) {
        tokens(where: { name: "${token}" }) {
          balances {
            id
            holder
            amount
            token {
              name
            }
          }
        }
      }
    }
  `

  const response = await request(HTTP_GRAPHQL_ENDPOINT, holdersOfTokenQuery)
  const holdersList =
    response?.ideaMarkets[0]?.tokens[0]?.balances?.map(
      (balance) => balance.holder
    ) ?? []

  let holdersListString = '['
  holdersList.forEach((holder) => {
    holdersListString = holdersListString + `"${holder}"`
  })
  holdersListString = holdersListString + ']'

  const query = gql`
      {
        ideaTokenBalances(where: { holder_in: ${holdersListString} }) {
            id
            amount
            token {
                name
                rank
                dayChange
                market {
                  name
                }
                latestPricePoint {
                  price
                  timestamp
                }
                lockedPercentage
                marketCap
            }
        }
      }  
    `
  const balances: Balance[] = (await request(HTTP_GRAPHQL_ENDPOINT, query))
    .ideaTokenBalances
  let tokensWithDuplicates = balances
    .filter((balance) => balance.token.market.name === market)
    .filter((_balance) => _balance.token.name !== token)
    .map((balance) => balance.token.name)

  //@ts-ignore
  const tokens = [...new Set(tokensWithDuplicates)]
  const tokensAmount: TokenAmount[] = []
  tokens.forEach((token) => {
    const tokenData = balances.find((balance) => balance.token.name === token)
      .token
    tokensAmount.push({
      rank: tokenData.rank,
      price: Number(Number(tokenData.latestPricePoint.price).toFixed(2)),
      name: tokenData.name,
      market: tokenData.market.name,
      dayChange: Number((Number(tokenData.dayChange) * 100).toFixed(2)),
      lockedPercentage: Number(tokenData.lockedPercentage),
      marketCap: Number(Number(tokenData.marketCap).toFixed(2)),
      stats: {
        timestamp: tokenData.latestPricePoint.timestamp,
        amount: Number(
          Number(
            balances
              .filter((balance) => balance.token.name === token)
              .map((balance) => Number(balance.amount) / 1e18)
              .reduce((a, b) => a + b, 0)
          ).toFixed(2)
        ),
        holders: balances.filter((balance) => balance.token.name === token)
          .length,
      },
    })
  })
  tokensAmount.sort((a, b) => b.stats.amount - a.stats.amount)
  res.status(200).json(tokensAmount)
}
