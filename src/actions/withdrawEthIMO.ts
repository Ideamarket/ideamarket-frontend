import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'

export default function withdrawEthIMO(amountBN: BN) {
  const sushiStaking = useContractStore.getState().sushiStakingContract
  const contractCall = sushiStaking.methods.withdraw(0, amountBN)
  return contractCall.send()
}
