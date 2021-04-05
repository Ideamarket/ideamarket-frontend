export type FileType = 'png' | 'jpeg'

export interface TokenData {
  fileType: FileType
  username: string
  market: string
  rank: string
  price: string
  weeklyChange: string
}
