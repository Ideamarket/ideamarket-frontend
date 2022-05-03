import { WatchingStar } from 'components'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import {
  formatNumberWithCommasAsThousandsSerperator,
  formatNumberInt,
} from 'utils'
import { useQuery } from 'react-query'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { ChatIcon } from '@heroicons/react/outline'
import ListingContent from './ListingContent'
import { getListingTypeFromIDTURL, LISTING_TYPE } from './utils/ListingUtils'
import A from 'components/A'
import { convertAccountName } from 'lib/utils/stringUtil'
import { getPublicProfile } from 'lib/axios'
import Image from 'next/image'

type Props = {
  token: any
  getColumn: (column: string) => any
  lastElementRef?: (node) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  refetch: () => any
}

export default function TokenRow({
  token,
  getColumn,
  onTradeClicked,
  onRateClicked,
  lastElementRef,
  refetch,
}: Props) {
  const { data: urlMetaData } = useQuery([token?.url], () =>
    getURLMetaData(token?.url)
  )

  const { minterAddress } = (token || {}) as any

  const { data: userDataForMinter } = useQuery<any>(
    [`minterAddress-${minterAddress}`],
    () =>
      getPublicProfile({
        username: null,
        walletAddress: minterAddress,
      })
  )

  const displayUsernameOrWallet = convertAccountName(
    userDataForMinter?.username || minterAddress
  )
  const usernameOrWallet = userDataForMinter?.username || minterAddress

  return (
    <>
      {/* Desktop row */}
      <div
        ref={lastElementRef}
        className="hidden relative md:block py-6 hover:bg-black/[.02]"
      >
        {/* Makes so entire row can be clicked to go to Post page */}
        <a
          href={`/post/${token?.tokenID}`}
          className="absolute top-0 left-0 w-full h-full z-40"
        >
          <span className="invisible">Go to post page</span>
        </a>

        <div className="flex text-black">
          {/* Icon and Name */}
          <div className="w-[52%] relative pl-6 pr-10">
            <div className="relative flex items-start w-3/4 mx-auto md:w-full text-gray-900 dark:text-gray-200">
              <div className="mr-4">
                <WatchingStar token={token} />
              </div>

              <div className="w-full">
                {minterAddress && (
                  <div className="flex items-center pb-2 whitespace-nowrap">
                    <div className="relative rounded-full w-6 h-6">
                      <Image
                        className="rounded-full"
                        src={
                          userDataForMinter?.profilePhoto ||
                          '/DefaultProfilePicture.gif'
                        }
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <A
                      className="ml-2 font-bold hover:text-blue-600 z-50"
                      href={`/u/${usernameOrWallet}`}
                    >
                      {displayUsernameOrWallet}
                    </A>
                  </div>
                )}

                <div className="pr-6">
                  <ListingContent
                    ideaToken={token}
                    page="HomePage"
                    urlMetaData={urlMetaData}
                    useMetaData={
                      getListingTypeFromIDTURL(token?.url) !==
                        LISTING_TYPE.TWEET &&
                      getListingTypeFromIDTURL(token?.url) !==
                        LISTING_TYPE.TEXT_POST
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="w-[16%]">
            <div className="flex flex-col justify-start font-medium leading-5">
              <span className="mb-1">
                <span className="w-10 h-8 flex justify-center items-center rounded-lg bg-blue-100 text-blue-600 dark:text-gray-300 font-extrabold text-xl">
                  {formatNumberInt(token?.averageRating)}
                </span>
              </span>
              {/* <span className="text-black/[.3] text-sm">
                (
                {formatNumberWithCommasAsThousandsSerperator(
                  token?.latestRatingsCount
                )}
                )
              </span> */}
            </div>
          </div>

          {/* latestCommentsCount */}
          <div className="w-[16%]">
            <div className="flex items-center font-medium text-lg text-black">
              <ChatIcon className="w-4 mr-1" />
              {formatNumberWithCommasAsThousandsSerperator(
                token?.latestCommentsCount
              )}
            </div>
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
          <div className="w-[16%]">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRateClicked(token, urlMetaData)
                }}
                className="flex justify-center items-center w-20 h-10 text-base rounded-lg border-brand-blue text-white bg-brand-blue font-medium hover:bg-blue-800 z-50"
              >
                <span>Rate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile row */}
      <div ref={lastElementRef} className="md:hidden">
        <div className="px-3 py-4">
          {minterAddress && (
            <div className="flex items-center pb-2 whitespace-nowrap">
              <div className="relative rounded-full w-6 h-6">
                <Image
                  className="rounded-full"
                  src={
                    userDataForMinter?.profilePhoto ||
                    '/DefaultProfilePicture.gif'
                  }
                  alt=""
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <A
                className="ml-2 font-bold text-black hover:text-blue-600"
                href={`/u/${usernameOrWallet}`}
              >
                {displayUsernameOrWallet}
              </A>
            </div>
          )}

          <ListingContent
            ideaToken={token}
            page="HomePage"
            urlMetaData={urlMetaData}
            useMetaData={
              getListingTypeFromIDTURL(token?.url) !== LISTING_TYPE.TWEET
            }
          />
        </div>

        <div className="flex justify-between items-start text-center px-10 py-4 border-b border-t">
          <div>
            <div className="font-semibold text-black/[.5]">Average Rating</div>
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-gray-300 mr-1 font-extrabold text-xl">
                {formatNumberInt(token?.averageRating)}
              </span>
              {/* <span className="text-black/[.3] text-sm">
                (
                {formatNumberWithCommasAsThousandsSerperator(
                  token?.latestRatingsCount
                )}
                )
              </span> */}
            </div>
          </div>
          <div>
            <div className="font-semibold text-black/[.5]">Comments</div>
            <div className="flex items-center font-medium text-lg text-black">
              <ChatIcon className="w-4 mr-1" />
              {formatNumberWithCommasAsThousandsSerperator(
                token?.latestCommentsCount
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-10 py-4 border-t">
          <div className="">
            <WatchingStar token={token} />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onRateClicked(token, urlMetaData)
            }}
            className="flex justify-center items-center w-20 h-10 text-base rounded-lg border-brand-blue text-white bg-brand-blue font-medium hover:bg-blue-800"
          >
            <span>Rate</span>
          </button>
        </div>
      </div>
    </>
  )
}
