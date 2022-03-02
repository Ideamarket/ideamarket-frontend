import UserMerkleRoot from 'assets/merkle-root.json'
import CommunityMerkleRoot from 'assets/community-merkle-root.json'
import LockingMerkleRoot from 'assets/locking-merkle-root.json'
import TwitterVerifyMerkleRoot from 'assets/twitter-verify-merkle-root.json'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { bigNumberTenPow18, web3BNToFloatString } from 'utils'
import { AIRDROP_TYPES } from 'types/airdropTypes'

export const IMOTokenAddress = '0xd029F0688460a17051c3Dd0CeBD9aa7e391bAd5D'

export const getMerkleRoot = (airdropType: AIRDROP_TYPES) => {
  if (airdropType === AIRDROP_TYPES.USER) {
    return UserMerkleRoot
  }
  if (airdropType === AIRDROP_TYPES.COMMUNITY) {
    return CommunityMerkleRoot
  }
  if (airdropType === AIRDROP_TYPES.LOCKING) {
    return LockingMerkleRoot
  }
  return TwitterVerifyMerkleRoot
}

export const isAddressInMerkleRoot = (
  address: string,
  airdropType: AIRDROP_TYPES
) => {
  const MerkleRoot = getMerkleRoot(airdropType)
  return MerkleRoot.claims.hasOwnProperty(address)
}

export const getClaimAmount = (address: string, airdropType: AIRDROP_TYPES) => {
  const MerkleRoot = getMerkleRoot(airdropType)

  if (isAddressInMerkleRoot(address, airdropType)) {
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
