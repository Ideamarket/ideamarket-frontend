import React, { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import { flatten } from 'lodash'

import { WEEK_SECONDS } from 'utils'
import {
  IdeaToken,
  IdeaMarket,
  queryMarket,
  queryTokens,
} from 'store/ideaMarketsStore'
import { querySupplyRate, queryExchangeRate } from 'store/compoundStore'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import TokenRow from './OverviewTokenRow'
import TokenRowSkeleton from './OverviewTokenRowSkeleton'
import { Categories } from 'store/models/category'
import { Header } from './table/Header'

type Props = {
  selectedMarketName: string
  selectedCategoryId: number
  nameSearch: string
  onOrderByChanged: (o: string, d: string) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
}

export default function Table({
  selectedMarketName,
  selectedCategoryId,
  nameSearch,
  onOrderByChanged,
  onTradeClicked,
}: Props) {
  const TOKENS_PER_PAGE = 10
  const LOADING_MARGIN = 200

  const [currentHeader, setCurrentHeader] = useState('rank')
  const [orderBy, setOrderBy] = useState('rank')
  const [orderDirection, setOrderDirection] = useState('asc')
  const [market, setMarket] = useState<IdeaMarket>()
  const canFetchMoreRef = useRef<boolean>()

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens =
    selectedCategoryId === Categories.STARRED.id ? watchingTokens : undefined

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery(
    'compound-exchange-rate',
    queryExchangeRate,

    {
      refetchOnWindowFocus: false,
    }
  )

  const {
    data: compoundSupplyRate,
    isLoading: isCompoundSupplyRateLoading,
  } = useQuery('compound-supply-rate', querySupplyRate, {
    refetchOnWindowFocus: false,
  })

  const { isLoading: isMarketLoading, refetch: refetchMarket } = useQuery(
    [`market-${selectedMarketName}`, selectedMarketName],
    queryMarket,
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  )

  const {
    data: infiniteData,
    isFetching: isTokenDataLoading,
    fetchMore,
    refetch,
    canFetchMore,
  } = useInfiniteQuery(
    [
      `tokens-${selectedMarketName}`,
      [
        market,
        TOKENS_PER_PAGE,
        WEEK_SECONDS,
        selectedCategoryId === Categories.HOT.id
          ? 'dayChange'
          : selectedCategoryId === Categories.NEW.id
          ? 'listedAt'
          : orderBy,
        selectedCategoryId === Categories.HOT.id ||
        selectedCategoryId === Categories.NEW.id
          ? 'desc'
          : orderDirection,
        nameSearch,
        filterTokens,
      ],
    ],
    queryTokens,
    {
      getFetchMore: (lastGroup, allGroups) => {
        const morePagesExist = lastGroup?.length === 10

        if (!morePagesExist) {
          return false
        }

        return allGroups.length * TOKENS_PER_PAGE
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: false,
    }
  )

  canFetchMoreRef.current = canFetchMore

  const tokenData = flatten(infiniteData || [])

  useEffect(() => {
    const fetch = async () => {
      const market = await refetchMarket()
      setMarket(market)
    }
    fetch()
  }, [selectedMarketName])

  useEffect(() => {
    if (!!market) {
      refetch()
    }
  }, [market, selectedCategoryId, orderBy, orderDirection, nameSearch])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const height = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const diff = height - windowHeight - currentScrollY

      if (diff < LOADING_MARGIN && canFetchMoreRef.current) {
        fetchMore()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isLoading =
    isMarketLoading ||
    isTokenDataLoading ||
    isCompoundSupplyRateLoading ||
    isCompoundExchangeRateLoading

  function headerClicked(headerValue: string) {
    if (currentHeader === headerValue) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
        onOrderByChanged(orderBy, 'desc')
      } else {
        setOrderDirection('asc')
        onOrderByChanged(orderBy, 'asc')
      }
    } else {
      setCurrentHeader(headerValue)

      if (headerValue === 'name') {
        setOrderBy('name')
        onOrderByChanged('name', 'desc')
      } else if (
        headerValue === 'price' ||
        headerValue === 'deposits' ||
        headerValue === 'income'
      ) {
        setOrderBy('supply')
        onOrderByChanged('supply', 'desc')
      } else if (headerValue === 'change') {
        setOrderBy('dayChange')
        onOrderByChanged('dayChange', 'desc')
      } else if (headerValue === 'change') {
        setOrderBy('dayChange')
        onOrderByChanged('dayChange', 'desc')
      } else if (headerValue === 'locked') {
        setOrderBy('lockedPercentage')
        onOrderByChanged('lockedAmount', 'desc')
      } else if (headerValue === 'holders') {
        setOrderBy('holders')
        onOrderByChanged('holders', 'desc')
      }

      setOrderDirection('desc')
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-t-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="hidden md:table-header-group">
                  <tr>
                    <Header
                      currentHeader={currentHeader}
                      orderDirection={orderDirection}
                      headerClicked={headerClicked}
                      isLoading={isLoading}
                      market={market}
                      compoundExchangeRate={compoundExchangeRate}
                    />
                  </tr>
                </thead>
                <tbody className="bg-white w-full divide-y divide-gray-200">
                  <TokenRowSkeleton key={'fafafaf'} />
                  {(tokenData as IdeaToken[]).map((token) => (
                    <TokenRow
                      key={market.marketID + '-' + token.tokenID}
                      token={token}
                      market={market}
                      showMarketSVG={false}
                      compoundSupplyRate={compoundSupplyRate}
                      onTradeClicked={onTradeClicked}
                    />
                  ))}
                  {isLoading
                    ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                        <TokenRowSkeleton key={token} />
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
