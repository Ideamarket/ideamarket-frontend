import IdeaverifyIconBlue from '../assets/IdeaverifyIconBlue.svg'
import IdeaverifyIconLight from '../assets/IdeaverifyIconLight.svg'
import IdeaverifyIconDark from '../assets/IdeaverifyIconDark.svg'
import CrownBlack from '../assets/crown-black.svg'
import CrownWhite from '../assets/crown-white.svg'

/**
 * This method converts icon to desired version depending on current theme and whether icon is selected.
 * @param iconName name of icon that is defined by conditions in body
 * @param theme light or dark
 * @param isSelected is icon selected
 * @returns icon as DOM element
 */
export const getIconVersion = (
  iconName: string,
  theme = 'light',
  isSelected = false
): JSX.Element => {
  if (iconName === 'verify') {
    if (isSelected) return <IdeaverifyIconBlue className="w-5 h-5" />

    if (theme === 'dark') return <IdeaverifyIconLight className="w-5 h-5" />

    return <IdeaverifyIconDark className="w-5 h-5" />
  } else if (iconName === 'crown') {
    if (theme === 'dark') return <CrownWhite className="w-5 h-5" />

    return <CrownBlack className="w-5 h-5" />
  }
}
