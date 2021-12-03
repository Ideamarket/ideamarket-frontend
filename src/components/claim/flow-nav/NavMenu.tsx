import React, { useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/dist/client/router'
import { useWeb3React } from '@web3-react/core'

import useClaimable from 'actions/useClaimable'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'

interface Props {
  currentStep: number
}

const FlowNavMenu: React.FC<Props> = ({ currentStep }) => {
  const router = useRouter()
  const { active, account } = useWeb3React()
  const claimableIMO: number = useClaimable(account)
  const alreadyClaimed: boolean = isAddressInMerkleRoot(account)

  const getClassNamesForStepCircles = useCallback(
    (stepNo: number) => {
      if (stepNo > currentStep)
        return ' border-gray-300 text-gray-500 text-opacity-60'
      if (stepNo === 1 && !claimableIMO && !alreadyClaimed)
        return ' text-white bg-red-400 border-0'
      return ' border-0 bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white '
    },
    [currentStep, claimableIMO, alreadyClaimed]
  )

  const getClassNamesForTexts = useCallback(
    (stepNo: number) => {
      if (stepNo > currentStep) return ' text-gray-500 text-opacity-60'
      if (stepNo === 1 && !claimableIMO && !alreadyClaimed)
        return ' text-red-400'
      return ' bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent'
    },
    [currentStep, claimableIMO, alreadyClaimed]
  )

  const stepsData = useMemo(() => {
    return [
      {
        text:
          currentStep && active && account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet',
        circleClassName: getClassNamesForStepCircles(0),
        textClassName: getClassNamesForTexts(0),
      },
      {
        text:
          currentStep !== 0 && (claimableIMO || alreadyClaimed)
            ? 'Elgibile!'
            : 'Check Elgibility',
        circleClassName: getClassNamesForStepCircles(1),
        textClassName: getClassNamesForTexts(1),
      },
      {
        text:
          !claimableIMO && alreadyClaimed ? 'Already Claimed!' : 'Claim $IMO',
        circleClassName: getClassNamesForStepCircles(2),
        textClassName: getClassNamesForTexts(2),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, account, claimableIMO])

  return (
    <div className="absolute z-50 items-center w-full t-0 font-inter">
      <div className="">
        <nav className="relative flex flex-wrap items-center justify-left md:justify-center w-full mr-auto ml-auto md:ml-0 max-w-7xl lg:justify-between">
          <div
            className="p-8 md:p-6 pb-4 flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="relative w-10 h-8">
              <Image
                src="/logo.png"
                alt="Workflow logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="w-auto h-full text-2xl leading-none text-dark md:text-3xl">
              Ideamarket
            </span>
          </div>

          {currentStep !== -1 && (
            <div className="flex relative items-center justify-center m-auto w-full md:w-max overflow-auto p-8 py-3 md:bg-transparent bg-blue-100 bg-opacity-50">
              <div className="flex w-full">
                <div className="flex items-center margin-auto">
                  {stepsData.map((stepData, index) => (
                    <React.Fragment key={index}>
                      {Boolean(index) && (
                        <div
                          className={`hidden lg:flex mx-4 flex-auto border-t-2 transition duration-500 ease-in-out border-gray-300 w-20`}
                        ></div>
                      )}
                      <div className="flex items-center text-purple-500 relative px-2">
                        <div
                          className={`flex text-xs rounded-full transition duration-500 ease-in-out w-6 h-6 items-center place-content-center leading-4 border-2 ${stepData.circleClassName}`}
                        >
                          {index + 1}
                        </div>
                        <div
                          className={`px-2 text-center text-xs font-medium whitespace-nowrap ${stepData.textClassName}`}
                        >
                          {stepData.text}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

export default FlowNavMenu
