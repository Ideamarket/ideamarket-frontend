import Metamask from '../../../assets/metamask.svg'
import { AiOutlineCheck } from 'react-icons/ai'
import { RiGasStationFill } from 'react-icons/ri'
import { IoMdOpen } from 'react-icons/io'

import React, { useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/dist/client/router'
import { useWeb3React } from '@web3-react/core'
import Tooltip from 'components/tooltip/Tooltip'

import A from 'components/A'
import useClaimable from 'actions/useClaimable'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'

interface Props {
  currentStep: number
}

interface StepData {
  text: String
  circleClassName: String
  textClassName: String
  icon?: String
  // metamask || checkmark || ''
}

const FlowNavMenu: React.FC<Props> = ({ currentStep }) => {
  const router = useRouter()
  const { active, account } = useWeb3React()
  const claimableIMO: number = useClaimable(account)
  const alreadyClaimed: boolean = isAddressInMerkleRoot(account)

  const getStepStatus = useCallback(
    (stepNo: number) => {
      const isNotEligible = !claimableIMO && !alreadyClaimed
      if (currentStep === 2) {
        if (stepNo === 1 && isNotEligible) return -1 // invalid
        if (stepNo === 2 && isNotEligible) return 0 // inactive
      }
      if (stepNo > currentStep) return 0 //inactive
      return 1 //active
    },
    [currentStep, claimableIMO, alreadyClaimed]
  )

  const getClassNamesForStepCircles = useCallback(
    (stepNo: number) => {
      const stepStatus = getStepStatus(stepNo)
      if (stepStatus === -1) return ' text-white bg-red-400 border-0'
      if (stepStatus === 0)
        return ' border-gray-300 text-gray-500 text-opacity-60'
      return 'border-0 bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white'
    },
    [getStepStatus]
  )

  const getClassNamesForTexts = useCallback(
    (stepNo: number) => {
      const stepStatus = getStepStatus(stepNo)
      if (stepStatus === -1) return ' text-red-400'
      if (stepStatus === 0) return ' text-gray-500 text-opacity-60'
      return ' bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent'
    },
    [getStepStatus]
  )

  const stepsData: StepData[] = useMemo(() => {
    return [
      {
        text:
          currentStep >= 0 && active && account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet',
        circleClassName: getClassNamesForStepCircles(0),
        textClassName: getClassNamesForTexts(0),
        icon: currentStep && active && account ? 'metamask' : '',
      },
      {
        text:
          currentStep >= 1 && (claimableIMO || alreadyClaimed)
            ? 'Eligibile!'
            : 'Check Eligibility',
        circleClassName: getClassNamesForStepCircles(1),
        textClassName: getClassNamesForTexts(1),
        icon:
          currentStep !== 0 && (claimableIMO || alreadyClaimed)
            ? 'checkmark'
            : '',
      },
      {
        text:
          currentStep >= 2 && !claimableIMO && alreadyClaimed
            ? 'Already Claimed!'
            : 'Claim $IMO',
        circleClassName: getClassNamesForStepCircles(2),
        textClassName: getClassNamesForTexts(2),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, account, claimableIMO])

  return (
    <div className="absolute z-50 items-center w-full t-0 font-inter">
      <div className="flex flex-grow justify-between">
        <nav className="relative flex flex-wrap flex-col md:flex-row items-center justify-left md:justify-center w-full mr-auto ml-auto md:ml-0 max-w-7xl lg:justify-between">
          <div
            className="p-8 md:p-6 pb-4 flex items-center cursor-pointer mr-auto"
            onClick={() => router.push('/')}
          >
            <div className="relative w-6 h-6 mr-1">
              <Image
                src="/logo.png"
                alt="Workflow logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="w-auto h-full text-xl md:text-2xl leading-none text-dark ">
              Ideamarket
            </span>
          </div>

          {currentStep !== -1 && currentStep !== 3 && (
            <div className="flex relative items-center justify-center m-auto w-full md:w-max overflow-auto no-scrollbar p-8 py-3 md:bg-transparent bg-blue-100 bg-opacity-50">
              <div className="flex w-full">
                <div className="flex items-center margin-auto">
                  {stepsData.map((stepData, index) => (
                    <React.Fragment key={index}>
                      {Boolean(index) && (
                        <div
                          className={`hidden lg:flex mx-1 xl:mx-4 flex-auto border-t-2 transition duration-500 ease-in-out border-gray-300 w-10 xl:w-20`}
                        ></div>
                      )}
                      <div className="flex items-center text-purple-500 relative px-2">
                        {stepData.icon === 'metamask' ? (
                          <Metamask className="w-8 h-8" />
                        ) : (
                          <div
                            className={`flex text-xs rounded-full transition duration-500 ease-in-out w-6 h-6 items-center place-content-center leading-4 border-2 ${stepData.circleClassName}`}
                          >
                            {stepData.icon === 'checkmark' ? (
                              <AiOutlineCheck className="w-4 h-4 text-white" />
                            ) : (
                              index + 1
                            )}
                          </div>
                        )}

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
        {currentStep < 3 && (
          <div className="hidden lg:flex ml-auto items-center pr-10 xl:pr-30 ">
            <Tooltip
              placement="down"
              IconComponent={() => (
                <div className="items-start flex">
                  <RiGasStationFill className="w-5 h-5 text-gray-400" />
                  <span className="opacity-75 font-base text-sm text-gray-400 pl-2 whitespace-nowrap">
                    Eth Gas : 65 Gwei
                  </span>
                </div>
              )}
              iconComponentClassNames="w-max h-max"
              tooltipContentclassName="p-3 mb-1 text-sm rounded-xl text-gray-400 shadow bg-white"
            >
              <div className="flex flex-col w-32 md:w-64">
                <p className="text-sm">
                  Claiming $IMO requires you to pay gas fees using L2 $ETH on
                  the Arbitrum Network.
                </p>
                <div className="ml-auto text-sm mt-2 cursor-pointer">
                  <A
                    href="https://docs.ideamarket.io/user-guide/tutorial#bridging-crypto-to-layer-2-abritrum"
                    target="_blank"
                    className="flex items-center "
                  >
                    <span className="underline mr-2">Learn more</span>
                    <IoMdOpen className="w-6 h-6" />
                  </A>
                </div>
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlowNavMenu
