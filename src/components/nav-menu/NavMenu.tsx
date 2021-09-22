import { useEffect, useState } from 'react'
import Image from 'next/image'
import NProgress from 'nprogress'
import { navbarConfig } from './constants'
import { Router, useRouter } from 'next/dist/client/router'
import { MenuIcon, XIcon } from '@heroicons/react/solid'
import { WalletStatus } from 'components'
import ModalService from 'components/modals/ModalService'
import WalletModal from '../wallet/WalletModal'
import MobileNavItems from './MobileNavItems'
import NavItem from './NavItem'
import NavThemeButton from './NavThemeButton'
import LoginAndLogoutButton from './LoginAndLogoutButton'

const NavMenu = () => {
  const router = useRouter()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)

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
    <div className="relative items-center w-full shadow bg-top-desktop overflow-none font-inter">
      <div className="px-2 py-3 lg:px-24">
        <nav className="relative flex flex-wrap items-center justify-center w-full mx-auto max-w-7xl lg:justify-between">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="relative w-10 h-8">
              <Image
                src="/logo.png"
                alt="Workflow logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="w-auto h-full text-2xl leading-none text-white md:text-3xl">
              Ideamarket
            </span>
          </div>

          {/* Desktop START */}
          <div className="relative items-center justify-center hidden md:flex">
            {navbarConfig.menu.map((menuItem, i) => (
              <NavItem menuItem={menuItem} key={i} />
            ))}
          </div>
          <div className="hidden md:flex">
            <NavThemeButton />
            <WalletStatus openModal={() => ModalService.open(WalletModal)} />
            <LoginAndLogoutButton />
          </div>
          {/* Desktop END */}

          {/* Mobile START */}
          <div className="flex ml-auto md:hidden">
            <button
              onClick={() => setMobileNavOpen(!isMobileNavOpen)}
              type="button"
              className="inline-flex p-2 mr-1 text-white bg-transparent focus:outline-none "
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileNavOpen ? (
                <MenuIcon className="w-6 h-6" />
              ) : (
                <XIcon className="w-6 h-6" />
              )}
            </button>
          </div>
          {/* Mobile END */}
        </nav>
      </div>
      <MobileNavItems isMobileNavOpen={isMobileNavOpen} />
    </div>
  )
}

export default NavMenu
