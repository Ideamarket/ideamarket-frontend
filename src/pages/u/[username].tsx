import { DefaultLayout } from 'components'
import { ProfileWallet } from 'components/account'
import ProfileGeneralInfo from 'components/account/ProfileGeneralInfo'
import { getPublicProfile } from 'lib/axios'
import { ReactElement } from 'react'
import { useQuery } from 'react-query'

type Props = {
  username: string
}

export default function PublicProfile({ username }: Props) {
  const { data: userData } = useQuery<any>([{ username }], getPublicProfile)

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-gray-900 font-inter">
      <div className="h-full px-4 pt-8 pb-5 text-white md:px-6 md:pt-16 bg-top-mobile md:bg-top-desktop md:h-[38rem]">
        <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
          {/* <PublicInfoColumn userData={userData} /> */}
          <ProfileGeneralInfo userData={userData} />
          <ProfileWallet walletState="public" userData={userData} />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async (context) => {
  const { query } = context

  return {
    props: {
      username: query.username,
    },
  }
}

PublicProfile.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
