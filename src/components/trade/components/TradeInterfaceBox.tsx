import Select from 'react-select'
import { TransactionManager } from 'utils'
import SelectTokensFormat from './SelectTokenFormat'
import { TokenListEntry } from '../../../store/tokenListStore'
import { useEffect, useState } from 'react'

const selectStyles = {
  container: (provided) => ({
    ...provided,
    minWidth: '140px',
    width: '140px',
    border: 'none',
  }),

  control: () => ({
    borderRadius: 100,
    display: 'flex',
  }),
  indicatorSeparator: () => ({}),
}

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 2,
  colors: {
    ...theme.colors,
    primary25: '#d8d8d8', // brand-gray
    primary: '#0857e0', // brand-blue
  },
})

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
}) => {
  const handleBuySellClick = () => {
    if (!txManager.isPending && tradeType === 'sell') setTradeType('buy')
    if (!txManager.isPending && tradeType === 'buy') setTradeType('sell')
    if (!txManager.isPending) setIdeaTokenAmount('0')
  }

  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (inputValue !== ideaTokenAmount) {
      if (parseFloat(ideaTokenAmount) <= 0) {
        setInputValue('') // If one input is 0, make other one 0 too
      } else {
        setInputValue(ideaTokenAmount.toString())
      }
    }
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

  return (
    <div className="relative px-5 py-4 mb-1 border border-gray-100 rounded-md bg-gray-50 text-brand-new-dark">
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
        {selectedIdeaToken ? (
          <div className="flex flex-row items-center w-full text-xs font-medium border-gray-200 rounded-md text-brand-gray-4 trade-select">
            <div className="flex items-center px-2 py-1 bg-white shadow-md rounded-2xl">
              <div className="flex items-center">
                {selectedIdeaToken?.logoURL ? (
                  <img
                    className="w-7.5 rounded-full"
                    style={{ minWidth: 24, minHeight: 24 }}
                    src={selectedIdeaToken?.logoURL}
                    alt="token"
                  />
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
          <Select
            className="w-32 text-xs font-medium bg-white border-2 border-gray-200 shadow-md cursor-pointer text-brand-gray-4 trade-select rounded-2xl"
            isClearable={false}
            isSearchable={false}
            isDisabled={txManager.isPending || disabled}
            onChange={(value) => {
              setSelectedToken(value.token)
            }}
            options={selectTokensValues}
            formatOptionLabel={SelectTokensFormat}
            defaultValue={
              selectedIdeaToken
                ? { token: selectedIdeaToken }
                : { token: selectedToken, value: selectedToken.address } ||
                  selectTokensValues[0]
            }
            theme={selectTheme}
            styles={selectStyles}
          />
        )}
        <input
          className="w-full max-w-sm text-3xl text-right placeholder-gray-500 placeholder-opacity-50 border-none outline-none text-brand-gray-2 bg-gray-50"
          min="0"
          placeholder="0.0"
          disabled={txManager.isPending}
          value={inputValue}
          onChange={onInputChanged}
        />
      </div>
      <div className="flex justify-between text-sm">
        <div className="text-gray-500">
          Balance: {isTokenBalanceLoading ? '...' : tokenBalance}
          {!txManager.isPending && label === 'Spend' && (
            <span
              className="cursor-pointer text-brand-blue"
              onClick={maxButtonClicked}
            >
              {' '}
              (Max)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TradeInterfaceBox
