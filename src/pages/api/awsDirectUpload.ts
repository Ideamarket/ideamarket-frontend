import { NextApiRequest, NextApiResponse } from 'next'
import aws from 'aws-sdk'
import {
  ApiResponseData,
  createHandlers,
  Handlers,
} from 'lib/utils/createHandlers'
import { getSession } from 'next-auth/client'

/**
 * POST: Returns the preSignedPost with all the form fields
 *       and target URL for direct POST uploading in AWS.
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }

      aws.config.update({
        accessKeyId: process.env.IM_AWS_ACCESS_KEY,
        secretAccessKey: process.env.IM_AWS_SECRET_KEY,
        region: process.env.NEXT_PUBLIC_IM_AWS_REGION,
        signatureVersion: 'v4',
      })

      const { fileName, fileType } = req.body
      const s3 = new aws.S3()
      const preSignedPost = await s3.createPresignedPost({
        Bucket: process.env.NEXT_PUBLIC_IM_AWS_S3_BUCKET_NAME,
        Fields: {
          key: fileName,
          'Content-Type': fileType,
          ACL: 'public-read',
        },
        Expires: 60,
        Conditions: [
          ['content-length-range', 0, 2097152], // up to 2 MB
        ],
      })

      res.status(200).json({ data: preSignedPost, message: 'Success!!' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function media(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
