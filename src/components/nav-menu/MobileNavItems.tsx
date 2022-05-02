import { Transition } from '@headlessui/react'
import A from 'components/A'
import { getNavbarConfig } from './constants'
import NavItem from './NavItem'
import NavThemeButton from './NavThemeButton'

type Props = {
  isMobileNavOpen: boolean
  user: any
}

const MobileNavItems = ({ isMobileNavOpen, user }: Props) => {
  let navbarConfig = getNavbarConfig(user)

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
          <NavItem menuItem={menuItem} key={i} />
        ))}

        <A
          className="inline-flex px-4 py-2 text-lg leading-5 text-white transition duration-150 ease-in-out bg-transparent rounded-md shadow-sm cursor-pointer md:justify-center hover:text-gray-500 active:text-gray-800"
          href={`/u/${
            user && user.username ? user.username : user?.walletAddress
          }`}
        >
          <span>My Profile</span>
        </A>

        <div className="flex px-1 mt-5">
          <NavThemeButton />
        </div>
      </div>
    </Transition>
  )
}

export default MobileNavItems
