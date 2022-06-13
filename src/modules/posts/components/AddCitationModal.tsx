import {
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
  ArrowSmRightIcon,
  ChevronDownIcon,
  PencilIcon,
} from '@heroicons/react/outline'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { A, Modal } from 'components'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import ModalService from 'components/modals/ModalService'
import { GlobalContext } from 'lib/GlobalContext'
import { convertAccountName } from 'lib/utils/stringUtil'
import { flatten } from 'lodash'
import { getUsersLatestOpinions } from 'modules/ratings/services/OpinionService'
import Image from 'next/image'
import {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useInfiniteQuery } from 'react-query'
import { getIMORatingColors, urlify } from 'utils/display/DisplayUtils'
import {
  getSortOptionDisplayNameByValue,
  SortOptionsAddCitationsModal,
  TABLE_NAMES,
} from 'utils/tables'
import useOnClickOutside from 'utils/useOnClickOutside'
import { getAllPosts, IdeamarketPost } from '../services/PostService'
import NewPostModal from './NewPostModal'

const TOKENS_PER_PAGE = 5

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
  enabled: false,
  keepPreviousData: true,
}

type AddCitationModalProps = {
  close: () => void
  citations: number[]
  inFavorArray: boolean[]
  selectedPosts: IdeamarketPost[]
  setCitations: (citations: number[]) => void
  setInFavorArray: (inFavorArray: boolean[]) => void
  setSelectedPosts: (selectedPosts: IdeamarketPost[]) => void
}

export default function AddCitationModal({
  close,
  citations,
  inFavorArray,
  selectedPosts,
  setCitations,
  setInFavorArray,
  setSelectedPosts,
}: AddCitationModalProps) {
  const { isTxPending } = useContext(GlobalContext)
  const { account } = useWeb3React()

  const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false)
  const ref = useRef()
  useOnClickOutside(ref, () => setIsSortingDropdownOpen(false))

  const [ratedByYouActive, setRatedByYouActive] = useState(false)
  const [orderBy, setOrderBy] = useState(
    SortOptionsAddCitationsModal.MARKET_INTEREST.value
  )

  const [postSearchText, setPostSearchText] = useState('')

  const [localCitations, setLocalCitations] = useState(citations)
  const [localInFavorArray, setLocalInFavorArray] = useState(inFavorArray)
  const [localSelectedPosts, setLocalSelectedPosts] = useState(selectedPosts)

  const {
    data: infiniteRatingsData,
    fetchNextPage: fetchMoreRatings,
    refetch: refetchRatings,
    hasNextPage: canFetchMoreRatings,
  } = useInfiniteQuery(
    ['ratings'],
    ({ pageParam = 0 }) => ratingsQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const ratingPairs = flatten(infiniteRatingsData?.pages || [])

  useEffect(() => {
    refetchRatings()
  }, [orderBy, postSearchText, refetchRatings, isTxPending])

  async function ratingsQueryFunction(numTokens: number, skip: number = 0) {
    const latestUserOpinions = await getUsersLatestOpinions({
      walletAddress: account,
      skip,
      limit: numTokens,
      orderBy,
      orderDirection: 'desc',
      filterTokens: [],
      search: postSearchText,
    })

    return latestUserOpinions || []
  }

  const {
    data: infiniteSearchedPosts,
    fetchNextPage: fetchMoreSearchedPosts,
    refetch: refetchSearchedPosts,
    hasNextPage: canFetchMoreSearchedPosts,
  } = useInfiniteQuery(
    [
      TOKENS_PER_PAGE,
      orderBy,
      // orderDirection,
      // selectedCategories,
      // filterTokens,
      postSearchText,
    ],
    ({ pageParam = 0 }) =>
      getAllPosts(
        [TOKENS_PER_PAGE, orderBy, 'desc', [], [], postSearchText, null],
        pageParam
      ),
    infiniteQueryConfig
  )

  const searchedPosts = flatten(infiniteSearchedPosts?.pages || [])

  useEffect(() => {
    refetchSearchedPosts()
  }, [orderBy, postSearchText, refetchSearchedPosts, isTxPending])

  const onAddCitationClicked = () => {
    setCitations(localCitations)
    setInFavorArray(localInFavorArray)
    setSelectedPosts(localSelectedPosts)
    close()
  }

  const onLocalCitationChanged = (
    post: IdeamarketPost,
    isForReasoning: boolean
  ) => {
    const isCitationAlreadyCited = localCitations.includes(post.tokenID)
    const indexOfAlreadyCited = localCitations.indexOf(post.tokenID)
    const citationsWithOldCitationRemoved = localCitations.filter(
      (c) => c !== post.tokenID
    )
    const inFavorArrayWithOldRemoved = isCitationAlreadyCited
      ? localInFavorArray.filter((ele, ind) => ind !== indexOfAlreadyCited)
      : localInFavorArray
    const selectedPostsWithOldRemoved = isCitationAlreadyCited
      ? localSelectedPosts.filter((ele, ind) => ind !== indexOfAlreadyCited)
      : localSelectedPosts

    const newLocalCitations = isCitationAlreadyCited
      ? [...citationsWithOldCitationRemoved]
      : [...citationsWithOldCitationRemoved, post.tokenID]
    const newLocalInFavorArray = isCitationAlreadyCited
      ? [...inFavorArrayWithOldRemoved]
      : [...inFavorArrayWithOldRemoved, isForReasoning]
    const newLocalSelectedPosts = isCitationAlreadyCited
      ? [...selectedPostsWithOldRemoved]
      : [...selectedPostsWithOldRemoved, post]

    setLocalCitations(newLocalCitations)
    setLocalInFavorArray(newLocalInFavorArray)
    setLocalSelectedPosts(newLocalSelectedPosts)
  }

  const observer: MutableRefObject<any> = useRef()

  const rootObserver = useRef()

  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          // entries[0].target.style.backgroundColor = 'green'
          if (entries[0].isIntersecting && canFetchMoreSearchedPosts) {
            // console.log('isIntersecting is true')
            fetchMoreSearchedPosts()
          }
          if (entries[0].isIntersecting && canFetchMoreRatings) {
            fetchMoreRatings()
          }
        },
        {
          // root: rootObserver.current
        }
      )

      if (node) {
        observer.current.observe(node)
      }
    },
    [
      canFetchMoreSearchedPosts,
      canFetchMoreRatings,
      fetchMoreSearchedPosts,
      fetchMoreRatings,
    ]
  )

  return (
    <Modal close={close}>
      <div
        ref={rootObserver}
        className="w-full md:w-136 mx-auto bg-white dark:bg-gray-700 rounded-xl"
      >
        <div className="px-6 py-4 bg-black/[.05]">
          <input
            onChange={(event) => setPostSearchText(event.target.value)}
            placeholder="Search posts to cite..."
            className="bg-transparent focus:outline-none px-2 py-1"
          />
        </div>

        <div className="px-6 py-4">
          <div className="flex justify-center items-center space-x-1 text-sm">
            <span>Can't find a good post to cite?</span>
            <span
              onClick={() => ModalService.open(NewPostModal)}
              className="flex items-center text-blue-600 font-semibold cursor-pointer"
            >
              <span>Create your own post</span>
              <ArrowSmRightIcon className="w-5" />
            </span>
          </div>

          <div className="pb-6">
            <button
              onClick={onAddCitationClicked}
              disabled={localCitations?.length <= 0}
              className={classNames(
                localCitations?.length <= 0
                  ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default'
                  : 'text-white bg-blue-600 hover:bg-blue-800',
                'py-4 mt-4 text-lg font-bold rounded-2xl w-full'
              )}
            >
              Add Citation
            </button>
          </div>

          {/* Filters */}
          <div className="mb-4 flex items-center space-x-2 text-sm ">
            <button
              onClick={() => setRatedByYouActive(!ratedByYouActive)}
              className={classNames(
                ratedByYouActive ? 'bg-blue-600 text-white' : 'text-black',
                'border px-3 py-2 flex items-center rounded-2xl font-medium'
              )}
            >
              <PencilIcon className="w-4 mr-1" />
              <span>Rated By You</span>
            </button>

            <div
              onClick={() =>
                setIsSortingDropdownOpen((prevState) => !prevState)
              }
              className="relative px-3 py-2 border rounded-2xl flex justify-center items-center cursor-pointer font-medium"
            >
              <span>
                Sort By:{' '}
                {getSortOptionDisplayNameByValue(
                  orderBy,
                  TABLE_NAMES.ADD_CITATION_MODAL
                )}
              </span>
              <span className="ml-1">
                <ChevronDownIcon className="h-3" />
              </span>
              {isSortingDropdownOpen && (
                <DropdownButtons
                  container={ref}
                  filters={Object.values(SortOptionsAddCitationsModal)}
                  selectedOptions={new Set([orderBy])}
                  toggleOption={setOrderBy}
                />
              )}
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center font-bold">
            <span className="text-[#e63b3b] text-sm">
              <ArrowCircleLeftIcon className="w-5 cursor-pointer mr-1" />
              <span>AGAINST</span>
              <span className="ml-1">
                ({localInFavorArray.filter((ele) => !ele).length})
              </span>
            </span>

            <span className=" text-sm">
              Selected{' '}
              <span className="font-semibold">{localCitations?.length}</span>{' '}
              <span className="text-black/[.3]">(Maximum 10)</span>
            </span>

            <span className="text-[#0cae74] text-sm flex items-center">
              <span className="mr-1">
                ({localInFavorArray.filter((ele) => ele).length})
              </span>
              <span>FOR</span>
              <ArrowCircleRightIcon className="w-5 cursor-pointer ml-1" />
            </span>
          </div>

          {/* Show this when user text searches for a Post or show ALL posts when ratedByYou is not selected */}
          {(postSearchText?.length > 0 || !ratedByYouActive) && (
            <div className="">
              {searchedPosts &&
                searchedPosts.map((post, postInd) => {
                  const { minterAddress } = (post || {}) as any

                  const displayUsernameOrWallet = convertAccountName(
                    post?.minterToken?.username || minterAddress
                  )
                  const usernameOrWallet =
                    post?.minterToken?.username || minterAddress

                  const isCitationAlreadyCited = localCitations.includes(
                    post.tokenID
                  )
                  const indexOfAlreadyCited = localCitations.indexOf(
                    post.tokenID
                  )
                  const isInFavor = localInFavorArray[indexOfAlreadyCited]

                  // const cutOffContent = post?.content?.length > 280
                  const postText = true
                    ? post?.content
                    : post?.content.slice(0, 280) + '...'

                  if (isCitationAlreadyCited && !isInFavor) {
                    return (
                      <div
                        ref={lastElementRef}
                        className="flex items-center w-full mb-2"
                        key={postInd}
                      >
                        <div className="relative w-[85%] bg-[#ec4a4a]/[.25] rounded-lg p-4 cursor-pointer">
                          <A
                            href={`/post/${post?.tokenID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span
                              className={classNames(
                                getIMORatingColors(
                                  Math.round(post?.compositeRating)
                                ),
                                'absolute top-2 right-2 w-10 h-8 flex justify-center items-center rounded-lg font-extrabold text-xl'
                              )}
                            >
                              {Math.round(post?.compositeRating)}
                            </span>

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

                            <div className="relative">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: urlify(postText),
                                }}
                                className="whitespace-pre-wrap break-words relative z-50 text-base text-black font-medium"
                              />

                              {/* {cutOffContent && (
                                <A
                                  href={`/post/${post?.tokenID}`}
                                  className="absolute bottom-0 right-0 text-blue-500 z-[60]"
                                >
                                  (More...)
                                </A>
                              )} */}
                            </div>
                          </A>
                        </div>

                        <div className="w-[15%] flex justify-end">
                          <ArrowCircleRightIcon
                            onClick={() => onLocalCitationChanged(post, true)}
                            className="w-5 cursor-pointer"
                          />
                        </div>
                      </div>
                    )
                  }

                  if (isCitationAlreadyCited && isInFavor) {
                    return (
                      <div
                        ref={lastElementRef}
                        className="flex items-center w-full mb-2"
                        key={postInd}
                      >
                        <div className="w-[15%]">
                          <ArrowCircleLeftIcon
                            onClick={() => onLocalCitationChanged(post, false)}
                            className="w-5 cursor-pointer"
                          />
                        </div>

                        <div className="relative w-[85%] bg-[#0cae74]/[.25] rounded-lg p-4 cursor-pointer">
                          <A
                            href={`/post/${post?.tokenID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span
                              className={classNames(
                                getIMORatingColors(
                                  Math.round(post?.compositeRating)
                                ),
                                'absolute top-2 right-2 w-10 h-8 flex justify-center items-center rounded-lg font-extrabold text-xl'
                              )}
                            >
                              {Math.round(post?.compositeRating)}
                            </span>

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

                            <div className="relative">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: urlify(postText),
                                }}
                                className="whitespace-pre-wrap break-words relative z-50 text-base text-black font-medium"
                              />

                              {/* {cutOffContent && (
                                <A
                                  href={`/post/${post?.tokenID}`}
                                  className="absolute bottom-0 right-0 text-blue-500 z-[60]"
                                >
                                  (More...)
                                </A>
                              )} */}
                            </div>
                          </A>
                        </div>
                      </div>
                    )
                  }

                  // If !isCitationAlreadyCited
                  return (
                    <div
                      ref={lastElementRef}
                      className="flex items-center w-full mb-2"
                      key={postInd}
                    >
                      <div className="w-[15%]">
                        <ArrowCircleLeftIcon
                          onClick={() => onLocalCitationChanged(post, false)}
                          className="w-5 cursor-pointer"
                        />
                      </div>

                      <div className="relative w-[70%] bg-black/[.05] rounded-lg p-4 cursor-pointer">
                        <A
                          href={`/post/${post?.tokenID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span
                            className={classNames(
                              getIMORatingColors(
                                Math.round(post?.compositeRating)
                              ),
                              'absolute top-2 right-2 w-10 h-8 flex justify-center items-center rounded-lg font-extrabold text-xl'
                            )}
                          >
                            {Math.round(post?.compositeRating)}
                          </span>

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

                          <div className="relative">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: urlify(postText),
                              }}
                              className="whitespace-pre-wrap break-words relative z-50 text-base text-black font-medium"
                            />

                            {/* {cutOffContent && (
                              <A
                                href={`/post/${post?.tokenID}`}
                                className="absolute bottom-0 right-0 text-blue-500 z-[60]"
                              >
                                (More...)
                              </A>
                            )} */}
                          </div>
                        </A>
                      </div>

                      <div className="w-[15%] flex justify-end">
                        <ArrowCircleRightIcon
                          onClick={() => onLocalCitationChanged(post, true)}
                          className="w-5 cursor-pointer"
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {ratedByYouActive && (
            <div>
              {ratingPairs &&
                ratingPairs.map((opinion, oInd) => {
                  const { minterAddress } = (opinion || {}) as any

                  const displayUsernameOrWallet = convertAccountName(
                    opinion?.minterToken?.username || minterAddress
                  )
                  const usernameOrWallet =
                    opinion?.minterToken?.username || minterAddress

                  const isCitationAlreadyCited = localCitations.includes(
                    opinion.tokenID
                  )
                  const indexOfAlreadyCited = localCitations.indexOf(
                    opinion.tokenID
                  )
                  const isInFavor = localInFavorArray[indexOfAlreadyCited]

                  // const cutOffContent = opinion?.content?.length > 280
                  const postText = true
                    ? opinion?.content
                    : opinion?.content.slice(0, 280) + '...'

                  if (isCitationAlreadyCited && !isInFavor) {
                    return (
                      <div
                        ref={lastElementRef}
                        className="flex items-center w-full mb-2"
                        key={oInd}
                      >
                        <div className="relative w-[85%] bg-[#ec4a4a]/[.25] rounded-lg p-4 cursor-pointer">
                          <A
                            href={`/post/${opinion?.tokenID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span
                              className={classNames(
                                getIMORatingColors(
                                  Math.round(opinion?.compositeRating)
                                ),
                                'absolute top-2 right-2 w-10 h-8 flex justify-center items-center rounded-lg font-extrabold text-xl'
                              )}
                            >
                              {Math.round(opinion?.compositeRating)}
                            </span>

                            <div className="flex items-center pb-2 whitespace-nowrap">
                              <div className="relative rounded-full w-6 h-6">
                                <Image
                                  className="rounded-full"
                                  src={
                                    opinion?.minterToken?.profilePhoto ||
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

                            <div className="relative">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: urlify(postText),
                                }}
                                className="whitespace-pre-wrap break-words relative z-50 text-base text-black font-medium"
                              />

                              {/* {cutOffContent && (
                                <A
                                  href={`/post/${opinion?.tokenID}`}
                                  className="absolute bottom-0 right-0 text-blue-500 z-[60]"
                                >
                                  (More...)
                                </A>
                              )} */}
                            </div>
                          </A>
                        </div>

                        <div className="w-[15%] flex justify-end">
                          <ArrowCircleRightIcon
                            onClick={() =>
                              onLocalCitationChanged(opinion, true)
                            }
                            className="w-5 cursor-pointer"
                          />
                        </div>
                      </div>
                    )
                  }

                  if (isCitationAlreadyCited && isInFavor) {
                    return (
                      <div
                        ref={lastElementRef}
                        className="flex items-center w-full mb-2"
                        key={oInd}
                      >
                        <div className="w-[15%]">
                          <ArrowCircleLeftIcon
                            onClick={() =>
                              onLocalCitationChanged(opinion, false)
                            }
                            className="w-5 cursor-pointer"
                          />
                        </div>

                        <div className="relative w-[85%] bg-[#0cae74]/[.25] rounded-lg p-4 cursor-pointer">
                          <A
                            href={`/post/${opinion?.tokenID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span
                              className={classNames(
                                getIMORatingColors(
                                  Math.round(opinion?.compositeRating)
                                ),
                                'absolute top-2 right-2 w-10 h-8 flex justify-center items-center rounded-lg font-extrabold text-xl'
                              )}
                            >
                              {Math.round(opinion?.compositeRating)}
                            </span>

                            <div className="flex items-center pb-2 whitespace-nowrap">
                              <div className="relative rounded-full w-6 h-6">
                                <Image
                                  className="rounded-full"
                                  src={
                                    opinion?.minterToken?.profilePhoto ||
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

                            <div className="relative">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: urlify(postText),
                                }}
                                className="whitespace-pre-wrap break-words relative z-50 text-base text-black font-medium"
                              />

                              {/* {cutOffContent && (
                                <A
                                  href={`/post/${opinion?.tokenID}`}
                                  className="absolute bottom-0 right-0 text-blue-500 z-[60]"
                                >
                                  (More...)
                                </A>
                              )} */}
                            </div>
                          </A>
                        </div>
                      </div>
                    )
                  }

                  // If !isCitationAlreadyCited
                  return (
                    <div
                      ref={lastElementRef}
                      className="flex items-center w-full mb-2"
                      key={oInd}
                    >
                      <div className="w-[15%]">
                        <ArrowCircleLeftIcon
                          onClick={() => onLocalCitationChanged(opinion, false)}
                          className="w-5 cursor-pointer"
                        />
                      </div>

                      <div className="relative w-[70%] bg-black/[.05] rounded-lg p-4 cursor-pointer">
                        <A
                          href={`/post/${opinion?.tokenID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span
                            className={classNames(
                              getIMORatingColors(
                                Math.round(opinion?.compositeRating)
                              ),
                              'absolute top-2 right-2 w-10 h-8 flex justify-center items-center rounded-lg font-extrabold text-xl'
                            )}
                          >
                            {Math.round(opinion?.compositeRating)}
                          </span>

                          <div className="flex items-center pb-2 whitespace-nowrap">
                            <div className="relative rounded-full w-6 h-6">
                              <Image
                                className="rounded-full"
                                src={
                                  opinion?.minterToken?.profilePhoto ||
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

                          <div className="relative">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: urlify(postText),
                              }}
                              className="whitespace-pre-wrap break-words relative z-50 text-base text-black font-medium"
                            />

                            {/* {cutOffContent && (
                              <A
                                href={`/post/${opinion?.tokenID}`}
                                className="absolute bottom-0 right-0 text-blue-500 z-[60]"
                              >
                                (More...)
                              </A>
                            )} */}
                          </div>
                        </A>
                      </div>

                      <div className="w-[15%] flex justify-end">
                        <ArrowCircleRightIcon
                          onClick={() => onLocalCitationChanged(opinion, true)}
                          className="w-5 cursor-pointer"
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
