import classNames from 'classnames'
import { signOut } from 'next-auth/client'
import Image from 'next/image'
import { accountTabs } from './constants'
import ProfileMobileTab from './ProfileMobileTab'
import ProfileTab from './ProfileTab'
import TabSwitcher from './TabSwitcher'

const AccountMobile = ({
  isUpdateLoading,
  cardTab,
  setCardTab,
  setImageFile,
  register,
  getValues,
  setValue,
}) => {
  const { profilePhoto, username, email, ethAddresses, bio } = getValues()
  const settingsProps = {
    isUpdateLoading,
    setImageFile,
    register,
    setValue,
    getValues,
  }

  return (
    <div className="flex flex-col items-center justify-start w-screen py-24 bg-top-desktop-new md:hidden font-inter">
      <div className="flex justify-between w-5/6 px-2 text-white">
        <TabSwitcher
          cardTab={cardTab}
          setCardTab={setCardTab}
          tabs={accountTabs}
          hasSpaceBetween={false}
        />
      </div>
      <div className="relative flex flex-col items-center justify-center w-5/6 px-6 pt-20 pb-5 text-center bg-white rounded-lg">
        <div className="absolute rounded-full -top-16 w-36 h-36">
          <Image
            src={profilePhoto || '/gray.svg'}
            alt="token"
            layout="fill"
            objectFit="contain"
            className="rounded-full"
          />
        </div>
        <div className="w-full py-3 border-b border-gray-100">
          <div className="text-xs text-blue-400">USERNAME</div>
          <div className="text-3xl font-semibold">{username || ''}</div>
        </div>
        <div className="w-full py-3 border-b border-gray-100">
          <div className="text-xs text-blue-400">BIO</div>
          <div className="text-lg leading-5">{bio ?? ''}</div>
        </div>
        <div className="w-full py-3 border-b border-gray-100">
          <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
          <div className="text-lg">{email || ''}</div>
        </div>
        <div className="w-full py-3 border-b border-gray-100">
          <div className="text-xs text-blue-400">ETH ADDRESS</div>
          <div className="text-lg">{ethAddresses?.[0] || ''}</div>
        </div>

        {cardTab === accountTabs.SETTINGS && (
          <ProfileMobileTab {...settingsProps} />
        )}
        {cardTab === accountTabs.PROFILE && <ProfileTab />}

        <button
          className={classNames(
            'bg-brand-blue text-white px-4 py-2 my-4 ml-auto rounded-lg w-full',
            isUpdateLoading ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
          disabled={isUpdateLoading}
          type="submit"
        >
          {isUpdateLoading ? <p>Saving...</p> : <p> Save Profile</p>}
        </button>
        <button
          onClick={() => signOut()}
          className="w-full py-2 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default AccountMobile
