import classNames from 'classnames'
import { useState } from 'react'
import {
  listToken,
  listAndBuyToken,
  verifyTokenName,
  getTokenAllowance,
  approveToken,
} from 'actions'
import { getMarketSpecificsByMarketName } from 'store/markets/marketSpecifics'
import { addresses, NETWORK } from 'utils'
import { Modal, MarketSelect, TradeInterface } from './'
import { useContractStore } from 'store/contractStore'
import BN from 'bn.js'

export default function ListTokenModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (b: boolean) => void
}) {
  const [selectedMarket, setSelectedMarket] = useState(undefined)

  const [pendingTxName, setPendingTxName] = useState('')
  const [pendingTxHash, setPendingTxHash] = useState('')
  const [isTxPending, setIsTxPending] = useState(false)

  const [tokenName, setTokenName] = useState('')
  const [isValidTokenName, setIsValidTokenName] = useState(false)

  const [isWantBuyChecked, setIsWantBuyChecked] = useState(false)
  const [buyPayWithAddress, setBuyPayWithAddress] = useState(undefined)
  const [buyInputAmountBN, setBuyInputAmountBN] = useState(undefined)
  const [buyOutputAmountBN, setBuyOutputAmountBN] = useState(undefined)
  const [buySlippage, setBuySlippage] = useState(undefined)
  const [buyLock, setBuyLock] = useState(false)
  const [isBuyValid, setIsBuyValid] = useState(false)

  async function tokenNameInputChanged(val) {
    setTokenName(val)
    const finalTokenName = getMarketSpecificsByMarketName(
      selectedMarket.name
    ).convertUserInputToTokenName(val)
    setIsValidTokenName(
      await verifyTokenName(finalTokenName, selectedMarket.marketID)
    )
  }

  function onTradeInterfaceValuesChanged(
    ideaTokenAmount: BN,
    tokenAddress: string,
    tokenAmount: BN,
    slippage: number,
    lock: boolean,
    isValid: boolean
  ) {
    setBuyInputAmountBN(tokenAmount)
    setBuyPayWithAddress(tokenAddress)
    setBuyOutputAmountBN(ideaTokenAmount)
    setBuySlippage(slippage)
    setBuyLock(lock)
    setIsBuyValid(isValid)
  }

  async function listClicked() {
    const finalTokenName = getMarketSpecificsByMarketName(
      selectedMarket.name
    ).convertUserInputToTokenName(tokenName)

    if (isWantBuyChecked) {
      if (buyPayWithAddress !== addresses.ZERO) {
        const spender = useContractStore.getState().multiActionContract.options
          .address
        const allowance = await getTokenAllowance(buyPayWithAddress, spender)
        if (allowance.lt(buyInputAmountBN)) {
          setPendingTxName('Approve')
          setIsTxPending(true)
          try {
            await approveToken(buyPayWithAddress, spender, buyInputAmountBN).on(
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
      }

      setPendingTxName('List and buy')
      setIsTxPending(true)
      try {
        await listAndBuyToken(
          finalTokenName,
          selectedMarket,
          buyPayWithAddress,
          buyOutputAmountBN,
          buyInputAmountBN,
          buySlippage,
          buyLock
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
    } else {
      setIsTxPending(true)
      setPendingTxName('List Token')
      try {
        await listToken(finalTokenName, selectedMarket.marketID).on(
          'transactionHash',
          (hash) => {
            setPendingTxHash(hash)
          }
        )
      } catch (ex) {
        console.log(ex)
        return
      } finally {
        setPendingTxHash('')
        setIsTxPending(false)
      }
    }

    setIsOpen(false)
  }

  if (!isOpen) {
    return <></>
  }

  return (
    <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
      <div className="p-4 bg-top-mobile min-w-100">
        <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
          List Token
        </p>
      </div>
      <p className="mx-5 mt-5 text-sm text-brand-gray-2">Market</p>
      <div className="mx-5">
        <MarketSelect
          disabled={isTxPending}
          onChange={(value) => {
            setSelectedMarket(value.market)
          }}
        />
      </div>
      <p className="mx-5 mt-5 text-sm text-brand-gray-2">Token Name</p>
      <div className="flex items-center mx-5">
        <div className="text-base text-brand-gray-2 text-semibold">@</div>
        <div className="flex-grow ml-0.5">
          <input
            type="text"
            disabled={isTxPending || !selectedMarket}
            className={classNames(
              'w-full py-2 pl-1 pr-4 leading-tight bg-gray-200 border-2 rounded appearance-none focus:bg-white focus:outline-none',
              !isValidTokenName && tokenName.length > 0
                ? 'border-brand-red focus:border-brand-red'
                : 'border-gray-200 focus:border-brand-blue'
            )}
            onChange={(e) => {
              tokenNameInputChanged(e.target.value)
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-5 text-sm">
        <input
          type="checkbox"
          id="buyCheckbox"
          disabled={
            selectedMarket === undefined ||
            !isValidTokenName ||
            tokenName === '' ||
            isTxPending
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
              ? 'text-brand-blue font-medium'
              : 'text-brand-gray-2'
          )}
        >
          I want to immediately buy this token
        </label>
      </div>
      <div className="relative mt-2.5">
        <hr className="my-1" />
        <TradeInterface
          market={selectedMarket}
          ideaToken={undefined}
          onTradeSuccessful={() => {}}
          onValuesChanged={onTradeInterfaceValuesChanged}
          resetOn={false}
          showTypeSelection={false}
          showTradeButton={false}
          disabled={isTxPending}
        />
        {!isWantBuyChecked && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-600 opacity-75"></div>
        )}
      </div>
      <div className="flex justify-center mb-5">
        <button
          disabled={
            !isValidTokenName ||
            isTxPending ||
            (isWantBuyChecked && !isBuyValid)
          }
          onClick={listClicked}
          className={classNames(
            'w-36 h-10 mt-5 text-base font-medium bg-white border-2 rounded-lg  text-brand-blue  tracking-tightest-2 font-sf-compact-medium',
            selectedMarket !== undefined &&
              isValidTokenName &&
              !isTxPending &&
              (!isWantBuyChecked || (isWantBuyChecked && isBuyValid))
              ? 'border-brand-blue hover:bg-brand-blue hover:text-white'
              : 'border-brand-gray-2 text-brand-gray-2 cursor-not-allowed'
          )}
        >
          {isWantBuyChecked ? 'List and buy Token' : 'List Token'}
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
    </Modal>
  )
}
