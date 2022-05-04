import classNames from 'classnames'
import { useEffect, useState } from 'react'
import {
  listToken,
  listAndBuyToken,
  verifyTokenName,
  useTokenIconURL,
} from 'actions'
import { useTransactionManager } from 'utils'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { Modal, MarketSelect, TradeInterface } from './'
import ApproveButton from './trade/ApproveButton'
import { useContractStore } from 'store/contractStore'
import BN from 'bn.js'
import A from './A'
import { useWeb3React } from '@web3-react/core'
import ModalService from './modals/ModalService'
import TradeCompleteModal, { TX_TYPES } from './trade/TradeCompleteModal'
import Image from 'next/image'
import { debounce } from 'utils/lodash'
import mixpanel from 'mixpanel-browser'

import getConfig from 'next/config'
import TxPending from './trade/TxPending'
import { isETHAddress } from 'utils/addresses'

const { publicRuntimeConfig } = getConfig()
const { MIX_PANEL_KEY } = publicRuntimeConfig

// Workaround since modal is not wrapped by the mixPanel interface
mixpanel.init(MIX_PANEL_KEY)

export default function ListTokenModal({ close }: { close: () => void }) {
  const { account } = useWeb3React()
  const [selectedMarket, setSelectedMarket] = useState(undefined)

  const txManager = useTransactionManager()

  const [tokenName, setTokenName] = useState('')
  const [isValidTokenName, setIsValidTokenName] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [isWantBuyChecked, setIsWantBuyChecked] = useState(false)
  const [buyPayWithAddress, setBuyPayWithAddress] = useState(undefined)
  const [buyPayWithSymbol, setBuyPayWithSymbol] = useState(undefined)
  const [buyInputAmountBN, setBuyInputAmountBN] = useState(undefined)
  const [buyOutputAmountBN, setBuyOutputAmountBN] = useState(undefined)
  const [buySlippage, setBuySlippage] = useState(undefined)
  const [buyLock, setBuyLock] = useState(false)
  const [isBuyValid, setIsBuyValid] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isENSAddressValid, setIsENSAddressValid] = useState(false)
  // const [hexAddress, setHexAddress] = useState('')

  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] =
    useState(false)

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)

  const multiActionContractAddress = useContractStore(
    (state) => state.multiActionContract
  )?.options.address

  const marketSpecifics =
    selectedMarket && getMarketSpecificsByMarketName(selectedMarket.name)

  const tokenNamePrefix =
    marketSpecifics && marketSpecifics.getListTokenPrefix() !== ''
      ? marketSpecifics.getListTokenPrefix()
      : undefined
  const tokenNameSuffix =
    marketSpecifics && marketSpecifics.getListTokenSuffix() !== ''
      ? marketSpecifics.getListTokenSuffix()
      : undefined

  const { tokenIconURL, isLoading: isTokenIconURLLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName,
  })

  // Did user type a valid ENS address or hex-address?
  const isValidAddress = !isENSAddressValid
    ? isETHAddress(recipientAddress)
    : true

  const isApproveButtonDisabled =
    selectedMarket === undefined ||
    !isMissingAllowance ||
    !isValidTokenName ||
    txManager.isPending ||
    (isWantBuyChecked && !isBuyValid) ||
    !isValidAddress

  const isTradeButtonDisabled =
    selectedMarket === undefined ||
    !isValidTokenName ||
    txManager.isPending ||
    (isWantBuyChecked && (isMissingAllowance || !isBuyValid)) ||
    !isValidAddress

  async function tokenNameInputChanged(userInput) {
    // Only reason this is needed before API call is because cannot encode/decode EM dashes, so need to replace them
    // TODO: move dash replace logic to backend eventually
    const nameBeforeAPI = getMarketSpecificsByMarketName(
      selectedMarket.name
    ).convertUserInputToTokenName(userInput)

    const { isValid, isAlreadyOnChain, finalTokenValue } =
      await verifyTokenName(nameBeforeAPI, selectedMarket, Boolean(account))

    setTokenName(finalTokenValue)

    if (isAlreadyOnChain) setErrorMessage('This token is already listed')
    else setErrorMessage('')

    setIsValidTokenName(isValid)
  }

  function onTradeInterfaceValuesChanged(
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenSymbol: string,
    tokenAmount: BN,
    slippage: number,
    isUnlockOnceChecked: boolean,
    isUnlockPermanentChecked: boolean,
    isValid: boolean,
    recipientAddress: string,
    isENSAddressValid: boolean,
    hexAddress: string
  ) {
    setBuyInputAmountBN(tokenAmount)
    setBuyPayWithAddress(tokenAddress)
    setBuyPayWithSymbol(tokenSymbol)
    setBuyOutputAmountBN(ideaTokenAmount)
    setBuySlippage(slippage)
    setIsUnlockPermanentChecked(isUnlockPermanentChecked)
    setIsBuyValid(isValid)
    setRecipientAddress(recipientAddress)
    setIsENSAddressValid(isENSAddressValid)
    // setHexAddress(hexAddress)
  }

  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    transactionType: TX_TYPES
  ) {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      transactionType,
    })
  }

  async function listClicked() {
    mixpanel.track(`ADD_LISTING_${selectedMarket.name.toUpperCase()}`)

    if (isWantBuyChecked) {
      // const giftAddress = isENSAddressValid ? hexAddress : recipientAddress
      try {
        await txManager.executeTx(
          'List and buy',
          listAndBuyToken,
          tokenName,
          selectedMarket,
          buyPayWithAddress,
          buyOutputAmountBN,
          buyInputAmountBN,
          buySlippage,
          buyLock ? 31556952 : 0,
          account
        )
      } catch (ex) {
        console.log(ex)
        onTradeComplete(false, null, tokenName, TX_TYPES.NONE)
        return
      }

      close()
      onTradeComplete(true, null, tokenName, TX_TYPES.BUY)
      mixpanel.track(
        `ADD_LISTING_${selectedMarket.name.toUpperCase()}_COMPLETED`
      )
    } else {
      try {
        await txManager.executeTx(
          'List Token',
          listToken,
          tokenName,
          selectedMarket.marketID
        )
      } catch (ex) {
        console.log(ex)
        onTradeComplete(false, null, tokenName, TX_TYPES.NONE)
        return
      }
      close()
      onTradeComplete(true, null, tokenName, TX_TYPES.LIST)
      mixpanel.track(
        `ADD_LISTING_${selectedMarket.name.toUpperCase()}_COMPLETED`
      )
    }
  }

  useEffect(() => {
    setSelectedMarket(undefined)
    setIsValidTokenName(false)
    setTokenName('')
    setIsWantBuyChecked(false)
    setBuyLock(false)
  }, [])

  return (
    <Modal close={close}>
      <div className="p-4 bg-top-mobile md:min-w-100">
        <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
          Add Listing
        </p>
      </div>
      <p className="mx-5 mt-5 text-sm text-brand-gray-2 dark:text-gray-300">
        Market
      </p>
      <div className="mx-5">
        <MarketSelect
          disabled={txManager.isPending}
          onChange={(value) => {
            setSelectedMarket(value.market)
          }}
        />
      </div>
      <p className="mx-5 mt-5 text-sm text-brand-gray-2 dark:text-gray-300">
        Token Name
      </p>
      <div className="flex items-center mx-5">
        <div className="text-base text-brand-gray-2 dark:text-white text-semibold">
          {tokenNamePrefix || ''}
        </div>
        <div
          className={classNames(
            'flex justify-between items-center flex-grow',
            tokenNamePrefix && 'ml-0.5'
          )}
        >
          <input
            type="text"
            disabled={txManager.isPending || !selectedMarket}
            className={classNames(
              'w-12 md:w-full flex-grow py-2 pl-1 pr-4 leading-tight bg-gray-200 dark:bg-gray-600 border-2 rounded appearance-none focus:bg-white focus:outline-none',
              !isValidTokenName
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-gray-200 dark:border-gray-500 focus:border-brand-blue'
            )}
            onChange={debounce(
              (e) => tokenNameInputChanged(e.target.value),
              500
            )}
          />
        </div>
        <div
          className={classNames(
            'text-base text-brand-gray-2 dark:text-gray-300 text-semibold',
            tokenNameSuffix && 'ml-0.5'
          )}
        >
          {tokenNameSuffix || ''}
        </div>
        {(isTokenIconURLLoading || !isValidTokenName) && (
          <div
            className={classNames(
              'inline-block w-12 h-12 ml-3 align-middle bg-gray-400 rounded-full',
              isValidTokenName && 'animate animate-pulse'
            )}
          ></div>
        )}
        <A
          href={
            !marketSpecifics || !tokenName
              ? ''
              : marketSpecifics.getTokenURL(tokenName)
          }
        >
          <div
            className={classNames(
              'relative rounded-full w-12 h-12 ml-3',
              (isTokenIconURLLoading || !isValidTokenName) && 'hidden'
            )}
          >
            <Image
              className="rounded-full"
              src={tokenIconURL}
              alt=""
              layout="fill"
              objectFit="cover"
            />
          </div>
        </A>
      </div>
      {errorMessage !== '' && (
        <div className="text-red-400 text-center">{errorMessage}</div>
      )}
      <div className="flex items-center justify-center mt-2 text-sm">
        <input
          type="checkbox"
          id="buyCheckbox"
          disabled={
            selectedMarket === undefined ||
            !isValidTokenName ||
            tokenName === '' ||
            txManager.isPending
          }
          checked={isWantBuyChecked}
          onChange={(e) => {
            setIsWantBuyChecked(e.target.checked)
          }}
        />
        <label
          htmlFor="buyCheckbox"
          className={classNames(
            'ml-2',
            isWantBuyChecked
              ? 'text-brand-blue font-medium dark:text-blue-400'
              : 'text-brand-gray-2 dark:text-gray-300'
          )}
        >
          I want to immediately buy this token
        </label>
      </div>
      <div className="relative mt-2.5">
        <hr className="my-1" />
        <TradeInterface
          market={selectedMarket}
          newIdeaToken={{
            symbol: tokenName !== '' && marketSpecifics ? tokenName : '',
            logoURL:
              selectedMarket &&
              marketSpecifics &&
              !isTokenIconURLLoading &&
              tokenIconURL,
          }}
          ideaToken={undefined}
          onTradeComplete={onTradeComplete}
          onValuesChanged={onTradeInterfaceValuesChanged}
          resetOn={false}
          centerTypeSelection={false}
          showTypeSelection={false}
          showTradeButton={false}
          disabled={txManager.isPending}
          unlockText={'for listing'}
          parentComponent="ListTokenModal"
        />
        {!isWantBuyChecked && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-600 opacity-75"></div>
        )}
      </div>

      <div className="max-w-sm mx-auto my-4">
        <div className="">
          <div className="">
            <ApproveButton
              tokenAddress={buyPayWithAddress}
              tokenName={buyPayWithSymbol}
              spenderAddress={multiActionContractAddress}
              requiredAllowance={
                isWantBuyChecked ? buyInputAmountBN : new BN('0')
              }
              unlockPermanent={isUnlockPermanentChecked}
              txManager={txManager}
              setIsMissingAllowance={setIsMissingAllowance}
              disable={isApproveButtonDisabled}
              txType="spend"
            />
          </div>
          <div className="mt-4 ">
            <button
              className={classNames(
                'py-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
                isTradeButtonDisabled
                  ? 'text-brand-gray-2 bg-brand-gray dark:bg-gray-500 dark:border-gray-500 dark:text-gray-300 cursor-default border-brand-gray'
                  : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
              )}
              disabled={isTradeButtonDisabled}
              onClick={listClicked}
            >
              {isWantBuyChecked ? 'List & Buy' : 'List'}
            </button>
          </div>
        </div>
      </div>
      <TxPending txManager={txManager} />
    </Modal>
  )
}
