import { WIKIPEDIA_SNAPSHOTS_FOLDER } from 'pages/api/markets/wikipedia/snapshot'
import { nonWaitingRequest } from '../httpRequestUtil'

// Constants
const WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki'
const WIKIPEDIA_SNAPSHOT_API_ENDPOINT = 'api/markets/wikipedia/snapshot'
const GENERATE_UPLOAD_PDF_API_ENDPOINT = 'api/generateAndUploadPdf'

// Env Variables
const s3Bucket = process.env.MARKETS_S3_BUCKET ?? ''
const serverHostUrl =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_URL ?? 'http://localhost:3000'
const generateAndUploadPdfApiHostUrl =
  process.env.GENERATE_UPLOAD_PDF_API_HOST_URL ?? 'http://localhost:3001'

/**
 * This function calls [POST] wikipedia snapshot API asynchronously
 */
export async function updateSnapshot(title: string) {
  await nonWaitingRequest({
    url: `${serverHostUrl}/${WIKIPEDIA_SNAPSHOT_API_ENDPOINT}?title=${encodeURIComponent(
      title
    )}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * This function calls [POST] generateAndUploadPdf API (present in ideamarket-og-image repo)
 */
export async function generateAndUploadLatestSnapshot(title: string) {
  const randomNumber = Math.floor(100000 + Math.random() * 900000)
  const folderPath = WIKIPEDIA_SNAPSHOTS_FOLDER.replace('_TITLE_', title)
  const fileName = `snapshot_${randomNumber}.pdf`

  const generateAndUploadPdfToS3ApiUrl = `${generateAndUploadPdfApiHostUrl}/${GENERATE_UPLOAD_PDF_API_ENDPOINT}`
  const response = await fetch(generateAndUploadPdfToS3ApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: `${WIKIPEDIA_URL}/${title}`,
      pdfOptions: { width: '580px' },
      s3FileKey: `${folderPath}/${fileName}`,
      s3Bucket,
    }),
  })

  if (response.status !== 200) {
    throw new Error('Snapshot upload to S3 failed')
  }
  return fileName
}
