import { DefaultLayout } from 'components'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { Table, TradeModal, WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'

import { useWalletStore } from 'store/walletStore'
import { ScrollToTop } from 'components/tokens/ScrollToTop'
import { NextSeo } from 'next-seo'
import { OverviewFilters } from 'components/tokens/OverviewFilters'
import { GlobalContext } from 'pages/_app'
import {
  getVisibleColumns,
  startingOptionalColumns,
} from 'components/home/utils'
import { HomeHeader } from 'components'
import { CheckboxFilters } from 'components/tokens/utils/OverviewUtils'
import RateModal from 'components/trade/RateModal'
import { SortOptionsHomeTable } from 'utils/tables'

type Props = { urlMarkets?: string[] }

const Home = ({ urlMarkets }: Props) => {
  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')
  const [orderBy, setOrderBy] = useState(SortOptionsHomeTable.AVG_RATING.value)
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [selectedCategories, setSelectedCategories] = useState([])

  const visibleColumns = getVisibleColumns(selectedColumns)

  if (
    startingOptionalColumns.length ===
    CheckboxFilters.COLUMNS.values.length - 1
  ) {
    startingOptionalColumns.push('All')
  }

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  useEffect(() => {
    // TODO: remove this once WIKI and MINDS no longer only default selected
    if (localStorage.getItem('clearStorage') !== '8') {
      localStorage.clear()
      localStorage.setItem('clearStorage', '8')
    }

    const storedColumns = JSON.parse(localStorage.getItem('STORED_COLUMNS'))

    const initialColumns = storedColumns || startingOptionalColumns
    setSelectedColumns(new Set(initialColumns))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onNameSearchChanged = (nameSearch) => {
    setOrderBy(SortOptionsHomeTable.AVG_RATING.value)
    setNameSearch(nameSearch)
  }

  const onOrderByChanged = (orderBy: string, direction: string) => {
    setOrderBy(orderBy)
    setOrderDirection(direction as any)
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

  const onColumnChanged = (columns) => {
    localStorage.setItem('STORED_COLUMNS', JSON.stringify([...columns]))
    setSelectedColumns(columns)
  }

  const overviewFiltersProps = {
    orderBy,
    selectedColumns,
    isStarredFilterActive,
    selectedCategories,
    setOrderBy,
    onColumnChanged,
    onNameSearchChanged,
    setIsStarredFilterActive,
    setSelectedCategories,
  }

  const tableProps = {
    nameSearch,
    orderBy,
    orderDirection,
    isStarredFilterActive,
    columnData: visibleColumns,
    selectedCategories,
    getColumn: (column) => selectedColumns.has(column),
    onOrderByChanged,
    onTradeClicked,
    onRateClicked,
    tradeOrListSuccessToggle,
    setSelectedCategories,
    setIsStarredFilterActive,
  }
  return (
    <>
      <NextSeo title="Home" />
      <div className="overflow-x-hidden lg:overflow-x-visible bg-brand-gray dark:bg-gray-900">
        <HomeHeader />
        <div className="mx-auto transform md:px-4 md:max-w-304 -translate-y-28 font-inter">
          <OverviewFilters {...overviewFiltersProps} />
          <div className="bg-white border-brand-gray-3 dark:border-gray-500 rounded-b-xlg shadow-home">
            {visibleColumns && <Table {...tableProps} />}
          </div>
        </div>
        <ScrollToTop />
      </div>
    </>
  )
}

export default Home

Home.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>
