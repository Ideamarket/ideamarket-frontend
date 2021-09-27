export const postData = async <TData>({
  url,
  data,
}: {
  url: string
  data: Record<string, unknown>
}): Promise<TData> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  })

  return res.json()
}

export const getData = async <TData>({
  url,
}: {
  url: string
}): Promise<TData> => {
  const res = await fetch(url)

  return res.json()
}
