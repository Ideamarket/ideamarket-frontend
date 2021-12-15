import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { findValidPageTitle } from 'lib/utils/wikipedia/validPageTitleUtil'
import { DAY_SECONDS } from 'utils'
import {
  fetchWikipediaData,
  upsertWikipediaData,
} from 'lib/models/wikipediaModel'

// Environment variables
const cacheValidity =
  process.env.WIKIPEDIA_VALID_PAGE_CACHE_VALIDITY ?? 30 * DAY_SECONDS

/**
 * GET : Returns the valid and exact wikipedia page title
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const title = req.query.title as string

      // Fetch wikipedia data from faunadb
      const wikipediaPage = await fetchWikipediaData(title)
      let pageTitle = wikipediaPage?.pageTitle ?? null

      if (!pageTitle) {
        const validPageTitle = await findValidPageTitle(title)
        if (validPageTitle) {
          pageTitle = validPageTitle
          await upsertWikipediaData({ wikipediaData: { pageTitle } })
        }
      }

      if (!pageTitle) {
        return res.status(404).json({
          message: 'No valid wikipedia page found',
          data: { validPageTitle: null },
        })
      }

      res.setHeader(
        'Cache-Control',
        `s-maxage=${cacheValidity}, stale-while-revalidate`
      )
      res.status(200).json({
        message: 'Success',
        data: { validPageTitle: pageTitle },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function validPageTitle(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
