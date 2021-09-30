import { useState, useEffect } from 'react'
import { useContractStore } from 'store/contractStore'
import MerkleRoot from 'assets/merkle-root.json'
import { getClaimAmount, isAddressInMerkleRoot } from 'utils/merkleRoot'

const useClaimable = (address: string) => {
  const [balance, setBalance] = useState(0)
  const merkleDistributorContract =
    useContractStore.getState().merkleDistributorContract

  useEffect(() => {
    const run = async () => {
      if (!isAddressInMerkleRoot(address)) {
        setBalance(0)
        return
      }

      try {
        const isClaimed = await merkleDistributorContract.methods
          .isClaimed(MerkleRoot.claims[address].index)
          .call()

        const claimableIMO = getClaimAmount(address)
        if (isClaimed) setBalance(0)
        else setBalance(claimableIMO)
      } catch (error) {
        setBalance(0)
      }
    }

    run()
  }, [address, merkleDistributorContract])

  return balance
}

export default useClaimable
