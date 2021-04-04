import { Page } from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { getOptions } from './options'
import { FileType } from './types'
let _page: Page | null

async function getPage(isDev: boolean) {
  if (_page) {
    return _page
  }
  const options = await getOptions(isDev)
  const browser = await chromium.puppeteer.launch(options)
  _page = await browser.newPage()
  return _page
}

export async function getScreenshot(
  html: string,
  type: FileType,
  isDev: boolean
) {
  const page = await getPage(isDev)
  await page.setViewport({ width: 1440, height: 900 })
  await page.setContent(html)
  const file = await page.screenshot({ type })
  return file
}
