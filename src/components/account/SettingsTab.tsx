import { useContext } from 'react'
import { AccountContext } from 'pages/user-account'
import { VisibilityOptions } from '.'

const SettingsTab = () => {
  const { isUpdateLoading, register, getValues, setValue } =
    useContext(AccountContext)
  const { username } = getValues()

  return (
    <div className="w-full h-full lg:w-3/4">
      <div className="p-3 text-3xl font-semibold border-b border-gray-100 dark:border-gray-400">
        Profile
      </div>
      <div className="flex flex-col lg:flex-row lg:space-x-2">
        <div className="w-full">
          <div className="flex">
            <div className="lg:w-44" />
            <div className="p-3 font-bold">Account Information</div>
          </div>
          <div className="flex flex-col w-full px-3 py-2 space-y-2 rounded-lg bg-blue-50 dark:bg-gray-600">
            <div className="flex flex-col items-center justify-end lg:flex-row">
              <span className="w-full text-left lg:w-40 lg:mr-4 lg:text-right">
                Username
              </span>

              <input
                type="text"
                className="block w-full h-8 border-gray-300 rounded-md shadow-sm lg:w-60 lg:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                {...register('username')}
                onChange={(e) => {
                  if (!username) {
                    setValue('username', e.target.value)
                  }
                }}
                disabled={!!username}
              />
            </div>
            <div className="flex flex-col items-center justify-end lg:flex-row">
              <span className="w-full text-left lg:w-40 lg:mr-4 lg:text-right">
                Email Address
              </span>
              <input
                type="email"
                className="block w-full h-8 border-gray-300 rounded-md shadow-sm lg:w-60 lg:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="you@example.com"
                {...register('email')}
                disabled
              />
            </div>

            {/* <div className="flex flex-col items-center justify-end lg:flex-row">
              <span>Eth address</span>
              <input
                type="text"
                className="block w-full h-8 border-gray-300 rounded-md shadow-sm lg:w-60 lg:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                {...register('ethAddresses')}
                disabled={isUpdateLoading}
              />
            </div> */}

            <div className="flex flex-col items-center justify-end lg:flex-row">
              <span className="w-full text-left lg:w-40 lg:mr-4 lg:text-right">
                attn.to/
              </span>
              <input
                type="text"
                className="block w-full h-8 border-gray-300 rounded-md shadow-sm lg:w-60 lg:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                {...register('redirectionUrl')}
                disabled={isUpdateLoading}
              />
            </div>

            <div className="flex flex-col items-center justify-end lg:flex-row">
              <span className="w-full text-left lg:w-40 lg:mr-4 lg:text-right">
                Bio
              </span>
              <textarea
                placeholder="Bio"
                {...register('bio')}
                disabled={isUpdateLoading}
                className="w-full border-gray-300 rounded-md lg:w-60 dark:border-gray-500 dark:bg-gray-600"
              />
            </div>

            <div className="flex flex-col items-center justify-end lg:flex-row">
              <span className="w-full text-left lg:w-40 lg:mr-4 lg:text-right">
                Profile Photo
              </span>
              <input
                {...register('imageFile')}
                onChange={async (e) => setValue('imageFile', e.target.files)}
                type="file"
                accept="image/png, image/jpeg"
                disabled={isUpdateLoading}
                className="w-full lg:w-60"
              />
            </div>
          </div>
        </div>
        <VisibilityOptions />
      </div>
    </div>
  )
}

export default SettingsTab
