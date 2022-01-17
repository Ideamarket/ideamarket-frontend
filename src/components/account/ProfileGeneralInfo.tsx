import React, { useContext, useState } from 'react'
import ModalService from 'components/modals/ModalService'
import Image from 'next/image'
import ProfileSettingsModal from './ProfileSettingsModal'
import { BsToggleOff, BsToggleOn } from 'react-icons/bs'
import { BiCog, BiWallet } from 'react-icons/bi'
import { MdOutlineEmail } from 'react-icons/md'
import { BsFillBellFill } from 'react-icons/bs'
import { IoMdExit } from 'react-icons/io'
import SpearkIcon from '../../assets/speaker.svg'
import { GlobalContext } from 'lib/GlobalContext'

interface Props {}

const ProfileGeneralInfo: React.FC<Props> = () => {
  const [isPublicView, toggleView] = useState<Boolean>(false)
  const { user } = useContext(GlobalContext)

  const onClickSettings = () => {
    ModalService.open(ProfileSettingsModal)
  }

  return (
    <>
      <div className="flex justify-between mb-6 font-sf-compact-medium">
        <span className="text-base opacity-50">My Profile</span>
        <div className="grid grid-cols-2 gap-4 text-xs opacity-75">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => toggleView((c) => !c)}
          >
            {isPublicView ? (
              <BsToggleOff className="w-6 h-6" />
            ) : (
              <BsToggleOn className="w-6 h-6" />
            )}

            <span className="ml-1">Public View</span>
          </div>
          <div
            className="flex items-center cursor-pointer"
            onClick={onClickSettings}
          >
            <BiCog className="w-6 h-6" />
            <span className="ml-1">Settings</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-10 flex-col md:flex-row">
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-20 h-20 rounded-full bg-gray-400 overflow-hidden">
            {Boolean(user.profilePhoto) && (
              <Image
                src={user.profilePhoto}
                alt="Workflow logo"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            )}
          </div>
          <div className="ml-6 font-sans">
            <p className="text-lg">{user.username}</p>
            <p className="text-xs opacity-70 max-w-[15rem] mt-1">
              {!isPublicView || user.visibilityOptions.bio ? user.bio : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-col font-inter w-full md:w-auto my-8 md:my-0">
          <div className="flex opacity-70 items-center">
            <BiWallet className="w-5 h-5" />
            <span className="uppercase text-xs ml-1 font-medium">
              Eth Address
            </span>
          </div>
          <span className="text-sm mt-2 font-normal">
            {(!isPublicView || user.visibilityOptions.ethAddress) &&
            user.walletAddress
              ? `${user.walletAddress?.slice(
                  0,
                  10
                )}...${user.walletAddress?.slice(-8)}`
              : ''}
          </span>
        </div>
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex opacity-70 items-center">
            <MdOutlineEmail className="w-5 h-5" />
            <span className="uppercase text-xs ml-1 font-medium">
              Email Address
            </span>
          </div>
          <div className="bg-brand-blue rounded-lg font-bold my-2">
            <div className="rounded-lg p-4 bg-white flex">
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
              <div className="cursor-pointer ml-auto my-2 font-sans opacity-50 font-normal flex items-center">
                <span className="mr-1">Learn more</span>
                <IoMdExit className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileGeneralInfo
