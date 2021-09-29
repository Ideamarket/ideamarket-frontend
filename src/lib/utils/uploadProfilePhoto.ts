import { postData } from './fetch'
import { ApiResponseData } from './createHandlers'
import { getSession } from 'next-auth/client'
import { v4 as uuidv4 } from 'uuid'
import { uploadFileToS3 } from './mediaHandlerS3'

/**
 * This method uploads profile photo onto AWS S3 and updates the profile photo in DB
 */
export async function uploadAndUpdateProfilePhoto(file) {
  const session = await getSession()
  if (!session) {
    console.error('Unauthorized')
    return
  }

  let imagesFolder = session.user.imagesFolder
  if (!imagesFolder) {
    imagesFolder = uuidv4()
  }

  const uploadedFileName = await uploadFileToS3({
    file,
    fileNameWithoutExt: 'profile_photo',
    imagesFolder,
  })

  if (!uploadedFileName) {
    console.error('Profile photo upload failed')
    return
  }
  await updateProfilePhoto({ imagesFolder, fileName: uploadedFileName })
}

/**
 * This method will call `/api/profilePhoto` api to update profile photo in DB
 */
async function updateProfilePhoto({
  imagesFolder,
  fileName,
}: {
  imagesFolder: string
  fileName: string
}) {
  return await postData<Partial<ApiResponseData>>({
    url: '/api/profilePhoto',
    data: {
      imagesFolder,
      profilePhotoFileName: fileName,
    },
  })
}
