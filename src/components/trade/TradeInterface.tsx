import { useEffect, useState } from 'react'
import classNames from 'classnames'
import Select from 'react-select'
import {
  IdeaToken,
  IdeaMarket,
  queryInterestManagerTotalShares,
  queryLockedAmounts,
} from 'store/ideaMarketsStore'
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
  bnToFloatString,
  calculateIdeaTokenDaiValue,
  floatToWeb3BN,
  formatBigNumber,
  formatNumber,
  formatNumberWithCommasAsThousandsSerperator,
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
import { getMarketSpecificsByMarketName } from 'store/markets'
import { TradeInterfaceBox } from './components'
import {
  CogIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/outline'
import useReversePrice from 'actions/useReversePrice'
import useTokenToDAI from 'actions/useTokenToDAI'
import { useWeb3React } from '@web3-react/core'
import { useENSAddress } from './hooks/useENSAddress'
import { TX_TYPES } from './TradeCompleteModal'
import mixpanel from 'mixpanel-browser'
import getConfig from 'next/config'
import TxPending from './TxPending'
import LockInterface from './components/LockInterface'
import UnverifiedListing from 'components/listing-page/UnverifiedListing'
import VerifiedListing from 'components/listing-page/VerifiedListing'
import { useQuery } from 'react-query'
import { queryDaiBalance } from 'store/daiStore'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import moment from 'moment'
import ToggleSwitch from 'components/ToggleSwitch'
import { A } from 'components'
import { getLockingAPR } from 'lib/axios'
import { isETHAddress } from 'utils/addresses'
import unlockIDT from 'actions/web3/unlockIDT'

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
  parentComponent: string
  startingTradeType?: TX_TYPES
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
  parentComponent,
  startingTradeType = TX_TYPES.BUY,
}: TradeInterfaceProps) {
  const { data: interestManagerTotalShares } = useQuery(
    'interest-manager-total-shares',
    queryInterestManagerTotalShares
  )

  const interestManagerAddress =
    NETWORK.getDeployedAddresses().interestManagerAVM
  const { data: interestManagerDaiBalance } = useQuery(
    ['interest-manager-dai-balance'],
    () => queryDaiBalance(interestManagerAddress)
  )

  const claimableIncome =
    interestManagerTotalShares &&
    interestManagerDaiBalance &&
    ideaToken &&
    ideaToken.rawInvested &&
    ideaToken.rawMarketCap
      ? bnToFloatString(
          new BigNumber(ideaToken.rawInvested.toString())
            .dividedBy(new BigNumber(interestManagerTotalShares.toString()))
            .multipliedBy(new BigNumber(interestManagerDaiBalance.toString()))
            .minus(new BigNumber(ideaToken.rawMarketCap.toString())),
          bigNumberTenPow18,
          2
        )
      : '0.00'

  const { account } = useWeb3React()
  const [lockingAPR, setLockingAPR] = useState(undefined)
  const [tradeType, setTradeType] = useState(startingTradeType) // Used for smart contracts and which trade UI tab user is on
  const [showLockOptions, setShowLockOptions] = useState(false)
  const [lockPeriod, setLockPeriod] = useState('3month')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isENSAddressValid, hexAddress] = useENSAddress(recipientAddress)

  const [pairsToggle, setPairsToggle] = useState([])
  const togglePairVisibility = (pairsIndex: number) => {
    const pairs = [...pairsToggle]
    pairs[pairsIndex] = !pairs[pairsIndex]
    setPairsToggle(pairs)
  }

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

  const ideaTokenBalanceDisplay = ideaTokenBalanceBN
    ? formatNumberWithCommasAsThousandsSerperator(
        web3BNToFloatString(ideaTokenBalanceBN, bigNumberTenPow18, 2)
      )
    : '0'
  const balanceDAIValueBN = calculateIdeaTokenDaiValue(
    ideaToken?.rawSupply,
    market,
    ideaTokenBalanceBN
  )
  const balanceDAIValue = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(balanceDAIValueBN, bigNumberTenPow18, 2)
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

  const { data: rawLockedPairs, refetch: refetchLocked } = useQuery(
    ['locked-tokens', ideaToken?.address, account, 0, 100, null, null],
    () =>
      queryLockedAmounts(
        ideaToken?.address,
        account,
        0,
        100,
        null,
        null,
        ideaToken?.isL1
      )
  )

  const unlockablePairs = rawLockedPairs
    ? rawLockedPairs?.filter((pair) => pair.lockedUntil * 1000 <= Date.now())
    : []
  const canUnlock = unlockablePairs && unlockablePairs.length > 0 // Is Unlock tab available?

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
      ? selectedToken?.address === NETWORK.getExternalAddresses().dai &&
        !isLockChecked
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

  const onLockPeriodChanged = (event) => {
    setLockPeriod(event.target.id)
  }

  const tradeFinishUp = () => {
    if (tradeType === TX_TYPES.LOCK) {
      refetchLocked()
    }

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

    const giftAddress = isENSAddressValid ? hexAddress : recipientAddress

    const oneMonthInSecs = 2592000
    const threeMonthsInSecs = 7776000

    const args =
      tradeType === TX_TYPES.BUY
        ? [
            ideaToken.address,
            selectedToken.address,
            ideaTokenAmountBNLocal,
            selectedTokenAmountBNLocal,
            maxSlippage,
            isLockChecked
              ? lockPeriod === '3month'
                ? threeMonthsInSecs
                : oneMonthInSecs
              : 0,
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

  /**
   * User clicked to unlock their locked tokens on unlock tab.
   */
  const onUnlockClicked = async () => {
    const untils = unlockablePairs.map((pair) => pair.lockedUntil)
    const args = [ideaToken?.address, untils, ideaToken?.isL1]

    try {
      await txManager.executeTx('Unlock', unlockIDT, ...args)
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

  // Did user type a valid ENS address or hex-address?
  const isValidAddress = !isENSAddressValid
    ? isETHAddress(recipientAddress)
    : true

  const isApproveButtonDisabled =
    txManager.isPending ||
    !isValid ||
    exceedsBalance ||
    !isMissingAllowance ||
    (isGiftChecked && !isValidAddress)

  const isTradeButtonDisabled =
    txManager.isPending ||
    !isValid ||
    exceedsBalance ||
    isMissingAllowance ||
    (isGiftChecked && !isValidAddress)

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

  useEffect(() => {
    getLockingAPR()
      .then((response) => {
        const { data } = response
        if (data.success) {
          setLockingAPR(Number(data.data.apr))
        } else setLockingAPR(0)
      })
      .catch(() => setLockingAPR(0))
  }, [])

  return (
    <div>
      <div className="w-full md:w-136 p-4 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        {parentComponent === 'ListingPage' && (
          <div className="md:flex md:justify-between items-center mb-7 md:mb-4">
            <div
              className="text-gray-400 mb-4 md:mb-0"
              style={{
                fontFamily: 'Segoe UI',
              }}
            >
              ACCOUNT HOLDINGS
            </div>
            <div className="flex items-center text-lg font-sf-compact-medium">
              <span className="font-bold mr-4">
                {ideaTokenBalanceDisplay} Tokens
              </span>
              <span className="text-gray-400">~${balanceDAIValue}</span>
            </div>
          </div>
        )}
        {parentComponent !== 'ListTokenModal' && (
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
            <button
              className={classNames(
                'h-10 flex justify-center items-center pl-3 pr-4 py-2 border rounded-md text-sm font-semibold',
                {
                  'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                    TX_TYPES.LOCK === tradeType,
                },
                {
                  'text-brand-black dark:text-gray-50': !(
                    TX_TYPES.LOCK === tradeType
                  ),
                }
              )}
              onClick={() => {
                setIdeaTokenAmount('0')
                setSelectedTokenAmount('0')
                setTradeType(TX_TYPES.LOCK)
              }}
            >
              <LockClosedIcon className="w-4 h-4 mr-1" />
              <span>Lock</span>
            </button>
            {canUnlock && (
              <button
                className={classNames(
                  'h-10 flex justify-center items-center pl-3 pr-4 py-2 border rounded-md text-sm font-semibold',
                  {
                    'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                      TX_TYPES.UNLOCK === tradeType,
                  },
                  {
                    'text-brand-black dark:text-gray-50': !(
                      TX_TYPES.UNLOCK === tradeType
                    ),
                  }
                )}
                onClick={() => {
                  setIdeaTokenAmount('0')
                  setSelectedTokenAmount('0')
                  setTradeType(TX_TYPES.UNLOCK)
                }}
              >
                <LockOpenIcon className="w-4 h-4 mr-1" />
                <span>Unlock</span>
              </button>
            )}
            {/* <button
            className={classNames(
              'h-10 flex justify-center items-center px-4 py-2 border rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                  TX_TYPES.CLAIM === tradeType,
              },
              { 'text-brand-black dark:text-gray-50': !(TX_TYPES.CLAIM === tradeType) }
            )}
            onClick={() => {
              setIdeaTokenAmount('0')
              setSelectedTokenAmount('0')
              setTradeType(TX_TYPES.CLAIM)
            }}
          >
            <span className="mr-1">{getIconVersion('crown', resolvedTheme)}</span>
            <span>Claim Listing</span>
          </button> */}
          </div>
        )}

        {tradeType === TX_TYPES.BUY || tradeType === TX_TYPES.SELL ? (
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
                      tradeType === TX_TYPES.BUY
                        ? tokenBalance
                        : ideaTokenBalance
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
                      tradeType === TX_TYPES.BUY
                        ? ideaTokenBalance
                        : tokenBalance
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

            <div className={classNames('flex flex-col my-2 text-sm')}>
              <div className="flex items-center">
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
                    Send this purchase to someone else's wallet, such as the
                    listing owner or a friend.
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
                    isETHAddress(recipientAddress) || isENSAddressValid
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

            {tradeType === TX_TYPES.BUY && (
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <span className="font-bold">Lock for</span>
                  <div className="w-44 flex justify-between items-center px-3 py-1 border border-gray-200 rounded-2xl text-sm">
                    <span>
                      {lockPeriod === '3month' ? '3 months' : '1 month'}
                    </span>
                    {/* <span className="text-green-500">
                      {lockPeriod === '3month' ? '(22% APR)' : '(12% APR)'}
                    </span> */}
                    {showLockOptions ? (
                      <ChevronUpIcon
                        onClick={() => setShowLockOptions(!showLockOptions)}
                        className="w-5 h-5 cursor-pointer text-gray-400"
                      />
                    ) : (
                      <ChevronDownIcon
                        onClick={() => setShowLockOptions(!showLockOptions)}
                        className="w-5 h-5 cursor-pointer text-gray-400"
                      />
                    )}
                  </div>
                  <Tooltip>
                    <div className="w-32 md:w-64">
                      Lock tokens to show your long-term confidence in a
                      listing. You will be unable to sell or withdraw locked
                      tokens for the time period specified.
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

                <ToggleSwitch
                  handleChange={() => setIsLockChecked(!isLockChecked)}
                  isOn={isLockChecked}
                />
              </div>
            )}

            {showLockOptions && tradeType === TX_TYPES.BUY && (
              <div className="flex space-x-2 my-8">
                <div className="flex flex-col justify-between border border-transparent rounded-lg pr-2 py-2 text-sm">
                  <div className="flex flex-col">
                    <span>Locked Period</span>
                    <span className="text-xs opacity-0">(x days)</span>
                  </div>
                  <div className="mt-4 mb-1">Estimated APR</div>
                  <div>Redemption Date</div>
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
                  <div className="text-green-500 font-bold">
                    {formatNumber(lockingAPR)}%
                  </div>
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
                  <div className="text-green-500 font-bold">
                    {formatNumber(lockingAPR * 1.2)}%
                  </div>
                  <div>
                    {moment(new Date(Date.now() + 7889400000)).format('LL')}
                  </div>
                </div>
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
                    {tradeType === TX_TYPES.BUY ? 'Buy' : 'Sell'}
                  </button>
                </div>

                <div className="mt-2 text-xs text-center text-gray-500">
                  Confirm transaction in wallet to complete.
                </div>

                <TxPending txManager={txManager} />
              </>
            )}
          </div>
        ) : tradeType === TX_TYPES.LOCK ? (
          <LockInterface
            ideaToken={ideaToken}
            rawPairs={rawLockedPairs}
            ideaTokenBalance={ideaTokenBalance}
            isTokenBalanceLoading={isTokenBalanceLoading}
            tokenBalance={tokenBalance}
            maxButtonClicked={maxButtonClicked}
            tokenValue={ideaTokenValue}
            inputTokenAmount={
              isCalculatedIdeaTokenAmountLoading ? '...' : masterIdeaTokenAmount
            }
            setIdeaTokenAmount={setIdeaTokenAmount}
            recipientAddress={account}
            marketName={market?.name}
            marketSpecifics={marketSpecifics}
            tradeFinishUp={tradeFinishUp}
            exceedsBalance={exceedsBalance}
          />
        ) : (
          <>
            {tradeType === TX_TYPES.UNLOCK && (
              <div className="mt-8">
                <div>
                  {unlockablePairs?.map((pair, pairInd) => {
                    const redemptionDate = moment(
                      pair.lockedUntil * 1000
                    ).format('LL')

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
                            <div className="flex justify-between">
                              <div>Redemption Date</div>
                              <div>{redemptionDate}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button
                  className="py-4 text-lg font-bold rounded-2xl w-full border-brand-blue text-white bg-brand-blue font-medium hover:bg-blue-800"
                  onClick={onUnlockClicked}
                >
                  Unlock
                </button>

                <TxPending txManager={txManager} />
              </div>
            )}

            {tradeType === TX_TYPES.CLAIM && (
              <>
                {ideaToken.tokenOwner === ZERO_ADDRESS ? (
                  <UnverifiedListing
                    claimableInterest={claimableIncome}
                    marketSpecifics={marketSpecifics}
                    market={market}
                    token={ideaToken}
                    mixpanel={mixpanel}
                  />
                ) : (
                  <VerifiedListing
                    token={ideaToken}
                    refetch={tradeFinishUp}
                    claimableInterest={claimableIncome}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
