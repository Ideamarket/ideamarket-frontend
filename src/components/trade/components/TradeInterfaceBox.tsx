import { TransactionManager } from 'utils'
import { TokenListEntry } from '../../../store/tokenListStore'
import { useEffect, useState } from 'react'
import TokenSelect from './TokenSelect'
import Image from 'next/image'

type TradeInterfaceBoxProps = {
  label: string
  setIdeaTokenAmount: (value: string) => void
  setSelectedTokenAmount: (value: string) => void
  ideaTokenAmount: string | number | any
  isTokenBalanceLoading: boolean
  tokenBalance: string
  maxButtonClicked: () => void
  selectTokensValues: any
  showBuySellSwitch?: boolean
  selectedToken: any
  setSelectedToken: (value: any) => void
  setTradeType: (value: string) => void
  disabled: boolean
  tradeType: string
  selectedIdeaToken: TokenListEntry | null
  txManager: TransactionManager
  isIdeaToken: boolean
  tokenValue: string
  slippage: number
  exceedsBalance: any
  isInputAmountGTSupply: boolean
}

const TradeInterfaceBox: React.FC<TradeInterfaceBoxProps> = ({
  label,
  setIdeaTokenAmount,
  setSelectedTokenAmount,
  ideaTokenAmount = '',
  isTokenBalanceLoading,
  tokenBalance,
  maxButtonClicked,
  selectTokensValues,
  showBuySellSwitch,
  selectedToken,
  setSelectedToken,
  setTradeType,
  disabled,
  tradeType,
  selectedIdeaToken,
  txManager,
  isIdeaToken,
  tokenValue,
  slippage,
  exceedsBalance,
  isInputAmountGTSupply,
}) => {
  const handleBuySellClick = () => {
    if (!txManager.isPending && tradeType === 'sell') setTradeType('buy')
    if (!txManager.isPending && tradeType === 'buy') setTradeType('sell')
    if (!txManager.isPending) setIdeaTokenAmount('0')
  }

  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (inputValue !== ideaTokenAmount) {
      if (isNaN(ideaTokenAmount) || parseFloat(ideaTokenAmount) <= 0) {
        setInputValue('') // If one input is 0, make other one 0 too
      } else {
        // Determines how many decimals to show
        const output8Decimals = parseFloat(
          parseFloat(ideaTokenAmount).toFixed(8)
        )
        const output4Decimals = parseFloat(
          parseFloat(ideaTokenAmount).toFixed(4)
        )
        setInputValue(
          output8Decimals >= 1
            ? output4Decimals.toString()
            : output8Decimals.toString()
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaTokenAmount])

  function onInputChanged(event) {
    const oldValue = inputValue
    const newValue = event.target.value
    const setValue = /^\d*\.?\d*$/.test(newValue) ? newValue : oldValue

    setInputValue(setValue)

    if (isIdeaToken) {
      setSelectedTokenAmount('0')
      setIdeaTokenAmount(setValue)
    } else {
      setIdeaTokenAmount('0')
      setSelectedTokenAmount(setValue)
    }
  }

  const slippageLabel =
    slippage &&
    ((tradeType === 'buy' && isIdeaToken) ||
      (tradeType === 'sell' && !isIdeaToken))
      ? ` (-${parseFloat(slippage.toFixed(3))}%)`
      : ''

  return (
    <div className="relative px-5 py-4 mb-1 border border-gray-100 rounded-md bg-gray-50 dark:bg-gray-600 text-brand-new-dark">
      <div
        style={{
          top: '-16px',
          left: '50%',
          transform: 'translate(-50%, 0)',
        }}
        className="absolute flex px-4 py-1 text-xs font-bold bg-white rounded-md shadow-md item-center"
      >
        {label}
      </div>

      {showBuySellSwitch && (
        <div
          style={{
            top: '-16px',
            left: 'calc(50% + 70px)',
            transform: 'translate(-50%, 0)',
          }}
          className="absolute flex px-4 py-1 text-xs font-bold bg-white rounded-md shadow-md cursor-pointer item-center"
          onClick={handleBuySellClick}
        >
          ⮃
        </div>
      )}
      <div className="flex justify-between mb-2">
        <input
          className="w-full max-w-sm text-3xl text-left placeholder-gray-500 placeholder-opacity-50 border-none outline-none dark:placeholder-gray-300 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600"
          min="0"
          placeholder="0.0"
          disabled={txManager.isPending}
          value={inputValue}
          onChange={onInputChanged}
        />
        {selectedIdeaToken ? (
          <div className="flex flex-row items-center justify-end w-full text-xs font-medium border-gray-200 rounded-md text-brand-gray-4 dark:text-gray-300 trade-select">
            <div className="flex items-center px-2 py-1 bg-white shadow-md dark:bg-gray-700 rounded-2xl">
              <div className="flex items-center">
                {selectedIdeaToken?.logoURL ? (
                  <div className="relative w-7 h-7">
                    <Image
                      src={selectedIdeaToken?.logoURL || '/gray.svg'}
                      alt="token"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-7.5 h-7.5 rounded-full bg-gray-400 animate animate-pulse" />
                )}
              </div>
              {selectedIdeaToken?.symbol && (
                <div className="ml-2.5">
                  <div>{selectedIdeaToken?.symbol}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <TokenSelect
            disabled={txManager.isPending || disabled}
            setSelectedToken={setSelectedToken}
            selectTokensValues={selectTokensValues}
            selectedIdeaToken={selectedIdeaToken}
            selectedToken={selectedToken}
          />
        )}
      </div>
      <div className="flex justify-between text-sm">
        <div className="text-gray-500 dark:text-white">
          You have: {isTokenBalanceLoading ? '...' : parseFloat(tokenBalance)}
          {!txManager.isPending && label === 'Spend' && (
            <span
              className="cursor-pointer text-brand-blue dark:text-blue-400"
              onClick={maxButtonClicked}
            >
              {' '}
              (Max)
            </span>
          )}
        </div>
        <span>
          ~${tokenValue}
          <span className="text-gray-300">{slippageLabel}</span>
        </span>
      </div>
      {(exceedsBalance || isInputAmountGTSupply) && label === 'Receive' && (
        <div className="text-brand-red">Insufficient balance</div>
      )}
    </div>
  )
}

export default TradeInterfaceBox
