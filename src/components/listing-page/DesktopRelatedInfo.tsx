import { MutualTokensList } from 'components'

type Props = {
  rawTokenName: string
  tokenName: string
  marketName: string
}

const DesktopRelatedInfo = ({ rawTokenName, tokenName, marketName }: Props) => {
  return (
    <div className="hidden md:flex">
      <div className="w-1/2 mr-5">
        <div className="h-20 pb-5 mb-12 border-b border-gray-200 flex items-end justify-between">
          <h3 className="text-2xl font-medium leading-6">Latest tweets</h3>
        </div>
        <a
          className="twitter-timeline"
          href={`https://twitter.com/${rawTokenName}`}
        >
          No tweets found for {tokenName}
        </a>
      </div>
      <div className="w-1/2 ml-5">
        <MutualTokensList tokenName={tokenName} marketName={marketName} />
      </div>
    </div>
  )
}

export default DesktopRelatedInfo
