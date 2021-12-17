import React, { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

import useClaimable from 'actions/useClaimable'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'
import { getClaimPointBreakdown } from 'utils/claimPointBreakdown'

import { Eligible } from './Eligible'
import { NotEligible } from './NotEligible'
import { AlreadyClaimed } from './AlreadyClaimed'

interface Props {
  setClaimStep: (any) => void
}
export interface BreakdownPoint {
  text: string
  amount: number[]
}

const EligibilityOutcome: React.FC<Props> = ({ setClaimStep }) => {
  const { account } = useWeb3React()
  const claimableIMO: number = useClaimable(account)
  const alreadyClaimed: boolean = isAddressInMerkleRoot(account)
  const breakdownByPoint: BreakdownPoint[] = useMemo(() => {
    const claimPointBreakdown = getClaimPointBreakdown(account)
    return [
      {
        text: 'Listing an Account',
        amount: [
          claimPointBreakdown[0].listing,
          claimPointBreakdown[1].listing,
        ],
      },
      {
        text: 'Buying Tokens',
        amount: [claimPointBreakdown[0].buying, claimPointBreakdown[1].buying],
      },
      {
        text: 'Locking Tokens',
        amount: [
          claimPointBreakdown[0].locking,
          claimPointBreakdown[1].locking,
        ],
      },
      {
        text: 'Verifying an Account',
        amount: [
          claimPointBreakdown[0].verifying,
          claimPointBreakdown[1].verifying,
        ],
      },
    ]
  }, [account])

  return (
    <div className="flex flex-col md:flex-row flex-grow items-start justify-between rounded-lg dark:bg-gray-500">
      {claimableIMO ? (
        <Eligible
          setClaimStep={setClaimStep}
          breakdownByPoint={breakdownByPoint}
        />
      ) : !alreadyClaimed ? (
        <NotEligible
          setClaimStep={setClaimStep}
          breakdownByPoint={breakdownByPoint}
        />
      ) : (
        <AlreadyClaimed breakdownByPoint={breakdownByPoint} />
      )}
    </div>
  )
}

export default EligibilityOutcome
