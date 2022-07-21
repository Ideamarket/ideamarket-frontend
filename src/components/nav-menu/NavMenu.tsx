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
import { PencilIcon as OutlinePencilIcon } from '@heroicons/react/outline'
import { PencilIcon as SolidPencilIcon } from '@heroicons/react/solid'
import ModalService from 'components/modals/ModalService'
import NewPostModal from 'modules/posts/components/NewPostModal'
import WalletModal from 'components/wallet/WalletModal'
import { useWalletStore } from 'store/walletStore'
import A from 'components/A'
import classNames from 'classnames'

type Props = {
  bgColor: string
  textColor?: string
}

const NavMenu = ({ bgColor, textColor = 'text-white' }: Props) => {
  const { user } = useContext(GlobalContext)
  const { active, account } = useWeb3React()
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
    <div
      className={classNames(
        bgColor ? bgColor : 'bg-top-desktop',
        textColor,
        'absolute z-[200] items-center w-full overflow-none font-inter'
      )}
    >
      {/* Desktop NavMenu */}
      <div className="hidden md:block px-2 py-3">
        <nav className="relative h-10 flex flex-wrap items-center justify-center md:justify-between w-full mx-auto max-w-7xl">
          <div className="hidden md:flex items-center cursor-pointer ml-auto mr-auto md:ml-0 md:mr-0">
            <A href="/" className="flex items-center">
              <div className="relative w-10 h-8">
                <Image
                  src="/im-logo-1.png"
                  alt="IM-nav-logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>

              <span className="w-auto h-full mr-2 text-2xl font-bold leading-none">
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

          <div className="hidden md:flex items-center">
            <button
              onClick={onNewPostClicked}
              className="flex items-center space-x-2 h-9 bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 text-white text-sm font-bold px-3 py-1 ml-3 rounded-lg"
            >
              <span>New Post</span>
              <OutlinePencilIcon className="w-3" />
            </button>

            {/* <NavThemeButton /> */}

            <div
              className="flex"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <WalletStatusWithConnectButton />
              {visibility && (
                <div className="absolute top-0 mt-10 right-0 mb-1 text-sm text-black rounded-xl shadow bg-white overflow-hidden">
                  <ProfileTooltip />
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile NavMenu */}
      <div className="flex justify-between items-center md:hidden px-3 py-4">
        <button
          onClick={() => setMobileNavOpen(!isMobileNavOpen)}
          type="button"
          className="inline-flex pr-2 mr-1 bg-transparent focus:outline-none "
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

        <A href="/" className="flex items-center">
          <div className="relative w-10 h-8">
            <Image
              src="/im-logo-1.png"
              alt="IM-nav-logo"
              layout="fill"
              objectFit="contain"
            />
          </div>

          <span className="w-auto h-full mr-2 text-2xl leading-none md:text-3xl">
            Ideamarket
          </span>
        </A>

        <div className="flex">
          <WalletStatusWithConnectButton />
        </div>

        <button
          onClick={onNewPostClicked}
          className="w-8 h-8 flex justify-center items-center text-white bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 rounded-2xl"
        >
          <SolidPencilIcon className="w-5 h-5" />
        </button>
      </div>

      <MobileNavItems
        isMobileNavOpen={isMobileNavOpen}
        user={user}
        account={account}
      />
    </div>
  )
}

export default NavMenu
