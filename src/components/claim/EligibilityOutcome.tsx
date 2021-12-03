import TadaIcon from '../../assets/tada.svg'
import OhnoIcon from '../../assets/ohno.svg'

import React, { useCallback } from 'react'
import Link from 'next/link'
import { useWeb3React } from '@web3-react/core'

import useClaimable from 'actions/useClaimable'
import claimIMO from 'actions/claimIMO'
import { isAddressInMerkleRoot } from 'utils/merkleRoot'
import {
  formatNumberWithCommasAsThousandsSerperator,
  useTransactionManager,
} from 'utils'

import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'
import ModalService from 'components/modals/ModalService'

interface Props {
  setClaimStep: (any) => void
}

const EligibilityOutcome: React.FC<Props> = ({ setClaimStep }) => {
  const txManager = useTransactionManager()
  const { account } = useWeb3React()
  const claimableIMO: number = useClaimable(account)
  const alreadyClaimed: boolean = isAddressInMerkleRoot(account)

  const breakdownOfClaims = [
    { text: 'Listing an Account', amount: 200 },
    { text: 'Buying Tokens for an Account', amount: 100 },
    { text: 'Locking Tokens', amount: 200 },
    { text: 'Verifying an Account', amount: 1000 },
  ]

  const onTradeComplete = (
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES,
    marketName: string
  ) => {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      transactionType,
      marketName,
    })
  }

  const onClaimButtonClick = async () => {
    try {
      await txManager.executeTx('claim', claimIMO, account)
    } catch (error) {
      console.log(error)
      onTradeComplete(false, 'IMO', TRANSACTION_TYPES.NONE, 'no-market')
      return
    }

    onTradeComplete(true, 'IMO', TRANSACTION_TYPES.CLAIM, 'no-market')
    setClaimStep((c) => c + 1)
  }
  const onChangeWallet = useCallback(() => {
    setClaimStep(0)
  }, [setClaimStep])

  return (
    <div className="flex flex-col flex-grow items-start justify-between p-8 rounded-lg md:p-16 md:pb-32 md:flex-row dark:bg-gray-500">
      {claimableIMO ? (
        // claimable
        <div className="flex">
          <div className="mb-8 md:mb-0 mr-0 md:mr-4">
            <div className="my-6 text-3xl font-extrabold">
              <span className="opacity-75 font-gilroy-bold">
                Woohoo, You are eligible!
              </span>
              <TadaIcon className="h-full inline ml-2" />
            </div>
            <div className="my-6 text-5xl font-extrabold font-gilroy-bold opacity-75">
              Claim your{' '}
              <span className="bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent">
                {formatNumberWithCommasAsThousandsSerperator(claimableIMO)}
              </span>{' '}
              $IMO
            </div>
            <div className="my-12 text-base font-light opacity-75">
              Because of your engagement with the Ideamarket platform, you are
              entitled to some $IMO.
            </div>
            <button
              onClick={onClaimButtonClick}
              className="bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold py-4 px-24 rounded-xl hidden md:flex flex-col items-center"
            >
              <div className="text-xs font-thin">
                Ready? <br />
              </div>
              Claim tokens
            </button>
          </div>
        </div>
      ) : !alreadyClaimed ? (
        // not eligible
        <div className="flex">
          <div className="mb-8 md:mb-0 mr-0 md:mr-4">
            <div className="my-6 text-3xl font-extrabold font-gilroy-bold opacity-75">
              <span>Oh No!</span>
              <OhnoIcon className="h-full inline ml-2" />
            </div>
            <div className="my-6 text-5xl font-extrabold font-gilroy-bold opacity-75">
              You are <span className="text-red-700">NOT</span> eligible for an
              airdrop!
            </div>
            <div className="my-10 text-base font-light opacity-75">
              Kindly make sure you have to correct wallet connected.
            </div>
            <div className="my-6 text-base font-light text-blue-500">
              {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </div>
            <button
              onClick={onChangeWallet}
              className="bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold py-5 px-16 rounded-xl items-center w-full md:w-max cursor-pointer uppercase"
            >
              Change wallet
            </button>
          </div>
        </div>
      ) : (
        // already claimed
        <div className="flex max-w-md">
          <div className="mb-8 md:mb-0 mr-0 md:mr-4">
            <div className="my-6 text-5xl font-extrabold font-gilroy-bold opacity-75">
              Looks like you already claimed your tokens!
            </div>
            <div className="my-12 text-base font-light opacity-75">
              Because of your engagement with the Ideamarket platform, you were
              entitled to some $IMO.
            </div>
            <div className="my-6 text-base font-light text-blue-500">
              {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </div>
            <Link href="/stake">
              <a className="hidden md:flex w-full md:w-max items-center text-sm bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold py-4 px-6 rounded-lg uppercase">
                <span className="pr-4">Earn more by staking</span>
                <span className="cursor-pointer border-white w-2 h-2 transform rotate-45 border-r border-t ml-auto"></span>
              </a>
            </Link>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center justify-center h-full w-full md:w-max">
        {Boolean(claimableIMO || alreadyClaimed) && (
          <div className="flex flex-col mx-auto">
            <span className="text-gray-400 opacity-70 text-left text-base mb-4">
              Here’s a breakdown of your claim...
            </span>
            {breakdownOfClaims.map((data, id) => (
              <div
                key={id}
                className="bg-gray-200 border-2 bg-opacity-50 py-5 px-6 rounded-2xl flex justify-between my-2 w-full"
                role="alert"
              >
                <span className="w-max mr-2 opacity-70">{data.text}</span>
                <span className="bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent">
                  {data.amount}
                </span>
              </div>
            ))}
          </div>
        )}
        {Boolean(claimableIMO) ? (
          <button
            onClick={onClaimButtonClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl flex md:hidden flex-col items-center w-full mt-6"
          >
            <div className="text-xs font-thin">
              Ready? <br />
            </div>
            Claim tokens
          </button>
        ) : (
          alreadyClaimed && (
            <Link href="/stake">
              <a className="flex md:hidden w-full md:w-max items-center text-sm bg-gradient-to-r from-brand-blue-1 to-brand-blue-2 text-white font-bold py-4 px-6 rounded-lg uppercase my-8">
                <span className="pr-4">Earn more by staking</span>
                <span className="cursor-pointer border-white w-2 h-2 transform rotate-45 border-r border-t ml-auto"></span>
              </a>
            </Link>
          )
        )}
      </div>
    </div>
  )
}

export default EligibilityOutcome
