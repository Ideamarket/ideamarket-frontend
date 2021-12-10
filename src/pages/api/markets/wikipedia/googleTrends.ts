import googleTrendsApi from 'google-trends-api'
import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { DAY_SECONDS } from 'utils'
import { GoogleTrends } from 'types/wikipedia'

// Constants
const WIKIPEDIA_GOOGLE_TRENDS_DURATION = 90 // 90 days

// Cache Validity
const cacheValidity =
  process.env.WIKIPEDIA_GOOGLE_TRENDS_CACHE_VALIDITY ?? DAY_SECONDS

/**
 * GET : Returns the data from google-trends-api
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const { keyword: initialKeyword, duration } = req.query
      const keyword = initialKeyword as string
      const googleTrendsDuration = duration
        ? Number(duration)
        : WIKIPEDIA_GOOGLE_TRENDS_DURATION

      // Calculate required start time for the google trends data
      let startTime = new Date()
      startTime.setDate(startTime.getDate() - googleTrendsDuration)
      startTime.setUTCHours(0, 0, 0, 0)

      // Calculate required end time for the google trends data
      let endTime = new Date()
      endTime.setDate(endTime.getDate() - 1)
      endTime.setUTCHours(23, 59, 59, 999)

      // Get google trends data from google-trends api
      const results = await googleTrendsApi.interestOverTime({
        keyword,
        startTime,
        endTime,
      })

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
