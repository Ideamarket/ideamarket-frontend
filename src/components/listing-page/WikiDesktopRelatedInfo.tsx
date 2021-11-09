import { MutualTokensList } from 'components'

type Props = {
  rawTokenName: string
  tokenName: string
  marketName: string
  wikiSnapshot: any
}

const WikiDesktopRelatedInfo = ({
  wikiSnapshot,
  tokenName,
  marketName,
}: Props) => {
  return (
    <div className="hidden md:flex">
      <div className="w-1/2 mr-5">
        <div className="flex items-end justify-between h-20 pb-5 mb-12 border-b border-gray-200">
          <h3 className="text-2xl font-medium leading-6">Wiki Page</h3>
        </div>
        {wikiSnapshot?.type === 'wikipedia' && (
          <div
            dangerouslySetInnerHTML={{
              __html: `<iframe id='wiki-iframe' src='${wikiSnapshot.url}' />`,
            }}
          />
        )}

        {wikiSnapshot?.type === 'local' && (
          <embed
            id="wiki-iframe"
            src={wikiSnapshot.url}
            type="application/pdf"
          />
        )}
      </div>
      <div className="w-1/2 ml-5">
        <MutualTokensList tokenName={tokenName} marketName={marketName} />
      </div>
    </div>
  )
}

export default WikiDesktopRelatedInfo
