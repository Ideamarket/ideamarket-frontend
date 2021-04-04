import { gql } from 'graphql-request'
const WEEK_SECONDS = 604800

export default function getQueryTokenForOGImage(
  marketName: string,
  tokenName: string
): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS
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
