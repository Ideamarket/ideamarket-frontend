import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import {
  getPageViewsFromWikipediaApi,
  updatePageViews,
} from 'lib/utils/wikipedia/pageViewsUtil'
import {
  fetchWikipediaData,
  upsertWikipediaData,
} from 'lib/models/wikipediaModel'
import { PageViews } from 'types/wikipedia'
import { getLeastDate, getGreatestDate } from 'lib/utils/dateUtil'
import { q } from 'lib/faunaDb'
import { DAY_SECONDS, HOUR_SECONDS } from 'utils'
import { fetchValidPageTitle } from 'lib/utils/wikipedia/validPageTitleUtil'

// Constants
const WIKIPEDIA_PAGE_VIEWS_DURATION = 425 // 425 days

// Env Variables
const cacheValidity =
  process.env.WIKIPEDIA_PAGE_VIEWS_CACHE_VALIDITY ?? DAY_SECONDS
const tempCacheValidity =
  process.env.WIKIPEDIA_PAGE_VIEWS_TEMP_CACHE_VALIDITY ?? 4 * HOUR_SECONDS

/**
 * GET : Returns the page views data of a wikipedia page for last 90 days
 * Query Params :
 *   - title : Title of the wikipedia page
 * -----------------------------------------------------------------------------
 * POST : Updates the page views data of a wikipedia page in fauna db
 * Query Params :
 *   - title : Title of the wikipedia page
 * Request Body :
 *   - fromDate : Date (in ISO format) from which page views have to be updated
 *   - toDate   : Date (in ISO format) until which page views have to be updated
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const { title: initialTitle, duration } = req.query
      const title = await fetchValidPageTitle(initialTitle as string)
      const pageViewsDuration = duration
        ? Number(duration)
        : WIKIPEDIA_PAGE_VIEWS_DURATION

      // Calculate required from date of the page views
      let from = new Date()
      from.setDate(from.getDate() - pageViewsDuration)
      const requiredFromDate = from.toISOString().split('T')[0]

      // Calculate to from date of the page views
      let to = new Date()
      to.setDate(to.getDate() - 1)
      const requiredToDate = to.toISOString().split('T')[0]

      // Get page views data from fauna db
      const wikipediaData = await fetchWikipediaData(title)

      if (wikipediaData?.pageViews?.views) {
        const availableFromDate = wikipediaData.pageViews?.from ?? null
        const availableToDate = wikipediaData.pageViews?.to ?? null

        const fromDate = availableFromDate
          ? getLeastDate({ date1: availableFromDate, date2: requiredFromDate })
          : requiredFromDate
        const toDate = availableToDate
          ? getGreatestDate({ date1: availableToDate, date2: requiredToDate })
          : requiredToDate

        // Check if all the required page views are avilable in DB or not
        const requiredPageViewsAvailableInDB =
          fromDate === availableFromDate && toDate === availableToDate
        if (!requiredPageViewsAvailableInDB) {
          // Update the page views data
          await updatePageViews({ title, fromDate, toDate })
        }

        // Filter the page views as per required dates
        const filteredPageViews = wikipediaData.pageViews.views.filter(
          (views) => {
            const minDate = new Date(requiredFromDate)
            const maxDate = new Date(requiredToDate)
            const currentDate = new Date(views.date)
            return minDate <= currentDate && currentDate <= maxDate
          }
        )

        // Cache the response
        res.setHeader(
          'Cache-Control',
          `s-maxage=${
            requiredPageViewsAvailableInDB ? cacheValidity : tempCacheValidity
          }, stale-while-revalidate`
        )
        return res.status(200).json({
          message: 'Success',
          data: { title, pageViews: filteredPageViews },
        })
      }

      // Page views not present in DB, fetch page views from wikipedia API
      const pageViewsFromWikipediaApi = await getPageViewsFromWikipediaApi({
        title,
        fromDate: requiredFromDate,
        toDate: requiredToDate,
      })
      const pageViews: PageViews = {
        from: requiredFromDate,
        to: requiredToDate,
        views: pageViewsFromWikipediaApi,
        // @ts-expect-error
        lastUpdated: q.Now(),
      }
      // Update the fauna db with page views data
      await upsertWikipediaData({
        wikipediaData: { pageTitle: title, pageViews },
      })

      // Cache the response
      res.setHeader(
        'Cache-Control',
        `s-maxage=${cacheValidity}, stale-while-revalidate`
      )
      return res.status(200).json({
        message: 'Success',
        data: { title, pageViews: pageViewsFromWikipediaApi },
      })
    } catch (error) {
      console.error(
        'Error occurred while fetching wikipedia page views data - ',
        error
      )
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
  POST: async (req, res) => {
    try {
      const title = await fetchValidPageTitle(req.query.title as string)
      const { fromDate, toDate } = req.body

      let availableFromDate: string = null
      let availableToDate: string = null

      const wikipediaData = await fetchWikipediaData(title)
      if (wikipediaData?.pageViews?.views) {
        availableFromDate = wikipediaData.pageViews?.from ?? null
        availableToDate = wikipediaData.pageViews?.to ?? null
      }

      const requiredFromDate = availableFromDate
        ? getLeastDate({ date1: availableFromDate, date2: fromDate })
        : fromDate
      const requiredToDate = availableToDate
        ? getGreatestDate({ date1: availableToDate, date2: toDate })
        : toDate

      const pageViewsFromWikipediaApi = await getPageViewsFromWikipediaApi({
        title,
        fromDate: requiredFromDate,
        toDate: requiredToDate,
      })

      const pageViews: PageViews = {
        from: fromDate,
        to: toDate,
        views: pageViewsFromWikipediaApi,
        // @ts-expect-error
        lastUpdated: q.Now(),
      }

      // Update the fauna db with the latest page views data
      await upsertWikipediaData({
        wikipediaData: { pageTitle: title, pageViews },
      })

      res.status(200).json({ message: 'Successfully updated page views data' })
    } catch (error) {
      console.error(
        'Error occurred while fetching wikipedia page views data - ',
        error
      )
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
