import { useWalletStore } from 'store/walletStore'
import { useContractStore } from 'store/contractStore'

export default function listToken(name: string, marketID: number) {
  const userAddress = useWalletStore.getState().address
  const factoryContract = useContractStore.getState().factoryContract
  return factoryContract.methods
    .addToken(name, marketID.toString(), userAddress)
    .send()
}
