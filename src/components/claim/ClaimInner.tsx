import Link from 'next/link'
import Image from 'next/image'
import { Accordion } from './Accordion'

import ExternalLinkIcon from '../../assets/external-link.svg'
import { AIRDROP_TYPES } from 'types/airdropTypes'

interface Props {
  airdropType: AIRDROP_TYPES
}

const displayDescripton = (airdropType: AIRDROP_TYPES) => {
  if (airdropType === AIRDROP_TYPES.USER)
    return 'If you have participated on the Ideamarket protocol, you may be eligible to receive $IMO tokens. Click below to get started!'
  if (airdropType === AIRDROP_TYPES.TWITTER_VERIFICATION)
    return 'If you verified your twitter listing on Ideamarket over the follower threshold, you may be eligible to receive $IMO tokens. Click below to get started!'

  return 'If you are part of an eligible community, you may be able to recieve $IMO tokens. Click below to get started!'
}

const ClaimInner: React.FC<Props> = ({ airdropType }) => {
  const accordionData = [
    {
      title: 'What is Ideamarket?',
      body: `Ideamarket is a dapp for creating public narratives without trusted third parties — a literal marketplace of ideas, built on Arbitrum (Ethereum Layer 2).`,
    },
    {
      title: 'How will $IMO be distributed?',
      body: `The initial distribution for IMO is as follows:
              Early investors — 10%
              Team (present & future) — 18%
              Strategic partnerships — 10%
              Retroactive Airdrop — 5%
              Ecosystem & Treasury — 25%
              Community rewards — 32%
              Listing Token staking — 5%
              $IMO staking — 3%
              Sushiswap LP rewards — 5%
              Community airdrops — 4%
              Verification rewards — 2%
              Future rewards programs: 13%

              All $IMO allocated to Ideamarket team members are subject to a 2-year
              vesting schedule — a 1-year lockup, plus a 1-year linear unlock. 85% of
              investor tokens are subject to the same schedule, with 15% unlocked
              immediately to provide liquidity on Sushiswap.`,
    },
  ]

  return (
    <div className="flex flex-col flex-grow pl-10 pr-10 lg:pl-32 lg:pr-24 pt-20 md:pt-0 font-inter">
      <div className="flex m-auto w-full flex-col md:flex-row w-full lg:w-11/12">
        <div className="flex flex-col m-auto ml-0 text-black max-w-3xl pr-0 md:pr-8">
          <div className="flex items-center font-gilroy-bold text-3xl md:text-4xl font-extrabold  opacity-75 relative pt-12 md:pt-6 pb-6">
            Introducing $IMO
            <div className="rounded-full background-white ml-2 shadow w-8 h-8 md:w-10 md:h-10 p-1">
              <div className="flex-grow-0 w-6 h-6 md:w-8 md:h-8 relative">
                <Image
                  src="/logo.png"
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
          <div className="text-5xl md:text-6xl font-gilroy-bold font-extrabold opacity-75">
            The token of the literal marketplace of Ideas
          </div>
          <div className="my-16 text-sm md:text-base font-normal opacity-75 max-w-2xl ">
            {displayDescripton(airdropType)}
          </div>
          <Link href={`/claim/${airdropType}/dashboard`}>
            <div
              className="hidden md:flex flex-col text-center my-6 rounded-lg hover:bg-blue-800 w-full max-w-sm py-5 text-white bg-blue-600 cursor-pointer"
              // TODO
              style={{
                backgroundImage: `linear-gradient(135deg, #0E8FFF , #2345C3)`,
              }}
            >
              <div className="text-xl font-bold uppercase">Get Started</div>
              <div className="text-xs font-light">Est time : 2 mins</div>
            </div>
          </Link>
        </div>
        <div>
          <div className="flex items-center justify-center h-full flex-col md:w-80 w-full md:ml-auto md:mr-0 lg:mr-auto">
            <span className="text-sm font-light my-4 text-left mr-auto ml-2">
              Lets get some questions out of the way...
            </span>
            {accordionData.map((data) => (
              <Accordion title={data.title} body={data.body} key={data.title} />
            ))}
            <span className="text-sm font-light ml-auto mr-auto md:mr-0 my-4 underline opacity-80 flex items-end cursor-pointer">
              Ideamarket Token Overview
              <ExternalLinkIcon className="h-full inline ml-2" />
            </span>
            <Link href={`/claim/${airdropType}/dashboard`}>
              <div
                className="flex md:hidden flex-col text-center my-8 rounded-lg hover:bg-blue-800 w-full w-max-26 py-4 text-white bg-blue-600 cursor-pointer"
                // TODO
                style={{
                  backgroundImage: `linear-gradient(135deg, #0E8FFF , #2345C3)`,
                }}
              >
                <div className="text-xl font-bold uppercase">Get Started</div>
                <div className="text-xs font-light">Est time : 2 mins</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimInner
