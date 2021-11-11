import classNames from 'classnames'
import { useState } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { floatToWeb3BN, isAddress, useTransactionManager } from 'utils'
import { lockToken } from 'actions'
import Modal from '../modals/Modal'
import BigNumber from 'bignumber.js'
import ApproveButton from './ApproveButton'
import AdvancedOptions from './AdvancedOptions'
import Tooltip from '../tooltip/Tooltip'
import { useContractStore } from 'store/contractStore'
import { CogIcon } from '@heroicons/react/outline'
import CircleSpinner from 'components/animations/CircleSpinner'
import { A } from 'components'
import { NETWORK } from 'store/networks'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, { TRANSACTION_TYPES } from './TradeCompleteModal'
import transferToken from 'actions/transferToken'
import { useENSAddress } from './hooks/useENSAddress'

export default function GiftModal({
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
  const [amountToGift, setamountToGift] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isENSAddressValid, hexAddress] = useENSAddress(recipientAddress)

  const [isLockChecked, setIsLockChecked] = useState(false)

  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(true)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] =
    useState(false)
  const ideaTokenVaultContractAddress = useContractStore(
    (state) => state.ideaTokenVaultContract
  ).options.address

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)

  const isInputAmountGTSupply = parseFloat(amountToGift) > parseFloat(balance)

  const isInvalid =
    txManager.isPending ||
    amountToGift === '0' ||
    amountToGift === '' ||
    !/^\d*\.?\d*$/.test(amountToGift) ||
    isInputAmountGTSupply

  const isApproveButtonDisabled = isInvalid || !isMissingAllowance
  const isLockButtonDisabled =
    isInvalid || (isLockChecked && isMissingAllowance)

  function onInputChanged(event) {
    const oldValue = amountToGift
    const newValue = event.target.value
    const setValue = /^\d*\.?\d*$/.test(newValue) ? newValue : oldValue

    setamountToGift(setValue)
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

  const giftAddress = isENSAddressValid ? hexAddress : recipientAddress

  async function onGiftClicked() {
    const amount = floatToWeb3BN(amountToGift, 18, BigNumber.ROUND_DOWN)

    const lockArgs = [token.address, amount, 31556952, giftAddress]
    const transferArgs = [token.address, giftAddress, amount]

    try {
      isLockChecked
        ? await txManager.executeTx('Lock', lockToken, ...lockArgs)
        : await txManager.executeTx('Transfer', transferToken, ...transferArgs)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, token.name, TRANSACTION_TYPES.NONE, marketName)
      return
    }

    refetch()
    onTradeComplete(true, token.name, TRANSACTION_TYPES.GIFT, marketName)
  }

  return (
    <Modal close={close}>
      <div className="w-72 md:min-w-150 md:max-w-150">
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
          <p>Amount of {token.name} to gift</p>
          <input
            className={classNames(
              'pl-2 w-60 h-10 leading-tight border-2 rounded appearance-none focus:outline-none focus:bg-white placeholder-gray-500 dark:placeholder-gray-300 placeholder-opacity-50 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600'
            )}
            min="0"
            placeholder="0.0"
            onChange={onInputChanged}
            value={amountToGift}
          />
          {isInputAmountGTSupply && (
            <div className="text-brand-red">Insufficient balance</div>
          )}

          <p>Recipient address or ENS</p>
          <input
            className={classNames(
              'pl-2 w-60 h-10 leading-tight border-2 rounded appearance-none focus:outline-none focus:bg-white placeholder-gray-500 dark:placeholder-gray-300 placeholder-opacity-50 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600',
              isAddress(recipientAddress) || isENSAddressValid
                ? 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                : 'border-brand-red focus:border-brand-red focus:ring-red-500'
            )}
            placeholder="Recipient address or ENS"
            onChange={(event: any) => setRecipientAddress(event.target.value)}
            value={recipientAddress}
          />

          <div>
            <input
              type="checkbox"
              className="border-2 border-gray-200 rounded-sm cursor-pointer"
              id="lockCheckbox"
              disabled={txManager.isPending}
              checked={isLockChecked}
              onChange={(e) => {
                setIsLockChecked(e.target.checked)
              }}
            />
            <label
              htmlFor="lockCheckbox"
              className={classNames(
                'ml-2 cursor-pointer',
                isLockChecked
                  ? 'text-brand-blue dark:text-blue-400'
                  : 'text-gray-500 dark:text-white'
              )}
            >
              Lock for 1 year
            </label>
          </div>
          {isLockChecked && (
            <ApproveButton
              tokenAddress={token.address}
              tokenName={token.name}
              spenderAddress={ideaTokenVaultContractAddress}
              requiredAllowance={floatToWeb3BN(
                amountToGift,
                18,
                BigNumber.ROUND_UP
              )}
              unlockPermanent={isUnlockPermanentChecked}
              txManager={txManager}
              setIsMissingAllowance={setIsMissingAllowance}
              disable={isApproveButtonDisabled}
              txType="spend"
            />
          )}

          <button
            className={classNames(
              'py-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
              isLockButtonDisabled
                ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
            )}
            disabled={isLockButtonDisabled}
            onClick={onGiftClicked}
          >
            <span>Gift</span>
          </button>

          <div
            className={classNames(
              'w-full grid grid-cols-3 my-5 text-sm text-brand-new-dark font-semibold',
              txManager.isPending ? '' : 'invisible'
            )}
          >
            <div className="font-bold justify-self-center">
              {txManager.name}
            </div>
            <div className="justify-self-center">
              <A
                className={classNames(
                  'underline',
                  txManager.hash === '' ? 'hidden' : ''
                )}
                href={NETWORK.getEtherscanTxUrl(txManager.hash)}
                target="_blank"
              >
                {txManager.hash.slice(0, 8)}...{txManager.hash.slice(-6)}
              </A>
            </div>
            <div className="justify-self-center">
              <CircleSpinner color="#0857e0" />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
