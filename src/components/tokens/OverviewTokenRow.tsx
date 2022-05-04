import { WatchingStar } from 'components'
import { IdeaToken } from 'store/ideaMarketsStore'
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
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  refetch: () => any
}

export default function TokenRow({
  token,
  getColumn,
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
          {/* Icon and Name and ListingContent */}
          <div className="w-[45%] lg:w-[55%] relative pl-6 lg:pr-10">
            <div className="relative flex items-start w-3/4 mx-auto md:w-full text-gray-900 dark:text-gray-200">
              <div className="mr-4 flex flex-col items-center space-y-2">
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

                <WatchingStar token={token} />
              </div>

              <div className="pr-6 w-full">
                {minterAddress && (
                  <div className="flex items-center pb-2 whitespace-nowrap">
                    <A
                      className="ml-2 font-bold hover:text-blue-600 z-50"
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
                    getListingTypeFromIDTURL(token?.url) !==
                      LISTING_TYPE.TWEET &&
                    getListingTypeFromIDTURL(token?.url) !==
                      LISTING_TYPE.TEXT_POST
                  }
                />
              </div>
            </div>
          </div>

          {/* Composite Rating */}
          <div className="w-[11%] lg:w-[9%] flex items-start">
            <div className="relative w-5 h-5 mr-1">
              <Image
                src="/logo.png"
                alt="IM-logo-composite-rating"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="text-base text-blue-500 font-bold">97</span>
          </div>

          {/* Average Rating */}
          <div className="w-[11%] lg:w-[9%]">
            <div className="text-black font-semibold">
              {formatNumberInt(token?.averageRating)}
            </div>
          </div>

          {/* Market Interest */}
          <div className="w-[11%] lg:w-[9%] pr-2">
            <div className="flex flex-col justify-start font-medium leading-5">
              65,900
              <br />
              IMO
            </div>
          </div>

          {/* latestCommentsCount */}
          <div className="w-[11%] lg:w-[9%]">
            <div className="flex items-center font-medium text-lg text-black">
              <ChatIcon className="w-4 mr-1" />
              {formatNumberWithCommasAsThousandsSerperator(
                token?.latestCommentsCount
              )}
            </div>
          </div>

          {/* Rate Button */}
          <div className="w-[11%] lg:w-[9%]">
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
        <div className="px-3 pt-4">
          {minterAddress && (
            <div className="flex items-center pb-2 whitespace-nowrap">
              <div className="mr-3">
                <WatchingStar token={token} />
              </div>

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

        <div className="flex justify-between items-center text-center px-3 py-4">
          {/* Market interest */}
          <div className="flex items-center">
            <span className="text-base text-black/[.5] font-medium">
              58,533 IMO
            </span>
          </div>

          {/* Composite rating */}
          <div className="flex items-center">
            <div className="relative w-5 h-5">
              <Image
                src="/logo.png"
                alt="IM-logo-composite-rating"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="text-base text-blue-500 font-semibold">97</span>
          </div>

          {/* Latest comments count */}
          <div className="flex items-center font-medium text-lg text-black">
            <ChatIcon className="w-4 mr-1" />
            {formatNumberWithCommasAsThousandsSerperator(
              token?.latestCommentsCount
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onRateClicked(token, urlMetaData)
            }}
            className="flex justify-center items-center w-20 h-10 text-base border rounded-lg text-blue-500 bg-transparent font-bold"
          >
            <span>Rate</span>
          </button>
        </div>
      </div>
    </>
  )
}
