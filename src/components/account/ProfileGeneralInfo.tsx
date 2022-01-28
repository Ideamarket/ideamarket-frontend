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

interface Props {
  userData?: any
}

const ProfileGeneralInfo: React.FC<Props> = ({ userData }) => {
  const {
    user: {
      bio,
      profilePhoto: connectedProfilePhoto,
      name,
      username: connectedUsername,
      email,
      walletAddress,
    },
  } = useContext(GlobalContext)
  const { account } = useWeb3React()

  const onClickSettings = () => {
    ModalService.open(ProfileSettingsModal)
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
      <div className="flex justify-between mb-6 font-sf-compact-medium">
        <span className="text-base opacity-50">My Profile</span>
        {!isPublicProfile && isUserSignedIn && (
          <div className="text-xs opacity-75 justify-items-end">
            <div
              className="flex items-center cursor-pointer"
              onClick={onClickSettings}
            >
              <BiCog className="w-6 h-6" />
              <span className="ml-1">Settings</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-10 flex-col md:flex-row">
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-20 h-20 rounded-full overflow-hidden">
            <Image
              src={profilePhoto || '/avatar.png'}
              alt="Profile photo"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <div className="ml-6 font-sans">
            <p className="text-lg">
              {name}
              {Boolean(username) && (
                <span className="ml-1 text-white/50 text-base">
                  @{username}
                </span>
              )}
            </p>
            <p className="text-xs opacity-70 max-w-[15rem] mt-1">{bio || ''}</p>
          </div>
        </div>
        <div className="flex flex-col font-inter w-full md:w-auto my-8 md:my-0">
          {address ? (
            <>
              <div className="flex opacity-70 items-center">
                <BiWallet className="w-5 h-5" />
                <span className="uppercase text-xs ml-1 font-medium">
                  Eth Address
                </span>
              </div>
              <span className="text-sm mt-2 font-normal">
                {`${address?.slice(0, 10)}...${address?.slice(-8)}`}
              </span>
            </>
          ) : (
            ''
          )}
        </div>
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
                    <BsFillBellFill className="w-4 h-4 text-yellow-1" /> receive
                    notificaions, updates <br />
                    and announcements <SpearkIcon className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProfileGeneralInfo
