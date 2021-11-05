import { WIKIPEDIA_SNAPSHOTS_FOLDER } from './../../../pages/api/markets/wikipedia/snapshot'
import { generatePdfFromWebpage } from '../generatePdf'
import { deleteObjectFromS3, putObjectInS3 } from '../mediaHandlerS3'

// Constants
const WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki'
const WIKIPEDIA_SNAPSHOT_API_ENDPOINT = '/api/markets/wikipedia/snapshot'

// Env Variables
const s3Bucket = process.env.MARKETS_S3_BUCKET ?? ''
const serverHostUrl =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_URL ?? 'http://localhost:3000'

/**
 * This function generates pdf of a wikipedia page, uploads it to S3 and
 * deletes old pdf from S3(if any)
 */
export default async function updateWikipediaSnapshot({
  title,
  currentSnapshotFileName,
}: {
  title: string
  currentSnapshotFileName: string
}) {
  // Generate latest snapshot of wikipedia page
  const pdfBuffer = await generatePdfFromWebpage(`${WIKIPEDIA_URL}/${title}`)
  const randomNumber = Math.floor(100000 + Math.random() * 900000)
  const fileName = `snapshot_${randomNumber}.pdf`
  const folderPath = WIKIPEDIA_SNAPSHOTS_FOLDER.replace('_TITLE_', title)

  // Upload snapshot to S3
  const uploadedSnapshotFileName = await putObjectInS3({
    object: pdfBuffer,
    s3Bucket,
    s3FolderPath: folderPath,
    fileName,
    fileType: 'application/pdf',
  })

  if (!uploadedSnapshotFileName) {
    throw new Error('Snapshot upload to S3 failed')
  }

  if (currentSnapshotFileName) {
    // Delete old snapshot from S3
    await deleteObjectFromS3({
      s3Bucket,
      s3FolderPath: folderPath,
      fileName: currentSnapshotFileName,
    })
  }

  return uploadedSnapshotFileName
}

/**
 * This function calls [POST] wikipedia snapshot API
 */
export function triggerUpdateLatestSnapshotApi(title: string) {
  fetch(`${serverHostUrl}${WIKIPEDIA_SNAPSHOT_API_ENDPOINT}?title=${title}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
}
