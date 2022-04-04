import { IdeaToken } from 'store/ideaMarketsStore'
import { Modal } from 'components'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, { TX_TYPES } from './TradeCompleteModal'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useState } from 'react'
import classNames from 'classnames'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  formatNumber,
  formatNumberWithCommasAsThousandsSerperator,
  useTransactionManager,
} from 'utils'
import rateIDT from 'actions/web3/rateIDT'
import TxPending from './TxPending'
import useOpinionsByIDTAddress from 'modules/ratings/hooks/useOpinionsByIDTAddress'

const CustomSlider = Slider.createSliderWithTooltip(Slider)

const sliderMarks = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  60: '60',
  70: '70',
  80: '80',
  90: '90',
  100: '100',
}

export default function RateModal({
  close,
  ideaToken,
  urlMetaData,
}: {
  close: () => void
  ideaToken: IdeaToken
  urlMetaData: any
}) {
  const txManager = useTransactionManager()

  const [inputRating, setInputRating] = useState(50)
  const [inputComment, setInputComment] = useState('')

  const { avgRating, totalOpinions } = useOpinionsByIDTAddress(
    ideaToken?.address
  )

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
    const ratingArgs = [ideaToken.address, inputRating, inputComment]

    try {
      await txManager.executeTx('Rate', rateIDT, ...ratingArgs)
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

    onTradeComplete(true, ideaToken?.listingId, ideaToken?.name, TX_TYPES.RATE)
  }

  const isRatingDisabled = inputRating === 50 || inputComment?.length > 560

  const marketSpecifics = getMarketSpecificsByMarketName(ideaToken?.marketName)

  const displayName =
    urlMetaData && urlMetaData?.ogTitle
      ? urlMetaData?.ogTitle
      : marketSpecifics?.convertUserInputToTokenName(ideaToken?.url)

  return (
    <Modal close={close}>
      <div className="w-full md:w-136 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        <div className="px-6 py-4 bg-gray-200 text-base font-medium leading-5 truncate">
          {displayName && (
            <div>
              <a
                href={`/i/${ideaToken?.listingId}`}
                onClick={(event) => event.stopPropagation()}
                className="text-xs md:text-base font-bold hover:underline"
              >
                {displayName?.substr(
                  0,
                  displayName?.length > 50 ? 50 : displayName?.length
                ) + (displayName?.length > 50 ? '...' : '')}
              </a>
            </div>
          )}
          <a
            href={ideaToken?.url}
            className="text-xs md:text-sm text-brand-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ideaToken?.url.substr(
              0,
              ideaToken?.url.length > 50 ? 50 : ideaToken?.url.length
            ) + (ideaToken?.url.length > 50 ? '...' : '')}
          </a>
        </div>

        <div className="px-6 py-4">
          <div className="font-bold text-3xl mb-7">Rate</div>
          <div className="flex justify-between items-center mx-2 mb-1">
            <span className="font-bold">Rating</span>
            <div>
              <span className="text-blue-600 font-bold mr-1">
                {formatNumber(avgRating)}
              </span>
              <span>
                ({formatNumberWithCommasAsThousandsSerperator(totalOpinions)})
              </span>
            </div>
          </div>

          <div className="px-4 py-2 border rounded-lg">
            <div className="flex justify-between items-center mb-12">
              <span className="text-black/[0.3] font-semibold">
                Your Rating
              </span>
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
                return `test ${value}`
              }}
            />
          </div>

          <div className="flex justify-between items-center mx-2 mb-1 mt-4">
            <span className="font-bold">
              Comment <span className="text-black/[.3]">(Optional)</span>
            </span>
            <span className="text-black/[.3] font-bold">
              {inputComment?.length}/560
            </span>
          </div>

          <textarea
            className="pl-2 w-full h-20 leading-tight border border-black/[.1] rounded-lg appearance-none focus:outline-none focus:bg-white dark:focus:bg-gray-700"
            onChange={(event) => {
              setInputComment(event.target.value)
            }}
          />

          <button
            className={classNames(
              'py-4 mt-4 mb-2 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
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
