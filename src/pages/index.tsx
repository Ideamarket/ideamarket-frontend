import { DefaultLayout } from 'components'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { Table, WalletModal } from 'components'
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
import { SortOptionsHomePostsTable, TABLE_NAMES } from 'utils/tables'
import { MenuAlt2Icon, UserIcon } from '@heroicons/react/outline'
import classNames from 'classnames'

type Props = { urlMarkets?: string[] }

const Home = ({ urlMarkets }: Props) => {
  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')
  const [orderBy, setOrderBy] = useState(
    SortOptionsHomePostsTable.AVG_RATING.value
  )
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTable, setSelectedTable] = useState(TABLE_NAMES.HOME_POSTS)

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
    setOrderBy(SortOptionsHomePostsTable.AVG_RATING.value)
    setNameSearch(nameSearch)
  }

  const onOrderByChanged = (orderBy: string, direction: string) => {
    setOrderBy(orderBy)
    setOrderDirection(direction as any)
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

        {/* 2 buttons: Posts and Users */}
        <div className="flex items-center space-x-3 mx-2 md:mx-auto md:px-4 mb-5 pt-10 md:max-w-304 transform -translate-y-40">
          <button
            onClick={() => setSelectedTable(TABLE_NAMES.HOME_POSTS)}
            className={classNames(
              selectedTable === TABLE_NAMES.HOME_POSTS
                ? 'bg-white/[.2]'
                : 'hover:bg-white/[.05]',
              'w-1/2 h-20 p-3 border border-white/[.2] rounded-xl text-white text-left'
            )}
          >
            <div className="flex items-center">
              <MenuAlt2Icon className="w-5" />
              <span className="text-lg font-bold ml-2">Posts</span>
            </div>
            <div className="text-xs">The most confident opinions</div>
          </button>

          <button
            onClick={() => setSelectedTable(TABLE_NAMES.HOME_USERS)}
            className={classNames(
              selectedTable === TABLE_NAMES.HOME_USERS
                ? 'bg-white/[.2]'
                : 'hover:bg-white/[.05]',
              'w-1/2 h-20 p-3 border border-white/[.2] rounded-xl text-white text-left'
            )}
          >
            <div className="flex items-center">
              <UserIcon className="w-5" />
              <span className="text-lg font-bold ml-2">Users</span>
            </div>
            <div className="text-xs">The most trusted voices</div>
          </button>
        </div>

        {/* Transform and translate place table on top of background image defined in HomeHeader */}
        <div className="mx-auto transform md:px-4 md:max-w-304 -translate-y-40 font-inter">
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
