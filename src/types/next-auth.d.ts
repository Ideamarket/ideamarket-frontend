/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: User
  }

  interface User {
    id: string
    uuid?: string
    username?: string
    bio?: string
    profilePhoto?: string
    redirectionUrl?: string
    ethAddresses?: string[]
    visibilityOptions?: VisibilityOptions
  }

  interface VisibilityOptions {
    email?: boolean
    bio?: boolean
    ethAddresses?: boolean
    holdings?: boolean
  }
}
