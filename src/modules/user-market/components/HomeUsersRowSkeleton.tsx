export default function HomeUsersRowSkeleton({
  getColumn,
}: {
  getColumn: (column: string) => any
}) {
  return (
    <div>
      <div className="flex text-black">
        {/* Minter and listing content */}
        <div className="w-[40%] relative pl-6 pr-10 pt-8">
          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>

        {/* Average Rating */}
        <div className="w-[20%] pt-8">
          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>

        {/* Latest comment count */}
        <div className="w-[20%] pt-8">
          <div className="bg-gray-400 w-20 h-20 rounded-lg animate animate-pulse"></div>
        </div>

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
