import { Views } from 'types/wikipedia'
import { nonWaitingRequest } from '../httpRequestUtil'

// Constants
const WIKIPEDIA_PAGE_VIEWS_API_ENDPOINT = 'api/markets/wikipedia/pageViews'

// Env Variables
const serverHostUrl =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_URL ?? 'http://localhost:3000'

/**
 * This function will call wikipedia API to fetch page views data
 * of a wikipedia page for the given range of dates
 * Parameters :
 *   - title    : Title of the wikipedia page
 *   - fromDate : Date (ISO format: '2021-11-06') from which page views have to be fetched
 *   - toDate   : Date (ISO format: '2021-11-06') until which page views have to be fetched
 */
export async function getPageViewsFromWikipediaApi({
  title,
  fromDate,
  toDate,
}: {
  title: string
  fromDate: string
  toDate: string
}): Promise<Views[]> {
  try {
    const startDate = `${fromDate.replace(/-/g, '')}00`
    const endDate = `${toDate.replace(/-/g, '')}00`

    const res = await fetch(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${encodeURIComponent(
        title
      )}/daily/${startDate}/${endDate}`
    )

    if (!res.ok) {
      console.error('Got error response from wikipedia API', res)
      throw new Error('Got unexpected response from wikipedia API')
    }
    return formatPageViews(await res.json())
  } catch (error) {
    console.error(
      'Error occurred while fetching page views data from wikipedia API',
      error
    )
    throw new Error(error)
  }
}

/**
 * This function will format the page views data from wikipedia API
 */
function formatPageViews(data: any): Views[] {
  return data?.items?.map((item) => {
    const dateString = item.timestamp as string
    const date = `${dateString.substr(0, 4)}-${dateString.substr(
      4,
      2
    )}-${dateString.substr(6, 2)}`
    return {
      date,
      count: item.views,
    } as Views
  })
}

/**
 * This function calls [POST] wikipedia pageViews API to update page views data
 * Parameters :
 *   - title    : Title of the wikipedia page
 *   - fromDate : From date (ISO format '2021-11-06')
 *   - toDate   : To date (ISO format '2021-11-06')
 */
export async function updatePageViews({
  title,
  fromDate,
  toDate,
}: {
  title: string
  fromDate: string
  toDate: string
}) {
  return await nonWaitingRequest({
    url: `${serverHostUrl}/${WIKIPEDIA_PAGE_VIEWS_API_ENDPOINT}?title=${title}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { fromDate, toDate },
  })
}
