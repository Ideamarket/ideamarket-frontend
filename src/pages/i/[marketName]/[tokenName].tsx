import classNames from 'classnames'
import array from 'lodash/array'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import BigNumber from 'bignumber.js'
import { GlobalContext } from 'pages/_app'
import {
  TimeXFloatYChartInLine,
  TimeXFloatYChart,
  WatchingStar,
  TradeInterface,
  ListingOverview,
  TokenCard,
  Footer,
  VerifyModal,
  LockedTokenTable,
  CircleSpinner,
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
  calculateCurrentPriceBN,
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
  formatNumberInt,
  useTransactionManager,
} from 'utils'
import { withdrawTokenInterest, useBalance, useOutputAmount } from 'actions'
import ArrowLeft from '../../../assets/arrow-left.svg'
import { DateTime } from 'luxon'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

function ContainerWithHeader({
  header,
  children,
  customClasses = '',
}: {
  header: JSX.Element | string
  children: JSX.Element
  customClasses?: string
}) {
  return (
    <div
      className={classNames(
        'flex flex-col overflow-hidden rounded-md bg-brand-gray',
        customClasses
      )}
    >
      <div
        className="flex items-center flex-grow-0 py-1 pl-2.5 text-sm bg-very-dark-blue text-brand-gray"
        style={{ borderBottom: '1px solid #cbd5e0' }}
      >
        {header}
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  )
}

function DetailsEntry({
  header,
  children,
  contentTitle,
}: {
  header: JSX.Element | string
  children: JSX.Element
  contentTitle?: string
}) {
  return (
    <div
      className="text-center rounded-sm"
      style={{ backgroundColor: '#fafafa', border: '1px solid #cbd5e0' }}
    >
      <div className="text-xs text-brand-gray-2">{header}</div>
      <div className="text-xl uppercase" title={contentTitle}>
        {children}
      </div>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <div className="w-12 mx-auto bg-gray-400 rounded animate animate-pulse">
      <span className="invisible">A</span>
    </div>
  )
}

function DetailsOverChartEntry({
  header,
  children,
  withBorder,
  contentTitle,
}: {
  header: JSX.Element | string
  children: JSX.Element
  withBorder: boolean
  contentTitle?: string
}) {
  return (
    <div
      className="text-center"
      style={{ borderRight: withBorder && '1px solid #cbd5e0' }}
    >
      <div className="text-xs text-brand-gray-2">{header}</div>
      <div className="text-base uppercase md:text-2xl" title={contentTitle}>
        {children}
      </div>
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
    <a
      onClick={() => {
        setSelectedChartDuration(durationString)
        setChartDurationSeconds(durationSeconds)
      }}
      className={classNames(
        'ml-2.5 mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
        selectedChartDuration === durationString
          ? 'font-semibold text-brand-gray border-brand-new-blue focus:text-brand-gray-3 focus:border-brand-gray-2'
          : 'font-medium text-brand-gray-2 border-transparent'
      )}
    >
      {durationString}
    </a>
  )
}

export default function TokenDetails() {
  const CHART = {
    PRICE: 0,
    LOCKED: 1,
  }

  const router = useRouter()

  const { setIsWalletModalOpen } = useContext(GlobalContext)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const web3 = useWalletStore((state) => state.web3)
  const connectedAddress = useWalletStore((state) => state.address)

  const rawMarketName = router.query.marketName as string
  const rawTokenName = router.query.tokenName as string
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
  const [isValueLoading, valueBN, value] = useOutputAmount(
    token,
    market,
    addresses.dai,
    balance,
    18,
    'sell'
  )

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

  // Todo: Invalid token supplied
  if (!token) {
    return <></>
  }

  const tokenPrice =
    token && market
      ? web3BNToFloatString(
          calculateCurrentPriceBN(
            token.rawSupply,
            market.rawBaseCost,
            market.rawPriceRise,
            market.rawHatchTokens
          ),
          tenPow18,
          2
        )
      : ''

  return (
    <div className="min-h-screen bg-brand-gray">
      <div className="w-screen px-6 pt-12 md:pt-10 pb-5 text-white bg-top-mobile md:bg-top-desktop h-156.5 md:max-h-96">
        <div className="mx-auto max-w-88 md:max-w-304">
          <span className="text-brand-alto font-sf-compact-medium">
            <span
              className="cursor-pointer text-base font-medium text-brand-gray text-opacity-60 hover:text-brand-gray-2"
              onClick={() => router.push('/')}
            >
              Listings
            </span>
            <span>
              <img
                className="inline-block w-2 mr-2 ml-2"
                src="/arrow@3x.png"
                alt=""
              />
            </span>
            <span className="text-base font-medium text-brand-gray text-opacity-60">
              {market?.name || '..'}
            </span>
          </span>
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
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
              <a
                onClick={() => {
                  setSelectedChart(CHART.PRICE)
                }}
                className={classNames(
                  'ml-2.5 mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                  selectedChart === CHART.PRICE
                    ? 'font-semibold text-brand-gray border-brand-new-blue focus:text-brand-gray-3 focus:border-brand-gray-2'
                    : 'font-medium text-brand-gray-2 border-transparent'
                )}
              >
                Price
              </a>

              <a
                onClick={() => {
                  setSelectedChart(CHART.LOCKED)
                }}
                className={classNames(
                  'ml-2.5 mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                  selectedChart === CHART.LOCKED
                    ? 'font-semibold text-brand-gray border-brand-new-blue focus:text-brand-gray-3 focus:border-brand-gray-2'
                    : 'font-medium text-brand-gray-2 border-transparent'
                )}
              >
                Locked
              </a>
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

      <div className="mx-auto max-w-88 md:max-w-304">
        <div className="min-h-screen pb-5 bg-white border-b border-l border-r border-gray-400 rounded-b">
          <div
            className="relative w-full p-5 mx-auto border-gray-400 bg-brand-gray"
            style={{ borderBottomWidth: '1px' }}
          >
            <div className="flex justify-center">
              <div className="w-80">
                <TokenCard
                  token={token}
                  market={market}
                  enabled={false}
                  classes={'bg-white'}
                  isLoading={isLoading}
                />
              </div>
            </div>
            <div className="absolute top-0 left-0 flex items-center">
              <ArrowLeft
                className="cursor-pointer"
                onClick={() => {
                  router.push('/')
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 mx-5 mt-5 text-black md:grid-cols-2">
            <ContainerWithHeader header="Chart" customClasses="md:col-span-2">
              <>
                <div
                  className="grid grid-cols-4 p-1 mb-1"
                  style={{
                    backgroundColor: '#fafafa',
                    borderBottom: '1px solid #cbd5e0',
                  }}
                >
                  <DetailsOverChartEntry
                    header="Price"
                    withBorder={true}
                    contentTitle={'$' + tokenPrice}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{'$' + formatNumber(tokenPrice)}</>
                    )}
                  </DetailsOverChartEntry>

                  <DetailsOverChartEntry
                    header="Deposits"
                    withBorder={true}
                    contentTitle={'$' + token.daiInToken}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : parseFloat(token.daiInToken) <= 0.0 ? (
                      <>&mdash;</>
                    ) : (
                      <>{`$${formatNumber(token.daiInToken)}`}</>
                    )}
                  </DetailsOverChartEntry>

                  <DetailsOverChartEntry
                    header="Supply"
                    withBorder={true}
                    contentTitle={'$' + token.supply}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : parseFloat(token.supply) <= 0.0 ? (
                      <>&mdash;</>
                    ) : (
                      <>{`${formatNumber(token.supply)}`}</>
                    )}
                  </DetailsOverChartEntry>

                  <DetailsOverChartEntry
                    header="Holders"
                    withBorder={false}
                    contentTitle={formatNumberInt(token.holders)}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{formatNumberInt(token.holders)}</>
                    )}
                  </DetailsOverChartEntry>
                </div>
                <div style={{ minHeight: '200px' }} className="flex flex-col">
                  {isLoading ||
                  isRawPriceChartDataLoading ||
                  isRawLockedChartDataLoading ? (
                    <div
                      className="w-full mx-auto bg-gray-400 rounded animate animate-pulse"
                      style={{
                        minHeight: '190px',
                        marginTop: '5px',
                        marginBottom: '5px',
                      }}
                    ></div>
                  ) : selectedChart === CHART.PRICE ? (
                    <TimeXFloatYChart chartData={priceChartData} />
                  ) : (
                    <TimeXFloatYChart chartData={lockedChartData} />
                  )}
                </div>
                <div
                  className="mt-1"
                  style={{ borderBottom: '1px solid #cbd5e0' }}
                ></div>
                <nav
                  className="flex flex-col md:flex-row items-begin md:justify-between py-1.5 bg-gray-50"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <div>
                    <a
                      onClick={() => {
                        setSelectedChart(CHART.PRICE)
                      }}
                      className={classNames(
                        'ml-2.5 mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                        selectedChart === CHART.PRICE
                          ? 'font-semibold text-very-dark-blue border-very-dark-blue focus:text-very-dark-blue-3 focus:border-very-dark-blue-2'
                          : 'font-medium text-brand-gray-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                      )}
                    >
                      Price
                    </a>

                    <a
                      onClick={() => {
                        setSelectedChart(CHART.LOCKED)
                      }}
                      className={classNames(
                        'ml-2.5 mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
                        selectedChart === CHART.LOCKED
                          ? 'font-semibold text-very-dark-blue border-very-dark-blue focus:text-very-dark-blue-3 focus:border-very-dark-blue-2'
                          : 'font-medium text-brand-gray-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                      )}
                    >
                      Locked
                    </a>
                  </div>
                  <div className="pt-2 md:pt-0">
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
              </>
            </ContainerWithHeader>

            <ContainerWithHeader header="Details">
              <div className="flex flex-col h-full pb-2">
                <div
                  className="grid w-full grid-cols-2 p-5 border-gray-400 md:grid-cols-3 gap-7"
                  style={{ borderBottomWidth: '1px' }}
                >
                  <DetailsEntry header="Price" contentTitle={'$' + tokenPrice}>
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{'$' + formatNumber(tokenPrice)}</>
                    )}
                  </DetailsEntry>
                  <DetailsEntry
                    header="Deposits"
                    contentTitle={'$' + token.daiInToken}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : parseFloat(token.daiInToken) <= 0.0 ? (
                      <>&mdash;</>
                    ) : (
                      <>{`$${formatNumber(token.daiInToken)}`}</>
                    )}
                  </DetailsEntry>

                  <DetailsEntry header="Supply" contentTitle={token.supply}>
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : parseFloat(token.supply) <= 0.0 ? (
                      <>&mdash;</>
                    ) : (
                      <>{`${formatNumber(token.supply)}`}</>
                    )}
                  </DetailsEntry>

                  <DetailsEntry
                    header="24H Change"
                    contentTitle={token.dayChange + '%'}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <div
                        className={
                          parseFloat(token.dayChange) >= 0.0
                            ? 'text-brand-green'
                            : 'text-brand-red'
                        }
                      >
                        {formatNumber(token.dayChange)}%
                      </div>
                    )}
                  </DetailsEntry>

                  <DetailsEntry
                    header="24H Volume"
                    contentTitle={'$' + token.dayVolume}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{`$${formatNumber(token.dayVolume)}`}</>
                    )}
                  </DetailsEntry>

                  <DetailsEntry
                    header="1YR Income"
                    contentTitle={
                      '$' +
                      (
                        parseFloat(token.daiInToken) * compoundSupplyRate
                      ).toFixed(2)
                    }
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{`$${formatNumber(
                        (
                          parseFloat(token.daiInToken) * compoundSupplyRate
                        ).toFixed(2)
                      )}`}</>
                    )}
                  </DetailsEntry>

                  <DetailsEntry header={'Listed at'}>
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>
                        {DateTime.fromSeconds(Number(token.listedAt)).toFormat(
                          'MMM dd yyyy'
                        )}
                      </>
                    )}
                  </DetailsEntry>

                  <DetailsEntry
                    header="Holders"
                    contentTitle={formatNumberInt(token.holders)}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{formatNumberInt(token.holders)}</>
                    )}
                  </DetailsEntry>

                  <DetailsEntry header="Watch">
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <div className="flex justify-center mt-1 mb-1">
                        <WatchingStar token={token} />
                      </div>
                    )}
                  </DetailsEntry>
                </div>
                <div className="flex-grow px-2 mt-5">
                  <span className="text-xl">Description</span>
                  <div className="mt-2.5 mb-5 text-sm italic">
                    No description provided by token owner.
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <div
                    className="px-2 mb-1 border-gray-400"
                    style={{ borderBottomWidth: '1px' }}
                  >
                    Token Owner Options
                  </div>
                  <div className="px-2 pb-2 text-xs">
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
                        <div className="italic">
                          The owner of this token is not yet listed. If this
                          token represents your account you can get listed as
                          owner of this token by verifying access to the
                          account. After successful verification you will be
                          able to withdraw the accumulated interest.
                        </div>
                        <div className="flex justify-center">
                          {marketSpecifics.isVerificationEnabled() ? (
                            <button
                              className="w-20 py-1 mt-2 text-sm font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
                              onClick={() => {
                                setIsVerifyModalOpen(true)
                              }}
                            >
                              Verify
                            </button>
                          ) : (
                            <div className="mt-2 font-semibold">
                              Verification not yet enabled
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="italic">
                          {!web3 ||
                          connectedAddress.toLowerCase() !==
                            token.tokenOwner.toLowerCase()
                            ? `The owner of this token is listed as ${token.tokenOwner.slice(
                                0,
                                8
                              )}...${token.tokenOwner.slice(
                                -6
                              )}. This address does not match the wallet you have connected. If you are the owner of this token please connect the correct wallet to be able to withdraw interest.`
                            : 'Your connected wallet is listed as owner of this token. You are able to withdraw the accumulated interest below.'}
                        </div>
                        <div className="italic mt-2.5">
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
                        <div className="flex justify-center">
                          <button
                            disabled={
                              !web3 ||
                              txManager.isPending ||
                              connectedAddress.toLowerCase() !==
                                token.tokenOwner.toLowerCase()
                            }
                            className={classNames(
                              'w-20 py-1 ml-5 text-sm font-medium bg-white border-2 rounded-lg  tracking-tightest-2 font-sf-compact-medium',
                              !web3 ||
                                txManager.isPending ||
                                connectedAddress.toLowerCase() !==
                                  token.tokenOwner.toLowerCase()
                                ? 'cursor-default'
                                : 'border-brand-blue text-brand-blue hover:text-white hover:bg-brand-blue'
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
                            <a
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
                            >
                              {txManager.hash.slice(0, 8)}...
                              {txManager.hash.slice(-6)}
                            </a>
                          </div>
                          <div className="justify-self-center">
                            <CircleSpinner color="#0857e0" bgcolor="#f6f6f6" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </ContainerWithHeader>

            <ContainerWithHeader header="Trade">
              {isLoading ? (
                <div
                  className="w-full mx-auto bg-gray-400 rounded animate animate-pulse"
                  style={{
                    minHeight: '518px',
                    marginTop: '5px',
                    marginBottom: '5px',
                  }}
                ></div>
              ) : web3 ? (
                <TradeInterface
                  ideaToken={token}
                  market={market}
                  onTradeSuccessful={() => {}}
                  onValuesChanged={() => {}}
                  resetOn={false}
                  showTypeSelection={true}
                  showTradeButton={true}
                  disabled={false}
                  bgcolor="#f6f6f6"
                />
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{
                    minHeight: '518px',
                  }}
                >
                  <button
                    onClick={() => {
                      setIsWalletModalOpen(true)
                    }}
                    className="p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                  >
                    Connect Wallet to Trade
                  </button>
                </div>
              )}
            </ContainerWithHeader>

            <ContainerWithHeader header="My Wallet">
              <div
                style={{
                  minHeight: '518px',
                }}
              >
                {isLoading ? (
                  <div>loading</div>
                ) : web3 ? (
                  <div>
                    <div
                      className="px-2 mt-2.5 border-gray-400 text-sm text-brand-gray-2"
                      style={{ borderBottomWidth: '1px' }}
                    >
                      Balance
                    </div>
                    <div className="px-2 mt-5 text-2xl text-center text-medium">
                      {!isBalanceLoading && formatNumber(balance)} tokens ={' '}
                      {!isValueLoading && formatNumber(value)} USD
                    </div>

                    <div
                      className="px-2 mt-5 text-sm border-gray-400 text-brand-gray-2"
                      style={{ borderBottomWidth: '1px' }}
                    >
                      Locked
                    </div>
                    <LockedTokenTable token={token} owner={connectedAddress} />
                    <div className="flex justify-end mt-4">
                      <button className="px-1 py-1 ml-5 mr-2 text-sm font-medium bg-white border-2 rounded-lg cursor-default tracking-tightest-2 font-sf-compact-medium text-brand-gray-2">
                        Withdraw unlocked
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      minHeight: '518px',
                    }}
                  >
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
            </ContainerWithHeader>
          </div>
        </div>
        <div className="px-1">
          <Footer />
        </div>
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
  )
}
