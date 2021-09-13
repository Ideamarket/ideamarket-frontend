import { AccountContext } from 'pages/account'
import { useContext } from 'react'
import VisibilityOptions from './VisibilityOptions'

const SettingsTab = () => {
  const { isUpdateLoading, register, getValues, setValue } =
    useContext(AccountContext)
  const { username } = getValues()

  return (
    <div className="w-full h-full lg:w-3/4">
      <div className="p-3 text-3xl font-semibold border-b border-gray-100">
        Profile
      </div>
      <div className="flex flex-col lg:flex-row lg:space-x-2">
        <div className="w-full">
          <div className="p-3 font-bold">Account Information</div>
          <div className="flex flex-col w-full px-3 py-2 space-y-2 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Username</span>

              <input
                type="text"
                className="block h-8 break-all border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                {...register('username')}
                onChange={(e) => {
                  if (!username) {
                    setValue('username', e.target.value)
                  }
                }}
                disabled={!!username}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Email Address</span>
              <input
                type="email"
                className="block h-8 break-all border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="you@example.com"
                {...register('email')}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Eth address</span>
              <input
                type="text"
                className="block h-8 break-all border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                {...register('ethAddresses')}
                disabled={isUpdateLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Redirection url</span>
              <input
                type="text"
                className="block h-8 break-all border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                {...register('redirectionUrl')}
                disabled={isUpdateLoading}
              />
            </div>

            <div className="flex justify-between">
              <span>Bio</span>
              <textarea
                placeholder="Bio"
                {...register('bio')}
                disabled={isUpdateLoading}
                className="break-all border-gray-300 rounded-md w-52 dark:border-gray-500"
              />
            </div>

            <div className="flex-col space-y-2">
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

        <VisibilityOptions />
      </div>
    </div>
  )
}

export default SettingsTab
