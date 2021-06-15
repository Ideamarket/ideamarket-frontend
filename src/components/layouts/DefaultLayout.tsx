import { NavBar } from 'components'
import { ReactNode, useEffect } from 'react'
import CookieConsent from 'react-cookie-consent'
import { Toaster } from 'react-hot-toast'

import { initIdeaMarketsStore } from 'store/ideaMarketsStore'
import { initTokenList } from 'store/tokenListStore'

export default function DefaultLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initIdeaMarketsStore()
    initTokenList()
  }, [])

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-brand-gray">
        <NavBar />
        <div>{children}</div>
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
