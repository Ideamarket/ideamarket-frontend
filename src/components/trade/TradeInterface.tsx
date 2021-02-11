import _ from 'lodash'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { IdeaToken, IdeaMarket } from 'store/ideaMarketsStore'
import { useTokenListStore } from 'store/tokenListStore'
import { useBalance, useOutputAmount, buyToken, sellToken } from 'actions'
import {
  floatToWeb3BN,
  addresses,
  NETWORK,
  calculateMaxIdeaTokensBuyable,
  formatBigNumber,
  getUniswapDaiOutputSwap,
  useTransactionManager,
} from 'utils'
import { useContractStore } from 'store/contractStore'

import Select from 'react-select'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import ApproveButton from './ApproveButton'
import AdvancedOptions from './AdvancedOptions'
import Tooltip from '../tooltip/Tooltip'
import CircleSpinner from '../animations/CircleSpinner'

export default function TradeInterface({
  ideaToken,
  market,
  onTradeSuccessful,
  onValuesChanged,
  resetOn,
  showTypeSelection,
  showTradeButton,
  disabled,
  bgcolor,
}: {
  ideaToken: IdeaToken
  market: IdeaMarket
  onTradeSuccessful: () => void
  onValuesChanged: (
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenAmount: BN,
    slippage: number,
    lock: boolean,
    isValid: boolean
  ) => void
  resetOn: boolean
  showTypeSelection: boolean
  showTradeButton: boolean
  disabled: boolean
  bgcolor?: string
}) {
  const [tradeType, setTradeType] = useState('buy')
  const [isLockChecked, setIsLockChecked] = useState(false)
  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(true)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] = useState(
    false
  )

  const tokenList = useTokenListStore((state) => state.tokens)
  const selectTokensValues = tokenList.map((token) => ({
    value: token.address,
    token: token,
  }))

  const [selectedToken, setSelectedToken] = useState(undefined)
  const [
    isIdeaTokenBalanceLoading,
    ideaTokenBalanceBN,
    ideaTokenBalance,
  ] = useBalance(ideaToken?.address, 18)

  const [isTokenBalanceLoading, tokenBalanceBN, tokenBalance] = useBalance(
    selectedToken?.address,
    selectedToken?.decimals
  )

  const [ideaTokenAmount, setIdeaTokenAmount] = useState('0')
  const [isTokenAmountLoading, tokenAmountBN, tokenAmount] = useOutputAmount(
    ideaToken,
    market,
    selectedToken?.address,
    ideaTokenAmount,
    selectedToken?.decimals,
    tradeType
  )

  const exchangeContractAddress = useContractStore(
    (state) => state.exchangeContract
  ).options.address
  const multiActionContractAddress = useContractStore(
    (state) => state.multiActionContract
  ).options.address

  const spender =
    tradeType === 'buy'
      ? selectedToken?.address === addresses.dai && !isLockChecked
        ? exchangeContractAddress
        : multiActionContractAddress
      : selectedToken.address !== addresses.dai
      ? multiActionContractAddress
      : undefined

  const spendToken =
    tradeType === 'buy' ? selectedToken?.address : ideaToken.address

  const requiredAllowance =
    tradeType === 'buy' ? tokenAmountBN : floatToWeb3BN(ideaTokenAmount, 18)

  const exceedsBalance =
    tradeType === 'buy'
      ? isTokenBalanceLoading || !tokenAmountBN
        ? false
        : tokenBalanceBN.lt(tokenAmountBN)
      : isIdeaTokenBalanceLoading
      ? false
      : ideaTokenBalanceBN.lt(floatToWeb3BN(ideaTokenAmount, 18))

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)
  const [approveButtonKey, setApproveButtonKey] = useState(0)
  const txManager = useTransactionManager()

  let slippage = 0.01
  type SlippageValue = {
    value: number
    label: string
  }
  const slippageValues: SlippageValue[] = [
    { value: 0.01, label: '1% max. slippage' },
    { value: 0.02, label: '2% max. slippage' },
    { value: 0.03, label: '3% max. slippage' },
    { value: 0.04, label: '4% max. slippage' },
    { value: 0.05, label: '5% max. slippage' },
  ]

  useEffect(() => {
    setSelectedToken(useTokenListStore.getState().tokens[0])
    setIdeaTokenAmount('')
    setTradeType('buy')
    setApproveButtonKey(approveButtonKey + 1)
  }, [resetOn])

  useEffect(() => {
    let isValid =
      selectedToken !== undefined &&
      ideaTokenAmount !== '' &&
      tokenAmount !== '' &&
      tokenAmountBN !== undefined &&
      tokenAmountBN.gt(new BN('0')) &&
      floatToWeb3BN(ideaTokenAmount, 18).gt(new BN('0'))

    if (isValid) {
      if (tradeType === 'buy') {
        if (tokenAmountBN.gt(tokenBalanceBN)) {
          isValid = false
        }
      } else {
        if (floatToWeb3BN(ideaTokenAmount, 18).gt(ideaTokenBalanceBN)) {
          isValid = false
        }
      }
    }

    onValuesChanged(
      floatToWeb3BN(ideaTokenAmount, 18),
      selectedToken?.address,
      tokenAmountBN,
      slippage,
      isLockChecked,
      isValid
    )
  }, [ideaTokenAmount, selectedToken, tokenAmountBN, isLockChecked, slippage])

  const selectTokensFormat = (entry) => (
    <div className="flex flex-row">
      <div className="flex items-center">
        <img className="w-7.5" src={'' + entry.token.logoURL} />
      </div>
      <div className="ml-2.5">
        <div>{entry.token.symbol}</div>
        <div className="text-xs text-brand-new-dark font-semibold">
          {entry.token.name}
        </div>
      </div>
    </div>
  )

  async function maxButtonClicked() {
    if (tradeType === 'sell') {
      const balanceBN = new BigNumber(ideaTokenBalanceBN.toString())
      setIdeaTokenAmount(
        formatBigNumber(
          balanceBN.div(new BigNumber('10').pow(new BigNumber('18'))),
          18,
          BigNumber.ROUND_DOWN
        )
      )
    } else {
      let balanceAsDai
      if (selectedToken.symbol === 'Dai') {
        balanceAsDai = tokenBalanceBN
      } else {
        balanceAsDai = await getUniswapDaiOutputSwap(
          selectedToken.address,
          tokenBalanceBN
        )
      }
      const buyableBN = calculateMaxIdeaTokensBuyable(
        balanceAsDai,
        ideaToken?.rawSupply || new BN('0'),
        market
      )
      setIdeaTokenAmount(
        formatBigNumber(
          buyableBN.div(new BigNumber('10').pow(new BigNumber('18'))),
          18,
          BigNumber.ROUND_DOWN
        )
      )
    }
  }

  async function onTradeClicked() {
    const name = tradeType === 'buy' ? 'Buy' : 'Sell'
    const func = tradeType === 'buy' ? buyToken : sellToken
    const args =
      tradeType === 'buy'
        ? [
            ideaToken.address,
            selectedToken.address,
            floatToWeb3BN(ideaTokenAmount, 18),
            tokenAmountBN,
            slippage,
            isLockChecked ? 31556952 : 0,
          ]
        : [
            ideaToken.address,
            selectedToken.address,
            floatToWeb3BN(ideaTokenAmount, 18),
            tokenAmountBN,
            slippage,
          ]

    try {
      await txManager.executeTx(name, func, ...args)
    } catch (ex) {
      console.log(ex)
      return
    }

    setApproveButtonKey(approveButtonKey + 1)
    onTradeSuccessful()
  }

  return (
    <>
      {showTypeSelection && (
        <nav className="flex">
          <a
            onClick={() => {
              if (!txManager.isPending) setTradeType('buy')
            }}
            className={classNames(
              'text-base cursor-pointer pb-4 px-3 m-1 font-semibold',
              tradeType === 'buy'
                ? 'text-brand-new-dark border-brand-new-dark border-b-2'
                : 'text-brand-new-dark font-semibold border-transparent'
            )}
          >
            Buy
          </a>
          <a
            onClick={() => {
              if (!txManager.isPending) setTradeType('sell')
            }}
            className={classNames(
              'text-base cursor-pointer pb-4 px-3 m-1 font-semibold',
              tradeType === 'sell'
                ? 'text-brand-new-dark border-brand-new-dark border-b-2'
                : 'text-brand-new-dark font-semibold border-transparent'
            )}
          >
            Sell
          </a>
        </nav>
      )}
      <div className="mx-auto" style={{ maxWidth: 550 }}>
        <div style={bgcolor ? { backgroundColor: bgcolor } : {}}>
          <p className="mx-5 mt-5 mb-2 text-sm text-brand-new-dark font-semibold">
            {tradeType === 'buy' ? 'Pay with' : 'Receive'}
          </p>
          <div className="mx-5">
            <Select
              isClearable={false}
              isSearchable={false}
              isDisabled={txManager.isPending || disabled}
              onChange={(value) => {
                setSelectedToken(value.token)
              }}
              options={selectTokensValues}
              formatOptionLabel={selectTokensFormat}
              defaultValue={selectTokensValues[0]}
              theme={(theme) => ({
                ...theme,
                borderRadius: 2,
                colors: {
                  ...theme.colors,
                  primary25: '#708090', // brand-gray
                  primary: '#0857e0', // brand-blue
                },
              })}
              styles={{
                valueContainer: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
            />
          </div>
          <div className="flex flex-row justify-between mx-5 mt-5">
            <p className="text-sm text-brand-new-dark font-semibold mb-2">
              {tradeType === 'buy'
                ? 'Amount of tokens to buy'
                : 'Amount of tokens to sell'}
            </p>
            <p
              className={classNames(
                'text-sm  mb-2',
                exceedsBalance
                  ? 'text-brand-red font-bold'
                  : 'text-brand-new-dark font-semibold'
              )}
            >
              {tradeType === 'buy'
                ? ''
                : 'Available: ' +
                  (isIdeaTokenBalanceLoading ? '...' : ideaTokenBalance)}
            </p>
          </div>
          <div className="flex items-center mx-5">
            <input
              className="flex-grow w-full px-4 py-2 border-2 border-gray-200 text-brand-gray-2 rounded-md focus:outline-none focus:bg-white focus:border-brand-blue"
              type="number"
              min="0"
              value={ideaTokenAmount}
              onChange={(event) => {
                setIdeaTokenAmount(event.target.value)
              }}
              disabled={txManager.isPending || disabled}
            />
            <button
              className={classNames(
                'w-20 py-1 ml-2 text-sm font-medium bg-white border-2 rounded-lg tracking-tightest-2',
                txManager.isPending || disabled
                  ? 'border-brand-gray-2 text-brand-new-dark font-semibold cursor-default'
                  : 'border-brand-blue text-brand-blue hover:text-white hover:bg-brand-blue'
              )}
              disabled={txManager.isPending || disabled}
              onClick={maxButtonClicked}
            >
              Max
            </button>
          </div>

          <div className="flex flex-row justify-between mx-5 mt-5">
            <p className="text-sm text-brand-new-dark font-semibold mb-2">
              {tradeType === 'buy' ? 'You will pay' : 'You will receive'}
            </p>
            <p
              className={classNames(
                'text-sm mb-2',
                exceedsBalance
                  ? 'text-brand-red font-bold'
                  : 'text-brand-new-dark font-semibold'
              )}
            >
              {tradeType === 'buy'
                ? 'Available: ' + (isTokenBalanceLoading ? '...' : tokenBalance)
                : ''}
            </p>
          </div>

          <div className="mx-5">
            <input
              className="w-full px-4 py-2 border-2 border-gray-200 rounded text-brand-gray-2 focus:outline-none focus:bg-white focus:border-brand-blue"
              type="text"
              disabled={true}
              value={isTokenAmountLoading ? '...' : tokenAmount}
            />
          </div>

          <div className="grid grid-cols-2 mx-5 mt-5 text-sm text-brand-gray-2 font-semibold">
            <div className="flex items-center">
              Trading fee:{' '}
              {market && market.platformFeeRate && market.tradingFeeRate
                ? (
                    parseFloat(market.platformFeeRate) +
                    parseFloat(market.tradingFeeRate)
                  ).toFixed(2)
                : '-'}
              %
            </div>
            <div className="text-base text-brand-gray-2">
              <Select
                isClearable={false}
                isSearchable={false}
                isDisabled={txManager.isPending || disabled}
                onChange={(option: SlippageValue) => {
                  slippage = option.value
                }}
                options={slippageValues}
                defaultValue={slippageValues[0]}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 2,
                  colors: {
                    ...theme.colors,
                    primary25: '#708090', // brand-gray
                    primary: '#0857e0', // brand-blue
                  },
                })}
              />
            </div>
          </div>
        </div>
        <div
          className={classNames(
            'flex items-center mt-5 text-sm mx-5',
            tradeType === 'sell' && 'invisible'
          )}
        >
          <input
            type="checkbox"
            id="lockCheckbox"
            disabled={txManager.isPending || disabled}
            checked={isLockChecked}
            onChange={(e) => {
              setIsLockChecked(e.target.checked)
            }}
          />
          <label
            htmlFor="lockCheckbox"
            className={classNames(
              'ml-2',
              isLockChecked
                ? 'text-brand-blue font-medium'
                : 'text-brand-new-dark font-semibold'
            )}
          >
            Lock purchased tokens for 1YR
          </label>
          <Tooltip className="ml-2">
            <div className="w-32 md:w-64">
              Lock tokens to show your long-term confidence in a listing. You
              will be unable to sell or withdraw locked tokens for the time
              period specified.
              <br />
              <br />
              For more information, see{' '}
              <a
                href="https://docs.ideamarket.io/user-guide/hiw-buy-and-sell#locking-tokens"
                target="_blank"
                className="underline"
              >
                locking tokens
              </a>
              .
            </div>
          </Tooltip>
        </div>
        <AdvancedOptions
          disabled={txManager.isPending || disabled}
          isUnlockOnceChecked={isUnlockOnceChecked}
          setIsUnlockOnceChecked={setIsUnlockOnceChecked}
          isUnlockPermanentChecked={isUnlockPermanentChecked}
          setIsUnlockPermanentChecked={setIsUnlockPermanentChecked}
        />
        {showTradeButton && (
          <>
            <div
              className={classNames(
                'flex items-center justify-center mt-5 text-xs'
              )}
            >
              {!exceedsBalance && (
                <ApproveButton
                  tokenAddress={spendToken}
                  spenderAddress={spender}
                  requiredAllowance={requiredAllowance}
                  unlockPermanent={isUnlockPermanentChecked}
                  txManager={txManager}
                  setIsMissingAllowance={setIsMissingAllowance}
                  isBuy={tradeType === 'buy'}
                  key={approveButtonKey}
                />
              )}
              {(!isMissingAllowance || exceedsBalance) && (
                <button
                  className={classNames(
                    'w-40 h-12 text-base font-medium bg-white border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium',
                    txManager.isPending ||
                      exceedsBalance ||
                      !parseFloat(ideaTokenAmount) ||
                      parseFloat(ideaTokenAmount) <= 0.0
                      ? 'border-brand-gray-2 text-brand-new-dark font-semibold cursor-default'
                      : tradeType === 'buy'
                      ? 'border-brand-green text-brand-green hover:bg-brand-green hover:text-white'
                      : 'border-brand-red text-brand-red hover:bg-brand-red hover:text-white'
                  )}
                  disabled={
                    txManager.isPending ||
                    exceedsBalance ||
                    !parseFloat(ideaTokenAmount) ||
                    parseFloat(ideaTokenAmount) <= 0.0
                  }
                  onClick={onTradeClicked}
                >
                  {tradeType === 'buy' ? 'Buy' : 'Sell'}
                </button>
              )}
            </div>

            <div
              className={classNames(
                'grid grid-cols-3 my-5 text-sm text-brand-new-dark font-semibold',
                txManager.isPending ? '' : 'invisible'
              )}
            >
              <div className="font-bold justify-self-center">
                {txManager.name}
              </div>
              <div className="justify-self-center">
                <a
                  className={classNames(
                    'underline',
                    txManager.hash === '' ? 'hidden' : ''
                  )}
                  href={`https://${
                    NETWORK === 'rinkeby' || NETWORK === 'test'
                      ? 'rinkeby.'
                      : ''
                  }etherscan.io/tx/${txManager.hash}`}
                  target="_blank"
                >
                  {txManager.hash.slice(0, 8)}...{txManager.hash.slice(-6)}
                </a>
              </div>
              <div className="justify-self-center">
                <CircleSpinner color="#0857e0" bgcolor={bgcolor} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
