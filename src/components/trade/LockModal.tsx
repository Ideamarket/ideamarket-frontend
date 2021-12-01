import classNames from 'classnames'
import { useState } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { floatToWeb3BN, useTransactionManager } from 'utils'
import { lockToken } from 'actions'
import Modal from '../modals/Modal'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import ApproveButton from './ApproveButton'
import AdvancedOptions from './AdvancedOptions'
import Tooltip from '../tooltip/Tooltip'
import { useContractStore } from 'store/contractStore'
import { CogIcon } from '@heroicons/react/outline'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, { TRANSACTION_TYPES } from './TradeCompleteModal'
import TxPending from './TxPending'

export default function LockModal({
  close,
  token,
  balance,
  refetch,
  marketName,
}: {
  close: () => void
  token: IdeaToken
  balance: string
  refetch: () => void
  marketName: string
}) {
  const txManager = useTransactionManager()
  const [amountToLock, setAmountToLock] = useState('')
  const { account } = useWeb3React()

  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(false)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] = useState(true)
  const ideaTokenVaultContractAddress = useContractStore(
    (state) => state.ideaTokenVaultContract
  ).options.address

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)

  const isInputAmountGTSupply = parseFloat(amountToLock) > parseFloat(balance)

  const isInvalid =
    txManager.isPending ||
    amountToLock === '0' ||
    amountToLock === '' ||
    !/^\d*\.?\d*$/.test(amountToLock) ||
    isInputAmountGTSupply

  const isApproveButtonDisabled = isInvalid || !isMissingAllowance
  const isLockButtonDisabled = isInvalid || isMissingAllowance

  function onInputChanged(event) {
    const oldValue = amountToLock
    const newValue = event.target.value
    const setValue = /^\d*\.?\d*$/.test(newValue) ? newValue : oldValue

    setAmountToLock(setValue)
  }

  function onTradeComplete(
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES,
    marketName: string
  ) {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      transactionType,
      marketName,
    })
  }

  async function onLockClicked() {
    const amount = floatToWeb3BN(amountToLock, 18, BigNumber.ROUND_DOWN)

    const args = [token.address, amount, 31556952, account]

    try {
      await txManager.executeTx('Lock', lockToken, ...args)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, token.name, TRANSACTION_TYPES.NONE, marketName)
      return
    }

    refetch()
    onTradeComplete(true, token.name, TRANSACTION_TYPES.LOCK, marketName)
  }

  return (
    <Modal close={close}>
      <div className="md:min-w-150 md:max-w-150">
        <div className="flex justify-end">
          <Tooltip
            className="w-4 h-4 m-4 cursor-pointer text-brand-gray-2 dark:text-gray-300"
            placement="down"
            IconComponent={CogIcon}
          >
            <div className="w-64 mb-2">
              <AdvancedOptions
                disabled={txManager.isPending}
                setIsUnlockOnceChecked={setIsUnlockOnceChecked}
                isUnlockOnceChecked={isUnlockOnceChecked}
                isUnlockPermanentChecked={isUnlockPermanentChecked}
                setIsUnlockPermanentChecked={setIsUnlockPermanentChecked}
                unlockText={''}
              />
            </div>
          </Tooltip>
        </div>
        <div className="flex flex-col items-center p-4 space-y-4">
          <p>Amount of {token.name} upvotes to lock for 1 year</p>
          <input
            className={classNames(
              'pl-2 w-40 h-10 leading-tight border-2 rounded appearance-none focus:outline-none focus:bg-white placeholder-gray-500 dark:placeholder-gray-300 placeholder-opacity-50 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600'
            )}
            min="0"
            placeholder="0.0"
            onChange={onInputChanged}
            value={amountToLock}
          />
          {isInputAmountGTSupply && (
            <div className="text-brand-red">Insufficient balance</div>
          )}
          <ApproveButton
            tokenAddress={token.address}
            tokenName={token.name}
            spenderAddress={ideaTokenVaultContractAddress}
            requiredAllowance={floatToWeb3BN(
              amountToLock,
              18,
              BigNumber.ROUND_UP
            )}
            unlockPermanent={isUnlockPermanentChecked}
            txManager={txManager}
            setIsMissingAllowance={setIsMissingAllowance}
            disable={isApproveButtonDisabled}
            txType="lock"
          />
          <button
            className={classNames(
              'py-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
              isLockButtonDisabled
                ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
            )}
            disabled={isLockButtonDisabled}
            onClick={onLockClicked}
          >
            <span>Lock</span>
          </button>

          <TxPending txManager={txManager} />
        </div>
      </div>
    </Modal>
  )
}
