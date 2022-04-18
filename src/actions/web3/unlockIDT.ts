import { useWalletStore } from 'store/walletStore'
import { useContractStore } from 'store/contractStore'
import { getL1Network, NETWORK } from 'store/networks'

/**
 * Withdraw IDT that are currently locked so they are no longer locked.
 * @param idtAddress -- address of IDT that is being unlocked
 * @param untils -- array of expiration dates (in seconds) that will be unlocked. Used to find different locking instances.
 */
export default function unlockIDT(
  idtAddress: string,
  untils: number[],
  isL1: boolean
) {
  const userAddress = useWalletStore.getState().address
  const vaultContractL2 = useContractStore.getState().ideaTokenVaultContract

  const l1Network = getL1Network(NETWORK)
  const deployedAddressesL1 = l1Network.getDeployedAddresses()
  const abisL1 = l1Network.getDeployedABIs()
  const web3L1 = useWalletStore.getState().web3

  const ideaTokenVaultContractL1 = new web3L1.eth.Contract(
    abisL1.ideaTokenVault as any,
    deployedAddressesL1.ideaTokenVault,
    { from: web3L1.eth.defaultAccount }
  )

  return isL1
    ? ideaTokenVaultContractL1.methods
        .withdraw(idtAddress, untils, userAddress)
        .send()
    : vaultContractL2.methods.withdraw(idtAddress, untils, userAddress).send()
}
