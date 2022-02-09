import { ChevronDownIcon } from '@heroicons/react/solid'
import classNames from 'classnames'
import { A } from 'components'
import { useRef, useState } from 'react'
import useOnClickOutside from 'utils/useOnClickOutside'
import ImoNavbarTooltip from './ImoNavbarTooltip'

const NavItem = ({ menuItem }) => {
  const ref = useRef()
  const [isOpen, setIsOpen] = useState(false)

  useOnClickOutside(ref, () => setIsOpen(false))

  const onMenuItemClick = () => {
    menuItem.onClick ? menuItem.onClick() : setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <div
        className="inline-flex px-4 py-2 text-lg leading-5 text-white transition duration-150 ease-in-out bg-transparent rounded-md shadow-sm cursor-pointer md:justify-center hover:text-gray-500 active:text-gray-800"
        onClick={onMenuItemClick}
      >
        <span>{menuItem.name}</span>
        {menuItem.subMenu && <ChevronDownIcon className="w-5 h-5" />}
      </div>
      {menuItem.name === '$IMO' && <ImoNavbarTooltip />}
      {menuItem.subMenu && (
        <div
          ref={ref}
          className={classNames(
            'relative z-20 transition-all origin-top-right transform scale-95 -translate-y-0 bg-white dropdown-menu',
            isOpen ? 'visible' : 'invisible'
          )}
        >
          <div className="absolute left-0 w-48 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none dark:divide-gray-600 dark:border-gray-700">
            {menuItem.subMenu.map(({ name, onClick }) => (
              <A
                key={name}
                onClick={() => {
                  onClick()
                  setIsOpen(false)
                }}
                className="flex flex-row items-center w-full px-2 py-4 space-x-2 leading-5 transition-colors transform hover:bg-gray-100 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-900 dark:bg-gray-800"
              >
                {name}
              </A>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NavItem
