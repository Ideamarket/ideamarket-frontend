import { DefaultLayout } from 'components'
import { createContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { getSession, signIn } from 'next-auth/client'
import { Session } from 'next-auth'
import { useMutation } from 'react-query'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import AccountInnerForm from 'components/account/AccountInnerForm'
import { accountTabs } from 'components/account/constants'
import { useForm } from 'react-hook-form'

export const AccountContext = createContext<any>({})

const Account = () => {
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [cardTab, setCardTab] = useState(accountTabs.SETTINGS)

  const getAndSaveSession = () =>
    getSession().then((session) => {
      setIsSessionLoading(false)
      setCurrentSession(session)
    })

  useEffect(() => {
    getAndSaveSession()
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
        getAndSaveSession()

        // update values from server
      },
      onError: (e: Error) => {
        toast.dismiss()
        toast.error(e.message)
      },
    }
  )

  const onSubmit = async (data) => {
    const { username, ethAddresses, bio, redirectionUrl, imageFile } = data

    const values: any = {
      username,
      redirectionUrl,
      bio,
      ethAddresses,
      visibilityOptions: {
        email: data.displayEmail,
        bio: data.displayBio,
        ethAddresses: data.displayEthAddresses,
      },
    }
    toast.loading('Saving user settings')

    const newValues =
      imageFile?.length > 0
        ? { ...values, profilePhotoFilePath: await uploadFile(imageFile[0]) }
        : values

    return updateUserSettings(newValues)
  }

  const { register, handleSubmit, setValue, getValues, reset } = useForm()

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
      })
    }
  }, [currentSession, reset])

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

  const contextProps = {
    cardTab,
    setCardTab,
    isUpdateLoading,
    register,
    getValues,
    setValue,
  }

  return (
    <AccountContext.Provider value={contextProps}>
      <div className="min-h-screen bg-top-desktop-new">
        <Toaster />
        <form onSubmit={handleSubmit(onSubmit)}>
          <AccountInnerForm />
        </form>
      </div>
    </AccountContext.Provider>
  )
}

export default Account

Account.layoutProps = {
  Layout: DefaultLayout,
}
