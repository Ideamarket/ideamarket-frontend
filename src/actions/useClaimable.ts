import { useState, useEffect, useMemo } from 'react'
import { useContractStore } from 'store/contractStore'
import UserMerkleRoot from 'assets/merkle-root.json'
import CommunityMerkleRoot from 'assets/community-merkle-root.json'
import { getClaimAmount, isAddressInMerkleRoot } from 'utils/merkleRoot'

const useClaimable = (
  address: string,
  isCommunityAirdrop: boolean,
  isGettingAllClaimTokens?: boolean
) => {
  const [balance, setBalance] = useState(0)
  const merkleDistributorContract = useMemo(() => {
    return isCommunityAirdrop
      ? useContractStore.getState().communityMerkleDistributorContract
      : useContractStore.getState().merkleDistributorContract
  }, [isCommunityAirdrop])

  const MerkleRoot = isCommunityAirdrop ? CommunityMerkleRoot : UserMerkleRoot

  useEffect(() => {
    const run = async () => {
      if (!isAddressInMerkleRoot(address, isCommunityAirdrop)) {
        setBalance(0)
        return
      }

      try {
        const isClaimed = await merkleDistributorContract.methods
          .isClaimed(MerkleRoot.claims[address].index)
          .call()

        const claimableIMO = getClaimAmount(address, isCommunityAirdrop)
        if (isClaimed && !isGettingAllClaimTokens) setBalance(0)
        else setBalance(claimableIMO)
      } catch (error) {
        setBalance(0)
      }
    }

    run()
  }, [address, merkleDistributorContract, isCommunityAirdrop, MerkleRoot])

  return balance
}

export default useClaimable
