import React, {
  MutableRefObject,
  useCallback,
  // MutableRefObject,
  // useCallback,
  useContext,
  useEffect,
  useRef,
  // useRef,
} from 'react'
import { useInfiniteQuery } from 'react-query'

import { flatten } from 'utils/lodash'
import { GlobalContext } from 'lib/GlobalContext'
import { TIME_FILTER } from 'utils/tables'
import { getAllPosts } from 'modules/posts/services/PostService'
import ListingContent from 'components/tokens/ListingContent'
import Image from 'next/image'
import { A } from 'components'
import { convertAccountName } from 'lib/utils/stringUtil'
// import { PlusIcon, XIcon } from '@heroicons/react/solid'
import classNames from 'classnames'
import { HOME_PAGE_VIEWS } from 'pages/cards-in-cols'
import OpenRateModal from 'modules/ratings/components/OpenRateModal'
import { EyeIcon, UsersIcon } from '@heroicons/react/outline'
import { formatNumberWithCommasAsThousandsSerperator } from 'utils'
import { getIMORatingColors } from 'utils/display/DisplayUtils'

type Props = {
  activeOverlayPostID: string
  nameSearch: string
  orderBy: string
  orderDirection: string
  selectedCategories: string[]
  selectedView: HOME_PAGE_VIEWS
  timeFilter: TIME_FILTER
  isAdvancedView: boolean
  setActiveOverlayPostID: (activeOverlayPostID: string) => void
}

const IMPostsViewMobile = ({
  activeOverlayPostID,
  nameSearch,
  orderBy,
  orderDirection,
  selectedCategories,
  selectedView,
  timeFilter,
  isAdvancedView,
  setActiveOverlayPostID,
}: Props) => {
  const TOKENS_PER_PAGE = 10

  const { jwtToken, isTxPending } = useContext(GlobalContext)

  const {
    data: infiniteData,
    // isFetching: isTokenDataLoading,
    fetchNextPage: fetchMore,
    refetch,
    hasNextPage: canFetchMore,
  } = useInfiniteQuery(
    [TOKENS_PER_PAGE, orderBy, orderDirection, selectedCategories, nameSearch],
    ({ pageParam = 0 }) =>
      getAllPosts(
        [
          TOKENS_PER_PAGE,
          orderBy,
          orderDirection,
          selectedCategories,
          null,
          nameSearch,
          null,
          timeFilter,
        ],
        pageParam
      ),
    {
      getNextPageParam: (lastGroup, allGroups) => {
        const morePagesExist = lastGroup?.length === 10

        if (!morePagesExist) {
          return false
        }

        return allGroups.length * TOKENS_PER_PAGE
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: false,
      keepPreviousData: true,
    }
  )

  const imPostPairs = flatten(infiniteData?.pages || [])

  const observer: MutableRefObject<any> = useRef()
  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && canFetchMore) {
          fetchMore()
        }
      })

      if (node) observer.current.observe(node)
    },
    [canFetchMore, fetchMore]
  )

  useEffect(() => {
    refetch()
  }, [
    orderBy,
    orderDirection,
    nameSearch,
    refetch,
    jwtToken,
    selectedCategories,
    timeFilter,
    isTxPending, // If any transaction starts or stop, refresh home table data
  ])

  return (
    <div className="md:hidden mt-6">

      {imPostPairs &&
        imPostPairs.length > 0 &&
        imPostPairs.map((imPost, pInd) => {
          const { minterAddress } = (imPost || {}) as any

          const displayUsernameOrWallet = convertAccountName(
            imPost?.minterToken?.username || minterAddress
          )
          const usernameOrWallet =
            imPost?.minterToken?.username || minterAddress

          // const isThisPostOverlaySelected =
          //   activeOverlayPostID &&
          //   activeOverlayPostID === imPost.tokenID.toString()

          return (
            <div ref={lastElementRef} className="flex flex-col space-y-2 px-4 mb-10" key={pInd}>

              <div className={classNames("")}>
                {/* The actual Post card */}
                <A
                  href={`/post/${imPost?.tokenID}`}
                  className="relative block p-4 bg-gray-100 rounded-lg"
                >

                  <span
                    className={classNames(
                      getIMORatingColors(
                        imPost?.totalRatingsCount > 0
                          ? Math.round(imPost?.compositeRating)
                          : -1
                      ),
                      'absolute top-0 right-0 w-14 h-12 flex justify-center items-center rounded-tr-lg rounded-bl-lg font-extrabold text-xl'
                    )}
                  >
                    {imPost?.totalRatingsCount > 0
                      ? Math.round(imPost?.compositeRating) + '%'
                      : '—'}
                  </span>

                  <div className="flex items-center whitespace-nowrap text-xs">
                    <div className="relative rounded-full w-5 h-5">
                      <Image
                        className="rounded-full"
                        src={
                          imPost?.minterToken?.profilePhoto ||
                          '/DefaultProfilePicture.png'
                        }
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>

                    {/* Post minter IM name/wallet and twitter name */}
                    <div className="flex items-center space-x-1 flex-wrap z-50 text-black">
                      <A
                        className="ml-1 font-bold hover:text-blue-500"
                        href={`/u/${usernameOrWallet}`}
                      >
                        {displayUsernameOrWallet}
                      </A>
                      {imPost?.minterToken?.twitterUsername && (
                        <A
                          className="flex items-center space-x-1 hover:text-blue-500"
                          href={`/u/${usernameOrWallet}`}
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              src={'/twitter-solid-blue.svg'}
                              alt="twitter-solid-blue-icon"
                              layout="fill"
                            />
                          </div>
                          <span className="text-xs opacity-50">
                            @{imPost?.minterToken?.twitterUsername}
                          </span>
                        </A>
                      )}
                    </div>
                  </div>

                  <div className="py-4 border-b font-bold">
                    <ListingContent
                      imPost={imPost}
                      page="HomePage"
                      urlMetaData={null}
                      useMetaData={false}
                    />
                  </div>

                  <div className="flex items-center pt-4">

                    <div className="w-1/2">
                      <div className="flex justify-center items-center space-x-2">
                        <UsersIcon className="w-5 h-5" />
                        <div>
                          <div className="text-xs text-black/[.5] font-semibold">Ratings</div>
                          <div className="font-bold">{formatNumberWithCommasAsThousandsSerperator(imPost.totalRatingsCount)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="flex justify-center items-center space-x-2">
                        <EyeIcon className="w-5 h-5" />
                        <div>
                          <div className="text-xs text-black/[.5] font-semibold">Controversial</div>
                          <div className="font-bold">{formatNumberWithCommasAsThousandsSerperator(
                            Math.round(imPost.marketInterest))}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </A>

              </div>

              <div className={classNames("")}>
                <OpenRateModal imPost={imPost} />
              </div>

            </div>
          )
        })}

    </div>
  )
}

export default IMPostsViewMobile
