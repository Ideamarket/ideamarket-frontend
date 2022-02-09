import { useContractStore } from 'store/contractStore'
import { AIRDROP_TYPES } from 'types/airdropTypes'
import { getMerkleRoot, isAddressInMerkleRoot } from 'utils/merkleRoot'
import { getMerkleContract } from './useClaimable'

export default function claimIMO(address: string, airdropType: AIRDROP_TYPES) {
  const MerkleRoot = getMerkleRoot(airdropType)
  if (isAddressInMerkleRoot(address, airdropType)) {
    const claim = MerkleRoot.claims[address]

    const merkleDistributorContract = getMerkleContract(
      airdropType,
      useContractStore.getState()
    )
    return merkleDistributorContract.methods
      .claim(claim?.index, address, claim?.amount, claim?.proof)
      .send()
  }
}
