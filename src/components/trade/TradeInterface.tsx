import { useEffect, useState } from 'react'
import classNames from 'classnames'
import Select from 'react-select'
import { IdeaToken, IdeaMarket } from 'store/ideaMarketsStore'
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
  isAddress,
  useTransactionManager,
  web3BNToFloatString,
  ZERO_ADDRESS,
} from 'utils'
import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import ApproveButton from './ApproveButton'
import AdvancedOptions from './AdvancedOptions'
import Tooltip from '../tooltip/Tooltip'
import A from 'components/A'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { TradeInterfaceBox } from './components'
import { CogIcon } from '@heroicons/react/outline'
import useReversePrice from 'actions/useReversePrice'
import useTokenToDAI from 'actions/useTokenToDAI'
import { useWeb3React } from '@web3-react/core'
import { useENSAddress } from './hooks/useENSAddress'
import { TRANSACTION_TYPES } from './TradeCompleteModal'
import mixpanel from 'mixpanel-browser'
import getConfig from 'next/config'
import TxPending from './TxPending'

const { publicRuntimeConfig } = getConfig()
const { MIX_PANEL_KEY } = publicRuntimeConfig

// Workaround since modal is not wrapped by the mixPanel interface
mixpanel.init(MIX_PANEL_KEY)

type NewIdeaToken = {
  symbol: string
  logoURL: string
}

type TradeInterfaceProps = {
  ideaToken: IdeaToken
  market: IdeaMarket
  onTradeComplete: (
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES
  ) => void
  onValuesChanged: (
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenSymbol: string,
    calculatedTokenAmount: BN,
    maxSlippage: number,
    lock: boolean,
    isUnlockOnceChecked: boolean,
    isUnlockPermanentChecked: boolean,
    isValid: boolean,
    recipientAddress: string,
    isENSAddressValid: boolean | string,
    hexAddress: boolean | string,
    isGiftChecked: boolean
  ) => void
  resetOn: boolean
  centerTypeSelection: boolean
  showTypeSelection: boolean
  showTradeButton: boolean
  disabled: boolean
  unlockText?: string
  newIdeaToken?: NewIdeaToken | null
}

export default function TradeInterface({
  ideaToken,
  market,
  onTradeComplete,
  onValuesChanged,
  resetOn,
  showTradeButton,
  disabled,
  unlockText,
  newIdeaToken,
}: TradeInterfaceProps) {
  const { account } = useWeb3React()
  const [tradeType, setTradeType] = useState('buy')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isENSAddressValid, hexAddress] = useENSAddress(recipientAddress)

  const [isLockChecked, setIsLockChecked] = useState(false)
  const [isGiftChecked, setIsGiftChecked] = useState(false)
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
      ideaToken?.rawSupply.add(masterIdeaTokenAmountBN) ||
        masterIdeaTokenAmountBN,
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
    tradeType === 'buy'
      ? percentDecrease(
          parseFloat(selectedTokenDAIValue),
          parseFloat(ideaTokenValue)
        )
      : percentDecrease(
          parseFloat(ideaTokenValue),
          parseFloat(selectedTokenDAIValue)
        )

  const exchangeContractAddress = useContractStore(
    (state) => state.exchangeContract
  )?.options?.address
  const multiActionContractAddress = useContractStore(
    (state) => state.multiActionContract
  )?.options?.address

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

  const spendTokenSymbol =
    tradeType === 'buy' ? selectedToken?.symbol : ideaToken.name

  const requiredAllowance =
    tradeType === 'buy' ? masterSelectedTokenAmount : masterIdeaTokenAmount

  const exceedsBalanceBuy =
    isTokenBalanceLoading || !masterSelectedTokenAmountBN
      ? false
      : tokenBalanceBN.lt(masterSelectedTokenAmountBN)

  const exceedsBalanceSell = isIdeaTokenBalanceLoading
    ? false
    : ideaTokenBalanceBN.lt(masterIdeaTokenAmountBN)

  const exceedsBalance =
    tradeType === 'buy' ? exceedsBalanceBuy : exceedsBalanceSell

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)
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
    setTradeType('buy')
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
      if (tradeType === 'buy') {
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
      isLockChecked,
      isUnlockOnceChecked,
      isUnlockPermanentChecked,
      isValid,
      recipientAddress,
      isENSAddressValid,
      hexAddress,
      isGiftChecked
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ideaTokenAmount,
    selectedTokenAmount,
    selectedToken,
    calculatedIdeaTokenAmountBN,
    calculatedTokenAmountBN,
    isLockChecked,
    maxSlippage,
    isUnlockOnceChecked,
    isUnlockPermanentChecked,
    isCalculatedIdeaTokenAmountLoading,
    isCalculatedTokenAmountLoading,
    isSelectedTokenDAIValueLoading,
    recipientAddress,
    isENSAddressValid,
    hexAddress,
    isGiftChecked,
    spendTokenSymbol,
  ])

  async function maxButtonClicked() {
    setSelectedTokenAmount('0')

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
      setSelectedTokenAmount(tokenBalance)
    }
  }

  async function onTradeClicked() {
    const name = tradeType === 'buy' ? 'Buy' : 'Sell'
    const func = tradeType === 'buy' ? buyToken : sellToken
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

    const giftAddress = isENSAddressValid ? hexAddress : recipientAddress

    const args =
      tradeType === 'buy'
        ? [
            ideaToken.address,
            selectedToken.address,
            ideaTokenAmountBNLocal,
            selectedTokenAmountBNLocal,
            maxSlippage,
            isLockChecked ? 31556952 : 0,
            isGiftChecked ? giftAddress : account,
          ]
        : [
            ideaToken.address,
            selectedToken.address,
            ideaTokenAmountBNLocal,
            selectedTokenAmountBNLocal,
            maxSlippage,
            isGiftChecked ? giftAddress : account,
          ]

    try {
      await txManager.executeTx(name, func, ...args)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, ideaToken?.name, TRANSACTION_TYPES.NONE)
      return
    }

    const transactionType =
      tradeType === 'buy' ? TRANSACTION_TYPES.BUY : TRANSACTION_TYPES.SELL

    setIdeaTokenAmount('0')
    setApproveButtonKey(approveButtonKey + 1)
    setTradeToggle(!tradeToggle)
    onTradeComplete(true, ideaToken?.name, transactionType)

    mixpanel.track(`${tradeType.toUpperCase()}_COMPLETED`, {
      tokenName: ideaToken.name,
    })
  }

  // Did user type a valid ENS address or hex-address?
  const isValidAddress = !isENSAddressValid ? isAddress(recipientAddress) : true

  const isApproveButtonDisabled =
    !isValid ||
    exceedsBalance ||
    !isMissingAllowance ||
    txManager.isPending ||
    (isGiftChecked && !isValidAddress)

  const isTradeButtonDisabled =
    txManager.isPending ||
    !isValid ||
    exceedsBalance ||
    isMissingAllowance ||
    (isGiftChecked && !isValidAddress)

  const marketSpecifics = getMarketSpecificsByMarketName(market?.name)
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
      <div
        className="p-4 mx-auto bg-white dark:bg-gray-700 rounded-xl"
        style={{ maxWidth: 550 }}
      >
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

        <TradeInterfaceBox
          {...commonProps}
          label="Spend"
          {...(tradeType === 'sell'
            ? { ...ideaTokenProps }
            : { ...selectedTokenProps })}
        />

        <TradeInterfaceBox
          {...commonProps}
          label="Receive"
          showBuySellSwitch={!newIdeaToken}
          {...(tradeType === 'buy'
            ? { ...ideaTokenProps }
            : { ...selectedTokenProps })}
        />

        <div className={classNames('flex flex-col my-2 text-sm')}>
          <div
            className={classNames(
              tradeType === 'sell' && 'hidden',
              'flex items-center cursor-pointer'
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
                  ? 'text-brand-blue dark:text-blue-400'
                  : 'text-gray-500 dark:text-white'
              )}
            >
              Lock for 1 year
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
                  href="https://docs.ideamarket.io/user-guide/tutorial#buy-upvotes"
                  target="_blank"
                  className="underline"
                >
                  locking tokens
                </A>
                .
              </div>
            </Tooltip>
          </div>

          <div className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="border-2 border-gray-200 rounded-sm cursor-pointer"
              id="giftCheckbox"
              disabled={txManager.isPending || disabled}
              checked={isGiftChecked}
              onChange={(e) => {
                setIsGiftChecked(e.target.checked)
              }}
            />
            <label
              htmlFor="giftCheckbox"
              className={classNames(
                'ml-2 cursor-pointer',
                isGiftChecked
                  ? 'text-brand-blue dark:text-blue-400'
                  : 'text-gray-500 dark:text-white'
              )}
            >
              Gift
            </label>
            <Tooltip className="ml-2">
              <div className="w-32 md:w-64">
                Send this purchase to someone else's wallet, such as the listing
                owner or a friend.
              </div>
            </Tooltip>
          </div>
        </div>

        {isGiftChecked && (
          <div className="flex flex-col items-center justify-between mb-2 md:flex-row">
            <input
              type="text"
              id="recipient-input"
              className={classNames(
                'h-full border rounded-md sm:text-sm my-1 text-black dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200',
                !ideaToken ||
                  (ideaToken && ideaToken.tokenOwner === ZERO_ADDRESS)
                  ? 'w-full'
                  : 'w-full md:w-96',
                isAddress(recipientAddress) || isENSAddressValid
                  ? 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                  : 'border-brand-red focus:border-brand-red focus:ring-red-500'
              )}
              placeholder="Recipient address or ENS"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value)
              }}
            />
            {ideaToken &&
              ideaToken.tokenOwner &&
              ideaToken.tokenOwner !== ZERO_ADDRESS && (
                <button
                  className="p-1 mt-1 text-base font-medium bg-white border-2 rounded-lg cursor-pointer md:mt-0 dark:bg-gray-600 md:table-cell border-brand-blue text-brand-blue dark:text-gray-300 hover:text-white tracking-tightest-2 hover:bg-brand-blue"
                  onClick={() => setRecipientAddress(ideaToken.tokenOwner)}
                >
                  Listing owner
                </button>
              )}
          </div>
        )}

        {showTradeButton && (
          <>
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
                {tradeType === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>

            <div className="mt-2 text-xs text-center text-gray-500">
              Confirm transaction in wallet to complete.
            </div>

            <TxPending txManager={txManager} />
          </>
        )}
      </div>
    </div>
  )
}
