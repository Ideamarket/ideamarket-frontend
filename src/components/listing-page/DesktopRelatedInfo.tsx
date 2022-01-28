type Props = {
  rawTokenName: string
  tokenName: string
  marketName: string
}

const DesktopRelatedInfo = ({ rawTokenName, tokenName, marketName }: Props) => {
  return (
    <div className="hidden md:flex pl-10">
      <div className="w-full">
        <div className="flex items-end justify-between h-16 pb-5">
          <span className="text-xl font-semibold">Latest Tweets</span>
        </div>
        <a
          className="twitter-timeline"
          href={`https://twitter.com/${rawTokenName}`}
          data-chrome="noheader nofooter"
        >
          No tweets found for {tokenName}
        </a>
      </div>
      {/* <div className="w-1/2 ml-5">
        <MutualTokensList tokenName={tokenName} marketName={marketName} />
      </div> */}
    </div>
  )
}

export default DesktopRelatedInfo
