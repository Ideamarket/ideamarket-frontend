import { gql } from 'graphql-request'

export default function getQueryLockedTokens({
  ownerAddress,
  first,
  skip,
}: {
  ownerAddress: string
  first: number
  skip: number
}) {
  const now = Math.floor(Date.now() / 1000)

  return gql`
    {
      lockedIdeaTokenAmounts(first: ${first}, skip: ${skip}, where:{owner:${
    '"' + ownerAddress.toLowerCase() + '"'
  }, lockedUntil_gt:${now}}) {
        amount
        lockedUntil
        token {
          id
          name
          supply
          tokenOwner
          dayChange
          market {
            marketID
            name
            baseCost
            priceRise
            hatchTokens
            tradingFeeRate
            platformFeeRate
            platformOwner
            platformFeeInvested
            nameVerifier
          }
        }
      }
    }`
}
