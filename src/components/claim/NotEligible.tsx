import OhnoIcon from '../../assets/ohno.svg'

import React, { useCallback } from 'react'

import { BreakdownPoint } from './EligibilityOutcome'

import { WalletStatus } from 'components'
// import { BreakdownPointCard } from './BreakdownPointCard'

interface Props {
  setClaimStep: (any) => void
  breakdownByPoint?: BreakdownPoint[]
}
export const NotEligible: React.FC<Props> = ({
  setClaimStep,
  // breakdownByPoint,
}) => {
  const onChangeWallet = useCallback(() => {
    setClaimStep(0)
  }, [setClaimStep])

  return (
    <>
      <div className="flex">
        <div className="mb-8 md:mb-0 mr-0 md:mr-4">
          <div className="my-6 text-3xl font-extrabold font-gilroy-bold opacity-75">
            <span>Oh No!</span>
            <OhnoIcon className="h-full inline ml-2" />
          </div>
          <div className="my-6 text-5xl font-extrabold font-gilroy-bold opacity-75">
            You are <span className="text-red-700">NOT</span> eligible for an
            airdrop!
          </div>
          <div className="my-10 text-base font-light opacity-75">
            Kindly make sure that you connect with the wallet you've used to
            trade on Ideamarket.
          </div>
          <div className="my-6 text-base font-light text-blue-500">
            <WalletStatus />
          </div>
          <button
            onClick={onChangeWallet}
            className="hidden md:flex bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold rounded-xl items-center w-full max-w-xs h-18 items-center justify-center cursor-pointer uppercase"
          >
            Change wallet
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-full w-full md:w-96 my-auto">
        <div className="flex flex-col mx-auto w-full md:w-96">
          {/* <span className="text-gray-400 text-left text-sm mb-4">
            Here's a breakdown of your claim...
          </span>

          {breakdownByPoint.map((data, id) => (
            <BreakdownPointCard key={id} data={data} />
          ))}

          <span className="text-gray-400 text-sm my-2">
            *Any action performed on Layer 1 provides double points for that
            action.
          </span> */}
        </div>
        <div className="flex flex-col items-center justify-center h-full w-full md:w-96 my-auto">
          <button
            onClick={onChangeWallet}
            className="flex md:hidden bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold rounded-xl items-center w-full md:w-max h-18 items-center justify-center cursor-pointer uppercase my-8"
          >
            Change wallet
          </button>
        </div>
      </div>
    </>
  )
}
