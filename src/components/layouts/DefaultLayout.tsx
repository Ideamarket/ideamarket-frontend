import { useRouter } from 'next/dist/client/router'
import { NavBar, EmailFooter } from 'components'
import { ReactNode, useEffect, useContext, useState } from 'react'
import CookieConsent from 'react-cookie-consent'
import { Toaster } from 'react-hot-toast'

import { initIdeaMarketsStore } from 'store/ideaMarketsStore'
import { initTokenList } from 'store/tokenListStore'
import { GlobalContext } from '../../pages/_app'

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isEmailFooterActive } = useContext(GlobalContext)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    initIdeaMarketsStore()
    initTokenList()
    setMounted(true)
  }, [])

  // Need to wait for mount because we cannot know the theme on the server, many of the values returned from useTheme will be undefined until mounted on the client
  // Otherwise, will have to do this null check in every single file that useTheme is used
  if (!mounted) return null

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-brand-gray dark:bg-gray-900 py-16">
        <NavBar />
        <div>{children}</div>
      </div>
      <div className="fixed bottom-0 z-20 w-full">
        <CookieConsent
          style={{ position: 'relative', background: '#708090' }}
          buttonStyle={{
            background: '#0857e0',
            color: 'white',
            fontSize: '13px',
          }}
        >
          This website uses cookies to enhance the user experience.
        </CookieConsent>
        {isEmailFooterActive && router.pathname === '/' ? (
          <EmailFooter />
        ) : (
          <></>
        )}
      </div>
    </>
  )
}
