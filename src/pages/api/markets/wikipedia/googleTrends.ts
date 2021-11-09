import googleTrendsApi from 'google-trends-api'
import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { DAY_SECONDS } from 'utils'
import { GoogleTrends } from 'types/wikipedia'

// Cache Validity
const cacheValidity =
  process.env.WIKIPEDIA_GOOGLE_TRENDS_CACHE_VALIDITY ?? DAY_SECONDS

/**
 * GET : Returns the data from google-trends-api
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const keyword = req.query.keyword as string
      const results = await googleTrendsApi.interestOverTime({ keyword })
      const trends: GoogleTrends[] = JSON.parse(
        results
      )?.default?.timelineData?.map((result: any) => {
        const date = new Date(0)
        date.setUTCSeconds(result.time)
        return {
          date: date.toISOString().split('T')[0],
          count: result.value[0],
        } as GoogleTrends
      })

      res.setHeader(
        'Cache-Control',
        `s-maxage=${cacheValidity}, stale-while-revalidate`
      )
      res.status(200).json({
        message: 'Successfully fetched google trends data',
        data: { trends },
      })
    } catch (error) {
      console.error(
        'Error occurred while fetching data from google-trends-api',
        error
      )
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function googleTrends(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
