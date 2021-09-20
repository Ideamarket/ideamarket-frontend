import { useEffect, useState } from 'react'
import classNames from 'classnames'
import BN from 'bn.js'

import { useTokenAllowance, approveToken } from '../../actions'
import { TransactionManager, web3UintMax } from '../../utils'
import Tooltip from 'components/tooltip/Tooltip'
import { cloneDeep } from 'utils/lodash'

export default function ApproveButton({
  tokenAddress,
  tokenName,
  spenderAddress,
  requiredAllowance,
  unlockPermanent,
  txManager,
  disable,
  setIsMissingAllowance,
  isLock = false,
}: {
  tokenAddress: string
  tokenName: string
  spenderAddress: string
  requiredAllowance: BN
  unlockPermanent: boolean
  disable?: boolean
  txManager: TransactionManager
  setIsMissingAllowance: (b: boolean) => void
  isLock?: boolean
}) {
  const [allowance] = useTokenAllowance(tokenAddress, spenderAddress, [
    tokenAddress,
    spenderAddress,
  ])

  const [hasAllowanceFor, setHasAllowanceFor] = useState({})

  const isMissingAllowance = hasAllowanceFor[tokenAddress]?.[spenderAddress]
    ? hasAllowanceFor[tokenAddress][spenderAddress].lt(requiredAllowance)
    : allowance !== undefined && allowance.lt(requiredAllowance)

  useEffect(() => {
    setIsMissingAllowance(isMissingAllowance)
  }, [isMissingAllowance, setIsMissingAllowance])

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

    const allowances = cloneDeep(hasAllowanceFor)
    if (!allowances[tokenAddress]) {
      allowances[tokenAddress] = {}
    }
    allowances[tokenAddress][spenderAddress] = allowanceAmount
    setHasAllowanceFor(allowances)
  }

  return (
    <div
      className={classNames(
        'flex justify-center items-center py-4 px-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium text-center dark:border-gray-500',
        disable
          ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
          : 'border-brand-blue text-white bg-brand-blue font-medium hover:bg-blue-800 cursor-pointer'
      )}
      onClick={() => {
        !disable && approve()
      }}
    >
      <span>
        Allow Ideamarket to {isLock ? 'lock' : 'spend'} your {tokenName}
      </span>
      <Tooltip className="inline-block ml-2">
        <div className="w-32 md:w-64">
          The Ideamarket smart contract needs your approval to interact with
          your {tokenName} balance. After you grant permission, the{' '}
          {isLock ? 'Lock' : 'Buy/Sell'} button will be enabled. Select 'allow
          permanent' in Settings (⚙️) to permanently enable {tokenName}{' '}
          {isLock ? 'locking' : 'spending'} from this wallet.
        </div>
      </Tooltip>
    </div>
  )
}
