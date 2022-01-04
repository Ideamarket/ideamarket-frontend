import { useEffect, useState } from 'react'
import Image from 'next/image'
import NProgress from 'nprogress'
import { getNavbarConfig } from './constants'
import { Router, useRouter } from 'next/dist/client/router'
import { MenuIcon, XIcon } from '@heroicons/react/solid'
import { Tooltip, WalletStatusWithConnectButton } from 'components'
import ModalService from 'components/modals/ModalService'
import WalletModal from '../wallet/WalletModal'
import MobileNavItems from './MobileNavItems'
import NavItem from './NavItem'
import NavThemeButton from './NavThemeButton'
import { useMixPanel } from 'utils/mixPanel'
import { getData } from 'lib/utils/fetch'

const NavMenu = () => {
  const router = useRouter()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const [imoFeature, setIMOFeature] = useState({
    feature: 'IMO',
    enabled: false,
  })
  const { mixpanel } = useMixPanel()

  const navbarConfig = getNavbarConfig(mixpanel)

  useEffect(() => {
    const featureSwitch = async () => {
      try {
        const { data: imoResponse } = await getData({
          url: `/api/fs?value=IMO`,
        })
        setIMOFeature(imoResponse)
      } catch (error) {
        console.error('Failed to fetch api/fs for IMO')
      }
    }

    NProgress.configure({ trickleSpeed: 100 })

    // Feature switch for IMO
    featureSwitch()
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

          <Tooltip
            placement="down"
            IconComponent={() => (
              <div className="items-start flex">
                <span className="opacity-75 font-base text-sm text-gray-400 pl-2 whitespace-nowrap">
                  Eth Gas : 65 Gwei
                </span>
              </div>
            )}
            // tooltipContentclassName="p-3 mb-1 text-sm rounded-xl text-gray-400 shadow bg-white"
            // iconComponentClassNames="w-max h-max"
          >
            <div className="flex flex-col w-32 md:w-64">
              <p className="text-sm">
                Claiming $IMO requires you to pay gas fees using L2 $ETH on the
                Arbitrum Network.
              </p>
            </div>
          </Tooltip>
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
            <WalletStatusWithConnectButton
              openModal={() => {
                mixpanel.track('ADD_WALLET_START')
                ModalService.open(WalletModal)
              }}
            />
          </div>

          {/* Desktop START */}
          <div className="relative items-center justify-center hidden md:flex">
            {navbarConfig.menu
              .filter(
                (m) =>
                  m.name !== 'IMO' || (m.name === 'IMO' && imoFeature.enabled)
              )
              .map((menuItem, i) => (
                <NavItem menuItem={menuItem} key={i} />
              ))}
          </div>
          <div className="hidden md:flex">
            <NavThemeButton />
            <WalletStatusWithConnectButton
              openModal={() => {
                mixpanel.track('ADD_WALLET_START')
                ModalService.open(WalletModal)
              }}
            />
          </div>
          {/* Desktop END */}
        </nav>
      </div>
      <MobileNavItems
        isMobileNavOpen={isMobileNavOpen}
        imoFeature={imoFeature}
      />
    </div>
  )
}

export default NavMenu
