import { DefaultLayout } from '../components'
import Select from 'react-select'
import CopyIcon from '../assets/copy-check.svg'
import CopyCheck from '../assets/copy-icon.svg'
import { useState, useEffect } from 'react'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { useQuery } from 'react-query'
import { queryMarkets } from 'store/ideaMarketsStore'

export default function Embed() {
  const [selectMarketValues, setSelectMarketValues] = useState([])

  const { data: markets } = useQuery('all-markets', queryMarkets)

  const [tagName, setTagname] = useState('elonmusk')
  const [market, setMarket] = useState('twitter')
  const [ewidth] = useState('700')
  const [eheight] = useState('250')
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => {
    if (markets) {
      setSelectMarketValues(
        markets
          .filter(
            (market) =>
              getMarketSpecificsByMarketName(market.name) !== undefined &&
              getMarketSpecificsByMarketName(market.name).isEnabled()
          )
          .map((market) => ({
            value: market.name.toString().toLocaleLowerCase(),
            market: market,
          }))
      )
    } else {
      setSelectMarketValues([])
    }
  }, [markets])
  const embed = `<iframe src="https://ideamarket.io/iframe/${market}/${tagName}" width="${ewidth}" height="${eheight}"></iframe> `

  const selectMarketFormat = (entry) => <option> {entry.market.name} </option>

  const createEmbed = (event) => {
    event.preventDefault()
    setCopyDone(false)
  }

  return (
    <>
      <div className="overflow-x-hidden bg-brand-gray">
        <div className="w-screen px-6 pt-10 pb-40 mb-40 text-center text-white bg-cover md:mb-5 bg-top-mobile md:bg-top-desktop">
          <div>
            <h2 className="text-3xl md:text-6xl font-gilroy-bold">
              Tuning into what <span className="text-brand-blue">matters</span>
            </h2>
            <p className="mt-6 text-lg md:text-2xl font-sf-compact-medium">
              Allow people to voice their trust by embeding ideamarket social
            </p>
          </div>
          <div className="flex flex-col items-center justify-center mt-14 text-md md:text-3xl font-gilroy-bold md:flex-row">
            <form
              className="w-full max-w-lg"
              action="POST"
              onSubmit={createEmbed}
            >
              <div className="flex flex-wrap justify-center mb-6 -mx-3">
                <div className="w-full px-3 mb-6 md:w-1/3 md:mb-0">
                  <label
                    className="block mb-2 text-xs font-bold tracking-wide text-gray-400 uppercase"
                    htmlFor="grid-first-name"
                  >
                    Name
                  </label>
                  <input
                    className="block w-full px-4 py-2 mb-2 text-lg leading-tight text-gray-700 bg-gray-200 border rounded appearance-none focus:outline-none focus:bg-white"
                    id="tagname"
                    name="tagname"
                    type="text"
                    placeholder="naval"
                    value={tagName}
                    onChange={({ target }) => setTagname(target.value)}
                  ></input>
                </div>
                <div className="w-full px-3 md:w-1/3">
                  <label
                    className="block mb-2 text-xs font-bold tracking-wide text-gray-400 uppercase"
                    htmlFor="grid-last-name"
                  >
                    Market
                  </label>

                  <Select
                    options={selectMarketValues}
                    formatOptionLabel={selectMarketFormat}
                    className="block w-full text-lg leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
                    defaultInputValue="Twitter"
                    onChange={(entry) => {
                      setMarket((entry as any).value)
                    }}
                  />
                </div>
              </div>
              <button
                className="py-2 ml-5 -mt-2 text-lg font-bold text-white rounded-md w-44 font-sf-compact-medium bg-brand-blue hover:bg-blue-800"
                type="submit"
              >
                <div className="flex flex-row items-center justify-center">
                  <div>Generate</div>
                </div>
              </button>
            </form>
          </div>

          <div className="grid m-20 mx-5 place-content-center">
            <iframe
              src={`http://localhost:3000/iframe/${market}/${tagName}`}
              width={ewidth}
              height={eheight}
              title="preview"
            ></iframe>

            <div className="flex items-center justify-center sm:mt-24 mb:mt-0">
              <dialog
                open
                className="w-auto p-0 m-8 overflow-hidden shadow-lg rounded-2xl max-w-7xl md:mx-auto md:w-1/2 mt-52"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="mb-6 text-xl font-bold">
                          Generated code
                        </h3>

                        <button
                          className="w-8 h-8 border-gray-200 outline-none focus:outline-none hover:text-green-500 active:bg-gray-50"
                          onClick={() => {
                            setCopyDone(true)
                          }}
                        >
                          {copyDone ? (
                            <CopyIcon className="w-6 h-6" />
                          ) : (
                            <CopyCheck className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                      <div className="overflow-hidden rounded-md">
                        <textarea
                          className="w-full px-3 py-1 border border-gray-200 rounded-md resize-none focus:outline-none"
                          value={embed}
                          rows={2}
                          onChange={(e) => {
                            e.preventDefault()
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

Embed.layoutProps = {
  Layout: DefaultLayout,
}
