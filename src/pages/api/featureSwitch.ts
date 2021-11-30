import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { fetchFeatureSwitch } from 'lib/models/featureSwitchModel'
import { HOUR_SECONDS } from 'utils'

// Env Variables
const cacheValidity =
  process.env.FEATURE_SWITCHES_CACHE_VALIDITY ?? HOUR_SECONDS / 2

/**
 * GET : Returns whether the feature switch is enabled or disabled
 * Query Params :
 *   - feature : Feature name for which switch needs to be checked
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      let enabled = true
      const feature = req.query.feature as string

      const featureSwitch = await fetchFeatureSwitch(feature)
      if (featureSwitch) {
        enabled = featureSwitch.enabled
      }

      // Cache the response
      res.setHeader(
        'Cache-Control',
        `s-maxage=${cacheValidity}, stale-while-revalidate`
      )
      res.status(200).json({ message: 'Success', data: { feature, enabled } })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function featureSwitch(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
