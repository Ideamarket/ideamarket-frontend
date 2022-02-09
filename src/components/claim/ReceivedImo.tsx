import BrandDiscord from '../../assets/discord-full.svg'
import BrandTwitter from '../../assets/twitter-full.svg'
import CelebrationIcon from '../../assets/celebration.svg'
import ShareIcon from '../../assets/share.svg'
import CommonwealthIcon from '../../assets/commonwealth.svg'
import IdeamarketBulbIcon from '../../assets/ideamarket-white.svg'
import { FaArrowRight } from 'react-icons/fa'
import { IoIosWallet } from 'react-icons/io'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useWeb3React } from '@web3-react/core'

import A from 'components/A'
import useClaimable from 'actions/useClaimable'
import classNames from 'classnames'
import { AIRDROP_TYPES } from 'types/airdropTypes'

interface Props {
  airdropType: AIRDROP_TYPES
}

const ReceivedImo: React.FC<Props> = ({ airdropType }) => {
  const { account } = useWeb3React()
  const claimableIMO: number = useClaimable(account, airdropType, true)
  const [bottomPos, setBottomPos] = useState<Number>(-1)
  useEffect(() => {
    setTimeout(() => {
      setBottomPos(1)
    }, 100)
    setTimeout(() => {
      setBottomPos(0)
    }, 3000)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow justify-around">
      <div className="px-10 md:px-0 flex flex-grow flex-col font-gilroy-bold text-center m-auto">
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
                <span className="text-sm">
                  {account
                    ? `${account.slice(0, 6)}...${account.slice(-4)}`
                    : ''}
                </span>
              </div>
              <div className="flex items-center m-auto my-2">
                <IdeamarketBulbIcon className="relative w-4 h-4 mr-1" />
                <span className="text-xs font-thin opacity-75">ideamarket</span>
              </div>
            </div>
          </div>
          <div className="flex absolute inset-x-1/2 -bottom-3 w-40 border border-white/10 rounded-3xl p-2 items-center shadow backdrop-blur-3xl">
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
      <div className="flex flex-grow" style={{ backgroundSize: 'contain' }}>
        <div className="flex flex-col flex-initial text-left md:text-right w-100 mt-24 ml-auto mr-auto md:mr-0 md:mt-auto text-white">
          <div className="flex flex-col bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 p-4 rounded-none md:rounded-2xl shadow">
            <span className="text-2xl font-extrabold font-gilroy-bold text-left px-10 mt-10">
              Earn more $IMO by staking!
            </span>
            <div className="flex items-center opacity-75 px-10 my-6">
              <span className="text-base font-thin text-left font-sans">
                We’re awarding 13 million $IMO over the next 12 months through
                rewards programs. Click the arrow to learn more.
              </span>
              <span className="items-center ml-auto">
                <A href="https://ideamarket.io/stake">
                  <button className="rounded-full font-bold min-w-min w-16 h-16 border-2 border-white text-white">
                    <FaArrowRight className="w-5 h-5 text-white m-auto" />
                  </button>
                </A>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7">
              <div className="flex flex-col border-white/20 border text-left p-1 py-5 justify-center bg-white/5 rounded-xl text-center">
                <span className="text-base font-bold  font-sans">
                  Listing IMO Staking
                </span>
                <span className="text-brand-neon-green text-2xl font-extrabold font-inter">
                  550% APY
                </span>
              </div>
              <div className="flex flex-col border-white/20 border text-left p-1 py-5 justify-center bg-white/5 rounded-xl  text-center">
                <span className="text-base font-bold  font-sans">
                  Stake IMO
                </span>
                <span className="text-brand-neon-green text-2xl font-extrabold font-inter">
                  300% APY
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-gray-800 p-14 my-0 md:my-4 rounded-none md:rounded-2xl shadow text-white text-left">
            <p className="text-2xl font-extrabold font-gilroy-bold">
              <span className="uppercase">Vote</span> on the future of
              Ideamarket
            </p>
            <div className="flex">
              <div className="flex flex-col">
                <div className="flex mt-6 text-base font-light text-left font-sans opacity-70">
                  <p className="mr-2">
                    As an $IMO token holder, you’re able to vote on issues
                    regarding Ideamarket’s future direction.
                  </p>
                  <span className="flex md:hidden items-center">
                    <A href="https://commonwealth.im/ideamarket">
                      <button className="rounded-full bg-transparent font-bold min-w-min w-16 h-16 border-2 border-white">
                        <FaArrowRight className="w-5 h-5 text-white m-auto" />
                      </button>
                    </A>
                  </span>
                </div>
                <p className="my-3 text-base text-left font-sans font-medium">
                  We have a proposal waiting for you. Have your say!
                </p>
                <ul className="my-2 text-base font-light text-left font-sans opacity-70 list-disc ml-6">
                  <li>
                    Which protocol should Ideamarket use to generate interest on
                    the DAI stored in listings?
                  </li>
                  <li>Idea: Capping Listing Token Supply</li>
                </ul>
                <div className="flex mt-3">
                  <CommonwealthIcon className="w-6 h-6" />
                  <span className="ml-2 font-inter font-bold">
                    Commonwealth
                  </span>
                </div>
              </div>
              <span className="items-center hidden md:flex ml-auto">
                <A href="https://commonwealth.im/ideamarket">
                  <button className="rounded-full bg-transparent font-bold min-w-min w-16 h-16 border-2 border-white">
                    <FaArrowRight className="w-5 h-5 text-white m-auto" />
                  </button>
                </A>
              </span>
            </div>
          </div>
        </div>
      </div>

      {Boolean(bottomPos) && (
        <>
          <div
            className={classNames(
              'absolute transition-all duration-[3000ms]  ease-in w-screen h-screen left-0 overflow-hidden',
              bottomPos === -1
                ? 'invisible top-[-140%] opacity-100'
                : 'visible top-[140%] opacity-30'
            )}
          >
            <img
              src={'/claim-success-1.png'}
              alt="token"
              className="min-w-[1440px] max-w-[2000px] w-full"
            />
          </div>
          <div
            className={classNames(
              'absolute transition-all duration-[3000ms]  ease-in w-screen h-screen left-0 overflow-hidden',
              bottomPos === -1
                ? 'invisible top-[-120%] opacity-100'
                : 'visible top-[120%] opacity-30'
            )}
          >
            <img
              src={'/claim-success-2.png'}
              alt="token"
              className="min-w-[1440px] max-w-[2000px] w-full"
            />
          </div>
          <div
            className={classNames(
              'absolute transition-all duration-[3000ms]  ease-in w-screen h-screen left-0 overflow-hidden',
              bottomPos === -1
                ? 'invisible top-[-90%] opacity-100'
                : 'visible top-[90%] opacity-30'
            )}
          >
            <img
              src={'/claim-success-3.png'}
              alt="token"
              className="min-w-[1440px] max-w-[2000px] w-full"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ReceivedImo
