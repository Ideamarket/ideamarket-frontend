import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'

export default function withdrawxIMO(amountBN: BN) {
  const imoStaking = useContractStore.getState().imoStakingContract
  const contractCall = imoStaking.methods.withdraw(amountBN)
  return contractCall.send()
}
