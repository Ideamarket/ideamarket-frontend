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
  const [relatedOrWiki, setRelatedOrWiki] = useState('wiki')

  return (
    <>
      <div className="flex justify-between mb-12 md:hidden">
        <button
          onClick={() => setRelatedOrWiki('related')}
          className={classNames(
            relatedOrWiki === 'related' && 'bg-gray-200',
            'px-6 py-3 text-lg font-semibold text-black border border-gray-400 rounded-lg w-36'
          )}
        >
          Related
        </button>
        <button
          onClick={() => setRelatedOrWiki('wiki')}
          className={classNames(
            relatedOrWiki === 'wiki' && 'bg-gray-200',
            'px-6 py-3 text-lg font-semibold text-black border border-gray-400 rounded-lg w-36'
          )}
        >
          Wiki Page
        </button>
      </div>
      <div className="flex md:hidden">
        <div
          className={classNames(
            relatedOrWiki === 'wiki' ? 'visible' : 'hidden',
            'w-full'
          )}
        >
          <div className="pb-5 mb-12 border-b border-gray-200">
            <h3 className="text-2xl font-medium leading-6">Wiki Page</h3>
          </div>
          {wikiSnapshot?.type === 'wikipedia' && (
            <iframe
              id="wiki-iframe"
              src={wikiSnapshot.url}
              key="wiki-iframe-mobile"
              title="wiki-iframe-mobile"
              className="w-full"
            />
          )}

          {wikiSnapshot?.type === 'local' && (
            <iframe
              id="wiki-iframe"
              src={`${wikiSnapshot.url}#toolbar=0&navpanes=0&scrollbar=0`}
              // type="application/pdf"
              title="wiki-iframe-mobile"
              className="w-full"
            />
          )}
        </div>
        <div
          className={classNames(
            relatedOrWiki === 'related' ? 'visible' : 'hidden',
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
