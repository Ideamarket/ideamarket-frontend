import { FileType } from '../_lib/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { request, gql } from 'graphql-request'
import { getHtml } from '../_lib/template'
import { getScreenshot } from '../_lib/chromium'

const isDev = !process.env.AWS_REGION
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1'

export type TokenAmount = {
  price: string
  name: string
  market: string
  rank: string
  dayChange: string
  stats: {
    amount: number
    holders: number
  }
}

const ENDPOINT =
  'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket'

function capitalize(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawMarket = req.query.market as string
  const text = req.query.text as string
  const textArray = text.split('.')
  if (
    textArray.length < 2 ||
    (textArray[textArray.length - 1] !== 'png' &&
      textArray[textArray.length - 1] !== 'jpeg') ||
    (rawMarket !== 'substack' && rawMarket !== 'twitter')
  ) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<h1>Bad Request</h1><p>Make sure your url looks like `/api/image/twitter/elonmusk.png` or `/api/image/twitter/elonmusk.jpeg` or `/api/image/substack/bankless.png` or `/api/image/substack/bankless.jpeg` </p>'
    )
    return
  }
  const market = capitalize(rawMarket)
  const rawToken = textArray.slice(0, -1).join('.')
  const fileType = textArray[textArray.length - 1] as FileType
  const tokenInQuery = (market === 'Twitter' ? '@' : '') + rawToken
  try {
    const currentTs = Math.floor(Date.now() / 1000)
    const weekBack = currentTs - 604800
    const query = gql`
      {
        ideaMarkets(where: { name: "${market}" }) {
          tokens(where: { name: "${tokenInQuery}" }) {
            name
            rank
            latestPricePoint {
              price
            }
            pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
              oldPrice
              price
            }
            dayVolume
            dayChange
          }
        }
      }`
    const response = await request(ENDPOINT, query)
    const token = response.ideaMarkets[0].tokens[0]
    // console.log(JSON.stringify(response, null, 2))
    let html
    if (token) {
      const weeklyPricePoints = token.pricePoints
      let weeklyChange = '0'
      if (weeklyPricePoints.length > 0) {
        const weeklyCurrentPrice = Number(
          weeklyPricePoints[weeklyPricePoints.length - 1].price
        )
        const weeklyOldPrice = Number(weeklyPricePoints[0].oldPrice)
        weeklyChange = Number(
          ((weeklyCurrentPrice - weeklyOldPrice) * 100) / weeklyOldPrice
        ).toFixed(2)
      }
      html = getHtml({
        rank: token.rank,
        username: rawToken,
        weeklyChange,
        price: Number(token.latestPricePoint.price).toFixed(2),
        fileType,
        market: rawMarket,
      })
    } else {
      html = getHtml({
        rank: '0',
        username: rawToken,
        weeklyChange: '0',
        price: '0',
        fileType,
        market: rawMarket,
      })
    }
    if (isHtmlDebug) {
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
      return
    }
    const file = await getScreenshot(html, 'png', isDev)
    res.statusCode = 200
    res.setHeader('Content-Type', `image/png`)
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    )
    res.end(file)
    return
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>')
    console.error(error)
  }
}
