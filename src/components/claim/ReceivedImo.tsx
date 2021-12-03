import BrandDiscord from '../../assets/discord-full.svg'
import BrandTwitter from '../../assets/twitter-full.svg'
import CelebrationIcon from '../../assets/celebration.svg'
import ShareIcon from '../../assets/share.svg'

import React from 'react'
import { useWeb3React } from '@web3-react/core'

import A from 'components/A'

const ReceivedImo = () => {
  const { account } = useWeb3React()

  return (
    <div
      className="flex flex-col md:flex-row p-5 flex-grow justify-around"
      // TODO: make tailwindcss `justify-around` class work
      style={{ justifyContent: 'space-around' }}
    >
      <div className="flex flex-grow flex-col font-gilroy-bold text-center">
        <div className="text-lg opacity-75 my-8 p-6 md:my-2">
          You have successfully claimed your tokens!
          <CelebrationIcon className="h-full inline ml-2" />
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-2xl min-h-56 transform -rotate-6 w-64 m-auto mt-2 md:mt-16 text-left">
          <div
            className="text-xs bg-no-repeat bg-cover rounded-2xl bg-ideamarket-bg bg-right bg-contain"
            style={{
              filter: 'drop-shadow(0px 25px 250px rgba(18, 128, 242, 0.2))',
            }}
          >
            <div
              className="text-5xl font-extrabold px-6 py-6 text-gray-700"
              style={{ lineHeight: '3.5rem' }}
            >
              Just received <span className="text-blue-500">1500</span> $IMO
            </div>
            <div className="bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white rounded-b-2xl text-center py-4 font-inter">
              <div>
                <div className="text-sm">{`${account.slice(
                  0,
                  6
                )}...${account.slice(-4)}`}</div>
                <div className="py-1 text-xs font-thin opacity-75">
                  ideamarket
                </div>
              </div>
              <div className="flex absolute inset-x-1/2 w-40 rounded-3xl shadow bg-gradient-to-r from-brand-blue-1 to-brand-sky-blue-1 p-2 items-center">
                <ShareIcon className="h-8 w-8" />
                <span className="px-2">Share:</span>
                <div className="flex items-center justify-center ">
                  <span className="flex items-center w-8 h-8 p-1 bg-gray-600 place-content-center rounded-full">
                    <A href="https://twitter.com/ideamarket_io">
                      <BrandTwitter className="w-4 h-4" />
                    </A>
                  </span>
                  <span className="flex items-center w-8 h-8 p-1 bg-gray-600 place-content-center rounded-full ml-1">
                    <A href="https://discord.com/invite/zaXZXGE4Ke">
                      <BrandDiscord className="w-4 h-4" />
                    </A>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-grow  bg-ideamarket-bg bg-no-repeat bg-center bg-contain "
        style={{ backgroundSize: 'contain' }}
      >
        <div className="flex flex-col flex-initial text-right w-80  m-auto mt-16 md:mt-auto">
          <div className="text-5xl font-extrabold font-gilroy-bold opacity-75 text-left md:text-right">
            Earn more $IMO by staking!
          </div>
          <div className="my-12 text-base font-light text-grey-500 opacity-70">
            Dui elit sollicitudin cursus mi scelerisque. Sit urna felis id quis
            egestas dictum mauris. Placerat enim lacus tincidunt viverra
            pharetra, sed vestibulum at pellentesque.
          </div>
          <div className="flex ml-auto bg-gray-200 p-6 rounded-xl my-2 w-full justify-between ">
            <div className="text-base mr-3 opacity-70">Listing IMO Staking</div>
            <div className="flex items-center">
              <div className="mr-2 text-brand-yellow-green-1 font-bold">
                12% APY
              </div>
              <span className="cursor-pointer border-gray-500 w-2 h-2 transform rotate-45 border-r border-t"></span>
            </div>
          </div>
          <div className="flex ml-auto bg-gray-200 p-6 rounded-xl my-2 w-full justify-between ">
            <div className="text-base mr-3 opacity-70">Stake IMO</div>
            <div className="flex items-center">
              <div className="mr-2 text-brand-yellow-green-1 font-bold">
                4% APY
              </div>
              <span className="cursor-pointer border-gray-500 w-2 h-2 transform rotate-45 border-r border-t"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceivedImo
