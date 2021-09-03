const SettingsTab = ({ visibilityOptions }) => {
  return (
    <div className="w-3/4 h-full">
      <div className="p-3 text-3xl font-semibold border-b border-gray-100">
        Profile
      </div>
      <div className="flex space-x-2">
        <div className="w-full">
          <div className="p-3 font-bold">Account Information</div>
          <div className="flex flex-col w-full h-full px-3 py-2 space-y-2 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Email Address</span>
              <input
                type="email"
                name="email"
                id="email"
                className="block h-8 border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="you@example.com"
              />
            </div>
            <div className="flex justify-between">
              <span>Password</span>
              <div className="space-y-2">
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  className="block h-8 p-3 border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Current Password"
                />
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  className="block h-8 p-3 border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="New Password"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="block h-8 p-3 border-gray-300 rounded-md shadow-sm w-52 sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <span>Bio</span>
              <textarea className="border-gray-300 rounded-md w-52 dark:border-gray-500" />
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
      </div>
    </div>
  )
}

export default SettingsTab
