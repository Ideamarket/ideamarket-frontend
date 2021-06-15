import classNames from 'classnames'
import { useEffect, useState } from 'react'
import {
  listToken,
  listAndBuyToken,
  verifyTokenName,
  useTokenIconURL,
} from 'actions'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { useTransactionManager } from 'utils'
import { NETWORK } from 'store/networks'
import { Modal, MarketSelect, TradeInterface } from './'
import ApproveButton from './trade/ApproveButton'
import { useContractStore } from 'store/contractStore'
import BN from 'bn.js'
import CircleSpinner from './animations/CircleSpinner'
import A from './A'

export default function ListTokenModal({ close }: { close: () => void }) {
  const PAGES = {
    LIST: 0,
    SUCCESS: 1,
    ERROR: 2,
  }

  const [page, setPage] = useState(PAGES.LIST)
  const [selectedMarket, setSelectedMarket] = useState(undefined)

  const txManager = useTransactionManager()

  const [tokenName, setTokenName] = useState('')
  const [isValidTokenName, setIsValidTokenName] = useState(false)
  const [isTokenIconLoading, setIsTokenIconLoading] = useState(true)

  const [isWantBuyChecked, setIsWantBuyChecked] = useState(false)
  const [buyPayWithAddress, setBuyPayWithAddress] = useState(undefined)
  const [buyPayWithSymbol, setBuyPayWithSymbol] = useState(undefined)
  const [buyInputAmountBN, setBuyInputAmountBN] = useState(undefined)
  const [buyOutputAmountBN, setBuyOutputAmountBN] = useState(undefined)
  const [buySlippage, setBuySlippage] = useState(undefined)
  const [buyLock, setBuyLock] = useState(false)
  const [isBuyValid, setIsBuyValid] = useState(false)

  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] =
    useState(false)

  const [isMissingAllowance, setIsMissingAllowance] = useState(false)
  const [approveButtonKey, setApproveButtonKey] = useState(0)

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
    tokenName: marketSpecifics?.convertUserInputToTokenName(tokenName),
  })

  const tweetTemplate = encodeURIComponent(
    `Just listed ${marketSpecifics?.convertUserInputToTokenName(
      tokenName
    )} on @IdeaMarkets_`
  )

  async function tokenNameInputChanged(val) {
    setIsTokenIconLoading(true)

    const normalized = marketSpecifics.normalizeUserInputTokenName(val)
    setTokenName(normalized)

    const finalTokenName = getMarketSpecificsByMarketName(
      selectedMarket.name
    ).convertUserInputToTokenName(normalized)
    setIsValidTokenName(
      await verifyTokenName(finalTokenName, selectedMarket.marketID)
    )
  }

  function onTradeInterfaceValuesChanged(
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenSymbol: string,
    tokenAmount: BN,
    slippage: number,
    lock: boolean,
    isUnlockOnceChecked: boolean,
    isUnlockPermanentChecked: boolean,
    isValid: boolean
  ) {
    setBuyInputAmountBN(tokenAmount)
    setBuyPayWithAddress(tokenAddress)
    setBuyPayWithSymbol(tokenSymbol)
    setBuyOutputAmountBN(ideaTokenAmount)
    setBuySlippage(slippage)
    setBuyLock(lock)
    setIsUnlockPermanentChecked(isUnlockPermanentChecked)
    setIsBuyValid(isValid)
  }

  async function listClicked() {
    const finalTokenName = getMarketSpecificsByMarketName(
      selectedMarket.name
    ).convertUserInputToTokenName(tokenName)

    if (isWantBuyChecked) {
      try {
        await txManager.executeTx(
          'List and buy',
          listAndBuyToken,
          finalTokenName,
          selectedMarket,
          buyPayWithAddress,
          buyOutputAmountBN,
          buyInputAmountBN,
          buySlippage,
          buyLock ? 31556952 : 0
        )
      } catch (ex) {
        console.log(ex)
        setPage(PAGES.ERROR)
        return
      }

      setPage(PAGES.SUCCESS)
    } else {
      try {
        await txManager.executeTx(
          'List Token',
          listToken,
          finalTokenName,
          selectedMarket.marketID
        )
      } catch (ex) {
        console.log(ex)
        setPage(PAGES.ERROR)
        return
      }
      setPage(PAGES.SUCCESS)
    }
  }

  useEffect(() => {
    setSelectedMarket(undefined)
    setIsValidTokenName(false)
    setTokenName('')
    setIsWantBuyChecked(false)
    setBuyLock(false)
    setPage(PAGES.LIST)
  }, [])

  return (
    <Modal close={() => close()}>
      <div className="p-4 bg-top-mobile md:min-w-100">
        <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
          Add Listing
        </p>
      </div>
      {page === PAGES.LIST && (
        <>
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
            <div className="text-base text-brand-gray-2 text-semibold">
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
                  'w-12 md:w-full flex-grow py-2 pl-1 pr-4 leading-tight bg-gray-200 dark:bg-gray-600 border-2 dark:border-gray-500 rounded appearance-none focus:bg-white focus:outline-none',
                  !isValidTokenName && tokenName.length > 0
                    ? 'border-brand-red focus:border-brand-red'
                    : 'border-gray-200 focus:border-brand-blue'
                )}
                onChange={(e) => {
                  tokenNameInputChanged(e.target.value)
                }}
                value={tokenName}
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
            {(isTokenIconLoading || !isValidTokenName) && (
              <div
                className={classNames(
                  'inline-block w-12 h-12 ml-3 align-middle bg-gray-400 rounded-full',
                  isValidTokenName && 'animate animate-pulse'
                )}
              ></div>
            )}
            <A
              href={
                !marketSpecifics
                  ? ''
                  : marketSpecifics.getTokenURL(
                      marketSpecifics.convertUserInputToTokenName(tokenName)
                    )
              }
            >
              <img
                className={classNames(
                  'rounded-full max-w-12 max-h-12 ml-3 inline-block',
                  (isTokenIconLoading ||
                    isTokenIconURLLoading ||
                    !isValidTokenName) &&
                    'hidden'
                )}
                onLoad={() => setIsTokenIconLoading(false)}
                src={selectedMarket && marketSpecifics && tokenIconURL}
                alt=""
              />
            </A>
          </div>
          <div className="flex items-center justify-center mt-5 text-sm">
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
                symbol:
                  tokenName !== '' && marketSpecifics
                    ? marketSpecifics.convertUserInputToTokenName(tokenName)
                    : '',
                logoURL:
                  selectedMarket &&
                  marketSpecifics &&
                  !isTokenIconLoading &&
                  tokenIconURL,
              }}
              ideaToken={undefined}
              onTradeSuccessful={() => {}}
              onValuesChanged={onTradeInterfaceValuesChanged}
              resetOn={false}
              centerTypeSelection={false}
              showTypeSelection={false}
              showTradeButton={false}
              disabled={txManager.isPending}
              unlockText={'for listing'}
            />
            {!isWantBuyChecked && (
              <div className="absolute top-0 left-0 w-full h-full bg-gray-600 opacity-75"></div>
            )}
          </div>

          <div className="max-w-sm mx-auto mt-2">
            <div className="">
              <div className="">
                <ApproveButton
                  tokenAddress={buyPayWithAddress}
                  tokenSymbol={buyPayWithSymbol}
                  spenderAddress={multiActionContractAddress}
                  requiredAllowance={
                    isWantBuyChecked ? buyInputAmountBN : new BN('0')
                  }
                  unlockPermanent={isUnlockPermanentChecked}
                  txManager={txManager}
                  setIsMissingAllowance={setIsMissingAllowance}
                  disable={
                    selectedMarket === undefined ||
                    !isMissingAllowance ||
                    !isValidTokenName ||
                    txManager.isPending ||
                    (isWantBuyChecked && !isBuyValid)
                  }
                  key={approveButtonKey}
                />
              </div>
              <div className="mt-4 ">
                <button
                  className={classNames(
                    'py-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
                    selectedMarket === undefined ||
                      !isValidTokenName ||
                      txManager.isPending ||
                      (isWantBuyChecked && (isMissingAllowance || !isBuyValid))
                      ? 'text-brand-gray-2 bg-brand-gray dark:bg-gray-500 dark:border-gray-500 dark:text-gray-300 cursor-default border-brand-gray'
                      : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
                  )}
                  disabled={
                    selectedMarket === undefined ||
                    !isValidTokenName ||
                    txManager.isPending ||
                    (isWantBuyChecked && (isMissingAllowance || !isBuyValid))
                  }
                  onClick={listClicked}
                >
                  {isWantBuyChecked ? 'List & Buy' : 'List'}
                </button>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              'grid grid-cols-3 my-5 text-sm text-brand-gray-2',
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
              >
                {txManager.hash.slice(0, 8)}...{txManager.hash.slice(-6)}
              </A>
            </div>
            <div className="justify-self-center">
              <CircleSpinner color="#0857e0" />
            </div>
          </div>
        </>
      )}
      {page === PAGES.SUCCESS && (
        <div className="px-2.5 py-5">
          <div className="flex justify-center text-4xl">🎉</div>
          <div className="flex justify-center mt-2 text-3xl text-brand-green">
            Success!
          </div>
          <div className="flex justify-center mt-10">
            <A
              className="twitter-share-button"
              href={`https://twitter.com/intent/tweet?text=${tweetTemplate}&url=https://ideamarket.io`}
            >
              <button className="w-32 h-10 text-base font-medium bg-white dark:text-gray-50 inborder-2 dark:bg-gray-500 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue">
                Tweet about it
              </button>
            </A>
          </div>
          <div></div>
        </div>
      )}
      {page === PAGES.ERROR && (
        <div className="px-2.5 py-5">
          <div className="flex justify-center mt-2 text-3xl text-brand-red dark:text-red-500">
            Something went wrong
          </div>
          <div className="mt-5 text-base break-all text-brand-gray-2 dark:text-gray-300">
            The transaction failed to execute.
          </div>
        </div>
      )}
    </Modal>
  )
}
