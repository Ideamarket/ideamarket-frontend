import { useEffect, useState } from 'react'

const TradeUIBoxLock = ({
  txManager,
  isTokenBalanceLoading,
  ideaTokenBalance,
  maxButtonClicked,
  tokenValue,
  inputTokenAmount = '',
  setIdeaTokenAmount,
  exceedsBalance,
  isInputAmountGTSupply,
}) => {
  const [inputValue, setInputValue] = useState('')

  const onInputChanged = (event) => {
    const oldValue = inputValue
    const newValue = event.target.value

    if (newValue === oldValue) return

    const setValue = /^\d*\.?\d*$/.test(newValue) ? newValue : oldValue

    setInputValue(setValue)
    setIdeaTokenAmount(setValue)
  }

  useEffect(() => {
    if (inputValue !== inputTokenAmount) {
      if (
        isNaN(parseFloat(inputTokenAmount)) ||
        parseFloat(inputTokenAmount) <= 0
      ) {
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

  return (
    <div className="relative px-5 py-4 mb-6 border border-gray-100 rounded-md bg-gray-50 dark:bg-gray-600 text-brand-new-dark">
      <div className="flex justify-between mb-2">
        <input
          className="w-full max-w-sm text-3xl text-left placeholder-gray-500 placeholder-opacity-50 border-none outline-none dark:placeholder-gray-300 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600"
          min="0"
          placeholder="0.0"
          disabled={txManager.isPending}
          value={inputValue}
          onChange={onInputChanged}
        />
      </div>
      <div className="flex justify-between text-sm">
        <div className="text-gray-500 dark:text-white">
          You have:{' '}
          {isTokenBalanceLoading ? '...' : parseFloat(ideaTokenBalance)}
          {!txManager.isPending && (
            <span
              className="cursor-pointer text-brand-blue dark:text-blue-400"
              onClick={maxButtonClicked}
            >
              {' '}
              (Max)
            </span>
          )}
        </div>
        <span>~${tokenValue}</span>
      </div>
      {(exceedsBalance || isInputAmountGTSupply) && (
        <div className="text-brand-red">Insufficient balance</div>
      )}
    </div>
  )
}

export default TradeUIBoxLock
