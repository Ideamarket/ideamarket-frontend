import React, { useEffect, useState } from 'react'
import { WalletStatus } from 'components'
import { LoadingDots } from 'components/loading-dots'

interface Props {
  setClaimStep: (any) => void
}

const CheckEligibility: React.FC<Props> = ({ setClaimStep }) => {
  const [loading, setLoading] = useState<Boolean>(true)
  useEffect(() => {
    const timerId = setTimeout(() => {
      setClaimStep((c) => c + 1)
      setLoading(false)
    }, 1000)
    return () => {
      clearTimeout(timerId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex flex-grow rounded-lg dark:bg-gray-500 w-full md:w-1/2 font-gilroy-bold">
      <div className="mb-8 md:mb-0">
        <div className="flex">
          <WalletStatus />
        </div>
        <div className="my-6 text-2xl font-extrabold opacity-75">
          Wallet Connected
        </div>
        <div className="my-6 text-5xl font-extrabold opacity-75">
          Checking your Elgibility...
        </div>
        {loading && <LoadingDots />}
      </div>
    </div>
  )
}

export default CheckEligibility
