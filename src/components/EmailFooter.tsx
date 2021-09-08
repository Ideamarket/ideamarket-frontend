import { useContext } from 'react'
import { FooterEmailForm } from 'components'
import Close from '../assets/close.svg'
import { GlobalContext } from 'pages/_app'

export default function EmailHeader() {
  const { setIsEmailFooterActive } = useContext(GlobalContext)

  function close() {
    setIsEmailFooterActive(false)
    localStorage.setItem('IS_EMAIL_BAR_CLOSED', 'true')
  }

  return (
    <nav className="bg-gray-900 shadow">
      <div className="flex items-center justify-center w-full px-2 py-2 transform">
        <FooterEmailForm />
        <button
          type="button"
          className="absolute p-2 transition duration-150 ease-in-out right-1 text-gray rounded-xl w-9 h-9 hover:text-gray-500 focus:outline-none focus:text-gray-500"
          aria-label="Close"
          onClick={close}
        >
          <Close className="h-full" stroke="grey" />
        </button>
      </div>
    </nav>
  )
}
