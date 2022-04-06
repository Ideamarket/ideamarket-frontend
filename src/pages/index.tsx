import { DefaultLayout } from 'components'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { Table, TradeModal, WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'

import { useWalletStore } from 'store/walletStore'
import { ScrollToTop } from 'components/tokens/ScrollToTop'
import { NextSeo } from 'next-seo'
import { OverviewFilters } from 'components/tokens/OverviewFilters'
import { useMarketStore } from 'store/markets'
import { GlobalContext } from 'pages/_app'
import {
  getVisibleColumns,
  startingOptionalColumns,
} from 'components/home/utils'
import { GhostHomeHeader } from 'components'
import {
  CheckboxFilters,
  SortOptions,
} from 'components/tokens/utils/OverviewUtils'
import RateModal from 'components/trade/RateModal'

type Props = { urlMarkets?: string[] }

const Home = ({ urlMarkets }: Props) => {
  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [selectedFilterId, setSelectedFilterId] = useState(SortOptions.HOT.id)
  const [isVerifiedFilterActive, setIsVerifiedFilterActive] = useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [isGhostOnlyActive, setIsGhostOnlyActive] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState(new Set([]))
  const [selectedColumns, setSelectedColumns] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')
  const [orderBy, setOrderBy] = useState('avgRating')
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [selectedCategories, setSelectedCategories] = useState([])

  const visibleColumns = getVisibleColumns(selectedColumns)

  if (
    startingOptionalColumns.length ===
    CheckboxFilters.COLUMNS.values.length - 1
  ) {
    startingOptionalColumns.push('All')
  }
  const markets = useMarketStore((state) => state.markets)
  const marketNames = markets.map((m) => m?.market?.name)

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  useEffect(() => {
    // TODO: remove this once WIKI and MINDS no longer only default selected
    if (localStorage.getItem('clearStorage') !== '8') {
      localStorage.clear()
      localStorage.setItem('clearStorage', '8')
    }

    const storedMarkets = JSON.parse(localStorage.getItem('STORED_MARKETS'))

    const initialMarkets = urlMarkets
      ? urlMarkets
      : storedMarkets
      ? [...storedMarkets]
      : ['All', ...marketNames]

    setSelectedMarkets(new Set(initialMarkets))
    const storedColumns = JSON.parse(localStorage.getItem('STORED_COLUMNS'))

    const initialColumns = storedColumns || startingOptionalColumns
    setSelectedColumns(new Set(initialColumns))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets])

  const onNameSearchChanged = (nameSearch) => {
    setSelectedFilterId(SortOptions.TOP.id)
    setNameSearch(nameSearch)
  }

  const onOrderByChanged = (orderBy: string, direction: string) => {
    setOrderBy(orderBy)
    setOrderDirection(direction as any)
    if (orderBy === 'dayChange' && direction === 'desc') {
      setSelectedFilterId(SortOptions.HOT.id)
    } else if (orderBy === 'listedAt' && direction === 'desc') {
      setSelectedFilterId(SortOptions.NEW.id)
    } else {
      setSelectedFilterId(SortOptions.TOP.id)
    }
  }

  const onSelectedFilterByIdChanged = (filterId: number) => {
    setSelectedFilterId(filterId)

    if (filterId === SortOptions.HOT.id) {
      setOrderBy('dayChange')
      setOrderDirection('desc')
    } else if (filterId === SortOptions.TOP.id) {
      setOrderBy('price')
      setOrderDirection('desc')
    } else if (filterId === SortOptions.NEW.id) {
      setOrderBy('listedAt')
      setOrderDirection('desc')
    }
  }

  const onTradeClicked = (token: IdeaToken, market: IdeaMarket) => {
    const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)

    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(TradeModal, { ideaToken: token, market }, onClose)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(TradeModal, { ideaToken: token, market }, onClose)
    }
  }

  const onRateClicked = (token: IdeaToken, urlMetaData: any) => {
    const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)

    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(RateModal, { ideaToken: token, urlMetaData }, onClose)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, { ideaToken: token, urlMetaData }, onClose)
    }
  }

  const onMarketChanged = (markets) => {
    localStorage.setItem('STORED_MARKETS', JSON.stringify([...markets]))
    setSelectedMarkets(markets)
  }

  const onColumnChanged = (columns) => {
    localStorage.setItem('STORED_COLUMNS', JSON.stringify([...columns]))
    setSelectedColumns(columns)
  }

  /**
   * This method is called when Ghost Filter is clicked.
   * @param isActive -- the new state of the Ghost Filter after click
   */
  const onGhostFilterClicked = (isActive: boolean) => {
    if (isActive) {
      onOrderByChanged('totalVotes', 'desc')
    } else {
      onOrderByChanged('dayChange', 'desc')
    }

    setIsGhostOnlyActive(isActive)
  }

  const headerProps = {
    setTradeOrListSuccessToggle,
    tradeOrListSuccessToggle,
  }

  const overviewFiltersProps = {
    selectedFilterId,
    selectedMarkets,
    selectedColumns,
    isVerifiedFilterActive,
    isStarredFilterActive,
    isGhostOnlyActive,
    selectedCategories,
    onMarketChanged,
    setSelectedFilterId: onSelectedFilterByIdChanged,
    onColumnChanged,
    onNameSearchChanged,
    setIsVerifiedFilterActive,
    setIsStarredFilterActive,
    setIsGhostOnlyActive: onGhostFilterClicked,
    setSelectedCategories,
  }

  const tableProps = {
    nameSearch,
    orderBy,
    orderDirection,
    selectedMarkets,
    selectedFilterId,
    isVerifiedFilterActive,
    isStarredFilterActive,
    isGhostOnlyActive,
    columnData: visibleColumns,
    selectedCategories,
    getColumn: (column) => selectedColumns.has(column),
    onOrderByChanged,
    onTradeClicked,
    onRateClicked,
    onMarketChanged,
    tradeOrListSuccessToggle,
    setSelectedCategories,
    setIsStarredFilterActive,
  }
  return (
    <>
      <NextSeo title="Home" />
      <div className="overflow-x-hidden lg:overflow-x-visible bg-brand-gray dark:bg-gray-900">
        <GhostHomeHeader {...headerProps} />
        <div className="mx-auto transform md:px-4 md:max-w-304 -translate-y-28 font-inter">
          <OverviewFilters {...overviewFiltersProps} />
          <div className="bg-white border-brand-gray-3 dark:border-gray-500 rounded-b-xlg shadow-home">
            {/* selectedMarkets is empty on load. If none selected, it will have 1 element called 'None' */}
            {visibleColumns && selectedMarkets.size > 0 && (
              <Table {...tableProps} />
            )}
          </div>
        </div>
        <ScrollToTop />
      </div>
    </>
  )
}

export default Home

Home.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>
