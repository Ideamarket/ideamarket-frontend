import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import {
  fetchWikipediaData,
  upsertWikipediaData,
} from 'lib/models/wikipediaModel'
import { q } from 'lib/faunaDb'
import {
  generateAndUploadLatestSnapshot,
  updateSnapshot,
} from 'lib/utils/wikipedia/snapshotUtil'
import { SnapshotType, WikipediaSnapshot } from 'types/wikipedia'
import { deleteObjectFromS3 } from 'lib/utils/mediaHandlerS3'
import { DAY_SECONDS } from 'utils'

// Constants
const WIKIPEDIA_MOBILE_URL = 'https://en.m.wikipedia.org/wiki'
export const WIKIPEDIA_SNAPSHOTS_FOLDER = 'wikipedia/_TITLE_/snapshots'

// Environment variables
const s3Bucket = process.env.MARKETS_S3_BUCKET ?? ''
const marketsCloudfrontDomain = process.env.MARKETS_CLOUDFRONT_DOMAIN ?? ''
const cacheValidity =
  process.env.WIKIPEDIA_SNAPSHOT_CACHE_VALIDITY ?? DAY_SECONDS

// Snapshot Urls
const wikipediaSnapshotUrl = `${WIKIPEDIA_MOBILE_URL}/_TITLE_`
const localSnapshotUrl = `${marketsCloudfrontDomain}/${WIKIPEDIA_SNAPSHOTS_FOLDER}/_FILENAME_`

/**
 * GET : Returns the snapshot details of a wikipedia page
 *
 * POST : Updates the snapshot of a wikipedia page
 *   - Calls API to generate and upload the latest snapshot to S3
 *   - Delete the old snapshot(if present) from S3
 *   - Update fauna db with latest snapshot details
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const title = req.query.title as string

      // Fetch snapshot details from fauna db
      const wikipediaData = await fetchWikipediaData(title)

      // Check whether snapshot is present or not and whether it is expired or not
      const isSnapshotPresent = Boolean(wikipediaData?.snapshot?.fileName)
      let isSnapshotExpiredOrMissing = true
      if (wikipediaData?.snapshot?.lastUpdated) {
        const lastUpdated = wikipediaData.snapshot.lastUpdated
        const now = new Date()
        const diff = (now.getTime() - lastUpdated.getTime()) / 1000
        isSnapshotExpiredOrMissing = diff > Number(cacheValidity)
      }

      // Trigger API to update snapshot
      if (isSnapshotExpiredOrMissing) {
        await updateSnapshot(title)
      }

      // Snapshot details
      const snapshotDetails: WikipediaSnapshot = {
        title,
        type: isSnapshotPresent ? SnapshotType.LOCAL : SnapshotType.WIKIPEDIA,
        url: isSnapshotPresent
          ? localSnapshotUrl
              .replace('_TITLE_', title)
              .replace('_FILENAME_', wikipediaData.snapshot.fileName)
          : wikipediaSnapshotUrl.replace('_TITLE_', title),
      }

      // Cache the response only if snapshot is present and is not expired
      if (isSnapshotPresent && !isSnapshotExpiredOrMissing) {
        res.setHeader(
          'Cache-Control',
          `s-maxage=${cacheValidity}, stale-while-revalidate`
        )
      }
      return res.status(200).json({ message: 'Success', data: snapshotDetails })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Something went wrong!!' })
    }
  },

  POST: async (req, res) => {
    try {
      const title = req.query.title as string

      // Fetch current snapshot details from fauna db
      let wikipediaData = await fetchWikipediaData(title)

      // Block if snapshot update is already in progress
      if (wikipediaData?.snapshot?.updateInProgress) {
        return res
          .status(500)
          .json({ message: 'Snapshot update is already in progress' })
      }

      // Set the snapshot updateInProgress flag to true
      wikipediaData = await upsertWikipediaData({
        wikipediaData: {
          pageTitle: title,
          snapshot: { updateInProgress: true },
        },
      })

      // Generate latest snapshot, upload snapshot to S3, update fauna db
      let latestSnapshotFileName = null
      try {
        latestSnapshotFileName = await generateAndUploadLatestSnapshot(title)
        if (wikipediaData.snapshot?.fileName) {
          // Delete old snapshot from S3
          await deleteObjectFromS3({
            s3Bucket,
            s3FolderPath: WIKIPEDIA_SNAPSHOTS_FOLDER.replace('_TITLE_', title),
            fileName: wikipediaData.snapshot.fileName,
          })
        }
      } catch (error) {
        console.error(
          'Error occurred while generating and uploading latest snapshot in S3 - ',
          error
        )
        // Set the snapshot updateInProgress flag to false
        await upsertWikipediaData({
          wikipediaData: {
            pageTitle: title,
            snapshot: { updateInProgress: false },
          },
        })
        return res.status(500).json({ message: 'Snapshot update failed' })
      }

      // Update fauna db with latest snapshot details
      await upsertWikipediaData({
        wikipediaData: {
          pageTitle: title,
          snapshot: {
            fileName: latestSnapshotFileName,
            updateInProgress: false,
            // @ts-expect-error
            lastUpdated: q.Now(),
          },
        },
      })

      return res.status(200).json({ message: 'Successfully updated snapshot' })
    } catch (error) {
      console.error('Error occurred while updating snapshot', error)
      return res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function snapshot(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
