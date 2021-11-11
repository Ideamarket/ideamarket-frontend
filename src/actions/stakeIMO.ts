import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'

export default function stakeIMO(amountBN: BN) {
  const imoStaking = useContractStore.getState().imoStakingContract
  const contractCall = imoStaking.methods.deposit(amountBN)
  return contractCall.send()
}
