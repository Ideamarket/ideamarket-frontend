import { useEffect, useState } from 'react'

export default function useTokenIconURLs({
  tokenIconData,
  isTokenDataLoading,
}: {
  tokenIconData: Array<any>
  isTokenDataLoading: boolean
}) {
  const [tokenIconURLs, setTokenIconURLs] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function run() {
      setIsLoading(true)
      const urls = {}

      for (const token of tokenIconData) {
        if (token.tokenName && token.marketSpecifics) {
          const url = await token.marketSpecifics.getTokenIconURL(
            token.tokenName
          )
          if (!isCancelled) {
            urls[token.tokenName] = url
          }
        }
      }

      setTokenIconURLs(urls)
      setIsLoading(false)
    }

    run()

    return () => {
      isCancelled = true
    }
  }, [isTokenDataLoading])

  return [tokenIconURLs, isLoading]
}
