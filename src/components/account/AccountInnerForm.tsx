import Image from 'next/image'
import TabSwitcher from './TabSwitcher'
import SettingsTab from './SettingsTab'
import ProfileTab from './ProfileTab'
import { Footer } from 'components'
import { signOut } from 'next-auth/client'
import { accountTabs } from './constants'
import { AccountContext } from 'pages/account'
import { useContext } from 'react'

const AccountInnerForm = () => {
  const { getValues, isUpdateLoading, cardTab } = useContext(AccountContext)
  const { username, email, ethAddresses, bio, profilePhoto } = getValues()

  return (
    <div className="flex-col items-center justify-center w-screen md:pt-24 margin md:flex font-inter">
      <div className="flex flex-col items-end w-3/4 mb-2">
        <div className="mb-4 text-4xl italic text-white">My Account</div>
        <div>
          <TabSwitcher hasSpaceBetween />
        </div>
      </div>
      <div className="relative flex flex-col items-start justify-center px-6 py-5 bg-white rounded-lg lg:w-4/5 h-3/5 lg:flex-row">
        <div className="relative flex flex-col w-full mt-16 text-center lg:mr-8 lg:w-1/4">
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full -top-24 left-1/2 w-36 h-36">
            <Image
              src={profilePhoto || '/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">USERNAME</div>
            <div className="text-3xl font-semibold">{username ?? ''}</div>
          </div>
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
            <div>{email}</div>
          </div>
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">ETH ADDRESS</div>
            <div>{ethAddresses || ''}</div>
          </div>
          <div>
            <div className="p-3 text-xs text-blue-400">BIO</div>
            <div className="leading-5">{bio || ''}</div>
          </div>

          <button
            className="py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
            type="submit"
          >
            {isUpdateLoading ? <p>Saving...</p> : <p> Save Profile</p>}
          </button>

          <button
            onClick={() => signOut()}
            className="py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
          >
            Sign out
          </button>
        </div>
        {cardTab === accountTabs.SETTINGS && <SettingsTab />}
        {cardTab === accountTabs.PROFILE && <ProfileTab />}
      </div>
      <div className="w-3/4 mt-16 text-white">
        <Footer />
      </div>
    </div>
  )
}

export default AccountInnerForm
