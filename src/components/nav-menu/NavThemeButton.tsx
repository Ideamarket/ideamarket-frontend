import { SunIcon, MoonIcon } from '@heroicons/react/solid'
import useThemeMode from 'components/useThemeMode'

const NavThemeButton = () => {
  const { theme, resolvedTheme, setTheme } = useThemeMode()

  return (
    <div
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center w-10 h-10 text-blue-50"
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-blue-50" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-50" />
      )}
    </div>
  )
}

export default NavThemeButton
