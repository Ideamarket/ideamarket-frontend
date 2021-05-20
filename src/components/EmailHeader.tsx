import { useContext } from 'react'
import { HeaderEmailForm } from 'components'
import Close from '../assets/close.svg'
import { GlobalContext } from 'pages/_app'

export default function EmailHeader() {
  const { setIsEmailHeaderActive } = useContext(GlobalContext)

  function close() {
    setIsEmailHeaderActive(false)
    localStorage.setItem('IS_EMAIL_BAR_CLOSED', 'true')
  }

  return (
    <>
      <div className="w-full flex justify-center items-center bg-yellow-400 px-2 py-2 transform">
        <HeaderEmailForm />
        <button
          type="button"
          className="absolute right-1 p-2 text-gray transition duration-150 ease-in-out rounded-xl w-9 h-9 hover:text-gray-500 focus:outline-none focus:text-gray-500"
          aria-label="Close"
          onClick={close}
        >
          <Close className="h-full" />
        </button>
      </div>
    </>
  )
}
