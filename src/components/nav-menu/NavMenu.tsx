import { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import NProgress from 'nprogress'
import { getNavbarConfig } from './constants'
import { Router, useRouter } from 'next/dist/client/router'
import { MenuIcon, XIcon } from '@heroicons/react/solid'
import { WalletStatusWithConnectButton } from 'components'
import MobileNavItems from './MobileNavItems'
import NavItem from './NavItem'
import NavThemeButton from './NavThemeButton'
import { ProfileTooltip } from './ProfileTooltip'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'

const NavMenu = () => {
  const { user } = useContext(GlobalContext)
  const router = useRouter()
  const { active } = useWeb3React()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const [visibility, setVisibility] = useState<Boolean>(false)
  const [timerId, setTimerId] = useState(null)

  const navbarConfig = getNavbarConfig(user)

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

  const onMouseLeave = () => {
    setTimerId(
      setTimeout(() => {
        setVisibility(false)
      }, 200)
    )
  }

  const onMouseEnter = () => {
    timerId && clearTimeout(timerId)
    active && setVisibility(true)
  }

  useEffect(() => {
    return () => {
      timerId && clearTimeout(timerId)
    }
  }, [timerId])

  return (
    <div className="absolute z-50 items-center w-full shadow t-0 bg-top-desktop overflow-none font-inter">
      <div className="px-2 py-3">
        <nav className="relative flex flex-wrap items-center justify-center w-full mx-auto max-w-7xl lg:justify-between">
          {/* Mobile START */}
          <div className="flex md:hidden">
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

          <div
            className="flex items-center cursor-pointer ml-auto mr-auto md:ml-0 md:mr-0"
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

          <div className="flex md:hidden">
            <div className="flex">
              <WalletStatusWithConnectButton />
            </div>
            {visibility && (
              <div className="absolute top-0 mt-8 right-0 p-3 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                <ProfileTooltip />
              </div>
            )}
          </div>

          {/* Desktop START */}
          <div className="relative items-center justify-center hidden md:flex">
            {navbarConfig.menu.map((menuItem, i) => (
              <NavItem menuItem={menuItem} key={i} />
            ))}
          </div>
          <div className="hidden md:flex">
            <NavThemeButton />
            <div
              className="flex"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <WalletStatusWithConnectButton />
              {visibility && (
                <div className="absolute top-0 mt-10 right-0 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                  <ProfileTooltip />
                </div>
              )}
            </div>
          </div>
          {/* Desktop END */}
        </nav>
      </div>
      <MobileNavItems isMobileNavOpen={isMobileNavOpen} user={user} />
    </div>
  )
}

export default NavMenu
