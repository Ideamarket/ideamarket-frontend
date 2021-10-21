import { useContext } from 'react'
import Image from 'next/image'
import TabSwitcher from './TabSwitcher'
import SettingsTab from './SettingsTab'
import { Footer } from 'components'
import { accountTabs } from './constants'
import { AccountContext } from 'pages/user-account'
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

  console.log('AccountInnerForm')

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
            <div className="font-semibold">{username ?? ''}</div>
          </div>
          {displayEmail && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-400">
              <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
              <div>{email}</div>
            </div>
          )}
          {displayEthAddresses && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-400">
              <div className="flex items-center justify-center">
                <div className="mr-2 text-xs text-blue-400">ETH ADDRESS</div>
              </div>
              <div className="cursor-pointer">
                {ethAddresses?.map((ethAddress, index) => (
                  <div className="flex items-center" key={index}>
                    {ethAddress.verified ? (
                      <BadgeCheckIcon className="flex-shrink-0 w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5"></div>
                    )}
                    {ethAddresses.length > 1 && (
                      <div className="relative w-4 h-4 ml-2">
                        <Image
                          src={`/${index + 1}Emoji.png`}
                          alt="address-number"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
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
                        className="flex-shrink-0 w-5 h-5 ml-auto cursor-pointer"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {displayBio && (
            <div>
              <div className="mr-2 text-xs text-blue-400">BIO</div>
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
        {cardTab === accountTabs.PROFILE && (
          <ProfileWallet walletState="signedIn" ethAddresses={ethAddresses} />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AccountInnerForm
