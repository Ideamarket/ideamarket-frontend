import { postData } from './fetch'
import { ApiResponseData } from './createHandlers'
import { getSession } from 'next-auth/client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Uploads file to AWS S3
 * 1. Gets the preSignedPost for direct POST upload
 * 2. Uploads into AWS S3 with abobe preSignedPost
 */
export async function uploadFile(file) {
  const session = await getSession()
  if (!session) {
    console.error('Unauthorized')
    return ''
  }

  let uuid = session.user.uuid
  if (!uuid) {
    uuid = uuidv4()
  }

  const fileType = encodeURIComponent(file.type)
  const fileName = `profile_photo.${fileType.split('%2F')[1]}`

  const {
    data: { url: directPostUploadUrl, fields },
  } = await postData<ApiResponseData>({
    url: '/api/awsDirectUpload',
    data: {
      fileName: `${uuid}/${fileName}`,
      fileType,
    },
  })

  const formData = new FormData()
  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    formData.append(key, value as any)
  })
  const upload = await fetch(directPostUploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (upload.ok) {
    await postData({
      url: '/api/updateProfilePhoto',
      data: {
        uuid,
        profilePhotoFileName: fileName,
      },
    })
  }
}
