// import ModalService from 'components/modals/ModalService'
// import ProfileSettingsModal from 'components/account/ProfileSettingsModal'
// import { disconnectWalletConnector } from 'wallets/connectors'
// import { unsetWeb3 } from 'store/walletStore'
// import { useWeb3React } from '@web3-react/core'
// import { useRouter } from 'next/router'
// import { useContext } from 'react'
// import { GlobalContext } from 'lib/GlobalContext'
import WalletInterfaceDropdown from './WalletInterfaceDropdown'

export const WalletTooltip = ({ openModal }: { openModal: () => void }) => {
  if (openModal) {
  }
  // const { user, signedWalletAddress } = useContext(GlobalContext)
  // const { active, connector, deactivate } = useWeb3React()
  // const router = useRouter()

  // const isSignedIn =
  //   active && signedWalletAddress?.signature && signedWalletAddress?.message

  // const onClickSettings = () => {
  //   ModalService.open(ProfileSettingsModal)
  // }
  // const onClickDisconnectWallet = async () => {
  //   await disconnectWalletConnector(connector)

  //   try {
  //     await deactivate()
  //   } catch (ex) {
  //     console.log(ex)
  //   }
  //   unsetWeb3()
  //   router.push('/')
  // }

  return (
    <div className="flex flex-col dark:text-black w-28 md:w-60">
      <WalletInterfaceDropdown />
    </div>
  )
}
