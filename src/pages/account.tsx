import { DefaultLayout } from 'components'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { getSession, signIn } from 'next-auth/client'
import { Session } from 'next-auth'
import { useMutation } from 'react-query'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import AccountMobile from 'components/account/AccountMobile'
import AccountDesktop from 'components/account/AccountDesktop'
import { accountTabs } from 'components/account/constants'

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
  const [cardTab, setCardTab] = useState(accountTabs.SETTINGS)

  const ref = useRef<HTMLInputElement>()

  useEffect(() => {
    getSession().then((_session) => {
      console.log(_session)
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

  const onFormSubmit = async (e) => {
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

    if (ref?.current) {
      ref.current.value = ''
    }
  }

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
    ref,
    cardTab,
    updateUserSettings,
    setCardTab,
    imageFile,
    setImageFile,
    setFilePath,
    uploadFile,
    onFormSubmit,
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
      <Toaster />
      <AccountDesktop {...settingsProps} />
      <AccountMobile {...settingsProps} />
    </div>
  )
}

export default Account

Account.layoutProps = {
  Layout: DefaultLayout,
}
