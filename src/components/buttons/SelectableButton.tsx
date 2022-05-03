import classNames from 'classnames'

export enum JOINED_TYPES {
  NONE, // Not joined
  L, // Joined on left
  R, // Joined on right
  T, // Joined on top
  B, // Joined on bottom
}

type Props = {
  isSelected: boolean
  onClick: (value: any) => void
  label: any
  className?: string
  joined?: JOINED_TYPES // Whether button is connected to another button on a side
  roundedSize?: string // How rounded should corners be?
}

const SelectableButton = ({
  isSelected,
  onClick,
  label,
  className,
  joined,
  roundedSize = 'md',
}: Props) => {
  const roundedStyle = () => {
    switch (joined) {
      case JOINED_TYPES.NONE:
        return ''
      case JOINED_TYPES.L:
        return `rounded-r-${roundedSize}`
      case JOINED_TYPES.R:
        return `rounded-l-${roundedSize}`
      case JOINED_TYPES.T:
        return `rounded-b-${roundedSize}`
      case JOINED_TYPES.B:
        return `rounded-t-${roundedSize}`

      default:
        return `rounded-${roundedSize}` // Round all corners by default
    }
  }

  return (
    <button
      className={classNames(
        roundedStyle(),
        className,
        'flex justify-center items-center md:px-3 p-2 text-sm font-semibold',
        {
          'text-brand-blue dark:text-white bg-blue-100 dark:bg-very-dark-blue':
            isSelected,
        },
        { 'text-black dark:text-gray-50 border': !isSelected }
      )}
      onClick={() => {
        onClick(!isSelected)
      }}
    >
      <span>{label}</span>
    </button>
  )
}

export default SelectableButton
