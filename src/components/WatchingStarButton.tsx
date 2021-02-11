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
        className="flex justify-center items-center w-30 h-12 text-base font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue tracking-tightest-2 font-sf-compact-medium text-center"
        onClick={onClick}
      >
        <StarOn className="w-5 cursor-pointer fill-current text-brand-blue  font-semibold text-base mr-2" />
        Watch
      </button>
    )
  } else {
    return (
      <button
        className="flex justify-center items-center w-30 h-12 text-base font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue tracking-tightest-2 font-sf-compact-medium text-center"
        onClick={onClick}
      >
        <Star className="w-5 cursor-pointer fill-current text-brand-blue  font-semibold text-base mr-2" />
        Watch
      </button>
    )
  }
}
