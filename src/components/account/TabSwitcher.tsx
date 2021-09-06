import classNames from 'classnames'
import A from 'components/A'

const TabSwitcher = ({ setCardTab, tabs, cardTab, hasSpaceBetween }) => {
  return (
    <>
      <A
        className={classNames(
          'italic cursor-pointer',
          cardTab === tabs.SETTINGS ? 'text-blue-400' : ' text-white'
        )}
        onClick={() => setCardTab(tabs.SETTINGS)}
      >
        Settings
      </A>
      <A
        className={classNames(
          `italic cursor-pointer ${hasSpaceBetween ? `ml-8` : ''}`,
          cardTab === tabs.PROFILE ? 'text-blue-400' : ' text-white'
        )}
        onClick={() => setCardTab(tabs.PROFILE)}
      >
        Profile
      </A>
    </>
  )
}

export default TabSwitcher
