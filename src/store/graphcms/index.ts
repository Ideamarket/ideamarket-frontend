import { LISTING } from './listing'
import { HOME } from './home'
import { GraphQLClient } from 'graphql-request'
import { getQueryPageContent } from 'store/queries/graphcms'

type Content = {
  key: string
  value: {
    html: string
  }
}

export type Page = {
  title: string
  contents: Content[]
}

const PAGES = [HOME, LISTING]

export function createGraphCMSClient() {
  const endpoint = process.env.GRAPHCMS_ENDPOINT
  const authToken = process.env.GRAPHCMS_API_KEY
  const client = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
  return client
}

export async function getCMSContent(pageTitle: string) {
  const page = PAGES.find((_page) => _page.title === pageTitle)
  let contents: Content[]
  try {
    const client = createGraphCMSClient()
    const result = await client.request(getQueryPageContent(page.title))
    contents = result.contents
    throw new Error()
  } catch (e) {
    contents = page.contents
  }

  let result: Record<string, string> = {}

  contents.forEach((content) => {
    result[content.key] = content.value.html
  })

  return result
}
