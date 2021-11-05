import { ApiResponseData } from './createHandlers'
import { postData } from './fetch'
import AWS from 'aws-sdk'
import { Body } from 'aws-sdk/clients/s3'

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

/**
 * This function will upload an object to S3 using putObject method
 */
export async function putObjectInS3({
  object,
  s3Bucket,
  s3FolderPath,
  fileName,
  fileType,
}: {
  object: Body
  s3Bucket: string
  s3FolderPath: string
  fileName: string
  fileType: string
}) {
  try {
    updateAWSConfig()
    const s3Client = new AWS.S3()
    await s3Client
      .putObject({
        Bucket: s3Bucket,
        Key: `${s3FolderPath}/${fileName}`,
        Body: object,
        ContentType: fileType,
      })
      .promise()

    return fileName
  } catch (error) {
    console.error('Error occurred while putting object in S3', error)
  }

  return null
}

/**
 * This function will delete an object from S3 using deleteObject method
 */
export async function deleteObjectFromS3({
  s3Bucket,
  s3FolderPath,
  fileName,
}: {
  s3Bucket: string
  s3FolderPath: string
  fileName: string
}) {
  try {
    updateAWSConfig()
    const s3Client = new AWS.S3()
    await s3Client
      .deleteObject({
        Bucket: s3Bucket,
        Key: `${s3FolderPath}/${fileName}`,
      })
      .promise()
  } catch (error) {
    console.error('Error occurred while deleting object from S3', error)
  }
}

function updateAWSConfig() {
  AWS.config.update({
    accessKeyId: process.env.IM_AWS_ACCESS_KEY,
    secretAccessKey: process.env.IM_AWS_SECRET_KEY,
    region: process.env.IM_AWS_REGION,
    signatureVersion: 'v4',
  })
}
