import { IdeaToken } from 'store/ideaMarketsStore'
import { formatNumberWithCommasAsThousandsSerperator } from 'utils'
import { UsersIcon } from '@heroicons/react/outline'
import A from 'components/A'
import { convertAccountName } from 'lib/utils/stringUtil'
import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import { IdeamarketPost } from 'modules/posts/services/PostService'

type Props = {
  token: any
  getColumn: (column: string) => any
  lastElementRef?: (node) => void
  onRateClicked: (idt: IdeamarketPost, urlMetaData: any) => void
  onStakeClicked: (idt: IdeaToken) => void
  refetch: () => any
}

export default function HomeUsersRow({
  token,
  getColumn,
  onRateClicked,
  onStakeClicked,
  lastElementRef,
  refetch,
}: Props) {
  const router = useRouter()

  const displayUsernameOrWallet = convertAccountName(
    token?.username || token?.walletAddress
  )
  const usernameOrWallet = token?.username || token?.walletAddress

  return (
    <div ref={lastElementRef}>
      {/* Desktop row */}
      <div className="hidden relative md:block py-6 hover:bg-black/[.02]">
        {/* Makes so entire row can be clicked to go to Post page */}
        <a
          href={`/u/${usernameOrWallet}`}
          className="absolute top-0 left-0 w-full h-full z-40"
        >
          <span className="invisible">Go to post page</span>
        </a>

        <div className="flex text-black">
          {/* Icon and Name and ListingContent */}
          <div className="w-[45%] lg:w-[55%] relative pl-6 lg:pr-10">
            <div className="relative flex items-start w-3/4 mx-auto md:w-full text-gray-900 dark:text-gray-200">
              <div className="mr-4 flex flex-col items-center space-y-2">
                <div className="relative rounded-full w-6 h-6">
                  <Image
                    className="rounded-full"
                    src={token?.profilePhoto || '/DefaultProfilePicture.png'}
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                {/* <WatchingStar token={token} /> */}
              </div>

              <div className="pr-6 w-full">
                <div className="flex items-center space-x-1 pb-2 flex-wrap">
                  <A
                    className="font-semibold hover:text-blue-600 text-base z-50"
                    href={`/u/${usernameOrWallet}`}
                  >
                    {displayUsernameOrWallet}
                  </A>
                  {token?.twitterUsername && (
                    <A
                      className="flex items-center space-x-1 z-50"
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
                        @{token?.twitterUsername}
                      </span>
                    </A>
                  )}
                </div>

                <div className="whitespace-pre-wrap break-words text-sm italic">
                  {token?.bio}
                </div>
              </div>
            </div>
          </div>

          {/* STAKED */}
          <div className="w-[18.333%] lg:w-[15%] flex items-start">
            <span className="text-base text-blue-500 font-bold">
              {formatNumberWithCommasAsThousandsSerperator(
                Math.round(token?.deposits)
              )}{' '}
              IMO
            </span>
          </div>

          {/* 7D CHANGE */}
          {/* <div className="w-[13.75%] lg:w-[11.25%]">
            <div className="text-black font-semibold">
              {formatNumberInt(token?.weekChange)}
            </div>
          </div> */}

          {/* HOLDERS */}
          <div className="w-[18.333%] lg:w-[15%] pr-2">
            <div className="flex flex-col justify-start font-medium leading-5">
              {formatNumberWithCommasAsThousandsSerperator(token?.holders)}
            </div>
          </div>

          {/* STAKE Button */}
          <div className="w-[18.333%] lg:w-[15%]">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStakeClicked(token)
                }}
                className="flex justify-center items-center w-20 h-10 text-base font-bold rounded-lg text-white bg-black/[.8] hover:bg-blue-800 z-50"
              >
                <span>Stake</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile row */}
      <div className="md:hidden">
        <div className="px-3 pt-4">
          <div className="flex items-center pb-2 whitespace-nowrap">
            {/* <div className="mr-3">
              <WatchingStar token={token} />
            </div> */}

            <div className="relative rounded-full w-6 h-6">
              <Image
                className="rounded-full"
                src={token?.profilePhoto || '/DefaultProfilePicture.png'}
                alt=""
                layout="fill"
                objectFit="cover"
              />
            </div>

            <div className="flex items-center space-x-1 flex-wrap">
              <A
                className="ml-2 font-bold text-black hover:text-blue-600"
                href={`/u/${usernameOrWallet}`}
              >
                {displayUsernameOrWallet}
              </A>
              {token?.twitterUsername && (
                <A
                  className="flex items-center space-x-1 z-50"
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
                    @{token?.twitterUsername}
                  </span>
                </A>
              )}
            </div>

            <ArrowRightIcon
              onClick={() => router.push(`/u/${usernameOrWallet}`)}
              className="ml-auto w-5 text-blue-600"
            />
          </div>

          <div className="whitespace-pre-wrap break-words text-sm italic">
            {token?.bio}
          </div>
        </div>

        <div className="flex justify-between items-center text-center px-3 py-4">
          {/* STAKED */}
          <div className="w-1/3 flex items-center">
            <span className="text-base text-blue-600 font-semibold">
              {formatNumberWithCommasAsThousandsSerperator(
                Math.round(token?.deposits)
              )}{' '}
              IMO
            </span>
          </div>

          {/* 7D CHANGE */}
          {/* <div className="w-1/4 flex items-center">
            <span className="">{token?.weekChange}%</span>
          </div> */}

          {/* HOLDERS */}
          <div className="w-1/3 flex items-center font-medium text-lg text-black">
            <UsersIcon className="w-4 mr-1" />
            {formatNumberWithCommasAsThousandsSerperator(token?.holders)}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onStakeClicked(token)
            }}
            className="w-1/3 flex justify-center items-center w-20 h-10 text-base font-bold border rounded-lg text-black bg-transparent"
          >
            <span>Stake</span>
          </button>
        </div>
      </div>
    </div>
  )
}
