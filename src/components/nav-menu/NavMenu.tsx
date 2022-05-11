import { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import NProgress from 'nprogress'
import { getNavbarConfig } from './constants'
import { Router } from 'next/dist/client/router'
import { MenuIcon, XIcon } from '@heroicons/react/solid'
import { WalletStatusWithConnectButton } from 'components'
import MobileNavItems from './MobileNavItems'
import NavItem from './NavItem'
// import NavThemeButton from './NavThemeButton'
import { ProfileTooltip } from './ProfileTooltip'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'
import { PencilIcon } from '@heroicons/react/outline'
import ModalService from 'components/modals/ModalService'
import NewPostModal from 'modules/posts/components/NewPostModal'
import WalletModal from 'components/wallet/WalletModal'
import { useWalletStore } from 'store/walletStore'
import A from 'components/A'

const NavMenu = () => {
  const { user } = useContext(GlobalContext)
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

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const onNewPostClicked = () => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(NewPostModal)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(NewPostModal)
    }
  }

  useEffect(() => {
    return () => {
      timerId && clearTimeout(timerId)
    }
  }, [timerId])

  return (
    <div className="absolute z-50 items-center w-full shadow t-0 bg-top-desktop overflow-none font-inter">
      <div className="px-2 py-3">
        <nav className="relative h-10 flex flex-wrap items-center justify-center md:justify-between w-full mx-auto max-w-7xl">
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

          <div className="flex items-center cursor-pointer ml-auto mr-auto md:ml-0 md:mr-0">
            <A href="/" className="flex items-center">
              <div className="relative w-10 h-8">
                <Image
                  src="/logo.png"
                  alt="Workflow logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>

              <span className="w-auto h-full mr-2 text-2xl leading-none text-white md:text-3xl">
                Ideamarket
              </span>
            </A>

            {/* Desktop START */}
            <div className="relative items-center justify-center hidden lg:flex">
              {navbarConfig.menu.map((menuItem, i) => (
                <NavItem menuItem={menuItem} key={i} />
              ))}
            </div>
            {/* Desktop END */}
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

          <div className="hidden md:flex items-center">
            {/* <button
              className="flex items-center space-x-2 h-9 bg-white/[.1] text-white text-sm font-semibold px-3 py-1 ml-3 rounded-lg"
            >
              <A
                href={`/u/${
                  user && user.username ? user.username : user?.walletAddress
                }`}
                className="text-white hover:text-gray-500"
              >
                My Profile
              </A>
            </button> */}

            <button
              onClick={onNewPostClicked}
              className="flex items-center space-x-2 h-9 bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 text-white text-sm font-semibold px-3 py-1 ml-3 rounded-lg"
            >
              <span>New Post</span>
              <PencilIcon className="w-3" />
            </button>

            {/* <NavThemeButton /> */}

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
        </nav>
      </div>

      <MobileNavItems isMobileNavOpen={isMobileNavOpen} user={user} />
    </div>
  )
}

export default NavMenu
