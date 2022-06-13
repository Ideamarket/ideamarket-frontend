import { Modal } from 'components'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, { TX_TYPES } from './TradeCompleteModal'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useContext, useState } from 'react'
import classNames from 'classnames'
import { useTransactionManager } from 'utils'
import rateIDT from 'actions/web3/rateIDT'
import TxPending from './TxPending'
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
import { XCircleIcon } from '@heroicons/react/outline'
import AddCitationModal from 'modules/posts/components/AddCitationModal'
import { IdeamarketPost } from 'modules/posts/services/PostService'

const CustomSlider = Slider.createSliderWithTooltip(Slider)

const sliderMarks = {
  0: '0',
  100: '100',
}

export default function RateModal({
  close,
  ideaToken,
  urlMetaData,
}: {
  close: () => void
  ideaToken: any
  urlMetaData: any
}) {
  const txManager = useTransactionManager()
  const { setIsTxPending } = useContext(GlobalContext)

  const [inputRating, setInputRating] = useState(50)

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

  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    transactionType: TX_TYPES
  ) {
    close()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      transactionType,
    })
  }

  const onRateClicked = async () => {
    setIsTxPending(true)
    const isNFT = !ideaToken.address // If there is not a token address, then it is NFT

    try {
      const web3TxMethod = isNFT ? ratePost : rateIDT
      // tokenId , rating, citations, inFavorArray
      const ratingArgs = [
        isNFT ? ideaToken?.tokenID : ideaToken.address,
        inputRating,
        citations,
        inFavorArray,
      ]
      await txManager.executeTxWithCallbacks(
        'Rate',
        web3TxMethod,
        {
          onReceipt: async (receipt: any) => {
            await syncNFTOpinions(ideaToken?.tokenID)
            setIsTxPending(false)
          },
        },
        ...ratingArgs
      )
    } catch (ex) {
      console.log(ex)
      setIsTxPending(false)
      onTradeComplete(
        false,
        ideaToken?.listingId,
        ideaToken?.name,
        TX_TYPES.NONE
      )
      return
    }

    onTradeComplete(true, ideaToken?.listingId, ideaToken?.name, TX_TYPES.RATE)
  }

  const isRatingDisabled = inputRating === 50

  const { minterAddress } = (ideaToken || {}) as any

  const { data: userDataForMinter } = useQuery<any>(
    [`minterAddress-${minterAddress}`],
    () =>
      getAccount({
        username: null,
        walletAddress: minterAddress,
      })
  )

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
    <Modal close={close}>
      <div className="w-full md:w-136 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        <div className="px-6 py-4 bg-black/[.05] text-base font-medium leading-5 truncate">
          {/* Display minter image, username/wallet */}
          {minterAddress && (
            <div className="flex items-center pb-2 whitespace-nowrap">
              <div className="relative rounded-full w-6 h-6">
                <Image
                  className="rounded-full"
                  src={
                    userDataForMinter?.profilePhoto ||
                    '/DefaultProfilePicture.png'
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
            imPost={ideaToken}
            page="RateModal"
            urlMetaData={urlMetaData}
            useMetaData={
              getListingTypeFromIDTURL(ideaToken?.url) !== LISTING_TYPE.TWEET &&
              getListingTypeFromIDTURL(ideaToken?.url) !==
                LISTING_TYPE.TEXT_POST
            }
          />
        </div>

        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-lg">Rating</span>
            {/* <div>
              <span className="text-blue-600 font-bold mr-1">
                {formatNumber(avgRating)}
              </span>
            </div> */}
          </div>

          <div className="px-4 py-2 border rounded-lg">
            <div className="flex justify-end items-center mb-12">
              <span className="text-xl font-bold">{inputRating}</span>
            </div>

            <CustomSlider
              className="mb-7"
              defaultValue={50}
              onChange={(value) => {
                setInputRating(value)
              }}
              marks={sliderMarks}
              step={1}
              min={0}
              max={100}
              tipFormatter={(value) => {
                return `${value}`
              }}
            />
          </div>

          {/* Selected posts / citations */}
          <div className="flex justify-between items-center font-bold text-lg mt-4">
            <span>Citations</span>
            <span className=" text-sm">
              Selected{' '}
              <span className="font-semibold">{citations?.length}</span>{' '}
              <span className="text-black/[.3]">(Maximum 10)</span>
            </span>
          </div>

          <div className="mt-4 text-[#0cae74] text-sm font-bold">
            FOR ({inFavorArray.filter((ele) => ele).length})
          </div>

          {citationsInFavor &&
            citationsInFavor?.length > 0 &&
            citationsInFavor.map((post, postInd) => {
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
                            '/DefaultProfilePicture.png'
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
                            '/DefaultProfilePicture.png'
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

          <button
            onClick={() =>
              ModalService.open(AddCitationModal, {
                citations,
                inFavorArray,
                selectedPosts,
                setCitations,
                setInFavorArray,
                setSelectedPosts,
              })
            }
            className="py-4 mt-4 text-lg font-bold rounded-2xl w-full bg-blue-600 hover:bg-blue-800 text-white"
          >
            <span>Add Citation</span>
            <div className="text-xs font-normal">(recommended)</div>
          </button>

          <button
            className={classNames(
              'py-4 mt-4 mb-2 text-lg font-bold rounded-2xl w-full',
              isRatingDisabled
                ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                : 'border-brand-blue text-white bg-black font-medium hover:bg-black/[.8]'
            )}
            disabled={isRatingDisabled}
            onClick={onRateClicked}
          >
            Rate
          </button>

          <div className="text-xs text-center font-semibold">
            Confirm transaction in wallet to complete.
          </div>

          <TxPending txManager={txManager} />
        </div>
      </div>
    </Modal>
  )
}
