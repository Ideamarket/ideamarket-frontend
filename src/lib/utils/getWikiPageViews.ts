import { Views } from '../../types/wikipedia'

/**
 * This function will call wikipedia API to fetch page views data
 * of an article for given range of dates
 */
export async function getWikiPageViews({
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
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${title}/daily/${startDate}/${endDate}`
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

// This function will return the formatted page views data
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
