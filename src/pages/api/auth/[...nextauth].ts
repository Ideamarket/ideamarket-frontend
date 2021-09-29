import NextAuth, { User } from 'next-auth'
import Providers from 'next-auth/providers'
import { FaunaAdapter } from '@next-auth/fauna-adapter'
import { getClient } from 'lib/faunaDb'

export default NextAuth({
  providers: [
    Providers.Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: FaunaAdapter({ faunaClient: getClient() }),
  callbacks: {
    session: (session, user: User) => ({
      ...session,
      user: {
        ...user,
        profilePhoto:
          user.imagesFolder && user.profilePhotoFileName
            ? `${process.env.NEXT_PUBLIC_USER_ACCOUNTS_CLOUDFRONT_DOMAIN}/${user.imagesFolder}/${user.profilePhotoFileName}`
            : null,
      },
    }),
  },
})
