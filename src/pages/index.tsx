import classNames from 'classnames'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getContractAddress } from 'store/contractStore'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import {
  queryCDaiBalance,
  queryExchangeRate,
  investmentTokenToUnderlying,
} from 'store/compoundStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  web3BNToFloatString,
  bigNumberTenPow18,
  formatNumberWithCommasAsThousandsSerperator,
  isShowtimeMarketVisible,
} from 'utils'
import { Table, TradeModal, ListTokenModal, PromoVideoModal } from 'components'

import Search from '../assets/search.svg'
import { GlobalContext } from './_app'
import { useWalletStore } from 'store/walletStore'
import { Categories } from 'store/models/category'
import { HeaderButtons } from 'components/video/HeaderButtons'
import { ScrollToTop } from 'components/tokens/ScrollToTop'

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    Categories.HOT.id
  )
  const [selectedMarketName, setSelectedMarketName] = useState('Twitter')
  const [nameSearch, setNameSearch] = useState('')

  const [isPromoVideoModalOpen, setIsPromoVideoModalOpen] = useState(false)

  const interestManagerAddress = getContractAddress('interestManager')

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

  const {
    setIsWalletModalOpen,
    setOnWalletConnectedCallback,
    isListTokenModalOpen,
    setIsListTokenModalOpen,
  } = useContext(GlobalContext)
  const [tradeModalData, setTradeModalData] = useState({
    show: false,
    token: undefined,
    market: undefined,
  })

  const categories = [
    {
      id: 1,
      value: 'Top',
    },
    {
      id: 2,
      value: 'Hot',
    },
    {
      id: 3,
      value: 'New',
    },
    {
      id: 4,
      value: 'Starred',
    },
  ]

  function onMarketChanged(market) {
    setSelectedMarketName(market)
  }

  function onNameSearchChanged(nameSearch) {
    setSelectedCategoryId(Categories.TOP.id)
    setNameSearch(nameSearch)
  }

  function onCategoryChanged(categoryID: number) {
    setSelectedCategoryId(categoryID)
  }

  function onOrderByChanged(orderBy: string, direction: string) {
    if (selectedCategoryId === Categories.STARRED.id) {
      return
    }

    if (orderBy === 'dayChange' && direction === 'desc') {
      setSelectedCategoryId(Categories.HOT.id)
    } else if (orderBy === 'listedAt' && direction === 'desc') {
      setSelectedCategoryId(Categories.NEW.id)
    } else {
      setSelectedCategoryId(Categories.TOP.id)
    }
  }

  function onTradeClicked(token: IdeaToken, market: IdeaMarket) {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        setTradeModalData({ show: true, token: token, market: market })
      })
      setIsWalletModalOpen(true)
    } else {
      setTradeModalData({ show: true, token: token, market: market })
    }
  }

  function onListTokenClicked() {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        setIsListTokenModalOpen(true)
      })
      setIsWalletModalOpen(true)
    } else {
      setIsListTokenModalOpen(true)
    }
  }

  return (
    <div className="overflow-x-hidden bg-brand-gray">
      <div className="w-screen px-6 pt-12 pb-40 text-center text-white bg-cover md:pt-10 bg-top-mobile md:bg-top-desktop">
        <div>
          <div className="flex items-center justify-center space-x-12">
            <div className="w-20 md:w-36">
              <img src="/ethereum.png" alt="" />
            </div>
            <div className="w-20 md:w-36">
              <p className="text-xs text-gray-600">audited by</p>
              <img src="/qs.png" alt="" />
            </div>
          </div>
          <h2 className="mt-8 text-3xl md:mt-10 md:text-6xl font-gilroy-bold">
            Maximize return on{' '}
            <span className="text-brand-blue">attention</span>
          </h2>
          <p className="mt-8 text-lg md:text-2xl font-sf-compact-medium">
            Profit by discovering and popularizing the world’s best knowledge.
          </p>
        </div>
        <div className="flex items-center justify-center mt-8 space-x-12">
          <div className="w-20 md:w-44">
            <a
              target="_blank"
              href="https://www.nasdaq.com/articles/ideamarket-is-a-literal-marketplace-for-ideas-and-online-reputation-2021-02-19"
            >
              <img src="/nasdaq.png" alt="" />
            </a>
          </div>
          <div className="w-20 md:w-44">
            <a
              target="_blank"
              href="https://www.vice.com/en/article/pkd8nb/people-have-spent-over-dollar1-million-on-a-literal-marketplace-of-ideas"
            >
              <img src="/vice.png" alt="" />
            </a>
          </div>
          <div className="w-20 md:w-44">
            <a
              target="_blank"
              href="https://www.coindesk.com/ideamarket-online-ideas-online-reputation"
            >
              <img src="/coindesk.png" alt="" />
            </a>
          </div>
        </div>
        <HeaderButtons
          setIsPromoVideoModalOpen={setIsPromoVideoModalOpen}
          onListTokenClicked={onListTokenClicked}
        />
        <div className="mt-10 text-center text-md md:text-3xl font-gilroy-bold">
          <span className="text-2xl text-brand-blue md:text-5xl">
            ${cDaiBalanceInDai}
          </span>
          <br />
          in attention under management
        </div>
      </div>

      <div className="px-2 mx-auto transform md:px-4 max-w-88 md:max-w-304 -translate-y-28 font-sf-compact-medium">
        <div className="grid auto-cols-min grid-flow-col gap-x-2 bg-white rounded-t-lg p-4 justify-center md:justify-start">
          <button
            className={classNames(
              'p-1 border rounded-md px-3 text-sm',
              {
                'bg-very-dark-blue text-white':
                  selectedMarketName === 'Twitter',
              },
              { 'text-brand-gray-4': selectedMarketName !== 'Twitter' }
            )}
            onClick={() => {
              onMarketChanged('Twitter')
            }}
          >
            Twitter
          </button>
          <button
            className={classNames(
              'p-1 border rounded-md px-3 text-sm',
              {
                'bg-very-dark-blue text-white':
                  selectedMarketName === 'Substack',
              },
              { 'text-brand-gray-4': selectedMarketName !== 'Substack' }
            )}
            onClick={() => {
              onMarketChanged('Substack')
            }}
          >
            Substack
          </button>
          <button
            className={classNames(
              'p-1 border rounded-md px-3 text-sm',
              {
                'bg-very-dark-blue text-white':
                  selectedMarketName === 'Showtime',
              },
              { 'text-brand-gray-4': selectedMarketName !== 'Showtime' },
              { hidden: !isShowtimeMarketVisible }
            )}
            onClick={() => {
              onMarketChanged('Showtime')
            }}
          >
            Showtime
          </button>
        </div>
        <div className="bg-white border border-brand-gray-3 rounded-b-xlg shadow-home">
          <div className="flex flex-col border-b md:flex-row border-brand-gray-3">
            <div className="px-4 md:px-10">
              <div className="font-sf-pro-text">
                <nav className="flex -mb-px space-x-5">
                  {Object.values(Categories).map((cat) => (
                    <a
                      onClick={() => onCategoryChanged(cat.id)}
                      key={cat.id}
                      className={classNames(
                        'px-1 py-4 text-base leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                        cat.id === selectedCategoryId
                          ? 'font-semibold text-very-dark-blue border-very-dark-blue focus:text-very-dark-blue-3 focus:border-very-dark-blue-2'
                          : 'font-medium text-brand-gray-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                      )}
                    >
                      <span>{cat.value}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>
            <div className="w-full mt-2 ml-auto md:mt-0 md:w-2/5 md:block">
              <label htmlFor="search-input" className="sr-only">
                Search
              </label>
              <div className="relative h-full rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search-input"
                  className="block w-full h-full pl-12 border-0 border-gray-300 rounded-none md:border-l focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search"
                  onChange={(event) => {
                    onNameSearchChanged(
                      event.target.value.length >= 2 ? event.target.value : ''
                    )
                  }}
                />
              </div>
            </div>
          </div>
          <Table
            nameSearch={nameSearch}
            selectedMarketName={selectedMarketName}
            selectedCategoryId={selectedCategoryId}
            onOrderByChanged={onOrderByChanged}
            onTradeClicked={onTradeClicked}
          />
        </div>
      </div>

      <ScrollToTop />
      <TradeModal
        isOpen={tradeModalData.show}
        setIsOpen={() => setTradeModalData({ ...tradeModalData, show: false })}
        ideaToken={tradeModalData.token}
        market={tradeModalData.market}
      />
      <ListTokenModal
        isOpen={isListTokenModalOpen}
        setIsOpen={setIsListTokenModalOpen}
      />
      <PromoVideoModal
        isOpen={isPromoVideoModalOpen}
        setIsOpen={setIsPromoVideoModalOpen}
      />
    </div>
  )
}
