import 'rc-slider/assets/index.css'
import { useContext, useEffect, useState } from 'react'
import classNames from 'classnames'
import { useTransactionManager } from 'utils'
import TxPending from 'components/trade/TxPending'
import { GlobeAltIcon, MenuAlt2Icon } from '@heroicons/react/outline'
import { TX_TYPES } from 'components/trade/TradeCompleteModal'
import mintPost from 'actions/web3/mintPost'
import { useQuery } from 'react-query'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { GlobalContext } from 'lib/GlobalContext'
import getAllCategories from 'actions/web3/getAllCategories'
import { XIcon } from '@heroicons/react/solid'
import { useContractStore } from 'store/contractStore'
import { syncPosts } from 'actions/web2/posts/syncPosts'
import { verifyTokenName } from 'actions'
import IMTextArea from 'modules/forms/components/IMTextArea'
import { getValidURL } from 'actions/web2/getValidURL'

type NewPostUIProps = {
  isTxButtonActive?: boolean
  onTradeComplete: (
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    transactionType: TX_TYPES
  ) => void
  // Method used to pass input values from this file to parent file
  onInputChanged?: (inputContent: string) => void
}

export default function NewPostUI({
  isTxButtonActive = true,
  onTradeComplete,
  onInputChanged = () => null,
}: NewPostUIProps) {
  const txManager = useTransactionManager()
  const ideamarketPosts = useContractStore.getState().ideamarketPosts

  const { setIsTxPending } = useContext(GlobalContext)

  const [inputContent, setInputContent] = useState('')
  const [inputPostType, setInputPostType] = useState(TX_TYPES.TEXT_POST_LIST)
  const [finalURL, setFinalURL] = useState('')
  // const [finalTokenValue, setFinalTokenValue] = useState('')
  // const [isWantBuyChecked, setIsWantBuyChecked] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isAlreadyOnChain, setIsAlreadyOnChain] = useState(false)

  const { data: urlMetaData, isLoading: isURLMetaDataLoading } = useQuery(
    [finalURL],
    () => getURLMetaData(finalURL)
  )

  const [selectedCategories, setSelectedCategories] = useState([])

  const { data: categoriesData } = useQuery(
    ['all-categories', Boolean(ideamarketPosts)],
    () => getAllCategories()
  )

  /**
   * This method is called when a category is clicked.
   * @param newClickedCategory -- Category just clicked
   */
  const onSelectCategory = (newClickedCategory: string) => {
    const isCatAlreadySelected = selectedCategories.includes(newClickedCategory)
    let newCategories = [...selectedCategories]
    if (isCatAlreadySelected) {
      newCategories = newCategories.filter((cat) => cat !== newClickedCategory)
    } else {
      newCategories.push(newClickedCategory)
    }
    setSelectedCategories(newCategories)
  }

  const onURLTyped = async (newTextInput: string) => {
    const typedURL = newTextInput

    setInputContent(typedURL)
    setSelectedCategories([]) // Set selected categories to none if any input typed

    const canonical = await getValidURL(typedURL)

    const { isValid, isAlreadyOnChain } = await verifyTokenName(canonical)

    setFinalURL(canonical)

    setIsValidToken(isValid)
    setIsAlreadyOnChain(isAlreadyOnChain)
  }

  const onPostClicked = async () => {
    setIsTxPending(true)
    // TODO: do imageLink and imageHashes
    const isURL = inputPostType === TX_TYPES.URL_LIST
    // content, imageHashes, categoryTags, imageLink, isURL, urlContent
    const mintingArgs = [
      isURL ? finalURL : inputContent,
      [],
      selectedCategories,
      '',
      isURL,
      isURL ? 'Currently not fetching urlContent' : '', // TODO: tweet text will go here. Sai needs to pull this and send to me
    ]

    try {
      await txManager.executeTxWithCallbacks(
        'New Post',
        mintPost,
        {
          onReceipt: async (receipt: any) => {
            await syncPosts(receipt?.events?.Transfer?.returnValues?.tokenId)
            setIsTxPending(false)
          },
        },
        ...mintingArgs
      )
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, 'error', 'error', TX_TYPES.NONE)
      setIsTxPending(false)
      setSelectedCategories([])
      return
    }

    onTradeComplete(true, 'success', 'success', TX_TYPES.RATE)
    setSelectedCategories([])
  }

  // Watch for changes in input and send new values to parent component
  useEffect(() => {
    onInputChanged(inputContent)
  }, [inputContent, onInputChanged])

  const isTextPostTooLong = inputContent?.length > 360
  const isListingDisabled = isTextPostTooLong || !isValidToken

  return (
    <div className="w-full">
      <div className="px-6 py-4 font-bold text-2xl">New Post</div>

      {/* Tab buttons and text area */}
      <div className="px-6 py-4">
        {/* Tab buttons */}
        <div className="flex justify-between items-end mx-1 mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsValidToken(false)
                setInputPostType(TX_TYPES.TEXT_POST_LIST)
                setInputContent('')
                setFinalURL('')
              }}
              className={classNames(
                inputPostType === TX_TYPES.TEXT_POST_LIST
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-black/[.02] text-black',
                'h-9 px-2 flex justify-center items-center space-x-1 rounded-lg border text-sm font-semibold'
              )}
            >
              <MenuAlt2Icon className="w-4" />
              <span>Text Post</span>
            </button>

            <button
              onClick={() => {
                setIsValidToken(false)
                setInputPostType(TX_TYPES.URL_LIST)
                setInputContent('')
                setFinalURL('')
              }}
              className={classNames(
                inputPostType === TX_TYPES.URL_LIST
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-black/[.02] text-black',
                'h-9 px-2 flex justify-center items-center space-x-1 rounded-lg border text-sm font-semibold'
              )}
            >
              <GlobeAltIcon className="w-4" />
              <span>Tweet</span>
            </button>
          </div>

          <span>
            <span className={classNames(isTextPostTooLong && 'text-red-500')}>
              {inputContent?.length}
            </span>
            /360
          </span>
        </div>

        <IMTextArea
          onChange={(newTextInput: string) => {
            if (inputPostType === TX_TYPES.TEXT_POST_LIST) {
              setIsValidToken(newTextInput?.length > 0 ? true : false)
              setInputContent(newTextInput)
            } else onURLTyped(newTextInput)
          }}
          placeholder={
            inputPostType === TX_TYPES.TEXT_POST_LIST
              ? 'Create a text post...'
              : 'Paste a URL here...'
          }
        />

        {categoriesData && categoriesData?.length > 0 && (
          <div className="my-4 text-sm">
            <div className="text-black/[.5] font-semibold">CATEGORY TAGS</div>
            <div className="flex flex-wrap">
              {categoriesData.map((category) => {
                return (
                  <div
                    onClick={() => onSelectCategory(category)}
                    className={classNames(
                      selectedCategories.includes(category)
                        ? 'text-blue-500 bg-blue-100'
                        : 'text-black',
                      'flex items-center border rounded-2xl px-2 py-1 cursor-pointer mr-2 mt-2'
                    )}
                    key={category}
                  >
                    <span>{category}</span>
                    {selectedCategories.includes(category) && (
                      <XIcon className="w-5 h-5 ml-1" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {inputPostType === TX_TYPES.URL_LIST && (
          <div className="my-4">
            <div className="ml-1 mb-3 text-sm font-semibold">
              LISTING PREVIEW
            </div>

            <div className="bg-black/[.1] rounded-lg p-4">
              {isValidToken && (
                // Didn't use Next image because can't do wildcard domain allow in next config file
                <div className="flex flex-col w-full">
                  <div className="leading-5">
                    <div className="inline font-medium mr-1">
                      {!isURLMetaDataLoading &&
                      urlMetaData &&
                      urlMetaData?.ogTitle
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
                        !isURLMetaDataLoading &&
                        urlMetaData &&
                        urlMetaData?.ogImage
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
                        ) +
                        (urlMetaData?.ogDescription.length > 150 ? '...' : '')
                      : 'No description found'}
                  </div>
                </div>
              )}
              {!isValidToken && !isAlreadyOnChain && (
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
          </div>
        )}

        {isTxButtonActive && (
          <>
            <button
              className={classNames(
                'py-4 mt-4 mb-2 text-lg font-bold rounded-2xl w-full font-sf-compact-medium',
                isListingDisabled
                  ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                  : 'border-brand-blue text-white bg-brand-blue font-medium  hover:bg-blue-800'
              )}
              disabled={isListingDisabled}
              onClick={onPostClicked}
            >
              Post
            </button>

            <div className="text-xs text-center font-semibold">
              Confirm transaction in wallet to complete.
            </div>

            <TxPending txManager={txManager} />
          </>
        )}
      </div>
    </div>
  )
}
