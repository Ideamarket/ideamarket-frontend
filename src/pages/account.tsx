import { DefaultLayout } from 'components'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { getSession, signIn } from 'next-auth/client'
import { Session } from 'next-auth'
import { useMutation } from 'react-query'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import AccountMobile from 'components/account/AccountMobile'
import AccountDesktop from 'components/account/AccountDesktop'
import { accountTabs } from 'components/account/constants'
import { useForm } from 'react-hook-form'

const Account = () => {
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [imageFile, setImageFile] = useState(null)
  const [cardTab, setCardTab] = useState(accountTabs.SETTINGS)

  useEffect(() => {
    getSession().then((session) => {
      setIsSessionLoading(false)
      setCurrentSession(session)
    })
  }, [])

  const [updateUserSettings, { isLoading: isUpdateLoading }] = useMutation<{
    message: string
  }>(
    (data: any) =>
      fetch('/api/userSettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

        // update values from server
      },
      onError: (e: Error) => {
        toast.dismiss()
        toast.error(e.message)
      },
    }
  )

  const onSubmit = async (data) => {
    const { username, ethAddresses, bio, redirectionUrl } = data

    const values: any = {
      username,
      redirectionUrl,
      bio,
      ethAddresses,
      visibilityOptions: {
        email: data.displayEmail,
        bio: data.displayBio,
        ethAddresses: data.displayEthAddresses,
        holdings: data.displayHoldings,
      },
    }
    toast.loading('Saving user settings')

    if (data?.imageFile) {
      const uploadedFilePath = await uploadFile(imageFile)
      if (uploadedFilePath) {
        return updateUserSettings({
          ...values,
          profilePhotoFilePath: uploadedFilePath,
        })
      }
      return toast.error('Profile photo upload failed')
    }

    updateUserSettings(values)
    setValue('imageFile', '')
  }

  const { register, handleSubmit, setValue, getValues, reset } = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    if (currentSession?.user) {
      const { user } = currentSession
      const { visibilityOptions } = user

      reset({
        bio: user.bio,
        ethAddresses: user.ethAddresses,
        redirectionUrl: user.redirectionUrl,
        username: user.username,
        profilePhoto: user.profilePhoto,
        email: user.email,
        displayEmail: visibilityOptions?.email,
        displayEthAddresses: visibilityOptions?.ethAddresses,
        displayBio: visibilityOptions?.bio,
        displayHoldings: visibilityOptions?.holdings,
      })
    }
  }, [currentSession, reset])

  const settingsProps = {
    isUpdateLoading,
    cardTab,
    setCardTab,
    imageFile,
    setImageFile,
    register,
    getValues,
    setValue,
  }

  if (isSessionLoading) {
    return <p>loading...</p>
  }

  if (!currentSession?.user) {
    return (
      <div className="flex flex-col p-10 space-y-10">
        <div className="flex">
          <p>Not Signed in.</p> <br />
          <button
            onClick={() => signIn()}
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <AccountDesktop {...settingsProps} />
        <AccountMobile {...settingsProps} />
      </form>
    </div>
  )
}

export default Account

Account.layoutProps = {
  Layout: DefaultLayout,
}
