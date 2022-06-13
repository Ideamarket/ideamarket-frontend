/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useInfiniteQuery } from 'react-query'
import { A, DefaultLayout, WalletModal, WatchingStar } from 'components'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import { GetServerSideProps } from 'next'
import ModalService from 'components/modals/ModalService'
import ListingSEO from 'components/listing-page/ListingSEO'
import {
  ReactElement,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  MutableRefObject,
} from 'react'
import {
  formatNumberInt,
  formatNumberWithCommasAsThousandsSerperator,
} from 'utils'
import { ChatIcon, ExternalLinkIcon, ShareIcon } from '@heroicons/react/outline'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { useWalletStore } from 'store/walletStore'
import { GlobalContext } from 'lib/GlobalContext'
import ListingContent from 'components/tokens/ListingContent'
import RateModal from 'components/trade/RateModal'
import copy from 'copy-to-clipboard'
import { getURL } from 'utils/seo-constants'
import toast from 'react-hot-toast'
import { flatten } from 'lodash'
import OpinionTable from 'modules/ratings/components/ListingPage/OpinionTable'
import classNames from 'classnames'
import { SortOptionsListingPageOpinions } from 'utils/tables'
import { getLatestOpinionsAboutNFTForTable } from 'modules/ratings/services/OpinionService'
import {
  getPostByTokenID,
  IdeamarketPost,
} from 'modules/posts/services/PostService'
import { convertAccountName } from 'lib/utils/stringUtil'
import Image from 'next/image'
import WalletIcon from '../../assets/wallet.svg'
import { USER_MARKET } from 'modules/user-market/utils/UserMarketUtils'
import StakeUserModal from 'modules/user-market/components/StakeUserModal'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DetailsSkeleton = () => (
  <div className="w-12 mx-auto bg-gray-400 rounded animate animate-pulse">
    <span className="invisible">A</span>
  </div>
)

const TOKENS_PER_PAGE = 10

const infiniteQueryConfig = {
  getNextPageParam: (lastGroup, allGroups) => {
    const morePagesExist = lastGroup?.length === TOKENS_PER_PAGE

    if (!morePagesExist) {
      return false
    }

    return allGroups.length * TOKENS_PER_PAGE
  },
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  enabled: true, // This apparently decides if data is loaded on page load or not
  keepPreviousData: true,
}

const TokenDetails = ({ rawTokenId }: { rawTokenId: string }) => {
  const {
    data: token,
    isLoading: isTokenLoading,
    refetch,
  } = useQuery(['single-post', rawTokenId], () =>
    getPostByTokenID({ tokenID: rawTokenId })
  )

  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [orderBy, setOrderBy] = useState(
    SortOptionsListingPageOpinions.STAKED.value
  )
  const [orderDirection, setOrderDirection] = useState('desc')
  const [nameSearch, setNameSearch] = useState('')

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

  async function opinionsQueryFunction(numTokens: number, skip: number = 0) {
    const latestOpinions = await getLatestOpinionsAboutNFTForTable({
      tokenID: rawTokenId,
      skip,
      limit: numTokens,
      orderBy,
      orderDirection,
      filterTokens,
      search: nameSearch,
    })
    return latestOpinions || []
  }

  const {
    data: infiniteOpinionsData,
    isFetching: isOpinionsDataLoading,
    fetchNextPage: fetchMoreOpinions,
    refetch: refetchOpinions,
    hasNextPage: canFetchMoreOpinions,
  } = useInfiniteQuery(
    ['opinions', token, orderBy, orderDirection, nameSearch],
    ({ pageParam = 0 }) => opinionsQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const opinionPairs = flatten(infiniteOpinionsData?.pages || [])

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const [isScrolled, setIsScrolled] = useState(false)

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

    initializeTwitterAPI()

    // Track using local state if page has been scrolled from top or not
    const handleElementDisplay = () => {
      const scrollAmount = window.scrollY || document.documentElement.scrollTop
      if (scrollAmount > 0) setIsScrolled(true)
      else setIsScrolled(false)
    }

    window.addEventListener('scroll', handleElementDisplay)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', handleElementDisplay)
    }
  }, [rawTokenId])

  const { minterAddress } = (token || {}) as any

  const displayUsernameOrWallet = convertAccountName(
    token?.minterToken?.username || minterAddress
  )
  const usernameOrWallet = token?.minterToken?.username || minterAddress

  const url = token?.url

  const { data: urlMetaData } = useQuery([url], () => getURLMetaData(url))

  // TODO: find better solution than 2 observers for desktop vs mobile
  const desktopObserver: MutableRefObject<any> = useRef()
  const mobileObserver: MutableRefObject<any> = useRef()
  const desktopLastElementRef = useCallback(
    (node) => {
      if (desktopObserver.current) desktopObserver.current.disconnect()

      desktopObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && canFetchMoreOpinions) {
          fetchMoreOpinions()
        }
      })

      if (node) desktopObserver.current.observe(node)
    },
    [canFetchMoreOpinions, fetchMoreOpinions]
  )

  const mobileLastElementRef = useCallback(
    (node) => {
      if (mobileObserver.current) mobileObserver.current.disconnect()

      mobileObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && canFetchMoreOpinions) {
          fetchMoreOpinions()
        }
      })

      if (node) mobileObserver.current.observe(node)
    },
    [canFetchMoreOpinions, fetchMoreOpinions]
  )

  const copyListingPageURL = () => {
    const url = `${getURL()}/post/${token?.tokenID}`
    copy(url)
    toast.success('Copied listing page URL')
  }

  function headerClicked(headerValue: string) {
    if (orderBy === headerValue) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
      } else {
        setOrderDirection('asc')
      }
    } else {
      setOrderBy(headerValue)
      setOrderDirection('desc')
    }
  }

  const onRateClicked = (token: IdeamarketPost, urlMetaData: any) => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(RateModal, { ideaToken: token, urlMetaData }, refetch)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, { ideaToken: token, urlMetaData }, refetch)
    }
  }

  return (
    <div className=" mx-auto">
      <ListingSEO tokenName={rawTokenId} rawTokenName={rawTokenId} />

      <div className="max-w-[78rem] px-5 md:px-0 mt-10 mx-0 md:mx-5 xl:mx-auto text-black/[.5]">
        <A href="/" className="hover:text-blue-600">
          Market
        </A>{' '}
        / Listings
      </div>

      {/* Start of top section of listing page */}
      <div className="max-w-[50rem] mt-10 px-5 md:mx-auto">
        {/* Desktop and tablet -- top section of listing page */}
        <div className="hidden md:flex items-start w-full mt-4">
          <div className="w-2/3 flex items-start">
            <div className="w-full">
              {minterAddress && (
                <div className="flex items-center pb-2 whitespace-nowrap">
                  <div className="relative rounded-full w-6 h-6">
                    <Image
                      className="rounded-full"
                      src={
                        token?.minterToken?.profilePhoto ||
                        '/DefaultProfilePicture.png'
                      }
                      alt=""
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <A
                    className="ml-2 font-bold hover:text-blue-600"
                    href={`/u/${usernameOrWallet}`}
                  >
                    {displayUsernameOrWallet}
                  </A>
                  {token?.minterToken?.twitterUsername && (
                    <A
                      className="flex items-center space-x-1 ml-1 hover:text-blue-500 z-50"
                      href={`https://twitter.com/${token?.minterToken?.twitterUsername}`}
                    >
                      <div className="relative w-4 h-4">
                        <Image
                          src={'/twitter-solid-blue.svg'}
                          alt="twitter-solid-blue-icon"
                          layout="fill"
                        />
                      </div>
                      <span className="text-sm">
                        @{token?.minterToken?.twitterUsername}
                      </span>
                    </A>
                  )}
                </div>
              )}

              <ListingContent
                imPost={token}
                page="ListingPage"
                urlMetaData={urlMetaData}
                useMetaData={false}
              />
            </div>
          </div>

          <div className="w-1/3 flex flex-col items-end">
            <div className="w-48 mb-2 rounded-lg border-2 flex flex-col divide-y-2">
              {/* <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Composite Rating</span>
                <span className="font-bold">97</span>
              </div> */}
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Average Rating</span>
                <span className="font-bold">
                  {formatNumberInt(token?.averageRating)}
                </span>
              </div>
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Comments</span>
                <span className="flex items-center font-bold">
                  <ChatIcon className="w-4 mr-1 mt-0.5" />
                  {token?.latestCommentsCount}
                </span>
              </div>
              {/* <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Market Interest</span>
                <span className="font-bold">$42,693</span>
              </div> */}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRateClicked(token, urlMetaData)
              }}
              className="flex justify-center items-center w-48 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
            >
              <span>Rate</span>
            </button>

            <div className="flex justify-between items-center space-x-2 w-48 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyListingPageURL()
                }}
                className="flex justify-center items-center w-[80%] h-10 border-2 text-black text-base font-medium text-white rounded-lg hover:bg-blue-500 hover:text-white dark:text-gray-300 tracking-tightest-2"
              >
                <ShareIcon className="w-4 mr-2" />
                <span className="mb-0.5">Share</span>
              </button>

              <div className="flex justify-center items-center w-10 h-10 border-2 rounded-lg">
                {token && <WatchingStar token={token} />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile -- top section of listing page */}
        <div className="md:hidden flex flex-col justify-center w-full mt-4">
          <div className="flex items-start w-full">
            <div className="w-full">
              {minterAddress && (
                <div className="flex items-center pb-2 flex-wrap">
                  <div className="relative rounded-full w-6 h-6">
                    <Image
                      className="rounded-full"
                      src={
                        token?.minterToken?.profilePhoto ||
                        '/DefaultProfilePicture.png'
                      }
                      alt=""
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <A
                    className="ml-2 font-bold hover:text-blue-600"
                    href={`/u/${usernameOrWallet}`}
                  >
                    {displayUsernameOrWallet}
                  </A>
                  {token?.minterToken?.twitterUsername && (
                    <A
                      className="flex items-center space-x-1 ml-1 z-50"
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
                        @{token?.minterToken?.twitterUsername}
                      </span>
                    </A>
                  )}
                </div>
              )}

              <ListingContent
                imPost={token}
                page="ListingPage"
                urlMetaData={urlMetaData}
                useMetaData={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-end my-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRateClicked(token, urlMetaData)
              }}
              className="flex justify-center items-center w-full h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
            >
              <span>Rate</span>
            </button>

            <div className="flex justify-between items-center space-x-2 w-full mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyListingPageURL()
                }}
                className="flex justify-center items-center w-[85%] h-10 border-2 text-black text-base font-medium text-white rounded-lg hover:bg-blue-500 hover:text-white dark:text-gray-300 tracking-tightest-2"
              >
                <ShareIcon className="w-4 mr-2" />
                <span className="mb-0.5">Share</span>
              </button>

              <div className="flex justify-center items-center w-10 h-10 border-2 rounded-lg">
                {token && <WatchingStar token={token} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[78rem] md:mt-20 mx-0 md:mx-5 xl:mx-auto pb-96">
        {/* <div className="text-xl text-center text-black font-bold mb-4">
          Ratings
        </div> */}

        <OpinionTable
          desktopLastElementRef={desktopLastElementRef}
          mobileLastElementRef={mobileLastElementRef}
          opinionPairs={opinionPairs}
          orderBy={orderBy}
          orderDirection={orderDirection}
          setOrderBy={setOrderBy}
          setNameSearch={setNameSearch}
          headerClicked={headerClicked}
        />
      </div>

      {/* Block at bottom of mobile screen before scroll */}
      <div
        className={classNames(
          isScrolled ? 'hidden' : 'flex md:hidden',
          // shadow = 1st num is horizontal shadow length. 2nd num is vertical shadow length. 3rd num is blur amount.
          'md:hidden absolute bottom-0 left-0 right-0 flex items-center divide-x h-[12%] bg-white z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.3)]'
        )}
      >
        <div className="w-[50%] px-4 py-3 h-full">
          <div className="font-semibold text-sm text-black/[.5]">
            Average Rating
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-semibold text-xl mr-1">
              {formatNumberInt(token?.averageRating)}
            </span>
            <span className="text-sm text-black/[.5]">
              ({token?.latestRatingsCount})
            </span>
          </div>
        </div>

        <div className="w-[50%] px-4 py-3 h-full">
          <div className="font-semibold text-sm text-black/[.5]">Comments</div>
          <div className="flex items-center font-medium">
            <ChatIcon className="w-4 mr-1 mt-0.5" />
            {token?.latestCommentsCount}
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      rawTokenId: context.query.tokenId,
    },
  }
}

TokenDetails.getLayout = (page: ReactElement) => (
  <DefaultLayout
    bgColor="bg-[#F6F6F6] dark:bg-gray-900"
    bgHeaderColor="bg-transparent"
    headerTextColor="text-black"
  >
    {page}
  </DefaultLayout>
)

export default TokenDetails
