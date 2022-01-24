import { DefaultLayout } from 'components'
import { ReactElement } from 'react'
import { BsYoutube } from 'react-icons/bs'
import { GiSharkJaws } from 'react-icons/gi'

export default function PublicProfile() {
  return (
    <div className="min-h-screen bg-brand-gray dark:bg-gray-900 font-inter">
      <div className="h-full px-4 pt-8 pb-5 text-white md:px-6 md:pt-16 bg-top-mobile md:bg-top-desktop md:h-[38rem]">
        <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
          <div className="flex text-base">
            <div
              className="flex grow px-4 py-6 bg-white/5 rounded-2xl"
              style={{
                flexGrow: 1,
              }}
            >
              <div className="flex items-center">
                <GiSharkJaws className="w-8 h-8 rounded-full bg-white/50 p-1" />
                <div className="flex flex-col ml-3">
                  <p className="font-medium text-base">
                    Baby Shark | CoComelon Nursery Rhymes & Kids Songs on{' '}
                    <BsYoutube className="text-red-700 w-6 h-6 inline-block" />
                    <span> Youtube</span>
                  </p>

                  <p className="text-brand-blue font-normal text-sm">
                    https://youtu.be/020g-0hhCAU
                  </p>
                </div>
              </div>
              <div className="flex ml-auto flex-col text-right my-auto">
                <p className="text-xs">
                  Ghost Listed by @sm1els
                  <span className="opacity-50"> 87 days ago</span>
                </p>
                <p className="text-xs">
                  Listed by @someone
                  <span className="opacity-50"> 56 days ago</span>
                </p>
              </div>
            </div>
            <button className="flex ml-6 bg-white text-gray-700 rounded-xl p-4 h-fit text-sm font-semibold	">
              Webpage Preview
            </button>
          </div>

          <div className="grid grid-cols-9 my-20">
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Rank</span>
              <span className="text-base mt-4">1</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Price</span>
              <span className="text-base mt-4">$3.10</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Votes</span>
              <span className="text-base mt-2 px-4 py-2 bg-white/10 rounded-xl">
                200
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Views</span>
              <span className="text-base mt-4">31.6k</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Deposits</span>
              <span className="text-base mt-4">$48,355</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Supply</span>
              <span className="text-base mt-4">31,082</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">Holders</span>
              <span className="text-base mt-4">14</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">24H Volume</span>
              <span className="text-base mt-4">$101.18</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm opacity-70">24H Change</span>
              <span className="text-base mt-4 text-red-600">-0.10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async (context) => {
  const { query } = context

  return {
    props: {
      tokenName: query.tokenName,
    },
  }
}

PublicProfile.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
