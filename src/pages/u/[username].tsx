import { DefaultLayout, Footer } from 'components'
import { ProfileWallet } from 'components/account'
import PublicInfoColumn from 'components/account/PublicInfoColumn'
import router from 'next/router'
import { useEffect, useState } from 'react'
import getSsrBaseUrl from 'utils/getSsrBaseUrl'
import IS_ACCOUNT_ENABLED from 'utils/isAccountEnabled'
import { useCustomSession } from 'utils/useCustomSession'

type Props = {
  username: string
  userDataSsr: any
}

export default function PublicProfile({ username, userDataSsr }: Props) {
  const [userData, setUserData] = useState(null)
  const { session } = useCustomSession()

  useEffect(() => {
    if (!IS_ACCOUNT_ENABLED) {
      router.push('/')
    }
  }, [])

  useEffect(() => {
    if (userDataSsr) {
      return setUserData({ username, ...userDataSsr })
    }
  }, [userDataSsr, username])

  useEffect(() => {
    if (session?.user.username === username) {
      router.push('/account')
    }
  }, [username, session?.user.username])

  if (!userDataSsr) {
    return null
  }

  return (
    <div className="min-h-screen pt-18 md:pt-16 bg-top-desktop-new">
      <div className="w-11/12 mx-auto my-0 max-w-7xl md:pt-24 font-inter w-90">
        <div className="flex flex-col items-start justify-center px-6 py-5 bg-white rounded-lg md:flex-row dark:bg-gray-500">
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

PublicProfile.layoutProps = {
  Layout: DefaultLayout,
}
