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

  console.log(getValues())

  return (
    <div className="w-11/12 mx-auto my-0 max-w-7xl md:pt-24 font-inter w-90">
      <div className="flex flex-col items-end mx-4">
        <div className="invisible mb-4 text-4xl italic text-white md:visible">
          My Account
        </div>
        <div className="flex justify-between w-full mb-2">
          <div className="flex">
            <div className="flex mr-48 text-white">twitter</div>
            <div className="text-xl font-bold text-white">@{username}</div>
          </div>
          <TabSwitcher hasSpaceBetween />
        </div>
      </div>
      <div className="px-6 py-5 bg-white rounded-lg md:flex-row dark:bg-gray-500">
        <div className="relative flex flex-col w-full text-center">
          <div className="absolute rounded-full left-16 -top-24 w-28 h-28 sm:w-36 sm:h-36">
            <Image
              src={profilePhoto || '/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>

          <div className="flex">
            <div className="w-full">
              <div className="flex">
                <div className="relative w-8 h-8 mr-48 rounded-full">
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
                {displayEmail && (
                  <div className="p-3">
                    <div className="mb-2 text-xs text-blue-400">
                      EMAIL ADDRESS
                    </div>
                    <div>{email}</div>
                  </div>
                )}
                {displayEthAddresses && (
                  <div className="p-3 ">
                    <div className="flex items-center justify-center mb-2">
                      <div className="mr-2 text-xs text-blue-400">
                        ETH ADDRESS
                      </div>
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
                          <MinusCircleIcon
                            onClick={() => removeAddress(ethAddress.address)}
                            className="flex-shrink-0 w-5 h-5 ml-auto cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {displayBio && (
                <div className="text-left">
                  <div className="mb-2 mr-2 text-xs text-blue-400">BIO</div>
                  <div className="leading-5">{bio || ''}</div>
                </div>
              )}
            </div>
            <div className="w-64">
              <button
                className="w-full py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
                type="submit"
              >
                {isUpdateLoading ? <p>Saving...</p> : <p> Save Profile</p>}
              </button>
              <button
                onClick={() =>
                  ModalService.open(VerifyWalletModal, { submitWallet })
                }
                className="w-full py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
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
