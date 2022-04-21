import { useContractStore } from 'store/contractStore'

/**
 * Rate an IDT onchain.
 * https://github.com/Ideamarket/blockchain-of-opinions/blob/88eafa1f6698f67a7f24d8ababc4d3aec288bee2/contracts/OpinionBase.sol#L30
 * @param idtAddress -- address of IDT that is being rated
 */
export default function rateIDT(
  idtAddress: string,
  rating: number,
  comment: string
) {
  const addressOpinionBase = useContractStore.getState().addressOpinionBase
  return addressOpinionBase.methods
    .writeOpinion(idtAddress, rating, comment)
    .send()
}
