import { gql } from 'graphql-request'

export default function getQueryTokenForOGImage(
  marketName: string,
  tokenName: string
): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - 604800
  return gql`
    {
      ideaMarkets(where: { name: "${marketName}" }) {
        tokens(where: { name: "${tokenName}" }) {
          name
          rank
          latestPricePoint {
            price
          }
          pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
            oldPrice
            price
          }
          dayVolume
          dayChange
        }
      }
    }`
}
