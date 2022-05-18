import { Modal } from 'components'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, { TX_TYPES } from './TradeCompleteModal'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useContext, useState } from 'react'
import classNames from 'classnames'
import { useTransactionManager } from 'utils'
import rateIDT from 'actions/web3/rateIDT'
import TxPending from './TxPending'
import ratePost from 'actions/web3/ratePost'
import { convertAccountName } from 'lib/utils/stringUtil'
import A from 'components/A'
import { useQuery } from 'react-query'
import Image from 'next/image'
import { syncNFTOpinions } from 'actions/web2/opinions/syncNFTOpinions'
import { GlobalContext } from 'lib/GlobalContext'
import ListingContent from 'components/tokens/ListingContent'
import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import { getAccount } from 'actions/web2/user-market/apiUserActions'
import IMTextArea from 'modules/forms/components/IMTextArea'
import { ArrowCircleRightIcon } from '@heroicons/react/outline'
import TransakModal from './TransakModal'

const CustomSlider = Slider.createSliderWithTooltip(Slider)

const sliderMarks = {
  0: '0',
  100: '100',
}

export default function RateModal({
  close,
  ideaToken,
  urlMetaData,
}: {
  close: () => void
  ideaToken: any
  urlMetaData: any
}) {
  const txManager = useTransactionManager()
  const { setIsTxPending } = useContext(GlobalContext)

  const [inputRating, setInputRating] = useState(50)
  const [inputComment, setInputComment] = useState('')

  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    transactionType: TX_TYPES
  ) {
    close()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      transactionType,
    })
  }

  const onRateClicked = async () => {
    setIsTxPending(true)
    const isNFT = !ideaToken.address // If there is not a token address, then it is NFT

    try {
      const web3TxMethod = isNFT ? ratePost : rateIDT
      // tokenId , rating, comment
      const ratingArgs = [
        isNFT ? ideaToken?.tokenID : ideaToken.address,
        inputRating,
        inputComment,
      ]
      await txManager.executeTxWithCallbacks(
        'Rate',
        web3TxMethod,
        {
          onReceipt: async (receipt: any) => {
            await syncNFTOpinions(ideaToken?.tokenID)
            setIsTxPending(false)
          },
        },
        ...ratingArgs
      )
    } catch (ex) {
      console.log(ex)
      setIsTxPending(false)
      onTradeComplete(
        false,
        ideaToken?.listingId,
        ideaToken?.name,
        TX_TYPES.NONE
      )
      return
    }

    onTradeComplete(true, ideaToken?.listingId, ideaToken?.name, TX_TYPES.RATE)
  }

  const isRatingDisabled = inputRating === 50 || inputComment?.length > 10000

  const { minterAddress } = (ideaToken || {}) as any

  const { data: userDataForMinter } = useQuery<any>(
    [`minterAddress-${minterAddress}`],
    () =>
      getAccount({
        username: null,
        walletAddress: minterAddress,
      })
  )

  const displayUsernameOrWallet = convertAccountName(
    userDataForMinter?.username || minterAddress
  )
  const usernameOrWallet = userDataForMinter?.username || minterAddress

  return (
    <Modal close={close}>
      <div className="w-full md:w-136 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        <div className="px-6 py-4 bg-black/[.05] text-base font-medium leading-5 truncate">
          {/* Display minter image, username/wallet */}
          {minterAddress && (
            <div className="flex items-center pb-2 whitespace-nowrap">
              <div className="relative rounded-full w-6 h-6">
                <Image
                  className="rounded-full"
                  src={
                    userDataForMinter?.profilePhoto ||
                    '/DefaultProfilePicture.png'
                  }
                  alt=""
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <A
                className="ml-2 font-bold hover:text-blue-600"
                href={`/u/${usernameOrWallet}`}
              >
                {displayUsernameOrWallet}
              </A>
            </div>
          )}

          <ListingContent
            ideaToken={ideaToken}
            page="RateModal"
            urlMetaData={urlMetaData}
            useMetaData={
              getListingTypeFromIDTURL(ideaToken?.url) !== LISTING_TYPE.TWEET &&
              getListingTypeFromIDTURL(ideaToken?.url) !==
                LISTING_TYPE.TEXT_POST
            }
          />
        </div>

        <div className="px-6 py-4">
          <div className="flex justify-between items-center mx-2 mb-1">
            <span className="font-bold">Rating</span>
            {/* <div>
              <span className="text-blue-600 font-bold mr-1">
                {formatNumber(avgRating)}
              </span>
            </div> */}
          </div>

          <div className="px-4 py-2 border rounded-lg">
            <div className="flex justify-end items-center mb-12">
              <span className="text-xl font-bold">{inputRating}</span>
            </div>

            <CustomSlider
              className="mb-7"
              defaultValue={50}
              onChange={(value) => {
                setInputRating(value)
              }}
              marks={sliderMarks}
              step={1}
              min={0}
              max={100}
              tipFormatter={(value) => {
                return `${value}`
              }}
            />
          </div>

          <div className="flex justify-between items-center mx-2 mb-1 mt-4">
            <span className="font-bold">
              Reasoning <span className="text-black/[.3]">(Optional)</span>
            </span>
            <span className="text-black/[.3] font-bold">
              {inputComment?.length}/10,000
            </span>
          </div>

          <IMTextArea
            onChange={(newTextInput: string) => {
              setInputComment(newTextInput)
            }}
            defaultRows={3}
          />

          <div
            onClick={() => ModalService.open(TransakModal)}
            className="bg-blue-100 text-blue-600 w-full mt-2 mb-4 px-3 py-2 flex justify-between items-center rounded-lg cursor-pointer"
          >
            <span className="font-bold text-sm">
              Don't own any Arbitrum-ETH? Buy some with credit/debit
            </span>
            <ArrowCircleRightIcon className="w-5" />
          </div>

          <button
            className={classNames(
              'py-4 mb-2 text-lg font-bold rounded-2xl w-full',
              isRatingDisabled
                ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
            )}
            disabled={isRatingDisabled}
            onClick={onRateClicked}
          >
            Rate
          </button>

          <div className="text-xs text-center font-semibold">
            Confirm transaction in wallet to complete.
          </div>

          <TxPending txManager={txManager} />
        </div>
      </div>
    </Modal>
  )
}
