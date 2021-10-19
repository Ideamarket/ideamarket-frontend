import { DefaultLayout } from 'components'
import { createContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useMutation } from 'react-query'
import {
  accountTabs,
  AccountInnerForm,
  ProfileWallet,
} from 'components/account'
import { uploadAndUpdateProfilePhoto } from 'lib/utils/uploadProfilePhoto'
import { useForm } from 'react-hook-form'
import LoginAndLogoutButton from 'components/nav-menu/LoginAndLogoutButton'
import { SignedAddress } from 'types/customTypes'
import { useCustomSession } from 'utils/useCustomSession'
import IS_ACCOUNT_ENABLED from 'utils/isAccountEnabled'
import router from 'next/router'

export const AccountContext = createContext<any>({})

const Account = () => {
  useEffect(() => {
    if (!IS_ACCOUNT_ENABLED) {
      router.push('/')
    }
  }, [])

  const [cardTab, setCardTab] = useState(accountTabs.SETTINGS)
  const { session, loading, refetchSession } = useCustomSession()

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
        refetchSession()
        toast.dismiss()
        toast.success(data.message)
      },
      onError: (e: Error) => {
        toast.dismiss()
        toast.error(e.message)
      },
    }
  )

  const [submitWallet] = useMutation<{
    message: string
  }>(
    (signedAddress: SignedAddress) =>
      fetch('/api/submitWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signedAddress),
      }).then(async (res) => {
        if (!res.ok) {
          const response = await res.json()
          throw new Error(response.message)
        }
        return res.json()
      }),
    {
      onSuccess: () => {
        refetchSession()
      },
    }
  )

  const [removeAddress] = useMutation<{
    message: string
  }>(
    (address: string) =>
      fetch('/api/ethAddress', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: [address],
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const response = await res.json()
          throw new Error(response.message)
        }
        return res.json()
      }),
    {
      onSuccess: () => {
        refetchSession()
        toast.success('Successfully removed!!')
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
      await uploadAndUpdateProfilePhoto(imageFile[0])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

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
        {!loading && !session ? (
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
                <ProfileWallet walletState="signedOut" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Toaster />
            <form onSubmit={handleSubmit(onSubmit)}>
              <AccountInnerForm
                submitWallet={submitWallet}
                removeAddress={removeAddress}
              />
            </form>
          </>
        )}
      </div>
    </AccountContext.Provider>
  )
}

Account.layoutProps = {
  Layout: DefaultLayout,
}

export default Account
