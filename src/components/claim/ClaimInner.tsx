import { Footer } from 'components'
import Select from 'react-select'
import Image from 'next/image'
import { useState } from 'react'
import classNames from 'classnames'

const options = [
  {
    value: '0x00000000219ab540356cbb839cbe05303d7705fa',
    label: '0x00000000219ab540356cbb839cbe05303d7705fa',
  },
  {
    value: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    label: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
]

const ClaimInner = () => {
  const [selectValue, setSelectValue] = useState(null)
  const [isClaimed, setIsClaimed] = useState(false)

  const onClaimButtonClick = () => {
    setIsClaimed(true)
  }
  return (
    <div className="w-11/12 max-w-5xl mx-auto my-0 md:pt-24 font-inter w-90">
      <div className="flex flex-col items-end mx-4">
        <div className="invisible mb-4 text-4xl italic text-white md:visible">
          Claim
        </div>
        <div className="flex justify-between w-full mb-2 md:justify-end"></div>
      </div>
      <div className="flex flex-col items-start justify-center p-8 bg-white rounded-lg md:p-16 md:flex-row dark:bg-gray-500">
        <div className="md:grid md:grid-cols-2 md:gap-4">
          <div className="mb-8 md:mb-0">
            <div className="flex-row hidden max-w-md font-extrabold md:flex">
              <div>1. Claim</div>
              <span className="inline-block w-2 ml-2 mr-2">
                <Image src="/arrow-dark.svg" height={12} width={8} alt="" />
              </span>
              <div className="opacity-50">2. Stake</div>
            </div>
            <div className="visible mb-4 text-xl md:invisible">Claim</div>

            <div className="my-6 text-4xl font-extrabold">
              Lorem ipsum dolor sit amet, consectetur
            </div>
            <div className="text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vel
              congue nibh scelerisque cursus enim. Lectus dui interdum neque
              libero et arcu, scelerisque libero. Diam ut turpis enim amet, quis
              fermentum risus egestas dui. Viverra elementum pharetra risus elit
              montes, nisl venenatis arcu.
            </div>
          </div>
          <div>
            <div className="bg-blue-100 rounded-2xl">
              <div className="p-4 text-xs text-white uppercase bg-no-repeat bg-cover rounded-2xl bg-claim-imo-bg">
                <div>Claim imo token</div>
                <div className="mt-2 text-3xl font-extrabold">0 IMO</div>
              </div>
              <div className="px-6 py-4">
                Enter an address to trigger a IMO claim. If the address has any
                claimable UNI it will be sent to them on submission
              </div>
              <div className="px-6 py-4 font-extrabold">
                <div>Recipient</div>
                <Select
                  placeholder="Callet address, ENS name, or select a wallet"
                  options={options}
                  onChange={(option) => {
                    setSelectValue(option)
                  }}
                />
              </div>
              <div className="px-6 py-4">
                <button
                  onClick={onClaimButtonClick}
                  className={classNames(
                    'w-full py-2 text-white rounded-lg',
                    selectValue
                      ? 'bg-brand-blue hover:bg-blue-800'
                      : 'text-gray-700 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                  )}
                >
                  Claim IMO
                </button>
              </div>
            </div>
            {isClaimed && (
              <div>
                <div
                  className="my-4 font-bold text-center"
                  style={{ color: '#79C08D' }}
                >
                  <span className="text-2xl">✓</span> IMO token Claimed!
                </div>
                <div className="text-right">
                  <button className="w-32 py-2 text-white rounded-lg bg-brand-blue hover:bg-blue-800">
                    Stake
                    <span className="inline-block w-2 ml-2 mr-2">
                      <Image src="/arrow@3x.png" height={12} width={8} alt="" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ClaimInner
