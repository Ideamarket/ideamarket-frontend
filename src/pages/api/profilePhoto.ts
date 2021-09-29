import { updateUserSettings } from 'lib/models/userModel'
import { getSession } from 'next-auth/client'
import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { User } from 'next-auth'

/**
 * POST : Updates profile photo in the DB.
 *        Req Body = {imagesFolderName: string, profilePhotoFileName: string}
 *
 * DELETE : Removes profile photo from the DB
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      const userSettings: Partial<User> = {}

      const { imagesFolder, profilePhotoFileName } = req.body
      if (!imagesFolder || !profilePhotoFileName) {
        return res.status(400).json({ message: 'Bad Request' })
      }

      userSettings.imagesFolder = imagesFolder
      userSettings.profilePhotoFileName = profilePhotoFileName

      await updateUserSettings({
        userId: session.user.id,
        userSettings,
      })

      res.status(200).json({ message: 'Profile photo updated successfuly' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },

  DELETE: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const userSettings: Partial<User> = {}
      userSettings.profilePhotoFileName = null

      await updateUserSettings({
        userId: session.user.id,
        userSettings,
      })

      res.status(200).json({ message: 'Profile photo removed successfuly' })
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
