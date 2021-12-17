import * as cheerio from 'cheerio'

// Constants
const WIKIPEDIA_VALID_PAGE_API_ENDPOINT = 'api/markets/wikipedia/validPageTitle'
export const WIKIPEDIA_BASE_URL = 'https://en.wikipedia.org/wiki'

// Env Variables
const serverHostUrl =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_URL ?? 'http://localhost:3000'

const ignoreWords = [
  'a',
  'an',
  'the',
  'at',
  'around',
  'by',
  'after',
  'along',
  'for',
  'from',
  'of',
  'on',
  'to',
  'with',
  'without',
  'or',
  'and',
  'nor',
  'but',
  'or',
  'yet',
  'so',
]

async function getPageTitleIfValidPage(title: string) {
  const res = await fetch(`${WIKIPEDIA_BASE_URL}/${encodeURIComponent(title)}`)
  if (!res.ok) {
    return null
  }

  try {
    const html = cheerio.load(await res.text())
    const bodyClasses = html('body').attr('class').split(' ')
    const rootPageClass = bodyClasses.find((className) =>
      className.startsWith('rootpage-')
    )
    const [, pageTitle] = rootPageClass.split('rootpage-')

    return pageTitle ?? null
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function findValidPageTitle(title: string) {
  let validPageTitle = await getPageTitleIfValidPage(title)
  if (!validPageTitle) {
    const allPossiblePageTitles = getAllPossiblePageTitles(title)

    for (const pageTitle of allPossiblePageTitles) {
      const tempValidPageTitle = await getPageTitleIfValidPage(pageTitle)
      if (tempValidPageTitle) {
        validPageTitle = tempValidPageTitle
        break
      }
    }
  }

  return validPageTitle ? decodeURIComponent(validPageTitle) : null
}

function getAllPossiblePageTitles(title: string) {
  const allWords = title.split('_').map((word) => word.toLowerCase())
  return getAllCombinations(allWords)
}

function getAllCombinations(words: string[]): string[] {
  const [word, ...otherWords] = words
  if (otherWords.length === 0) {
    if (ignoreWords.includes(word)) {
      return [word]
    }
    return [capitalizeFirstLetter(word), word]
  }
  let allCombinations = []
  const allPartialCombinations = getAllCombinations(otherWords)
  allPartialCombinations.forEach((partialCombination) => {
    if (!ignoreWords.includes(word)) {
      allCombinations.push(
        `${capitalizeFirstLetter(word)}_${partialCombination}`
      )
    }
    allCombinations.push(`${word}_${partialCombination}`)
  })
  return allCombinations
}

function capitalizeFirstLetter(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export async function fetchValidPageTitle(title: string) {
  const url = `${serverHostUrl}/${WIKIPEDIA_VALID_PAGE_API_ENDPOINT}?title=${encodeURIComponent(
    title
  )}`
  const res = await fetch(url)
  if (!res.ok) {
    return null
  }
  const validPageTitleResponse = await res.json()
  return validPageTitleResponse.data.validPageTitle
}
