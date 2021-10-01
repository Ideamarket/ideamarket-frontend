import { useState, useEffect } from 'react'
import classNames from 'classnames'
import { Modal, CircleSpinner } from '../'
import ModalService from '../modals/ModalService'
import WalletModal from '../wallet/WalletModal'
import { useWeb3React } from '@web3-react/core'
import { useMutation } from 'react-query'
import { SignedAddress } from 'types/customTypes'

const STATE = {
  OWNER_ADDRESS: 0,
  SHOW_SHA: 1,
  SUCCESS: 2,
  ERROR: 3,
}

type Props = {
  close: () => void
  submitWallet: (signedAddress: SignedAddress) => void
}

export default function AddWalletModal({ close, submitWallet }: Props) {
  const { library, account } = useWeb3React()

  const [verificationState, setVerificationState] = useState(
    STATE.OWNER_ADDRESS
  )

  const [walletVerificationRequest] = useMutation<{
    message: string
    data: any
  }>(() =>
    fetch('/api/walletVerificationRequest', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok) {
        const response = await res.json()
        throw new Error(response.message)
      }
      return res.json()
    })
  )

  const [uuid, setUUID] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function openWalletModal() {
    ModalService.open(WalletModal)
  }

  async function verificationSubmitted() {
    setIsLoading(true)
    try {
      const signature = await library?.eth?.personal?.sign(uuid, account, '')
      const signedAddress: SignedAddress = {
        message: uuid,
        signature,
      }
      submitWallet(signedAddress)
    } catch (ex) {
      setErrorMessage(ex)
      setVerificationState(STATE.ERROR)
    }

    setVerificationState(STATE.SUCCESS)
    setIsLoading(false)
  }

  useEffect(() => {
    const sendVerificationRequest = async () => {
      const { data } = await walletVerificationRequest()
      setUUID(data?.uuid)
    }

    setVerificationState(STATE.OWNER_ADDRESS)
    try {
      sendVerificationRequest()
    } catch (ex) {
      setErrorMessage(ex)
      setVerificationState(STATE.ERROR)
    }
    setIsLoading(false)
    setErrorMessage('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STATE.OWNER_ADDRESS])

  return (
    <Modal close={close}>
      <div className="md:min-w-150 md:max-w-150">
        <div className="p-4 bg-top-mobile ">
          <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
            Add Wallet
          </p>
        </div>
        <div className="p-5 text-brand-gray-2 dark:text-gray-300">
          {verificationState === STATE.OWNER_ADDRESS && (
            <>
              <p className="text-sm text-center">
                In order to add the connected address, you need to verify
                ownership.
              </p>
              <div className="my-5 p-5 border border-brand-gray-2 bg-gray-200 rounded text-black text-center">
                Ideamarket - Prove Ownership: {uuid}
              </div>
              <div className="flex flex-col items-center justify-center mt-1 md:flex-row md:mx-2">
                <button
                  className="mt-2 md:mt-0 md:ml-2.5 w-32 h-10 text-sm text-brand-blue bg-white border border-brand-blue rounded-lg hover:bg-brand-blue hover:text-white"
                  disabled={isLoading}
                  onClick={() => {
                    account !== undefined && account !== ''
                      ? verificationSubmitted()
                      : openWalletModal()
                  }}
                >
                  Verify
                </button>
              </div>
            </>
          )}
          {verificationState === STATE.SHOW_SHA && (
            <>
              <div className="flex justify-center">
                <button
                  className={classNames(
                    'mt-2 w-32 h-10 text-base border-2 rounded-lg',
                    isLoading
                      ? 'border-brand-blue'
                      : true
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
          {verificationState === STATE.SUCCESS && <div>Success!</div>}
          {verificationState === STATE.ERROR && (
            <>
              <div className="text-2xl text-center text-brand-red">
                <strong>Something went wrong</strong>
              </div>
              <p className="mt-5 text-center">{errorMessage}</p>
              <div className="flex justify-center mt-10">
                <button
                  className="w-32 h-10 text-base bg-white border-2 rounded-lg hover:bg-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium text-brand-blue border-brand-blue"
                  onClick={() => close()}
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
