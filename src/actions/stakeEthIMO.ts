import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'

export default function stakeEthIMO(amountBN: BN) {
  const sushiStaking = useContractStore.getState().sushiStakingContract
  const contractCall = sushiStaking.methods.deposit(0, amountBN)
  return contractCall.send()
}
