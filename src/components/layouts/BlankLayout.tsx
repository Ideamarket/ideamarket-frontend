import { useRouter } from 'next/dist/client/router'
import { ReactNode, useEffect, useContext } from 'react'
import CookieConsent from 'react-cookie-consent'
import { Toaster } from 'react-hot-toast'

import { EmailFooter } from 'components'
import { initIdeaMarketsStore } from 'store/ideaMarketsStore'
import { initTokenList } from 'store/tokenListStore'
import { GlobalContext } from '../../pages/_app'

export default function BlankLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isEmailFooterActive } = useContext(GlobalContext)

  useEffect(() => {
    initIdeaMarketsStore()
    initTokenList()
  }, [])

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-gray-900">
      <Toaster />
      <div>{children}</div>
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
    </div>
  )
}
