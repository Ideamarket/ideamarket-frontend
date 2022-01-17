import { DefaultLayout } from 'components'
import { createContext, ReactElement, useEffect, useState } from 'react'
import { /*toast,*/ Toaster } from 'react-hot-toast'
// import { useMutation } from 'react-query'
import { accountTabs, ProfileWallet } from 'components/account'
// import { uploadAndUpdateProfilePhoto } from 'lib/utils/uploadProfilePhoto'
import { useForm } from 'react-hook-form'
// import { SignedAddress } from 'types/customTypes'
import { useCustomSession } from 'utils/useCustomSession'
import ProfileGeneralInfo from 'components/account/ProfileGeneralInfo'

export const AccountContext = createContext<any>({})

const Account = () => {
  const [cardTab, setCardTab] = useState(accountTabs.SETTINGS)
  const { session, loading /*refetchSession*/ } = useCustomSession()

  // const [updateUserSettings, { isLoading: isUpdateLoading }] = useMutation<{
  //   message: string
  // }>(
  //   (data: any) =>
  //     fetch('/api/userSettings', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data),
  //     }).then(async (res) => {
  //       if (!res.ok) {
  //         const response = await res.json()
  //         throw new Error(response.message)
  //       }
  //       return res.json()
  //     }),
  //   {
  //     onSuccess: (data) => {
  //       refetchSession()
  //       toast.dismiss()
  //       toast.success(data.message)
  //     },
  //     onError: (e: Error) => {
  //       toast.dismiss()
  //       toast.error(e.message)
  //     },
  //   }
  // )

  // const [submitWallet] = useMutation<{
  //   message: string
  // }>(
  //   (signedAddress: SignedAddress) =>
  //     fetch('/api/submitWallet', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(signedAddress),
  //     }).then(async (res) => {
  //       if (!res.ok) {
  //         const response = await res.json()
  //         throw new Error(response.message)
  //       }
  //       return res.json()
  //     }),
  //   {
  //     onSuccess: () => {
  //       refetchSession()
  //     },
  //   }
  // )

  // const [removeAddress] = useMutation<{
  //   message: string
  // }>(
  //   (address: string) =>
  //     fetch('/api/ethAddress', {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         addresses: [address],
  //       }),
  //     }).then(async (res) => {
  //       if (!res.ok) {
  //         const response = await res.json()
  //         throw new Error(response.message)
  //       }
  //       return res.json()
  //     }),
  //   {
  //     onSuccess: () => {
  //       refetchSession()
  //       toast.success('Successfully removed!!')
  //     },
  //   }
  // )

  // const onSubmit = async (data) => {
  //   const { username, ethAddresses, bio, redirectionUrl, imageFile } = data

  //   const values: any = {
  //     username,
  //     redirectionUrl,
  //     bio,
  //     ethAddresses,
  //     visibilityOptions: {
  //       email: data.displayEmail,
  //       bio: data.displayBio,
  //       ethAddresses: data.displayEthAddresses,
  //     },
  //   }
  //   toast.loading('Saving user settings')

  //   if (imageFile?.length > 0) {
  //     await uploadAndUpdateProfilePhoto(imageFile[0])
  //   }
  //   return updateUserSettings(values)
  // }

  const { register, /*handleSubmit,*/ setValue, getValues, reset } = useForm()

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
    isUpdateLoading: false,
    register,
    getValues,
    setValue,
  }

  return (
    <AccountContext.Provider value={contextProps}>
      <div className="min-h-screen bg-brand-gray dark:bg-gray-900 font-inter">
        <div className="h-full px-4 pt-8 pb-5 text-white md:px-6 md:pt-16 bg-top-mobile md:bg-top-desktop md:h-[38rem]">
          <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
            <Toaster />
            <ProfileGeneralInfo />
            <ProfileWallet walletState="signedOut" />
          </div>
        </div>
      </div>
    </AccountContext.Provider>
  )
}

export default Account

Account.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
