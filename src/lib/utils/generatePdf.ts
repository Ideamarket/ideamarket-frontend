import puppeteer from 'puppeteer'

/**
 * This function returns the pdf buffer of a webpage url
 */
export async function generatePdfFromWebpage(webpageUrl: string) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(webpageUrl, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({ width: '580px' })

  await page.close()
  await browser.close()

  return pdfBuffer
}
