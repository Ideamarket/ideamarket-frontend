import { MailIcon } from '@heroicons/react/solid'
import { IoIosWallet } from 'react-icons/io'
import { BiCog } from 'react-icons/bi'
import { IoMdExit } from 'react-icons/io'
import { FiUserPlus } from 'react-icons/fi'
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

export const AccountOptionsInterface = ({
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
    <div className="flex flex-col w-full md:w-60 dark:text-black md:w-auto">
      {!isSignedIn && (
        <div
          onClick={() => onLoginClicked()}
          className="cursor-pointer flex items-center py-4 px-5 hover:bg-brand-gray"
        >
          <FiUserPlus className="w-6 h-6 text-gray-400" />
          <div className="ml-2">
            <p className="font-medium">Create Account</p>
            <p className="mt-1 text-gray-300 text-xs">Use Connected Wallet</p>
          </div>
        </div>
      )}
      {isSignedIn && !Boolean(user.email) && (
        <>
          <div
            className="cursor-pointer flex items-center py-4 px-5 hover:bg-brand-gray"
            onClick={onClickSettings}
          >
            <MailIcon className="w-6 h-6  text-gray-400" />
            <span className="ml-2 font-medium">Connect Email</span>
          </div>

          <div className="py-2 px-4 bg-brand-blue text-center flex items-center">
            <BsFillBellFill className="w-6 h-6 text-yellow-1" />
            <span className="text-white">
              receive notificaions, updates <br />
              and announcements
            </span>
            <SpearkIcon className="w-6 h-6" />
          </div>
        </>
      )}
      <Link href="/account">
        <div className="cursor-pointer flex items-center py-4 px-5 border-t border-gray-100 hover:bg-brand-gray">
          <IoIosWallet className="w-6 h-6  text-gray-400" />
          <span className="ml-2 font-medium">Wallet/Profile</span>
        </div>
      </Link>
      {isSignedIn && (
        <div
          className="cursor-pointer flex items-center py-4 px-5 border-t border-gray-100 hover:bg-brand-gray"
          onClick={onClickSettings}
        >
          <BiCog className="w-6 h-6  text-gray-400" />
          <span className="ml-2 font-medium">Settings</span>
        </div>
      )}
      <div
        className="cursor-pointer flex items-center py-4 px-5 border-t border-gray-100 hover:bg-brand-gray"
        onClick={onClickDisconnectWallet}
      >
        <IoMdExit className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Disconnect Wallet</span>
      </div>
    </div>
  )
}
