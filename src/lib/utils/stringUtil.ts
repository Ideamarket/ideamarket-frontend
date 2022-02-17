export const convertAccountName = (q: string) => {
  if (!q) return ''
  if (q.substring(0, 2) === '0x') return `${q.slice(0, 6)}...${q.slice(-4)}`
  return `@${q}`
}
