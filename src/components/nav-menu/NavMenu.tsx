import { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import NProgress from 'nprogress'
import { getNavbarConfig } from './constants'
import { Router } from 'next/dist/client/router'
import { MenuIcon, XIcon } from '@heroicons/react/solid'
import { WalletStatusWithConnectButton } from 'components'
import MobileNavItems from './MobileNavItems'
import NavItem from './NavItem'
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
import useUserFeesClaimable from 'modules/user-market/hooks/useUserFeesClaimable'
import useTokenToDAI from 'actions/useTokenToDAI'
import withdrawClaimableFees from 'actions/web3/user-market/withdrawClaimableFees'
import { useTransactionManager } from 'utils'
import TradeCompleteModal, {
  TX_TYPES,
} from 'components/trade/TradeCompleteModal'
// import StakeUserModal from 'modules/user-market/components/StakeUserModal'
// import { USER_MARKET } from 'modules/user-market/utils/UserMarketUtils'

type Props = {
  bgColor: string
  textColor?: string
}

const ETH_TOKEN = {
  name: 'Ethereum',
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'ETH',
  decimals: 18,
}

const NavMenu = ({ bgColor, textColor = 'text-white' }: Props) => {
  const { setIsTxPending, user } = useContext(GlobalContext)
  const { account } = useWeb3React()
  const txManager = useTransactionManager()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)

  const navbarConfig = getNavbarConfig(user)

  const [, ethClaimable] = useUserFeesClaimable()
  const [, , selectedTokenDAIValue] = useTokenToDAI(
    ETH_TOKEN as any,
    ethClaimable,
    18
  )

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

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  // const onStakeClicked = () => {
  //   ModalService.open(StakeUserModal, {
  //     ideaToken: user,
  //     market: USER_MARKET,
  //   })
  // }

  const onNewPostClicked = () => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(NewPostModal /*, { onStakeClicked }*/)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(NewPostModal /*, { onStakeClicked }*/)
    }
  }

  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    txType: TX_TYPES
  ) {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      txType,
    })
  }

  const onWithdrawUserFeeClicked = async () => {
    if (ethClaimable && ethClaimable > 0) {
      setIsTxPending(true)

      try {
        await txManager.executeTx(
          'Withdraw claimable fees',
          withdrawClaimableFees
        )
      } catch (ex) {
        console.log(ex)
        onTradeComplete(false, 'error', 'error', TX_TYPES.NONE)
        setIsTxPending(false)
        return
      }

      setIsTxPending(false)
      onTradeComplete(
        true,
        'success',
        parseFloat(selectedTokenDAIValue).toFixed(2),
        TX_TYPES.WITHDRAW_CLAIMABLE_FEE
      )
    }
  }

  return (
    <div
      className={classNames(
        bgColor ? bgColor : 'bg-top-desktop',
        textColor,
        'absolute z-[900] top-0 left-0 items-center w-full font-inter md:px-20'
      )}
    >
      {/* Desktop NavMenu */}
      <div className="hidden md:block px-2 py-3 border-b border-black/[0.05]">
        <nav className="relative h-10 flex flex-wrap items-center justify-center md:justify-between w-full mx-auto max-w-7xl">
          <div className="hidden md:flex space-x-3 items-center cursor-pointer ml-auto mr-auto md:ml-0 md:mr-0">
            <A href="/" className="flex items-center">
              <div className="relative w-10 h-8">
                <Image
                  src="/im-logo-1.png"
                  alt="IM-nav-logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>

              <span className="w-auto h-full mr-2 text-lg font-bold leading-none">
                Ideamarket
              </span>
            </A>

            {/* Desktop START */}
            <div className="relative items-center justify-center hidden lg:flex space-x-3">
              {navbarConfig.menu.map((menuItem, i) => (
                <NavItem menuItem={menuItem} key={i} />
              ))}
            </div>
            {/* Desktop END */}
          </div>

          <div className="h-9 hidden md:flex items-center">
            <button
              onClick={onWithdrawUserFeeClicked}
              className="bg-white border-l border-t border-r-4 border-b-4 hover:border border-blue-600 rounded-3xl px-2 py-1 leading-[.5rem]"
            >
              <div className="flex items-center space-x-2">
                <div className="relative w-5 h-5">
                  <Image
                    src={'/withdraw-icon.svg'}
                    alt="withdraw-icon"
                    layout="fill"
                  />
                </div>
                <div>
                  <div className="mt-1 text-[0.6rem] text-black/[.5]">
                    Available to Withdraw
                  </div>
                  <div>
                    <span className="text-black font-bold text-xs">
                      {ethClaimable} ETH
                    </span>
                    <span className="text-black/[.5] font-bold text-xs">
                      {' '}
                      (${parseFloat(selectedTokenDAIValue).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={onNewPostClicked}
              className="flex items-center space-x-2 h-full bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 text-white text-xs font-bold px-3 py-1 ml-3 rounded-xl"
            >
              <span>New Post</span>
              <OutlinePencilIcon className="w-3" />
            </button>

            {/* <NavThemeButton /> */}

            <WalletStatusWithConnectButton />
          </div>
        </nav>
      </div>

      {/* Mobile NavMenu */}
      <div className="relative flex justify-between items-center md:hidden px-3 py-4 border-b">
        <A href="/" className="flex items-center">
          <div className="relative w-10 h-8">
            <Image
              src="/im-logo-1.png"
              alt="IM-nav-logo"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </A>

        <div className="flex justify-between items-center space-x-4">
          <div className="flex">
            <WalletStatusWithConnectButton />
          </div>

          <button
            onClick={onNewPostClicked}
            className="w-8 h-8 flex justify-center items-center text-white bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 rounded-2xl"
          >
            <SolidPencilIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileNavOpen(!isMobileNavOpen)}
            type="button"
            className="inline-flex p-2 mr-2 mr-1 bg-transparent focus:outline-none border rounded-3xl"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {!isMobileNavOpen ? (
              <MenuIcon className="w-5 h-5" />
            ) : (
              <XIcon className="w-5 h-5" />
            )}
          </button>
        </div>
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
