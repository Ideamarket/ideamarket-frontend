import BigNumber from 'bignumber.js'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import classNames from 'classnames'
import {
  calculateCurrentPriceBN,
  formatNumber,
  formatNumberInt,
  web3BNToFloatString,
} from '../../utils'
import A from 'components/A'
import { useTokenIconURL } from 'actions'

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
        <div className="w-20 h-20 mr-5">
          {loading || isTokenIconLoading ? (
            <div className="bg-gray-400  rounded-full w-18 h-18 animate animate-pulse"></div>
          ) : (
            <img className="rounded-full" src={tokenIconURL} alt="" />
          )}
        </div>
        <div className="mt-1 text-2xl font-semibold text-brand-alto">
          {loading ? (
            <div className="w-64 mx-auto bg-gray-400  rounded animate animate-pulse">
              <span className="invisible">A</span>
            </div>
          ) : (
            <div>
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
              <span className="ml-2.5 mr-1">
                {marketSpecifics.getMarketSVGWhite()}
              </span>
            </div>
          )}
          {loading ? (
            <div className="w-32 mx-auto bg-gray-400 rounded animate animate-pulse">
              <span className="invisible">A</span>
            </div>
          ) : (
            <div className="mt-1 text-sm">
              Rank {token.rank ? token.rank : '-'}
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
              <>{`$${formatNumber(token.daiInToken)}`}</>
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
              <>{`${formatNumber(token.supply)}`}</>
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
