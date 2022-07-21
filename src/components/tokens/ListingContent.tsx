import classNames from 'classnames'
import { DefaultLayout } from 'components/layouts'
import TwitterProfileDesktopContent from 'components/listing-page/TwitterProfileDesktopContent'
import TwitterProfileMobileContent from 'components/listing-page/TwitterProfileMobileContent'
import WikiContent from 'components/listing-page/WikiContent'
import { ReactElement, useEffect } from 'react'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { urlify } from 'utils/display/DisplayUtils'
import { getListingTypeFromIDTURL, LISTING_TYPE } from './utils/ListingUtils'

const ListingContent = ({
  imPost,
  page,
  urlMetaData,
  useMetaData = false,
}: {
  imPost: any
  page: string // The page this component is being used on
  urlMetaData?: any
  useMetaData?: boolean // Show meta data from URL instead of anything else
}) => {
  const listingType = getListingTypeFromIDTURL(imPost?.url)
  const showMetaData =
    (useMetaData || listingType === LISTING_TYPE.GENERAL_URL) &&
    urlMetaData &&
    urlMetaData?.ogImage

  const marketSpecifics = getMarketSpecificsByMarketName(imPost?.marketName)
  const twitterUsername = marketSpecifics?.getTokenNameURLRepresentation(
    imPost?.name
  )

  // In order to load NEW tweet embed in dynamically, need to reinit twitter API when isExpanded changes
  useEffect(() => {
    const initializeTwitterAPI = () => {
      // You can add this as script tag in <head>, but for some reason that way stopped working. But this works fine for now
      const s = document.createElement('script')
      s.setAttribute('src', 'https://platform.twitter.com/widgets.js')
      s.setAttribute('async', 'true')
      document.head.appendChild(s)
    }

    const timeout = setTimeout(
      () => (window as any)?.twttr?.widgets?.load(),
      3000
    ) // Load tweets

    if (listingType === LISTING_TYPE.TWEET) initializeTwitterAPI()

    return () => clearTimeout(timeout)
  }, [listingType])

  const generalURLDisplayName =
    urlMetaData && urlMetaData?.ogTitle
      ? urlMetaData?.ogTitle
      : marketSpecifics?.convertUserInputToTokenName(imPost?.url)

  // const showFullContent = page === 'ListingPage'
  // const cutOffContent = !showFullContent && imPost?.content?.length > 280
  const content = true ? imPost?.content : imPost?.content.slice(0, 280) + '...'

  return (
    <div
      className={classNames(
        page === 'ListingPage' ? 'text-black' : 'text-black/[.5]',
        'w-full'
      )}
    >
      {/* GENERAL_URL listing content (OG title and URL shown) */}
      {!showMetaData && listingType === LISTING_TYPE.GENERAL_URL && (
        <div className="pb-2 text-base font-medium leading-5 truncate whitespace-normal">
          {generalURLDisplayName && (
            <div>
              <a
                href={`/post/${imPost?.tokenID}`}
                onClick={(event) => event.stopPropagation()}
                className="w-full text-xs md:text-base font-bold hover:underline"
              >
                {generalURLDisplayName?.substr(
                  0,
                  generalURLDisplayName?.length > 50
                    ? 50
                    : generalURLDisplayName?.length
                ) + (generalURLDisplayName?.length > 50 ? '...' : '')}
              </a>
            </div>
          )}
          {/* Display the URL */}
          <a
            href={imPost?.url}
            className="text-xs md:text-sm text-brand-blue hover:underline relative z-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            {imPost?.url.substr(
              0,
              imPost?.url.length > 50 ? 50 : imPost?.url.length
            ) + (imPost?.url.length > 50 ? '...' : '')}
          </a>

          <a
            href={`/post/${imPost?.tokenID}`}
            className="cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-full text-sm text-left leading-5 whitespace-normal">
              {urlMetaData &&
                urlMetaData?.ogDescription &&
                urlMetaData.ogDescription}
            </div>
          </a>
        </div>
      )}

      {/* Text post listing content */}
      {!showMetaData && listingType === LISTING_TYPE.TEXT_POST && (
        <div className="relative">
          <div
            dangerouslySetInnerHTML={{
              __html: urlify(content),
            }}
            className="md:max-w-[30rem] pr-2 whitespace-pre-wrap break-words relative text-black"
            style={{ wordBreak: 'break-word' }} // Fixes overflow issue on browsers that dont support break-words above
          />

          {/* {cutOffContent && (
            <A
              href={`/post/${imPost?.tokenID}`}
              className="absolute bottom-0 right-0 text-blue-500 z-[60]"
            >
              (More...)
            </A>
          )} */}
        </div>
      )}

      {/* Wikipedia listing content */}
      {!showMetaData && listingType === LISTING_TYPE.WIKI && (
        <WikiContent wikiTitle={imPost?.name} />
      )}

      {/* Twitter profile listing content */}
      {!showMetaData && listingType === LISTING_TYPE.TWITTER_PROFILE && (
        <div style={{ height: '400px' }}>
          <TwitterProfileMobileContent twitterUsername={twitterUsername} />
          <TwitterProfileDesktopContent twitterUsername={twitterUsername} />
        </div>
      )}

      {/* Tweet listing content */}
      {!showMetaData && listingType === LISTING_TYPE.TWEET && (
        <div className="w-full -mt-3">
          <blockquote className="twitter-tweet">
            <a href={imPost?.url}>Loading tweet...</a>
          </blockquote>
        </div>
      )}

      {showMetaData && (
        <>
          {generalURLDisplayName && (
            <div>
              <a
                onClick={(event) => event.stopPropagation()}
                className="w-full text-xs md:text-base font-bold hover:underline"
              >
                {generalURLDisplayName?.substr(
                  0,
                  generalURLDisplayName?.length > 50
                    ? 50
                    : generalURLDisplayName?.length
                ) + (generalURLDisplayName?.length > 50 ? '...' : '')}
              </a>
            </div>
          )}
          {/* Display the URL */}
          <a
            href={imPost?.url}
            className="text-xs md:text-sm text-brand-blue hover:underline relative z-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            {imPost?.url.substr(
              0,
              imPost?.url.length > 50 ? 50 : imPost?.url.length
            ) + (imPost?.url.length > 50 ? '...' : '')}
          </a>
          <a
            className="cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-full text-sm text-left leading-5 whitespace-normal">
              {urlMetaData &&
                urlMetaData?.ogDescription &&
                urlMetaData.ogDescription}
            </div>
          </a>
        </>
      )}
    </div>
  )
}

ListingContent.getLayout = (page: ReactElement) => (
  <DefaultLayout bgColor="bg-theme-blue-1 dark:bg-gray-900">
    {page}
  </DefaultLayout>
)

export default ListingContent
