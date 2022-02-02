import UserMerkleRoot from 'assets/merkle-root.json'
import CommunityMerkleRoot from 'assets/community-merkle-root.json'
import { useContractStore } from 'store/contractStore'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'

export default function claimIMO(address: string, isCommunityAirdrop: boolean) {
  const MerkleRoot = isCommunityAirdrop ? CommunityMerkleRoot : UserMerkleRoot
  if (isAddressInMerkleRoot(address, isCommunityAirdrop)) {
    const claim = MerkleRoot.claims[address]

    const merkleDistributorContract = isCommunityAirdrop
      ? useContractStore.getState().communityMerkleDistributorContract
      : useContractStore.getState().merkleDistributorContract
    return merkleDistributorContract.methods
      .claim(claim?.index, address, claim?.amount, claim?.proof)
      .send()
  }
}
