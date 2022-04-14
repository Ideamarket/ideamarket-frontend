import { DefaultLayout } from 'components'
import { ReactElement, useContext } from 'react'
import { Toaster } from 'react-hot-toast'
import { ProfileWallet } from 'components/account'
import ProfileGeneralInfo from 'components/account/ProfileGeneralInfo'
import { GlobalContext } from './_app'

const Account = () => {
  const { user } = useContext(GlobalContext)

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-gray-900 font-inter">
      <div className="h-full pt-8 pb-5 text-white md:pt-16 bg-top-mobile md:bg-top-desktop md:h-[38rem]">
        <div className="mx-auto md:px-4 md:max-w-304">
          <Toaster />
          <ProfileGeneralInfo userData={user} />
          <ProfileWallet userData={user} />
        </div>
      </div>
    </div>
  )
}

export default Account

Account.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
