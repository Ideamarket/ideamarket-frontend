import Star from '../assets/star.svg'
import StarOn from '../assets/star-on.svg'
import {
  IdeaToken,
  setIsWatching,
  useIdeaMarketsStore,
} from 'store/ideaMarketsStore'

export default function WatchingStar({ token }: { token: IdeaToken }) {
  const watching = useIdeaMarketsStore((state) => state.watching[token.address])

  function onClick(e) {
    e.stopPropagation()
    setIsWatching(token, !watching)
  }

  if (watching) {
    return (
      <button
        className="flex items-center justify-center h-12 text-base font-medium text-center text-white border-2 dark:bg-gray-500 dark:text-gray-300 rounded-lg w-30 bg-brand-blue border-brand-blue tracking-tightest-2 font-sf-compact-medium"
        onClick={onClick}
      >
        <StarOn className="w-5 mr-2 text-base font-semibold cursor-pointer fill-current text-brand-blue" />
        Watch
      </button>
    )
  } else {
    return (
      <button
        className="flex items-center justify-center h-12 text-base font-medium text-center bg-white border-2 dark:bg-gray-500 dark:text-gray-300 rounded-lg hover:bg-brand-blue hover:text-white w-30 border-brand-blue text-brand-blue tracking-tightest-2 font-sf-compact-medium"
        onClick={onClick}
      >
        <Star className="w-5 mr-2 text-base font-semibold cursor-pointer fill-current" />
        Watch
      </button>
    )
  }
}
