import classNames from 'classnames'

type MarketButtonProps = {
  marketName: string
  isSelected: boolean
  onClick: (market: string) => void
}

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
  markets: string[]
  onMarketChanged: (set: Set<string>) => void
}

export const MarketList = ({
  selectedMarkets,
  markets,
  onMarketChanged,
}: MarketListProps) => {
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
    <div className="grid justify-center flex-1 grid-flow-col p-4 bg-white rounded-t-lg auto-cols-min gap-x-2 md:rounded-tr-none md:justify-start">
      <MarketButton
        key="all"
        marketName="All"
        onClick={toggleAll}
        isSelected={selectedMarkets.size === 0}
      />
      {markets.map((market) => (
        <MarketButton
          key={market}
          marketName={market}
          onClick={toggleMarket}
          isSelected={selectedMarkets.has(market)}
        />
      ))}
    </div>
  )
}
