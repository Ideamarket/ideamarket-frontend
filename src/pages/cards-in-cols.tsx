import { DefaultLayout, Tooltip } from 'components'
import React, { ReactElement, useContext, useRef, useState } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'

import { useWalletStore } from 'store/walletStore'
import { NextSeo } from 'next-seo'
import { GlobalContext } from 'pages/_app'
import { startingOptionalColumns } from 'components/home/utils'
import { CheckboxFilters } from 'components/tokens/utils/OverviewUtils'
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
import ToggleSwitch from 'components/ToggleSwitch'
import IMPostsViewMobile from 'modules/posts/components/HomePage/IMPostsViewMobile'
import useOnClickOutside from 'utils/useOnClickOutside'
import { ChevronDownIcon } from '@heroicons/react/outline'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'

export enum HOME_PAGE_VIEWS {
  POSTS,
  USERS,
}

const CardsInCols = () => {
  // After trade or list success, the token data needs to be refetched. This toggle does that.
  const [tradeOrListSuccessToggle, setTradeOrListSuccessToggle] =
    useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [nameSearch, setNameSearch] = useState('')
  const [orderBy, setOrderBy] = useState(
    SortOptionsHomePostsTable.MARKET_INTEREST.value
  )
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedView, setSelectedView] = useState(HOME_PAGE_VIEWS.POSTS)
  const [isAdvancedView, setIsAdvancedView] = useState(true)
  const [timeFilter, setTimeFilter] = useState(TIME_FILTER.ONE_WEEK)

  const [isTimeFilterDropdownOpen, setIsTimeFilterDropdownOpen] =
    useState(false)
  const [isMobileTimeFilterDropdownOpen, setIsMobileTimeFilterDropdownOpen] =
    useState(false)
  const desktopRef = useRef()
  const mobileRef = useRef()
  useOnClickOutside(desktopRef, () => {
    setIsTimeFilterDropdownOpen(false)
  })
  useOnClickOutside(mobileRef, () => {
    setIsMobileTimeFilterDropdownOpen(false)
  })

  const [activeOverlayPostID, setActiveOverlayPostID] = useState(null)

  if (
    startingOptionalColumns.length ===
    CheckboxFilters.COLUMNS.values.length - 1
  ) {
    startingOptionalColumns.push('All')
  }

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

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
      <NextSeo title="CardsInCols" />

      {/* {activeOverlayPostID && <IMPostOverlay postID={activeOverlayPostID} />} */}

      {/* Desktop and tablet */}
      <div className="hidden md:block w-full mt-10">

        {/* Top section with buttons */}
        <div className="flex flex-col justify-center items-center space-y-3 mx-20 pb-10 border-b">

          {/* Posts and Users buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                onOrderByChanged(
                  SortOptionsHomePostsTable.MARKET_INTEREST.value,
                  'desc'
                )
                setSelectedView(HOME_PAGE_VIEWS.POSTS)
              }}
              className={classNames(
                selectedView === HOME_PAGE_VIEWS.POSTS ? 'bg-blue-600 text-white' : 'bg-black/[.05] text-black/[.25]',
                "px-6 py-3 font-bold text-2xl rounded-lg"
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
                selectedView === HOME_PAGE_VIEWS.USERS ? 'bg-blue-600 text-white' : 'bg-black/[.05] text-black/[.25]',
                "px-6 py-3 font-bold text-2xl rounded-lg"
              )}
            >
              Users
            </button>
          </div>

          {selectedView === HOME_PAGE_VIEWS.POSTS && (
            <div className="flex items-center">

              {/* Left */}
              <div className="flex items-center space-x-3 pr-2 text-xs">
                <button
                  onClick={() => setOrderBy(SortOptionsHomePostsTable.MARKET_INTEREST.value)}
                  className={classNames(
                    orderBy === SortOptionsHomePostsTable.MARKET_INTEREST.value ? 'bg-blue-100 text-blue-600' : 'text-black',
                    "p-2 font-bold rounded-2xl border"
                  )}
                >
                  Controversial
                </button>
                <button
                  onClick={() => setOrderBy(SortOptionsHomePostsTable.NEW.value)}
                  className={classNames(
                    orderBy === SortOptionsHomePostsTable.NEW.value ? 'bg-blue-100 text-blue-600' : 'text-black',
                    "p-2 font-bold rounded-2xl border"
                  )}
                >
                  New
                </button>
              </div>

              {/* Right */}
              <div className="flex justify-between items-center space-x-3 pl-2 border-l text-xs">

                <button
                  onClick={(e) => { setIsAdvancedView(!isAdvancedView); e.preventDefault() }}
                  className={classNames(
                    isAdvancedView ? 'bg-blue-100 text-blue-600' : 'text-black',
                    "flex items-center p-2 font-bold rounded-2xl border z-50"
                  )}
                >
                  <div>Advanced View</div>
                  <ToggleSwitch isOn={isAdvancedView} handleChange={(e) => setIsAdvancedView(!isAdvancedView)} className="ml-2" />
                </button>

                <div
                  onClick={() => {
                    setIsTimeFilterDropdownOpen(!isTimeFilterDropdownOpen)
                  }}
                  className="relative w-28 h-9 flex justify-center items-center p-2 border rounded-2xl normal-case cursor-pointer"
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
                </div>

              </div>

            </div>
          )}

          <div className="flex w-60">
            <OverviewSearchbar
              onNameSearchChanged={onNameSearchChanged}
              bgColor="bg-white"
            />
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
          <div className="mx-auto md:px-4 md:max-w-304 font-inter">
            <div className="border-brand-gray-3 dark:border-gray-500 rounded-b-xlg">
              <HomeUsersTable {...tableProps} />
            </div>
          </div>
        )}

      </div>

      {/* Mobile */}
      <div className="md:hidden w-full mt-6">

        {/* Top section with buttons */}
        <div className="pb-6 border-b">

          {/* Posts and Users buttons */}
          <div className="px-4 flex justify-between items-center">
            <button
              onClick={() => {
                onOrderByChanged(
                  SortOptionsHomePostsTable.MARKET_INTEREST.value,
                  'desc'
                )
                setSelectedView(HOME_PAGE_VIEWS.POSTS)
              }}
              className={classNames(
                selectedView === HOME_PAGE_VIEWS.POSTS ? 'bg-blue-600 text-white' : 'bg-black/[.05] text-black/[.25]',
                "p-4 font-bold text-2xl rounded-lg"
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
                selectedView === HOME_PAGE_VIEWS.USERS ? 'bg-blue-600 text-white' : 'bg-black/[.05] text-black/[.25]',
                "p-4 font-bold text-2xl rounded-lg"
              )}
            >
              Users
            </button>

          </div>

          {selectedView === HOME_PAGE_VIEWS.POSTS && (
            <div className="px-4 mt-6 flex justify-center items-center">

              {/* Left */}
              <div className="flex items-center space-x-3 pr-2 text-xs">
                <button
                  onClick={() => setOrderBy(SortOptionsHomePostsTable.MARKET_INTEREST.value)}
                  className={classNames(
                    orderBy === SortOptionsHomePostsTable.MARKET_INTEREST.value ? 'bg-blue-100 text-blue-600' : 'text-black',
                    "p-2 font-bold rounded-2xl border"
                  )}
                >
                  Controversial
                </button>
                <button
                  onClick={() => setOrderBy(SortOptionsHomePostsTable.NEW.value)}
                  className={classNames(
                    orderBy === SortOptionsHomePostsTable.NEW.value ? 'bg-blue-100 text-blue-600' : 'text-black',
                    "p-2 font-bold rounded-2xl border"
                  )}
                >
                  New
                </button>
              </div>

              {/* Right */}
              <div className="flex justify-between items-center space-x-3 pl-2 border-l text-xs">

                <div
                  onClick={() =>
                    setIsMobileTimeFilterDropdownOpen(!isMobileTimeFilterDropdownOpen)
                  }
                  className="relative w-28 h-9 flex justify-center items-center p-2 border rounded-2xl normal-case cursor-pointer"
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

export default CardsInCols

CardsInCols.getLayout = (page: ReactElement) => (
  <DefaultLayout bgColor="bg-white" bgHeaderColor="bg-white" headerTextColor="text-black">
    {page}
  </DefaultLayout>
)
