import { Transition } from '@headlessui/react'
import { WalletStatus } from 'components'
import ModalService from 'components/modals/ModalService'
import WalletModal from '../wallet/WalletModal'
import { navbarConfig } from './constants'
import NavItem from './NavItem'
import NavThemeButton from './NavThemeButton'

type Props = {
  isMobileNavOpen: boolean
}

const MobileNavItems = ({ isMobileNavOpen }: Props) => {
  return (
    <Transition
      show={isMobileNavOpen}
      enter="transition ease-out duration-100 transform"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75 transform"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
      className="md:hidden"
    >
      <div className="px-2 pt-2 pb-3 space-y-3 sm:px-3">
        {navbarConfig.menu.map((menuItem, i) => (
          <NavItem menuItem={menuItem} i={i} />
        ))}
        <div className="flex px-2 mt-5">
          <WalletStatus openModal={() => ModalService.open(WalletModal)} />
        </div>
        <div className="flex px-1 mt-5">
          <NavThemeButton />
        </div>
      </div>
    </Transition>
  )
}

export default MobileNavItems
