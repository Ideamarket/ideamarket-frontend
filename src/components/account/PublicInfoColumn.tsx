import Image from 'next/image'

const PublicInfoColumn = ({ userData }) => {
  const verifiedAddresses = userData?.ethAddresses?.filter(
    (item) => item?.verified
  )

  return (
    <div className="relative flex flex-col w-full mt-16 text-center lg:mr-8 lg:w-1/4">
      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full -top-24 left-1/2 w-28 h-28 sm:w-36 sm:h-36">
        <Image
          src={userData?.profilePhoto || '/gray.svg'}
          alt="token"
          layout="fill"
          objectFit="contain"
          className="rounded-full"
        />
      </div>

      <div className="p-3 border-b border-gray-100 dark:border-gray-400">
        <div className="text-xs text-blue-400">USERNAME</div>
        <div className="font-semibold">{userData?.username ?? ''}</div>
      </div>
      {userData?.email && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-400">
          <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
          <div>{userData?.email}</div>
        </div>
      )}
      {verifiedAddresses?.length > 0 && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-400">
          <div className="flex items-center justify-center">
            <div className="mr-2 text-xs text-blue-400">ETH ADDRESS</div>
          </div>
          <div className="">
            {verifiedAddresses?.map(({ address }, index) => (
              <div
                key={`${address}-${index}`}
                className="flex items-center justify-center"
              >
                <p className="ml-2">
                  {address.substr(
                    0,
                    address.length > 16 ? 16 : address.length
                  ) + (address.length > 16 ? '...' : '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {userData?.bio && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-400">
          <div className="mr-2 text-xs text-blue-400">BIO</div>
          <div className="leading-5">{userData?.bio || ''}</div>
        </div>
      )}
    </div>
  )
}

export default PublicInfoColumn
