import classNames from 'classnames'
import {
  ListingOverview,
  TimeXFloatYChartInLine,
  TimeXFloatYChartInLineOld,
} from 'components'
import A from 'components/A'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import {
  queryTokenChartData,
  queryTokenLockedChartData,
} from 'store/ideaMarketsStore'
import {
  DAY_SECONDS,
  HOUR_SECONDS,
  MONTH_SECONDS,
  WEEK_SECONDS,
  YEAR_SECONDS,
} from 'utils'
import { array } from 'utils/lodash'
import ChartDurationEntry from './ChartDurationEntry'

export default function ListingStats({ isLoading, market, token }) {
  const router = useRouter()
  const CHART = {
    PRICE: 0,
    LOCKED: 1,
  }

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
  const [, setLockedChartData] = useState([])

  const now = Math.floor(Date.now() / 1000)
  const chartFromTs = now - chartDurationSeconds

  useEffect(() => {
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
  }, [
    chartDurationSeconds,
    chartFromTs,
    now,
    rawPriceChartData,
    token.latestPricePoint.price,
  ])

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
  }, [chartDurationSeconds, rawLockedChartData, token.lockedAmount])

  // const mappedlockedChartData = lockedChartData.map((item) => [
  //   item[0] - ONE_UNIX_TIME_YEAR,
  //   item[1],
  // ])

  return (
    <div className="px-4 md:px-6 pt-12 md:pt-10 pb-5 text-white bg-top-mobile md:bg-top-desktop h-156.5 md:max-h-96 md:mb-10">
      <div className="mx-auto max-w-88 md:max-w-304">
        <span className="text-brand-alto font-sf-compact-medium">
          <span
            className="text-base font-medium cursor-pointer text-brand-gray text-opacity-60 hover:text-brand-gray-2"
            onClick={() => router.push('/')}
          >
            Listings
          </span>
          <span className="inline-block w-2 ml-2 mr-2">
            <Image src="/arrow@3x.png" height={12} width={8} alt="" />
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
            <TimeXFloatYChartInLine
              chartData={priceChartData}
              chartDurationSeconds={chartDurationSeconds}
              chartFromTs={chartFromTs}
            />
          ) : (
            <TimeXFloatYChartInLineOld chartData={priceChartData} />
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

            {/* <A
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
            </A> */}
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
  )
}
