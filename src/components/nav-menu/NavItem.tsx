import { ChevronDownIcon } from '@heroicons/react/solid'
import classNames from 'classnames'
import { A } from 'components'
import { useRef, useState } from 'react'
import useOnClickOutside from 'utils/useOnClickOutside'

const NavItem = ({ menuItem }) => {
  const ref = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const [subSubMenus, setSubSubMenus] = useState([]) // Indexed based on subMenu.id

  useOnClickOutside(ref, () => {
    setIsOpen(false)
    setSubSubMenus([])
  })

  const onMenuItemClick = () => {
    menuItem.onClick ? menuItem.onClick() : setIsOpen(!isOpen)
  }

  return (
    <div className="relative mt-1">
      <A
        className="inline-flex px-3 py-2 text-md leading-5 transition duration-150 ease-in-out bg-transparent rounded-md cursor-pointer md:justify-center hover:text-gray-500 active:text-gray-800"
        onClick={onMenuItemClick}
        href={menuItem?.href}
      >
        <span>{menuItem.name}</span>
        {menuItem.subMenu && <ChevronDownIcon className="w-5 h-5" />}
      </A>

      {menuItem.subMenu && (
        <div
          ref={ref}
          className={classNames(
            'relative z-[300]  transition-all origin-top-right transform scale-95 text-black -translate-y-0 bg-white dropdown-menu',
            isOpen ? 'visible' : 'invisible'
          )}
        >
          <div className="absolute left-0 w-48 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none dark:divide-gray-600 dark:border-gray-700">
            {menuItem.subMenu.map(({ id, name, onClick, subSubMenu }) => (
              <A
                key={id}
                onClick={() => {
                  onClick()
                  if (subSubMenu) {
                    const temp = [...subSubMenus]
                    temp[id] = true
                    setSubSubMenus(temp)
                  } else setIsOpen(false) // Close subMenu when clicked on
                }}
                className="relative flex flex-row items-center w-full px-2 py-4 space-x-2 leading-5 transition-colors transform hover:bg-gray-100 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-900 dark:bg-gray-800"
              >
                {name}

                {subSubMenu && subSubMenus[id] && (
                  <div className="absolute top-0 -right-full w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none dark:divide-gray-600 dark:border-gray-700">
                    {subSubMenu.map(({ name, onClick }) => (
                      <div
                        key={name}
                        onClick={() => {
                          onClick()
                          setIsOpen(false)
                          setSubSubMenus([])
                        }}
                        className="flex flex-row items-center w-full px-2 py-4 space-x-2 leading-5 transition-colors transform hover:bg-gray-100 hover:cursor-pointer dark:text-gray-200 dark:hover:bg-gray-900 dark:bg-gray-800"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </A>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NavItem
