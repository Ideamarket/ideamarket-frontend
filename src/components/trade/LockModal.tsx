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
import CircleSpinner from 'components/animations/CircleSpinner'
import { A } from 'components'
import { NETWORK } from 'store/networks'

export default function LockModal({
  close,
  token,
  refetch,
}: {
  close: () => void
  token: IdeaToken
  refetch: () => void
}) {
  const txManager = useTransactionManager()
  const [amountToLock, setAmountToLock] = useState('')
  const { account } = useWeb3React()

  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(true)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] =
    useState(false)
  const ideaTokenVaultContractAddress = useContractStore(
    (state) => state.ideaTokenVaultContract
  ).options.address

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)

  const isInvalid =
    txManager.isPending ||
    amountToLock === '0' ||
    amountToLock === '' ||
    !/^\d*\.?\d*$/.test(amountToLock)

  const isApproveButtonDisabled = isInvalid || !isMissingAllowance
  const isLockButtonDisabled = isInvalid || isMissingAllowance

  function onInputChanged(event) {
    const oldValue = amountToLock
    const newValue = event.target.value
    const setValue = /^\d*\.?\d*$/.test(newValue) ? newValue : oldValue

    setAmountToLock(setValue)
  }

  async function onLockClicked() {
    const amount = floatToWeb3BN(amountToLock, 18, BigNumber.ROUND_DOWN)

    const args = [token.address, amount, 31556952, account]

    try {
      await txManager.executeTx('Lock', lockToken, ...args)
    } catch (ex) {
      console.log(ex)
      return
    }

    close()
    refetch()
  }

  return (
    <Modal close={close}>
      <div className="md:min-w-150 md:max-w-150">
        <div className="flex justify-end">
          <Tooltip
            className="w-4 h-4 m-4 cursor-pointer text-brand-gray-4"
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
        <div className="p-4 flex flex-col items-center space-y-4">
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
            isLock={true}
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
