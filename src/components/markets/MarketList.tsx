import classNames from 'classnames'
import useBreakpoint from 'use-breakpoint'
import { IMarketSpecifics } from 'store/markets'
import { BREAKPOINTS } from 'utils/constants'

type MarketButtonProps = {
  marketName: string
  isSelected: boolean
  onClick: (market: string) => void
}

const DisabledMarketButton = ({ marketName }: { marketName: string }) => (
  <button
    className="p-1 px-3 text-sm border rounded-md opacity-50 cursor-not-allowed text-brand-gray-4"
    disabled={true}
  >
    {marketName}
  </button>
)

const MarketButton = ({
  marketName,
  isSelected,
  onClick,
}: MarketButtonProps) => (
  <button
    className={classNames(
      'p-1 border rounded-md px-3 text-sm',
      {
        'bg-very-dark-blue text-white': isSelected,
      },
      { 'text-brand-gray-4': !isSelected }
    )}
    onClick={() => {
      onClick(marketName)
    }}
  >
    {marketName}
  </button>
)

type MarketListProps = {
  selectedMarkets: Set<string>
  markets: IMarketSpecifics[]
  onMarketChanged: (set: Set<string>) => void
}

const upcomingMarkets = ['YouTube', 'Gumroad', 'Clubhouse', 'Roam', 'Websites']

export const MarketList = ({
  selectedMarkets,
  markets,
  onMarketChanged,
}: MarketListProps) => {
  const { breakpoint, maxWidth, minWidth } = useBreakpoint(
    BREAKPOINTS,
    'mobile'
  )

  const maxUpcomingMarkets = () => {
    switch (breakpoint) {
      case 'mobile':
      case 'sm':
        return 1
      case 'md':
        return 1
      case 'lg':
        return 2
      case 'xl':
        return 3
      case '2xl':
        return 4
      default:
        return 1
    }
  }

  const toggleMarket = (marketName: string) => {
    const newSet = new Set(selectedMarkets)
    if (newSet.has(marketName)) {
      newSet.delete(marketName)
    } else {
      newSet.add(marketName)
    }

    onMarketChanged(newSet)
  }
  const toggleAll = () => {
    onMarketChanged(new Set())
  }

  return (
    <div className="grid justify-center flex-1 grid-cols-2 md:grid-cols-none md:auto-cols-min md:grid-flow-col p-4 bg-white rounded-t-lg gap-x-2 gap-y-2 md:rounded-tr-none md:justify-start">
      <MarketButton
        key="all"
        marketName="All"
        onClick={toggleAll}
        isSelected={selectedMarkets.size === 0}
      />
      {markets
        .filter((market) => market.isEnabled())
        .map((market) => (
          <MarketButton
            key={market.getMarketName()}
            marketName={market.getMarketName()}
            onClick={toggleMarket}
            isSelected={selectedMarkets.has(market.getMarketName())}
          />
        ))}
      {markets
        .filter((market) => !market.isEnabled())
        .map((market) => (
          <DisabledMarketButton
            key={market.getMarketName()}
            marketName={market.getMarketName()}
          />
        ))}
      {upcomingMarkets.slice(0, maxUpcomingMarkets()).map((market, index) => (
        <DisabledMarketButton key={market} marketName={market} />
      ))}
      <DisabledMarketButton marketName="More(279)" />
    </div>
  )
}
