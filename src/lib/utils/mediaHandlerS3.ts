import { ApiResponseData } from './createHandlers'
import { postData } from './fetch'

/**
 * This method uploads file onto AWS S3 and returns the uploaded file name
 * 1. Call `/api/awsDirectUpload` api to get the preSignedPost for direct POST upload
 * 2. Uploads the file into AWS S3 using abobe preSignedPost
 */
export async function uploadFileToS3({
  file,
  fileNameWithoutExt,
  imagesFolder,
}: {
  file: File
  fileNameWithoutExt: string
  imagesFolder: string
}) {
  const randomNumber = Math.floor(100000 + Math.random() * 900000)
  const fileType = encodeURIComponent(file.type)
  const ext = fileType.split('%2F')[1]
  const fileName = `${fileNameWithoutExt}_${randomNumber}.${ext}`

  const {
    data: { url: directPostUploadUrl, fields },
  } = await postData<ApiResponseData>({
    url: '/api/awsDirectUpload',
    data: {
      fileName: `${imagesFolder}/${fileName}`,
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
    return fileName
  }
  return null
}
