const getSsrBaseUrl = (req: any) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const baseUrl = req ? `${protocol}://${req.headers.host}` : ''

  return baseUrl
}

export default getSsrBaseUrl
