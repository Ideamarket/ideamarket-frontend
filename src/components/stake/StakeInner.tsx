import { Footer, WalletModal } from 'components'
import Image from 'next/image'
import { useState } from 'react'
import classNames from 'classnames'
import StakePriceItem from './StakePriceItem'
import { useWeb3React } from '@web3-react/core'
import ModalService from 'components/modals/ModalService'

const StakeInner = () => {
  const [isStakeSelected, setIsStakeSelected] = useState(true)
  const { account } = useWeb3React()

  const toggleIsStake = () => setIsStakeSelected(!isStakeSelected)

  return (
    <div className="w-11/12 max-w-5xl mx-auto my-0 md:pt-24 font-inter w-90">
      <div className="flex flex-col items-end mx-4">
        <div className="invisible mb-4 text-4xl italic text-white md:visible">
          Stake
        </div>
        <div className="flex justify-between w-full mb-2 md:justify-end"></div>
      </div>
      <div className="flex flex-col items-start justify-center p-8 bg-white rounded-lg md:p-16 md:pb-32 md:flex-row dark:bg-gray-500">
        <div className="md:grid md:grid-cols-2 md:gap-8">
          <div className="mb-8 md:mb-0">
            <div className="visible mb-4 text-xl md:invisible">Stake</div>

            <div className="my-6 text-4xl font-extrabold">
              Lorem ipsum dolor sit amet, consectetur
            </div>
            <div className="text-base leading-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vel
              congue nibh scelerisque cursus enim.
            </div>

            <div className="justify-between hidden mt-8 md:flex max-w-88">
              <StakePriceItem title="Balance" tokenName="xIMO" price="5.212" />
              <StakePriceItem title="Unstaked" tokenName="xIMO" price="5.212" />
            </div>
          </div>
          <div>
            <div className="bg-blue-100 dark:bg-gray-700 rounded-2xl min-h-56">
              <div className="px-6 py-6 text-xs text-white uppercase bg-no-repeat bg-cover rounded-2xl bg-claim-imo-bg">
                <div className="flex justify-between">
                  <div className="flex flex-col justify-between">
                    <div>Staking imo</div>
                    <button
                      className={classNames(
                        'w-full py-2 text-white rounded-lg',
                        false
                          ? 'text-gray-500 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                          : 'bg-green-400 hover:bg-green-800 cursor-pointer'
                      )}
                    >
                      View stats
                    </button>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold">4.91%</div>
                    <div className="mt-2 font-extrabold text-sx">
                      Yesterday's APR
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex m-4 bg-white rounded-lg dark:bg-gray-500">
                <button
                  onClick={toggleIsStake}
                  disabled={isStakeSelected}
                  className={classNames(
                    'w-full py-2 text-white rounded-lg',
                    !isStakeSelected
                      ? 'text-gray-500 dark:text-gray-300  cursor-pointer dark:bg-gray-500'
                      : 'bg-brand-blue hover:bg-blue-800 cursor-default'
                  )}
                >
                  Stake IMO
                </button>

                <button
                  onClick={toggleIsStake}
                  disabled={!isStakeSelected}
                  className={classNames(
                    'w-full py-2 text-white rounded-lg',
                    isStakeSelected
                      ? 'text-gray-500 dark:text-gray-300  cursor-pointer  dark:bg-gray-500'
                      : 'bg-brand-blue hover:bg-blue-800 cursor-default'
                  )}
                >
                  Unstake
                </button>
              </div>
              <div className="items-center justify-between block px-6 py-4 md:flex">
                <div className="text-2xl font-extrabold leading-8">
                  Stake IMO
                </div>
                <button className="flex items-center px-4 py-2 mt-4 text-blue-700 border-2 border-blue-700 rounded-lg dark:text-blue-400 dark:border-blue-400 md:mt-0">
                  <div className="relative w-6 h-4">
                    <Image
                      src="/logo.png"
                      alt="Workflow logo"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  1xIMO = 1.4 IMO
                </button>
              </div>
              <div className="px-6 py-4 font-extrabold">
                <div className="relative">
                  <input
                    placeholder="0 IMO"
                    className="w-full h-12 px-4 border border-gray-200 rounded-md dark:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200"
                  />

                  <button className="absolute items-center px-2 py-1 text-sm text-blue-700 border-2 border-blue-700 rounded-lg dark:border-blue-400 dark:text-blue-400 right-2 top-2">
                    Max
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                {account ? (
                  <button
                    className={classNames(
                      'w-full py-2 text-white rounded-lg',
                      true
                        ? 'text-gray-500 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                        : 'bg-brand-blue hover:bg-blue-800 cursor-pointer'
                    )}
                  >
                    Stake
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      ModalService.open(WalletModal)
                    }}
                    className="w-full py-2 text-white border-2 rounded-lg border-brand-blue bg-brand-blue"
                  >
                    Connect wallet
                  </button>
                )}
              </div>
            </div>
            <div className="justify-between block p-8 mt-8 border-2 rounded-lg md:hidden radius sm:flex">
              <StakePriceItem title="Balance" tokenName="xIMO" price="5.212" />
              <StakePriceItem
                title="Unstaked"
                tokenName="xIMO"
                price="5.212"
                className="mt-8 md:mt-0"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-brand-gray-2">
        <Footer />
      </div>
    </div>
  )
}

export default StakeInner
