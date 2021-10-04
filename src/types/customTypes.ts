import { User } from 'next-auth'

export type SignedAddress = {
  message: string
  signature: string
}

export type UserPublicProfile = Partial<User & { profilePhoto: string }>
