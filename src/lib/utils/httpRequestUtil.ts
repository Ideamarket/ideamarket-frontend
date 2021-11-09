import https from 'https'
import http from 'http'
import { URL } from 'url'

/**
 * This function sends request to the API and doesn't wait for the response
 * It will return the response once the request is fully sent
 * Source : https://www.sensedeep.com/blog/posts/stories/lambda-fast-http.html
 */
export async function nonWaitingRequest({
  url,
  method,
  headers = {},
  body = {},
}: {
  url: string
  method: string
  headers?: any
  body?: any
}) {
  const { hostname, port, pathname, search, protocol } = new URL(url)
  const path = `${pathname}${search}`
  const postData = JSON.stringify(body)

  const httpOrhttps = protocol === 'https:' ? https : http
  const requestOptions: https.RequestOptions | http.RequestOptions = {
    hostname,
    port,
    path,
    method,
    headers: { ...headers, 'Content-Length': Buffer.byteLength(postData) },
  }

  return new Promise((resolve, reject) => {
    let req = httpOrhttps.request(requestOptions)
    req.on('error', (error) => {
      console.error(error)
      reject('http(s) request failed')
    })
    req.write(postData)
    req.end(null, null, () => {
      // Request has been fully sent
      resolve(req)
    })
  })
}
