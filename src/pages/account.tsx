import { DefaultLayout } from 'components'
import { createContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useSession } from 'next-auth/client'
import { useMutation } from 'react-query'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import { accountTabs, AccountInnerForm } from 'components/account'
import { useForm } from 'react-hook-form'
import router from 'next/router'

export const AccountContext = createContext<any>({})

const Account = () => {
  const [cardTab, setCardTab] = useState(accountTabs.SETTINGS)
  const [session, loading] = useSession()

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
    if (session?.user) {
      const { user } = session
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
  }, [session, reset])

  useEffect(() => {
    if (!loading && session === null) {
      router.push('/')
    }
  }, [session, loading])

  if (loading) {
    return <p>loading...</p>
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
