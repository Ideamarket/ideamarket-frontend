import MerkleRoot from 'assets/merkle-root.json'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { bigNumberTenPow18, web3BNToFloatString } from 'utils'

export const IMOTokenAddress = '0xd029F0688460a17051c3Dd0CeBD9aa7e391bAd5D'

export const isAddressInMerkleRoot = (address: string) => {
  return MerkleRoot.claims.hasOwnProperty(address)
}

export const getClaimAmount = (address: string) => {
  if (isAddressInMerkleRoot(address)) {
    const amount = MerkleRoot.claims[address].amount
    return parseFloat(
      web3BNToFloatString(
        new BN(new BigNumber(amount).toFixed()),
        bigNumberTenPow18,
        0,
        BigNumber.ROUND_DOWN
      )
    )
  }

  return 0
}
