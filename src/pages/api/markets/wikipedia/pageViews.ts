import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { getWikiPageViews } from 'lib/utils/getWikiPageViews'
import {
  createWikipediaData,
  fetchWikipediaData,
} from 'lib/models/wikipediaModel'

const WIKIPEDIA_PAGE_VIEWS_DURATION = 3 // 90 days

/**
 * GET : Returns the page views of the wikipedia article for last 90 days
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const title = req.query.title as string

      // Calculate from date
      const from = new Date()
      from.setDate(from.getDate() - WIKIPEDIA_PAGE_VIEWS_DURATION)
      const fromDate = from.toISOString().split('T')[0]

      // Calculate to date
      const to = new Date()
      to.setDate(to.getDate() - 2)
      const toDate = to.toISOString().split('T')[0]
      console.log({ fromDate, toDate })

      // Get page views data from fauna db
      const wikipediaData = await fetchWikipediaData(title)
      console.log(JSON.stringify(wikipediaData, null, 2))

      if (!wikipediaData) {
        // Page views data not present in fauna db
        const pageViews = await getWikiPageViews({
          title: title as string,
          fromDate,
          toDate,
        })
        console.log({ pageViews })
        await createWikipediaData({
          wikipediaData: {
            pageTitle: title,
            pageViews: { start: fromDate, end: toDate, views: pageViews },
          },
        })

        return res
          .status(200)
          .json({ message: 'Success', data: { title, pageViews } })
      }

      res.status(200).json({
        message: 'Success',
        data: { title, pageViews: wikipediaData.pageViews.views },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function pageViews(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
