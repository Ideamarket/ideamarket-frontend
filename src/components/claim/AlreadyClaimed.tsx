import { AiOutlineArrowRight } from 'react-icons/ai'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WalletStatus } from 'components'

interface Props {}

const breakdownByPoint = [
  { text: 'Listing an Account', amount: [400, 200] },
  { text: 'Buying Tokens for an Account', amount: [100] },
  { text: 'Locking Tokens', amount: [400, 200] },
  { text: 'Verifying an Account', amount: [1000] },
]

export const AlreadyClaimed: React.FC<Props> = () => {
  return (
    <>
      <div className="flex max-w-md">
        <div className="mb-8 md:mb-0 mr-0 md:mr-4">
          <div className="my-6 text-5xl font-extrabold font-gilroy-bold opacity-75">
            Looks like you already claimed your tokens!
          </div>
          <div className="my-12 text-base font-light opacity-75">
            Because of your engagement with the Ideamarket platform, you were
            entitled to some $IMO.
          </div>
          <div className="my-6 text-base font-light text-blue-500">
            <WalletStatus />
          </div>
          <Link href="/stake">
            <a className="hidden md:flex w-full max-w-xs h-18 items-center justify-center text-sm bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold rounded-lg uppercase">
              <span className="pr-4">Earn more by staking</span>
              <AiOutlineArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-full w-full md:w-96 my-auto">
        <div className="flex flex-col mx-auto w-full md:w-96">
          <span className="text-gray-400 text-left text-sm mb-4">
            Here's a breakdown of your claim...
          </span>
          {breakdownByPoint.map((data, id) => (
            <div
              key={id}
              className="bg-gray-200 border-2 bg-opacity-50 py-5 px-6 rounded-2xl flex justify-between my-2 w-full items-center"
              role="alert"
            >
              <span className="w-max mr-2 opacity-70">{data.text}</span>
              <div className="flex flex-col">
                {data.amount.map((amount, idx) => (
                  <div className="flex my-1 items-center" key={idx}>
                    <span className="bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent">
                      {amount}
                    </span>

                    <div className="ml-2 p-1 w-6 h-6 inline-block rounded-full bg-white shadow">
                      <div className="relative w-4 h-4">
                        <Image
                          src="/logo.png"
                          alt="Workflow logo"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <span className="text-gray-400 text-sm my-2">
            *Any action performed on Layer 1 provides double points for that
            action.
          </span>
        </div>
        <Link href="/stake">
          <a className="flex md:hidden w-full md:w-max h-18 items-center justify-center text-sm bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold rounded-lg uppercase my-8">
            <span className="pr-4">Earn more by staking</span>
            <AiOutlineArrowRight className="w-4 h-4" />
          </a>
        </Link>
      </div>
    </>
  )
}
