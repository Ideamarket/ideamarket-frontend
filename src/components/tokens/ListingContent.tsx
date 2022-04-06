import classNames from 'classnames'
import { DefaultLayout } from 'components/layouts'
import TwitterProfileDesktopContent from 'components/listing-page/TwitterProfileDesktopContent'
import TwitterProfileMobileContent from 'components/listing-page/TwitterProfileMobileContent'
import WikiContent from 'components/listing-page/WikiContent'
import { ReactElement, useEffect } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { getListingTypeFromIDTURL, LISTING_TYPE } from './utils/ListingUtils'

const ListingContent = ({
  ideaToken,
  page,
  urlMetaData,
  useMetaData = false,
}: {
  ideaToken: IdeaToken
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

  return (
    <div
      className={classNames(
        page === 'ListingPage' ? 'text-black' : 'text-black/[.5]',
        'w-full'
      )}
    >
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
        <a
          href={`/i/${ideaToken?.address}`}
          className="px-4 md:px-0 cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* This wrapper div combined with object-cover keeps images in correct size */}
          <div className="aspect-[16/9] w-56">
            {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
            <img
              className="rounded-xl mt-4 h-full object-cover"
              src={
                urlMetaData && urlMetaData?.ogImage
                  ? urlMetaData.ogImage
                  : '/gray.svg'
              }
              alt=""
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-full my-4 text-sm text-left leading-5 whitespace-normal">
            {urlMetaData &&
              urlMetaData?.ogDescription &&
              urlMetaData.ogDescription}
          </div>
        </a>
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
