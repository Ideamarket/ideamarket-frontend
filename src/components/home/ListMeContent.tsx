import { GlobeAltIcon } from '@heroicons/react/outline'
import classNames from 'classnames'
import { CircleSpinner, WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'

type Props = {
  isAlreadyGhostListed: boolean
  isAlreadyOnChain: boolean
  isValidToken: boolean
  isURLMetaDataLoading: boolean
  urlMetaData: any
  finalURL: string
  isWalletConnected: boolean
  isListing: boolean
  categoriesData: any[]
  selectedCategories: string[]
  ghostCategories: any[]
  setSelectedCategories: (selectedCategories: string[]) => void
  onClickGhostList: () => void
  onClickOnChainList: () => void
  setShowListingCards: (showListingCards: boolean) => void
}

/**
 * Content shown while listing a new IDT
 */
const ListMeContent = ({
  isAlreadyGhostListed,
  isAlreadyOnChain,
  isValidToken,
  isURLMetaDataLoading,
  urlMetaData,
  finalURL,
  isWalletConnected,
  isListing,
  categoriesData,
  selectedCategories,
  ghostCategories,
  setSelectedCategories,
  onClickGhostList,
  onClickOnChainList,
  setShowListingCards,
}: Props) => {
  /**
   * This method is called when a category is clicked.
   * @param newClickedCategoryId -- Category ID of category just clicked
   */
  const onSelectCategory = (newClickedCategoryId: string) => {
    const isCatAlreadySelected =
      selectedCategories.includes(newClickedCategoryId)
    let newCategories = [...selectedCategories]
    if (isCatAlreadySelected) {
      newCategories = newCategories.filter(
        (cat) => cat !== newClickedCategoryId
      )
    } else {
      newCategories.push(newClickedCategoryId)
    }
    setSelectedCategories(newCategories)
  }

  return (
    <div className="w-full p-4 text-black bg-white rounded-lg shadow-2xl">
      {isAlreadyGhostListed && !isAlreadyOnChain ? (
        <div className="font-bold">Listing Found on Ghost Market!</div>
      ) : (
        <div className="flex items-center space-x-2 mb-4 text-lg">
          <div className="font-bold">Listing on</div>
          <div className="bg-gray-200 flex items-center rounded-lg px-2 py-1 text-sm">
            <GlobeAltIcon className="w-5 mr-1" />
            URLs
          </div>
          <div className="font-bold">Market</div>
        </div>
      )}

      <div className="bg-gray-200 flex items-center rounded-lg p-4 mt-2">
        {isValidToken && (
          <>
            {/* <GhostIcon className="w-6 h-6 mr-4" /> */}
            {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
            <div className="flex flex-col w-full">
              <div className="leading-5">
                <div className="inline font-medium mr-1">
                  {!isURLMetaDataLoading && urlMetaData && urlMetaData?.ogTitle
                    ? urlMetaData.ogTitle
                    : 'loading'}
                </div>
              </div>

              <a
                href={finalURL}
                className="text-brand-blue font-normal text-sm mt-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                {finalURL?.substr(
                  0,
                  finalURL?.length > 60 ? 60 : finalURL?.length
                ) + (finalURL?.length > 60 ? '...' : '')}
              </a>
              <a
                href={finalURL}
                className="h-56 mb-4 cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="rounded-xl mt-4 h-full"
                  src={
                    !isURLMetaDataLoading && urlMetaData && urlMetaData?.ogImage
                      ? urlMetaData.ogImage
                      : '/gray.svg'
                  }
                  alt=""
                  referrerPolicy="no-referrer"
                />
              </a>
              <div className="mt-4 text-gray-400 text-sm text-left leading-5">
                {!isURLMetaDataLoading &&
                urlMetaData &&
                urlMetaData?.ogDescription
                  ? urlMetaData?.ogDescription.substr(
                      0,
                      urlMetaData?.ogDescription.length > 150
                        ? 150
                        : urlMetaData?.ogDescription.length
                    ) + (urlMetaData?.ogDescription.length > 150 ? '...' : '')
                  : 'No description found'}
              </div>
            </div>
          </>
        )}
        {!isValidToken && !isAlreadyGhostListed && !isAlreadyOnChain && (
          <div className="text-red-400">
            {finalURL === '' ? 'Enter a URL to list' : 'INVALID URL'}
          </div>
        )}
        {isAlreadyOnChain && (
          <div className="text-red-400">
            THIS URL IS ALREADY LISTED ON-CHAIN
          </div>
        )}
      </div>

      {/* <div className="flex items-center mt-4 text-sm">
        <input
          type="checkbox"
          id="listAndBuyCheckbox"
          className="cursor-pointer"
          checked={isWantBuyChecked}
          onChange={(e) => {
            setIsWantBuyChecked(e.target.checked)
          }}
        />
        <label
          htmlFor="listAndBuyCheckbox"
          className={classNames(
            'ml-2 font-bold cursor-pointer',
            isWantBuyChecked
              ? 'text-brand-blue dark:text-blue-400'
              : 'text-black dark:text-gray-300'
          )}
        >
          I want to immediately buy this token
        </label>
      </div> */}

      {categoriesData && categoriesData?.length > 0 && (
        <div className="mt-4 text-sm">
          <div className="text-black/[.5] font-semibold">CATEGORY TAGS</div>
          <div className="flex flex-wrap">
            {categoriesData
              .filter(
                (cat) =>
                  !(
                    ghostCategories &&
                    ghostCategories.find((ghostCat) => ghostCat.id === cat.id)
                  )
              ) // If category is already ghost listed, do not display in list of selectable categories
              .map((category) => {
                return (
                  <div
                    onClick={() => onSelectCategory(category.id)}
                    className={classNames(
                      selectedCategories.includes(category.id)
                        ? 'text-blue-500 bg-blue-100'
                        : 'text-black',
                      'border rounded-2xl px-2 py-1 cursor-pointer mr-2 mt-2'
                    )}
                  >
                    {category.name}
                  </div>
                )
              })}
          </div>
          {ghostCategories &&
            ghostCategories?.length > 0 &&
            isAlreadyGhostListed &&
            !isAlreadyOnChain && (
              <div className="mt-2">
                <div className="text-black/[.5]">
                  Added by ghost lister, cannot change
                </div>
                <div className="flex flex-wrap">
                  {ghostCategories.map((cat) => {
                    return (
                      <div className="border rounded-2xl px-2 py-1 mr-2 mt-2 bg-black/[.05] text-black">
                        {cat.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      )}

      {isWalletConnected ? (
        <div className="flex justify-between items-center space-x-4 mt-4">
          {!isAlreadyGhostListed && (
            <button
              onClick={onClickGhostList}
              disabled={!isValidToken || isListing}
              className={classNames(
                'flex flex-col justify-center items-center w-full h-20 rounded-lg',
                !isValidToken || isListing
                  ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                  : 'text-white bg-brand-navy'
              )}
            >
              <div className="font-bold text-lg">List on Ghost Market</div>
              <div className="text-sm">Free & instant</div>
            </button>
          )}

          <button
            onClick={onClickOnChainList}
            disabled={!isValidToken || isListing}
            className={classNames(
              'flex flex-col justify-center items-center w-full h-20 font-bold rounded-lg',
              !isValidToken || isListing
                ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                : 'text-white bg-blue-500 '
            )}
          >
            <div className="font-bold text-lg">List On-Chain</div>
            <div className="text-sm">Tradeable Ideamarket listing</div>
          </button>
        </div>
      ) : (
        <button
          onClick={() =>
            ModalService.open(WalletModal, {}, () => setShowListingCards(true))
          }
          className="text-white bg-blue-500 flex flex-col justify-center items-center w-full h-20 mt-4 font-bold rounded-lg"
        >
          <div className="font-bold text-lg">CONNECT WALLET</div>
          <div className="text-sm opacity-75">to continue adding a listing</div>
        </button>
      )}

      {isListing && (
        <div className="flex items-center">
          <div>Listing in progress...</div>
          <CircleSpinner color="#0857e0" />
        </div>
      )}
    </div>
  )
}

export default ListMeContent
