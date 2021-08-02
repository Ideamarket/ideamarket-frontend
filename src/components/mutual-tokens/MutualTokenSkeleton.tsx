export default function MutualTokenSkeleton() {
  return (
    <>
      <div className="overflow-hidden bg-white rounded-lg shadow animate-pulse">
        <h2 className="sr-only" id="profile-overview-title">
          Profile Overview
        </h2>
        <div className="p-6 bg-white">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="grid place-items-center lg:flex lg:space-x-5">
              <div className="flex-shrink-0 w-20 h-20 bg-gray-400 rounded-full"></div>
              <div className="grid mt-4 text-center lg:mt-0 lg:pt-1 lg:text-left place-items-center lg:place-items-start">
                <p className="h-4 bg-gray-400 rounded w-14"></p>
                <p className="h-5 mt-2 bg-gray-400 rounded w-36"></p>
                <p className="w-10 h-4 mt-2 bg-gray-400 rounded"></p>
              </div>
            </div>
            <div className="flex justify-center mt-5 lg:mt-0">
              <button className="flex items-center justify-center h-8 px-4 py-2 font-medium text-gray-700 bg-gray-400 border border-gray-300 rounded-md shadow-sm w-28"></button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 border-t border-gray-200 divide-y divide-gray-200 bg-gray-50 lg:grid-cols-2 lg:divide-y-0 lg:divide-x">
          <div className="grid px-6 py-5 text-center lg:flex lg:flex-col place-items-center">
            <span className="w-24 h-6 bg-gray-400 rounded"></span>{' '}
          </div>
          <div className="grid px-6 py-5 text-center lg:flex lg:flex-col place-items-center">
            <span className="w-24 h-6 bg-gray-400 rounded"></span>{' '}
          </div>
        </div>
      </div>
    </>
  )
}
