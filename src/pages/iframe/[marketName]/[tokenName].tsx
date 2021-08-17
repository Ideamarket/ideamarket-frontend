import { ArrowCircleUpIcon } from '@heroicons/react/solid'
import { useTokenIconURL } from 'actions'
import { A } from 'components'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { querySingleToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import { formatNumber } from 'utils'

export function IframeEmbedSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="flex items-center w-[663px] bg-white rounded-2xl p-5 animate-pulse shadow-embed">
        <div className="p-3">
          <div className="block bg-gray-400 rounded-full w-9 h-9" />
        </div>
        <div className="flex items-center ml-2">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <div className="w-full h-full bg-gray-400 animate-pulse" />
          </div>
          <p className="w-24 h-6 ml-4 bg-gray-400 rounded-md"></p>
        </div>

        <div className="ml-auto flex items-center h-full w-[200px] bg-brand-gray-white rounded-md border border-brand-border-gray-2">
          <div className="flex items-center justify-center flex-1 h-full"></div>
          <div className="flex-1 h-full overflow-hidden rounded-md">
            <div className="w-full h-full px-4 bg-brand-new-blue"></div>
          </div>
        </div>

        <div className="ml-4">
          <p className="w-16 h-4 bg-gray-400 rounded"></p>
        </div>
      </div>
    </div>
  )
}

export default function IframeEmbed() {
  const router = useRouter()
  const rawMarketName = router.query.marketName as string
  const rawTokenName = router.query.tokenName as string

  const marketSpecifics =
    getMarketSpecificsByMarketNameInURLRepresentation(rawMarketName)

  const marketName = marketSpecifics?.getMarketName()
  const tokenName =
    marketSpecifics?.getTokenNameFromURLRepresentation(rawTokenName)

  const { tokenIconURL, isLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName,
  })

  const { data: token, isLoading: isTokenLoading } = useQuery(
    [`token-${marketName}-${tokenName}`, marketName, tokenName],
    querySingleToken
  )

  useEffect(() => {
    const sheet = document.createElement('style')
    sheet.innerHTML = `body #torusIframe {}`
    document.body.appendChild(sheet)
  }, [])

  if (!router.isReady || isTokenLoading || !token) {
    return null
  }

  return (
    <div className="w-full h-full p-2">
      <div className="flex items-center w-full h-full p-2 shadow-embed rounded-2xl">
        <div className="flex-grow-0 w-8 h-8 relative">
          <Image
            src="/logo-32x32.png"
            alt="Ideamarket Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>

        <div className="flex-grow-0 ml-2">
          {isLoading ? (
            <div className="w-8 h-8 bg-gray-400 animate-pulse" />
          ) : (
            <div className="w-8 h-8 relative">
              <Image
                src={tokenIconURL || '/gray.svg'}
                alt={rawTokenName}
                className="rounded-full"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
        </div>

        <div className="flex-grow-0 ml-2 font-medium text-brand-new-dark dark:text-gray-300">
          {tokenName}
        </div>

        <div className="flex-grow">{/* free space */}</div>

        <div className="flex-grow-0 font-medium text-brand-new-dark bg-brand-gray-white w-[68px] h-full rounded-md flex items-center justify-center">
          ${formatNumber(token.latestPricePoint.price)}
        </div>

        <div className="-ml-2 flex-grow-0 flex items-center justify-center w-[68px] h-full font-medium text-white bg-brand-new-blue rounded-md">
          <A
            className="flex items-center justify-center"
            href={`https://app.ideamarket.io/i/${rawMarketName}/${rawTokenName}`}
          >
            <ArrowCircleUpIcon className="w-5 h-5 mr-1 text-[#a5bbfb]" />
            Buy
          </A>
        </div>

        <div className="flex-grow-0 ml-2">
          <A
            className="font-medium underline cursor-pointer text-brand-gray-white-2"
            href="https://ideamarket.io"
            style={{ fontSize: '10px' }}
          >
            What's this?
          </A>
        </div>
      </div>
    </div>
  )
}
