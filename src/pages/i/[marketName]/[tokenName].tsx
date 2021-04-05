import classNames from 'classnames'
import array from 'lodash/array'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import BigNumber from 'bignumber.js'
import { GlobalContext } from 'pages/_app'
import {
  TimeXFloatYChartInLine,
  TradeInterface,
  ListingOverview,
  VerifyModal,
  CircleSpinner,
  WatchingStarButton,
  AddToMetamaskButton,
  LockedTokenRowsTable,
  A,
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
  addresses,
  NETWORK,
  HOUR_SECONDS,
  DAY_SECONDS,
  WEEK_SECONDS,
  MONTH_SECONDS,
  YEAR_SECONDS,
  formatNumber,
  calculateIdeaTokenDaiValue,
  useTransactionManager,
} from 'utils'
import { withdrawTokenInterest, useBalance, useOutputAmount } from 'actions'
import { DateTime } from 'luxon'
import { NextSeo } from 'next-seo'
import { getURL } from 'utils/seo-constants'
import { GetServerSideProps } from 'next'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

function DetailsSkeleton() {
  return (
    <div className="w-12 mx-auto bg-gray-400 rounded animate animate-pulse">
      <span className="invisible">A</span>
    </div>
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

  const { setIsWalletModalOpen } = useContext(GlobalContext)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const web3 = useWalletStore((state) => state.web3)
  const connectedAddress = useWalletStore((state) => state.address)

  const marketSpecifics = getMarketSpecificsByMarketNameInURLRepresentation(
    rawMarketName
  )
  const marketName = marketSpecifics?.getMarketName()
  const tokenName = marketSpecifics?.getTokenNameFromURLRepresentation(
    rawTokenName
  )

  const { data: market, isLoading: isMarketLoading } = useQuery(
    [`market-${marketName}`, marketName],
    queryMarket
  )

  const { data: token, isLoading: isTokenLoading } = useQuery(
    [`token-${marketName}-${tokenName}`, marketName, tokenName],
    querySingleToken
  )

  const [isBalanceLoading, balanceBN, balance] = useBalance(token?.address, 18)

  const isValueLoading = false
  const valueBN = calculateIdeaTokenDaiValue(token, market, balanceBN)
  const value = web3BNToFloatString(valueBN, bigNumberTenPow18, 18)

  /*
  const [isValueLoading, valueBN, value] = useOutputAmount(
    token,
    market,
    addresses.dai,
    balance,
    18,
    'sell'
  )
*/
  const [selectedChart, setSelectedChart] = useState(CHART.PRICE)
  const [selectedChartDuration, setSelectedChartDuration] = useState('1W')

  const [chartDurationSeconds, setChartDurationSeconds] = useState(WEEK_SECONDS)

  const {
    data: rawPriceChartData,
    isLoading: isRawPriceChartDataLoading,
  } = useQuery(
    [
      `${token?.address}-chartdata`,
      token?.address,
      chartDurationSeconds,
      token?.latestPricePoint,
      500,
    ],
    queryTokenChartData
  )

  const {
    data: rawLockedChartData,
    isLoading: isRawLockedChartDataLoading,
  } = useQuery(
    [`lockedChartData-${token?.address}`, token?.address, chartDurationSeconds],
    queryTokenLockedChartData
  )
  const [priceChartData, setPriceChartData] = useState([])
  const [lockedChartData, setLockedChartData] = useState([])

  const {
    data: compoundSupplyRate,
    isLoading: isCompoundSupplyRateLoading,
  } = useQuery('compound-supply-rate', querySupplyRate)

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
    } catch (ex) {
      console.log(ex)
    }
  }

  const SEO = () => (
    <NextSeo
      title={tokenName}
      openGraph={{
        images: [
          {
            url: `${getURL()}/api/${rawMarketName}/${rawTokenName}.png`,
          },
        ],
      }}
    />
  )

  // Todo: Invalid token supplied
  if (!token) {
    return (
      <>
        <SEO />
      </>
    )
  }

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-brand-gray">
        <div className="px-4 pt-12 pb-5 text-white h-120 md:px-6 md:pt-10 bg-top-mobile md:bg-top-desktop md:h-72 md:max-h-96">
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
            {/* <div style={{ minHeight: '80px' }} className="flex flex-col">
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
            <div className="mt-6"></div>
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
          */}
          </div>
        </div>

        <div className="px-2 pb-5 mx-auto mt-12 text-white transform md:mt-10 -translate-y-30 md:-translate-y-28 max-w-88 md:max-w-304">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-5 mb-5 bg-white border rounded-md md:mr-5 border-brand-border-gray">
              <div className="flex flex-col justify-between lg:flex-row">
                <div>
                  {isLoading ? (
                    <DetailsSkeleton />
                  ) : (
                    <>
                      <div className="inline-block pr-6">
                        <div className="text-sm font-semibold text-brand-new-dark">
                          Listed on
                        </div>
                        <div className="mt-2 text-base font-semibold text-brand-new-dark">
                          {DateTime.fromSeconds(
                            Number(token.listedAt)
                          ).toFormat('MMM dd yyyy')}
                        </div>
                      </div>
                      <div className="inline-block">
                        <div className="text-sm font-semibold text-brand-new-dark">
                          Listing Owner
                        </div>
                        <div className="mt-2 text-base font-semibold text-brand-new-dark">
                          {addresses.ZERO === token.tokenOwner ? (
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
                    <DetailsSkeleton />
                  ) : (
                    <div className="flex flex-row mt-5 space-x-2 lg:flex-col lg:mt-0 lg:space-x-0 lg:space-y-2 xl:flex-row xl:space-x-2 xl:space-y-0">
                      <AddToMetamaskButton token={token} />
                      <WatchingStarButton token={token} />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 mb-3 text-sm font-semibold md:mt-8 text-brand-gray-2">
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
              ) : token.tokenOwner === addresses.ZERO ? (
                <>
                  <div className="font-medium text-brand-gray-2">
                    <div className="text-xs">
                      Verify ownership of this {market ? market.name : ''}{' '}
                      account to withdraw accumulated interest.
                    </div>
                  </div>
                  <div className="mt-3 mb-2 text-sm md:mb-5 text-brand-blue">
                    {marketSpecifics.isVerificationEnabled() ? (
                      <div
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() => {
                          setIsVerifyModalOpen(true)
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
                  <div className="mt-2.5 text-sm text-brand-blue">
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
                        href={`https://${
                          NETWORK === 'rinkeby' || NETWORK === 'test'
                            ? 'rinkeby.'
                            : ''
                        }etherscan.io/tx/${txManager.hash}`}
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
            </div>
            <div className="flex-1 p-5 mb-5 bg-white border rounded-md border-brand-border-gray">
              {isLoading ? (
                <div className="h-full p-18 md:p-0">loading</div>
              ) : web3 ? (
                <div>
                  <div className="text-base font-semibold text-brand-new-dark">
                    My Wallet
                  </div>
                  <div className="mt-3 text-sm font-semibold text-brand-new-dark">
                    Balance
                  </div>

                  <div className="flex mt-2 text-2xl font-semibold text-center text-brand-new-dark">
                    <span className="flex-1 mr-5 text-left md:text-right">
                      {!isBalanceLoading && formatNumber(balance)} tokens
                    </span>
                    <span className="flex-1 font-normal text-left text-brand-gray-2">
                      {!isValueLoading && formatNumber(value)} USD
                    </span>
                  </div>
                  <div className="mt-3 mb-2 text-sm font-semibold text-brand-new-dark">
                    Locked
                  </div>
                  <LockedTokenRowsTable
                    token={token}
                    owner={connectedAddress}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-18 md:p-0">
                  <button
                    onClick={() => {
                      setIsWalletModalOpen(true)
                    }}
                    className="p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                  >
                    Connect Wallet to View
                  </button>
                </div>
              )}
            </div>
          </div>
          {web3 && (
            <div className="flex-1 p-5 mb-5 bg-white border rounded-md border-brand-border-gray">
              {isLoading ? (
                <div className="h-full p-18 md:p-0">loading</div>
              ) : (
                <TradeInterface
                  ideaToken={token}
                  market={market}
                  onTradeSuccessful={() => {}}
                  onValuesChanged={() => {}}
                  resetOn={false}
                  centerTypeSelection={false}
                  showTypeSelection={true}
                  showTradeButton={true}
                  disabled={false}
                  bgcolor="#ffffff"
                />
              )}
            </div>
          )}
        </div>
        {!isLoading && (
          <VerifyModal
            token={token}
            market={market}
            isOpen={isVerifyModalOpen}
            setIsOpen={setIsVerifyModalOpen}
          />
        )}
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
