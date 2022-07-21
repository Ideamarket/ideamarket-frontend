import classNames from "classnames"
import { flatten } from "lodash"
import { useState } from "react"
import { useInfiniteQuery } from "react-query"
import { SortOptionsAccountBounties } from "utils/tables"
import { getAllBounties } from "../services/BountyService"

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

enum BOUNTY_TYPE {
  CLAIMABLE,  // User of this page can claim these bounties
  FUNDED,     // User of this page funded these bounties
  CLAIMED,    // User of this page claimed these bounties in the past
}

type Props = {
  userData: any
}

const AccountBounties = ({ userData }: Props) => {
  const [bountyType, setBountyType] = useState(BOUNTY_TYPE.CLAIMABLE)

  const [orderBy, setOrderBy] = useState(
    SortOptionsAccountBounties.GROUP_AMOUNT.value
  )
  const [orderDirection, setOrderDirection] = useState('desc')

  const {
    data: infiniteBountiesData,
    isFetching: isBountiesDataLoading,
    fetchNextPage: fetchMoreBounties,
    refetch: refetchBounties,
    hasNextPage: canFetchMoreBounties,
  } = useInfiniteQuery(
    ['bounties', userData?.walletAddress, bountyType, orderBy, orderDirection],
    ({ pageParam = 0 }) => bountyQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const bountyPairs = flatten(infiniteBountiesData?.pages || [])

  console.log('bountyPairs==', bountyPairs)

  async function bountyQueryFunction(numTokens: number, skip: number = 0) {
    let bounties = []
    // TODO: check if pagination restarts when switching tabs..i have a feeling it doesn't
    if (bountyType === BOUNTY_TYPE.CLAIMABLE) {
      bounties = await getAllBounties({
        skip,
        limit: numTokens,
        orderBy,
        orderDirection,
        tokenID: null,
        userAddress: userData?.walletAddress,
        username: null,
        depositorUsername: null,
        depositorAddress: null,
        filterStatuses: ['OPEN', 'CLAIMABLE'],
      })
    } else if (bountyType === BOUNTY_TYPE.FUNDED) {
      bounties = await getAllBounties({
        skip,
        limit: numTokens,
        orderBy,
        orderDirection,
        tokenID: null,
        userAddress: null,
        username: null,
        depositorUsername: null,
        depositorAddress: userData?.walletAddress,
        filterStatuses: null,
      })
    } else if (bountyType === BOUNTY_TYPE.CLAIMED) {

    }

    return bounties
  }

  return (
    <div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setBountyType(BOUNTY_TYPE.CLAIMABLE)}
          className={classNames(
            bountyType === BOUNTY_TYPE.CLAIMABLE && 'bg-brand-blue',
            "px-2 py-3 rounded-lg border"
          )}
        >
          Claimable Bounties
        </button>

        <button
          onClick={() => setBountyType(BOUNTY_TYPE.FUNDED)}
          className={classNames(
            bountyType === BOUNTY_TYPE.FUNDED && 'bg-brand-blue',
            "px-2 py-3 rounded-lg border"
          )}
        >
          Funded Bounties
        </button>

        <button
          onClick={() => setBountyType(BOUNTY_TYPE.CLAIMED)}
          className={classNames(
            bountyType === BOUNTY_TYPE.CLAIMED && 'bg-brand-blue',
            "px-2 py-3 rounded-lg border"
          )}
        >
          Claimed Bounties
        </button>
      </div>

      {bountyType === BOUNTY_TYPE.CLAIMABLE && (
        <div className="bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray ">

          <div className="border-t border-brand-border-gray dark:border-gray-500 shadow-home">



          </div>

        </div>
      )}

    </div>
  )
}

export default AccountBounties
