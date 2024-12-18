import Star from '../assets/star.svg'
import StarOn from '../assets/star-on.svg'
import { setIsWatching, useIdeaMarketsStore } from 'store/ideaMarketsStore'
import classNames from 'classnames'

export default function WatchingStar({
  token,
  className = '',
}: {
  token: any
  className?: any
}) {
  // Notice how we are using tokenID here to track "Starred" tokens
  const watching = useIdeaMarketsStore((state) => state.watching[token.tokenID])

  function onClick(e) {
    e.stopPropagation()
    setIsWatching(token, !watching)
  }

  if (watching) {
    return (
      <StarOn
        className={classNames(
          className,
          'w-4 cursor-pointer fill-current text-brand-gray-4 dark:text-gray-300'
        )}
        onClick={onClick}
      />
    )
  } else {
    return (
      <Star
        className={classNames(
          className,
          'w-4 cursor-pointer fill-current text-brand-blue dark:text-gray-300'
        )}
        onClick={onClick}
      />
    )
  }
}
