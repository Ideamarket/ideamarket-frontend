import React, { useContext, useEffect, useState } from 'react'
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
import { Table, TradeModal, ListTokenModal, WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'
import { NETWORK } from 'store/networks'
import Plus from '../assets/plus-white.svg'
import { GlobalContext } from '../pages/_app'
import { useWalletStore } from 'store/walletStore'
import { ScrollToTop } from 'components/tokens/ScrollToTop'
import { NextSeo } from 'next-seo'
import {
  OverviewFilters,
  Filters,
  DropdownFilters,
} from 'components/tokens/OverviewFilters'
import { useMarketStore } from 'store/markets'

export default function Home({ urlMarkets }: { urlMarkets?: string[] }) {
  const defaultColumns = [
    {
      id: 1,
      name: 'Rank',
      content: 'Rank',
      value: 'rank',
      sortable: true,
      isOptional: false,
      isSelectedAtStart: true,
    },
    {
      id: 2,
      name: 'Market',
      content: '',
      value: 'market',
      sortable: false,
      isOptional: false,
      isSelectedAtStart: true,
    },
    {
      id: 3,
      name: 'Name',
      content: 'Name',
      value: 'name',
      sortable: true,
      isOptional: false,
      isSelectedAtStart: true,
    },
    {
      id: 4,
      name: 'Price',
      content: 'Price',
      value: 'price',
      sortable: true,
      isOptional: false,
      isSelectedAtStart: true,
    },
    {
      id: 5,
      name: '24H Change',
      content: '24H Change',
      value: 'change',
      sortable: true,
      isOptional: true,
      isSelectedAtStart: false,
    },
    {
      id: 6,
      name: 'Deposits',
      content: 'Deposits',
      value: 'deposits',
      sortable: true,
      isOptional: true,
      isSelectedAtStart: true,
    },
    {
      id: 7,
      name: '% Locked',
      content: '% Locked',
      value: 'locked',
      sortable: true,
      isOptional: true,
      isSelectedAtStart: true,
    },
    {
      id: 8,
      name: '1YR Income',
      content: '1YR Income',
      value: 'income',
      sortable: true,
      isOptional: true,
      isSelectedAtStart: true,
    },
    {
      id: 9,
      name: 'Claimable Income',
      content: 'Claimable Income',
      value: 'claimable',
      sortable: false,
      isOptional: true,
      isSelectedAtStart: false,
    },
    {
      id: 10,
      name: 'Trade',
      content: '',
      value: 'trade',
      sortable: false,
      isOptional: false,
      isSelectedAtStart: true,
    },
  ]

  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [selectedFilterId, setSelectedFilterId] = useState(Filters.TOP.id)
  const [selectedMarkets, setSelectedMarkets] = useState(new Set([]))
  const [selectedColumns, setSelectedColumns] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')
  const interestManagerAddress = NETWORK.getDeployedAddresses().interestManager
  const visibleColumns = defaultColumns.filter(
    (h) => !h.isOptional || selectedColumns.has(h.name)
  )
  const startingOptionalColumns = defaultColumns
    .filter(
      (c) =>
        c.isSelectedAtStart && DropdownFilters.COLUMNS.values.includes(c.name)
    )
    .map((c) => c.name)
  if (
    startingOptionalColumns.length ===
    DropdownFilters.COLUMNS.values.length - 1
  ) {
    startingOptionalColumns.push('All')
  }
  const markets = useMarketStore((state) => state.markets)
  const marketNames = markets.map((m) => m?.market?.name)

  useEffect(() => {
    const storedMarkets = JSON.parse(localStorage.getItem('STORED_MARKETS'))

    const initialMarkets = urlMarkets
      ? urlMarkets
      : storedMarkets
      ? [...storedMarkets]
      : ['All', ...marketNames]
    setSelectedMarkets(new Set(initialMarkets))
    const storedColumns = JSON.parse(localStorage.getItem('STORED_COLUMNS'))
    const initialColumns = storedColumns
      ? [...storedColumns]
      : startingOptionalColumns
    setSelectedColumns(new Set(initialColumns))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets])

  const { data: compoundExchangeRate } = useQuery(
    'compound-exchange-rate',
    queryExchangeRate,
    {
      refetchOnWindowFocus: false,
    }
  )
  const { data: interestManagerCDaiBalance } = useQuery(
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
  const { setOnWalletConnectedCallback } = useContext(GlobalContext)
  function onNameSearchChanged(nameSearch) {
    setSelectedFilterId(Filters.TOP.id)
    setNameSearch(nameSearch)
  }
  function onOrderByChanged(orderBy: string, direction: string) {
    if (
      selectedFilterId === Filters.STARRED.id ||
      selectedFilterId === Filters.VERIFIED.id
    ) {
      return
    }
    if (orderBy === 'dayChange' && direction === 'desc') {
      setSelectedFilterId(Filters.HOT.id)
    } else if (orderBy === 'listedAt' && direction === 'desc') {
      setSelectedFilterId(Filters.NEW.id)
    } else {
      setSelectedFilterId(Filters.TOP.id)
    }
  }
  function onTradeClicked(token: IdeaToken, market: IdeaMarket) {
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
  function onListTokenClicked() {
    const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(ListTokenModal, {}, onClose)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(ListTokenModal, {}, onClose)
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
      <div className="overflow-x-hidden lg:overflow-x-visible bg-brand-gray dark:bg-gray-900">
        <div className="px-6 pt-10 pb-40 text-center text-white bg-cover dark:text-gray-200 bg-top-mobile md:bg-top-desktop">
          <div>
            <h2 className="text-3xl md:text-6xl font-gilroy-bold">
              The credibility layer{' '}
              <span className="text-brand-blue">of the internet</span>
            </h2>
            <p className="mt-8 text-lg md:text-2xl font-sf-compact-medium">
              Profit by discovering the world’s best information.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center md:flex-row">
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
              className="py-2 mt-3 text-lg font-bold text-white border border-white rounded-lg md:mt-10 md:ml-5 w-44 font-sf-compact-medium hover:bg-white hover:text-brand-blue"
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
                tradeOrListSuccessToggle={tradeOrListSuccessToggle}
              />
            )}
          </div>
        </div>
        <ScrollToTop />
      </div>
    </>
  )
}
