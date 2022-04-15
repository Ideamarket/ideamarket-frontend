import React, { useContext } from 'react'
import ModalService from 'components/modals/ModalService'
import Image from 'next/image'
import ProfileSettingsModal from './ProfileSettingsModal'
import { BiCog, BiWallet } from 'react-icons/bi'
import { BsFillBellFill } from 'react-icons/bs'
import SpearkIcon from '../../assets/speaker.svg'
import { ClipboardCopyIcon } from '@heroicons/react/outline'
import copy from 'copy-to-clipboard'
import { getURL } from 'utils/seo-constants'
import toast from 'react-hot-toast'
import A from 'components/A'
import { useWeb3React } from '@web3-react/core'
import { getSignedInWalletAddress } from 'lib/utils/web3-eth'
import useAuth from './useAuth'
import CreateAccountModal from './CreateAccountModal'
import { GlobalContext } from 'lib/GlobalContext'

interface Props {
  userData?: any
}

const ProfileGeneralInfo: React.FC<Props> = ({ userData }) => {
  const { account, active, library } = useWeb3React()

  const { jwtToken } = useContext(GlobalContext)

  const { loginByWallet } = useAuth()

  const onLoginClicked = async () => {
    if (active) {
      const signedWalletAddress = await getSignedInWalletAddress({
        account,
        library,
      })
      return await loginByWallet(signedWalletAddress)
    }

    return null
  }

  const onClickSettings = async () => {
    // if jwtToken is not present, then popup modal and MM popup to ask user to create account or sign in
    if (!jwtToken) {
      ModalService.open(CreateAccountModal, {})
      const isLoginSuccess = await onLoginClicked()
      ModalService.closeAll() // Get weird errors without this due to modal being closed inside CreateAccountModal in useEffect
      if (isLoginSuccess) {
        ModalService.open(ProfileSettingsModal)
      }

      return
    }

    ModalService.open(ProfileSettingsModal)
  }

  const copyProfileURL = () => {
    const url = `${getURL()}/u/${
      userData && userData?.username
        ? userData?.username
        : userData?.walletAddress
    }`
    copy(url)
    toast.success('Copied profile URL')
  }

  // If true, then show settings button so wallet owners can change their settings
  const isConnectedWalletSameAsPublicWallet =
    userData &&
    userData?.walletAddress &&
    account &&
    userData?.walletAddress === account

  return (
    <>
      {/* Desktop top section of account page */}
      <div className="hidden md:block">
        <div className="text-base opacity-50 mb-4">My Profile</div>

        <div className="flex justify-between mb-6">
          {/* User image/name/bio/address and email prompt if haven't provided it yet */}
          <div className="mb-10">
            <div className="relative w-20 h-20 mb-4 rounded-full bg-gray-400 overflow-hidden">
              {userData?.profilePhoto && (
                <Image
                  src={userData?.profilePhoto}
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              )}
            </div>

            <div className="text-xl font-bold">{userData?.username}</div>

            <div className="text-xs opacity-70 max-w-[15rem] mt-1">
              {userData?.bio || ''}
            </div>

            {userData?.walletAddress && (
              <div className="flex items-center space-x-1 text-sm">
                <BiWallet className="w-5 h-5" />
                <A
                  href={`https://arbiscan.io/address/${userData?.walletAddress}`}
                  className=""
                >
                  {`${userData?.walletAddress?.slice(
                    0,
                    10
                  )}...${userData?.walletAddress?.slice(-8)}`}
                </A>
              </div>
            )}

            {isConnectedWalletSameAsPublicWallet && !userData?.email && (
              <div className="flex flex-col mt-1">
                <div className="bg-brand-blue rounded-lg font-bold my-2">
                  <div
                    onClick={onClickSettings}
                    className="rounded-lg p-4 bg-white flex cursor-pointer"
                  >
                    <span className="text-brand-blue m-auto font-sf-compact-medium tracking-wider text-sm">
                      Connect Email
                    </span>
                  </div>
                  <div className="p-2 text-xs flex flex-col">
                    <div className="flex">
                      <span className="ml-1">
                        <BsFillBellFill className="w-4 h-4 text-yellow-1" />{' '}
                        receive notificaions, updates <br />
                        and announcements <SpearkIcon className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side of top section on desktop */}

          <div className="w-48">
            <div className="pt-3 mb-2 border rounded-lg">
              <div className="px-3 italic font-light text-white/[.7] text-xs leading-tight">
                "Don't tell me what you believe, show me your portfolio."
              </div>
              <div className="px-3 text-right my-2 text-xs">
                —Nassim Nicholas Taleb
              </div>

              <button
                type="button"
                onClick={copyProfileURL}
                className="flex justify-center items-center space-x-1 w-full h-10 px-2 bg-white hover:bg-white/[.7] rounded-lg text-black dark:bg-gray-600 dark:text-gray-300"
              >
                <ClipboardCopyIcon className="w-6 h-6" />
                <span>Share</span>
              </button>
            </div>

            {isConnectedWalletSameAsPublicWallet && (
              <button
                type="button"
                className="flex justify-center items-center space-x-1 w-full h-10 px-2 bg-white/[.15] hover:bg-white/[.1] rounded-lg text-white"
                onClick={onClickSettings}
              >
                <BiCog className="w-6 h-6" />
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile top section of account page */}
      <div className="block md:hidden max-w-[17rem] mx-auto">
        <div className="text-base opacity-50 mb-4">My Profile</div>

        <div className="mb-6">
          {/* User image/name/bio/address and email prompt if haven't provided it yet */}
          <div className="mb-10">
            <div className="relative w-20 h-20 mb-4 mx-auto rounded-full bg-gray-400 overflow-hidden">
              {userData?.profilePhoto && (
                <Image
                  src={userData?.profilePhoto}
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              )}
            </div>

            <div className="text-xl font-bold text-center">
              {userData?.username}
            </div>

            <div className="text-xs text-center opacity-70 max-w-[15rem] mt-1">
              {userData?.bio || ''}
            </div>

            {userData?.walletAddress && (
              <div className="flex justify-center items-center space-x-1 text-sm">
                <BiWallet className="w-5 h-5" />
                <A
                  href={`https://arbiscan.io/address/${userData?.walletAddress}`}
                  className=""
                >
                  {`${userData?.walletAddress?.slice(
                    0,
                    10
                  )}...${userData?.walletAddress?.slice(-8)}`}
                </A>
              </div>
            )}

            {isConnectedWalletSameAsPublicWallet && !userData?.email && (
              <div className="flex flex-col w-full mx-auto mt-1">
                <div className="bg-brand-blue rounded-lg font-bold my-2">
                  <div
                    onClick={onClickSettings}
                    className="rounded-lg p-4 bg-white flex cursor-pointer"
                  >
                    <span className="text-brand-blue m-auto font-sf-compact-medium tracking-wider text-sm">
                      Connect Email
                    </span>
                  </div>
                  <div className="p-2 text-xs flex flex-col">
                    <div className="flex">
                      <span className="ml-1">
                        <BsFillBellFill className="w-4 h-4 text-yellow-1" />{' '}
                        receive notificaions, updates <br />
                        and announcements <SpearkIcon className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: quote/share/settings */}
          <div className="w-full">
            <div className="pt-3 mb-2 border rounded-lg">
              <div className="px-3 italic font-light text-white/[.7] text-xs leading-tight">
                "Don't tell me what you believe, show me your portfolio."
              </div>
              <div className="px-3 text-right my-2 text-xs">
                —Nassim Nicholas Taleb
              </div>

              <button
                type="button"
                onClick={copyProfileURL}
                className="flex justify-center items-center space-x-1 w-full h-10 px-2 bg-white hover:bg-white/[.7] rounded-lg text-black dark:bg-gray-600 dark:text-gray-300"
              >
                <ClipboardCopyIcon className="w-6 h-6" />
                <span>Share</span>
              </button>
            </div>

            {isConnectedWalletSameAsPublicWallet && (
              <button
                type="button"
                className="flex justify-center items-center space-x-1 w-full h-10 px-2 bg-white/[.15] hover:bg-white/[.1] rounded-lg text-white"
                onClick={onClickSettings}
              >
                <BiCog className="w-6 h-6" />
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileGeneralInfo
