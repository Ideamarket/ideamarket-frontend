import Star from '../assets/star.svg'
import StarOn from '../assets/star-on.svg'
import {
  IdeaToken,
  setIsWatching,
  useIdeaMarketsStore,
} from 'store/ideaMarketsStore'
import classNames from 'classnames'
import { useMixPanel } from 'utils/mixPanel'

export default function WatchingStar({
  token,
  className = '',
}: {
  token: IdeaToken
  className?: any
}) {
  const { mixpanel } = useMixPanel()

  // Notice how we are using tokenID here to track "Starred" tokens
  const watching = useIdeaMarketsStore((state) => state.watching[token.tokenID])

  function onClick(e) {
    e.stopPropagation()
    setIsWatching(token, !watching)

    mixpanel.track(!watching ? 'FAVOURITED_LISTING' : 'UNFAVORITED_LISTING', {
      tokenName: token.name,
      tokenAddress: token.address,
    })
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
