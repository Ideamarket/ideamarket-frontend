import { DefaultLayout, Footer } from 'components'
import { useState } from 'react'
import Image from 'next/image'
import ProfileTab from 'components/account/ProfileTab'
import SettingsTab from 'components/account/SettingsTab'
import ProfileMobileTab from 'components/account/ProfileMobileTab'
import TabSwitcher from 'components/account/TabSwitcher'

const defaultVisibilityOptions = [
  { value: 'email', label: 'Email Address', isVisible: true },
  { value: 'addresses', label: 'ETH Addresses', isVisible: true },
  { value: 'bio', label: 'Bio', isVisible: true },
  { value: 'holdings', label: 'Holdings', isVisible: true },
]

const tabs = {
  SETTINGS: 'SETTINGS',
  PROFILE: 'PROFILE',
}

const Account = () => {
  const [visibilityOptions] = useState(defaultVisibilityOptions)
  const [cardTab, setCardTab] = useState(tabs.PROFILE)

  return (
    <div className="min-h-screen bg-top-desktop-new">
      <div className="flex-col items-center justify-center hidden w-screen pt-12 margin md:flex font-inter">
        <div className="flex flex-col items-end w-3/4 mb-2">
          <div className="mb-4 text-4xl italic text-white">My Account</div>
          <div>
            <TabSwitcher
              cardTab={cardTab}
              setCardTab={setCardTab}
              tabs={tabs}
              hasSpaceBetween
            />
          </div>
        </div>
        <div className="relative flex items-start justify-center w-4/5 px-6 py-5 bg-white rounded-lg h-3/5">
          <div className="relative flex flex-col w-1/4 mt-16 mr-8 text-center">
            <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full -top-24 left-1/2 w-36 h-36">
              <Image
                src={'/gray.svg'}
                alt="token"
                layout="fill"
                objectFit="contain"
                className="rounded-full"
              />
            </div>
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">USERNAME</div>
              <div className="text-3xl font-semibold">Balajis</div>
            </div>
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
              <div>balajis@ex.com</div>
            </div>
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">ETH ADDRESS</div>
              <div>0xw325ffs345fdw24...</div>
            </div>
            <div>
              <div className="p-3 text-xs text-blue-400">BIO</div>
              <div className="leading-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Id nunc
                quam nunc non ultrices morbi mi odio scelerisque. Eget fermentum
                id viverra vulputate nunc mi quis accumsan imperdiet. Placerat
                iaculis in eget egestas donec fermentum ut egestas...
              </div>
            </div>
            <button
              onClick={() => {}}
              className="py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
            >
              Save Profile
            </button>
          </div>
          {cardTab === tabs.SETTINGS && (
            <SettingsTab visibilityOptions={visibilityOptions} />
          )}
          {cardTab === tabs.PROFILE && <ProfileTab />}
        </div>
        <div className="w-3/4 mt-16 text-white">
          <Footer />
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-screen py-24 bg-top-desktop-new md:hidden font-inter">
        <div className="flex justify-between w-5/6 px-2 text-white">
          <TabSwitcher
            cardTab={cardTab}
            setCardTab={setCardTab}
            tabs={tabs}
            hasSpaceBetween={false}
          />
        </div>
        <div className="relative flex flex-col items-center justify-center w-5/6 px-6 pt-20 pb-5 text-center bg-white rounded-lg">
          <div className="absolute rounded-full -top-16 w-36 h-36">
            <Image
              src={'/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>
          <div className="w-full py-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">USERNAME</div>
            <div className="text-3xl font-semibold">Balajis</div>
          </div>
          <div className="w-full py-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">BIO</div>
            <div className="text-lg leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Id nunc
              quam nunc non ultrices morbi mi odio scelerisque. Eget fermentum
              id viverra vulputate nunc mi quis accumsan imperdiet. Placerat
              iaculis in eget egestas donec fermentum ut egestas...
            </div>
          </div>
          <div className="w-full py-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
            <div className="text-lg">balajis@ex.com</div>
          </div>
          <div className="w-full py-3 border-b border-gray-100">
            <div className="text-xs text-blue-400">ETH ADDRESS</div>
            <div className="text-lg">0xw325ffs345fdw24...</div>
          </div>

          {cardTab === tabs.SETTINGS && (
            <ProfileMobileTab visibilityOptions={visibilityOptions} />
          )}
          {cardTab === tabs.PROFILE && <ProfileTab />}

          <button
            onClick={() => {}}
            className="w-full py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account

Account.layoutProps = {
  Layout: DefaultLayout,
}
