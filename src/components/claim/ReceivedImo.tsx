import BrandDiscord from '../../assets/discord-full.svg'
import BrandTwitter from '../../assets/twitter-full.svg'
import CelebrationIcon from '../../assets/celebration.svg'
import ShareIcon from '../../assets/share.svg'
import CommonwealthIcon from '../../assets/commonwealth.svg'
import IdeamarketBulbIcon from '../../assets/ideamarket-white.svg'
import { FaArrowRight } from 'react-icons/fa'
import { IoIosWallet } from 'react-icons/io'

import React from 'react'
import Image from 'next/image'
import { useWeb3React } from '@web3-react/core'

import A from 'components/A'
import useClaimable from 'actions/useClaimable'

const ReceivedImo = () => {
  const { account } = useWeb3React()
  const claimableIMO: number = useClaimable(account)

  return (
    <div className="flex flex-col md:flex-row flex-grow justify-around">
      <div className="flex flex-grow flex-col font-gilroy-bold text-center">
        <div className="text-lg opacity-75 mb-8 md:mb-2">
          You have successfully claimed your tokens!
          <CelebrationIcon className="h-full inline ml-2" />
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-2xl min-h-56 transform -rotate-6 min-w-70 m-auto mt-2 md:mt-16 text-left">
          <div
            className="text-xs bg-no-repeat bg-cover rounded-2xl bg-ideamarket-bg bg-right bg-contain"
            style={{
              filter: 'drop-shadow(0px 25px 250px rgba(18, 128, 242, 0.2))',
              backdropFilter: 'blur(100px)',
            }}
          >
            <div
              className="text-5xl font-extrabold px-6 py-6 text-gray-700"
              style={{ lineHeight: '3.5rem' }}
            >
              Just <br />
              received{' '}
              <span className="text-blue-500">
                <br />
                {claimableIMO}
                <br />
              </span>{' '}
              $IMO
              <div className="ml-2 p-1 w-10 h-10 inline-block rounded-full bg-white shadow">
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo.png"
                    alt="Workflow logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white rounded-b-2xl text-center py-4 font-inter">
              <div className="flex items-center m-auto">
                <IoIosWallet className="w-6 h-6 text-white mr-1" />
                <span className="text-sm">{`${account.slice(
                  0,
                  6
                )}...${account.slice(-4)}`}</span>
              </div>
              <div className="flex items-center m-auto my-2">
                <IdeamarketBulbIcon className="relative w-4 h-4 mr-1" />
                <span className="text-xs font-thin opacity-75">ideamarket</span>
              </div>
            </div>
          </div>
          <div
            className="flex absolute inset-x-1/2 -bottom-4 w-40 border border-white/10 rounded-3xl p-2 items-center shadow"
            style={{
              backdropFilter: 'blur(40px)',
            }}
          >
            <ShareIcon className="w-8 h-8" />
            <span className="px-2 text-white font-sans">Share:</span>
            <div className="flex items-center justify-center ">
              <span className="flex items-center w-8 h-8 p-1 bg-gray-800 place-content-center rounded-full">
                <A href="https://twitter.com/ideamarket_io">
                  <BrandTwitter className="w-4 h-4" />
                </A>
              </span>
              <span className="flex items-center w-8 h-8 p-1 bg-gray-800 place-content-center rounded-full ml-1">
                <A href="https://discord.com/invite/zaXZXGE4Ke">
                  <BrandDiscord className="w-4 h-4" />
                </A>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-grow  bg-ideamarket-bg bg-no-repeat bg-center bg-contain "
        style={{ backgroundSize: 'contain' }}
      >
        <div className="flex flex-col flex-initial text-left md:text-right w-96 mt-24 ml-auto mr-auto md:mr-0 md:mt-auto text-white">
          <div className="flex flex-col bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 p-6 rounded-2xl shadow">
            <span className="text-2xl font-extrabold font-gilroy-bold text-left">
              Earn more $IMO by staking!
            </span>
            <div className="flex items-center opacity-75">
              <span className="mt-6 mb-3 text-base font-thin text-left font-sans">
                Dui elit sollicitudin cursus mi scelerisque. Sit urna felis id
                quis egestas dictum mauris.
              </span>
              <span className="w-1/2 items-center">
                <button
                  className="rounded-full font-bold min-w-min w-14 h-14 border-2 border-white text-white"
                  onClick={() => {}}
                >
                  <FaArrowRight className="w-5 h-5 text-white m-auto" />
                </button>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col border-white/20 border text-left p-1 py-3 bg-white/5 rounded-xl text-center">
                <span className="text-base font-bold  font-sans">
                  Listing IMO Staking
                </span>
                <span className="text-brand-neon-green text-xl font-bold font-inter">
                  12% APY
                </span>
              </div>
              <div className="flex flex-col border-white/20 border text-left p-1 py-3 bg-white/5 rounded-xl  text-center">
                <span className="text-base font-bold  font-sans">
                  Stake IMO
                </span>
                <span className="text-brand-neon-green text-xl font-bold font-inter">
                  4% APY
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-white p-6 my-4 rounded-2xl shadow text-gray-600 text-left">
            <p className="text-2xl font-extrabold font-gilroy-bold">
              <span className="uppercase bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent">
                Vote
              </span>{' '}
              on the future of Ideamarket
            </p>
            <div className="flex">
              <div className="flex flex-col">
                <p className="my-3 text-base font-light text-left font-sans">
                  As an $IMO token holder, you're able to vote on issues
                  regarding Ideamarket's future direction. We have a proposal
                  waiting for you. Have your say!
                </p>
                <div className="flex">
                  <CommonwealthIcon className="w-6 h-6" />
                  <span className="ml-2 text-gray-900 font-inter font-bold">
                    Commonwealth
                  </span>
                </div>
              </div>
              <span className="flex w-1/2 items-center">
                <button
                  className="rounded-full bg-transparent font-bold min-w-min w-14 h-14 border-2 border-brand-blue-2 bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent"
                  onClick={() => {}}
                >
                  <FaArrowRight className="w-5 h-5 text-brand-blue-2 m-auto" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceivedImo
