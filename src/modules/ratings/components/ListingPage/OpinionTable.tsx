import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
import { A } from 'components'
import { convertAccountName } from 'lib/utils/stringUtil'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import {
  getSortOptionDisplayNameByValue,
  SortOptionsListingPageOpinions,
  TABLE_NAMES,
} from 'utils/tables'

type DropdownButtonProps = {
  toggleOption: (value: any) => void
  orderBy?: string
}

const DropdownButton = ({ toggleOption, orderBy }: DropdownButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const container = useRef(null)

  function handleClickOutside(event) {
    const value = container.current
    if (value && !value.contains(event.target)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="relative w-max h-9 flex items-center px-2 py-1 border-2 rounded-md"
    >
      <span className="mr-1 text-sm text-black/[.5] font-semibold dark:text-white whitespace-nowrap">
        Sort by:
      </span>
      <span className="text-sm text-blue-500 font-semibold flex items-center">
        {getSortOptionDisplayNameByValue(
          orderBy,
          TABLE_NAMES.LISTING_PAGE_OPINIONS
        )}
      </span>
      <span>
        <ChevronDownIcon className="h-5" />
      </span>

      {isDropdownOpen && (
        <DropdownButtons
          container={container}
          filters={Object.values(SortOptionsListingPageOpinions)}
          selectedOptions={new Set([orderBy])}
          toggleOption={toggleOption}
        />
      )}
    </div>
  )
}

type Props = {
  opinionPairs: any[]
  orderBy: string
  setOrderBy: (value: string) => void
  setNameSearch: (value: string) => void
}

const OpinionTable = ({
  opinionPairs,
  orderBy,
  setOrderBy,
  setNameSearch,
}: Props) => {
  return (
    <>
      {/* Desktop and tablet table */}
      <div className="hidden md:block rounded-xl w-full shadow-lg">
        {/* Table header */}
        <div className="rounded-xl bg-[#FAFAFA] flex items-center w-full h-16 text-black/[.5] font-semibold text-xs">
          <div className="w-[26%] pl-3">
            <span>USER</span>
          </div>

          <div className="w-[14%]">RATING</div>

          <div className="w-[60%] flex items-center pr-3">
            <span>COMMENT</span>
            <div className="flex w-2/6 h-full ml-auto">
              <OverviewSearchbar
                onNameSearchChanged={(value) => setNameSearch(value)}
              />
            </div>
          </div>
        </div>

        <div className="divide-y-4">
          {opinionPairs?.map((opinion, oIndex) => {
            return (
              <div
                className="bg-white h-min min-h-[5rem] py-4 flex items-start w-full text-black"
                key={oIndex}
              >
                <div className="w-[26%] flex items-center pl-3">
                  <A
                    className="underline font-bold hover:text-blue-600"
                    href={`https://arbiscan.io/address/${opinion?.ratedBy}`}
                  >
                    {convertAccountName(opinion?.ratedBy)}
                  </A>
                </div>

                <div className="w-[14%] text-blue-500 font-semibold">
                  {opinion?.rating}
                </div>

                <div className="w-[60%] flex items-center pr-3">
                  {opinion?.comment && (
                    <div className="w-full px-3 py-2 bg-[#FAFAFA] rounded-lg">
                      {opinion?.comment}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile table */}
      <div className="rounded-t-2xl md:hidden w-full bg-white shadow-lg">
        {/* Table header */}
        <div className="flex items-center w-full h-16 p-3 border-b-[6px]">
          <DropdownButton
            toggleOption={(newSelectedFilterId) =>
              setOrderBy(newSelectedFilterId)
            }
            orderBy={orderBy}
          />

          <div className="w-full h-9 ml-2">
            <OverviewSearchbar
              onNameSearchChanged={(value) => setNameSearch(value)}
            />
          </div>
        </div>

        <div className="divide-y-[6px]">
          {opinionPairs?.map((opinion, oIndex) => {
            return (
              <div
                className="bg-white px-3 py-4 flex flex-col justify-center w-full text-black"
                key={oIndex}
              >
                <div className="mb-2">
                  <A
                    className="underline font-bold hover:text-blue-600"
                    href={`https://arbiscan.io/address/${opinion?.ratedBy}`}
                  >
                    {convertAccountName(opinion?.ratedBy)}
                  </A>
                </div>

                <div className="flex items-start w-full p-3 bg-black/[.02] rounded-lg">
                  <div className="w-10 h-8 mr-3 flex justify-center items-center rounded-lg bg-blue-100 text-blue-600 font-semibold">
                    {opinion?.rating}
                  </div>

                  <div className="w-[85%] font-medium">{opinion?.comment}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default OpinionTable
