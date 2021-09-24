import { DefaultLayout } from 'components'
import { createContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useSession } from 'next-auth/client'
import { useMutation } from 'react-query'
import { uploadFile } from 'lib/utils/uploadFileToS3'
import {
  accountTabs,
  AccountInnerForm,
  ProfileWallet,
} from 'components/account'
import { useForm } from 'react-hook-form'
import LoginAndLogoutButton from 'components/nav-menu/LoginAndLogoutButton'

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

    if (imageFile?.length > 0) {
      await uploadFile(imageFile[0])
    }
    return updateUserSettings(values)
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
        {!loading && session === null ? (
          <div className="pt-16">
            <div className="w-11/12 mx-auto my-0 bg-white rounded-lg max-w-7xl font-inter w-90">
              <div className="flex flex-col items-start justify-center px-6 py-5 bg-white rounded-lg md:flex-row dark:bg-gray-500">
                <div className="relative flex flex-col w-full mt-2 text-center md:mr-8 md:w-1/4">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-400">
                    <div className="pb-4 text-3xl text-blue-400">Account</div>
                    <div className="text-base font-semibold">
                      Click here to log in
                    </div>
                  </div>
                  <LoginAndLogoutButton />
                </div>
                <ProfileWallet />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Toaster />
            <form onSubmit={handleSubmit(onSubmit)}>
              <AccountInnerForm />
            </form>
          </>
        )}
      </div>
    </AccountContext.Provider>
  )
}

export default Account

Account.layoutProps = {
  Layout: DefaultLayout,
}
