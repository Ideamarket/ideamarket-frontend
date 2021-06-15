import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/dist/client/router'
import { useQuery } from 'react-query'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import {
  queryCDaiBalance,
  queryExchangeRate,
  investmentTokenToUnderlying,
} from 'store/compoundStore'
import {
  web3BNToFloatString,
  bigNumberTenPow18,
  formatNumberWithCommasAsThousandsSerperator,
} from 'utils'
import {
  Table,
  TradeModal,
  ListTokenModal,
  A,
  DefaultLayout,
  WalletModal,
} from 'components'
import ModalService from 'components/modals/ModalService'
import { NETWORK } from 'store/networks'

import Plus from '../assets/plus-white.svg'
import { GlobalContext } from './_app'
import { useWalletStore } from 'store/walletStore'
import { Categories } from 'store/models/category'
import { ScrollToTop } from 'components/tokens/ScrollToTop'
import { getMarketSpecifics } from 'store/markets'
import { NextSeo } from 'next-seo'
import {
  OverviewFilters,
  Filters,
  DropdownFilters,
} from 'components/tokens/OverviewFilters'
import classNames from 'classnames'

export default function Home() {
  const defaultColumns = [
    {
      id: 1,
      name: 'Rank',
      content: 'Rank',
      value: 'rank',
      sortable: true,
      isOptional: false,
    },
    {
      id: 2,
      name: 'Market',
      content: '',
      value: 'market',
      sortable: false,
      isOptional: false,
    },
    {
      id: 3,
      name: 'Name',
      content: 'Name',
      value: 'name',
      sortable: true,
      isOptional: false,
    },
    {
      id: 4,
      name: 'Price',
      content: 'Price',
      value: 'price',
      sortable: true,
      isOptional: false,
    },
    {
      id: 5,
      name: 'Deposits',
      content: 'Deposits',
      value: 'deposits',
      sortable: true,
      isOptional: true,
    },
    {
      id: 6,
      name: '% Locked',
      content: '% Locked',
      value: 'locked',
      sortable: true,
      isOptional: true,
    },
    {
      id: 7,
      name: '1YR Income',
      content: '1YR Income',
      value: 'income',
      sortable: true,
      isOptional: true,
    },
    {
      id: 8,
      name: 'Trade',
      content: 'Trade',
      value: 'trade',
      sortable: false,
      isOptional: false,
    },
    {
      id: 9,
      name: 'Watch',
      content: 'Watch',
      value: 'watch',
      sortable: false,
      isOptional: false,
    },
  ]

  const [selectedFilterId, setSelectedFilterId] = useState(Filters.TOP.id)
  const [selectedMarkets, setSelectedMarkets] = useState(new Set([]))
  const [selectedColumns, setSelectedColumns] = useState(new Set([]))

  const [nameSearch, setNameSearch] = useState('')

  const interestManagerAddress = NETWORK.getDeployedAddresses().interestManager

  const visibleColumns = defaultColumns.filter(
    (h) => !h.isOptional || selectedColumns.has(h.name)
  )

  useEffect(() => {
    const storedMarkets = JSON.parse(localStorage.getItem('STORED_MARKETS'))
    const initialMarkets = storedMarkets
      ? [...storedMarkets]
      : DropdownFilters.PLATFORMS.values
    setSelectedMarkets(new Set(initialMarkets))

    const storedColumns = JSON.parse(localStorage.getItem('STORED_COLUMNS'))
    const initialColumns = storedColumns
      ? [...storedColumns]
      : DropdownFilters.COLUMNS.values
    setSelectedColumns(new Set(initialColumns))
  }, [])

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery('compound-exchange-rate', queryExchangeRate, {
    refetchOnWindowFocus: false,
  })

  const {
    data: interestManagerCDaiBalance,
    isLoading: isInterestManagerCDaiBalance,
  } = useQuery(
    ['interest-manager-cdai-balance', interestManagerAddress],
    queryCDaiBalance,
    {
      refetchOnWindowFocus: false,
    }
  )
  const cDaiBalanceInDai = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(
      investmentTokenToUnderlying(
        interestManagerCDaiBalance,
        compoundExchangeRate
      ),
      bigNumberTenPow18,
      0
    )
  )

  const router = useRouter()
  const { setOnWalletConnectedCallback, isEmailHeaderActive } =
    useContext(GlobalContext)

  function onNameSearchChanged(nameSearch) {
    setSelectedFilterId(Categories.TOP.id)
    setNameSearch(nameSearch)
  }

  function onCategoryChanged(categoryID: number) {
    setSelectedFilterId(categoryID)
  }

  function onOrderByChanged(orderBy: string, direction: string) {
    if (selectedFilterId === Categories.STARRED.id) {
      return
    }

    if (orderBy === 'dayChange' && direction === 'desc') {
      setSelectedFilterId(Categories.HOT.id)
    } else if (orderBy === 'listedAt' && direction === 'desc') {
      setSelectedFilterId(Categories.NEW.id)
    } else {
      setSelectedFilterId(Categories.TOP.id)
    }
  }

  function onTradeClicked(token: IdeaToken, market: IdeaMarket) {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(TradeModal, { ideaToken: token, market })
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(TradeModal, { ideaToken: token, market })
    }
  }

  function onListTokenClicked() {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(ListTokenModal)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(ListTokenModal)
    }
  }

  function onMarketChanged(markets) {
    localStorage.setItem('STORED_MARKETS', JSON.stringify([...markets]))
    setSelectedMarkets(markets)
  }

  function onColumnChanged(columns) {
    localStorage.setItem('STORED_COLUMNS', JSON.stringify([...columns]))
    setSelectedColumns(columns)
  }

  return (
    <>
      <NextSeo title="Home" />
      <div
        className={classNames(
          'overflow-x-hidden bg-brand-gray dark:bg-gray-900',
          isEmailHeaderActive && router.pathname === '/'
            ? 'py-32 md:py-28'
            : 'py-16'
        )}
      >
        <div className="w-screen px-6 pt-10 pb-40 text-center text-white dark:text-gray-200 bg-cover bg-top-mobile md:bg-top-desktop">
          <div>
            <h2 className="text-3xl md:text-6xl font-gilroy-bold">
              The credibility layer{' '}
              <span className="text-brand-blue">of the internet</span>
            </h2>
            <p className="mt-8 text-lg md:text-2xl font-sf-compact-medium">
              Profit by discovering the world’s best information.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center">
            <button
              onClick={() => {
                onListTokenClicked()
              }}
              className="py-2 mt-10 text-lg font-bold text-white rounded-lg w-44 font-sf-compact-medium bg-brand-blue hover:bg-blue-800"
            >
              <div className="flex flex-row items-center justify-center">
                <Plus width="30" height="30" />
                <div className="ml-0.5 md:ml-2">Add Listing</div>
              </div>
            </button>
            <button
              className="py-2 mt-3 md:mt-10 md:ml-5 text-lg font-bold text-white rounded-lg w-44 font-sf-compact-medium border-white border hover:bg-white hover:text-brand-blue"
              onClick={() =>
                window.open(
                  'https://chrome.google.com/webstore/detail/ideamarket/hgpemhabnkecancnpcdilfojngkoahei',
                  '_blank'
                )
              }
            >
              Browser Extension
            </button>
          </div>
          <div className="flex flex-col items-center justify-center mt-10 text-md md:text-3xl font-gilroy-bold md:flex-row">
            <div className="text-2xl text-brand-blue md:text-5xl">
              ${cDaiBalanceInDai}
            </div>
            <div className="md:ml-2">in credibility crowdsourced</div>
          </div>
        </div>

        <div className="px-2 mx-auto transform md:px-4 max-w-88 md:max-w-304 -translate-y-28 font-sf-compact-medium">
          <OverviewFilters
            selectedFilterId={selectedFilterId}
            selectedMarkets={selectedMarkets}
            selectedColumns={selectedColumns}
            markets={getMarketSpecifics()}
            onMarketChanged={onMarketChanged}
            setSelectedFilterId={setSelectedFilterId}
            onColumnChanged={onColumnChanged}
            onNameSearchChanged={onNameSearchChanged}
          />

          <div className="bg-white border border-brand-gray-3 dark:border-gray-500 rounded-b-xlg shadow-home">
            {/* selectedMarkets is empty on load. If none selected, it will have 1 element called 'None' */}
            {visibleColumns && selectedMarkets.size > 0 && (
              <Table
                nameSearch={nameSearch}
                selectedMarkets={selectedMarkets}
                selectedFilterId={selectedFilterId}
                columnData={visibleColumns}
                getColumn={(column) => selectedColumns.has(column)}
                onOrderByChanged={onOrderByChanged}
                onTradeClicked={onTradeClicked}
              />
            )}
          </div>
        </div>

        <ScrollToTop />
      </div>
    </>
  )
}

Home.layoutProps = {
  Layout: DefaultLayout,
}
