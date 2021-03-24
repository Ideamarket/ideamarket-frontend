import classNames from 'classnames'
import { useContext, useState } from 'react'
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
} from 'utils'
import {
  Table,
  TradeModal,
  ListTokenModal,
  PromoVideoModal,
  Footer,
} from 'components'

import Search from '../assets/search.svg'
import Plus from '../assets/plus-white.svg'
import Play from '../assets/play.svg'
import { GlobalContext } from './_app'
import { useWalletStore } from 'store/walletStore'

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(2)
  const [selectedMarketName, setSelectedMarketName] = useState('Twitter')
  const [nameSearch, setNameSearch] = useState('')
  const [tablePage, setTablePage] = useState(0)
  const [isHoveringWatchVideo, setIsHoveringWatchVideo] = useState(false)
  const [isPromoVideoModalOpen, setIsPromoVideoModalOpen] = useState(false)

  const interestManagerAddress = getContractAddress('interestManager')

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery('compound-exchange-rate', queryExchangeRate)

  const {
    data: interestManagerCDaiBalance,
    isLoading: isInterestManagerCDaiBalance,
  } = useQuery(
    ['interest-manager-cdai-balance', interestManagerAddress],
    queryCDaiBalance
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
    setTablePage(0)
    setSelectedMarketName(market)
  }

  function onNameSearchChanged(nameSearch) {
    setTablePage(0)
    setSelectedCategoryId(1)
    setNameSearch(nameSearch)
  }

  function onCategoryChanged(categoryID) {
    setTablePage(0)
    setSelectedCategoryId(categoryID)
  }

  function onOrderByChanged(orderBy: string, direction: string) {
    setTablePage(0)

    if (selectedCategoryId === 4) {
      return
    }

    if (orderBy === 'dayChange' && direction === 'desc') {
      setSelectedCategoryId(2)
    } else if (orderBy === 'listedAt' && direction === 'desc') {
      setSelectedCategoryId(3)
    } else {
      setSelectedCategoryId(1)
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
            Credibility without{' '}
            <span className="text-brand-blue">corporations</span>
          </h2>
          <p className="mt-8 text-lg md:text-2xl font-sf-compact-medium">
            Vote with your dollars, and give underrated voices the visibility
            they deserve.
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
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              setIsPromoVideoModalOpen(true)
            }}
            onMouseEnter={() => {
              setIsHoveringWatchVideo(true)
            }}
            onMouseLeave={() => {
              setIsHoveringWatchVideo(false)
            }}
            className="py-2 text-lg text-white border border-white rounded-lg w-44 font-sf-compact-medium hover:bg-white hover:text-black hover:font-bold"
          >
            <div className="flex flex-row items-center justify-center">
              <Play
                width="30"
                height="30"
                stroke={isHoveringWatchVideo ? '#000000' : '#ffffff'}
              />
              <div className="ml-0.5 md:ml-2">
                <div className="flex">
                  Watch<div className="hidden md:block">&nbsp;Video</div>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onListTokenClicked()
            }}
            className="py-2 ml-5 text-lg font-bold text-white rounded-lg w-44 font-sf-compact-medium bg-brand-blue hover:bg-blue-800"
          >
            <div className="flex flex-row items-center justify-center">
              <Plus width="30" height="30" />
              <div className="ml-0.5 md:ml-2">Add Listing</div>
            </div>
          </button>
        </div>
        <div className="mt-10 text-lg text-center md:text-5xl font-gilroy-bold">
          <span className="text-brand-blue">${cDaiBalanceInDai}</span>&nbsp;in
          trust signaled
        </div>
      </div>

      <div className="px-2 mx-auto transform md:px-4 max-w-88 md:max-w-304 -translate-y-28 font-sf-compact-medium">
        <div className="grid grid-cols-2 md:grid-cols-5">
          <div
            className={classNames(
              'cursor-pointer flex md:justify-center items-center p-5 space-x-2.5 text-white rounded-tl-xlg md:rounded-tr-none border-2 md:border-b-0',
              selectedMarketName === 'Twitter' && 'bg-white text-very-dark-blue'
            )}
            onClick={() => {
              onMarketChanged('Twitter')
            }}
          >
            <div>
              {selectedMarketName === 'Twitter'
                ? getMarketSpecificsByMarketName('Twitter').getMarketSVGBlack()
                : getMarketSpecificsByMarketName('Twitter').getMarketSVGWhite()}
            </div>
            <p className="text-lg leading-none">Twitter</p>
          </div>
          <div
            className={classNames(
              'cursor-pointer flex md:justify-center items-center p-5 space-x-2.5 text-white rounded-tr-xlg md:rounded-none border-2 border-l-0 md:border-b-0',
              selectedMarketName === 'Substack' &&
                'bg-white text-very-dark-blue'
            )}
            onClick={() => {
              onMarketChanged('Substack')
            }}
          >
            <div>
              {selectedMarketName === 'Substack'
                ? getMarketSpecificsByMarketName('Substack').getMarketSVGBlack()
                : getMarketSpecificsByMarketName(
                    'Substack'
                  ).getMarketSVGWhite()}
            </div>
            <p className="text-lg leading-none">{'Substack'}</p>
          </div>
          <div
            className={classNames(
              'hidden md:flex md:justify-center items-center p-5 space-x-2.5 text-white border-2 border-t-0 md:border-t-2 md:border-l-0 md:border-r-2 md:border-b-0'
            )}
          ></div>
          <div
            className={classNames(
              'hidden md:flex md:justify-center items-center p-5 space-x-2.5 text-white border-2 border-l-0 border-t-0 md:border-t-2 md:border-l-0 md:border-r-2 md:border-b-0 '
            )}
          ></div>
          <div className="hidden md:flex md:justify-center items-center p-5 space-x-2.5 text-white border-l-2 md:border-t-2 md:border-l-0 md:border-r-2 md:border-b-0 md:rounded-tr-xlg"></div>
          <div className="border-r-2 md:hidden"></div>
        </div>
        <div className="bg-white border border-brand-gray-3 rounded-b-xlg shadow-home">
          <div className="flex flex-col border-b md:flex-row border-brand-gray-3">
            <div className="px-4 md:px-10">
              <div className="font-sf-pro-text">
                <nav className="flex -mb-px space-x-5">
                  {categories.map((cat) => (
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
            currentPage={tablePage}
            setCurrentPage={setTablePage}
            nameSearch={nameSearch}
            selectedMarketName={selectedMarketName}
            selectedCategoryId={selectedCategoryId}
            onOrderByChanged={onOrderByChanged}
            onTradeClicked={onTradeClicked}
          />
        </div>

        <Footer />
      </div>
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
