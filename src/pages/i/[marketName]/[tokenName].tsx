import classNames from 'classnames'
import array from 'lodash/array'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { IframeEmbedSkeleton } from 'pages/iframe/[marketName]/[tokenName]'
import {
  TimeXFloatYChartInLine,
  TradeInterface,
  ListingOverview,
  VerifyModal,
  CircleSpinner,
  WatchingStarButton,
  A,
  MutualTokensList,
  DefaultLayout,
  WalletModal,
} from 'components'
import {
  querySupplyRate,
  queryExchangeRate,
  investmentTokenToUnderlying,
} from 'store/compoundStore'
import { useWalletStore } from 'store/walletStore'
import {
  querySingleToken,
  queryTokenChartData,
  queryTokenLockedChartData,
  queryMarket,
} from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import {
  web3BNToFloatString,
  bigNumberTenPow18,
  HOUR_SECONDS,
  DAY_SECONDS,
  WEEK_SECONDS,
  MONTH_SECONDS,
  YEAR_SECONDS,
  useTransactionManager,
  ZERO_ADDRESS,
} from 'utils'
import { NETWORK } from 'store/networks'
import { withdrawTokenInterest } from 'actions'
import { DateTime } from 'luxon'
import { NextSeo } from 'next-seo'
import {
  DEFAULT_CANONICAL,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  getURL,
} from 'utils/seo-constants'
import { GetServerSideProps } from 'next'
import CopyCheck from '../../../assets/copy-check.svg'
import copy from 'copy-to-clipboard'
import toast from 'react-hot-toast'
import { LinkIcon } from '@heroicons/react/outline'
import ClipIcon from '../../../assets/clip.svg'
import CopyIcon from '../../../assets/copy-icon.svg'
import ModalService from 'components/modals/ModalService'

function DetailsSkeleton() {
  return (
    <>
      <div className="inline-block pr-6 animate-pulse">
        <div className="text-sm font-semibold text-brand-new-dark">
          Listed on
        </div>
        <div className="w-24 h-6 mt-2 bg-gray-400 dark:bg-gray-900 rounded"></div>
      </div>
      <div className="inline-block">
        <div className="text-sm font-semibold text-brand-new-dark">
          Listing Owner
        </div>
        <div className="w-24 h-6 mt-2 bg-gray-400 dark:bg-gray-900 rounded"></div>
      </div>
    </>
  )
}

function ChartDurationEntry({
  durationString,
  durationSeconds,
  selectedChartDuration,
  setSelectedChartDuration,
  setChartDurationSeconds,
}: {
  durationString: string
  durationSeconds: number
  selectedChartDuration: string
  setSelectedChartDuration: (d: string) => void
  setChartDurationSeconds: (s: number) => void
}) {
  return (
    <A
      onClick={() => {
        setSelectedChartDuration(durationString)
        setChartDurationSeconds(durationSeconds)
      }}
      className={classNames(
        'ml-1 mr-1 md:ml-2.5 md:mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
        selectedChartDuration === durationString
          ? 'font-semibold text-brand-gray border-brand-new-blue focus:text-brand-gray-3 focus:border-brand-gray-2'
          : 'font-medium text-brand-gray-2 border-transparent'
      )}
    >
      {durationString}
    </A>
  )
}

export default function TokenDetails({
  rawMarketName,
  rawTokenName,
}: {
  rawMarketName: string
  rawTokenName: string
}) {
  const CHART = {
    PRICE: 0,
    LOCKED: 1,
  }

  const router = useRouter()

  const embedCode = `<iframe src="https://app.ideamarket.io/iframe/${rawMarketName}/${rawTokenName}" title="Ideamarket Embed" style="width: 400px; height: 75px;"`
  const [isEmbedCopyDone, setIsEmbedCopyDone] = useState(false)
  const [isLinkCopyDone, setIsLinkCopyDone] = useState(false)
  const [permanentLink, setPermanentLink] = useState('')
  const [showEmbedSkeleton, setShowEmbedSkeleton] = useState(true)

  const web3 = useWalletStore((state) => state.web3)
  const connectedAddress = useWalletStore((state) => state.address)

  const marketSpecifics =
    getMarketSpecificsByMarketNameInURLRepresentation(rawMarketName)
  const marketName = marketSpecifics?.getMarketName()
  const tokenName =
    marketSpecifics?.getTokenNameFromURLRepresentation(rawTokenName)

  const { data: market, isLoading: isMarketLoading } = useQuery(
    [`market-${marketName}`, marketName],
    queryMarket
  )

  const {
    data: token,
    isLoading: isTokenLoading,
    refetch,
  } = useQuery(
    [`token-${marketName}-${tokenName}`, marketName, tokenName],
    querySingleToken
  )

  const [selectedChart, setSelectedChart] = useState(CHART.PRICE)
  const [selectedChartDuration, setSelectedChartDuration] = useState('1W')

  const [chartDurationSeconds, setChartDurationSeconds] = useState(WEEK_SECONDS)

  const { data: rawPriceChartData, isLoading: isRawPriceChartDataLoading } =
    useQuery(
      [
        `${token?.address}-chartdata`,
        token?.address,
        chartDurationSeconds,
        token?.latestPricePoint,
        500,
      ],
      queryTokenChartData
    )

  const { data: rawLockedChartData, isLoading: isRawLockedChartDataLoading } =
    useQuery(
      [
        `lockedChartData-${token?.address}`,
        token?.address,
        chartDurationSeconds,
      ],
      queryTokenLockedChartData
    )
  const [priceChartData, setPriceChartData] = useState([])
  const [lockedChartData, setLockedChartData] = useState([])

  const { data: compoundSupplyRate, isLoading: isCompoundSupplyRateLoading } =
    useQuery('compound-supply-rate', querySupplyRate)

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery('compound-exchange-rate', queryExchangeRate)

  const txManager = useTransactionManager()

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000)
    const chartFromTs = now - chartDurationSeconds
    let beginPrice: number
    let endPrice: number

    if (!rawPriceChartData) {
      return
    } else if (rawPriceChartData.length === 0) {
      beginPrice = token.latestPricePoint.price
      endPrice = token.latestPricePoint.price
    } else {
      beginPrice = rawPriceChartData[0].oldPrice
      endPrice = array.last(rawPriceChartData).price
    }

    const finalChartData = [[chartFromTs, beginPrice]].concat(
      rawPriceChartData.map((pricePoint) => [
        pricePoint.timestamp,
        pricePoint.price,
      ])
    )
    finalChartData.push([now, endPrice])
    setPriceChartData(finalChartData)
  }, [chartDurationSeconds, rawPriceChartData])

  useEffect(() => {
    if (!rawLockedChartData) {
      return
    }

    const now = Math.floor(Date.now() / 1000)
    const chartToTs = now + chartDurationSeconds

    const beginLocked = parseFloat(token.lockedAmount)
    const finalChartData = [[now, beginLocked]]
    let remainingLocked = beginLocked

    for (const lockedAmount of rawLockedChartData) {
      remainingLocked -= parseFloat(lockedAmount.amount)

      if (remainingLocked < 0.0) {
        // rounding error
        remainingLocked = 0.0
      }

      finalChartData.push([lockedAmount.lockedUntil, remainingLocked])
    }

    finalChartData.push([chartToTs, remainingLocked])

    setLockedChartData(finalChartData)
  }, [chartDurationSeconds, rawLockedChartData])

  useEffect(() => {
    if (token) {
      setPermanentLink(
        `https://attn.to/r/L/${parseInt(`${token.marketID}`, 16)}/${
          token.tokenID
        }`
      )
    }
  }, [token])

  const isLoading =
    isTokenLoading ||
    isMarketLoading ||
    isCompoundSupplyRateLoading ||
    isCompoundExchangeRateLoading

  async function onWithdrawClicked() {
    try {
      await txManager.executeTx(
        'Withdraw',
        withdrawTokenInterest,
        token.address
      )
      refetch()
    } catch (ex) {
      console.log(ex)
    }
  }

  const SEO = (
    <NextSeo
      title={tokenName}
      description={DEFAULT_DESCRIPTION}
      openGraph={{
        type: 'website',
        url: `${DEFAULT_CANONICAL}/i/${rawMarketName}/${rawTokenName}`,
        title: DEFAULT_TITLE,
        images: [
          {
            url: `${
              process.env.NEXT_PUBLIC_OG_IMAGE_URL
                ? process.env.NEXT_PUBLIC_OG_IMAGE_URL
                : 'https://og-image.ideamarket.io'
            }/api/${rawMarketName}/${rawTokenName}.png`,
            width: 120,
            height: 120,
            alt: 'twitter:image',
          },
        ],
      }}
    />
  )

  return (
    <>
      <NextSeo
        title={tokenName}
        description={DEFAULT_DESCRIPTION}
        openGraph={{
          type: 'website',
          url: `${DEFAULT_CANONICAL}/i/${rawMarketName}/${rawTokenName}`,
          title: DEFAULT_TITLE,
          images: [
            {
              url: `${
                process.env.NEXT_PUBLIC_OG_IMAGE_URL
                  ? process.env.NEXT_PUBLIC_OG_IMAGE_URL
                  : 'https://og-image.ideamarket.io'
              }/api/${rawMarketName}/${rawTokenName}.png`,
              width: 120,
              height: 120,
              alt: 'twitter:image',
            },
          ],
        }}
      />
      <div className="min-h-screen bg-brand-gray dark:bg-gray-900 pb-20">
        <div className="px-4 md:px-6 pt-12 md:pt-10 pb-5 text-white bg-top-mobile md:bg-top-desktop h-156.5 md:max-h-96 md:mb-10">
          <div className="mx-auto max-w-88 md:max-w-304">
            <span className="text-brand-alto font-sf-compact-medium">
              <span
                className="text-base font-medium cursor-pointer text-brand-gray text-opacity-60 hover:text-brand-gray-2"
                onClick={() => router.push('/')}
              >
                Listings
              </span>
              <span>
                <img
                  className="inline-block w-2 ml-2 mr-2"
                  src="/arrow@3x.png"
                  alt=""
                />
              </span>
              <span className="text-base font-medium text-brand-gray text-opacity-60">
                {market?.name || '..'}
              </span>
            </span>
            <div className="flex flex-wrap items-center justify-between md:flex-nowrap">
              <ListingOverview
                token={token}
                market={market}
                isLoading={isLoading}
              />
            </div>
            <div style={{ minHeight: '80px' }} className="flex flex-col">
              {isLoading ||
              isRawPriceChartDataLoading ||
              isRawLockedChartDataLoading ? (
                <div
                  className="w-full mx-auto bg-gray-400 rounded animate animate-pulse"
                  style={{
                    minHeight: '70px',
                    marginTop: '5px',
                    marginBottom: '5px',
                  }}
                ></div>
              ) : selectedChart === CHART.PRICE ? (
                <TimeXFloatYChartInLine chartData={priceChartData} />
              ) : (
                <TimeXFloatYChartInLine chartData={lockedChartData} />
              )}
            </div>
            <div className="mt-1"></div>
            <nav className="flex flex-row justify-between">
              <div>
                <A
                  onClick={() => {
                    setSelectedChart(CHART.PRICE)
                  }}
                  className={classNames(
                    'ml-1 mr-1 md:ml-2.5 md:mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                    selectedChart === CHART.PRICE
                      ? 'font-semibold text-brand-gray border-brand-new-blue focus:text-brand-gray-3 focus:border-brand-gray-2'
                      : 'font-medium text-brand-gray-2 border-transparent'
                  )}
                >
                  Price
                </A>

                <A
                  onClick={() => {
                    setSelectedChart(CHART.LOCKED)
                  }}
                  className={classNames(
                    'ml-1 mr-1 md:ml-2.5 md:mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                    selectedChart === CHART.LOCKED
                      ? 'font-semibold text-brand-gray border-brand-new-blue focus:text-brand-gray-3 focus:border-brand-gray-2'
                      : 'font-medium text-brand-gray-2 border-transparent'
                  )}
                >
                  Locked
                </A>
              </div>
              <div className="pt-0">
                <ChartDurationEntry
                  durationString="1H"
                  durationSeconds={HOUR_SECONDS}
                  selectedChartDuration={selectedChartDuration}
                  setChartDurationSeconds={setChartDurationSeconds}
                  setSelectedChartDuration={setSelectedChartDuration}
                />
                <ChartDurationEntry
                  durationString="1D"
                  durationSeconds={DAY_SECONDS}
                  selectedChartDuration={selectedChartDuration}
                  setChartDurationSeconds={setChartDurationSeconds}
                  setSelectedChartDuration={setSelectedChartDuration}
                />
                <ChartDurationEntry
                  durationString="1W"
                  durationSeconds={WEEK_SECONDS}
                  selectedChartDuration={selectedChartDuration}
                  setChartDurationSeconds={setChartDurationSeconds}
                  setSelectedChartDuration={setSelectedChartDuration}
                />
                <ChartDurationEntry
                  durationString="1M"
                  durationSeconds={MONTH_SECONDS}
                  selectedChartDuration={selectedChartDuration}
                  setChartDurationSeconds={setChartDurationSeconds}
                  setSelectedChartDuration={setSelectedChartDuration}
                />
                <ChartDurationEntry
                  durationString="1Y"
                  durationSeconds={YEAR_SECONDS}
                  selectedChartDuration={selectedChartDuration}
                  setChartDurationSeconds={setChartDurationSeconds}
                  setSelectedChartDuration={setSelectedChartDuration}
                />
              </div>
            </nav>
          </div>
        </div>

        <div className="px-2 pb-5 mx-auto mt-12 text-white transform md:mt-10 -translate-y-30 md:-translate-y-28 max-w-88 md:max-w-304">
          <div className="flex flex-col md:grid md:grid-cols-2">
            <div className="flex flex-col">
              <div className="h-full p-5 mb-5 bg-white dark:bg-gray-700 dark:border-gray-500 border rounded-md md:mr-5 border-brand-border-gray">
                <div className="flex flex-col justify-between lg:flex-row">
                  <div>
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>
                        <div className="inline-block pr-6">
                          <div className="text-sm font-semibold text-brand-new-dark dark:text-gray-400">
                            Listed on
                          </div>
                          <div className="mt-2 text-base font-semibold text-brand-new-dark dark:text-gray-300">
                            {DateTime.fromSeconds(
                              Number(token.listedAt)
                            ).toFormat('MMM dd yyyy')}
                          </div>
                        </div>
                        <div className="inline-block">
                          <div className="text-sm font-semibold text-brand-new-dark dark:text-gray-400">
                            Listing Owner
                          </div>
                          <div className="mt-2 text-base font-semibold text-brand-new-dark dark:text-gray-300">
                            {ZERO_ADDRESS === token.tokenOwner ? (
                              'None'
                            ) : (
                              <A
                                href={`https://etherscan.io/address/${token.tokenOwner}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                {`${token.tokenOwner.slice(
                                  0,
                                  8
                                )}...${token.tokenOwner.slice(-6)}`}
                              </A>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    {isLoading ? (
                      <div className="flex flex-row mt-5 space-x-2 lg:flex-col lg:mt-0 lg:space-x-0 lg:space-y-2 xl:flex-row xl:space-x-2 xl:space-y-0 animate-pulse">
                        <div className="h-12 bg-gray-400 rounded w-28"></div>
                        <div className="h-12 bg-gray-400 rounded w-28"></div>
                      </div>
                    ) : (
                      <div className="flex flex-row mt-5 space-x-2 lg:flex-col lg:mt-0 lg:space-x-0 lg:space-y-2 xl:flex-row xl:space-x-2 xl:space-y-0">
                        <WatchingStarButton token={token} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 mb-3 text-sm font-semibold md:mt-8 text-brand-gray-2 dark:text-gray-400">
                  Listing Owner Options
                </div>
                {isLoading ? (
                  <>
                    <div className="w-full mx-auto bg-gray-400 rounded animate animate-pulse">
                      <div className="invisible">
                        A<br />A
                      </div>
                    </div>
                    <div className="flex justify-center ">
                      <div className="w-20 py-1 mt-1 text-sm font-medium bg-gray-400 border-2 border-gray-400 rounded animate animate-pulse tracking-tightest-2 font-sf-compact-medium">
                        <span className="invisible">A</span>
                      </div>
                    </div>
                  </>
                ) : token.tokenOwner === ZERO_ADDRESS ? (
                  <>
                    <div className="font-medium text-brand-gray-2 dark:text-gray-400">
                      <div className="text-xs">
                        Verify ownership of this {market ? market.name : ''}{' '}
                        account to withdraw accumulated interest.
                      </div>
                    </div>
                    <div className="mt-3 mb-2 text-sm md:mb-5 text-brand-blue dark:text-blue-500">
                      {marketSpecifics.isVerificationEnabled() ? (
                        <div
                          className="font-semibold cursor-pointer hover:underline"
                          onClick={() => {
                            ModalService.open(VerifyModal, { market, token })
                          }}
                        >
                          Verify Ownership
                        </div>
                      ) : (
                        <div className="font-semibold">
                          Verification not yet enabled
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-brand-gray-2">
                      <div className="text-xs">
                        {!web3 ||
                        connectedAddress.toLowerCase() !==
                          token.tokenOwner.toLowerCase()
                          ? `The owner of this listing is ${token.tokenOwner.slice(
                              0,
                              8
                            )}...${token.tokenOwner.slice(
                              -6
                            )}. This address does not match the wallet you have connected. If you are the owner of this listing please connect the correct wallet to be able to withdraw interest.`
                          : 'Your connected wallet owns this listing.'}
                      </div>
                    </div>
                    <div className="mt-2.5 text-sm text-brand-blue dark:text-gray-200">
                      Available interest:{' '}
                      {web3BNToFloatString(
                        investmentTokenToUnderlying(
                          token.rawInvested,
                          compoundExchangeRate
                        ).sub(token.rawDaiInToken),
                        bigNumberTenPow18,
                        2
                      )}{' '}
                      DAI
                    </div>
                    <div className="flex mt-3 mb-2 text-sm md:mb-5 text-brand-blue">
                      <button
                        disabled={
                          !web3 ||
                          txManager.isPending ||
                          connectedAddress.toLowerCase() !==
                            token.tokenOwner.toLowerCase()
                        }
                        className={classNames(
                          'font-semibold text-sm text-brand-blue',
                          !web3 ||
                            connectedAddress.toLowerCase() !==
                              token.tokenOwner.toLowerCase()
                            ? 'hidden'
                            : txManager.isPending
                            ? 'cursor-default'
                            : 'cursor-pointer hover:underline'
                        )}
                        onClick={onWithdrawClicked}
                      >
                        Withdraw
                      </button>
                    </div>
                    <div
                      className={classNames(
                        'grid grid-cols-3 mt-2 text-sm text-brand-gray-2',
                        txManager.isPending ? '' : 'invisible'
                      )}
                    >
                      <div className="font-bold justify-self-center">
                        {txManager.name}
                      </div>
                      <div className="justify-self-center">
                        <A
                          className={classNames(
                            'underline',
                            txManager.hash === '' ? 'hidden' : ''
                          )}
                          href={NETWORK.getEtherscanTxUrl(txManager.hash)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {txManager.hash.slice(0, 8)}...
                          {txManager.hash.slice(-6)}
                        </A>
                      </div>
                      <div className="justify-self-center">
                        <CircleSpinner color="#0857e0" bgcolor="#f6f6f6" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <div className="w-full py-4">
                    <label
                      htmlFor="perm_link"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Permanent link
                    </label>
                    <div className="flex mt-1 rounded-md shadow-sm">
                      <div className="relative flex items-stretch flex-grow focus-within:z-10">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <LinkIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          type="text"
                          name="text"
                          id="perm_link"
                          className="block w-full pl-10 border-gray-300 rounded-none focus:ring-indigo-500 focus:border-indigo-500 rounded-l-md sm:text-sm text-brand-new-dark dark:bg-gray-500 dark:text-gray-300"
                          defaultValue={permanentLink}
                          disabled={true}
                        />
                      </div>
                      <button
                        className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium text-gray-700 dark:bg-gray-500 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        onClick={() => {
                          copy(permanentLink)
                          toast.success('Copied the listing permanent link.')
                          setIsLinkCopyDone(true)
                          setTimeout(() => {
                            setIsLinkCopyDone(false)
                          }, 2000)
                        }}
                      >
                        {isLinkCopyDone ? (
                          <CopyCheck className="text-[#0857E0] dark:text-blue-400 w-[22px] h-[22px]" />
                        ) : (
                          <ClipIcon className="w-5 h-5 dark:text-blue-400" />
                        )}

                        <span className="sr-only">Copy</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative h-24 mt-4">
                    {/* <div className="flex items-center justify-between"> */}
                    <div className="flex items-center space-x-1">
                      <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Embed
                      </p>
                      <button
                        onClick={() => {
                          copy(embedCode)
                          toast.success('Copied the embed code')
                          setIsEmbedCopyDone(true)
                          setTimeout(() => {
                            setIsEmbedCopyDone(false)
                          }, 2000)
                        }}
                      >
                        {isEmbedCopyDone ? (
                          <CopyCheck className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                        ) : (
                          <CopyIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div
                      className="-ml-2 overflow-x-auto cursor-pointer"
                      onClick={() => {
                        copy(embedCode)
                        toast.success('Copied the embed code')
                        setIsEmbedCopyDone(true)
                        setTimeout(() => {
                          setIsEmbedCopyDone(false)
                        }, 2000)
                      }}
                    >
                      {showEmbedSkeleton && (
                        <div
                          style={{
                            width: '700px',
                            transform: 'scale(0.5)',
                            transformOrigin: 'top left',
                          }}
                          className="mt-3"
                        >
                          <IframeEmbedSkeleton />
                        </div>
                      )}
                      <iframe
                        className={showEmbedSkeleton ? 'invisible' : 'visible'}
                        src={`/iframe/${rawMarketName}/${rawTokenName}`}
                        title="Ideamarket Embed"
                        id="frame"
                        style={{
                          width: '400px',
                          height: '75px',
                          pointerEvents: 'none',
                        }}
                        onLoad={() => {
                          setShowEmbedSkeleton(false)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 mb-5 bg-white dark:bg-gray-700 dark:border-gray-500 border rounded-md border-brand-border-gray">
              {isLoading ? (
                <div className="h-full p-18 md:p-0">loading</div>
              ) : web3 ? (
                <TradeInterface
                  ideaToken={token}
                  market={market}
                  onTradeSuccessful={refetch}
                  onValuesChanged={() => {}}
                  resetOn={false}
                  centerTypeSelection={false}
                  showTypeSelection={true}
                  showTradeButton={true}
                  disabled={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-18 md:p-0">
                  <button
                    onClick={() => {
                      ModalService.open(WalletModal)
                    }}
                    className="p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                  >
                    Connect Wallet to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-2 mx-auto max-w-88 md:max-w-304 -mt-30 md:-mt-28">
          <MutualTokensList tokenName={tokenName} marketName={marketName} />
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      rawMarketName: context.query.marketName,
      rawTokenName: context.query.tokenName,
    },
  }
}

TokenDetails.layoutProps = {
  Layout: DefaultLayout,
}
