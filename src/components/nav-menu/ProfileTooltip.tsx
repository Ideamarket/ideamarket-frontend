import { MailIcon } from '@heroicons/react/solid'
import { IoIosWallet } from 'react-icons/io'
import { BsArrowLeftRight } from 'react-icons/bs'
import { BiCog } from 'react-icons/bi'
import { IoMdExit } from 'react-icons/io'

export const ProfileTooltip = () => {
  return (
    <div className="flex flex-col w-32 md:w-64">
      <div className="cursor-pointer flex items-center p-2 hover:bg-brand-gray">
        <MailIcon className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Connect Email</span>
      </div>
      <div className="cursor-pointer flex items-center p-2 border-t border-gray-100 hover:bg-brand-gray">
        <IoIosWallet className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Wallet Holdings</span>
      </div>
      <div className="cursor-pointer flex items-center p-2 border-t border-gray-100 hover:bg-brand-gray">
        <BsArrowLeftRight className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Trade History</span>
      </div>
      <div className="cursor-pointer flex items-center p-2 border-t border-gray-100 hover:bg-brand-gray">
        <BiCog className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Settings</span>
      </div>
      <div className="cursor-pointer flex items-center p-2 border-t border-gray-100 hover:bg-brand-gray">
        <IoMdExit className="w-6 h-6  text-gray-400" />
        <span className="ml-2 font-medium">Disconnect Wallet</span>
      </div>
    </div>
  )
}
