import { useEffect, useState } from 'react'
import classNames from 'classnames'
import BN from 'bn.js'
import _ from 'lodash'

import Settings from '../../assets/settings.svg'
import { useTokenAllowance, approveToken } from '../../actions'
import { TransactionManager, web3UintMax } from '../../utils'
import Tooltip from 'components/tooltip/Tooltip'

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
    : allowance !== undefined && allowance.lt(requiredAllowance)

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
    <div
      className={classNames(
        'py-4 px-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium text-center dark:border-gray-500',
        disable
          ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
          : 'border-brand-blue text-white bg-brand-blue font-medium hover:bg-blue-800 cursor-pointer'
      )}
      onClick={() => {
        !disable && approve()
      }}
    >
      <span>Allow Ideamarket to spend your {tokenSymbol?.toUpperCase()}</span>
      <Tooltip className="inline-block ml-2">
        <div className="w-32 md:w-64">
          The Ideamarket smart contract needs your approval to interact with
          your {tokenSymbol?.toUpperCase()} balance. After you grant permission,
          the Buy/Sell button will be enabled. Select 'unlock permanent' in
          Settings (⚙️) to permanently enable {tokenSymbol?.toUpperCase()}{' '}
          spending from this wallet.
        </div>
      </Tooltip>
    </div>
  )
}
