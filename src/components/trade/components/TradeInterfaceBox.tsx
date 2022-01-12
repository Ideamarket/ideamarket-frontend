import { TransactionManager } from 'utils'
import { TokenListEntry } from '../../../store/tokenListStore'
import { useEffect, useState } from 'react'
import TokenSelect from './TokenSelect'
import Image from 'next/image'
import { ExclamationCircleIcon } from '@heroicons/react/solid'

type TradeInterfaceBoxProps = {
  label: string
  setIdeaTokenAmount: (value: string) => void
  setSelectedTokenAmount: (value: string) => void
  inputTokenAmount: string | number | any // Amount of token being typed in (idea token or selected token)
  selectTokensValues: any
  selectedToken: any
  setSelectedToken: (value: any) => void
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
  inputTokenAmount = '', // This is the amount of tokens for box being typed in (selected token OR idea token)
  selectTokensValues,
  selectedToken,
  setSelectedToken,
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
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (inputValue !== inputTokenAmount) {
      if (isNaN(inputTokenAmount) || parseFloat(inputTokenAmount) <= 0) {
        setInputValue('') // If one input is 0, make other one 0 too
      } else {
        // Determines how many decimals to show
        const output8Decimals = parseFloat(
          parseFloat(inputTokenAmount).toFixed(8)
        )
        const output4Decimals = parseFloat(
          parseFloat(inputTokenAmount).toFixed(4)
        )
        setInputValue(
          output8Decimals >= 1
            ? output4Decimals.toString()
            : output8Decimals.toString()
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputTokenAmount])

  function onInputChanged(event) {
    const oldValue = inputValue
    const newValue = event.target.value

    if (newValue === oldValue) return

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
    <div className="relative px-5 py-4 mb-1 border border-gray-100 rounded-xl bg-gray-50 dark:bg-gray-600 text-brand-new-dark">
      <div className="flex justify-between items-center">
        {selectedIdeaToken ? (
          <div className="flex flex-row items-center justify-start w-full text-xs font-medium border-gray-200 rounded-md text-brand-gray-4 dark:text-gray-300 trade-select">
            <div className="flex items-center px-2 py-1 bg-white shadow-md dark:bg-gray-700 rounded-2xl">
              <div className="flex items-center">
                {selectedIdeaToken?.logoURL ? (
                  <div className="relative w-7 h-7">
                    <Image
                      src={selectedIdeaToken?.logoURL || '/gray.svg'}
                      alt="token"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-7.5 h-7.5 rounded-full bg-gray-400 animate animate-pulse" />
                )}
              </div>
              {selectedIdeaToken?.symbol && (
                <div className="ml-2.5">
                  <div>{selectedIdeaToken?.symbol.replace(/_/g, ' ')}</div>
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
        <div className="flex flex-col text-right">
          <input
            className="w-full max-w-sm text-3xl text-right placeholder-gray-500 placeholder-opacity-50 border-none outline-none dark:placeholder-gray-300 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600"
            min="0"
            placeholder="0.0"
            id="input-search" // This prevents 1Password and other password manager icons from appearing in input. Issue explained here: https://1password.community/discussion/117501/as-a-web-developer-how-can-i-disable-1password-filling-for-a-specific-field
            disabled={txManager.isPending}
            value={inputValue}
            onChange={onInputChanged}
          />
          <span className="text-sm">
            ~${tokenValue}
            <span className="text-gray-300">{slippageLabel}</span>
          </span>
        </div>
      </div>

      {(exceedsBalance || isInputAmountGTSupply) && label === 'Spend' && (
        <div className="text-red-700 flex items-center">
          <ExclamationCircleIcon className="w-5 h-5 mr-1" />
          <span>Insufficient balance</span>
        </div>
      )}
    </div>
  )
}

export default TradeInterfaceBox
