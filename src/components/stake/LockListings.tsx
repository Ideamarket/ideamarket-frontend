import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import { A } from 'components'
import moment from 'moment'
import { accordionData } from 'pages/stake'
import { useState } from 'react'
import { formatNumber } from 'utils'
import { LockingAccordion } from './LockingAccordion'

type Props = {
  lockingAPR: number
}

const LockListings = ({ lockingAPR }: Props) => {
  const [showLockInfo, setShowLockInfo] = useState(true)

  return (
    <div className="w-11/12 h-full bg-brand-gray flex flex-col md:flex-row justify-center m-auto space-x-4 mt-8">
      <div className="w-full md:w-1/2">
        <span className="text-5xl text-blue-600 font-gilroy-bold">
          Earn More IMO by Locking Listings
        </span>

        <div className="mt-8">
          <div
            onClick={() => setShowLockInfo(!showLockInfo)}
            className="flex justify-between items-center cursor-pointer font-bold"
          >
            <span>How does it work?</span>
            {showLockInfo ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </div>

          {showLockInfo && (
            <div className="text-gray-500 text-sm mt-1">
              To signal confidence in a listing, you can ‘lock’ tokens you own
              for a listing, restricting your ability to access them for a
              period of time. Users who lock tokens will be rewarded with IMO,
              Ideamarket’s native token, in proportion to the locked amount
              until the [DATE XX/XX/XX]. 5 million $IMO will be awarded for
              locking rewards, over the course of 3 months (until 5/2).
            </div>
          )}

          <div className="flex w-full space-x-6">
            <A href="/account" className="w-1/2">
              <button className="py-4 mt-2 rounded-2xl w-full text-white bg-brand-blue hover:bg-blue-800">
                <p className="text-md">Already hold listing tokens?</p>
                <p className="font-bold text-lg">GO TO WALLET</p>
              </button>
            </A>
            <A href="/" className="w-1/2">
              <button className="py-4 mt-2 rounded-2xl w-full text-white bg-gray-900 hover:bg-gray-600">
                <p className="text-md">Haven’t bought any listing tokens?</p>
                <p className="font-bold text-lg">GO TO MARKET</p>
              </button>
            </A>
          </div>
        </div>

        <div className="mt-8">
          <span className="text-2xl font-bold">FAQ</span>
          {accordionData.map((data) => (
            <LockingAccordion
              title={data.title}
              body={data.body}
              key={data.title}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/2">
        <div className="flex space-x-2 " style={{ height: 'fit-content' }}>
          <div className="flex flex-col justify-between border border-transparent rounded-lg p-2 text-sm">
            <div className="flex flex-col">
              <span>Locked Period</span>
              <span className="text-xs opacity-0">(x days)</span>
            </div>
            <div className="my-4">Estimated APR</div>
            <div>Redemption Date (if locked today)</div>
            <div>Next distribution date</div>
            <div>Final distribution date</div>
          </div>

          <div className="w-52 flex flex-col justify-between items-end border rounded-lg p-2">
            <div className="flex flex-col items-end">
              <span className="font-bold">1 month</span>
              <span className="text-xs">(30 days)</span>
            </div>
            <div className="text-green-500 font-bold">
              {formatNumber(lockingAPR)}%
            </div>
            <div>{moment(new Date(Date.now() + 2629800000)).format('LL')}</div>
            <div>March 2, 2022</div>
            <div>May 2, 2022</div>
          </div>

          <div className="w-52 flex flex-col justify-between items-end border rounded-lg p-2">
            <div className="flex flex-col items-end">
              <span className="font-bold">3 months</span>
              <span className="text-xs">(90 days)</span>
            </div>
            <div className="text-green-500 font-bold">
              {formatNumber(lockingAPR * 1.2)}%
            </div>
            <div>{moment(new Date(Date.now() + 7889400000)).format('LL')}</div>
            <div>March 2, 2022</div>
            <div>May 2, 2022</div>
          </div>
        </div>
        <div className=""></div>
      </div>
    </div>
  )
}

export default LockListings
