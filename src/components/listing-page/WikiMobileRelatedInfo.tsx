import classNames from 'classnames'
import { MutualTokensList } from 'components'
import { useState } from 'react'

type Props = {
  tokenName: string
  marketName: string
  wikiSnapshot: any
}

const WikiMobileRelatedInfo = ({
  tokenName,
  marketName,
  wikiSnapshot,
}: Props) => {
  const [relatedOrTweets, setRelatedOrTweets] = useState('related')

  return (
    <>
      <div className="flex justify-between mb-12 md:hidden">
        <button
          onClick={() => setRelatedOrTweets('related')}
          className={classNames(
            relatedOrTweets === 'related' && 'bg-gray-200',
            'px-6 py-3 text-lg font-semibold text-black border border-gray-400 rounded-lg w-36'
          )}
        >
          Related
        </button>
        <button
          onClick={() => setRelatedOrTweets('tweets')}
          className={classNames(
            relatedOrTweets === 'tweets' && 'bg-gray-200',
            'px-6 py-3 text-lg font-semibold text-black border border-gray-400 rounded-lg w-36'
          )}
        >
          Wiki Page
        </button>
      </div>
      <div className="flex md:hidden">
        <div
          className={classNames(
            relatedOrTweets === 'tweets' ? 'visible' : 'hidden',
            'w-full'
          )}
        >
          <div className="pb-5 mb-12 border-b border-gray-200">
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
        <div
          className={classNames(
            relatedOrTweets === 'related' ? 'visible' : 'hidden',
            'w-full'
          )}
        >
          <MutualTokensList tokenName={tokenName} marketName={marketName} />
        </div>
      </div>
    </>
  )
}

export default WikiMobileRelatedInfo
