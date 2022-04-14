import React, { useContext } from 'react'
import ModalService from 'components/modals/ModalService'
import Image from 'next/image'
import ProfileSettingsModal from './ProfileSettingsModal'
import { BiCog, BiWallet } from 'react-icons/bi'
import { MdOutlineEmail } from 'react-icons/md'
import { BsFillBellFill } from 'react-icons/bs'
import SpearkIcon from '../../assets/speaker.svg'
import { GlobalContext } from 'lib/GlobalContext'
import { useWeb3React } from '@web3-react/core'
import { ClipboardCopyIcon } from '@heroicons/react/outline'
import copy from 'copy-to-clipboard'
import { getURL } from 'utils/seo-constants'
import toast from 'react-hot-toast'
import A from 'components/A'

interface Props {
  userData?: any
}

const ProfileGeneralInfo: React.FC<Props> = ({ userData }) => {
  const {
    user: {
      bio,
      profilePhoto: connectedProfilePhoto,
      username: connectedUsername,
      email,
      walletAddress,
    },
  } = useContext(GlobalContext)
  const { account } = useWeb3React()

  const onClickSettings = () => {
    ModalService.open(ProfileSettingsModal)
  }

  const copyProfileURL = () => {
    const url = userData
      ? `${getURL()}/u/${userData?.username}`
      : `${getURL()}/u/${connectedUsername}`
    copy(url)
    toast.success('Copied profile URL')
  }

  const isPublicProfile = userData // Is this a public profile being viewed
  const isUserSignedIn = walletAddress // If there is a user wallet address, then someone is signed in
  const username = isPublicProfile ? userData?.username : connectedUsername
  const address = isPublicProfile ? userData?.walletAddress : account
  const profilePhoto = isPublicProfile
    ? userData?.profilePhoto
    : connectedProfilePhoto

  return (
    <>
      {/* Desktop top section of account page */}
      <div className="hidden md:block">
        <div className="text-base opacity-50 mb-4">My Profile</div>

        <div className="flex justify-between mb-6">
          {/* User image/name/bio/address and email prompt if haven't provided it yet */}
          <div className="mb-10">
            <div className="relative w-20 h-20 mb-4 rounded-full bg-gray-400 overflow-hidden">
              {profilePhoto && (
                <Image
                  src={profilePhoto}
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              )}
            </div>

            <div className="text-lg">{username}</div>

            <div className="text-xs opacity-70 max-w-[15rem] mt-1">
              {bio || ''}
            </div>

            {address && (
              <div className="flex items-center space-x-1 text-sm">
                <BiWallet className="w-5 h-5" />
                <A href={`https://arbiscan.io/address/${address}`} className="">
                  {`${address?.slice(0, 10)}...${address?.slice(-8)}`}
                </A>
              </div>
            )}

            {isUserSignedIn && !email && (
              <div className="flex flex-col w-full md:w-auto">
                <div className="flex opacity-70 items-center">
                  <MdOutlineEmail className="w-5 h-5" />
                  <span className="uppercase text-xs ml-1 font-medium">
                    Email Address
                  </span>
                </div>

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

            {!isPublicProfile && isUserSignedIn && (
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
              {profilePhoto && (
                <Image
                  src={profilePhoto}
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              )}
            </div>

            <div className="text-lg text-center">{username}</div>

            <div className="text-xs text-center opacity-70 max-w-[15rem] mt-1">
              {bio || ''}
            </div>

            {address && (
              <div className="flex justify-center items-center space-x-1 text-sm">
                <BiWallet className="w-5 h-5" />
                <A href={`https://arbiscan.io/address/${address}`} className="">
                  {`${address?.slice(0, 10)}...${address?.slice(-8)}`}
                </A>
              </div>
            )}

            {isUserSignedIn && !email && (
              <div className="flex flex-col w-full mx-auto">
                <div className="flex opacity-70 items-center">
                  <MdOutlineEmail className="w-5 h-5" />
                  <span className="uppercase text-xs ml-1 font-medium">
                    Email Address
                  </span>
                </div>

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

            {!isPublicProfile && isUserSignedIn && (
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
