import MerkleRoot from 'assets/merkle-root.json'
import { useContractStore } from 'store/contractStore'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'

export default function claimIMO(address: string) {
  if (isAddressInMerkleRoot(address)) {
    const claim = MerkleRoot.claims[address]

    const merkleDistributorContract =
      useContractStore.getState().merkleDistributorContract
    return merkleDistributorContract.methods
      .claim(claim?.index, address, claim?.amount, claim?.proof)
      .send()
  }
}
