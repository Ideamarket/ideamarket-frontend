import { DefaultLayout, Footer } from 'components'
import { ProfileWallet } from 'components/account'
import PublicInfoColumn from 'components/account/PublicInfoColumn'
import router from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import getSsrBaseUrl from 'utils/getSsrBaseUrl'
import { useCustomSession } from 'utils/useCustomSession'

type Props = {
  username: string
  userDataSsr: any
}

export default function PublicProfile({ username, userDataSsr }: Props) {
  const [userData, setUserData] = useState(null)
  const { session } = useCustomSession()

  useEffect(() => {
    if (userDataSsr) {
      return setUserData({ username, ...userDataSsr })
    }
  }, [userDataSsr, username])

  useEffect(() => {
    if (session?.user.username === username) {
      router.push('/user-account')
    }
  }, [username, session?.user.username])

  if (!userDataSsr) {
    return null
  }

  return (
    <div className="min-h-screen pt-18 xl:pt-16 bg-top-desktop-new">
      <div className="w-11/12 mx-auto my-0 max-w-7xl xl:pt-24 font-inter w-90">
        <div className="flex flex-col items-start justify-center p-8 bg-white rounded-lg xl:flex-row dark:bg-gray-500">
          <PublicInfoColumn userData={userData} />
          <ProfileWallet walletState="public" userData={userData} />
        </div>
        <Footer />
      </div>
    </div>
  )
}

export const getServerSideProps = async (context) => {
  const { query, req } = context
  const baseUrl = getSsrBaseUrl(req)

  const { data } = await fetch(
    `${baseUrl}/api/userPublicProfile?username=${query.username}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then(async (res) => {
    if (!res.ok) {
      const response = await res.json()
      throw new Error(response.message)
    }
    return res.json()
  })

  const verifiedAddresses = data?.ethAddresses?.filter((item) => item?.verified)

  if (verifiedAddresses?.length > 0) {
    return {
      props: {
        userDataSsr: data,
        username: query.username,
      },
    }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}

PublicProfile.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
