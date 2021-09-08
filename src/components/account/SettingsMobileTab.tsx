import { AccountContext } from 'pages/account'
import { useContext } from 'react'

const SettingsMobileTab = () => {
  const { isUpdateLoading, register, setValue, getValues } =
    useContext(AccountContext)

  const { username } = getValues()

  return (
    <>
      <div className="w-full md:hidden">
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
            <span>Bio</span>
            <textarea
              placeholder="Bio"
              {...register('bio')}
              disabled={isUpdateLoading}
              className="w-full border-gray-300 rounded-md dark:border-gray-500"
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <div className="flex items-center space-x-2">
              <label>Upload Profile Photo</label>
              <input
                {...register('imageFile')}
                onChange={async (e) => setValue('imageFile', e.target.files)}
                type="file"
                accept="image/png, image/jpeg"
                disabled={isUpdateLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsMobileTab
