import classNames from 'classnames'
import A from 'components/A'
import { AccountContext } from 'pages/account'
import { useContext } from 'react'
import { accountTabs } from './constants'

const TabSwitcher = ({ hasSpaceBetween }) => {
  const { cardTab, setCardTab } = useContext(AccountContext)

  return (
    <div className="flex justify-between w-full md:w-auto space-between md:block">
      <A
        className={classNames(
          'italic cursor-pointer',
          cardTab === accountTabs.SETTINGS ? 'text-blue-400' : ' text-white'
        )}
        onClick={() => setCardTab(accountTabs.SETTINGS)}
      >
        Settings
      </A>
      <A
        className={classNames(
          `italic cursor-pointer ${hasSpaceBetween ? `ml-8` : ''}`,
          cardTab === accountTabs.PROFILE ? 'text-blue-400' : ' text-white'
        )}
        onClick={() => setCardTab(accountTabs.PROFILE)}
      >
        Profile
      </A>
    </div>
  )
}

export default TabSwitcher
