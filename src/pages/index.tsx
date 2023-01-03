import { DefaultLayout, Tooltip } from 'components'
import React, { ReactElement, useContext, useRef, useState } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'

import { useWalletStore } from 'store/walletStore'
import { NextSeo } from 'next-seo'
import { GlobalContext } from 'pages/_app'
import RateModal from 'components/trade/RateModal'
import {
  getTimeFilterDisplayNameByValue,
  HomeUsersTableColumns,
  SortOptionsHomePostsTable,
  SortOptionsHomeUsersTable,
  TimeFilterOptions,
  TIME_FILTER,
} from 'utils/tables'
import classNames from 'classnames'
import HomeUsersTable from 'modules/user-market/components/HomeUsersTable'
import StakeUserModal from 'modules/user-market/components/StakeUserModal'
import { USER_MARKET } from 'modules/user-market/utils/UserMarketUtils'
import IMPostsView from 'modules/posts/components/HomePage/IMPostsView'
// import ToggleSwitch from 'components/ToggleSwitch'
import IMPostsViewMobile from 'modules/posts/components/HomePage/IMPostsViewMobile'
import useOnClickOutside from 'utils/useOnClickOutside'
import { ChevronDownIcon } from '@heroicons/react/outline'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
// import SelectCategoriesModal from 'modules/posts/components/SelectCategoriesModal'
import { InboxInIcon } from '@heroicons/react/solid'
import useUserFeesClaimable from 'modules/user-market/hooks/useUserFeesClaimable'
import useTokenToDAI from 'actions/useTokenToDAI'
import TradeCompleteModal, {
  TX_TYPES,
} from 'components/trade/TradeCompleteModal'
import { useTransactionManager } from 'utils'
import withdrawClaimableFees from 'actions/web3/user-market/withdrawClaimableFees'

export enum HOME_PAGE_VIEWS {
  POSTS,
  USERS,
}

const ETH_TOKEN = {
  name: 'Ethereum',
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'ETH',
  decimals: 18,
}

const Home = () => {
  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [nameSearch, setNameSearch] = useState('')
  const [orderBy, setOrderBy] = useState(
    SortOptionsHomePostsTable.MARKET_INTEREST.value
  )
  const txManager = useTransactionManager()
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedView /*setSelectedView*/] = useState(HOME_PAGE_VIEWS.POSTS)
  const [isAdvancedView /*setIsAdvancedView*/] = useState(true)
  const [timeFilter, setTimeFilter] = useState(TIME_FILTER.ALL_TIME)

  // const [isTimeFilterDropdownOpen, setIsTimeFilterDropdownOpen] =
  //   useState(false)
  const [isMobileTimeFilterDropdownOpen, setIsMobileTimeFilterDropdownOpen] =
    useState(false)
  // const desktopRef = useRef()
  const mobileRef = useRef()
  // useOnClickOutside(desktopRef, () => {
  //   setIsTimeFilterDropdownOpen(false)
  // })
  useOnClickOutside(mobileRef, () => {
    setIsMobileTimeFilterDropdownOpen(false)
  })

  const [, ethClaimable] = useUserFeesClaimable()
  const [, , selectedTokenDAIValue] = useTokenToDAI(
    ETH_TOKEN as any,
    ethClaimable,
    18
  )

  const [activeOverlayPostID, setActiveOverlayPostID] = useState(null)

  const { setOnWalletConnectedCallback, setIsTxPending } =
    useContext(GlobalContext)

  const onNameSearchChanged = (nameSearch) => {
    setOrderBy(
      selectedView === HOME_PAGE_VIEWS.POSTS
        ? SortOptionsHomePostsTable.MARKET_INTEREST.value
        : SortOptionsHomeUsersTable.STAKED.value
    )
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
        ModalService.open(RateModal, { imPost: token, urlMetaData }, onClose)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, { imPost: token, urlMetaData }, onClose)
    }
  }

  const onStakeClicked = (token: IdeaToken) => {
    const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)

    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(
          StakeUserModal,
          { ideaToken: token, market: USER_MARKET },
          onClose
        )
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(
        StakeUserModal,
        { ideaToken: token, market: USER_MARKET },
        onClose
      )
    }
  }

  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    txType: TX_TYPES
  ) {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      txType,
    })
  }

  const onWithdrawUserFeeClicked = async () => {
    if (ethClaimable && ethClaimable > 0) {
      setIsTxPending(true)

      try {
        await txManager.executeTx(
          'Withdraw claimable fees',
          withdrawClaimableFees
        )
      } catch (ex) {
        console.log(ex)
        onTradeComplete(false, 'error', 'error', TX_TYPES.NONE)
        setIsTxPending(false)
        return
      }

      setIsTxPending(false)
      onTradeComplete(
        true,
        'success',
        'success',
        TX_TYPES.WITHDRAW_CLAIMABLE_FEE
      )
    }
  }

  const tableProps = {
    nameSearch,
    orderBy,
    orderDirection,
    isStarredFilterActive,
    columnData:
      selectedView === HOME_PAGE_VIEWS.POSTS ? null : HomeUsersTableColumns,
    selectedCategories,
    selectedView,
    timeFilter,
    getColumn: (column) => null,
    onOrderByChanged,
    onRateClicked,
    onStakeClicked,
    tradeOrListSuccessToggle,
    setSelectedCategories,
    setIsStarredFilterActive,
    onNameSearchChanged,
    setTimeFilter,
  }

  return (
    <>
      <NextSeo title="Home" />

      {/* {activeOverlayPostID && <IMPostOverlay postID={activeOverlayPostID} />} */}

      {/* Desktop and tablet */}
      <div className="hidden md:block w-full">
        {/* Carousel section */}
        {/* <div className="bg-blue-100 px-20 py-8 mb-10">
          <div className=" mx-auto max-w-7xl">
            <div className="md:h-auto lg:h-40 flex items-start space-x-6">
              <div className="rounded-lg bg-white w-1/3 h-full p-4">
                <div className="font-bold text-lg mb-2">Post-to-Earn</div>
                <div className="text-black/[.5] text-sm mb-4">
                  Create posts and earn 0.001 ETH per rating on posts you
                  created (or bought)
                </div>
              </div>

              <div className="rounded-lg bg-white w-1/3 h-full p-4">
                <div className="font-bold text-lg mb-2">
                  Prove your good judgment
                </div>
                <div className="text-black/[.5] text-sm mb-4">
                  On-chain ratings are a public record of personal opinion, so
                  everyone can see who was right and who was just following
                  trends.
                </div>
              </div>

              <div className="rounded-lg bg-white w-1/3 h-full p-4">
                <div className="font-bold text-lg mb-2">
                  Grow your Twitter audience
                </div>
                <div className="text-black/[.5] text-sm mb-4">
                  Connect Twitter and we'll recommend you to users whose
                  on-chain ratings align with yours. Similar users will appear
                  on your profile.
                </div>
              </div>
            </div>
          </div>
        </div> */}

        <div className="px-20">
          <div className=" mx-auto max-w-7xl">
            {/* Top section with buttons */}
            <div className="flex flex-wrap items-center pb-6 mt-10">
              {/* Posts and Users buttons */}
              {/* <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    onOrderByChanged(
                      SortOptionsHomePostsTable.MARKET_INTEREST.value,
                      'desc'
                    )
                    setSelectedView(HOME_PAGE_VIEWS.POSTS)
                  }}
                  className={classNames(
                    selectedView === HOME_PAGE_VIEWS.POSTS
                      ? 'bg-blue-600 text-white'
                      : 'bg-black/[.05] text-black/[.25]',
                    'px-4 py-2 font-bold text-2xl rounded-lg flex items-center space-x-2'
                  )}
                >
                  <div>Posts</div>
                  <div className="relative w-8 h-8">
                    <Image
                      src={'/PostsIcon.svg'}
                      alt="posts-icon"
                      layout="fill"
                    />
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOrderByChanged(
                      SortOptionsHomeUsersTable.STAKED.value,
                      'desc'
                    )
                    setSelectedView(HOME_PAGE_VIEWS.USERS)
                  }}
                  className={classNames(
                    selectedView === HOME_PAGE_VIEWS.USERS
                      ? 'bg-blue-600 text-white'
                      : 'bg-black/[.05] text-black/[.25]',
                    'px-4 py-2 font-bold text-2xl rounded-lg flex items-center space-x-2'
                  )}
                >
                  <div>Leaderboard</div>
                  <div className="relative w-8 h-8">
                    <Image
                      src={'/UsersIcon.svg'}
                      alt="users-icon"
                      layout="fill"
                    />
                  </div>
                </button>
              </div> */}

              <div className="flex items-center">
                {/* Desktop view of 2 elements below */}
                {selectedView === HOME_PAGE_VIEWS.POSTS && (
                  <div className="flex items-center mr-2">
                    {/* Left */}
                    <div className="flex items-center space-x-3 pr-2 text-xs">
                      <div className="flex items-center space-x-3 pr-2 border-r">
                        <button
                          onClick={() =>
                            setOrderBy(SortOptionsHomePostsTable.NEW.value)
                          }
                          className={classNames(
                            orderBy === SortOptionsHomePostsTable.NEW.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-black',
                            'px-3 py-2 font-bold rounded-2xl border'
                          )}
                        >
                          New
                        </button>
                        <button
                          onClick={() =>
                            setOrderBy(
                              SortOptionsHomePostsTable.MARKET_INTEREST.value
                            )
                          }
                          className={classNames(
                            orderBy ===
                              SortOptionsHomePostsTable.MARKET_INTEREST.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-black',
                            'px-3 py-2 font-bold rounded-2xl border'
                          )}
                        >
                          Hot
                        </button>
                      </div>

                      <div className="flex items-center space-x-3 pr-2 border-r">
                        <button
                          onClick={() =>
                            setTimeFilter(TimeFilterOptions.ONE_DAY.value)
                          }
                          className={classNames(
                            timeFilter === TimeFilterOptions.ONE_DAY.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-black',
                            'px-3 py-2 font-bold rounded-2xl border'
                          )}
                        >
                          Day
                        </button>
                        <button
                          onClick={() =>
                            setTimeFilter(TimeFilterOptions.ONE_WEEK.value)
                          }
                          className={classNames(
                            timeFilter === TimeFilterOptions.ONE_WEEK.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-black',
                            'px-3 py-2 font-bold rounded-2xl border'
                          )}
                        >
                          Week
                        </button>
                        <button
                          onClick={() =>
                            setTimeFilter(TimeFilterOptions.ONE_MONTH.value)
                          }
                          className={classNames(
                            timeFilter === TimeFilterOptions.ONE_MONTH.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-black',
                            'px-3 py-2 font-bold rounded-2xl border'
                          )}
                        >
                          Month
                        </button>
                        <button
                          onClick={() =>
                            setTimeFilter(TimeFilterOptions.ALL_TIME.value)
                          }
                          className={classNames(
                            timeFilter === TimeFilterOptions.ALL_TIME.value
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-black',
                            'px-3 py-2 font-bold rounded-2xl border'
                          )}
                        >
                          All-Time
                        </button>
                      </div>

                      {/* <div
                        onClick={() => {
                          setIsTimeFilterDropdownOpen(!isTimeFilterDropdownOpen)
                        }}
                        className="relative w-28 h-9 bg-blue-100 text-blue-600 flex justify-center items-center p-2 border rounded-2xl normal-case cursor-pointer"
                      >
                        <span className="text-xs text-blue-500 font-semibold flex items-center">
                          {getTimeFilterDisplayNameByValue(timeFilter)}
                        </span>
                        <span>
                          <ChevronDownIcon className="h-4" />
                        </span>

                        {isTimeFilterDropdownOpen && (
                          <DropdownButtons
                            container={desktopRef}
                            filters={Object.values(TimeFilterOptions)}
                            selectedOptions={new Set([timeFilter])}
                            toggleOption={setTimeFilter}
                            width="w-[10rem]"
                          />
                        )}
                      </div> */}

                      {/* <div
                        onClick={() =>
                          ModalService.open(SelectCategoriesModal, {
                            selectedCategories,
                            setSelectedCategories,
                          })
                        }
                        className="relative w-28 h-9 flex justify-center items-center p-2 border rounded-2xl normal-case cursor-pointer"
                      >
                        <span className="text-xs text-blue-500 font-semibold flex items-center">
                          Categories
                        </span>
                        <span>
                          <ChevronDownIcon className="h-4" />
                        </span>
                      </div> */}
                    </div>

                    {/* Right */}
                    {/* <div className="flex justify-between items-center space-x-3 pl-2 border-l text-xs">
                      <button
                        onClick={(e) => {
                          setIsAdvancedView(!isAdvancedView)
                          e.preventDefault()
                        }}
                        className={classNames(
                          isAdvancedView ? '' : 'text-black',
                          'flex items-center px-3 py-2 font-bold rounded-2xl border z-50'
                        )}
                      >
                        <div>Advanced View</div>
                        <ToggleSwitch
                          isOn={isAdvancedView}
                          handleChange={(e) =>
                            setIsAdvancedView(!isAdvancedView)
                          }
                          className="ml-2"
                        />
                      </button>
                    </div> */}
                  </div>
                )}
                <div className="flex w-48 ml-auto">
                  <OverviewSearchbar
                    onNameSearchChanged={onNameSearchChanged}
                    bgColor="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bottom section with columns of post/citation/rating data */}
            {selectedView === HOME_PAGE_VIEWS.POSTS && (
              <IMPostsView
                activeOverlayPostID={activeOverlayPostID}
                nameSearch={nameSearch}
                orderBy={orderBy}
                orderDirection={orderDirection}
                selectedCategories={selectedCategories}
                selectedView={selectedView}
                timeFilter={timeFilter}
                isAdvancedView={isAdvancedView}
                setActiveOverlayPostID={setActiveOverlayPostID}
              />
            )}

            {selectedView === HOME_PAGE_VIEWS.USERS && (
              <div className="mx-auto font-inter">
                <div className="border-brand-gray-3 dark:border-gray-500 rounded-b-xlg">
                  <HomeUsersTable {...tableProps} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full">
        {/* Available to withdraw button */}
        <div className="px-4 mb-4 mt-8">
          <button
            onClick={onWithdrawUserFeeClicked}
            className="w-full bg-white border-l border-t border-r-4 border-b-4 border-blue-600 rounded-3xl px-7 py-3 leading-[.5rem]"
          >
            <div className="flex justify-between items-center space-x-2">
              <div className="flex items-center">
                <InboxInIcon className="w-5 h-5 text-black mr-4" />
                <div className="text-xs text-black/[.5]">
                  Available to Withdraw
                </div>
              </div>

              <div>
                <span className="text-black font-bold text-xs">
                  {ethClaimable} ETH
                </span>
                <span className="text-black/[.5] font-bold text-xs">
                  {' '}
                  (${parseFloat(selectedTokenDAIValue).toFixed(2)})
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Top section with buttons */}
        <div className="pb-6 border-b">
          {/* Posts and Users buttons */}
          {/* <div className="px-4 flex justify-center items-center space-x-4">
            <button
              onClick={() => {
                onOrderByChanged(
                  SortOptionsHomePostsTable.MARKET_INTEREST.value,
                  'desc'
                )
                setSelectedView(HOME_PAGE_VIEWS.POSTS)
              }}
              className={classNames(
                selectedView === HOME_PAGE_VIEWS.POSTS
                  ? 'bg-blue-600 text-white'
                  : 'bg-black/[.05] text-black/[.25]',
                'px-4 py-2 font-bold text-2xl rounded-lg'
              )}
            >
              Posts
            </button>

            <button
              onClick={() => {
                onOrderByChanged(SortOptionsHomeUsersTable.STAKED.value, 'desc')
                setSelectedView(HOME_PAGE_VIEWS.USERS)
              }}
              className={classNames(
                selectedView === HOME_PAGE_VIEWS.USERS
                  ? 'bg-blue-600 text-white'
                  : 'bg-black/[.05] text-black/[.25]',
                'px-4 py-2 font-bold text-2xl rounded-lg'
              )}
            >
              Leaderboard
            </button>
          </div> */}

          {selectedView === HOME_PAGE_VIEWS.POSTS && (
            <div className="px-4 mt-2 flex justify-center items-center">
              {/* Left */}
              <div className="flex items-center space-x-3 pr-2 text-xs">
                <button
                  onClick={() =>
                    setOrderBy(SortOptionsHomePostsTable.MARKET_INTEREST.value)
                  }
                  className={classNames(
                    orderBy === SortOptionsHomePostsTable.MARKET_INTEREST.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-black',
                    'p-2 font-bold rounded-2xl border'
                  )}
                >
                  Hot
                </button>
                <button
                  onClick={() =>
                    setOrderBy(SortOptionsHomePostsTable.NEW.value)
                  }
                  className={classNames(
                    orderBy === SortOptionsHomePostsTable.NEW.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-black',
                    'p-2 font-bold rounded-2xl border'
                  )}
                >
                  New
                </button>
              </div>

              {/* Right */}
              <div className="flex justify-between items-center space-x-3 pl-2 border-l text-xs">
                <div
                  onClick={() =>
                    setIsMobileTimeFilterDropdownOpen(
                      !isMobileTimeFilterDropdownOpen
                    )
                  }
                  className="relative w-28 h-9 bg-blue-100 text-blue-600 flex justify-center items-center p-2 border rounded-2xl normal-case cursor-pointer"
                >
                  <span className="text-xs text-blue-500 font-semibold flex items-center">
                    {getTimeFilterDisplayNameByValue(timeFilter)}
                  </span>
                  <span>
                    <ChevronDownIcon className="h-4" />
                  </span>

                  {isMobileTimeFilterDropdownOpen && (
                    <DropdownButtons
                      container={mobileRef}
                      filters={Object.values(TimeFilterOptions)}
                      selectedOptions={new Set([timeFilter])}
                      toggleOption={setTimeFilter}
                      width="w-[10rem]"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 flex justify-center mx-auto w-60">
            <OverviewSearchbar
              onNameSearchChanged={onNameSearchChanged}
              bgColor="bg-white"
            />
          </div>
        </div>

        {/* Bottom section with post data */}
        {selectedView === HOME_PAGE_VIEWS.POSTS && (
          <>
            <IMPostsView
              activeOverlayPostID={activeOverlayPostID}
              nameSearch={nameSearch}
              orderBy={orderBy}
              orderDirection={orderDirection}
              selectedCategories={selectedCategories}
              selectedView={selectedView}
              timeFilter={timeFilter}
              isAdvancedView={isAdvancedView}
              setActiveOverlayPostID={setActiveOverlayPostID}
            />

            <IMPostsViewMobile
              activeOverlayPostID={activeOverlayPostID}
              nameSearch={nameSearch}
              orderBy={orderBy}
              orderDirection={orderDirection}
              selectedCategories={selectedCategories}
              selectedView={selectedView}
              timeFilter={timeFilter}
              isAdvancedView={isAdvancedView}
              setActiveOverlayPostID={setActiveOverlayPostID}
            />
          </>
        )}

        {selectedView === HOME_PAGE_VIEWS.USERS && (
          <div className="mx-auto md:px-4 md:max-w-304 font-inter">
            <div className="border-brand-gray-3 dark:border-gray-500 rounded-b-xlg">
              {/* Lil mobile col header */}
              <div className="w-full flex px-3 py-3 leading-4 text-xs text-black/[.5] font-semibold">
                <div className="w-[30%] flex items-start">
                  <span className="mr-1">STAKED</span>
                  <Tooltip>
                    <div className="w-40 md:w-64">
                      The total amount of IMO staked on a user
                    </div>
                  </Tooltip>
                </div>

                <div className="w-[20%] ml-8">HOLDERS</div>

                <div className="w-[20%] ml-4">RATINGS</div>

                <div className="w-[25%]"></div>
              </div>
              <HomeUsersTable {...tableProps} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home

Home.getLayout = (page: ReactElement) => (
  <DefaultLayout
    bgColor="bg-white"
    bgHeaderColor="bg-white"
    headerTextColor="text-black"
  >
    {page}
  </DefaultLayout>
)
