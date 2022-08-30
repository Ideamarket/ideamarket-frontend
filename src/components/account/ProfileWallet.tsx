import { flatten } from 'lodash'
import classNames from 'classnames'
import { useState, useEffect, useContext } from 'react'
import { useInfiniteQuery } from 'react-query'
import {
  OwnedTokenTableNew,
  WalletModal,
  MyTradesTableNew,
  Tooltip,
} from '../../components'
import { useWalletStore } from '../../store/walletStore'
import {
  queryOwnedTokensMaybeMarket,
  queryMyTrades,
  useIdeaMarketsStore,
  IdeaToken,
} from 'store/ideaMarketsStore'
import ModalService from 'components/modals/ModalService'
import WalletFilters from './WalletFilters'
import RatingsTable from 'modules/ratings/components/RatingsTable'
import { getUsersLatestOpinions } from 'modules/ratings/services/OpinionService'
import RateModal from 'components/trade/RateModal'
import { GlobalContext } from 'lib/GlobalContext'
import {
  SortOptionsAccountOpinions,
  SortOptionsAccountPosts,
  SortOptionsAccountRecommended,
  SortOptionsHomeUsersTable,
  TABLE_NAMES,
  TIME_FILTER,
} from 'utils/tables'
import UserPostsTable from 'modules/posts/components/UserPostsTable'
import { getAllPosts } from 'modules/posts/services/PostService'
import HoldersView from 'modules/user-market/components/HoldersView'
import HoldingsView from 'modules/user-market/components/HoldingsView'
import UserRecommendedTable from 'modules/user-market/components/UserRecommendedTable'
import {
  getRecommendedUsersByWallet,
  IdeamarketUser,
} from 'modules/user-market/services/UserMarketService'
import { USER_MARKET } from 'modules/user-market/utils/UserMarketUtils'
import StakeUserModal from 'modules/user-market/components/StakeUserModal'

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
  enabled: true,
  keepPreviousData: true,
}

type Props = {
  userData?: any
}

export default function ProfileWallet({ userData }: Props) {
  const web3 = useWalletStore((state) => state)
  const address = useWalletStore((state) => state.address)

  const { setOnWalletConnectedCallback, isTxPending } =
    useContext(GlobalContext)

  const [isVerifiedFilterActive, setIsVerifiedFilterActive] = useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [isLockedFilterActive, setIsLockedFilterActive] = useState(false)
  const [nameSearch, setNameSearch] = useState('')

  const [selectedView, setSelectedView] = useState(
    TABLE_NAMES.ACCOUNT_RECOMMENDED
  )
  const [orderBy, setOrderBy] = useState(
    SortOptionsAccountRecommended.MATCH_SCORE.value
  )
  const [orderDirection, setOrderDirection] = useState('desc')

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

  const {
    data: infiniteUserRecommendedData,
    isFetching: isUserRecommendedDataLoading,
    fetchNextPage: fetchMoreUserRecommended,
    refetch: refetchUserRecommended,
    hasNextPage: canFetchMoreUserRecommended,
  } = useInfiniteQuery(
    ['user-recommended'],
    ({ pageParam = 0 }) =>
      userRecommendedQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const userRecommendedPairs = flatten(infiniteUserRecommendedData?.pages || [])

  const {
    data: infiniteUserPostData,
    isFetching: isUserPostDataLoading,
    fetchNextPage: fetchMoreUserPosts,
    refetch: refetchUserPosts,
    hasNextPage: canFetchMoreUserPosts,
  } = useInfiniteQuery(
    ['user-posts'],
    ({ pageParam = 0 }) => userPostsQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const userPostPairs = flatten(infiniteUserPostData?.pages || [])

  const {
    data: infiniteRatingsData,
    isFetching: isRatingsDataLoading,
    fetchNextPage: fetchMoreRatings,
    refetch: refetchRatings,
    hasNextPage: canFetchMoreRatings,
  } = useInfiniteQuery(
    ['ratings'],
    ({ pageParam = 0 }) => ratingsQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const ratingPairs = flatten(infiniteRatingsData?.pages || [])

  const {
    data: infiniteOwnedData,
    isFetching: isOwnedPairsDataLoading,
    fetchNextPage: fetchMoreOwned,
    refetch: refetchOwned,
    hasNextPage: canFetchMoreOwned,
  } = useInfiniteQuery(
    ['owned-tokens', address, userData?.walletAddress],
    ({ pageParam = 0 }) => ownedQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const ownedPairs = flatten(infiniteOwnedData?.pages || [])

  const {
    data: infiniteTradesData,
    isFetching: isTradesPairsDataLoading,
    fetchNextPage: fetchMoreTrades,
    refetch: refetchMyTrades,
    hasNextPage: canFetchMoreTrades,
  } = useInfiniteQuery(
    ['my-trades'],
    ({ pageParam = 0 }) => tradesQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const myTrades = flatten(infiniteTradesData?.pages || [])

  function refetch() {
    refetchOwned()
    refetchMyTrades()
    refetchRatings()
    refetchUserPosts()
    refetchUserRecommended()
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    web3,
    orderBy,
    orderDirection,
    userData,
    isStarredFilterActive,
    isLockedFilterActive,
    nameSearch,
    isTxPending, // If any transaction starts or stop, refresh data
  ])

  async function userRecommendedQueryFunction(
    numTokens: number,
    skip: number = 0
  ) {
    if (selectedView !== TABLE_NAMES.ACCOUNT_RECOMMENDED) return []
    if (!userData || !userData?.walletAddress) return []

    const recommendedUsers = await getRecommendedUsersByWallet({
      walletAddress: userData?.walletAddress,
      limit: numTokens,
      orderBy,
      orderDirection,
      skip,
    })

    return recommendedUsers || []
  }

  async function userPostsQueryFunction(numTokens: number, skip: number = 0) {
    if (selectedView !== TABLE_NAMES.ACCOUNT_POSTS) return []
    if (!userData || !userData?.walletAddress) return []

    const latestUserOpinions = await getAllPosts(
      [
        numTokens,
        orderBy,
        orderDirection,
        null,
        filterTokens,
        nameSearch,
        userData?.walletAddress,
        TIME_FILTER.ALL_TIME,
      ],
      skip
    )

    return latestUserOpinions || []
  }

  async function ratingsQueryFunction(numTokens: number, skip: number = 0) {
    if (selectedView !== TABLE_NAMES.ACCOUNT_OPINIONS) return []

    const latestUserOpinions = await getUsersLatestOpinions({
      walletAddress: userData?.walletAddress,
      skip,
      limit: numTokens,
      orderBy,
      orderDirection,
      filterTokens,
      search: nameSearch,
    })

    return latestUserOpinions || []
  }

  async function ownedQueryFunction(numTokens: number, skip: number = 0) {
    const finalAddress = userData?.walletAddress

    const { holdings } = await queryOwnedTokensMaybeMarket(
      finalAddress,
      null,
      numTokens,
      skip,
      orderBy,
      orderDirection,
      filterTokens,
      nameSearch,
      isLockedFilterActive
    )

    return holdings || []
  }

  async function tradesQueryFunction(numTokens: number, skip: number = 0) {
    const finalAddress = userData?.walletAddress

    const { trades } = await queryMyTrades(
      finalAddress,
      null,
      numTokens,
      skip,
      orderBy,
      orderDirection,
      filterTokens,
      nameSearch
    )

    return trades || []
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

  const onRateClicked = (token: IdeaToken, urlMetaData: any) => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(RateModal, { imPost: token, urlMetaData })
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, { imPost: token, urlMetaData })
    }
  }

  const onStakeClicked = (userToken: IdeamarketUser) => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(StakeUserModal, {
          ideaToken: userToken,
          market: USER_MARKET,
        })
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(StakeUserModal, {
        ideaToken: userToken,
        market: USER_MARKET,
      })
    }
  }

  return (
    <div className="w-full h-full mt-8 pb-20">
      <div className="flex flex-col overflow-auto justify-between sm:flex-row mb-0 md:mb-4">
        <div className="flex order-1 md:order-none mx-4">
          <div
            className={classNames(
              selectedView === TABLE_NAMES.ACCOUNT_RECOMMENDED
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6'
            )}
            onClick={() => {
              setSelectedView(TABLE_NAMES.ACCOUNT_RECOMMENDED)
              setOrderBy(SortOptionsAccountRecommended.MATCH_SCORE.value)
              setOrderDirection('desc')
            }}
          >
            Similar Users
          </div>

          <div
            className={classNames(
              selectedView === TABLE_NAMES.ACCOUNT_OPINIONS
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6'
            )}
            onClick={() => {
              setSelectedView(TABLE_NAMES.ACCOUNT_OPINIONS)
              setOrderBy(SortOptionsAccountOpinions.RATING.value)
              setOrderDirection('desc')
            }}
          >
            Ratings
          </div>

          <div
            className={classNames(
              selectedView === TABLE_NAMES.ACCOUNT_POSTS
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6'
            )}
            onClick={() => {
              setSelectedView(TABLE_NAMES.ACCOUNT_POSTS)
              setOrderBy(SortOptionsAccountPosts.MARKET_INTEREST.value)
              setOrderDirection('desc')
            }}
          >
            Posts
          </div>

          <div
            className={classNames(
              selectedView === TABLE_NAMES.ACCOUNT_HOLDERS
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6'
            )}
            onClick={() => {
              setSelectedView(TABLE_NAMES.ACCOUNT_HOLDERS)
              // TODO:
              setOrderBy(SortOptionsHomeUsersTable.STAKED.value)
              setOrderDirection('desc')
            }}
          >
            Holders
          </div>

          <div
            className={classNames(
              selectedView === TABLE_NAMES.ACCOUNT_STAKED_ON
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6'
            )}
            onClick={() => {
              setSelectedView(TABLE_NAMES.ACCOUNT_STAKED_ON)
              // TODO:
              setOrderBy(SortOptionsHomeUsersTable.STAKED.value)
              setOrderDirection('desc')
            }}
          >
            Holdings
          </div>

          {address?.toLowerCase() === userData?.walletAddress?.toLowerCase() &&
            ownedPairs &&
            ownedPairs?.length > 0 && (
              <div
                className={classNames(
                  selectedView === TABLE_NAMES.ACCOUNT_HOLDINGS
                    ? 'text-white'
                    : 'text-brand-gray text-opacity-60 cursor-pointer',
                  'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6'
                )}
                onClick={() => {
                  setSelectedView(TABLE_NAMES.ACCOUNT_HOLDINGS)
                  setOrderBy('price')
                  setOrderDirection('desc')
                }}
              >
                Wallet
              </div>
            )}

          {address?.toLowerCase() === userData?.walletAddress?.toLowerCase() &&
            myTrades &&
            myTrades?.length > 0 && (
              <div
                className={classNames(
                  selectedView === TABLE_NAMES.ACCOUNT_TRADES
                    ? 'text-white'
                    : 'text-brand-gray text-opacity-60 cursor-pointer',
                  'text-lg font-semibold flex flex-col justify-end mb-2.5'
                )}
                onClick={() => {
                  setSelectedView(TABLE_NAMES.ACCOUNT_TRADES)
                  setOrderBy('date')
                  setOrderDirection('desc')
                }}
              >
                Trades
              </div>
            )}
        </div>
      </div>

      {/* Don't show table HTML if selected view is not table */}
      {selectedView !== TABLE_NAMES.ACCOUNT_HOLDERS &&
        selectedView !== TABLE_NAMES.ACCOUNT_STAKED_ON && (
          <div className="bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray ">
            <WalletFilters
              selectedView={selectedView}
              isVerifiedFilterActive={isVerifiedFilterActive}
              isStarredFilterActive={isStarredFilterActive}
              isLockedFilterActive={isLockedFilterActive}
              nameSearch={nameSearch}
              orderBy={orderBy}
              onMarketChanged={() => null}
              onNameSearchChanged={setNameSearch}
              setIsVerifiedFilterActive={setIsVerifiedFilterActive}
              setIsStarredFilterActive={setIsStarredFilterActive}
              setIsLockedFilterActive={setIsLockedFilterActive}
              setOrderBy={setOrderBy}
            />

            {/* Mobile header to explain columns */}
            {selectedView === TABLE_NAMES.ACCOUNT_POSTS && (
              <div className="md:hidden w-full flex gap-x-3 px-3 py-3 border-t-[6px] leading-4 text-xs text-black/[.5] font-semibold">
                <div className="w-1/4 flex items-start">
                  <span className="mr-1 break-all">HOT</span>
                  <Tooltip>
                    <div className="w-40 md:w-64">
                      The total amount of IMO staked on all users who rated a
                      post
                    </div>
                  </Tooltip>
                </div>

                <div className="w-1/4 flex items-start">
                  <span className="mr-1">AVERAGE RATING</span>
                  {/* <Tooltip>
                    <div className="w-full md:w-64">
                      Rating weighted by IMO staked on each user. The more IMO
                      staked on a user, the more that user’s ratings affect the
                      IMO Rating of every post they rate.
                    </div>
                  </Tooltip> */}
                </div>

                <div className="w-1/4 break-all">RATINGS</div>

                <div className="w-1/4"></div>
              </div>
            )}

            {/* Mobile header to explain columns for Similar Users */}
            {selectedView === TABLE_NAMES.ACCOUNT_RECOMMENDED && (
              <div className="md:hidden w-full flex gap-x-3 px-3 py-3 border-t-[6px] leading-4 text-xs text-black/[.5] font-semibold">
                <div className="w-1/3 flex items-start">
                  <span className="mr-1 break-all">% MATCH</span>
                </div>

                <div className="w-1/3 flex items-start">
                  <span className="mr-1 break-all">STAKED</span>
                </div>

                <div className="w-1/3"></div>
              </div>
            )}

            <div className="border-t border-brand-border-gray dark:border-gray-500 shadow-home ">
              {selectedView === TABLE_NAMES.ACCOUNT_RECOMMENDED &&
                web3 !== undefined && (
                  <UserRecommendedTable
                    rawPairs={userRecommendedPairs}
                    isPairsDataLoading={isUserRecommendedDataLoading}
                    refetch={refetch}
                    canFetchMore={canFetchMoreUserRecommended}
                    orderDirection={orderDirection}
                    orderBy={orderBy}
                    fetchMore={fetchMoreUserRecommended}
                    headerClicked={headerClicked}
                    onStakeClicked={onStakeClicked}
                  />
                )}

              {selectedView === TABLE_NAMES.ACCOUNT_POSTS &&
                web3 !== undefined && (
                  <UserPostsTable
                    rawPairs={userPostPairs}
                    isPairsDataLoading={isUserPostDataLoading}
                    refetch={refetch}
                    canFetchMore={canFetchMoreUserPosts}
                    orderDirection={orderDirection}
                    orderBy={orderBy}
                    fetchMore={fetchMoreUserPosts}
                    headerClicked={headerClicked}
                    onRateClicked={onRateClicked}
                  />
                )}

              {selectedView === TABLE_NAMES.ACCOUNT_OPINIONS &&
                web3 !== undefined && (
                  <RatingsTable
                    rawPairs={ratingPairs}
                    isPairsDataLoading={isRatingsDataLoading}
                    refetch={refetch}
                    canFetchMore={canFetchMoreRatings}
                    orderDirection={orderDirection}
                    orderBy={orderBy}
                    fetchMore={fetchMoreRatings}
                    headerClicked={headerClicked}
                    onRateClicked={onRateClicked}
                  />
                )}

              {selectedView === TABLE_NAMES.ACCOUNT_HOLDINGS && (
                <OwnedTokenTableNew
                  rawPairs={ownedPairs}
                  isPairsDataLoading={isOwnedPairsDataLoading}
                  refetch={refetch}
                  canFetchMore={canFetchMoreOwned}
                  orderDirection={orderDirection}
                  orderBy={orderBy}
                  fetchMore={fetchMoreOwned}
                  headerClicked={headerClicked}
                />
              )}

              {selectedView === TABLE_NAMES.ACCOUNT_TRADES &&
                web3 !== undefined && (
                  <MyTradesTableNew
                    rawPairs={myTrades}
                    isPairsDataLoading={isTradesPairsDataLoading}
                    canFetchMore={canFetchMoreTrades}
                    orderDirection={orderDirection}
                    orderBy={orderBy}
                    fetchMore={fetchMoreTrades}
                    headerClicked={headerClicked}
                  />
                )}
            </div>
          </div>
        )}

      {selectedView === TABLE_NAMES.ACCOUNT_HOLDERS && web3 !== undefined && (
        <HoldersView selectedView={selectedView} userData={userData} />
      )}

      {selectedView === TABLE_NAMES.ACCOUNT_STAKED_ON && web3 !== undefined && (
        <HoldingsView selectedView={selectedView} userData={userData} />
      )}
    </div>
  )
}
