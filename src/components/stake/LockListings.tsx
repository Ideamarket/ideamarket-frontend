import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid"
import { A } from "components"
import moment from "moment"
import { useState } from "react"
import { LockingAccordion } from "./LockingAccordion"


const LockListings = () => {
  const [showLockInfo, setShowLockInfo] = useState(true)

  const accordionData = [
    {
      title: 'What even is IMO?',
      body: 'test',
    },
    {
      title: 'How\'s it distributed?',
      body: 'test',
    },
    {
      title: 'How can I maximize my rewards?',
      body: 'test',
    },
    {
      title: 'idk smth',
      body: 'test',
    },
  ]

  return (
    <div className="w-1/2 h-full bg-brand-gray flex justify-center">
      <div className="mt-8 w-2/3">
        <span className="text-5xl text-blue-600 font-gilroy-bold">Earn More IMO by Locking Listings</span>

        <div className="bg-green-400 flex justify-center items-center space-x-4 p-4 mt-8 rounded-lg text-white font-gilroy-bold">
          <div className="leading-4 mt-2">
            <div>CURRENT</div>
            <div className="text-3xl text-right">APR</div>
          </div>
          <div className="text-6xl">4232%</div>
        </div>

        <div className="flex space-x-2 mt-8">
          <div className="flex flex-col justify-between border border-transparent rounded-lg p-2 text-sm">
            <div className="flex flex-col">
              <span>Locked Period</span>
              <span className="text-xs opacity-0">(x days)</span>
            </div>
            <div className="my-4">Estimated APR</div>
            <div>Redemption Date (if locked today)</div>
          </div>

          <div className="w-52 flex flex-col justify-between items-end border rounded-lg p-2">
            <div className="flex flex-col items-end">
              <span className="font-bold">1 month</span>
              <span className="text-xs">(30 days)</span>
            </div>
            <div className="text-green-500 font-bold">12%</div>
            <div>{moment(new Date(Date.now() + 2629800000)).format('LL')}</div>
          </div>

          <div className="w-52 flex flex-col justify-between items-end border rounded-lg p-2">
            <div className="flex flex-col items-end">
              <span className="font-bold">3 months</span>
              <span className="text-xs">(90 days)</span>
            </div>
            <div className="text-green-500 font-bold">22%</div>
            <div>{moment(new Date(Date.now() + 7889400000)).format('LL')}</div>
          </div>
        </div>

        <div className="mt-8">
          <div
            onClick={() => setShowLockInfo(!showLockInfo)}
            className="flex justify-between items-center cursor-pointer font-bold"
          >
            <span>
              How can I lock listings?
            </span>
            {showLockInfo ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </div>

          {showLockInfo && (
            <div className="text-gray-500 text-sm mt-1">
              Dolor, in tempus tempor leo diam aenean auctor nibh. Laoreet
              quisque sed ornare morbi venenatis condimentum. Condimentum
              phasellus volutpat tellus ipsum pulvinar sed ut viverra tellus.
              Faucibus vel, lacinia congue nec, lacus non risus, dui senectus.
              Rhoncus justo, massa et habitasse amet pharetra habitasse
              venenatis.
            </div>
          )}

          <A href="/account">
            <button className="py-4 mt-2 rounded-2xl w-full text-white bg-brand-blue hover:bg-blue-800 font-bold">
              GO TO WALLET
            </button>
          </A>
        </div>

        <div className="mt-8">
          <span className="text-2xl font-bold">FAQ</span>
          {accordionData.map((data) => (
            <LockingAccordion title={data.title} body={data.body} key={data.title} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default LockListings
