import classNames from 'classnames'
import { useState } from 'react'
import Modal from '../modals/Modal'
import { MainFilters } from './utils/OverviewUtils'
import { BadgeCheckIcon, StarIcon } from '@heroicons/react/solid'
import {
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline'
import mixpanel from 'mixpanel-browser'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { MIX_PANEL_KEY } = publicRuntimeConfig

// Workaround since modal is not wrapped by the mixPanel interface
mixpanel.init(MIX_PANEL_KEY)

export default function OverviewFiltersModal({
  close,
  isVerifiedFilterActive,
  isStarredFilterActive,
  selectedFilterId,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
  setSelectedFilterId,
}: {
  close: () => void
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  selectedFilterId: number
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setSelectedFilterId: (id: number) => void
}) {
  // You need local values because props can never be updated in open modals
  const [localIsVerifiedFilterActive, setLocalIsVerifiedFilterActive] =
    useState(isVerifiedFilterActive)
  const [localIsStarredFilterActive, setLocalIsStarredFilterActive] = useState(
    isStarredFilterActive
  )
  const [localSelectedFilterId, setLocalSelectedFilterId] =
    useState(selectedFilterId)

  const getButtonIcon = (filterId: number) => {
    switch (filterId) {
      case 1:
        return <ArrowSmUpIcon className="w-4 h-4 stroke-current" />
      case 2:
        return <FireIcon className="w-4 h-4 mr-1" />
      case 3:
        return <SparklesIcon className="w-4 h-4 mr-1" />
      default:
        return <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
    }
  }

  return (
    <Modal className="w-full" close={close}>
      <div className="font-semibold">
        <div className="p-4">
          <div className="text-sm text-gray-400 mb-2">FILTER BY</div>
          <button
            className={classNames(
              'flex flex-grow justify-start items-center w-full p-2 mb-1 border rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                  localIsVerifiedFilterActive,
              },
              {
                'text-brand-black dark:text-gray-50':
                  !localIsVerifiedFilterActive,
              }
            )}
            onClick={() => {
              setLocalIsVerifiedFilterActive(!localIsVerifiedFilterActive)
              setIsVerifiedFilterActive(!localIsVerifiedFilterActive)
            }}
          >
            <BadgeCheckIcon className="w-5 h-5 mr-1" />
            <span>Verified</span>
          </button>
          <button
            className={classNames(
              'flex flex-grow justify-start items-center w-full p-2 border rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                  localIsStarredFilterActive,
              },
              {
                'text-brand-black dark:text-gray-50':
                  !localIsStarredFilterActive,
              }
            )}
            onClick={() => {
              setLocalIsStarredFilterActive(!localIsStarredFilterActive)
              setIsStarredFilterActive(!localIsStarredFilterActive)
            }}
          >
            <StarIcon className="w-5 h-5 mr-1" />
            <span>Starred</span>
          </button>

          <div className="text-sm text-gray-400 mb-2 mt-4">SORT BY</div>
          {Object.values(MainFilters).map((filter) => (
            <button
              className={classNames(
                'flex flex-grow justify-start items-center w-full p-2 mb-1 border rounded-md text-sm font-semibold',
                {
                  'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                    filter.id === localSelectedFilterId,
                },
                {
                  'text-brand-black dark:text-gray-50': !(
                    filter.id === localSelectedFilterId
                  ),
                }
              )}
              onClick={() => {
                setLocalSelectedFilterId(filter.id)
                setSelectedFilterId(filter.id)
              }}
              key={filter.id}
            >
              {getButtonIcon(filter.id)}
              <span>{filter.value}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
