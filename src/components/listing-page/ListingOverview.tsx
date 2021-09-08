import BigNumber from 'bignumber.js'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import classNames from 'classnames'
import {
  calculateCurrentPriceBN,
  formatNumber,
  formatNumberInt,
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
  ZERO_ADDRESS,
} from '../../utils'
import A from 'components/A'
import { useTokenIconURL } from 'actions'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import Image from 'next/image'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

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
  contentTitle,
  customClasses,
}: {
  header: JSX.Element | string
  children: JSX.Element
  contentTitle?: string
  customClasses?: string
}) {
  return (
    <div className={classNames('text-center p-2 pt-6 md:pt-2', customClasses)}>
      <div className="mb-1 text-base font-medium text-brand-gray text-opacity-60">
        {header}
      </div>
      <div className="text-2xl font-medium uppercase" title={contentTitle}>
        {children}
      </div>
    </div>
  )
}

export default function TokenCard({
  token,
  market,
  isLoading,
}: {
  token: IdeaToken
  market: IdeaMarket
  isLoading?: boolean
}) {
  const loading = isLoading || !(token && market)
  const marketSpecifics = isLoading
    ? undefined
    : getMarketSpecificsByMarketName(market.name)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })
  const tokenPrice = isLoading
    ? ''
    : web3BNToFloatString(
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
    <>
      <div className="flex flex-none mt-7">
        <div className="relative w-20 h-20 mr-5">
          {loading || isTokenIconLoading ? (
            <div className="bg-gray-400 rounded-full w-18 h-18 animate animate-pulse"></div>
          ) : (
            <Image
              className="rounded-full"
              src={tokenIconURL || '/gray.svg'}
              alt=""
              layout="fill"
              objectFit="contain"
            />
          )}
        </div>
        <div className="mt-1 text-2xl font-semibold text-brand-alto">
          {loading ? (
            <div className="w-64 mx-auto bg-gray-400 rounded animate animate-pulse">
              <span className="invisible">A</span>
            </div>
          ) : (
            <div className="flex">
              <span className="align-middle">
                <A
                  href={`${marketSpecifics.getTokenURL(token.name)}`}
                  className="hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {token.name}
                </A>
              </span>
              <span className="hidden md:block ml-2.5 mr-1 w-5 h-5">
                {marketSpecifics.getMarketSVGWhite()}
              </span>
              {token.tokenOwner !== ZERO_ADDRESS && (
                <span className="hidden md:block inline w-6 h-6 ml-1.5">
                  <BadgeCheckIcon className="w-6 h-6" />
                </span>
              )}
            </div>
          )}
          {loading ? (
            <div className="w-32 mx-auto bg-gray-400 rounded animate animate-pulse">
              <span className="invisible">A</span>
            </div>
          ) : (
            <div className="flex mt-1 text-sm">
              Rank {token.rank ? token.rank : '-'}
              <span className="block md:hidden ml-2.5 mr-1 w-5 h-5">
                {marketSpecifics.getMarketSVGWhite()}
              </span>
              {token.tokenOwner !== ZERO_ADDRESS && (
                <span className="block md:hidden inline w-6 h-6 ml-1.5">
                  <BadgeCheckIcon className="w-6 h-6" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-3 p-1 mb-1 md:grid-cols-6">
          <DetailsOverChartEntry header="Price" contentTitle={'$' + tokenPrice}>
            {isLoading ? (
              <DetailsSkeleton />
            ) : (
              <>{'$' + formatNumber(tokenPrice)}</>
            )}
          </DetailsOverChartEntry>

          <DetailsOverChartEntry
            header="Deposits"
            contentTitle={'$' + token.daiInToken}
          >
            {isLoading ? (
              <DetailsSkeleton />
            ) : parseFloat(token.daiInToken) <= 0.0 ? (
              <>&mdash;</>
            ) : (
              <>{`$${formatNumberWithCommasAsThousandsSerperator(
                parseInt(token.daiInToken)
              )}`}</>
            )}
          </DetailsOverChartEntry>

          <DetailsOverChartEntry
            header="Supply"
            contentTitle={'$' + token.supply}
          >
            {isLoading ? (
              <DetailsSkeleton />
            ) : parseFloat(token.supply) <= 0.0 ? (
              <>&mdash;</>
            ) : (
              <>{`${formatNumberWithCommasAsThousandsSerperator(
                parseInt(token.supply)
              )}`}</>
            )}
          </DetailsOverChartEntry>

          <DetailsOverChartEntry
            header="Holders"
            contentTitle={formatNumberInt(token.holders)}
          >
            {isLoading ? (
              <DetailsSkeleton />
            ) : (
              <>{formatNumberInt(token.holders)}</>
            )}
          </DetailsOverChartEntry>
          <DetailsOverChartEntry
            header="24H Volume"
            contentTitle={'$' + token.dayVolume}
          >
            {isLoading ? (
              <DetailsSkeleton />
            ) : (
              <>{`$${formatNumber(token.dayVolume)}`}</>
            )}
          </DetailsOverChartEntry>
          <DetailsOverChartEntry
            header="24H Change"
            customClasses="pr-0"
            contentTitle={token.dayChange + '%'}
          >
            {isLoading ? (
              <DetailsSkeleton />
            ) : (
              <div
                className={
                  parseFloat(token.dayChange) >= 0.0
                    ? 'text-brand-neon-green dark:text-green-400'
                    : 'text-brand-red dark:text-red-500'
                }
              >
                {formatNumber(token.dayChange)}%
              </div>
            )}
          </DetailsOverChartEntry>
        </div>
      </div>
    </>
  )
}
