const ProfileMobileTab = ({
  isUpdateLoading,
  setEthAddresses,
  ethAddresses,
  currentSession,
  setUsername,
  username,
  displayEmail,
  bio,
  setBio,
  setDisplayHoldings,
  displayHoldings,
  setDisplayEthAddresses,
  displayEthAddresses,
  setDisplayBio,
  setDisplayEmail,
  displayBio,
  redirectionUrl,
  setRedirectionUrl,
  profilePhoto,
  setProfilePhoto,
  setImageFile,
  ref,
}) => {
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
              value={username || ''}
              onChange={(e) => {
                if (!currentSession.user.username) {
                  setUsername(e.target.value)
                }
              }}
              disabled={!!currentSession.user.username}
            />
          </div>
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Email Address</span>
            <input
              type="email"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              placeholder="you@example.com"
              value={currentSession.user.email || ''}
              disabled
            />
          </div>
          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Eth address</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              value={ethAddresses?.[0] || ''}
              onChange={(e) => {
                setEthAddresses(e.target.value)
              }}
              disabled={isUpdateLoading}
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Redirection url</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              value={redirectionUrl || ''}
              onChange={(e) => {
                setRedirectionUrl(e.target.value)
              }}
              disabled={isUpdateLoading}
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Profile photo url</span>
            <input
              type="text"
              className="block w-full h-8 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
              value={profilePhoto || ''}
              onChange={(e) => {
                setProfilePhoto(e.target.value)
              }}
              disabled={isUpdateLoading}
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <span>Bio</span>
            <textarea
              placeholder="Bio"
              value={bio || ''}
              onChange={(e) => {
                setBio(e.target.value)
              }}
              disabled={isUpdateLoading}
              className="w-full border-gray-300 rounded-md dark:border-gray-500"
            />
          </div>

          <div className="flex flex-col items-start justify-between space-y-2">
            <div className="flex items-center space-x-2">
              <label>Upload Profile Photo</label>
              <input
                onChange={async (e) => {
                  setImageFile(e.target.files[0])
                }}
                type="file"
                accept="image/png, image/jpeg"
                disabled={isUpdateLoading}
                ref={ref}
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
                checked={displayEmail || false}
                onChange={(e) => {
                  setDisplayEmail(e.target.checked)
                }}
                disabled={isUpdateLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Display Bio</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                checked={displayBio || false}
                onChange={(e) => {
                  setDisplayBio(e.target.checked)
                }}
                disabled={isUpdateLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <span> Display Eth Addresses</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                checked={displayEthAddresses || false}
                onChange={(e) => {
                  setDisplayEthAddresses(e.target.checked)
                }}
                disabled={isUpdateLoading}
              />
            </div>{' '}
            <div className="flex items-center justify-between">
              <span>Display holdings</span>
              <input
                className="rounded-lg cursor-pointer"
                type="checkbox"
                checked={displayHoldings || false}
                onChange={(e) => {
                  setDisplayHoldings(e.target.checked)
                }}
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
