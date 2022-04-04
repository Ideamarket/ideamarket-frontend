export default function RatingsRowSkeleton() {
  return (
    <div>
      <div className="flex text-black">
        {/* Icon and Name */}
        <div className="w-[40%] relative pl-6 pr-10 pt-8">
          {/* <div className="absolute left-5 md:left-6 top-7 md:top-11">
            <WatchingStar token={ideaToken} />
          </div> */}

          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>

        {/* Rating By User */}
        <div className="w-[20%] pt-8">
          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>

        {/* Composite Rating */}
        {/* <div className="w-[12%] pt-12"></div> */}

        {/* Average Rating */}
        <div className="w-[20%] pt-8">
          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>

        {/* Market Interest */}
        {/* <div className="w-[12%] pt-12"></div> */}

        {/* Rate Button */}
        <div className="w-[20%] pt-8">
          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>
      </div>

      <div className="flex w-full my-4">
        <div className="w-[40%] h-20 px-6">
          <div className="bg-gray-400 w-full h-full rounded-lg animate animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
