import classNames from 'classnames'
import { Router, useRouter } from 'next/dist/client/router'
import { useContext, useState, useEffect } from 'react'
import { WalletStatus } from 'components'
import { GlobalContext } from 'pages/_app'
import Close from '../assets/close.svg'
import Hamburger from '../assets/hamburger.svg'
import NProgress from 'nprogress'

export default function Nav() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const router = useRouter()
  const closeMenu = () => setIsMobileNavOpen(false)
  const { setIsWalletModalOpen } = useContext(GlobalContext)
  const menuItems = [
    {
      name: 'Overview',
      value: 'overview',
      onClick: () => router.push('/'),
      isSelected: router.pathname === '/',
    },
    {
      name: 'My Tokens',
      value: 'my-tokens',
      onClick: () => router.push('/tokens'),
      isSelected: router.pathname === '/tokens',
    },
    {
      name: 'How It Works',
      value: 'how-it-works',
      onClick: () => router.push('/help'),
      isSelected: router.pathname === '/help',
    },
  ]

  useEffect(() => {
    NProgress.configure({ trickleSpeed: 100 })
  }, [])

  useEffect(() => {
    Router.events.on('routeChangeStart', () => NProgress.start())
    Router.events.on('routeChangeComplete', () => NProgress.done())
    Router.events.on('routeChangeError', () => NProgress.done())

    return () => {
      Router.events.on('routeChangeStart', () => NProgress.start())
      Router.events.on('routeChangeComplete', () => NProgress.done())
      Router.events.on('routeChangeError', () => NProgress.done())
    }
  }, [])

  return (
    <>
      <nav className="fixed top-0 z-20 w-full shadow bg-top-desktop">
        <div className="px-2 mx-auto transform max-w-88 md:max-w-304">
          <div className="flex items-center justify-between h-16">
            <div
              className="z-20 flex items-center flex-shrink-0 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <img
                className="block w-auto h-8"
                src="/logo.png"
                alt="Workflow logo"
              />

              <span className="w-auto h-full text-2xl leading-none text-white md:text-3xl font-gilroy-bold">
                Ideamarket
              </span>
            </div>

            <div className="hidden w-full space-x-8 text-center md:inline">
              {menuItems.map((menuItem) => (
                <a
                  key={menuItem.value}
                  onClick={() => {
                    menuItem.onClick()
                    closeMenu()
                  }}
                  className={classNames(
                    'cursor-pointer inline-flex items-center px-1 text-lg font-medium leading-5 tracking-tighter transition duration-150 ease-in-out focus:outline-none focus:text-gray-700 focus:border-gray-300',
                    menuItem.isSelected
                      ? 'text-white'
                      : 'text-brand-gray text-opacity-60 hover:text-brand-gray-2'
                  )}
                >
                  {menuItem.name}
                </a>
              ))}
            </div>
            <div className="z-20 hidden md:ml-6 md:flex md:items-center">
              <WalletStatus openModal={() => setIsWalletModalOpen(true)} />
            </div>
            <div className="flex items-center -mr-2 md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 text-gray-400 transition duration-150 ease-in-out rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500"
                aria-label="Main menu"
                aria-expanded="false"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              >
                <Hamburger
                  className={classNames(
                    'w-6 h-6',
                    isMobileNavOpen ? 'hidden' : 'block'
                  )}
                />
                <Close
                  className={classNames(
                    'w-6 h-6',
                    isMobileNavOpen ? 'block' : 'hidden'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className={classNames(
            'md:hidden',
            isMobileNavOpen ? 'block' : 'hidden'
          )}
        >
          <div className="pt-2 pb-3 text-center">
            {menuItems.map((menuItem) => (
              <a
                onClick={() => {
                  menuItem.onClick()
                  closeMenu()
                }}
                key={menuItem.value}
                className={classNames(
                  'cursor-pointer block py-2 pl-3 pr-4 mt-1 text-base font-medium transition duration-150 ease-in-out border-l-4 border-transparent hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300',
                  menuItem.isSelected
                    ? 'text-white'
                    : 'text-brand-gray text-opacity-60'
                )}
              >
                {menuItem.name}
              </a>
            ))}

            <div className="flex justify-center mt-5">
              <WalletStatus openModal={() => setIsWalletModalOpen(true)} />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
