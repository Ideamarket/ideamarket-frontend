export type FileType = 'png' | 'jpeg'
export type MarketType = 'twitter' | 'substack'

export interface TokenData {
  fileType: FileType
  username: string
  market: MarketType
  rank: string
  price: string
  weeklyChange: string
}
