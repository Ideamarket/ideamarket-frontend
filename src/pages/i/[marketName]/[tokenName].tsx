import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import BigNumber from 'bignumber.js'
import { GlobalContext } from 'pages/_app'
import {
  PriceChart,
  WatchingStar,
  TradeInterface,
  TokenCard,
  Footer,
  VerifyModal,
} from 'components'
import { querySupplyRate, queryExchangeRate } from 'store/compoundStore'
import { useWalletStore } from 'store/walletStore'
import {
  querySingleToken,
  queryTokenChartData,
  queryMarket,
} from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import {
  calculateCurrentPriceBN,
  web3BNToFloatString,
  addresses,
  NETWORK,
  formatNumber,
} from 'utils'
import { withdrawInterest } from 'actions'
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
  setChartFromTs,
}: {
  durationString: string
  durationSeconds: number
  selectedChartDuration: string
  setSelectedChartDuration: (d: string) => void
  setChartFromTs: (s: number) => void
}) {
  return (
    <a
      onClick={() => {
        setSelectedChartDuration(durationString)
        setChartFromTs(Math.floor(Date.now() / 1000) - durationSeconds)
      }}
      className={classNames(
        'ml-2.5 mr-2.5 text-center px-1 text-sm leading-none tracking-tightest whitespace-nowrap border-b-2 focus:outline-none cursor-pointer',
        selectedChartDuration === durationString
          ? 'font-semibold text-very-dark-blue border-very-dark-blue focus:text-very-dark-blue-3 focus:border-very-dark-blue-2'
          : 'font-medium text-brand-gray-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
      )}
    >
      {durationString}
    </a>
  )
}

export default function TokenDetails() {
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

  const [selectedChartDuration, setSelectedChartDuration] = useState('1W')

  const [chartFromTs, setChartFromTs] = useState(
    Math.floor(Date.now() / 1000) - 604800
  )
  const { data: rawChartData, isLoading: isRawChartDataLoading } = useQuery(
    [`chartData-${token?.address}`, token?.address, chartFromTs],
    queryTokenChartData
  )
  const [chartData, setChartData] = useState([])

  const {
    data: compoundSupplyRate,
    isLoading: isCompoundSupplyRateLoading,
  } = useQuery('compound-supply-rate', querySupplyRate)

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery('compound-exchange-rate', queryExchangeRate)

  const [pendingTxName, setPendingTxName] = useState('')
  const [pendingTxHash, setPendingTxHash] = useState('')
  const [isTxPending, setIsTxPending] = useState(false)

  useEffect(() => {
    const currentTs = Math.floor(Date.now() / 1000)
    let beginPrice: number
    let endPrice: number

    if (!rawChartData) {
      return
    } else if (rawChartData.pricePoints.length === 0) {
      beginPrice = rawChartData.latestPricePoint.price
      endPrice = rawChartData.latestPricePoint.price
    } else {
      beginPrice = rawChartData.pricePoints[0].oldPrice
      endPrice =
        rawChartData.pricePoints[rawChartData.pricePoints.length - 1].price
    }

    const finalChartData = [[chartFromTs, beginPrice]].concat(
      rawChartData.pricePoints.map((pricePoint) => [
        pricePoint.timestamp,
        pricePoint.price,
      ])
    )
    finalChartData.push([currentTs, endPrice])
    setChartData(finalChartData)
  }, [chartFromTs, rawChartData])

  const isLoading =
    isTokenLoading ||
    isMarketLoading ||
    isCompoundSupplyRateLoading ||
    isCompoundExchangeRateLoading

  async function onWithdrawClicked() {
    setPendingTxName('Withdraw')
    setIsTxPending(true)

    try {
      await withdrawInterest(token.address).on('transactionHash', (hash) => {
        setPendingTxHash(hash)
      })
    } catch (ex) {
      console.log(ex)
      return
    } finally {
      setPendingTxName('')
      setPendingTxHash('')
      setIsTxPending(false)
    }
  }

  // Todo: Invalid token supplied
  if (!token) {
    return <></>
  }

  const tokenPrice = web3BNToFloatString(
    calculateCurrentPriceBN(
      token.rawSupply,
      market.rawBaseCost,
      market.rawPriceRise,
      market.rawHatchTokens
    ),
    tenPow18,
    2
  )

  return (
    <div className="min-h-screen bg-brand-gray">
      <div
        className="mx-auto"
        style={{
          maxWidth: '1500px',
        }}
      >
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
                    contentTitle={token.holders.toString()}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{formatNumber(token.holders)}</>
                    )}
                  </DetailsOverChartEntry>
                </div>
                <div style={{ minHeight: '200px' }} className="flex flex-col">
                  {isLoading || isRawChartDataLoading ? (
                    <div
                      className="w-full mx-auto bg-gray-400 rounded animate animate-pulse"
                      style={{
                        minHeight: '190px',
                        marginTop: '5px',
                        marginBottom: '5px',
                      }}
                    ></div>
                  ) : (
                    <PriceChart chartData={chartData} />
                  )}
                </div>
                <div
                  className="mt-1"
                  style={{ borderBottom: '1px solid #cbd5e0' }}
                ></div>
                <nav
                  className="flex justify-end py-1.5 bg-gray-50"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <ChartDurationEntry
                    durationString="1H"
                    durationSeconds={3600}
                    selectedChartDuration={selectedChartDuration}
                    setChartFromTs={setChartFromTs}
                    setSelectedChartDuration={setSelectedChartDuration}
                  />
                  <ChartDurationEntry
                    durationString="1D"
                    durationSeconds={86400}
                    selectedChartDuration={selectedChartDuration}
                    setChartFromTs={setChartFromTs}
                    setSelectedChartDuration={setSelectedChartDuration}
                  />
                  <ChartDurationEntry
                    durationString="1W"
                    durationSeconds={604800}
                    selectedChartDuration={selectedChartDuration}
                    setChartFromTs={setChartFromTs}
                    setSelectedChartDuration={setSelectedChartDuration}
                  />
                  <ChartDurationEntry
                    durationString="1M"
                    durationSeconds={2628000}
                    selectedChartDuration={selectedChartDuration}
                    setChartFromTs={setChartFromTs}
                    setSelectedChartDuration={setSelectedChartDuration}
                  />
                  <ChartDurationEntry
                    durationString="1Y"
                    durationSeconds={31536000}
                    selectedChartDuration={selectedChartDuration}
                    setChartFromTs={setChartFromTs}
                    setSelectedChartDuration={setSelectedChartDuration}
                  />
                  <ChartDurationEntry
                    durationString="ALL"
                    durationSeconds={
                      Math.floor(Date.now() / 1000) - Number(token.listedAt)
                    }
                    selectedChartDuration={selectedChartDuration}
                    setChartFromTs={setChartFromTs}
                    setSelectedChartDuration={setSelectedChartDuration}
                  />
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
                    contentTitle={token.holders.toString()}
                  >
                    {isLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>{formatNumber(token.holders)}</>
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
                    ) : token.interestWithdrawer === addresses.ZERO ? (
                      <>
                        <div className="italic">
                          The owner of this token is not yet listed. If this
                          token represents your account you can get listed as
                          owner of this token by verifying access to the
                          account. After successful verification you will be
                          able to withdraw the accumulated interest.
                        </div>
                        <div className="flex justify-center">
                          <button
                            className="w-20 py-1 mt-2 text-sm font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
                            onClick={() => {
                              setIsVerifyModalOpen(true)
                            }}
                          >
                            Verify
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="italic">
                          {!web3 ||
                          connectedAddress.toLowerCase() !==
                            token.interestWithdrawer.toLowerCase()
                            ? `The owner of this token is listed as ${token.interestWithdrawer.slice(
                                0,
                                8
                              )}...${token.interestWithdrawer.slice(
                                -6
                              )}. This address does not match the wallet you have connected. If you are the owner of this token please connect the correct wallet to be able to withdraw interest.`
                            : 'Your connected wallet is listed as owner of this token. You are able to withdraw the accumulated interest below.'}
                        </div>
                        <div className="italic mt-2.5">
                          Available interest:{' '}
                          {web3BNToFloatString(
                            token.rawInvested
                              .mul(compoundExchangeRate)
                              .sub(token.rawDaiInToken),
                            new BigNumber('10').exponentiatedBy('36'),
                            2
                          )}{' '}
                          DAI
                        </div>
                        <div className="flex justify-center">
                          <button
                            disabled={
                              !web3 ||
                              isTxPending ||
                              connectedAddress.toLowerCase() !==
                                token.interestWithdrawer.toLowerCase()
                            }
                            className={classNames(
                              'w-20 py-1 ml-5 text-sm font-medium bg-white border-2 rounded-lg  tracking-tightest-2 font-sf-compact-medium',
                              !web3 ||
                                isTxPending ||
                                connectedAddress.toLowerCase() !==
                                  token.interestWithdrawer.toLowerCase()
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
                            isTxPending ? '' : 'invisible'
                          )}
                        >
                          <div className="font-bold justify-self-center">
                            {pendingTxName}
                          </div>
                          <div className="justify-self-center">
                            <a
                              className={classNames(
                                'underline',
                                pendingTxHash === '' ? 'hidden' : ''
                              )}
                              href={`https://${
                                NETWORK === 'rinkeby' || NETWORK === 'test'
                                  ? 'rinkeby.'
                                  : ''
                              }etherscan.io/tx/${pendingTxHash}`}
                              target="_blank"
                            >
                              {pendingTxHash.slice(0, 8)}...
                              {pendingTxHash.slice(-6)}
                            </a>
                          </div>
                          <div className="justify-self-center">
                            <svg
                              viewBox="0 0 100 100"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 animate-spin"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                style={{
                                  fill: 'transparent',
                                  stroke: '#0857e0', // brand-blue
                                  strokeWidth: '10',
                                }}
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                style={{
                                  fill: 'transparent',
                                  stroke: 'white',
                                  strokeWidth: '10',
                                  strokeDasharray: '283',
                                  strokeDashoffset: '75',
                                }}
                              />
                            </svg>
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
                    Connect wallet to Trade
                  </button>
                </div>
              )}
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
