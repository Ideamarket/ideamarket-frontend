import React from 'react'
import { useWeb3React } from '@web3-react/core'

import useClaimable from 'actions/useClaimable'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'

import { Eligible } from './Eligible'
import { NotEligible } from './NotEligible'
import { AlreadyClaimed } from './AlreadyClaimed'

interface Props {
  setClaimStep: (any) => void
}

const EligibilityOutcome: React.FC<Props> = ({ setClaimStep }) => {
  const { account } = useWeb3React()
  const claimableIMO: number = useClaimable(account)
  const alreadyClaimed: boolean = isAddressInMerkleRoot(account)
  return (
    <div className="flex flex-col md:flex-row flex-grow items-start justify-between rounded-lg dark:bg-gray-500">
      {claimableIMO ? (
        <Eligible setClaimStep={setClaimStep} />
      ) : !alreadyClaimed ? (
        <NotEligible setClaimStep={setClaimStep} />
      ) : (
        <AlreadyClaimed />
      )}
    </div>
  )
}

export default EligibilityOutcome
