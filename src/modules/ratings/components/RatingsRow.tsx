// import { WatchingStar } from 'components'
import { IdeaToken } from 'store/ideaMarketsStore'
import {
  formatNumberWithCommasAsThousandsSerperator,
  formatNumberInt,
} from 'utils'
import { useQuery } from 'react-query'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { ChatIcon } from '@heroicons/react/outline'
// import { getTimeDifferenceIndays } from 'lib/utils/dateUtil'
// import { convertAccountName } from 'lib/utils/stringUtil'
// import A from 'components/A'
// import { isETHAddress } from 'utils/addresses'
import ListingContent from 'components/tokens/ListingContent'
import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import { getMarketSpecificsByMarketName } from 'store/markets'

type Props = {
  ideaToken: IdeaToken
  opinion: any
  refetch: () => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  lastElementRef?: (node) => void
}

export default function RatingsRow({
  ideaToken,
  opinion,
  refetch,
  onRateClicked,
  lastElementRef,
}: Props) {
  const marketSpecifics = getMarketSpecificsByMarketName(
    ideaToken?.market?.name
  )

  const { data: urlMetaData } = useQuery([ideaToken?.url], () =>
    getURLMetaData(ideaToken?.url)
  )

  // const { onchainListedAt, onchainListedBy } =
  //   (ideaToken || {}) as any

  // const isOnchainListedByETHAddress = isETHAddress(onchainListedBy)

  // const timeAfterOnChainListedInDays = useMemo(() => {
  //   if (!onchainListedAt) return null
  //   const onchainListedAtDate = new Date(onchainListedAt)
  //   const currentDate = new Date()
  //   return getTimeDifferenceIndays(onchainListedAtDate, currentDate)
  // }, [onchainListedAt])

  const displayName =
    urlMetaData && urlMetaData?.ogTitle
      ? urlMetaData?.ogTitle
      : marketSpecifics?.convertUserInputToTokenName(ideaToken?.url)

  return (
    <>
      {/* Desktop row */}
      <div className="hidden md:block py-6">
        <div className="flex text-black">
          {/* Icon and Name */}
          <div className="w-[40%] relative pl-6 pr-10">
            <div className="relative flex items-center w-3/4 mx-auto md:w-full text-gray-900 dark:text-gray-200">
              <div className="text-base font-medium leading-5 truncate z-30">
                {displayName && (
                  <div>
                    <a
                      href={`/i/${ideaToken?.address}`}
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
            </div>
          </div>

          {/* Rating By User */}
          <div className="w-[20%]">
            <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
              Rating By User
            </p>
            <div className="font-medium leading-5">{opinion?.rating}</div>
          </div>

          {/* Composite Rating */}
          {/* <div className="w-[12%] pt-12">
            <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
              Composite Rating
            </p>
            <div className="font-medium leading-5">
              68
            </div>
          </div> */}

          {/* Average Rating */}
          <div className="w-[20%]">
            <div className="flex flex-col justify-start font-medium leading-5">
              <span className="mb-1">
                <span className="w-10 h-8 flex justify-center items-center rounded-lg bg-blue-100 text-blue-600 dark:text-gray-300 font-extrabold text-xl">
                  {formatNumberInt(opinion?.averageRating)}
                </span>
              </span>
              <span className="text-black/[.3] text-sm">
                (
                {formatNumberWithCommasAsThousandsSerperator(
                  opinion?.latestRatingsCount
                )}
                )
              </span>
            </div>
          </div>

          {/* Market Interest */}
          {/* <div className="w-[12%] pt-12">
            <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
              Market Interest
            </p>
            <div className="flex flex-col justify-start font-medium leading-5">
              $65,900
            </div>
          </div> */}

          {/* Rate Button */}
          <div className="w-[20%]">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRateClicked(ideaToken, urlMetaData)
                }}
                className="flex justify-center items-center w-20 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
              >
                <span>Rate</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-[40%] flex flex-col">
            {/* <div className="pl-4 md:pl-0 flex flex-col items-center space-x-0 space-y-1 mt-4 text-sm items-baseline">
              {onchainListedBy && timeAfterOnChainListedInDays && (
                <div className="px-2 py-2 bg-black/[.05] rounded-lg whitespace-nowrap">
                  Listed by{' '}
                  {isOnchainListedByETHAddress ? (
                    <A
                      className="underline font-bold hover:text-blue-600"
                      href={`https://arbiscan.io/address/${onchainListedBy}`}
                    >
                      {convertAccountName(onchainListedBy)}
                    </A>
                  ) : (
                    <span className="font-bold">
                      {convertAccountName(onchainListedBy)}
                    </span>
                  )}{' '}
                  {timeAfterOnChainListedInDays} days ago
                </div>
              )}
            </div> */}

            <div className="px-6">
              <ListingContent
                ideaToken={ideaToken}
                page="HomePage"
                urlMetaData={urlMetaData}
                useMetaData={
                  getListingTypeFromIDTURL(ideaToken?.url) !==
                  LISTING_TYPE.TWEET
                }
              />
            </div>
          </div>

          {/* The user comment for this opinion */}
          {opinion && opinion?.comment && opinion?.comment.length > 0 && (
            <div className="w-[60%] mt-4">
              <div className="bg-black/[.02] rounded-lg px-4 py-2 mr-10">
                <div className="text-black/[.5] text-xs font-semibold mb-1">
                  COMMENT BY USER
                </div>
                <div className="text-black text-sm">{opinion?.comment}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile row */}
      <div className="md:hidden">
        <div className="w-full relative px-3 pt-4">
          <div className="relative flex items-center w-3/4 text-gray-900 dark:text-gray-200">
            <div className="text-base font-medium leading-5 truncate z-30">
              {displayName && (
                <div>
                  <a
                    href={`/i/${ideaToken?.address}`}
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
          </div>
        </div>

        <div className="px-3 py-4">
          <ListingContent
            ideaToken={ideaToken}
            page="MobileAccountPage"
            urlMetaData={urlMetaData}
            useMetaData={
              getListingTypeFromIDTURL(ideaToken?.url) !== LISTING_TYPE.TWEET
            }
          />
        </div>

        <div className="flex justify-between items-start text-center px-10 py-4 border-b border-t">
          <div>
            <div className="font-semibold text-black/[.5]">Average Rating</div>
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-gray-300 mr-1 font-extrabold text-xl">
                {formatNumberInt(opinion?.averageRating)}
              </span>
              <span className="text-black/[.3] text-sm">
                (
                {formatNumberWithCommasAsThousandsSerperator(
                  opinion?.latestRatingsCount
                )}
                )
              </span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-black/[.5]">Comments</div>
            <div className="flex items-center font-medium text-lg text-black">
              <ChatIcon className="w-4 mr-1" />
              {formatNumberWithCommasAsThousandsSerperator(
                opinion?.latestCommentsCount
              )}
            </div>
          </div>
        </div>

        {/* Rating and comment */}
        <div className="flex items-start p-3 m-3 bg-black/[.02] rounded-lg">
          <div className="w-10 h-8 mr-3 flex justify-center items-center rounded-lg bg-blue-100 text-blue-600 font-semibold">
            {opinion?.rating}
          </div>

          <div className="w-[85%] font-medium text-black">
            {opinion?.comment}
          </div>
        </div>

        <div className="flex justify-center items-center px-10 py-4 border-t">
          {/* <div className="">
            <WatchingStar token={token} />
          </div> */}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onRateClicked(ideaToken, urlMetaData)
            }}
            className="flex justify-center items-center w-20 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
          >
            <span>Rate</span>
          </button>
        </div>
      </div>
    </>
  )
}
