import { getClient, q } from 'lib/faunaDb'
import { WikipediaPage } from 'types/wikipedia'

/**
 * This method fetches the wikipedia data from the fauna db
 */
export async function fetchWikipediaData(
  pageTitle: string
): Promise<WikipediaPage | null> {
  try {
    const wikipediaRef = q.Match(q.Index('wikipedia_by_page_title'), pageTitle)
    const wikipediaData: any = await getClient().query(
      q.If(q.Exists(wikipediaRef), q.Get(wikipediaRef), null)
    )

    if (!wikipediaData) {
      return wikipediaData
    }

    const wikipediaPage: WikipediaPage = {
      id: wikipediaData.ref.id,
      ...wikipediaData.data,
    }
    return formatWikipediaData(wikipediaPage)
  } catch (error) {
    console.error(error)
  }
}

/**
 * This method creates wikipedia data of a wikipedia page in the fauna db
 */
export async function createWikipediaData({
  wikipediaData,
}: {
  wikipediaData: Partial<WikipediaPage>
}): Promise<WikipediaPage> {
  try {
    const response: any = await getClient().query(
      q.Create(q.Collection('wikipedia'), { data: wikipediaData })
    )

    const wikipediaPage: WikipediaPage = {
      id: response.ref.id,
      ...response.data,
    }
    return formatWikipediaData(wikipediaPage)
  } catch (error) {
    console.error(error)
  }
}

/**
 * This method updates wikipedia data of a wikipedia page in the fauna db
 */
export async function updateWikipediaData({
  wikipediaId,
  wikipediaData,
}: {
  wikipediaId: string
  wikipediaData: Partial<WikipediaPage>
}): Promise<WikipediaPage> {
  try {
    const response: any = await getClient().query(
      q.Update(q.Ref(q.Collection('wikipedia'), wikipediaId), {
        data: wikipediaData,
      })
    )

    const wikipediaPage: WikipediaPage = {
      id: response.ref.id,
      ...response.data,
    }
    return formatWikipediaData(wikipediaPage)
  } catch (error) {
    console.error(error)
  }
}

/**
 * This function does all required formatting of the data from DB
 */
function formatWikipediaData(data: WikipediaPage): WikipediaPage {
  if (data.snapshot?.lastUpdated) {
    data.snapshot = {
      ...data.snapshot,
      lastUpdated: new Date((data.snapshot.lastUpdated as any).value),
    }
  }

  if (data.pageViews?.lastUpdated) {
    data.pageViews = {
      ...data.pageViews,
      lastUpdated: new Date((data.pageViews.lastUpdated as any).value),
    }
  }

  return data
}
