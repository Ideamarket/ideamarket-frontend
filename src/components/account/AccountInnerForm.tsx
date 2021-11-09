import { useContext } from 'react'
import Image from 'next/image'
import TabSwitcher from './TabSwitcher'
import SettingsTab from './SettingsTab'
import { Footer } from 'components'
import { accountTabs } from './constants'
import { AccountContext } from 'pages/user-account'
import ProfileWallet from './ProfileWallet'

import ModalService from 'components/modals/ModalService'
import VerifyWalletModal from './VerifyWalletModal'
import { SignedAddress } from 'types/customTypes'
import EthAddressSwitcher from './EthAddressSwitcher'

const AccountInnerForm = ({
  submitWallet,
  removeAddress,
}: {
  submitWallet: (signedAddress: SignedAddress) => void
  removeAddress: (address: string) => void
}) => {
  const { getValues, isUpdateLoading, cardTab, register, setValue } =
    useContext(AccountContext)

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
        <div className="flex justify-between w-full mb-2">
          <div className="hidden md:flex">
            <div className="flex text-white mr-68"></div>
            <div className="hidden text-xl font-bold text-white md:block">
              @{username}
            </div>
          </div>
          <TabSwitcher hasSpaceBetween />
        </div>
      </div>
      <div className="p-8 bg-white rounded-lg md:flex-row dark:bg-gray-500">
        <div className="relative flex flex-col w-full text-center">
          <div className="absolute transform -translate-x-1/2 rounded-full md:left-32 -top-24 w-28 h-28 md:w-36 md:h-36 left-1/2">
            <Image
              src={profilePhoto || '/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>

          <div className="lg:flex">
            <div className="w-full">
              <div className="md:flex">
                <div className="mr-43">
                  <div className="relative w-8 h-8 -left-2 -top-2 rounded-ful">
                    <label>
                      <Image
                        src="/profile-upload-img.png"
                        alt="token"
                        layout="fill"
                        objectFit="contain"
                        className="cursor-pointer"
                      />
                      <input
                        {...register('imageFile')}
                        onChange={async (e) =>
                          setValue('imageFile', e.target.files)
                        }
                        type="file"
                        accept="image/png, image/jpeg"
                        disabled={isUpdateLoading}
                        className="hidden w-full lg:w-60"
                      />
                    </label>
                  </div>
                </div>
                {username && (
                  <div className="p-3 md:hidden">
                    <div className="mb-2 text-blue-400">USERNAME</div>
                    <div>{username}</div>
                  </div>
                )}
                {displayEmail && (
                  <div className="p-3 ">
                    <div className="mb-2 text-blue-400">EMAIL ADDRESS</div>
                    <div>{email}</div>
                  </div>
                )}
                {displayEthAddresses && (
                  <div className="max-w-xs p-3 mx-auto md:max-w-none md:auto">
                    <div className="flex items-center justify-center mb-2">
                      <div className="mr-2 text-blue-400">ETH ADDRESS</div>
                    </div>
                    <div className="cursor-pointer">
                      <EthAddressSwitcher
                        ethAddresses={ethAddresses}
                        removeAddress={removeAddress}
                      />
                    </div>
                  </div>
                )}
              </div>

              {displayBio && (
                <div className="text-left">
                  <div className="mb-2 text-blue-400">BIO</div>
                  <div className="leading-5">{bio || ''}</div>
                </div>
              )}
            </div>
            <div className="lg:w-64">
              <button
                className="w-full py-2 my-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
                type="submit"
              >
                {isUpdateLoading ? <p>Saving...</p> : <p> Save Profile</p>}
              </button>
              <button
                onClick={() =>
                  ModalService.open(VerifyWalletModal, { submitWallet })
                }
                className="w-full py-2 my-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
                type="button"
              >
                <p>Verify Wallet</p>
              </button>
            </div>
          </div>
        </div>
        {cardTab === accountTabs.SETTINGS && <SettingsTab />}
        {cardTab === accountTabs.PROFILE && (
          <ProfileWallet walletState="signedIn" userData={getValues()} />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AccountInnerForm
