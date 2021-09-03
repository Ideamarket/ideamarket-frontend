/**
 * This method removes `https://` or `http://` from the url if present
 */
export function removeHttpProtocol(url: string) {
  return url.startsWith('https://') || url.startsWith('http://')
    ? url.split('://').slice(1).join('')
    : url
}

/**
 * This method adds `https://` to the url
 */
export function addHttpsProtocol(url: string) {
  return 'https://' + url
}
