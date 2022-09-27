import ModalService from 'components/modals/ModalService'
import Slider, { Handle } from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useContext, useState } from 'react'
import classNames from 'classnames'
import { useTransactionManager } from 'utils'
import ratePost from 'actions/web3/ratePost'
import { convertAccountName } from 'lib/utils/stringUtil'
import A from 'components/A'
import { useQuery } from 'react-query'
import Image from 'next/image'
import { syncNFTOpinions } from 'actions/web2/opinions/syncNFTOpinions'
import { GlobalContext } from 'lib/GlobalContext'
import ListingContent from 'components/tokens/ListingContent'
import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import { getAccount } from 'actions/web2/user-market/apiUserActions'
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import AddCitationModal from 'modules/posts/components/AddCitationModal'
import { IdeamarketPost } from 'modules/posts/services/PostService'
import IMTextArea from 'modules/forms/components/IMTextArea'
import { useContractStore } from 'store/contractStore'
import { XIcon } from '@heroicons/react/solid'
import { syncPosts } from 'actions/web2/posts/syncPosts'
import TradeCompleteModal, {
  TX_TYPES,
} from 'components/trade/TradeCompleteModal'
import TxPending from 'components/trade/TxPending'
import RateModal from 'components/trade/RateModal'
import { WalletModal } from 'components'
import { useWalletStore } from 'store/walletStore'
import { useWeb3React } from '@web3-react/core'
import { updatePostMetadata } from 'actions/web2/posts/updatePostMetadata'
import { getCategories } from 'actions/web2/getCategories'
import { syncUserRelationsForWallet } from 'actions/web2/user-market/syncUserRelationsForWallet'
import StakeUserModal from 'modules/user-market/components/StakeUserModal'
import { USER_MARKET } from 'modules/user-market/utils/UserMarketUtils'
import postAndCite from 'actions/web3/postAndCite'

export default function RateUI({
  close = () => null,
  imPost,
  urlMetaData = null,
  isFullyFunctional = true,
  defaultRating = 50,
}: {
  close?: () => void // Optional for when this is inside a modal
  imPost: any
  urlMetaData?: any
  isFullyFunctional?: boolean
  defaultRating?: number
}) {
  const txManager = useTransactionManager()
  const { setIsTxPending, setOnWalletConnectedCallback, user } =
    useContext(GlobalContext)
  const { account } = useWeb3React()

  // local state for tabs. Create new post (true) or cite existing (false)
  const [isCreateNewPost, setIsCreateNewPost] = useState(true)

  const [inputRating, setInputRating] = useState(defaultRating)
  const [inputText, setInputText] = useState('')

  const [citations, setCitations] = useState([])
  const [inFavorArray, setInFavorArray] = useState([])
  const [selectedPosts, setSelectedPosts] = useState([])

  const onCitationRemoved = (post: IdeamarketPost) => {
    const indexOfAlreadyCited = citations.indexOf(post.tokenID)
    const citationsWithOldCitationRemoved = citations.filter(
      (c) => c !== post.tokenID
    )
    const inFavorArrayWithOldRemoved = inFavorArray.filter(
      (ele, ind) => ind !== indexOfAlreadyCited
    )
    const selectedPostsWithOldRemoved = selectedPosts.filter(
      (ele, ind) => ind !== indexOfAlreadyCited
    )

    const newCitations = [...citationsWithOldCitationRemoved]
    const newInFavorArray = [...inFavorArrayWithOldRemoved]
    const newSelectedPosts = [...selectedPostsWithOldRemoved]

    setCitations(newCitations)
    setInFavorArray(newInFavorArray)
    setSelectedPosts(newSelectedPosts)
  }

  const onStakeClicked = () => {
    ModalService.open(StakeUserModal, {
      ideaToken: user,
      market: USER_MARKET,
    })
  }

  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    txType: TX_TYPES
  ) {
    close()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      txType,
      onStakeClicked, // Putting this inside TradeCompleteModal causes memory issue, so have to pass as prop
    })
  }

  const onPostAndRateClicked = async () => {
    setIsTxPending(true)

    try {
      const web3TxMethod = postAndCite
      // content, rating, tokenId
      const citationMultiactionArgs = [
        inputText,
        inputRating,
        imPost?.tokenID,
      ]

      await txManager.executeTxWithCallbacks(
        'Post and Rate',
        web3TxMethod,
        {
          onReceipt: async (receipt: any) => {
            console.log('receipt==', receipt)
            // TODO: no events from multiaction so use getTotalPostsCount
            await updatePostMetadata({
              tokenID: receipt?.events?.Transfer?.returnValues?.tokenId,
              minterAddress: account,
              content: inputText,
              categories: selectedCategories,
            })

            await syncPosts(receipt?.events?.Transfer?.returnValues?.tokenId)

            await syncNFTOpinions(imPost?.tokenID)

            // Not using await for now in case algorithm takes lot of time to finish. Also, if this API doesn't work, using a triggered webjob may be better and more efficient at scale.
            syncUserRelationsForWallet({
              walletAddress: account,
              ratedPostID: imPost?.tokenID,
              rating: inputRating,
            })

            setCitations([])
            setSelectedCategories([])
            setIsTxPending(false)

            onTradeComplete(
              true,
              imPost?.listingId,
              imPost?.name,
              TX_TYPES.RATE
            )
          },
        },
        ...citationMultiactionArgs
      )
    } catch (ex) {
      console.log(ex)
      setCitations([])
      setSelectedCategories([])
      setIsTxPending(false)
      onTradeComplete(
        false,
        imPost?.listingId,
        imPost?.name,
        TX_TYPES.NONE
      )
      return
    }

  }

  // If creating new post, need to pass citations and inFavor in since setting local state is not sync
  const onRateClicked = async (
    newPostCitations?: number[],
    newPostInFavor?: boolean[]
  ) => {
    setIsTxPending(true)

    try {
      const web3TxMethod = ratePost

      const ratingArgs = [
        // tokenId , rating, citations, inFavorArray, opinionWriter
        imPost?.tokenID,
        inputRating,
        newPostCitations ? newPostCitations : citations,
        newPostInFavor ? newPostInFavor : inFavorArray,
        account,
      ]

      await txManager.executeTxWithCallbacks(
        'Rate',
        web3TxMethod,
        {
          onReceipt: async (receipt: any) => {
            await syncNFTOpinions(imPost?.tokenID)

            // Not using await for now in case algorithm takes lot of time to finish. Also, if this API doesn't work, using a triggered webjob may be better and more efficient at scale.
            syncUserRelationsForWallet({
              walletAddress: account,
              ratedPostID: imPost?.tokenID,
              rating: inputRating,
            })

            setIsTxPending(false)

            onTradeComplete(
              true,
              imPost?.listingId,
              imPost?.name,
              TX_TYPES.RATE
            )
          },
        },
        ...ratingArgs
      )
    } catch (ex) {
      console.log(ex)
      setIsTxPending(false)
      onTradeComplete(false, imPost?.listingId, imPost?.name, TX_TYPES.NONE)
      return
    }
  }

  /**
   * This is called when handle is dragged when NOT in a modal.
   */
  const onRateDragged = (token: any) => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(RateModal, {
          imPost: token,
          defaultRating: inputRating,
        })
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, {
        imPost: token,
        defaultRating: inputRating,
      })
    }
  }

  const isCreatingNewPost = isCreateNewPost && inputText?.length > 0
  const isRatingDisabled = inputRating === 50

  const isTextPostTooLong = inputText?.length > 360

  const { minterAddress } = (imPost || {}) as any

  const { data: userDataForMinter } = useQuery<any>(
    [`minterAddress-${minterAddress}`],
    () =>
      getAccount({
        username: null,
        walletAddress: minterAddress,
      })
  )

  const ideamarketPosts = useContractStore.getState().ideamarketPosts

  const [selectedCategories, setSelectedCategories] = useState([])

  const { data: categoriesData } = useQuery(
    ['all-categories', Boolean(ideamarketPosts)],
    () => getCategories({ enabled: true })
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

  const getRateButtonText = () => {
    if (
      (isCreateNewPost && inputText?.length <= 0) ||
      (!isCreateNewPost && citations?.length <= 0)
    ) {
      return 'Rate without Citation'
    } else if (isCreateNewPost && inputText?.length > 0) {
      return 'Create New Post + Rate with Citation (2 transactions)'
    } else if (!isCreateNewPost) {
      return `Rate with ${citations?.length} citations`
    }
  }

  const displayUsernameOrWallet = convertAccountName(
    userDataForMinter?.username || minterAddress
  )
  const usernameOrWallet = userDataForMinter?.username || minterAddress

  const citationsInFavor = selectedPosts?.filter(
    (p, pInd) => inFavorArray[pInd]
  )
  const citationsNotInFavor = selectedPosts?.filter(
    (p, pInd) => !inFavorArray[pInd]
  )

  return (
    <div className="w-full md:max-w-[34rem] bg-white dark:bg-gray-700 rounded-xl">
      <div className="px-6 py-4 bg-black/[.05] text-base font-medium leading-5 truncate">
        {/* Display minter image, username/wallet */}
        {minterAddress && (
          <div className="flex items-center pb-2 whitespace-nowrap">
            <div className="relative rounded-full w-6 h-6">
              <Image
                className="rounded-full"
                src={
                  userDataForMinter?.profilePhoto || '/default-profile-pic.png'
                }
                alt=""
                layout="fill"
                objectFit="cover"
              />
            </div>
            <A
              className="ml-2 font-bold hover:text-blue-600"
              href={`/u/${usernameOrWallet}`}
            >
              {displayUsernameOrWallet}
            </A>
            {userDataForMinter?.twitterUsername && (
              <A
                className="flex items-center space-x-1 ml-1 z-50"
                href={`/u/${usernameOrWallet}`}
              >
                <div className="relative w-4 h-4">
                  <Image
                    src={'/twitter-solid-blue.svg'}
                    alt="twitter-solid-blue-icon"
                    layout="fill"
                  />
                </div>
                <span className="text-sm opacity-50">
                  @{userDataForMinter?.twitterUsername}
                </span>
              </A>
            )}
          </div>
        )}

        <ListingContent
          imPost={imPost}
          page="RateModal"
          urlMetaData={urlMetaData}
          useMetaData={
            getListingTypeFromIDTURL(imPost?.url) !== LISTING_TYPE.TWEET &&
            getListingTypeFromIDTURL(imPost?.url) !== LISTING_TYPE.TEXT_POST
          }
        />
      </div>

      <div className="px-6 py-4">
        <div className="py-2">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">Rate</span>
            <span className="text-xl font-bold">{inputRating}</span>
          </div>

          <div className="w-[100%] mx-auto">
            <div className="w-full relative flex items-center h-16 bg-white rounded-2xl border">
              <div className="absolute top-1 left-2 text-xs opacity-50">
                Disagree
              </div>
              <Slider
                className=""
                defaultValue={defaultRating}
                onChange={(value) => {
                  setInputRating(value)
                }}
                onAfterChange={(value) => {
                  if (!isFullyFunctional) {
                    onRateDragged(imPost)
                    return
                  }
                }}
                // marks={sliderMarks}
                step={1}
                min={0}
                max={100}
                // tipFormatter={(value) => {
                //   return `${value}`
                // }}
                handle={(handleProps: any) => {
                  return (
                    <Handle
                      {...handleProps}
                      dragging={handleProps?.dragging?.toString()}
                    >
                      <div className="absolute -top-1 -left-6 w-[3.5rem] h-[2rem] rounded-2xl text-white bg-blue-600 flex justify-center items-center">
                        Drag
                      </div>
                    </Handle>
                  )
                }}
                railStyle={{
                  height: '20px',
                  borderRadius: 0,
                  color: 'red',
                  backgroundColor: 'rgb(8 87 224 / 0.05)',
                }}
                trackStyle={{
                  height: '20px',
                  borderRadius: 0,
                  background: 'transparent',
                }}
                style={{ padding: 0, left: '0px' }}
              />
              <div className="absolute top-1 right-2 text-xs opacity-50">
                Agree
              </div>
            </div>
          </div>
        </div>

        {isFullyFunctional && (
          <>
            <div className="flex items-center space-x-4 my-4">
              <span
                onClick={() => {
                  setInputText('')
                  setIsCreateNewPost(true)
                }}
                className={classNames(
                  isCreateNewPost ? 'text-black' : 'text-black/[.25]',
                  'font-bold text-lg cursor-pointer'
                )}
              >
                Create New Post
              </span>
              <span
                onClick={() => {
                  setInputText('')
                  setIsCreateNewPost(false)
                }}
                className={classNames(
                  !isCreateNewPost ? 'text-black' : 'text-black/[.25]',
                  'font-bold text-lg cursor-pointer'
                )}
              >
                Cite Existing Posts
              </span>
            </div>

            {isCreateNewPost ? (
              <>
                <div className="flex justify-between items-center">
                  <A
                    href="https://docs.ideamarket.io/how-to-make-a-good-post"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    How to make a good post —{'>'}
                  </A>

                  <span>
                    <span
                      className={classNames(
                        isTextPostTooLong && 'text-red-500'
                      )}
                    >
                      {inputText?.length}
                    </span>
                    /360
                  </span>
                </div>

                <IMTextArea
                  onChange={(newTextInput) => setInputText(newTextInput)}
                  placeholder="Cite your reasons... (optional)"
                />

                {inputText?.length > 0 &&
                  categoriesData &&
                  categoriesData?.length > 0 && (
                    <div className="my-4 text-sm">
                      <div className="text-black/[.5] font-semibold">
                        CATEGORY TAGS
                      </div>
                      <div className="flex flex-wrap">
                        {categoriesData.map((category) => {
                          return (
                            <div
                              onClick={() => onSelectCategory(category?.name)}
                              className={classNames(
                                selectedCategories.includes(category?.name)
                                  ? 'text-blue-500 bg-blue-100'
                                  : 'text-black',
                                'flex items-center border rounded-2xl px-2 py-1 cursor-pointer mr-2 mt-2'
                              )}
                              key={category?.name}
                            >
                              <span>{category?.name}</span>
                              {selectedCategories.includes(category?.name) && (
                                <XIcon className="w-5 h-5 ml-1" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <>
                {citations?.length > 0 ? (
                  <>
                    <div
                      onClick={() =>
                        ModalService.open(AddCitationModal, {
                          rootPost: imPost,
                          citations,
                          inFavorArray,
                          selectedPosts,
                          setCitations,
                          setInFavorArray,
                          setSelectedPosts,
                        })
                      }
                      className="w-full h-[5rem] mb-4 bg-brand-gray hover:bg-black/[.1] rounded-lg flex justify-center items-center cursor-pointer"
                    >
                      <PlusCircleIcon className="text-black/[.4] w-6 h-6" />
                    </div>

                    {/* Selected posts / citations */}
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Citations</span>
                      <span className=" text-sm">
                        Selected{' '}
                        <span className="font-semibold">
                          {citations?.length}
                        </span>{' '}
                        <span className="text-black/[.3]">(Maximum 10)</span>
                      </span>
                    </div>

                    <div className="mt-4 text-[#0cae74] text-sm font-bold">
                      FOR ({inFavorArray.filter((ele) => ele).length})
                    </div>

                    {citationsInFavor &&
                      citationsInFavor?.length > 0 &&
                      citationsInFavor.map((post, postInd) => {
                        const displayUsernameOrWalletSelected =
                          convertAccountName(
                            post?.minterToken?.username ||
                              post?.minterToken?.minterAddress
                          )
                        const usernameOrWalletSelected =
                          post?.minterToken?.username ||
                          post?.minterToken?.minterAddress

                        return (
                          <div
                            className="flex justify-between items-center w-full mt-4"
                            key={postInd}
                          >
                            <div className="w-[85%] bg-[#0cae74]/[.25] rounded-lg p-4">
                              <div className="flex items-center pb-2 whitespace-nowrap">
                                <div className="relative rounded-full w-6 h-6">
                                  <Image
                                    className="rounded-full"
                                    src={
                                      post?.minterToken?.profilePhoto ||
                                      '/default-profile-pic.png'
                                    }
                                    alt=""
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </div>
                                <A
                                  className="ml-2 font-bold hover:text-blue-600"
                                  href={`/u/${usernameOrWalletSelected}`}
                                >
                                  {displayUsernameOrWalletSelected}
                                </A>
                              </div>

                              <div>{post.content}</div>
                            </div>

                            <div className="flex justify-end">
                              <XCircleIcon
                                onClick={() => onCitationRemoved(post)}
                                className="w-8 cursor-pointer text-black/[.3] hover:text-red-600"
                              />
                            </div>
                          </div>
                        )
                      })}

                    <div className="mt-4 text-[#e63b3b] text-sm font-bold">
                      AGAINST ({inFavorArray.filter((ele) => !ele).length})
                    </div>

                    {citationsNotInFavor &&
                      citationsNotInFavor?.length > 0 &&
                      citationsNotInFavor.map((post, postInd) => {
                        const displayUsernameOrWalletSelected =
                          convertAccountName(
                            post?.minterToken?.username ||
                              post?.minterToken?.minterAddress
                          )
                        const usernameOrWalletSelected =
                          post?.minterToken?.username ||
                          post?.minterToken?.minterAddress

                        return (
                          <div
                            className="flex justify-between items-center w-full mt-4"
                            key={postInd}
                          >
                            <div className="w-[85%] bg-[#ec4a4a]/[.25] rounded-lg p-4">
                              <div className="flex items-center pb-2 whitespace-nowrap">
                                <div className="relative rounded-full w-6 h-6">
                                  <Image
                                    className="rounded-full"
                                    src={
                                      post?.minterToken?.profilePhoto ||
                                      '/default-profile-pic.png'
                                    }
                                    alt=""
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </div>
                                <A
                                  className="ml-2 font-bold hover:text-blue-600"
                                  href={`/u/${usernameOrWalletSelected}`}
                                >
                                  {displayUsernameOrWalletSelected}
                                </A>
                              </div>

                              <div>{post.content}</div>
                            </div>

                            <div className="flex justify-end">
                              <XCircleIcon
                                onClick={() => onCitationRemoved(post)}
                                className="w-8 cursor-pointer text-black/[.3] hover:text-red-600"
                              />
                            </div>
                          </div>
                        )
                      })}
                  </>
                ) : (
                  <div
                    onClick={() =>
                      ModalService.open(AddCitationModal, {
                        rootPost: imPost,
                        citations,
                        inFavorArray,
                        selectedPosts,
                        setCitations,
                        setInFavorArray,
                        setSelectedPosts,
                      })
                    }
                    className="w-full h-[5rem] bg-brand-gray hover:bg-black/[.1] rounded-lg flex justify-center items-center cursor-pointer"
                  >
                    <PlusCircleIcon className="text-black/[.4] w-6 h-6" />
                  </div>
                )}
              </>
            )}

            <button
              className={classNames(
                'py-4 mt-4 mb-2 text-lg font-bold rounded-2xl w-full',
                isRatingDisabled
                  ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                  : 'border-brand-blue text-white bg-black font-medium hover:bg-black/[.8]'
              )}
              disabled={isRatingDisabled}
              onClick={async () => {
                if (isCreatingNewPost) {
                  await onPostAndRateClicked()
                } else {
                  await onRateClicked()
                }
              }}
            >
              <span>Rate</span>
              <div className="text-sm font-normal opacity-50">
                {getRateButtonText()}
              </div>
            </button>

            <div className="text-xs text-center font-semibold">
              Confirm transaction in wallet to complete.
            </div>
            <div className="text-xs text-center">
              {`(Gas fee estimates are high. Most tx cost < $0.50)`}
            </div>

            <TxPending txManager={txManager} />
          </>
        )}
      </div>
    </div>
  )
}
