// import { ChevronDownIcon } from "@heroicons/react/outline"
import { getUserHoldings } from 'actions/web2/user-market/apiUserActions'
// import DropdownButtons from "components/dropdowns/DropdownButtons"
import { flatten } from 'lodash'
import { MutableRefObject, useCallback, useRef, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { SortOptionsAccountHolders, TABLE_NAMES } from 'utils/tables'
// import useOnClickOutside from "utils/useOnClickOutside"
import HolderCard from './HolderCard'

const TOKENS_PER_PAGE = 10

const infiniteQueryConfig = {
  getNextPageParam: (lastGroup, allGroups) => {
    const morePagesExist = lastGroup?.length === TOKENS_PER_PAGE

    if (!morePagesExist) {
      return false
    }

    return allGroups.length * TOKENS_PER_PAGE
  },
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  enabled: true,
  keepPreviousData: true,
}

type Props = {
  selectedView: TABLE_NAMES
  userData: any
}

const HoldingsView = ({ selectedView, userData }: Props) => {
  const [orderBy /*setOrderBy*/] = useState(
    SortOptionsAccountHolders.STAKED.value
  )
  const [orderDirection /*setOrderDirection*/] = useState('desc')

  const {
    data: infiniteUserHoldingsData,
    // isFetching: isUserHoldingsDataLoading,
    fetchNextPage: fetchMoreUserHoldings,
    // refetch: refetchUserHoldings,
    hasNextPage: canFetchMoreUserHoldings,
  } = useInfiniteQuery(
    [
      'user-holdings',
      userData?.walletAddress,
      selectedView,
      orderBy,
      orderDirection,
    ],
    ({ pageParam = 0 }) =>
      userHoldingsQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const userHoldingsPairs = flatten(infiniteUserHoldingsData?.pages || [])

  async function userHoldingsQueryFunction(
    numTokens: number,
    skip: number = 0
  ) {
    if (selectedView !== TABLE_NAMES.ACCOUNT_STAKED_ON) return []
    if (!userData || !userData?.walletAddress) return []

    const holders = await getUserHoldings({
      walletAddress: userData?.walletAddress,
      skip,
      limit: numTokens,
      orderBy,
      orderDirection,
    })

    return holders || []
  }

  // const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false)
  // const ref = useRef()
  // useOnClickOutside(ref, () => {
  //   setIsSortingDropdownOpen(false)
  // })

  const observer: MutableRefObject<any> = useRef()
  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && canFetchMoreUserHoldings) {
          fetchMoreUserHoldings()
        }
      })

      if (node) observer.current.observe(node)
    },
    [canFetchMoreUserHoldings, fetchMoreUserHoldings]
  )

  return (
    <div>
      {/* <div className="mt-4 md:mt-0 md:mb-4 flex justify-center items-center">
        <div
          onClick={() => setIsSortingDropdownOpen(!isSortingDropdownOpen)}
          className="relative w-[10rem] h-9 flex justify-center items-center px-2 py-1 border rounded-md normal-case cursor-pointer text-black bg-white"
        >
          <span className="text-xs mr-1 text-sm text-black/[.5] font-semibold dark:text-white whitespace-nowrap">
            Sort by:
          </span>
          <span className="text-xs text-blue-500 font-semibold flex items-center whitespace-nowrap">
            {getSortOptionDisplayNameByValue(orderBy, selectedView)}
          </span>
          <span>
            <ChevronDownIcon className="h-4" />
          </span>

          {isSortingDropdownOpen && (
            <DropdownButtons
              container={ref}
              filters={Object.values(SortOptionsAccountHolders)}
              selectedOptions={new Set([orderBy])}
              toggleOption={(newOrderBy: string) => setOrderBy(newOrderBy)}
              width="w-[10rem]"
            />
          )}
        </div>
      </div> */}

      <div className="flex flex-col items-center justify-center space-y-4 mt-10">
        {userHoldingsPairs &&
          userHoldingsPairs?.length > 0 &&
          userHoldingsPairs.map((holder, cInd) => {
            return (
              <div
                ref={lastElementRef}
                className="w-full md:w-[34rem]"
                key={cInd}
              >
                <HolderCard
                  holder={holder}
                  bgCardColor="bg-white"
                  shadow="shadow-[0_2px_7px_2px_rgba(0,0,0,0.15)]"
                />
              </div>
            )
          })}

        {userHoldingsPairs && userHoldingsPairs?.length <= 0 && (
          <div className="opacity-25 h-40">
            This user has not staked on anyone
          </div>
        )}
      </div>
    </div>
  )
}

export default HoldingsView
