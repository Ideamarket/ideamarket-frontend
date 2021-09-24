/**
 * This method removes `https://` or `http://` from the url if present
 */
export function removeHttpProtocol(url: string) {
  if (!url) {
    return url
  }

  return url.startsWith('https://') || url.startsWith('http://')
    ? url.split('://').slice(1).join('')
    : url
}

/**
 * This method adds `https://` to the url
 */
export function addHttpsProtocol(url: string) {
  const sanitizedURL = removeHttpProtocol(url)
  if (!sanitizedURL) {
    return sanitizedURL
  }
  return 'https://' + sanitizedURL
}
