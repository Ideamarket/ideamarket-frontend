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
        className="w-20 py-1 mt-2 text-sm font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
        onClick={onClick}
      >
        <StarOn className="w-5 cursor-pointer fill-current text-brand-blue  font-semibold text-base " />
        Watch
      </button>
    )
  } else {
    return (
      <button
        className="w-20 py-1 mt-2 text-sm font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
        onClick={onClick}
      >
        <Star className="w-5 cursor-pointer fill-current text-brand-blue  font-semibold text-base " />
        Watch
      </button>
    )
  }
}
