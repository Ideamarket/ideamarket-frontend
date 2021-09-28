import Select, { components } from 'react-select'
import SelectTokensFormat from './SelectTokenFormat'
import { TokenListEntry } from 'store/tokenListStore'
import { useState } from 'react'
import useThemeMode from 'components/useThemeMode'

const selectStyles = {
  container: (provided) => ({
    ...provided,
    minWidth: '140px',
    width: '140px',
    border: 'none',
  }),

  control: () => ({
    borderRadius: 100,
    display: 'flex',
  }),
  indicatorSeparator: () => ({}),
  menu: (provided, state) => ({
    ...provided,
    backgroundColor: state.selectProps.isDarkMode ? '#374151' : 'white',
    color: state.selectProps.isDarkMode ? 'white' : 'black',
  }),
}

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 2,
  colors: {
    ...theme.colors,
    primary25: '#9ca3af', // text-gray-400
    primary: '#0857e0', // brand-blue
  },
})

const MenuList = (props) => {
  return (
    <components.MenuList {...props}>
      {props.selectProps.isAllTokensLoaded ? (
        props.children
      ) : (
        <div>
          {props.children.slice(0, 5)}
          <div
            onClick={() => props.selectProps.setAllTokensLoaded(true)}
            className="flex items-center justify-center h-8"
          >
            More...
          </div>
        </div>
      )}
    </components.MenuList>
  )
}

type TokenSelectProps = {
  disabled: boolean
  setSelectedToken: (token) => void
  selectTokensValues: any
  selectedIdeaToken: TokenListEntry
  selectedToken: any
}

export default function TokenSelect({
  disabled,
  setSelectedToken,
  selectTokensValues,
  selectedIdeaToken,
  selectedToken,
}: TokenSelectProps) {
  const { resolvedTheme } = useThemeMode()
  const [isAllTokensLoaded, setAllTokensLoaded] = useState(false)

  return (
    <Select
      className="w-32 text-xs font-medium bg-white border-2 border-gray-200 shadow-md cursor-pointer dark:bg-gray-700 text-brand-gray-4 trade-select rounded-2xl"
      isClearable={false}
      isSearchable={false}
      isDisabled={disabled}
      onChange={(value) => {
        setSelectedToken(value.token)
      }}
      options={selectTokensValues}
      formatOptionLabel={SelectTokensFormat}
      defaultValue={
        selectedIdeaToken
          ? { token: selectedIdeaToken }
          : { token: selectedToken, value: selectedToken.address } ||
            selectTokensValues[0]
      }
      theme={selectTheme}
      styles={selectStyles}
      components={{ MenuList }}
      // @ts-ignore
      isAllTokensLoaded={isAllTokensLoaded}
      setAllTokensLoaded={setAllTokensLoaded}
      isDarkMode={resolvedTheme === 'dark'}
    />
  )
}
