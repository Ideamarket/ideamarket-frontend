import { useState, useEffect, useContext } from 'react'
import classNames from 'classnames'

import { GlobalContext } from '../pages/_app'
import { requestVerification, submitVerification } from 'actions'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets/marketSpecifics'
import { useWalletStore } from 'store/walletStore'
import { isAddress, NETWORK } from '../utils'
import { Modal, CircleSpinner } from './'

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
    SHOW_UUID: 1,
    SUCCESS: 2,
    ERROR: 3,
  }

  const [page, setPage] = useState(PAGES.OWNER_ADDRESS)

  const connectedAddress = useWalletStore((state) => state.address)
  const [ownerAddress, setOwnerAddress] = useState('')
  const isValidOwnerAddress = isAddress(ownerAddress)

  const { setIsWalletModalOpen, setOnWalletConnectedCallback } = useContext(
    GlobalContext
  )

  const [uuid, setUUID] = useState('')
  const [tx, setTx] = useState('')
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const marketVerificationExplanation = marketSpecifics.getVerificationExplanation()
  const uuidPromptExplanation = marketSpecifics.getVerificationUUIDPromptExplanation()
  const uuidPrompt = marketSpecifics.getVerificationUUIDPrompt(uuid)
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
      setPage(PAGES.SHOW_UUID)
    } catch (ex) {
      setErrorMessage(ex)
      setPage(PAGES.ERROR)
    }

    setIsLoading(false)
  }

  async function submit() {
    setIsLoading(true)
    try {
      setTx(await submitVerification(token, ownerAddress, uuid))
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
              <div className="text-center mt-10 text-lg">
                <strong>Address to be listed as owner</strong>
              </div>
              <div className="flex flex-col md:flex-row md:mx-2 mt-1 items-center justify-center">
                <div className="w-full md:flex-grow">
                  <input
                    className={classNames(
                      'pl-2 w-full h-10 leading-tight bg-gray-200 border-2 rounded appearance-none focus:outline-none focus:bg-white',
                      ownerAddress.length === 0
                        ? 'border-gray-200 focus:border-brand-blue'
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
              <div className="mt-10 flex justify-center">
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
          {page === PAGES.SHOW_UUID && (
            <>
              <p>{uuidPromptExplanation}</p>
              <div className="mt-7.5 p-5 border border-brand-gray-2 bg-gray-200 rounded text-black">
                {uuidPrompt}
              </div>
              <div className="mt-10 flex justify-center items-center">
                <input
                  type="checkbox"
                  id="confirmCheckbox"
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
                  onClick={submit}
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
          {page === PAGES.SUCCESS && (
            <>
              <div className="text-center text-2xl text-brand-green">
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
              <div className="mt-5 p-5 border border-brand-gray-2 bg-gray-200 rounded text-black">
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
                  className="hover:bg-brand-blue hover:text-white w-32 h-10 text-base border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium bg-white text-brand-blue border-brand-blue"
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
              <div className="text-center text-2xl text-brand-red">
                <strong>Something went wrong</strong>
              </div>
              <p className="mt-5 text-center">{errorMessage}</p>
              <div className="flex justify-center mt-10">
                <button
                  className="hover:bg-brand-blue hover:text-white w-32 h-10 text-base border-2 rounded-lg tracking-tightest-2 font-sf-compact-medium bg-white text-brand-blue border-brand-blue"
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
