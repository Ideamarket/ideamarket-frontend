import React, { useEffect } from 'react'
import { WalletStatus } from 'components'

interface Props {
  setClaimStep: (any) => void
}

const CheckEligibility: React.FC<Props> = ({ setClaimStep }) => {
  useEffect(() => {
    const timerId = setTimeout(() => {
      setClaimStep((c) => c + 1)
    }, 1000)
    return () => {
      clearTimeout(timerId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex flex-grow rounded-lg dark:bg-gray-500 w-full md:w-1/2">
      <div className="mb-8 md:mb-0">
        <div className="flex">
          <WalletStatus />
        </div>
        <div className="my-6 text-2xl font-extrabold opacity-75">
          Wallet Connected
        </div>
        <div className="my-6 text-4xl font-extrabold opacity-75">
          Checking your Elgibility...
        </div>
      </div>
    </div>
  )
}

export default CheckEligibility
