import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { IdeaToken, IdeaMarket } from 'store/ideaMarketsStore'
import { useTokenListStore } from 'store/tokenListStore'
import {
  useBalance,
  useOutputAmount,
  getTokenAllowance,
  approveToken,
  buyToken,
  sellToken,
} from 'actions'
import {
  floatToWeb3BN,
  addresses,
  NETWORK,
  calculateMaxIdeaTokensBuyable,
  formatBigNumber,
  getUniswapDaiOutputSwap,
} from 'utils'
import { useContractStore } from 'store/contractStore'

import Select from 'react-select'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { Tooltip } from '..'

export default function TradeInterface({
  ideaToken,
  market,
  onTradeSuccessful,
  onValuesChanged,
  resetOn,
  showTypeSelection,
  showTradeButton,
  disabled,
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
}) {
  const [tradeType, setTradeType] = useState('buy')
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

  const [pendingTxName, setPendingTxName] = useState('')
  const [pendingTxHash, setPendingTxHash] = useState('')
  const [isTxPending, setIsTxPending] = useState(false)

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

  const [isLockChecked, setIsLockChecked] = useState(false)

  useEffect(() => {
    setSelectedToken(useTokenListStore.getState().tokens[0])
    setIdeaTokenAmount('')
    setTradeType('buy')
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
        <div className="text-xs text-brand-gray-2">{entry.token.name}</div>
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
          selectedToken.decimals,
          tokenBalanceBN
        )
      }
      const buyableBN = calculateMaxIdeaTokensBuyable(
        balanceAsDai,
        ideaToken.rawSupply,
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

  async function onBuyClicked() {
    let spender
    if (selectedToken.address === addresses.dai && isLockChecked === false) {
      spender = useContractStore.getState().exchangeContract.options.address
    } else {
      spender = useContractStore.getState().multiActionContract.options.address
    }

    const allowance = await getTokenAllowance(selectedToken.address, spender)
    const buyAmount = floatToWeb3BN(ideaTokenAmount, 18)
    const payAmount = tokenAmountBN

    if (allowance.lt(payAmount)) {
      setPendingTxName('Approve')
      setIsTxPending(true)
      try {
        await approveToken(selectedToken.address, spender, payAmount).on(
          'transactionHash',
          (hash) => {
            setPendingTxHash(hash)
          }
        )
      } catch (ex) {
        console.log(ex)
        return
      } finally {
        setPendingTxName('')
        setPendingTxHash('')
        setIsTxPending(false)
      }
    }

    setPendingTxName('Buy')
    setIsTxPending(true)
    try {
      await buyToken(
        ideaToken.address,
        selectedToken.address,
        buyAmount,
        payAmount,
        slippage,
        isLockChecked ? 31556952 : 0
      ).on('transactionHash', (hash) => {
        setPendingTxHash(hash)
      })
    } catch (ex) {
      console.log(ex)
      return
    } finally {
      setPendingTxName('')
      setPendingTxHash('')
      setIsTxPending(false)
    }

    onTradeSuccessful()
  }

  async function onSellClicked() {
    const sellAmount = floatToWeb3BN(ideaTokenAmount, 18)
    const receiveAmount = tokenAmountBN

    if (selectedToken.address !== addresses.dai) {
      const multiActionContractAddress = useContractStore.getState()
        .multiActionContract.options.address

      const allowance = await getTokenAllowance(
        ideaToken.address,
        multiActionContractAddress
      )
      if (allowance.lt(sellAmount)) {
        setPendingTxName('Approve')
        setIsTxPending(true)
        try {
          await approveToken(
            ideaToken.address,
            multiActionContractAddress,
            sellAmount
          ).on('transactionHash', (hash) => {
            setPendingTxHash(hash)
          })
        } catch (ex) {
          console.log(ex)
          return
        } finally {
          setPendingTxName('')
          setPendingTxHash('')
          setIsTxPending(false)
        }
      }
    }

    setPendingTxName('Sell')
    setIsTxPending(true)
    try {
      await sellToken(
        ideaToken.address,
        selectedToken.address,
        sellAmount,
        receiveAmount,
        slippage
      ).on('transactionHash', (hash) => {
        setPendingTxHash(hash)
      })
    } catch (ex) {
      console.log(ex)
      return
    } finally {
      setPendingTxName('')
      setPendingTxHash('')
      setIsTxPending(false)
    }

    onTradeSuccessful()
  }

  return (
    <>
      <div className="lg:min-w-100">
        {showTypeSelection && (
          <>
            <nav className="flex">
              <a
                onClick={() => {
                  if (!isTxPending) setTradeType('buy')
                }}
                className={classNames(
                  'ml-5 mr-2.5 text-center flex-grow px-1 py-4 text-base leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                  tradeType === 'buy'
                    ? 'font-semibold text-brand-green border-brand-green focus:text-brand-green focus:border-very-dark-blue-2'
                    : 'font-medium text-brand-gray-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                )}
              >
                Buy
              </a>
              <a
                onClick={() => {
                  if (!isTxPending) setTradeType('sell')
                }}
                className={classNames(
                  'ml-2.5 mr-5 text-center flex-grow px-1 py-4 text-base leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                  tradeType === 'sell'
                    ? 'font-semibold text-brand-red border-brand-red focus:text-brand-red focus:border-brand-red'
                    : 'font-medium text-brand-gray-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                )}
              >
                Sell
              </a>
            </nav>
            <hr className="my-2.5" />
          </>
        )}
        <p className="mx-5 mt-5 text-sm text-brand-gray-2">
          {tradeType === 'buy' ? 'Pay with' : 'Receive'}
        </p>
        <div className="mx-5">
          <Select
            isClearable={false}
            isSearchable={false}
            isDisabled={isTxPending || disabled}
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
                primary25: '#f6f6f6', // brand-gray
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
          <p className="text-sm text-brand-gray-2">
            {tradeType === 'buy'
              ? 'Amount of tokens to buy'
              : 'Amount of tokens to sell'}
          </p>
          <p
            className={classNames(
              'text-sm',
              !isIdeaTokenBalanceLoading &&
                ideaTokenBalanceBN &&
                ideaTokenBalanceBN.lt(floatToWeb3BN(ideaTokenAmount, 18))
                ? 'text-brand-red font-bold'
                : 'text-brand-gray-2'
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
            className="flex-grow w-full px-4 py-2 leading-tight bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-brand-blue"
            type="number"
            min="0"
            value={ideaTokenAmount}
            onChange={(event) => {
              setIdeaTokenAmount(event.target.value)
            }}
            disabled={isTxPending || disabled}
          />
          <button
            className="w-20 py-1 ml-2 text-sm font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
            disabled={isTxPending || disabled}
            onClick={maxButtonClicked}
          >
            Max
          </button>
        </div>

        <div className="flex flex-row justify-between mx-5 mt-5">
          <p className="text-sm text-brand-gray-2">
            {tradeType === 'buy' ? 'You will pay' : 'You will receive'}
          </p>
          <p
            className={classNames(
              'text-sm',
              !isTokenBalanceLoading &&
                tokenBalanceBN &&
                tokenAmountBN &&
                tokenBalanceBN.lt(tokenAmountBN)
                ? 'text-brand-red font-bold'
                : 'text-brand-gray-2'
            )}
          >
            {tradeType === 'buy'
              ? 'Available: ' + (isTokenBalanceLoading ? '...' : tokenBalance)
              : ''}
          </p>
        </div>

        <div className="mx-5">
          <input
            className="w-full px-4 py-2 leading-tight bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-brand-blue"
            type="text"
            disabled={true}
            value={isTokenAmountLoading ? '...' : tokenAmount}
          />
        </div>

        <div className="grid grid-cols-2 mx-5 mt-5 text-xs text-brand-gray-2">
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
          <div>
            <Select
              isClearable={false}
              isSearchable={false}
              isDisabled={isTxPending || disabled}
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
                  primary25: '#f6f6f6', // brand-gray
                  primary: '#0857e0', // brand-blue
                },
              })}
            />
          </div>
        </div>
      </div>
      <hr className="mt-5" />

      <div
        className={classNames(
          'flex items-center justify-center mt-5 text-sm',
          tradeType === 'sell' && 'invisible'
        )}
      >
        <input
          type="checkbox"
          id="lockCheckbox"
          disabled={isTxPending || disabled}
          checked={isLockChecked}
          onChange={(e) => {
            setIsLockChecked(e.target.checked)
          }}
        />
        <label
          htmlFor="lockCheckbox"
          className={classNames(
            'ml-2',
            isLockChecked ? 'text-brand-blue font-medium' : 'text-brand-gray-2'
          )}
        >
          Lock purchased tokens for 1YR
        </label>
        <Tooltip className="ml-2">
          <div className="w-32 md:w-64">
            Lock tokens to show your long-term confidence in a listing. You will
            be unable to sell or withdraw locked tokens for the time period
            specified.
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
      {showTradeButton && (
        <>
          <div className="flex flex-row justify-center mt-5">
            <button
              className={classNames(
                'w-40 h-12 text-base font-medium bg-white border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium',
                isTxPending
                  ? 'border-brand-gray-2 text-brand-gray-2 cursor-default'
                  : tradeType === 'buy'
                  ? 'border-brand-green text-brand-green hover:bg-brand-green hover:text-white'
                  : 'border-brand-red text-brand-red hover:bg-brand-red hover:text-white'
              )}
              disabled={isTxPending}
              onClick={async () => {
                tradeType === 'buy' ? onBuyClicked() : onSellClicked()
              }}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'}
            </button>
          </div>

          <div
            className={classNames(
              'grid grid-cols-3 my-5 text-sm text-brand-gray-2',
              isTxPending ? '' : 'invisible'
            )}
          >
            <div className="font-bold justify-self-center">{pendingTxName}</div>
            <div className="justify-self-center">
              <a
                className={classNames(
                  'underline',
                  pendingTxHash === '' ? 'hidden' : ''
                )}
                href={`https://${
                  NETWORK === 'rinkeby' || NETWORK === 'test' ? 'rinkeby.' : ''
                }etherscan.io/tx/${pendingTxHash}`}
                target="_blank"
              >
                {pendingTxHash.slice(0, 8)}...{pendingTxHash.slice(-6)}
              </a>
            </div>
            <div className="justify-self-center">
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 animate-spin"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    fill: 'transparent',
                    stroke: '#0857e0', // brand-blue
                    strokeWidth: '10',
                  }}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    fill: 'transparent',
                    stroke: 'white',
                    strokeWidth: '10',
                    strokeDasharray: '283',
                    strokeDashoffset: '75',
                  }}
                />
              </svg>
            </div>
          </div>
        </>
      )}
    </>
  )
}
