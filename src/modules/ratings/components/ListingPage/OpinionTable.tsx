import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
import { A } from 'components'
import { convertAccountName } from 'lib/utils/stringUtil'

type Props = {
  opinionPairs: any[]
  setNameSearch: (value: string) => void
}

const OpinionTable = ({
  opinionPairs,
  setNameSearch,
}: Props) => {

  return (
    <div className="rounded-lg w-full max-w-304 shadow-lg">
      {/* Table header */}
      <div className="rounded-lg bg-black/[.02] flex items-center w-full h-16 text-black/[.5] font-semibold text-xs">

        <div className="w-[26%] pl-3">
          <span>USER</span>
        </div>

        <div className="w-[14%]">RATING</div>

        <div className="w-[60%] flex items-center pr-3">
          <span>COMMENT</span>
          <div className="flex w-2/6 h-full ml-auto">
            <OverviewSearchbar onNameSearchChanged={(value) => setNameSearch(value)} />
          </div>
        </div>

      </div>

      <div className="divide-y-4">
        {opinionPairs?.map((opinion, oIndex) => {

          return (
            <div className="bg-white h-min min-h-[5rem] py-4 flex items-start w-full text-black" key={oIndex}>
              <div className="w-[26%] flex items-center pl-3">
                <A
                  className="underline font-bold hover:text-blue-600"
                  href={`https://arbiscan.io/address/${opinion?.author}`}
                >
                  {convertAccountName(opinion?.author)}
                </A>
              </div>

              <div className="w-[14%] text-blue-500 font-semibold">{opinion?.rating}</div>

              <div className="w-[60%] flex items-center pr-3">
                {opinion?.comment && (
                  <div className="w-full px-3 py-2 bg-black/[.02] rounded-lg">
                    {opinion?.comment}
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}

export default OpinionTable
