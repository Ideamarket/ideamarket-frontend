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
import { HomeHeader } from 'components'
import {
  CheckboxFilters,
  MainFilters,
} from 'components/tokens/utils/OverviewUtils'

type Props = { urlMarkets?: string[] }

const Home = ({ urlMarkets }: Props) => {
  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [selectedFilterId, setSelectedFilterId] = useState(MainFilters.TOP.id)
  const [isVerifiedFilterActive, setIsVerifiedFilterActive] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState(new Set([]))
  const [selectedColumns, setSelectedColumns] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')

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
    setSelectedFilterId(MainFilters.TOP.id)
    setNameSearch(nameSearch)
  }

  const onOrderByChanged = (orderBy: string, direction: string) => {
    if (
      selectedFilterId === MainFilters.STARRED.id ||
      selectedFilterId === MainFilters.VERIFIED.id
    ) {
      return
    }
    if (orderBy === 'dayChange' && direction === 'desc') {
      setSelectedFilterId(MainFilters.HOT.id)
    } else if (orderBy === 'listedAt' && direction === 'desc') {
      setSelectedFilterId(MainFilters.NEW.id)
    } else {
      setSelectedFilterId(MainFilters.TOP.id)
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

  const onMarketChanged = (markets) => {
    localStorage.setItem('STORED_MARKETS', JSON.stringify([...markets]))
    setSelectedMarkets(markets)
  }

  const onColumnChanged = (columns) => {
    localStorage.setItem('STORED_COLUMNS', JSON.stringify([...columns]))
    setSelectedColumns(columns)
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
    onMarketChanged,
    setSelectedFilterId,
    onColumnChanged,
    onNameSearchChanged,
    setIsVerifiedFilterActive,
  }

  const tableProps = {
    nameSearch,
    selectedMarkets,
    selectedFilterId,
    isVerifiedFilterActive,
    columnData: visibleColumns,
    getColumn: (column) => selectedColumns.has(column),
    onOrderByChanged,
    onTradeClicked,
    tradeOrListSuccessToggle,
  }
  return (
    <>
      <NextSeo title="Home" />
      <div className="overflow-x-hidden lg:overflow-x-visible bg-brand-gray dark:bg-gray-900">
        <HomeHeader {...headerProps} />
        <div className="px-2 mx-auto transform md:px-4 max-w-88 md:max-w-304 -translate-y-28 font-inter">
          <OverviewFilters {...overviewFiltersProps} />
          <div className="bg-white border border-brand-gray-3 dark:border-gray-500 rounded-b-xlg shadow-home">
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
