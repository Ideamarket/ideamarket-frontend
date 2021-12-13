// Constants
const WIKIPEDIA_VALID_PAGE_API_ENDPOINT = 'api/markets/wikipedia/validPageTitle'

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

async function isWikiPageTitleValid(title: string) {
  const res = await fetch(`https://en.wikipedia.org/wiki/${title}`)
  return res.ok ? true : false
}

export async function findValidPageTitle(title: string) {
  if (await isWikiPageTitleValid(title)) {
    return title
  }

  const allPossiblePageTitles = getAllPossiblePageTitles(title)
  let validPageTitle: string | null = null
  for (const pageTitle of allPossiblePageTitles) {
    if (await isWikiPageTitleValid(pageTitle)) {
      validPageTitle = pageTitle
      break
    }
  }
  return validPageTitle
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
  const res = await fetch(
    `${serverHostUrl}/${WIKIPEDIA_VALID_PAGE_API_ENDPOINT}?title=${title}`
  )
  if (!res.ok) {
    return null
  }
  const validPageTitleResponse = await res.json()
  return validPageTitleResponse.data.validPageTitle
}
