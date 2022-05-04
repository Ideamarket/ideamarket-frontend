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
  ideaToken,
  page,
  urlMetaData,
  useMetaData = false,
}: {
  ideaToken: any
  page: string // The page this component is being used on
  urlMetaData?: any
  useMetaData?: boolean // Show meta data from URL instead of anything else
}) => {
  const listingType = getListingTypeFromIDTURL(ideaToken?.url)
  const showMetaData =
    (useMetaData || listingType === LISTING_TYPE.GENERAL_URL) &&
    urlMetaData &&
    urlMetaData?.ogImage

  const marketSpecifics = getMarketSpecificsByMarketName(ideaToken?.marketName)
  const twitterUsername = marketSpecifics?.getTokenNameURLRepresentation(
    ideaToken?.name
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
      : marketSpecifics?.convertUserInputToTokenName(ideaToken?.url)

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
                href={`/post/${ideaToken?.address}`}
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
            href={ideaToken?.url}
            className="text-xs md:text-sm text-brand-blue hover:underline relative z-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ideaToken?.url.substr(
              0,
              ideaToken?.url.length > 50 ? 50 : ideaToken?.url.length
            ) + (ideaToken?.url.length > 50 ? '...' : '')}
          </a>

          <a
            href={`/post/${ideaToken?.address}`}
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
        <div
          dangerouslySetInnerHTML={{ __html: urlify(ideaToken?.content) }}
          className="whitespace-pre-wrap break-words relative z-50 text-black font-medium"
        />
      )}

      {/* Wikipedia listing content */}
      {!showMetaData && listingType === LISTING_TYPE.WIKI && (
        <WikiContent wikiTitle={ideaToken?.name} />
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
            <a href={ideaToken?.url}>Loading tweet...</a>
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
            href={ideaToken?.url}
            className="text-xs md:text-sm text-brand-blue hover:underline relative z-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ideaToken?.url.substr(
              0,
              ideaToken?.url.length > 50 ? 50 : ideaToken?.url.length
            ) + (ideaToken?.url.length > 50 ? '...' : '')}
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
