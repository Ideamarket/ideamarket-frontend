import { useContext } from 'react'
import { useRouter } from 'next/dist/client/router'
import { GlobalContext } from 'pages/_app'
import { NavBar } from 'components'
import { ReactNode } from 'react'
import CookieConsent from 'react-cookie-consent'
import { Toaster } from 'react-hot-toast'

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const { isEmailHeaderActive } = useContext(GlobalContext)
  const router = useRouter()

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-brand-gray">
        <NavBar />
        <div
          className={
            isEmailHeaderActive && router.pathname === '/'
              ? 'py-32 md:py-28'
              : 'py-16'
          }
        >
          {children}
        </div>
      </div>
      <CookieConsent
        style={{ background: '#708090' }}
        buttonStyle={{
          background: '#0857e0',
          color: 'white',
          fontSize: '13px',
        }}
      >
        This website uses cookies to enhance the user experience.
      </CookieConsent>
    </>
  )
}
