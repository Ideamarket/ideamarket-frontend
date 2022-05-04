import { useEffect, useState } from 'react'
import classNames from 'classnames'
import Select from 'react-select'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { useTokenListStore } from 'store/tokenListStore'
import {
  useBalance,
  useOutputAmount,
  buyToken,
  sellToken,
  useTokenIconURL,
} from 'actions'
import {
  bigNumberTenPow18,
  calculateIdeaTokenDaiValue,
  floatToWeb3BN,
  formatBigNumber,
  useTransactionManager,
  web3BNToFloatString,
} from 'utils'
import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import Tooltip from 'components/tooltip/Tooltip'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { TradeInterfaceBox } from 'components/trade/components'
import {
  CogIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
} from '@heroicons/react/outline'
import useReversePrice from 'actions/useReversePrice'
import useTokenToDAI from 'actions/useTokenToDAI'
import { useWeb3React } from '@web3-react/core'
import { useENSAddress } from 'components/trade/hooks/useENSAddress'
import { TX_TYPES } from 'components/trade/TradeCompleteModal'
import mixpanel from 'mixpanel-browser'
import TxPending from 'components/trade/TxPending'
import { isETHAddress } from 'utils/addresses'
import AdvancedOptions from 'components/trade/AdvancedOptions'
import ApproveButton from 'components/trade/ApproveButton'

type NewIdeaToken = {
  symbol: string
  logoURL: string
}

type StakeUserUIProps = {
  ideaToken: IdeaToken
  market: IdeaMarket
  onTradeComplete: (
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    transactionType: TX_TYPES
  ) => void
  onValuesChanged: (
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenSymbol: string,
    calculatedTokenAmount: BN,
    maxSlippage: number,
    isUnlockOnceChecked: boolean,
    isUnlockPermanentChecked: boolean,
    isValid: boolean,
    recipientAddress: string,
    isENSAddressValid: boolean | string,
    hexAddress: boolean | string
  ) => void
  resetOn: boolean
  centerTypeSelection: boolean
  showTypeSelection: boolean
  showTradeButton: boolean
  disabled: boolean
  unlockText?: string
  newIdeaToken?: NewIdeaToken | null
  startingTradeType?: TX_TYPES
}

export default function StakeUserUI({
  ideaToken,
  market,
  onTradeComplete,
  onValuesChanged,
  resetOn,
  showTradeButton,
  disabled,
  unlockText,
  newIdeaToken,
  startingTradeType = TX_TYPES.BUY,
}: StakeUserUIProps) {
  const { account } = useWeb3React()
  const [tradeType, setTradeType] = useState(startingTradeType) // Used for smart contracts and which trade UI tab user is on
  const [isENSAddressValid, hexAddress] = useENSAddress(account)

  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(false)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] = useState(true)

  const tokenList = useTokenListStore((state) => state.tokens)
  const selectTokensValues = tokenList.map((token) => ({
    value: token.address,
    token: token,
  }))

  const [selectedToken, setSelectedToken] = useState(
    useTokenListStore.getState().tokens[0]
  )
  const [tradeToggle, setTradeToggle] = useState(false) // Need toggle to reload balances after trade
  const [ideaTokenBalance, ideaTokenBalanceBN, isIdeaTokenBalanceLoading] =
    useBalance(ideaToken?.address, account, 18, tradeToggle)

  const [tokenBalance, tokenBalanceBN, isTokenBalanceLoading] = useBalance(
    selectedToken?.address,
    account,
    selectedToken?.decimals,
    tradeToggle
  )

  // ideaTokenAmount = Number typed in by user on ideaToken input
  const [ideaTokenAmount, setIdeaTokenAmount] = useState('0')
  const ideaTokenAmountBN = floatToWeb3BN(
    ideaTokenAmount,
    18,
    BigNumber.ROUND_DOWN
  )
  // Calculates the selectedToken amount after the ideaToken is typed in
  const [
    isCalculatedTokenAmountLoading,
    calculatedTokenAmountBN,
    calculatedTokenAmount,
  ] = useOutputAmount(
    ideaToken,
    market,
    selectedToken?.address,
    ideaTokenAmount,
    selectedToken?.decimals,
    tradeType
  )

  // selectedTokenAmount = Number typed in by user on selectedToken input
  const [selectedTokenAmount, setSelectedTokenAmount] = useState('0')
  const selectedTokenAmountBN = floatToWeb3BN(
    selectedTokenAmount,
    selectedToken.decimals,
    BigNumber.ROUND_DOWN
  )
  // Calculates the ideaToken amount after the selectedToken is typed in
  const [
    isCalculatedIdeaTokenAmountLoading,
    calculatedIdeaTokenAmountBN,
    calculatedIdeaTokenAmount,
  ] = useReversePrice(
    ideaToken,
    market,
    selectedToken?.address,
    selectedTokenAmount,
    selectedToken?.decimals,
    tradeType,
    tokenBalanceBN
  )

  // Determines which token input was typed in last
  const isSelectedTokenActive = selectedTokenAmount !== '0'

  // These master variables store the value to be used for the ideaToken and selectedToken
  // If user typed a number, use that input. Otherwise, use the calculated value
  const masterIdeaTokenAmount = isSelectedTokenActive
    ? calculatedIdeaTokenAmount
    : ideaTokenAmount
  const masterSelectedTokenAmount = isSelectedTokenActive
    ? selectedTokenAmount
    : calculatedTokenAmount
  const masterIdeaTokenAmountBN = isSelectedTokenActive
    ? calculatedIdeaTokenAmountBN
    : ideaTokenAmountBN
  const masterSelectedTokenAmountBN = isSelectedTokenActive
    ? selectedTokenAmountBN
    : calculatedTokenAmountBN

  const ideaTokenValue = web3BNToFloatString(
    calculateIdeaTokenDaiValue(
      tradeType === TX_TYPES.BUY
        ? // If there is no ideaToken (when listing new IDT), then just use masterIdeaTokenAmountBN
          ideaToken?.rawSupply?.add(masterIdeaTokenAmountBN) ||
            masterIdeaTokenAmountBN
        : ideaToken?.rawSupply,
      market,
      masterIdeaTokenAmountBN
    ),
    bigNumberTenPow18,
    2
  )

  // Calculates the DAI/USD value for the selectedToken
  const [
    isSelectedTokenDAIValueLoading,
    selectedTokenDAIValueBN,
    selectedTokenDAIValue,
  ] = useTokenToDAI(
    selectedToken,
    masterSelectedTokenAmount,
    selectedToken?.decimals
  )

  function percentDecrease(a, b) {
    return 100 * ((a - b) / Math.abs(a))
  }

  const slippage =
    tradeType === TX_TYPES.BUY
      ? percentDecrease(
          parseFloat(selectedTokenDAIValue),
          parseFloat(ideaTokenValue)
        )
      : percentDecrease(
          parseFloat(ideaTokenValue),
          parseFloat(selectedTokenDAIValue)
        )

  const marketSpecifics = getMarketSpecificsByMarketName(market?.name)

  const exchangeContractAddress = useContractStore(
    (state) => state.exchangeContract
  )?.options?.address
  const multiActionContractAddress = useContractStore(
    (state) => state.multiActionContract
  )?.options?.address

  const spender =
    tradeType === TX_TYPES.BUY
      ? selectedToken?.address === NETWORK.getExternalAddresses().dai
        ? exchangeContractAddress
        : multiActionContractAddress
      : selectedToken.address !== NETWORK.getExternalAddresses().dai
      ? multiActionContractAddress
      : undefined

  const spendTokenAddress =
    tradeType === TX_TYPES.BUY ? selectedToken?.address : ideaToken.address

  const spendTokenSymbol =
    tradeType === TX_TYPES.BUY
      ? selectedToken?.symbol
      : marketSpecifics.getTokenDisplayName(ideaToken.name)

  // Amount of token that needs approval before tx
  const requiredAllowance =
    tradeType === TX_TYPES.BUY
      ? masterSelectedTokenAmount
      : masterIdeaTokenAmount

  const exceedsBalanceBuy =
    isTokenBalanceLoading || !masterSelectedTokenAmountBN
      ? false
      : tokenBalanceBN.lt(masterSelectedTokenAmountBN)

  const exceedsBalanceSell = isIdeaTokenBalanceLoading
    ? false
    : ideaTokenBalanceBN.lt(masterIdeaTokenAmountBN)

  const exceedsBalance =
    tradeType === TX_TYPES.BUY || tradeType === TX_TYPES.LOCK
      ? exceedsBalanceBuy
      : exceedsBalanceSell

  const [isMissingAllowance, setIsMissingAllowance] = useState(false) // isMissingAllowance says whether the user has enough allowance on the ERC20 token to perform the trade. If isMissingAllowance == true then the user needs to do an approve tx first
  const [approveButtonKey, setApproveButtonKey] = useState(0)
  const [isValid, setIsValid] = useState(false)
  const txManager = useTransactionManager()

  let maxSlippage = 0.01
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
    setTradeType(startingTradeType)
    setApproveButtonKey(approveButtonKey + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOn])

  useEffect(() => {
    let isValid =
      selectedToken !== undefined &&
      masterIdeaTokenAmountBN !== undefined &&
      masterSelectedTokenAmountBN !== undefined &&
      !isNaN(masterIdeaTokenAmount) &&
      !isNaN(masterSelectedTokenAmount) &&
      !/\s/g.test(masterSelectedTokenAmount) && // No whitespace allowed in inputs
      !/\s/g.test(masterIdeaTokenAmount) &&
      masterIdeaTokenAmountBN.gt(new BN('0')) &&
      masterSelectedTokenAmountBN.gt(new BN('0'))

    if (isValid) {
      // Make sure user has high enough balance. If not, disable buttons
      if (tradeType === TX_TYPES.BUY) {
        if (masterSelectedTokenAmountBN.gt(tokenBalanceBN)) {
          isValid = false
        }
      } else {
        if (masterIdeaTokenAmountBN.gt(ideaTokenBalanceBN)) {
          isValid = false
        }
      }
    }

    setIsValid(isValid)

    // Didn't use masterIdeaTokenAmountBN because type can be BN or BigNumber...this causes issues
    const ideaTokenAmountBNLocal = floatToWeb3BN(
      masterIdeaTokenAmount,
      18,
      BigNumber.ROUND_DOWN
    )
    const selectedTokenAmountBNLocal = floatToWeb3BN(
      masterSelectedTokenAmount,
      selectedToken.decimals,
      BigNumber.ROUND_DOWN
    )

    onValuesChanged(
      ideaTokenAmountBNLocal,
      selectedToken?.address,
      spendTokenSymbol,
      selectedTokenAmountBNLocal,
      maxSlippage,
      isUnlockOnceChecked,
      isUnlockPermanentChecked,
      isValid,
      account,
      isENSAddressValid,
      hexAddress
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ideaTokenAmount,
    selectedTokenAmount,
    selectedToken,
    calculatedIdeaTokenAmountBN,
    calculatedTokenAmountBN,
    maxSlippage,
    isUnlockOnceChecked,
    isUnlockPermanentChecked,
    isCalculatedIdeaTokenAmountLoading,
    isCalculatedTokenAmountLoading,
    isSelectedTokenDAIValueLoading,
    account,
    isENSAddressValid,
    hexAddress,
    spendTokenSymbol,
  ])

  async function maxButtonClicked() {
    setSelectedTokenAmount('0')

    if (tradeType === TX_TYPES.SELL || tradeType === TX_TYPES.LOCK) {
      const balanceBN = new BigNumber(ideaTokenBalanceBN.toString())
      setIdeaTokenAmount(
        formatBigNumber(
          balanceBN.div(new BigNumber('10').pow(new BigNumber('18'))),
          18,
          BigNumber.ROUND_DOWN
        )
      )
    } else {
      setSelectedTokenAmount(tokenBalance)
    }
  }

  const tradeFinishUp = () => {
    setIdeaTokenAmount('0')
    setApproveButtonKey(approveButtonKey + 1)
    setTradeToggle(!tradeToggle)
    if (tradeType !== TX_TYPES.LOCK)
      // This is handled in LockInterface
      onTradeComplete(true, ideaToken?.listingId, ideaToken?.name, tradeType)

    mixpanel.track(`${TX_TYPES[tradeType]}_COMPLETED`, {
      tokenName: ideaToken.name,
    })
  }

  async function onTradeClicked() {
    const name = tradeType === TX_TYPES.BUY ? 'Buy' : 'Sell'
    const func = tradeType === TX_TYPES.BUY ? buyToken : sellToken
    // Didn't use masterIdeaTokenAmountBN because type can be BN or BigNumber...this causes issues
    const ideaTokenAmountBNLocal = floatToWeb3BN(
      masterIdeaTokenAmount,
      18,
      BigNumber.ROUND_DOWN
    )
    const selectedTokenAmountBNLocal = floatToWeb3BN(
      masterSelectedTokenAmount,
      selectedToken.decimals,
      BigNumber.ROUND_DOWN
    )

    const args =
      tradeType === TX_TYPES.BUY
        ? [
            ideaToken.address,
            selectedToken.address,
            ideaTokenAmountBNLocal,
            selectedTokenAmountBNLocal,
            maxSlippage,
            0,
            account,
          ]
        : [
            ideaToken.address,
            selectedToken.address,
            ideaTokenAmountBNLocal,
            selectedTokenAmountBNLocal,
            maxSlippage,
            account,
          ]

    try {
      await txManager.executeTx(name, func, ...args)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(
        false,
        ideaToken?.listingId,
        ideaToken?.name,
        TX_TYPES.NONE
      )
      return
    }

    tradeFinishUp()
  }

  // Is user's address a valid hex-address?
  const isValidAddress = !isENSAddressValid ? isETHAddress(account) : true

  const isApproveButtonDisabled =
    txManager.isPending ||
    !isValid ||
    exceedsBalance ||
    !isMissingAllowance ||
    !isValidAddress

  const isTradeButtonDisabled =
    txManager.isPending ||
    !isValid ||
    exceedsBalance ||
    isMissingAllowance ||
    !isValidAddress

  const { tokenIconURL } = useTokenIconURL({
    marketSpecifics,
    tokenName: ideaToken?.name,
  })

  const commonProps = {
    setIdeaTokenAmount,
    setSelectedTokenAmount,
    tradeType,
    exceedsBalance,
    disabled,
    market,
    maxButtonClicked,
    selectedToken,
    setSelectedToken,
    selectTokensValues,
    setTradeType,
    txManager,
    slippage,
    isInputAmountGTSupply: masterIdeaTokenAmount < 0,
  }

  const selectedTokenProps = {
    inputTokenAmount: isCalculatedTokenAmountLoading
      ? '...'
      : masterSelectedTokenAmount,
    isIdeaToken: false, // Selected token is never an ideaToken. It is ETH/DAI/etc (if this changes, can call this isSelectedToken instead)
    tokenBalance,
    isTokenBalanceLoading,
    selectedIdeaToken: null,
    tokenValue: web3BNToFloatString(
      selectedTokenDAIValueBN || new BN('0'),
      bigNumberTenPow18,
      2
    ),
  }

  const selectedIdeaToken = {
    symbol: marketSpecifics
      ? marketSpecifics.getTokenDisplayName(ideaToken?.name)
      : ideaToken?.name,
    logoURL: tokenIconURL,
  }

  const ideaTokenProps = {
    inputTokenAmount: isCalculatedIdeaTokenAmountLoading
      ? '...'
      : masterIdeaTokenAmount,
    isIdeaToken: true,
    tokenBalance: ideaTokenBalance,
    isTokenBalanceLoading: isIdeaTokenBalanceLoading,
    selectedIdeaToken: newIdeaToken || selectedIdeaToken,
    tokenValue: ideaTokenValue,
  }

  return (
    <div>
      <div className="w-full md:w-136 p-4 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        <div className="flex space-x-2 pb-3 overflow-x-scroll md:overflow-auto">
          <button
            className={classNames(
              'h-10 flex justify-center items-center pl-3 pr-4 py-2 border rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                  TX_TYPES.BUY === tradeType,
              },
              {
                'text-brand-black dark:text-gray-50': !(
                  TX_TYPES.BUY === tradeType
                ),
              }
            )}
            onClick={() => {
              setIdeaTokenAmount('0')
              setSelectedTokenAmount('0')
              setTradeType(TX_TYPES.BUY)
            }}
          >
            <ArrowSmUpIcon className="w-4 h-4 mr-1" />
            <span>Buy</span>
          </button>
          <button
            className={classNames(
              'h-10 flex justify-center items-center pl-3 pr-4 py-2 border rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                  TX_TYPES.SELL === tradeType,
              },
              {
                'text-brand-black dark:text-gray-50': !(
                  TX_TYPES.SELL === tradeType
                ),
              }
            )}
            onClick={() => {
              setIdeaTokenAmount('0')
              setSelectedTokenAmount('0')
              setTradeType(TX_TYPES.SELL)
            }}
          >
            <ArrowSmDownIcon className="w-4 h-4 mr-1" />
            <span>Sell</span>
          </button>
        </div>

        <div>
          <div className="flex justify-between">
            <div />
            <Tooltip
              className="w-4 h-4 mb-4 ml-2 cursor-pointer text-brand-gray-2 dark:text-white"
              placement="down"
              IconComponent={CogIcon}
            >
              <div className="w-64 mb-2">
                <AdvancedOptions
                  disabled={txManager.isPending || disabled}
                  setIsUnlockOnceChecked={setIsUnlockOnceChecked}
                  isUnlockOnceChecked={isUnlockOnceChecked}
                  isUnlockPermanentChecked={isUnlockPermanentChecked}
                  setIsUnlockPermanentChecked={setIsUnlockPermanentChecked}
                  unlockText={unlockText || 'for trading'}
                />
              </div>

              <div className="flex-1 mb-3 text-base text-brand-gray-2">
                <Select
                  className="border-2 border-gray-200 rounded-md text-brand-gray-2 trade-select"
                  isClearable={false}
                  isSearchable={false}
                  isDisabled={txManager.isPending || disabled}
                  onChange={(option: SlippageValue) => {
                    maxSlippage = option.value
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
            </Tooltip>
          </div>

          <div className="flex justify-between items-center px-2 pb-1">
            <div className="opacity-50">Spend</div>
            <div>
              You have:{' '}
              {(tradeType === TX_TYPES.BUY && isTokenBalanceLoading) ||
              (tradeType === TX_TYPES.SELL && isIdeaTokenBalanceLoading)
                ? '...'
                : parseFloat(
                    tradeType === TX_TYPES.BUY ? tokenBalance : ideaTokenBalance
                  )}
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
          </div>
          <TradeInterfaceBox
            {...commonProps}
            label="Spend"
            {...(tradeType === TX_TYPES.SELL
              ? { ...ideaTokenProps }
              : { ...selectedTokenProps })}
          />

          <div className="flex justify-between items-center px-2 pb-1 pt-4">
            <div className="opacity-50">Receive</div>
            <div>
              You have:{' '}
              {(tradeType === TX_TYPES.BUY && isIdeaTokenBalanceLoading) ||
              (tradeType === TX_TYPES.SELL && isTokenBalanceLoading)
                ? '...'
                : parseFloat(
                    tradeType === TX_TYPES.BUY ? ideaTokenBalance : tokenBalance
                  )}
            </div>
          </div>

          <TradeInterfaceBox
            {...commonProps}
            label="Receive"
            {...(tradeType === TX_TYPES.BUY
              ? { ...ideaTokenProps }
              : { ...selectedTokenProps })}
          />

          {showTradeButton && (
            <div className="mt-4">
              <ApproveButton
                tokenAddress={spendTokenAddress}
                tokenName={spendTokenSymbol}
                spenderAddress={spender}
                requiredAllowance={floatToWeb3BN(
                  requiredAllowance,
                  18,
                  BigNumber.ROUND_UP
                )}
                unlockPermanent={isUnlockPermanentChecked}
                txManager={txManager}
                setIsMissingAllowance={setIsMissingAllowance}
                disable={isApproveButtonDisabled}
                key={approveButtonKey}
                txType="spend"
              />
              <div className="mt-4 ">
                <button
                  className={classNames(
                    'py-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
                    isTradeButtonDisabled
                      ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                      : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
                  )}
                  disabled={isTradeButtonDisabled}
                  onClick={onTradeClicked}
                >
                  {tradeType === TX_TYPES.BUY ? 'Buy' : 'Sell'}
                </button>
              </div>

              <div className="mt-2 text-xs text-center text-gray-500">
                Confirm transaction in wallet to complete.
              </div>

              <TxPending txManager={txManager} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
