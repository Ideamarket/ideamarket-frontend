import { Modal } from 'components'
import A from 'components/A'

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

  return (
    <Modal close={close}>
      <div className="md:min-w-100 px-2.5 py-5">
        {isSuccess ? (
          <>
            <div className="flex justify-center text-4xl">🎉</div>
            <div className="flex justify-center mt-2 text-3xl text-brand-green">
              Success!
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
                  <button className="w-32 h-10 text-base font-medium bg-white rounded-lg dark:text-gray-50 inborder-2 dark:bg-gray-500 border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue">
                    Tweet about it
                  </button>
                </A>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center mt-2 text-3xl text-brand-red dark:text-red-500">
              Something went wrong
            </div>
            <div className="mt-5 text-base break-all text-brand-gray-2 dark:text-gray-300">
              The transaction failed to execute.
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
