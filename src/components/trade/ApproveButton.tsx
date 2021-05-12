import { useEffect, useState } from 'react'
import classNames from 'classnames'
import BN from 'bn.js'
import _ from 'lodash'

import { useTokenAllowance, approveToken } from '../../actions'
import { TransactionManager, web3UintMax } from '../../utils'
export default function ApproveButton({
  tokenAddress,
  tokenSymbol,
  spenderAddress,
  requiredAllowance,
  unlockPermanent,
  txManager,
  disable,
  setIsMissingAllowance,
}: {
  tokenAddress: string
  tokenSymbol: string
  spenderAddress: string
  requiredAllowance: BN
  unlockPermanent: boolean
  disable?: boolean
  txManager: TransactionManager
  setIsMissingAllowance: (b: boolean) => void
}) {
  const [isAllowanceLoading, allowance] = useTokenAllowance(
    tokenAddress,
    spenderAddress,
    [tokenAddress, spenderAddress]
  )

  const [hasAllowanceFor, setHasAllowanceFor] = useState({})

  const isMissingAllowance = hasAllowanceFor[tokenAddress]?.[spenderAddress]
    ? hasAllowanceFor[tokenAddress][spenderAddress].lt(requiredAllowance)
    : allowance
    ? allowance.lt(requiredAllowance)
    : false

  useEffect(() => {
    setIsMissingAllowance(isMissingAllowance)
  }, [isMissingAllowance])

  async function approve() {
    const allowanceAmount = unlockPermanent ? web3UintMax : requiredAllowance

    try {
      await txManager.executeTx(
        'Unlock',
        approveToken,
        tokenAddress,
        spenderAddress,
        allowanceAmount
      )
    } catch (ex) {
      console.log(ex)
      return
    }

    const allowances = _.cloneDeep(hasAllowanceFor)
    if (!allowances[tokenAddress]) {
      allowances[tokenAddress] = {}
    }
    allowances[tokenAddress][spenderAddress] = allowanceAmount
    setHasAllowanceFor(allowances)
  }

  return (
    <button
      className={classNames(
        'w-28 md:w-40 h-12 text-base bg-white border-2 dark:border-gray-500 dark:bg-gray-500 rounded-lg tracking-tightest-2',
        disable
          ? 'bg-brand-gray border-brand-gray text-brand-gray-2 cursor-default'
          : 'border-brand-blue text-white bg-brand-blue font-medium'
      )}
      disabled={disable}
      onClick={approve}
    >
      Unlock {tokenSymbol?.toUpperCase()}
    </button>
  )
}
