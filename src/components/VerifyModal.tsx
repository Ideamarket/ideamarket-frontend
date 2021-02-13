import { useState, useEffect, useContext } from 'react'
import classNames from 'classnames'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { SHA3 } from 'sha3'

import { GlobalContext } from '../pages/_app'
import {
  requestVerification,
  submitVerification,
  submitVerificationFee,
  submitVerificationFeeHash,
} from 'actions'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { useWalletStore } from 'store/walletStore'
import {
  isAddress,
  NETWORK,
  useTransactionManager,
  web3BNToFloatString,
} from '../utils'
import { Modal, CircleSpinner } from './'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export default function VerifyModal({
  isOpen,
  setIsOpen,
  market,
  token,
}: {
  isOpen: boolean
  setIsOpen: (b: boolean) => void
  market: IdeaMarket
  token: IdeaToken
}) {
  const PAGES = {
    OWNER_ADDRESS: 0,
    SHOW_SHA: 1,
    SHOW_FEE_TX: 2,
    AWAIT_FEE_TX: 3,
    SUCCESS: 4,
    ERROR: 5,
  }

  const [page, setPage] = useState(PAGES.OWNER_ADDRESS)

  const connectedAddress = useWalletStore((state) => state.address)
  const [ownerAddress, setOwnerAddress] = useState('')
  const isValidOwnerAddress = isAddress(ownerAddress)

  const { setIsWalletModalOpen, setOnWalletConnectedCallback } = useContext(
    GlobalContext
  )

  const [uuid, setUUID] = useState('')
  const sha = new SHA3(256).update(uuid).digest('hex').toString().substr(0, 12)
  const [tx, setTx] = useState('')
  const [weiFee, setWeiFee] = useState('0')
  const [feeTo, setFeeTo] = useState('')
  const txManager = useTransactionManager()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const marketVerificationExplanation = marketSpecifics.getVerificationExplanation()
  const shaPromptExplanation = marketSpecifics.getVerificationSHAPromptExplanation()
  const shaPrompt = marketSpecifics.getVerificationSHAPrompt(sha)
  const confirmCheckboxText = marketSpecifics.getVerificationConfirmCheckboxLabel()

  const [confirmCheckboxChecked, setConfirmCheckboxChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function openWalletModal() {
    setOnWalletConnectedCallback(() => () => {
      const addr = useWalletStore.getState().address
      setOwnerAddress(addr)
    })
    setIsWalletModalOpen(true)
  }

  async function initiateVerification() {
    setIsLoading(true)
    try {
      setUUID(await requestVerification(token, ownerAddress))
      setPage(PAGES.SHOW_SHA)
    } catch (ex) {
      setErrorMessage(ex)
      setPage(PAGES.ERROR)
    }

    setIsLoading(false)
  }

  async function verificationSubmitted() {
    setIsLoading(true)
    let response: {
      wantFee: boolean
      weiFee?: string
      to?: string
      tx?: string
    }
    try {
      response = await submitVerification(uuid)
    } catch (ex) {
      setErrorMessage(ex)
      setPage(PAGES.ERROR)
    }

    if (response.wantFee) {
      setWeiFee(response.weiFee)
      setFeeTo(response.to)
      setPage(PAGES.SHOW_FEE_TX)
    } else {
      setTx(response.tx)
      setPage(PAGES.SUCCESS)
    }

    setIsLoading(false)
  }

  async function submitFee() {
    setIsLoading(true)
    let hash: string
    try {
      await txManager.executeTxWithCallbacks(
        'Verification Fee',
        submitVerificationFee,
        {
          onHash: (h: string) => {
            hash = h
            setPage(PAGES.AWAIT_FEE_TX)
          },
        },
        feeTo,
        new BN(weiFee),
        sha
      )
    } catch (ex) {
      setErrorMessage('The verification fee transaction failed.')
      setPage(PAGES.ERROR)
      setIsLoading(false)
      return
    }

    try {
      setTx(await submitVerificationFeeHash(uuid, hash))
      setPage(PAGES.SUCCESS)
    } catch (ex) {
      setErrorMessage(ex)
      setPage(PAGES.ERROR)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (!isOpen) {
      setPage(PAGES.OWNER_ADDRESS)
      setOwnerAddress('')
      setUUID('')
      setConfirmCheckboxChecked(false)
      setTx('')
      setIsLoading(false)
      setErrorMessage('')
    }
  }, [isOpen])

  if (!isOpen) {
    return <></>
  }

  return (
    <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
      <div className="md:min-w-150 md:max-w-150">
        <div className="p-4 bg-top-mobile ">
          <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
            Verify: {token.name}
          </p>
        </div>
        <div className="p-5 text-brand-gray-2">
          {page === PAGES.OWNER_ADDRESS && (
            <>
              <p className="text-sm">
                If this listing represents your account you have the possibility
                to verify ownership of this listing. Ownership will allow you to
                withdraw the accumulated interest at any time.
              </p>
              <br />
              <p>{marketVerificationExplanation}</p>
              <div className="mt-10 text-lg text-center">
                <strong>Address to be listed as owner</strong>
              </div>
              <div className="flex flex-col items-center justify-center mt-1 md:flex-row md:mx-2">
                <div className="w-full md:flex-grow">
                  <input
                    className={classNames(
                      'pl-2 w-full h-10 leading-tight border-2 rounded appearance-none focus:outline-none focus:bg-white',
                      ownerAddress.length === 0
                        ? 'border-gray-200 focus:border-brand-blue bg-gray-200'
                        : isValidOwnerAddress
                        ? 'border-brand-green'
                        : 'border-brand-red'
                    )}
                    disabled={isLoading}
                    value={ownerAddress}
                    onChange={(e: any) => {
                      setOwnerAddress(e.target.value)
                    }}
                    placeholder="0x..."
                  />
                </div>
                <button
                  className="mt-2 md:mt-0 md:ml-2.5 w-32 h-10 text-sm text-brand-blue bg-white border border-brand-blue rounded-lg tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue hover:text-white"
                  disabled={isLoading}
                  onClick={() => {
                    connectedAddress !== undefined && connectedAddress !== ''
                      ? setOwnerAddress(connectedAddress)
                      : openWalletModal()
                  }}
                >
                  Use connected
                </button>
              </div>
              <div className="flex justify-center mt-10">
                <button
                  disabled={isLoading || !isValidOwnerAddress}
                  className={classNames(
                    'w-32 h-10 text-base border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium',
                    isLoading
                      ? 'border-brand-blue'
                      : isValidOwnerAddress
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white border-brand-gray-2 text-brand-gray-2 cursor-not-allowed'
                  )}
                  onClick={initiateVerification}
                >
                  {isLoading ? (
                    <div className="flex justify-center">
                      <CircleSpinner color="#0857e0" />
                    </div>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </>
          )}
          {page === PAGES.SHOW_SHA && (
            <>
              <p>{shaPromptExplanation}</p>
              <div className="mt-7.5 p-5 border border-brand-gray-2 bg-gray-200 rounded text-black">
                {shaPrompt}
              </div>
              <div className="flex items-center justify-center mt-10">
                <input
                  type="checkbox"
                  id="confirmCheckbox"
                  checked={confirmCheckboxChecked}
                  onChange={(e) => {
                    setConfirmCheckboxChecked(e.target.checked)
                  }}
                />
                <label htmlFor="confirmCheckbox" className="ml-2">
                  {confirmCheckboxText}
                </label>
              </div>
              <div className="flex justify-center">
                <button
                  disabled={isLoading || !confirmCheckboxChecked}
                  className={classNames(
                    'mt-2 w-32 h-10 text-base border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium',
                    isLoading
                      ? 'border-brand-blue'
                      : confirmCheckboxChecked
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white border-brand-gray-2 text-brand-gray-2 cursor-not-allowed'
                  )}
                  onClick={verificationSubmitted}
                >
                  {isLoading ? (
                    <div className="flex justify-center">
                      <CircleSpinner color="#0857e0" />
                    </div>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </>
          )}
          {page === PAGES.SHOW_FEE_TX && (
            <>
              <div className="text-xl text-center">
                <strong>Verification fee</strong>
              </div>
              <p className="mt-5">
                Your identity has been successfully verified and a verification
                transaction can be submitted to the blockchain. To cover the
                transaction cost for this transaction please use the button
                below to transfer{' '}
                <i>{web3BNToFloatString(new BN(weiFee), tenPow18, 5)} ETH</i> to
                the authorization service.
                <br />
                This is a one-time payment which will authorize you to withdraw
                interest for this token indefinitely.
              </p>
              <div className="flex justify-center">
                <button
                  disabled={isLoading}
                  className={classNames(
                    'mt-2 w-32 h-10 text-base border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium',
                    isLoading
                      ? 'border-brand-blue'
                      : 'bg-brand-blue text-white border-brand-blue'
                  )}
                  onClick={submitFee}
                >
                  {isLoading ? (
                    <div className="flex justify-center">
                      <CircleSpinner color="#0857e0" />
                    </div>
                  ) : (
                    'Transfer'
                  )}
                </button>
              </div>
            </>
          )}
          {page === PAGES.AWAIT_FEE_TX && (
            <>
              <div className="text-xl text-center">
                <strong>Transaction is pending</strong>
              </div>
              <div className="flex justify-center mt-5">
                <CircleSpinner color="#0857e0" />
              </div>
              <div className="mt-2 text-center">
                Please wait for transaction{' '}
                <a
                  className={classNames('underline')}
                  href={`https://${
                    NETWORK === 'rinkeby' || NETWORK === 'test'
                      ? 'rinkeby.'
                      : ''
                  }etherscan.io/tx/${txManager.hash}`}
                  target="_blank"
                >
                  {txManager.hash && txManager.hash.slice(0, 8)}...
                  {txManager.hash && txManager.hash.slice(-6)}
                </a>{' '}
                to confirm. Do not close or refresh the page.
              </div>
            </>
          )}
          {page === PAGES.SUCCESS && (
            <>
              <div className="text-2xl text-center text-brand-green">
                <strong>Verification successful</strong>
              </div>
              <p className="mt-5">
                Your ownership of this token has been successfully verified.
                <br />
                <br />A transaction to set the address you provided as owner of
                this token has been broadcast to the blockchain. After this
                transaction has been confirmed you will be able to withdraw the
                accumulated interest.
              </p>
              <div className="p-5 mt-5 text-black bg-gray-200 border rounded border-brand-gray-2">
                <a
                  className="underline"
                  href={`https://${
                    NETWORK === 'test' || NETWORK === 'rinkeby'
                      ? 'rinkeby.'
                      : ''
                  }etherscan.io/tx/${tx}`}
                  target="_blank"
                >
                  Transaction: {tx.slice(0, 8)}...{tx.slice(-6)}
                </a>
              </div>
              <div className="flex justify-center mt-10">
                <button
                  className="w-32 h-10 text-base bg-white border-2 rounded-lg hover:bg-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium text-brand-blue border-brand-blue"
                  onClick={() => {
                    setIsOpen(false)
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
          {page === PAGES.ERROR && (
            <>
              <div className="text-2xl text-center text-brand-red">
                <strong>Something went wrong</strong>
              </div>
              <p className="mt-5 text-center">{errorMessage}</p>
              <div className="flex justify-center mt-10">
                <button
                  className="w-32 h-10 text-base bg-white border-2 rounded-lg hover:bg-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium text-brand-blue border-brand-blue"
                  onClick={() => {
                    setIsOpen(false)
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
