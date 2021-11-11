import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { Modal } from 'components'
import A from 'components/A'
import Wrong from '../../assets/SomethingWentWrong.svg'
import TwitterCircleIcon from '../../assets/TwitterCircleIcon.svg'

export enum TRANSACTION_TYPES {
  NONE,
  BUY,
  SELL,
  LOCK,
  LIST,
  GIFT,
  STAKE,
  UNSTAKE,
}

const tweetableTypes = [
  TRANSACTION_TYPES.LIST,
  TRANSACTION_TYPES.BUY,
  TRANSACTION_TYPES.LOCK,
  TRANSACTION_TYPES.GIFT,
]

function getTweetTemplate(
  transactionType: TRANSACTION_TYPES,
  tokenName: string
) {
  let tweetText = ''

  if (transactionType === TRANSACTION_TYPES.LIST) {
    tweetText = `Just listed ${tokenName} on @ideamarket_io `
  } else if (transactionType === TRANSACTION_TYPES.BUY) {
    tweetText = `Just bought ${tokenName} on @ideamarket_io`
  } else if (transactionType === TRANSACTION_TYPES.LOCK) {
    tweetText = `Just locked ${tokenName} for 1 year on @ideamarket_io`
  } else if (transactionType === TRANSACTION_TYPES.GIFT) {
    tweetText = `Just gifted ${tokenName} on @ideamarket_io`
  }

  return encodeURIComponent(tweetText)
}

export default function TradeCompleteModal({
  close,
  isSuccess,
  tokenName,
  marketName,
  transactionType,
}: {
  close: () => void
  isSuccess: boolean
  tokenName: string
  marketName: string
  transactionType: TRANSACTION_TYPES
}) {
  const tweetTemplate = getTweetTemplate(transactionType, tokenName)

  const canTweet = tweetableTypes.includes(transactionType)

  const bgImageURL = isSuccess ? '/txSuccess.png' : '/txFail.png'

  return (
    <Modal className="bg-transparent" close={close}>
      <div
        className="relative w-full md:w-120 px-2.5 py-5 flex flex-col justify-center items-center"
        style={{
          backgroundImage: `url("${bgImageURL}"), linear-gradient(180deg, #011032 0%, #02194D 100%)`,
          backgroundSize: 'cover',
          height: '300px',
        }}
      >
        {isSuccess ? (
          <>
            <div className="flex justify-center text-3xl text-white text-center font-gilroy-bold">
              Transaction
              <br />
              Successful!
            </div>
            {canTweet && (
              <div className="flex justify-center mt-10">
                <A
                  className="twitter-share-button"
                  href={`https://twitter.com/intent/tweet?text=${tweetTemplate}&url=https://ideamarket.io/i/${marketName.toLowerCase()}/${tokenName.replace(
                    '@',
                    ''
                  )}`}
                >
                  <button
                    className="w-32 h-10 text-white rounded-2xl flex justify-center items-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(100px)',
                    }}
                  >
                    Share
                    <TwitterCircleIcon className="w-5 h-5 ml-2" />
                  </button>
                </A>
              </div>
            )}
          </>
        ) : (
          <>
            <Wrong
              style={{
                width: '19rem',
                height: '16rem',
                position: 'absolute',
                top: 0,
              }}
            />
            <div
              className="mt-48 px-4 py-2 text-white rounded-2xl flex justify-center items-center"
              style={{
                background: 'rgba(199, 43, 67, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(100px)',
              }}
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-700 mr-2" />
              Transaction Failed to execute
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
