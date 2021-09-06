import { DefaultLayout, Footer } from 'components'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ProfileTab from 'components/account/ProfileTab'
import toast, { Toaster } from 'react-hot-toast'
import { getSession, signIn, signOut } from 'next-auth/client'
import SettingsTab from 'components/account/SettingsTab'
import TabSwitcher from 'components/account/TabSwitcher'
import { Session } from 'next-auth'
import { useMutation } from 'react-query'
import classNames from 'classnames'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import ProfileMobileTab from 'components/account/ProfileMobileTab'

const tabs = {
  SETTINGS: 'SETTINGS',
  PROFILE: 'PROFILE',
}

const Account = () => {
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [filePath, setFilePath] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [redirectionUrl, setRedirectionUrl] = useState('')
  const [ethAddresses, setEthAddresses] = useState<string[]>([])
  const [displayEmail, setDisplayEmail] = useState(false)
  const [displayEthAddresses, setDisplayEthAddresses] = useState(false)
  const [displayBio, setDisplayBio] = useState(false)
  const [displayHoldings, setDisplayHoldings] = useState(false)

  const [cardTab, setCardTab] = useState(tabs.SETTINGS)

  const ref = useRef<HTMLInputElement>()

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

  const [updateUserSettings, { isLoading: isUpdateLoading }] = useMutation<{
    message: string
  }>(
    () =>
      fetch('/api/userSettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          redirectionUrl,
          bio,
          profilePhotoFilePath: filePath,
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
      },
      onError: (e: Error) => {
        toast.dismiss()
        toast.error(e.message)
      },
    }
  )

  const settingsProps = {
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
  }

  if (isSessionLoading) {
    return <p>loading...</p>
  }

  if (!currentSession) {
    return (
      <div className="flex flex-col p-10 space-y-10">
        <div className="flex">
          <p>Not Signed in.</p> <br />
          <button
            onClick={() => {
              signIn()
            }}
            className="px-4 py-2 ml-auto text-white rounded bg-brand-blue"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-top-desktop-new">
      <form
        onSubmit={async (e) => {
          toast.loading('Saving user settings')
          e.preventDefault()
          if (imageFile) {
            const uploadedFilePath = await uploadFile(imageFile)
            if (uploadedFilePath) {
              setFilePath(uploadedFilePath)
            } else {
              toast.error('Profile photo upload failed')
            }
          }
          updateUserSettings()
          setImageFile('')
          ref.current.value = ''
        }}
        className="flex flex-col max-w-xl space-y-2"
      >
        <Toaster />

        <div className="flex-col items-center justify-center hidden w-screen pt-12 margin md:flex font-inter">
          <div className="flex flex-col items-end w-3/4 mb-2">
            <div className="mb-4 text-4xl italic text-white">My Account</div>
            <div>
              <TabSwitcher
                cardTab={cardTab}
                setCardTab={setCardTab}
                tabs={tabs}
                hasSpaceBetween
              />
            </div>
          </div>
          <div className="relative flex items-start justify-center w-4/5 px-6 py-5 bg-white rounded-lg h-3/5">
            <div className="relative flex flex-col w-1/4 mt-16 mr-8 text-center">
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full -top-24 left-1/2 w-36 h-36">
                <Image
                  src={profilePhoto || '/gray.svg'}
                  alt="token"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs text-blue-400">USERNAME</div>
                <div className="text-3xl font-semibold">{username ?? ''}</div>
              </div>
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
                <div>{currentSession.user.email}</div>
              </div>
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs text-blue-400">ETH ADDRESS</div>
                <div>{ethAddresses?.[0] ?? ''}</div>
              </div>
              <div>
                <div className="p-3 text-xs text-blue-400">BIO</div>
                <div className="leading-5">{bio ?? ''}</div>
              </div>

              <button
                type="submit"
                className="py-2 m-3 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
              >
                {isUpdateLoading ? <p>Saving...</p> : <p> Save Profile</p>}
              </button>

              <button
                onClick={() => {
                  signOut()
                }}
                className="px-4 py-2 ml-auto text-white rounded bg-brand-blue"
              >
                Sign out
              </button>
            </div>
            {cardTab === tabs.SETTINGS && <SettingsTab {...settingsProps} />}
            {cardTab === tabs.PROFILE && <ProfileTab />}
          </div>
          <div className="w-3/4 mt-16 text-white">
            <Footer />
          </div>
        </div>

        <div className="flex flex-col items-center justify-start w-screen py-24 bg-top-desktop-new md:hidden font-inter">
          <div className="flex justify-between w-5/6 px-2 text-white">
            <TabSwitcher
              cardTab={cardTab}
              setCardTab={setCardTab}
              tabs={tabs}
              hasSpaceBetween={false}
            />
          </div>
          <div className="relative flex flex-col items-center justify-center w-5/6 px-6 pt-20 pb-5 text-center bg-white rounded-lg">
            <div className="absolute rounded-full -top-16 w-36 h-36">
              <Image
                src={'/gray.svg'}
                alt="token"
                layout="fill"
                objectFit="contain"
                className="rounded-full"
              />
            </div>
            <div className="w-full py-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">USERNAME</div>
              <div className="text-3xl font-semibold">
                {currentSession.user.username || ''}
              </div>
            </div>
            <div className="w-full py-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">BIO</div>
              <div className="text-lg leading-5">{bio ?? ''}</div>
            </div>
            <div className="w-full py-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">EMAIL ADDRESS</div>
              <div className="text-lg">{currentSession.user.email || ''}</div>
            </div>
            <div className="w-full py-3 border-b border-gray-100">
              <div className="text-xs text-blue-400">ETH ADDRESS</div>
              <div className="text-lg">{ethAddresses?.[0] || ''}</div>
            </div>

            {cardTab === tabs.SETTINGS && (
              <ProfileMobileTab {...settingsProps} />
            )}
            {cardTab === tabs.PROFILE && <ProfileTab />}

            <button
              className={classNames(
                'bg-brand-blue text-white px-4 py-2  ml-auto rounded-lg ',
                isUpdateLoading ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
              type="submit"
              disabled={isUpdateLoading}
            >
              Save Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Account

Account.layoutProps = {
  Layout: DefaultLayout,
}
