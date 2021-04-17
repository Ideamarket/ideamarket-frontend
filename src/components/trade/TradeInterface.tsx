import _ from 'lodash'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { IdeaToken, IdeaMarket } from 'store/ideaMarketsStore'
import { useTokenListStore } from 'store/tokenListStore'
import { useBalance, useOutputAmount, buyToken, sellToken } from 'actions'
import {
  floatToWeb3BN,
  calculateMaxIdeaTokensBuyable,
  formatBigNumber,
  getUniswapDaiOutputSwap,
  useTransactionManager,
} from 'utils'
import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'
import Select from 'react-select'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import ApproveButton from './ApproveButton'
import AdvancedOptions from './AdvancedOptions'
import Tooltip from '../tooltip/Tooltip'
import CircleSpinner from '../animations/CircleSpinner'
import A from 'components/A'

export default function TradeInterface({
  ideaToken,
  market,
  onTradeSuccessful,
  onValuesChanged,
  resetOn,
  centerTypeSelection,
  showTypeSelection,
  showTradeButton,
  disabled,
  bgcolor,
  unlockText,
}: {
  ideaToken: IdeaToken
  market: IdeaMarket
  onTradeSuccessful: () => void
  onValuesChanged: (
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenSymbol: string,
    tokenAmount: BN,
    slippage: number,
    lock: boolean,
    isUnlockOnceChecked: boolean,
    isUnlockPermanentChecked: boolean,
    isValid: boolean
  ) => void
  resetOn: boolean
  centerTypeSelection: boolean
  showTypeSelection: boolean
  showTradeButton: boolean
  disabled: boolean
  bgcolor?: string
  unlockText?: string
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
      ? selectedToken?.address === NETWORK.getExternalAddresses().dai &&
        !isLockChecked
        ? exchangeContractAddress
        : multiActionContractAddress
      : selectedToken.address !== NETWORK.getExternalAddresses().dai
      ? multiActionContractAddress
      : undefined

  const spendTokenAddress =
    tradeType === 'buy' ? selectedToken?.address : ideaToken.address

  const spendTokenSymbol = tradeType === 'buy' ? selectedToken?.symbol : 'IDT'

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
  const [isValid, setIsValid] = useState(false)
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

    setIsValid(isValid)

    onValuesChanged(
      floatToWeb3BN(ideaTokenAmount, 18),
      selectedToken?.address,
      selectedToken?.symbol,
      tokenAmountBN,
      slippage,
      isLockChecked,
      isUnlockOnceChecked,
      isUnlockPermanentChecked,
      isValid
    )
  }, [
    ideaTokenAmount,
    selectedToken,
    tokenAmountBN,
    isLockChecked,
    slippage,
    isUnlockOnceChecked,
    isUnlockPermanentChecked,
  ])

  const selectTokensFormat = (entry) => (
    <div className="flex flex-row">
      <div className="flex items-center">
        <img className="w-7.5" src={'' + entry.token.logoURL} />
      </div>
      <div className="ml-2.5">
        <div>{entry.token.symbol}</div>
        <div className="text-xs font-semibold text-brand-new-dark">
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
          <A
            onClick={() => {
              if (!txManager.isPending) setTradeType('buy')
            }}
            className={classNames(
              'text-base cursor-pointer pb-2 m-1 font-semibold',
              centerTypeSelection ? 'flex-grow text-center' : 'px-3',
              tradeType === 'buy'
                ? 'text-brand-new-dark border-brand-new-dark border-b-2'
                : 'text-brand-new-dark font-semibold border-transparent'
            )}
          >
            Buy
          </A>
          <A
            onClick={() => {
              if (!txManager.isPending) setTradeType('sell')
            }}
            className={classNames(
              'text-base cursor-pointer pb-2 m-1 font-semibold',
              centerTypeSelection ? 'flex-grow text-center' : 'px-3',
              tradeType === 'sell'
                ? 'text-brand-new-dark border-brand-new-dark border-b-2'
                : 'text-brand-new-dark font-semibold border-transparent'
            )}
          >
            Sell
          </A>
        </nav>
      )}
      <div className="mx-auto" style={{ maxWidth: 550 }}>
        <div style={bgcolor ? { backgroundColor: bgcolor } : {}}>
          <p className="mx-5 mt-5 mb-2 text-sm font-semibold text-brand-new-dark">
            {tradeType === 'buy' ? 'Pay with' : 'Receive'}
          </p>
          <div className="mx-5">
            <Select
              className="border-2 border-gray-200 rounded-md text-brand-gray-4 trade-select"
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
                  primary25: '#d8d8d8', // brand-gray
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
            <p className="mb-2 text-sm font-semibold text-brand-new-dark">
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
              className="flex-grow w-full px-4 py-2 border-2 border-gray-200 rounded-md text-brand-gray-2 focus:outline-none focus:bg-white focus:border-brand-blue"
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
            <p className="mb-2 text-sm font-semibold text-brand-new-dark">
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

          <div className="flex flex-col justify-between mx-5 mt-5 text-sm font-semibold md:flex-row text-brand-gray-2">
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
            <div className="flex-1 mb-3 text-base md:ml-8 md:mb-0 text-brand-gray-2">
              <Select
                className="border-2 border-gray-200 rounded-md text-brand-gray-2 trade-select"
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
                    primary25: '#d8d8d8', // brand-gray
                    primary: '#0857e0', // brand-blue
                  },
                })}
              />
            </div>
          </div>
        </div>
        <div
          className={classNames(
            'cursor-pointer flex items-center mt-5 text-sm mx-5',
            tradeType === 'sell' && 'invisible'
          )}
        >
          <input
            type="checkbox"
            className="border-2 border-gray-200 rounded-sm cursor-pointer"
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
              'ml-2 cursor-pointer',
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
              <A
                href="https://docs.ideamarket.io/user-guide/hiw-buy-and-sell#locking-tokens"
                target="_blank"
                className="underline"
              >
                locking tokens
              </A>
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
          unlockText={unlockText || 'for trading'}
        />
        {showTradeButton && (
          <div className="max-w-sm mx-auto">
            <div className={classNames('flex mt-8 mx-5 text-xs')}>
              <div className="flex justify-center flex-grow">
                <ApproveButton
                  tokenAddress={spendTokenAddress}
                  tokenSymbol={spendTokenSymbol}
                  spenderAddress={spender}
                  requiredAllowance={requiredAllowance}
                  unlockPermanent={isUnlockPermanentChecked}
                  txManager={txManager}
                  setIsMissingAllowance={setIsMissingAllowance}
                  disable={
                    !isValid ||
                    exceedsBalance ||
                    !isMissingAllowance ||
                    txManager.isPending
                  }
                  key={approveButtonKey}
                />
              </div>
              <div className="flex justify-center flex-grow">
                <button
                  className={classNames(
                    'ml-6 w-28 md:w-40 h-12 text-base border-2 rounded-lg tracking-tightest-2 ',
                    txManager.isPending ||
                      !isValid ||
                      exceedsBalance ||
                      isMissingAllowance ||
                      !parseFloat(ideaTokenAmount) ||
                      parseFloat(ideaTokenAmount) <= 0.0
                      ? 'text-brand-gray-2 bg-brand-gray cursor-default border-brand-gray'
                      : 'border-brand-blue text-white bg-brand-blue font-medium'
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
              </div>
            </div>

            <div
              className={classNames(
                'flex w-1/2 mt-2.5 mx-auto justify-center items-center text-xs'
              )}
            >
              <div
                className={classNames(
                  'flex-grow-0 flex items-center justify-center w-5 h-5 rounded-full',
                  !isValid || exceedsBalance
                    ? 'bg-brand-gray text-brand-gray-2'
                    : 'bg-brand-blue text-white'
                )}
              >
                1
              </div>
              <div
                className={classNames(
                  'flex-grow h-0.5',
                  !isValid || isMissingAllowance || exceedsBalance
                    ? 'bg-brand-gray'
                    : 'bg-brand-blue'
                )}
              ></div>
              <div
                className={classNames(
                  'flex-grow-0 flex items-center justify-center w-5 h-5 rounded-full',
                  !isValid || isMissingAllowance || exceedsBalance
                    ? 'bg-brand-gray text-brand-gray-2'
                    : 'bg-brand-blue text-white'
                )}
              >
                2
              </div>
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
                <CircleSpinner color="#0857e0" bgcolor={bgcolor} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
