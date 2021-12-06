import { useEffect, useState } from 'react'
import { useMutation } from 'react-query'
import WikiDesktopRelatedInfo from './WikiDesktopRelatedInfo'
import WikiMobileRelatedInfo from './WikiMobileRelatedInfo'

const WikiRelatedInfo = ({ rawTokenName, ...other }: any) => {
  const [wikiSnapshot, setWikiSnapshot] = useState(null)

  const [fetchWikiSnapshot] = useMutation<{
    message: string
    data: any
  }>(() =>
    fetch(`/api/markets/wikipedia/snapshot?title=${rawTokenName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok) {
        const response = await res.json()
        throw new Error(response.message)
      }
      return res.json()
    })
  )

  useEffect(() => {
    fetchWikiSnapshot().then(({ data }) => setWikiSnapshot(data))
  }, [fetchWikiSnapshot, rawTokenName])

  const wikiProps = {
    ...other,
    rawTokenName,
    wikiSnapshot,
  }

  return (
    <>
      <WikiMobileRelatedInfo {...wikiProps} />
      <WikiDesktopRelatedInfo {...wikiProps} />
    </>
  )
}

export default WikiRelatedInfo
