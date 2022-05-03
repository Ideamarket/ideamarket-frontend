import { useState, useEffect, useMemo } from 'react'
import { useContractStore } from 'store/contractStore'
import {
  getClaimAmount,
  getMerkleRoot,
  isAddressInMerkleRoot,
} from 'utils/merkleRoot'
import { AIRDROP_TYPES } from 'types/airdropTypes'

export const getMerkleContract = (
  airdropType: AIRDROP_TYPES,
  contractStore: any
) => {
  if (airdropType === AIRDROP_TYPES.USER) {
    return contractStore.merkleDistributorContract
  }
  if (airdropType === AIRDROP_TYPES.COMMUNITY) {
    return contractStore.communityMerkleDistributorContract
  }
  if (airdropType === AIRDROP_TYPES.LOCKING) {
    return contractStore.lockingMerkleDistributorContract
  }
  if (airdropType === AIRDROP_TYPES.LOCKING2) {
    return contractStore.locking2MerkleDistributorContract
  }
  if (airdropType === AIRDROP_TYPES.LOCKING3) {
    return contractStore.locking3MerkleDistributorContract
  }
  return contractStore.twitterVerifyMerkleDistributor
}

const useClaimable = (
  address: string,
  airdropType: AIRDROP_TYPES,
  isGettingAllClaimTokens?: boolean
) => {
  const [balance, setBalance] = useState(0)
  const merkleDistributorContract = useMemo(() => {
    return getMerkleContract(airdropType, useContractStore.getState())
  }, [airdropType])

  const MerkleRoot = getMerkleRoot(airdropType)

  useEffect(() => {
    const run = async () => {
      if (
        !isAddressInMerkleRoot(address, airdropType) ||
        !merkleDistributorContract
      ) {
        setBalance(0)
        return
      }

      try {
        const isClaimed = await merkleDistributorContract.methods
          .isClaimed(MerkleRoot.claims[address].index)
          .call()

        const claimableIMO = getClaimAmount(address, airdropType)
        if (isClaimed && !isGettingAllClaimTokens) setBalance(0)
        else setBalance(claimableIMO)
      } catch (error) {
        setBalance(0)
      }
    }

    run()
  }, [
    address,
    merkleDistributorContract,
    airdropType,
    MerkleRoot,
    isGettingAllClaimTokens,
  ])

  return balance
}

export default useClaimable
