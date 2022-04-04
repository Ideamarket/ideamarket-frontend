import { flatten } from 'lodash'
import classNames from 'classnames'
import { useState, useEffect, useContext } from 'react'
import { useInfiniteQuery } from 'react-query'
import {
  OwnedTokenTableNew,
  WalletModal,
  MyTradesTableNew,
} from '../../components'
import { useWalletStore } from '../../store/walletStore'
import {
  queryOwnedTokensMaybeMarket,
  queryMyTrades,
  useIdeaMarketsStore,
  querySingleIDTByTokenAddress,
  IdeaToken,
} from 'store/ideaMarketsStore'
import ModalService from 'components/modals/ModalService'
import WalletFilters from './WalletFilters'
import { useMarketStore } from 'store/markets'
import RatingsTable from 'modules/ratings/components/RatingsTable'
import {
  getAvgRatingForIDT,
  getUsersLatestOpinions,
} from 'modules/ratings/services/OpinionService'
import RateModal from 'components/trade/RateModal'
import { GlobalContext } from 'lib/GlobalContext'

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
  enabled: false,
  keepPreviousData: true,
}

type Props = {
  userData?: any
}

export default function ProfileWallet({ userData }: Props) {
  const web3 = useWalletStore((state) => state)
  const address = useWalletStore((state) => state.address)

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const [isVerifiedFilterActive, setIsVerifiedFilterActive] = useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [isLockedFilterActive, setIsLockedFilterActive] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')

  const [table, setTable] = useState('ratings')
  const [orderBy, setOrderBy] = useState('avgRating')
  const [orderDirection, setOrderDirection] = useState('desc')

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

  const allMarkets = useMarketStore((state) => state.markets)
  const marketNames = allMarkets.map((m) => m?.market?.name)

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
    ['owned-tokens'],
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
  }

  useEffect(() => {
    const storedMarkets = JSON.parse(localStorage.getItem('STORED_MARKETS'))

    const initialMarkets = storedMarkets
      ? [...storedMarkets]
      : ['All', ...marketNames]

    setSelectedMarkets(new Set(initialMarkets))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMarkets])

  useEffect(() => {
    if (selectedMarkets && selectedMarkets?.size !== 0) {
      // Do not refetch until markets loaded because if you do, the first load of tokens does not work for some reason
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    web3,
    orderBy,
    orderDirection,
    userData,
    selectedMarkets,
    allMarkets,
    isStarredFilterActive,
    isLockedFilterActive,
    nameSearch,
  ])

  async function ratingsQueryFunction(numTokens: number, skip: number = 0) {
    const latestUserOpinions = await getUsersLatestOpinions(address)
    // Add in the token here by doing subgraph call
    const ratingsPairs = await Promise.all(
      latestUserOpinions?.map(async (opinion: any) => {
        const idt = await querySingleIDTByTokenAddress(opinion?.addy)
        const avgRating = await getAvgRatingForIDT(opinion?.addy)
        return { opinion: { ...opinion, avgRating }, idt }
      })
    )

    if (orderBy === 'userRating') {
      ratingsPairs?.sort((p1: any, p2: any) => {
        return orderDirection === 'desc'
          ? p2.opinion.rating - p1.opinion.rating
          : p1.opinion.rating - p2.opinion.rating
      })
    } else if (orderBy === 'avgRating') {
      ratingsPairs?.sort((p1: any, p2: any) => {
        return orderDirection === 'desc'
          ? p2.opinion.avgRating - p1.opinion.avgRating
          : p1.opinion.avgRating - p2.opinion.avgRating
      })
    }

    return ratingsPairs || []
  }

  async function ownedQueryFunction(numTokens: number, skip: number = 0) {
    if (!allMarkets || allMarkets?.length <= 0) return []

    const finalAddress = userData?.walletAddress
    const filteredMarkets = allMarkets
      .map((m) => m?.market)
      .filter((m) => selectedMarkets.has(m.name))

    const { holdings } = await queryOwnedTokensMaybeMarket(
      finalAddress,
      filteredMarkets,
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
    if (!allMarkets || allMarkets?.length <= 0) return []

    const finalAddress = userData?.walletAddress
    const filteredMarkets = allMarkets
      .map((m) => m?.market)
      .filter((m) => selectedMarkets.has(m.name))

    const { trades } = await queryMyTrades(
      finalAddress,
      filteredMarkets,
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

  const onMarketChanged = (markets) => {
    localStorage.setItem('STORED_MARKETS', JSON.stringify([...markets]))
    setSelectedMarkets(markets)
  }

  const onRateClicked = (token: IdeaToken, urlMetaData: any) => {
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
    <div className="w-full h-full mt-8 pb-20">
      <div className="flex flex-col justify-between sm:flex-row mb-0 md:mb-4">
        <div className="flex order-1 md:order-none">
          <div
            className={classNames(
              table === 'ratings'
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6 ml-auto'
            )}
            onClick={() => {
              setTable('ratings')
              setOrderBy('userRating')
              setOrderDirection('desc')
            }}
          >
            Ratings
          </div>
          <div
            className={classNames(
              table === 'holdings'
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6 ml-auto'
            )}
            onClick={() => {
              setTable('holdings')
              setOrderBy('price')
              setOrderDirection('desc')
            }}
          >
            Wallet Holdings
          </div>
          <div
            className={classNames(
              table === 'trades'
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 mr-auto'
            )}
            onClick={() => {
              setTable('trades')
              setOrderBy('date')
              setOrderDirection('desc')
            }}
          >
            Trades History
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray ">
        <WalletFilters
          selectedMarkets={selectedMarkets}
          isVerifiedFilterActive={isVerifiedFilterActive}
          isStarredFilterActive={isStarredFilterActive}
          isLockedFilterActive={isLockedFilterActive}
          nameSearch={nameSearch}
          onMarketChanged={onMarketChanged}
          onNameSearchChanged={setNameSearch}
          setIsVerifiedFilterActive={setIsVerifiedFilterActive}
          setIsStarredFilterActive={setIsStarredFilterActive}
          setIsLockedFilterActive={setIsLockedFilterActive}
        />
        <div className="border-t border-brand-border-gray dark:border-gray-500 shadow-home ">
          {!web3 && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  ModalService.open(WalletModal)
                }}
                className="my-40 p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
              >
                Connect Wallet to View
              </button>
            </div>
          )}
          {table === 'ratings' &&
            !selectedMarkets?.has('None') &&
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

          {table === 'holdings' &&
            !selectedMarkets?.has('None') &&
            web3 !== undefined && (
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

          {table === 'trades' &&
            !selectedMarkets?.has('None') &&
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
    </div>
  )
}
