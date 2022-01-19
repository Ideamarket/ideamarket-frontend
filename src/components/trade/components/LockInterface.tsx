import { CogIcon } from '@heroicons/react/outline'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from '@heroicons/react/solid'
import { lockToken } from 'actions'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Tooltip } from 'components'
import ModalService from 'components/modals/ModalService'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useContractStore } from 'store/contractStore'
import {
  floatToWeb3BN,
  formatNumberWithCommasAsThousandsSerperator,
  useTransactionManager,
} from 'utils'
import AdvancedOptions from '../AdvancedOptions'
import ApproveButton from '../ApproveButton'
import TradeCompleteModal, { TRANSACTION_TYPES } from '../TradeCompleteModal'
import TxPending from '../TxPending'
import TradeUIBoxLock from './TradeUIBoxLock'

const LockInterface = ({
  ideaToken,
  rawPairs,
  ideaTokenBalance,
  isTokenBalanceLoading,
  tokenBalance,
  maxButtonClicked,
  tokenValue,
  inputTokenAmount,
  setIdeaTokenAmount,
  recipientAddress,
  marketName,
  marketSpecifics,
  tradeFinishUp,
  exceedsBalance,
}) => {
  const txManager = useTransactionManager()
  const [showInfoDD, setShowInfoDD] = useState(false) // Info dropdown
  const [lockPeriod, setLockPeriod] = useState('3month')

  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(false)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] = useState(true)

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)

  const isInputAmountGTSupply =
    parseFloat(inputTokenAmount) > parseFloat(ideaTokenBalance)

  const isInvalid =
    txManager.isPending ||
    inputTokenAmount === '0' ||
    inputTokenAmount === '' ||
    !/^\d*\.?\d*$/.test(inputTokenAmount) ||
    isInputAmountGTSupply

  const isApproveButtonDisabled = isInvalid || !isMissingAllowance
  const isLockButtonDisabled = isInvalid || isMissingAllowance

  const [pairsToggle, setPairsToggle] = useState([])

  const ideaTokenVaultContractAddress = useContractStore(
    (state) => state.ideaTokenVaultContract
  ).options.address

  const onLockPeriodChanged = (event) => {
    setLockPeriod(event.target.id)
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
    const amount = floatToWeb3BN(inputTokenAmount, 18, BigNumber.ROUND_DOWN)

    const oneMonthInSecs = 2629800
    const threeMonthsInSecs = 7889400

    const args = [
      ideaToken.address,
      amount,
      lockPeriod === '3month' ? threeMonthsInSecs : oneMonthInSecs,
      recipientAddress,
    ]

    try {
      await txManager.executeTx('Lock', lockToken, ...args)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, ideaToken.name, TRANSACTION_TYPES.NONE, marketName)
      return
    }

    tradeFinishUp()
    onTradeComplete(true, ideaToken.name, TRANSACTION_TYPES.LOCK, marketName)
  }

  const togglePairVisibility = (pairsIndex: number) => {
    const pairs = [...pairsToggle]
    pairs[pairsIndex] = !pairs[pairsIndex]
    setPairsToggle(pairs)
  }

  useEffect(() => {
    if (rawPairs && rawPairs.length > 0) {
      // Storing pairs in toggleList based on their index
      const toggleList = rawPairs.map(() => false)
      setPairsToggle(toggleList)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showLockMore, setShowLockMore] = useState(false) // Show UI for locking more or not. Only enabled using Lock More tokens button

  const userAlreadyLocked = rawPairs && rawPairs.length > 0 // User already has some locked tokens
  const userHasTokens = userAlreadyLocked || parseFloat(ideaTokenBalance) > 0 // User has either locked tokens or non-locked tokens already

  // If connected user does not own any of the idea token being looked at
  if (!userHasTokens) {
    return (
      <div>
        <div className="relative w-64 p-2 mt-6 mb-6 bg-brand-blue text-white rounded-lg">
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '25px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #0857e0',
            }}
          ></div>
          <div className="text-sm font-bold">Buy some Tokens first!</div>
          <div className="text-xs">
            You do not own any tokens for this listing
          </div>
        </div>

        <div className="mb-6">
          <div
            onClick={() => setShowInfoDD(!showInfoDD)}
            className="flex justify-between items-center cursor-pointer font-bold"
          >
            <span>Why should I lock tokens?</span>
            {showInfoDD ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </div>
          {showInfoDD && (
            <div className="text-gray-500 text-sm">
              Locking tokens signals your confidence in a listing. For a limited
              time, locked tokens will be rewarded with $IMO, Ideamarket’s
              native token.
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <div className="flex flex-col justify-between border border-transparent rounded-lg p-2 text-sm">
            <div className="flex flex-col">
              <span>Locked Period</span>
              <span className="text-xs opacity-0">(x days)</span>
            </div>
            {/* <div className="my-4">Estimated APR</div> */}
            <div>Redemption Date (if locked today)</div>
          </div>

          <div className="w-52 flex flex-col justify-between items-end border rounded-lg p-2">
            <div className="flex flex-col items-end">
              <span className="font-bold">1 month</span>
              <span className="text-xs">(30 days)</span>
            </div>
            {/* <div className="text-green-500 font-bold">12%</div> */}
            <div>{moment(new Date(Date.now() + 2629800000)).format('LL')}</div>
          </div>

          <div className="w-52 flex flex-col justify-between items-end border rounded-lg p-2">
            <div className="flex flex-col items-end">
              <span className="font-bold">3 months</span>
              <span className="text-xs">(90 days)</span>
            </div>
            {/* <div className="text-green-500 font-bold">22%</div> */}
            <div>{moment(new Date(Date.now() + 7889400000)).format('LL')}</div>
          </div>
        </div>

        <div className="text-gray-500 text-sm w-full mt-4 flex justify-end">
          <span className="cursor-pointer">FAQ</span>
          <ExternalLinkIcon className="w-5 h-5 ml-1 cursor-pointer" />
        </div>
      </div>
    )
  } else {
    return (
      <div>
        {userAlreadyLocked && (
          <div className="mt-8">
            {rawPairs.map((pair, pairInd) => {
              const redemptionDate = moment(pair.lockedUntil * 1000).format(
                'LL'
              )

              return (
                <div
                  className="w-full px-5 py-4 mb-4 border border-gray-100 rounded-md bg-gray-50 dark:bg-gray-600 text-brand-new-dark"
                  key={pairInd}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm">Locked Tokens</div>
                      <div className="font-bold text-lg">
                        {formatNumberWithCommasAsThousandsSerperator(
                          parseFloat(pair.amount).toFixed(2)
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {/* <div>
                        <div className="text-sm">APR</div>
                        <div className="font-bold text-lg text-green-500">
                          12%
                        </div>
                      </div> */}
                      {pairsToggle[pairInd] ? (
                        <ChevronUpIcon
                          onClick={() => togglePairVisibility(pairInd)}
                          className="w-5 h-5 ml-4 cursor-pointer text-gray-400"
                        />
                      ) : (
                        <ChevronDownIcon
                          onClick={() => togglePairVisibility(pairInd)}
                          className="w-5 h-5 ml-4 cursor-pointer text-gray-400"
                        />
                      )}
                    </div>
                  </div>

                  {pairsToggle[pairInd] && (
                    <div className="flex flex-col mt-12">
                      {/* <div className="flex justify-between">
                        <div>Locked Period</div>
                        <div>
                          <div className="font-bold">3 months</div>
                          <div className="text-sm text-right">(90 days)</div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>Locked Date</div>
                        <div>23 November 2021</div>
                      </div> */}
                      <div className="flex justify-between">
                        <div>Redemption Date</div>
                        <div>{redemptionDate}</div>
                      </div>
                      {/* <div className="flex justify-between">
                        <div>Cummulative Interest</div>
                        <div>0.105</div>
                      </div> */}
                    </div>
                  )}
                </div>
              )
            })}
            <hr className="my-8" />
          </div>
        )}
        {!userAlreadyLocked || (userAlreadyLocked && showLockMore) ? (
          <div>
            <div className="my-6">
              <div
                onClick={() => setShowInfoDD(!showInfoDD)}
                className="flex justify-between items-center cursor-pointer font-bold"
              >
                <span>Why should I lock tokens?</span>
                {showInfoDD ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </div>
              {showInfoDD && (
                <div className="text-gray-500 text-sm">
                  Locking tokens signals your confidence in a listing. For a
                  limited time, locked tokens will be rewarded with $IMO,
                  Ideamarket’s native token.
                </div>
              )}
            </div>

            <TradeUIBoxLock
              txManager={txManager}
              isTokenBalanceLoading={isTokenBalanceLoading}
              ideaTokenBalance={ideaTokenBalance}
              maxButtonClicked={maxButtonClicked}
              tokenValue={tokenValue}
              inputTokenAmount={inputTokenAmount}
              setIdeaTokenAmount={setIdeaTokenAmount}
              exceedsBalance={exceedsBalance}
              isInputAmountGTSupply={isInputAmountGTSupply}
            />

            <div className="flex space-x-2">
              <div className="flex flex-col justify-between border border-transparent rounded-lg p-2 text-sm">
                <div className="flex flex-col">
                  <span>Locked Period</span>
                  <span className="text-xs opacity-0">(x days)</span>
                </div>
                {/* <div className="my-4">Estimated APR</div> */}
                <div>Redemption Date (if locked today)</div>
              </div>

              <div
                className={classNames(
                  lockPeriod === '1month' && 'bg-blue-100 border-blue-600',
                  'relative w-52 flex flex-col justify-between items-end border rounded-lg p-2'
                )}
              >
                <input
                  onChange={onLockPeriodChanged}
                  className="absolute -top-4 right-4 w-6 h-6"
                  checked={lockPeriod === '1month'}
                  type="radio"
                  id="1month"
                  name="lock-period"
                />
                <div className="flex flex-col items-end">
                  <span className="font-bold">1 month</span>
                  <span className="text-xs">(30 days)</span>
                </div>
                {/* <div className="text-green-500 font-bold">12%</div> */}
                <div>
                  {moment(new Date(Date.now() + 2629800000)).format('LL')}
                </div>
              </div>

              <div
                className={classNames(
                  lockPeriod === '3month' && 'bg-blue-100 border-blue-600',
                  'relative w-52 flex flex-col justify-between items-end border rounded-lg p-2'
                )}
              >
                <input
                  onChange={onLockPeriodChanged}
                  className="absolute -top-4 right-4 w-6 h-6"
                  checked={lockPeriod === '3month'}
                  type="radio"
                  id="3month"
                  name="lock-period"
                />
                <div className="flex flex-col items-end">
                  <span className="font-bold">3 months</span>
                  <span className="text-xs">(90 days)</span>
                </div>
                {/* <div className="text-green-500 font-bold">22%</div> */}
                <div>
                  {moment(new Date(Date.now() + 7889400000)).format('LL')}
                </div>
              </div>
            </div>

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

            <ApproveButton
              tokenAddress={ideaToken.address}
              tokenName={marketSpecifics.getTokenDisplayName(ideaToken.name)}
              spenderAddress={ideaTokenVaultContractAddress}
              requiredAllowance={floatToWeb3BN(
                inputTokenAmount,
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
                'mt-3 py-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
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

            <div className="text-gray-500 text-sm w-full mt-4 flex justify-end">
              <span className="cursor-pointer">FAQ</span>
              <ExternalLinkIcon className="w-5 h-5 ml-1 cursor-pointer" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              className="py-2 mt-2 mb-6 text-lg font-bold text-blue-500 border border-blue-500 rounded-lg w-44 hover:bg-blue-500 hover:text-white"
              onClick={() => setShowLockMore(true)}
            >
              Lock More Tokens
            </button>
          </div>
        )}
      </div>
    )
  }
}

export default LockInterface
