import Star from '../assets/star.svg'
import StarOn from '../assets/star-on.svg'
import {
  IdeaToken,
  setIsWatching,
  useIdeaMarketsStore,
} from 'store/ideaMarketsStore'
import classNames from 'classnames'

export default function WatchingStar({
  token,
  className = '',
}: {
  token: IdeaToken
  className?: any
}) {
  const watching = useIdeaMarketsStore((state) => state.watching[token.address])

  function onClick(e) {
    e.stopPropagation()
    setIsWatching(token, !watching)
  }

  if (watching) {
    return (
      <StarOn
        className={classNames(
          className,
          'w-5 cursor-pointer fill-current text-brand-gray-4 dark:text-gray-300'
        )}
        onClick={onClick}
      />
    )
  } else {
    return (
      <Star
        className={classNames(
          className,
          'w-5 cursor-pointer fill-current text-brand-blue dark:text-gray-300'
        )}
        onClick={onClick}
      />
    )
  }
}
