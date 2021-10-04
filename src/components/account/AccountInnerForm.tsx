import { useContext } from 'react'
import Image from 'next/image'
import TabSwitcher from './TabSwitcher'
import SettingsTab from './SettingsTab'
import { Footer } from 'components'
import { accountTabs } from './constants'
import { AccountContext } from 'pages/account'
import ProfileWallet from './ProfileWallet'
import copy from 'copy-to-clipboard'
import { MinusCircleIcon } from '@heroicons/react/outline'
import ModalService from 'components/modals/ModalService'
import VerifyWalletModal from './VerifyWalletModal'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import { SignedAddress } from 'types/customTypes'

const AccountInnerForm = ({
  submitWallet,
  removeAddress,
}: {
  submitWallet: (signedAddress: SignedAddress) => void
  removeAddress: (address: string) => void
}) => {
  const { getValues, isUpdateLoading, cardTab } = useContext(AccountContext)
  const {
    username,
    email,
    ethAddresses,
    bio,
    profilePhoto,
    displayEmail,
    displayEthAddresses,
    displayBio,
  } = getValues()

  return (
    <div className="w-11/12 mx-auto my-0 max-w-7xl md:pt-24 font-inter w-90">
      <div className="flex flex-col items-end mx-4">
        <div className="invisible mb-4 text-4xl italic text-white md:visible">
          My Account
        </div>
        <div className="flex justify-between w-full mb-2 md:justify-end">
          <TabSwitcher hasSpaceBetween />
        </div>
      </div>
      <div className="flex flex-col items-start justify-center px-6 py-5 bg-white rounded-lg md:flex-row dark:bg-gray-500">
        <div className="relative flex flex-col w-full mt-16 text-center md:mr-8 md:w-1/4">
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full -top-24 left-1/2 w-28 h-28 sm:w-36 sm:h-36">
            <Image
              src={profilePhoto || '/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>

          <div className="p-3 border-b border-gray-100 dark:border-gray-400">
            <div className="text-xs text-blue-400">USERNAME</div>
            <div className="text-xs font-semibold">{username ?? ''}</div>
          </div>
          {displayEmail && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-400">
              <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
              <div>{email}</div>
            </div>
          )}
          {displayEthAddresses && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-400">
              <div className="flex justify-center items-center">
                <div className="text-xs text-blue-400 mr-2">ETH ADDRESS</div>
              </div>
              <div className="cursor-pointer">
                {ethAddresses?.map((ethAddress, index) => (
                  <div className="flex items-center" key={index}>
                    {ethAddress.verified ? (
                      <BadgeCheckIcon className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5"></div>
                    )}
                    <p
                      key={`${ethAddress.address}-${index}`}
                      onClick={() => copy(ethAddress.address)}
                      className="ml-2"
                    >
                      {ethAddress.address?.substr(
                        0,
                        ethAddress.address?.length > 16
                          ? 16
                          : ethAddress.address?.length
                      ) + (ethAddress.address?.length > 16 ? '...' : '')}
                    </p>
                    {cardTab === accountTabs.SETTINGS && (
                      <MinusCircleIcon
                        onClick={() => removeAddress(ethAddress.address)}
                        className="w-5 h-5 cursor-pointer ml-auto flex-shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {displayBio && (
            <div>
              <div className="p-3 text-xs text-blue-400">BIO</div>
              <div className="leading-5">{bio || ''}</div>
            </div>
          )}

          {cardTab === accountTabs.SETTINGS && (
            <>
              <button
                onClick={() =>
                  ModalService.open(VerifyWalletModal, { submitWallet })
                }
                className="py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
                type="button"
              >
                <p>Verify Wallet</p>
              </button>
              <button
                className="py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
                type="submit"
              >
                {isUpdateLoading ? <p>Saving...</p> : <p> Save Profile</p>}
              </button>
            </>
          )}
        </div>
        {cardTab === accountTabs.SETTINGS && <SettingsTab />}
        {cardTab === accountTabs.PROFILE && <ProfileWallet />}
      </div>
      <Footer />
    </div>
  )
}

export default AccountInnerForm
