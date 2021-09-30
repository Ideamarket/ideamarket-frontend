import { A, CircleSpinner, Footer, WalletModal } from 'components'
import Image from 'next/image'
import { useState } from 'react'
import classNames from 'classnames'
import { useENSAddress } from 'components/trade/hooks/useENSAddress'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'
import claimIMO from 'actions/claimIMO'
import {
  formatNumberWithCommasAsThousandsSerperator,
  useTransactionManager,
} from 'utils'
import { NETWORK } from 'store/networks'
import { useWeb3React } from '@web3-react/core'
import useClaimable from 'actions/useClaimable'
import ModalService from 'components/modals/ModalService'

const ClaimInner = () => {
  const txManager = useTransactionManager()
  const { account } = useWeb3React()
  const [address, setAddress] = useState('')
  const [isENSAddressValid, hexAddress] = useENSAddress(address)
  const finalAddress = isENSAddressValid ? (hexAddress as string) : address
  const claimableIMO = useClaimable(finalAddress)
  const [isClaimed, setIsClaimed] = useState(false)

  const isClaimDisabled =
    !claimableIMO ||
    !isAddressInMerkleRoot(finalAddress) ||
    !account ||
    (account && account.toLowerCase() !== finalAddress.toLowerCase())

  const onAddressChange = (value: string) => {
    setAddress(value)
    setIsClaimed(false)
  }

  const onClaimButtonClick = async () => {
    if (finalAddress) {
      try {
        await txManager.executeTx('claim', claimIMO, finalAddress)
        setIsClaimed(true)
        setAddress('')
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div className="w-11/12 max-w-5xl mx-auto my-0 md:pt-24 font-inter w-90">
      <div className="flex flex-col items-end mx-4">
        <div className="invisible mb-4 text-4xl italic text-white md:visible">
          Claim
        </div>
        <div className="flex justify-between w-full mb-2 md:justify-end"></div>
      </div>
      <div className="flex flex-col items-start justify-center p-8 bg-white rounded-lg md:p-16 md:pb-32 md:flex-row dark:bg-gray-500">
        <div className="md:grid md:grid-cols-2 md:gap-8">
          <div className="mb-8 md:mb-0">
            <div className="flex-row hidden max-w-md font-extrabold md:flex">
              <div>1. Claim</div>
              <span className="inline-block w-2 ml-2 mr-2">
                <Image src="/arrow-dark.svg" height={12} width={8} alt="" />
              </span>
              <div className="opacity-50">2. Stake</div>
            </div>
            <div className="visible mb-4 text-xl md:invisible">Claim</div>

            <div className="my-6 text-4xl font-extrabold">
              Lorem ipsum dolor sit amet, consectetur
            </div>
            <div className="text-base leading-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vel
              congue nibh scelerisque cursus enim. Lectus dui interdum neque
              libero et arcu, scelerisque libero. Diam ut turpis enim amet, quis
              fermentum risus egestas dui. Viverra elementum pharetra risus elit
              montes, nisl venenatis arcu.
            </div>
          </div>
          <div>
            {account ? (
              <>
                <div className="bg-blue-100 dark:bg-gray-700 rounded-2xl min-h-56">
                  <div className="px-6 py-6 text-xs text-white uppercase bg-no-repeat bg-cover rounded-2xl bg-claim-imo-bg">
                    <div>Claim imo token</div>
                    <div className="mt-2 text-3xl font-extrabold">
                      {formatNumberWithCommasAsThousandsSerperator(
                        claimableIMO
                      )}{' '}
                      IMO
                    </div>
                  </div>
                  <div className="px-6 py-4 leading-8">
                    Enter an address to trigger a IMO claim. If the address has
                    any claimable UNI it will be sent to them on submission
                  </div>
                  <div className="px-6 py-4 font-extrabold">
                    <div className="pb-1 font-extrabold">Recipient</div>
                    <input
                      onChange={(e) => onAddressChange(e.target.value)}
                      value={address}
                      placeholder="Wallet address or ENS name"
                      className="w-full h-10 px-2 border border-gray-200 dark:border-gray-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200"
                    />
                  </div>
                  {txManager.isPending && (
                    <>
                      <div className="mt-2 text-xs text-center text-gray-500">
                        Confirm transaction in wallet to complete.
                      </div>
                      <div className="grid grid-cols-3 my-5 text-sm text-brand-new-dark font-semibold">
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
                            target="_blank"
                          >
                            {txManager.hash.slice(0, 8)}...
                            {txManager.hash.slice(-6)}
                          </A>
                        </div>
                        <div className="justify-self-center">
                          <CircleSpinner color="#0857e0" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="px-6 py-4">
                    <button
                      onClick={onClaimButtonClick}
                      disabled={isClaimDisabled}
                      className={classNames(
                        'w-full py-2 text-white rounded-lg',
                        isClaimDisabled
                          ? 'text-gray-500 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                          : 'bg-brand-blue hover:bg-blue-800 cursor-pointer'
                      )}
                    >
                      Claim IMO
                    </button>
                  </div>
                </div>

                {isClaimed && (
                  <div>
                    <div
                      className="my-4 font-bold text-center"
                      style={{ color: '#79C08D' }}
                    >
                      <span className="text-2xl">✓</span> IMO token Claimed!
                    </div>
                    <div className="text-right">
                      <button className="w-32 py-2 text-white rounded-lg bg-brand-blue hover:bg-blue-800">
                        Stake
                        <span className="inline-block w-2 ml-2 mr-2">
                          <Image
                            src="/arrow@3x.png"
                            height={12}
                            width={8}
                            alt=""
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full justify-center items-center">
                <button
                  onClick={() => {
                    ModalService.open(WalletModal)
                  }}
                  className="w-44 p-2.5 text-xl text-white border-2 rounded-lg border-brand-blue bg-brand-blue"
                >
                  Connect wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ClaimInner
