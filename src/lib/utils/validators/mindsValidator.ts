export async function mindsValidator(tokenName: string): Promise<string> {
  try {
    const res = await fetch(`https://www.minds.com/api/v1/channel/${tokenName}`)
    const mindsChannel = await res.json()

    return mindsChannel?.channel ? mindsChannel?.channel.username : null
  } catch (error) {
    console.error('Error occurred while validating minds tokenName', error)
    return null
  }
}
