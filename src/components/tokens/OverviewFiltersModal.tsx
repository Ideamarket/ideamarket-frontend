import classNames from 'classnames'
import { useState } from 'react'
import Modal from '../modals/Modal'
import { CheckboxFilters, toggleMarketHelper } from './utils/OverviewUtils'

export default function OverviewFiltersModal({
  close,
  selectedMarkets,
  isVerifiedFilterActive,
  onMarketChanged,
  setIsVerifiedFilterActive,
  setNumActiveFilters,
}: {
  close: () => void
  selectedMarkets: Set<string>
  isVerifiedFilterActive: boolean
  onMarketChanged: (set: Set<string>) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setNumActiveFilters: (amount: number) => void
}) {
  const [localSelectedMarkets, setLocalSelectedMarkets] =
    useState(selectedMarkets)
  const [localIsVerifiedFilterActive, setLocalIsVerifiedFilterActive] =
    useState(isVerifiedFilterActive)

  const calculateActiveFilters = () => {
    let numberOfActiveFilters = 0

    const areFiltersSelectedAndNonDefault =
      !localSelectedMarkets.has('All') && !localSelectedMarkets.has('None')
    if (areFiltersSelectedAndNonDefault)
      numberOfActiveFilters += Array.from(localSelectedMarkets).filter(
        (o) => o !== 'All' && o !== 'None'
      ).length
    if (localIsVerifiedFilterActive) numberOfActiveFilters += 1

    return numberOfActiveFilters
  }

  const save = () => {
    onMarketChanged(localSelectedMarkets)
    setIsVerifiedFilterActive(localIsVerifiedFilterActive)
    setNumActiveFilters(calculateActiveFilters())
    close()
  }

  const clearAll = () => {
    setLocalIsVerifiedFilterActive(false)
    setLocalSelectedMarkets(new Set<string>(['None']))
  }

  const localToggleMarket = (marketName: string) => {
    const newSet = toggleMarketHelper(marketName, localSelectedMarkets)
    setLocalSelectedMarkets(newSet)
  }

  return (
    <Modal className="w-full" isCloseActive={false} close={close}>
      <div className="font-semibold">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-xl">Market filters</span>
          <button
            onClick={clearAll}
            className="flex justify-center items-center px-3 py-1 border rounded-md text-sm font-semibold"
          >
            Clear All
          </button>
        </div>
        <div className="p-4">
          <div>
            <span className="mr-4 py-1 flex items-center">
              <input
                type="checkbox"
                id={`checkbox-verified`}
                className="cursor-pointer border-2 border-gray-200 rounded-sm"
                checked={localIsVerifiedFilterActive}
                onChange={(e) => {
                  setLocalIsVerifiedFilterActive(!localIsVerifiedFilterActive)
                }}
              />
              <label
                htmlFor={`checkbox-verified`}
                className={classNames(
                  'ml-2 cursor-pointer font-medium',
                  localIsVerifiedFilterActive
                    ? 'text-brand-blue dark:text-blue-400'
                    : 'text-brand-black'
                )}
              >
                Verified Only
              </label>
            </span>
          </div>
          <div>
            <div className="text-lg">Platforms</div>
            <div className="flex flex-wrap">
              {CheckboxFilters.PLATFORMS.values.map((filter) => (
                <span className="mr-4 py-1 flex items-center" key={filter}>
                  <input
                    type="checkbox"
                    id={`checkbox-${filter}`}
                    className="cursor-pointer border-2 border-gray-200 rounded-sm"
                    checked={
                      localSelectedMarkets.has(filter) ||
                      localSelectedMarkets.has('All')
                    }
                    onChange={(e) => {
                      localToggleMarket(filter)
                    }}
                  />
                  <label
                    htmlFor={`checkbox-${filter}`}
                    className={classNames(
                      'ml-2 cursor-pointer font-medium',
                      localSelectedMarkets.has(filter) ||
                        localSelectedMarkets.has('All')
                        ? 'text-brand-blue dark:text-blue-400'
                        : 'text-brand-black'
                    )}
                  >
                    {filter}
                  </label>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-between border-t">
          <button
            onClick={close}
            className="flex justify-center items-center px-3 py-1 border rounded-md text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
