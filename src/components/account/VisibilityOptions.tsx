import { AccountContext } from 'pages/account'
import { useContext } from 'react'

const VisibilityOptions = () => {
  const { register, isUpdateLoading } = useContext(AccountContext)
  return (
    <div className="w-full">
      <div className="p-3 font-bold">Visibility Options</div>
      <div className="flex flex-col w-full p-4 space-y-6 rounded-lg bg-blue-50 dark:bg-gray-600">
        <div className="flex items-center justify-between">
          <span>Email address</span>
          <input
            className="rounded-lg cursor-pointer"
            type="checkbox"
            {...register('displayEmail')}
            disabled={isUpdateLoading}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Bio</span>
          <input
            className="rounded-lg cursor-pointer"
            type="checkbox"
            {...register('displayBio')}
            disabled={isUpdateLoading}
          />
        </div>
        <div className="flex items-center justify-between">
          <span> ETH Addresses</span>
          <input
            className="rounded-lg cursor-pointer"
            type="checkbox"
            {...register('displayEthAddresses')}
            disabled={isUpdateLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default VisibilityOptions
