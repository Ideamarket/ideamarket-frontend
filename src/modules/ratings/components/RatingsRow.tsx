import { A } from 'components'
import { IdeaToken } from 'store/ideaMarketsStore'
import { formatNumberWithCommasAsThousandsSerperator } from 'utils'
import { useQuery } from 'react-query'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import ListingContent from 'components/tokens/ListingContent'
import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import { convertAccountName } from 'lib/utils/stringUtil'
import Image from 'next/image'
import Link from 'next/link'
import { SortOptionsAccountOpinions } from 'utils/tables'
import classNames from 'classnames'
import { useState } from 'react'
import CitationCard from './CitationCard'

type Props = {
  opinion: any
  refetch: () => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  lastElementRef?: (node) => void
}

export default function RatingsRow({
  opinion,
  refetch,
  onRateClicked,
  lastElementRef,
}: Props) {
  const { data: urlMetaData } = useQuery([opinion?.url], () =>
    getURLMetaData(opinion?.url)
  )

  // selected citation object
  const [selectedCitationForRow, setSelectedCitationForRow] = useState(
    opinion?.citations[0] && opinion?.citations?.length > 0
      ? opinion?.citations[0]
      : null
  )

  const { minterAddress } = (opinion || {}) as any

  const displayUsernameOrWallet = convertAccountName(
    opinion?.minterToken?.username || minterAddress
  )
  const usernameOrWallet = opinion?.minterToken?.username || minterAddress

  /**
   * An arrow was clicked to show a different citation in that row (if there are > 1 citations)
   * @parm isLeft -- Did user click the left arrow? If not, they clicked the right arrow
   */
  const onRowCitationChanged = (isLeft: boolean) => {
    const oldCitationIndex = opinion?.citations.findIndex(
      (citation) =>
        citation.citation.tokenID === selectedCitationForRow.citation.tokenID
    )

    let newCitationIndex = null

    if (isLeft) {
      if (oldCitationIndex - 1 < 0) {
        newCitationIndex = opinion?.citations.length - 1
      } else {
        newCitationIndex = oldCitationIndex - 1
      }
    } else {
      if (oldCitationIndex + 1 >= opinion?.citations.length) {
        newCitationIndex = 0
      } else {
        newCitationIndex = oldCitationIndex + 1
      }
    }

    const newCitation = opinion?.citations[newCitationIndex]

    const newSelectedCitationForRows = newCitation
    setSelectedCitationForRow(newSelectedCitationForRows)
  }

  return (
    <div ref={lastElementRef}>
      {/* Desktop row */}
      <div className="hidden relative md:block py-6">
        {/* Makes so entire row can be clicked to go to Post page */}
        <Link href={`/post/${opinion?.tokenID}`}>
          <a
            className="absolute top-0 left-0 w-full h-full z-40"
            // title="open in new tab"
            // target="_blank"
            // rel="noopener noreferrer"
          >
            <span className="invisible">Go to post page</span>
          </a>
        </Link>

        <div className="flex text-black">
          {/* Icon and Name */}
          <div className="w-[40%] relative pl-6 pr-10">
            <div className="relative flex items-start w-3/4 mx-auto md:w-full text-gray-900 dark:text-gray-200">
              <div className="mr-4 flex flex-col items-center space-y-2">
                <div className="relative rounded-full w-6 h-6">
                  <Image
                    className="rounded-full"
                    src={
                      opinion?.minterToken?.profilePhoto ||
                      '/DefaultProfilePicture.png'
                    }
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                {/* <WatchingStar token={token} /> */}
              </div>

              <div className="pr-6 w-full">
                <div className="flex items-center space-x-1 text-black pb-2 flex-wrap">
                  <A
                    className="font-bold hover:text-blue-600 z-50"
                    href={`/u/${usernameOrWallet}`}
                  >
                    {displayUsernameOrWallet}
                  </A>
                  {opinion?.minterToken?.twitterUsername && (
                    <A
                      className="flex items-center space-x-1 z-50"
                      href={`/u/${usernameOrWallet}`}
                    >
                      <div className="relative w-4 h-4">
                        <Image
                          src={'/twitter-solid-blue.svg'}
                          alt="twitter-solid-blue-icon"
                          layout="fill"
                        />
                      </div>
                      <span className="text-sm opacity-50">
                        @{opinion?.minterToken?.twitterUsername}
                      </span>
                    </A>
                  )}
                </div>

                <ListingContent
                  imPost={opinion}
                  page="HomePage"
                  urlMetaData={urlMetaData}
                  useMetaData={
                    getListingTypeFromIDTURL(opinion?.url) !==
                      LISTING_TYPE.TWEET &&
                    getListingTypeFromIDTURL(opinion?.url) !==
                      LISTING_TYPE.TEXT_POST
                  }
                />
              </div>
            </div>
          </div>

          <div className="w-[60%]">
            <div className="flex items-center w-full">
              {/* Rating By User */}
              <div className="w-[20%] grow pr-14">
                {/* <div className="font-medium leading-5">{opinion?.rating}</div> */}
                <div className="relative h-4 w-full bg-black/[.1]">
                  <div
                    className={classNames(`absolute h-full bg-blue-200`)}
                    style={{ width: `${opinion?.rating}%` }}
                  >
                    <div
                      className={classNames(
                        `absolute rounded-3xl w-8 h-7 -right-4 -top-1/2 mt-0.5 h-full bg-blue-600 text-white font-bold flex justify-center items-center`
                      )}
                    >
                      {opinion?.rating}
                    </div>
                  </div>
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
              <div className="w-[20%] grow">
                <div className="flex flex-col justify-start font-medium leading-5">
                  {formatNumberWithCommasAsThousandsSerperator(
                    Math.round(opinion?.marketInterest)
                  )}
                </div>
              </div>

              {/* Rate Button */}
              <div className="w-[20%] grow">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRateClicked(opinion, urlMetaData)
                    }}
                    className="flex justify-center items-center w-full mr-10 h-10 text-base font-bold rounded-lg border-brand-blue text-white bg-brand-blue hover:bg-blue-800 z-50"
                  >
                    <span>Rate</span>
                  </button>
                </div>
              </div>
            </div>

            {selectedCitationForRow && (
              <div className="flex justify-between items-start space-x-4 w-full pr-10 mt-6">
                {opinion?.citations && opinion?.citations.length > 1 && (
                  <div
                    onClick={() => onRowCitationChanged(true)}
                    className="relative w-10 h-10 cursor-pointer z-[500]"
                  >
                    <Image
                      src={'/ArrowLeft.svg'}
                      alt="arrow-left-icon"
                      layout="fill"
                    />
                  </div>
                )}

                <CitationCard
                  citation={selectedCitationForRow}
                  opinion={opinion}
                />

                {opinion?.citations && opinion?.citations.length > 1 && (
                  <div
                    onClick={() => onRowCitationChanged(false)}
                    className="relative w-10 h-10 cursor-pointer z-[500]"
                  >
                    <Image
                      src={'/ArrowRight.svg'}
                      alt="arrow-right-icon"
                      layout="fill"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile row */}
      <div className="md:hidden w-full">
        <div className="w-full relative px-3 py-4">
          {minterAddress && (
            <div className="flex items-center pb-2 flex-wrap">
              <div className="relative rounded-full w-6 h-6">
                <Image
                  className="rounded-full"
                  src={
                    opinion?.minterToken?.profilePhoto ||
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

              {opinion?.minterToken?.twitterUsername && (
                <A
                  className="flex items-center space-x-1 text-black ml-1 z-50"
                  href={`/u/${usernameOrWallet}`}
                >
                  <div className="relative w-4 h-4">
                    <Image
                      src={'/twitter-solid-blue.svg'}
                      alt="twitter-solid-blue-icon"
                      layout="fill"
                    />
                  </div>
                  <span className="text-sm opacity-50">
                    @{opinion?.minterToken?.twitterUsername}
                  </span>
                </A>
              )}
            </div>
          )}

          <ListingContent
            imPost={opinion}
            page="MobileAccountPage"
            urlMetaData={urlMetaData}
            useMetaData={
              getListingTypeFromIDTURL(opinion?.url) !== LISTING_TYPE.TWEET
            }
          />

          <div className="relative h-4 mt-4 mb-2 w-full bg-black/[.1]">
            <div
              className={classNames(`absolute h-full bg-blue-200`)}
              style={{ width: `${opinion?.rating}%` }}
            >
              <div
                className={classNames(
                  `absolute rounded-3xl w-8 h-7 -right-4 -top-1/2 mt-0.5 h-full bg-blue-600 text-white font-bold flex justify-center items-center`
                )}
              >
                {opinion?.rating}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start text-center px-10 py-4 border-b border-t">
          <div className="text-left">
            <div className="font-semibold text-black/[.5]">
              {SortOptionsAccountOpinions.MARKET_INTEREST.displayName}
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-gray-300 mr-1 font-extrabold text-xl">
                {formatNumberWithCommasAsThousandsSerperator(
                  Math.round(opinion?.marketInterest)
                )}
              </span>
            </div>
          </div>

          <div>
            <div className="font-semibold text-black/[.5]">Ratings</div>
            <div className="flex items-center font-medium text-lg text-black">
              {formatNumberWithCommasAsThousandsSerperator(
                opinion?.latestRatingsCount
              )}
            </div>
          </div>
        </div>

        {/* Citation box */}
        {selectedCitationForRow && (
          <div className="w-full mt-4 flex justify-between items-start px-1">
            {opinion?.citations && opinion?.citations.length > 1 && (
              <div
                onClick={() => onRowCitationChanged(true)}
                className="relative w-10 h-10 cursor-pointer z-[500]"
              >
                <Image
                  src={'/ArrowLeft.svg'}
                  alt="arrow-left-icon"
                  layout="fill"
                />
              </div>
            )}

            <div className="w-full mx-1 mb-6">
              <CitationCard
                citation={selectedCitationForRow}
                opinion={opinion}
              />
            </div>

            {opinion?.citations && opinion?.citations.length > 1 && (
              <div
                onClick={() => onRowCitationChanged(false)}
                className="relative w-10 h-10 cursor-pointer z-[500]"
              >
                <Image
                  src={'/ArrowRight.svg'}
                  alt="arrow-right-icon"
                  layout="fill"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center px-10 py-4 border-t">
          {/* <div className="">
            <WatchingStar token={opinion} />
          </div> */}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onRateClicked(opinion, urlMetaData)
            }}
            className="flex justify-center items-center w-20 h-10 text-base font-bold rounded-lg border-brand-blue text-white bg-brand-blue hover:bg-blue-800"
          >
            <span>Rate</span>
          </button>
        </div>
      </div>
    </div>
  )
}
