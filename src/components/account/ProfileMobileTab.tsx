const ProfileMobileTab = ({ visibilityOptions }) => {
  return (
    <>
      <div className="w-full">
        <div className="p-3 font-bold">Account Information</div>
        <div className="flex flex-col w-full h-full px-3 py-2 space-y-2 bg-gray-100 rounded-lg">
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Password</span>
            <div className="space-y-2">
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                className="block w-full h-8 p-3 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Current Password"
              />
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                className="block w-full h-8 p-3 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="New Password"
              />
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                className="block w-full h-8 p-3 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Confirm Password"
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Bio</span>
            <textarea className="w-full border-gray-300 rounded-md dark:border-gray-500" />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="p-3 font-bold">Visibility Options</div>
        <div className="flex flex-col w-full px-3 py-2 space-y-6 bg-gray-100 rounded-lg">
          {visibilityOptions.map((option) => {
            return (
              <div
                className="flex items-center justify-between"
                key={option.value}
              >
                <span>{option.label}</span>
                <input
                  type="checkbox"
                  id={`checkbox-${option.value}`}
                  className="rounded-lg cursor-pointer"
                  checked={option.isVisible}
                  onChange={(e) => {}}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default ProfileMobileTab
