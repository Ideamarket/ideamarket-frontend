import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  MutualHoldersData,
  queryMutualHoldersOfToken,
} from 'store/ideaMarketsStore'
import { MutualToken, MutualTokenSkeleton } from 'components'
import Select from 'react-select'
import { useTheme } from 'next-themes'

export type MutualTokensListSortBy =
  | 'latestTimestamp'
  | 'totalAmount'
  | 'totalHolders'

const options = [
  {
    value: 'totalHolders',
    label: 'Mutual Holders',
  },
  {
    value: 'totalAmount',
    label: 'Mutual Tokens',
  },
  {
    value: 'latestTimestamp',
    label: 'Most Recent',
  },
]

export default function MutualTokensList({
  tokenName,
  marketName,
}: {
  tokenName: string
  marketName: string
}) {
  const PAGE_SIZE = 8
  const [pageNumber, setPageNumber] = useState(1)
  const [sortBy, setSortBy] = useState<MutualTokensListSortBy>('totalHolders')
  const { theme } = useTheme()

  const { data: mutualHoldersList, isLoading, isError } = useQuery<
    MutualHoldersData[]
  >(
    [`token-mutualHolders-${marketName}-${tokenName}`, marketName, tokenName],
    () => queryMutualHoldersOfToken({ marketName, tokenName })
  )

  function sortedMutualHolders() {
    if (isLoading || isError || !mutualHoldersList) {
      return []
    }
    return mutualHoldersList
      .sort((a, b) => Number(b.stats[sortBy]) - Number(a.stats[sortBy]))
      .slice(0, pageNumber * PAGE_SIZE)
  }

  if (isError) {
    return <p>Something went wrong!!!</p>
  }

  return (
    <>
      <div className="pb-5 mb-12 border-b border-gray-200 sm:flex sm:items-end sm:justify-between">
        <h3 className="text-2xl font-medium leading-6">Mutual Holders</h3>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <p>Sort By</p>
          <Select
            name="Sort By"
            options={options}
            isDisabled={isLoading}
            isClearable={false}
            defaultValue={options[0]}
            isSearchable={false}
            className="w-48 border-2 border-gray-200  dark:border-gray-500  dark:placeholder-gray-300 rounded-md text-brand-gray-4 dark:text-gray-200 market-select trade-select"
            onChange={(entry) => {
              setSortBy((entry as any).value)
            }}
            theme={(mytheme) => ({
              ...mytheme,
              borderRadius: 2,
              colors: {
                ...mytheme.colors,
                primary50: theme === 'dark' ? '#4B5563' : '', // brand-gray ,

                primary25: theme === 'dark' ? '#4B5563' : '#f6f6f6', // brand-gray
                primary: '#0857e0', // brand-blue
              },
            })}
            styles={{
              valueContainer: (provided) => ({
                ...provided,
                minHeight: '50px',
              }),
              control: (base, state) => ({
                ...base,
                textDecorationColor: theme === 'dark' ? 'white' : 'gray',
                background: theme === 'dark' ? '#4B5563' : 'white',
                // match with the menu
                borderRadius: state.isFocused ? '3px 3px 0 0' : 3,
                // Overwrittes the different states of border
                borderColor: state.isFocused ? 'yellow' : 'green',
                // Removes weird border around container
                boxShadow: state.isFocused ? null : null,
                '&:hover': {
                  // Overwrittes the different states of border
                  borderColor: state.isFocused ? 'red' : 'blue',
                },
              }),
              menuList: (base) => ({
                ...base,
                background: theme === 'dark' ? '#6B7280' : 'white',
              }),
            }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-10 mt-5 md:grid-cols-2">
        {isLoading && (
          <>
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
            <MutualTokenSkeleton />
          </>
        )}
        {!isLoading &&
          sortedMutualHolders().map((mutualHolderData) => (
            <MutualToken
              stats={mutualHolderData.stats}
              token={mutualHolderData.token}
              key={mutualHolderData.token.address}
              sortBy={sortBy}
            />
          ))}
        {!isLoading && mutualHoldersList.length === 0 && (
          <p className="text-gray-500">No mutual holders for this token.</p>
        )}
      </dl>

      {!isLoading &&
        mutualHoldersList &&
        pageNumber * PAGE_SIZE < mutualHoldersList.length && (
          <div className="flex items-center justify-center my-10">
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 text-base font-medium bg-white border border-transparent rounded-md shadow-sm text-brand-blue hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              Load more
            </button>
          </div>
        )}
    </>
  )
}
