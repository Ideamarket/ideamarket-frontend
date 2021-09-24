import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { updateUserSettings } from 'lib/models/userModel'
import { addHttpsProtocol } from 'lib/utils/httpProtocol'
import { isRedirectionUrlValidOrEmpty } from 'lib/utils/isRedirectionUrlValid'
import { User } from 'next-auth'
import { verifyUsername } from 'lib/utils/verifyUsername'

/**
 * POST: Validates and update the user settings in DB
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const userSettings: Partial<User> = {}
      const { username, redirectionUrl, bio, ethAddresses, visibilityOptions } =
        req.body

      const usernameVerification = await verifyUsername({
        inputUsername: username,
        sessionUsername: session.user.username,
      })
      if (usernameVerification.error) {
        return res.status(400).json({ message: usernameVerification.error })
      }
      userSettings.username = usernameVerification.verifiedUsername

      if (!isRedirectionUrlValidOrEmpty(redirectionUrl)) {
        return res.status(400).json({ message: 'Redirection URL is not valid' })
      }
      userSettings.redirectionUrl = addHttpsProtocol(redirectionUrl)

      userSettings.bio = bio
      userSettings.ethAddresses = ethAddresses
      userSettings.visibilityOptions = visibilityOptions

      await updateUserSettings({
        userId: session.user.id,
        userSettings,
      })

      res.status(200).json({ message: 'Successfully updated user settings' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function userSettings(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
