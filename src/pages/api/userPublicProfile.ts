import { UserPublicProfile } from './../../types/customTypes'
import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { fetchUserProfile } from 'lib/models/userModel'

/**
 * GET : Fetches the public profile of the user
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const username = req.query.username
      const userProfile = await fetchUserProfile(username)
      if (!userProfile) {
        return res.status(404).json({ message: 'User profile not found' })
      }

      const userPublicProfile: UserPublicProfile = {}
      userPublicProfile.username = userProfile.username

      if (userProfile.imagesFolder && userProfile.profilePhotoFileName) {
        const profilePhoto = `${process.env.NEXT_PUBLIC_USER_ACCOUNTS_CLOUDFRONT_DOMAIN}/${userProfile.imagesFolder}/${userProfile.profilePhotoFileName}`
        userPublicProfile.profilePhoto = profilePhoto
      }

      const userVisibilityOptions = userProfile.visibilityOptions
      if (userVisibilityOptions?.email) {
        userPublicProfile.email = userProfile.email
      }

      if (userVisibilityOptions?.bio) {
        userPublicProfile.bio = userProfile.bio
      }

      if (userVisibilityOptions?.ethAddresses) {
        const verifiedAddresses = userProfile.ethAddresses?.filter(
          (ethAddress) => ethAddress.verified
        )
        userPublicProfile.ethAddresses = verifiedAddresses
      }

      res.status(200).json({
        message: 'Successfully fetched public profile of the user',
        data: userPublicProfile,
      })
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
