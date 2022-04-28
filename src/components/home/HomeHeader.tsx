import React from 'react'
import Image from 'next/image'
import A from 'components/A'
import {
  ExternalLinkIcon,
} from '@heroicons/react/outline'
import { useQuery } from 'react-query'
import BN from 'bn.js'
import {
  bigNumberTenPow18,
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
} from 'utils'
import { queryDaiBalance } from 'store/daiStore'
import { NETWORK } from 'store/networks'

const HomeHeader = () => {

  const { interestManagerAVM: interestManagerAddress } =
    NETWORK.getDeployedAddresses()

  const { data: interestManagerDaiBalance } = useQuery(
    ['interest-manager-dai-balance'],
    () => queryDaiBalance(interestManagerAddress),
    {
      refetchOnWindowFocus: false,
    }
  )

  const daiBalance = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(
      interestManagerDaiBalance || new BN('0'),
      bigNumberTenPow18,
      0
    )
  )

  return (
    <div className="px-6 pt-10 pb-40 text-center text-white font-inter bg-cover dark:text-gray-200 bg-top-mobile md:bg-top-desktop">
      <div>
        <div className="flex flex-wrap justify-center mt-4">
          <div
            className="flex justify-center flex-grow-0 flex-shrink-0 mt-4"
            data-aos="zoom-y-out"
          >
            <A href="https://www.nasdaq.com/articles/ideamarket-is-a-literal-marketplace-for-ideas-and-online-reputation-2021-02-19">
              <div className="relative h-8 opacity-50 w-36">
                <Image
                  src="/nasdaq.png"
                  alt="Nasdaq"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
            </A>
          </div>
          <div
            className="flex justify-center flex-grow-0 flex-shrink-0 mt-4"
            data-aos="zoom-y-out"
          >
            <A href="https://www.vice.com/en/article/pkd8nb/people-have-spent-over-dollar1-million-on-a-literal-marketplace-of-ideas">
              <div className="relative w-32 h-8 opacity-50">
                <Image
                  src="/vice.png"
                  alt="Vice"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
            </A>
          </div>
          <div
            className="flex justify-center flex-grow-0 flex-shrink-0 mt-4"
            data-aos="zoom-y-out"
          >
            <A href="https://www.coindesk.com/ideamarket-online-ideas-online-reputation">
              <div className="relative h-8 opacity-50 w-36">
                <Image
                  src="/coindesk.png"
                  alt="Coindesk"
                  layout="fill"
                  objectFit="contain"
                  priority={true}
                  className="rounded-full"
                />
              </div>
            </A>
          </div>
        </div>
        <h2 className="mt-8 text-3xl md:text-6xl font-gilroy-bold">
          Make lying
          <span className="text-brand-blue"> expensive.</span>
        </h2>
        <p className="mt-8 md:px-28 text-sm md:text-lg">
          <span className="inline-block mr-1">
            Ideamarket values the world's information,
          </span>
          <span className="inline-block mr-1">
            creating public narratives without third parties.{' '}
          </span>
          <A
            href="https://docs.ideamarket.io"
            className="underline inline-block hover:text-brand-blue opacity-60 cursor-pointer"
          >
            <span>How it Works</span>
            <ExternalLinkIcon className="w-5 inline ml-1 mb-1" />
          </A>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center mt-4 md:mt-10 text-md md:text-3xl font-gilroy-bold md:flex-row">
        <div className="text-2xl text-brand-blue md:text-5xl">
          ${daiBalance}
        </div>
        <div className="md:ml-2">of information valued</div>
        <div
          className="flex justify-center flex-grow-0 flex-shrink-0 mt-8 md:mt-0 md:ml-6 mr-8 md:mr-0"
          data-aos="zoom-y-out"
        >
          <A href="https://docs.ideamarket.io/contracts/audit">
            <div className="relative h-8 opacity-50 w-40">
              <Image
                src="/Quantstamp.svg"
                alt="Quantstamp"
                layout="fill"
                objectFit="contain"
                priority={true}
                className="rounded-full"
              />
            </div>
          </A>
        </div>
      </div>

    </div>
  )
}

export default HomeHeader
