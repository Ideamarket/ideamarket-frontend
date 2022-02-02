import UserMerkleRoot from 'assets/merkle-root.json'
import CommunityMerkleRoot from 'assets/community-merkle-root.json'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { bigNumberTenPow18, web3BNToFloatString } from 'utils'

export const IMOTokenAddress = '0xd029F0688460a17051c3Dd0CeBD9aa7e391bAd5D'

export const isAddressInMerkleRoot = (
  address: string,
  isCommunityAirdrop: boolean
) => {
  const MerkleRoot = isCommunityAirdrop ? CommunityMerkleRoot : UserMerkleRoot
  return MerkleRoot.claims.hasOwnProperty(address)
}

export const getClaimAmount = (
  address: string,
  isCommunityAirdrop: boolean
) => {
  const MerkleRoot = isCommunityAirdrop ? CommunityMerkleRoot : UserMerkleRoot

  console.log(
    'address',
    address,
    isCommunityAirdrop,
    isAddressInMerkleRoot(address, isCommunityAirdrop)
  )
  if (isAddressInMerkleRoot(address, isCommunityAirdrop)) {
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
