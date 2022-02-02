import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'

export default function withdrawEthIMO(amountBN: BN) {
  const imoStaking = useContractStore.getState().sushiStakingContract
  const contractCall = imoStaking.methods.withdraw(0, amountBN)
  return contractCall.send()
}
