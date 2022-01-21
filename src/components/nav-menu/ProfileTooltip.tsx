import { IdentificationIcon, MailIcon } from '@heroicons/react/solid'
import { IoIosWallet } from 'react-icons/io'
import { BiCog } from 'react-icons/bi'
import { IoMdExit } from 'react-icons/io'
import Link from 'next/link'
import ModalService from 'components/modals/ModalService'
import ProfileSettingsModal from 'components/account/ProfileSettingsModal'
import { disconnectWalletConnector } from 'wallets/connectors'
import { unsetWeb3 } from 'store/walletStore'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { GlobalContext } from 'lib/GlobalContext'
import { BsFillBellFill } from 'react-icons/bs'
import SpearkIcon from '../../assets/speaker.svg'

export const ProfileTooltip = ({
  onLoginClicked,
}: {
  onLoginClicked: () => void
}) => {
  const { user, jwtToken } = useContext(GlobalContext)
  const { active, connector, deactivate } = useWeb3React()
  const router = useRouter()

  const isSignedIn = active && jwtToken

  const onClickSettings = () => {
    ModalService.open(ProfileSettingsModal)
  }
  const onClickDisconnectWallet = async () => {
    await disconnectWalletConnector(connector)

    try {
      await deactivate()
    } catch (ex) {
      console.log(ex)
    }
    unsetWeb3()
    router.push('/')
  }

  return (
    <div className="flex flex-col w-32 md:w-64 dark:text-black">
      {!isSignedIn && (
        <div
          onClick={() => onLoginClicked()}
          className="cursor-pointer flex items-center py-3 px-4 hover:bg-brand-gray"
        >
          <IdentificationIcon className="w-6 h-6 text-gray-400" />
          <div className="ml-2">Create Account</div>
        </div>
      )}
      {isSignedIn && !Boolean(user.email) && (
        <>
          <div
            className="cursor-pointer flex items-center py-3 px-4 hover:bg-brand-gray"
            onClick={onClickSettings}
          >
            <MailIcon className="w-6 h-6  text-gray-400" />
            <span className="ml-2 font-medium">Connect Email</span>
          </div>

          <div className="py-2 px-4 bg-brand-blue text-center">
            <span className="text-white">
              <BsFillBellFill className="w-4 h-4 text-yellow-1" /> receive
              notificaions, updates <br />
              and announcements <SpearkIcon className="w-4 h-4" />
            </span>
          </div>
        </>
      )}
      <Link href="/account">
        <div className="cursor-pointer flex items-center py-3 px-4 border-t border-gray-100 hover:bg-brand-gray">
          <IoIosWallet className="w-6 h-6  text-gray-400" />
          <span className="ml-2 font-medium">Wallet/Profile</span>
        </div>
      </Link>
      {isSignedIn && (
        <div
          className="cursor-pointer flex items-center py-3 px-4 border-t border-gray-100 hover:bg-brand-gray"
          onClick={onClickSettings}
        >
          <BiCog className="w-6 h-6  text-gray-400" />
          <span className="ml-2 font-medium">Settings</span>
        </div>
      )}
      <div
        className="cursor-pointer flex items-center py-3 px-4 border-t border-gray-100 hover:bg-brand-gray"
        onClick={onClickDisconnectWallet}
      >
        <IoMdExit className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Disconnect Wallet</span>
      </div>
    </div>
  )
}
