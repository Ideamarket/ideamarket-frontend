import classNames from 'classnames'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import { Session } from 'next-auth'
import { getSession, signIn, signOut } from 'next-auth/client'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useMutation } from 'react-query'

export default function UserAccount() {
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [redirectionUrl, setRedirectionUrl] = useState('')
  const [ethAddresses, setEthAddresses] = useState<string[]>([])
  const [displayEmail, setDisplayEmail] = useState(false)
  const [displayEthAddresses, setDisplayEthAddresses] = useState(false)
  const [displayBio, setDisplayBio] = useState(false)
  const [displayHoldings, setDisplayHoldings] = useState(false)
  const ref = useRef<HTMLInputElement>()

  const [updateUserSettings, { isLoading: isUpdateLoading }] = useMutation<{
    message: string
  }>(
    () =>
      fetch('api/userSettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          redirectionUrl,
          bio,
          profilePhoto,
          ethAddresses,
          visibilityOptions: {
            email: displayEmail,
            bio: displayBio,
            ethAddresses: displayEthAddresses,
            holdings: displayHoldings,
          },
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const response = await res.json()
          throw new Error(response.message)
        }
        return res.json()
      }),
    {
      onSuccess: (data) => {
        toast.dismiss()
        toast.success(data.message)
        getSession().then((_session) => {
          setCurrentSession(_session)
        })
      },
      onError: (e: Error) => {
        toast.dismiss()
        toast.error(e.message)
      },
    }
  )

  useEffect(() => {
    getSession().then((_session) => {
      setIsSessionLoading(false)
      setCurrentSession(_session)
      setUsername(_session?.user.username)
      setBio(_session?.user.bio)
      setProfilePhoto(_session?.user.profilePhoto)
      setRedirectionUrl(_session?.user.redirectionUrl)
      setEthAddresses(_session?.user.ethAddresses)
      setDisplayEmail(_session?.user.visibilityOptions?.email)
      setDisplayBio(_session?.user.visibilityOptions?.bio)
      setDisplayEthAddresses(_session?.user.visibilityOptions?.ethAddresses)
      setDisplayHoldings(_session?.user.visibilityOptions?.holdings)
    })
  }, [])

  if (isSessionLoading) {
    return <p>loading...</p>
  }

  if (!currentSession) {
    return (
      <div className="p-10 flex flex-col space-y-10">
        <div className="flex">
          <p>Not Signed in.</p> <br />
          <button
            onClick={() => {
              signIn()
            }}
            className="bg-brand-blue text-white px-4 py-2 rounded ml-auto"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 flex flex-col space-y-10">
      <div className="flex">
        <div>
          <p>
            Signed in as <b>{currentSession.user.email}</b>
          </p>{' '}
        </div>
        <button
          onClick={() => {
            signOut()
          }}
          className="bg-brand-blue text-white px-4 py-2 rounded ml-auto"
        >
          Sign out
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold underline text-center">
          User Profile
        </h2>
      </div>

      <Toaster />

      <form
        onSubmit={async (e) => {
          toast.loading('Saving user settings')
          e.preventDefault()
          if (imageFile) {
            const uploadedUrl = await uploadFile(imageFile)
            if (uploadedUrl) {
              setProfilePhoto(uploadedUrl)
            } else {
              toast.error('Profile photo upload failed')
            }
          }
          updateUserSettings()
          setImageFile('')
          ref.current.value = ''
        }}
        className="flex flex-col space-y-2 max-w-xl"
      >
        <h2 className="text-lg font-bold underline">User Settings</h2>
        <div className="flex items-center">
          <label>Username</label>
          <input
            className="ml-auto w-2/3"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              if (!currentSession.user.username) {
                setUsername(e.target.value)
              }
            }}
            disabled={!!currentSession.user.username}
          />
        </div>
        <div className="flex items-center">
          <label>Redirection Url</label>
          <input
            className="ml-auto w-2/3"
            type="text"
            placeholder="Redirection Url"
            value={redirectionUrl}
            onChange={(e) => {
              setRedirectionUrl(e.target.value)
            }}
            disabled={isUpdateLoading}
          />
        </div>
        <div className="flex items-center">
          <label>Bio</label>
          <input
            className="ml-auto w-2/3"
            type="text"
            placeholder="Bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value)
            }}
            disabled={isUpdateLoading}
          />
        </div>
        <div className="flex items-center">
          <label>Eth Address</label>
          <input
            className="ml-auto w-2/3"
            type="text"
            placeholder="Eth Address"
            value={ethAddresses}
            onChange={(e) => {
              const addresses: string[] = []
              addresses.push(e.target.value)
              setEthAddresses(addresses)
            }}
            disabled={isUpdateLoading}
          />
        </div>
        <div className="flex items-center">
          <label>Profile Photo Url</label>
          <input
            className="ml-auto w-2/3"
            type="text"
            placeholder="Profile Photo"
            value={profilePhoto}
            onChange={(e) => {
              setProfilePhoto(e.target.value)
            }}
            disabled={isUpdateLoading}
          />
        </div>
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
        <div className="flex-col space-y-2">
          <h3 className="font-bold underline">Visibility Options</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="display_email"
              checked={displayEmail}
              onChange={(e) => {
                setDisplayEmail(e.target.checked)
              }}
              disabled={isUpdateLoading}
            />
            <label htmlFor="display_email"> Display Email</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="display_bio"
              checked={displayBio}
              onChange={(e) => {
                setDisplayBio(e.target.checked)
              }}
              disabled={isUpdateLoading}
            />
            <label htmlFor="display_bio"> Display Bio</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="display_eth_addresses"
              checked={displayEthAddresses}
              onChange={(e) => {
                setDisplayEthAddresses(e.target.checked)
              }}
              disabled={isUpdateLoading}
            />
            <label htmlFor="display_eth_addresses">
              {' '}
              Display Eth Addresses
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="display_holdings"
              checked={displayHoldings}
              onChange={(e) => {
                setDisplayHoldings(e.target.checked)
              }}
              disabled={isUpdateLoading}
            />
            <label htmlFor="display_holdings"> Display Holdings</label>
          </div>
        </div>
        <div className="flex items-center">
          <button
            className={classNames(
              'bg-brand-blue text-white px-4 py-2 rounded ml-auto',
              isUpdateLoading ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
            type="submit"
            disabled={isUpdateLoading}
          >
            {isUpdateLoading ? <p>Saving...</p> : <p>Update</p>}
          </button>
        </div>
      </form>
    </div>
  )
}
