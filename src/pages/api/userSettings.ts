import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { isUsernameTaken, updateUserSettings } from 'lib/models/userModel'
import { addHttpsProtocol, removeHttpProtocol } from 'lib/utils/httpProtocol'
import { isUsernameValid } from 'lib/utils/isUsernameValid'
import { isRedirectionUrlValid } from 'lib/utils/isRedirectionUrlValid'

/**
 * POST: Validates and update the user settings in DB
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }
      const cloudFrontDomain = process.env.USER_ACCOUNTS_CLOUDFRONT_DOMAIN

      const {
        username: initialUsername,
        redirectionUrl: initialUrl,
        bio,
        profilePhotoFilePath,
        ethAddresses,
        visibilityOptions,
      } = req.body

      let username = (initialUsername as string)?.trim().toLowerCase()
      if (session.user.username) {
        if (session.user.username !== username) {
          res.status(400).json({ message: 'Username cannot be updated' })
          return
        }
        username = session.user.username
      } else {
        if (!isUsernameValid(username)) {
          res.status(400).json({ message: 'Username is not valid' })
          return
        }
        if (await isUsernameTaken(username)) {
          res.status(400).json({ message: 'Username is not available' })
          return
        }
      }

      let redirectionUrl = ''
      if (initialUrl && initialUrl !== '') {
        redirectionUrl = removeHttpProtocol(initialUrl as string)
        if (!isRedirectionUrlValid(redirectionUrl)) {
          res.status(400).json({ message: 'Redirection URL is not valid' })
          return
        }
        redirectionUrl = addHttpsProtocol(redirectionUrl)
      }

      let profilePhoto = ''
      if (profilePhotoFilePath && profilePhotoFilePath !== '') {
        profilePhoto = cloudFrontDomain + profilePhotoFilePath
      }

      await updateUserSettings({
        userId: session.user.id,
        userSettings: {
          username,
          bio,
          profilePhoto,
          redirectionUrl,
          ethAddresses,
          visibilityOptions,
        },
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
