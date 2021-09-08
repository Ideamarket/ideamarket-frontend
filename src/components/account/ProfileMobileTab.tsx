const ProfileMobileTab = ({
  isUpdateLoading,
  setImageFile,
  register,
  setValue,
  getValues,
}) => {
  const { username } = getValues()

  return (
    <>
      <div className="w-full">
        <div className="p-3 font-bold">Account Information</div>
        <div className="flex flex-col w-full h-full px-3 py-2 space-y-2 bg-gray-100 rounded-lg">
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Username</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              placeholder="Username"
              {...register('username')}
              onChange={(e) => {
                if (!username) {
                  setValue('username', e.target.value)
                }
              }}
              disabled={!!username}
            />
          </div>
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Email Address</span>
            <input
              type="email"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              placeholder="you@example.com"
              {...register('email')}
              disabled
            />
          </div>
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Eth address</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              disabled={isUpdateLoading}
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Redirection url</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              {...register('redirectionUrl')}
              disabled={isUpdateLoading}
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Profile photo url</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              {...register('redirectionUrl')}
              disabled={isUpdateLoading}
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Bio</span>
            <textarea
              placeholder="Bio"
              {...register('redirectionUrl')}
              disabled={isUpdateLoading}
              className="w-full border-gray-300 rounded-md dark:border-gray-500"
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <div className="flex items-center space-x-2">
              <label>Upload Profile Photo</label>
              <input
                {...register('imageFile')}
                onChange={(e) => {
                  setValue('imageFile', e.target.files[0])
                }}
                type="file"
                accept="image/png, image/jpeg"
                disabled={isUpdateLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="p-3 font-bold">Visibility Options</div>
        <div className="flex flex-col w-full px-3 py-2 space-y-6 bg-gray-100 rounded-lg">
          <div className="flex flex-col w-full px-3 py-2 space-y-6 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Display Email</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                // {...register('displayEmail')}
                disabled={isUpdateLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Display Bio</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                // {...register('displayBio')}
                disabled={isUpdateLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <span> Display Eth Addresses</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                // {...register('displayEthAddresses')}
                disabled={isUpdateLoading}
              />
            </div>{' '}
            <div className="flex items-center justify-between">
              <span>Display holdings</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                // {...register('displayHoldings')}
                disabled={isUpdateLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileMobileTab
