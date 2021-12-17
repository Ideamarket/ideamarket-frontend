import ClaimPointBreakdownRoot from 'assets/claim_point_breakdown.json'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { bigNumberTenPow18, web3BNToFloatString } from 'utils'

interface ClaimPointBreakdown {
  listing: number
  buying: number
  locking: number
  verifying: number
}

export const isAddressInClaimPointRoot = (address: string) => {
  return ClaimPointBreakdownRoot.hasOwnProperty(address)
}

const parseToFloatFunc = (amount) => {
  return parseFloat(
    web3BNToFloatString(
      new BN(new BigNumber(amount).toFixed()),
      bigNumberTenPow18,
      0,
      BigNumber.ROUND_DOWN
    )
  )
}

export const getClaimPointBreakdown = (
  address: string
): ClaimPointBreakdown[] => {
  if (isAddressInClaimPointRoot(address)) {
    const pointBreakdown = ClaimPointBreakdownRoot[address]
    return [
      {
        listing: parseToFloatFunc(pointBreakdown['listedL1']),
        buying: parseToFloatFunc(pointBreakdown['boughtL1']),
        locking: parseToFloatFunc(pointBreakdown['lockedL1']),
        verifying: parseToFloatFunc(pointBreakdown['verifiedL1']),
      },
      {
        listing: parseToFloatFunc(pointBreakdown['listedL2']),
        buying: parseToFloatFunc(pointBreakdown['boughtL2']),
        locking: parseToFloatFunc(pointBreakdown['lockedL2']),
        verifying: parseToFloatFunc(pointBreakdown['verifiedL2']),
      },
    ]
  }

  return [
    {
      listing: 0,
      buying: 0,
      locking: 0,
      verifying: 0,
    },
    {
      listing: 0,
      buying: 0,
      locking: 0,
      verifying: 0,
    },
  ]
}
