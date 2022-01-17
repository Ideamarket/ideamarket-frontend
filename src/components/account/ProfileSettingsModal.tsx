import { useContext, useReducer, useRef, useState } from 'react'
import Modal from '../modals/Modal'
import Image from 'next/image'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { FaRegTrashAlt } from 'react-icons/fa'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { GlobalContext } from 'lib/GlobalContext'
import { useEffect } from 'react'
import {
  sendAccountEmailVerificationCode,
  updateAccount,
  uploadAccountPhoto,
} from 'lib/axios'
import { CircleSpinner } from 'components'

const reducer = (state, action: any) => {
  switch (action.type) {
    case 'reset':
      return {
        ...action.payload,
        visibilityOptions:
          action.payload.visibilityOptions || state.visibilityOptions,
      }
    case 'set-name':
      return { ...state, name: action.payload }
    case 'set-username':
      return { ...state, username: action.payload }
    case 'set-bio':
      return { ...state, bio: action.payload }
    case 'set-email':
      return { ...state, email: action.payload }
    case 'set-walletAddress':
      return { ...state, walletAddress: action.payload }
    case 'set-profilePhoto':
      return { ...state, profilePhoto: action.payload }
    case 'set-bioVisibility':
      return {
        ...state,
        visibilityOptions: {
          ...state.visibilityOptions,
          bio: action.payload,
        },
      }
    case 'set-emailVisibility':
      return {
        ...state,
        visibilityOptions: {
          ...state.visibilityOptions,
          email: action.payload,
        },
      }
    case 'set-ethAddressVisibility':
      return {
        ...state,
        visibilityOptions: {
          ...state.visibilityOptions,
          ethAddress: action.payload,
        },
      }
    default:
      return state
  }
}
const initialState = {
  name: '',
  username: '',
  bio: '',
  email: '',
  walletAddress: '',
  profilePhoto: undefined,
  visibilityOptions: {
    bio: true,
    email: true,
    ethAddress: false,
  },
}

export default function ProfileSettingsModal({ close }: { close: () => void }) {
  const {
    user: currentUser,
    setUser,
    jwtToken,
    signedWalletAddress,
  } = useContext(GlobalContext)
  const [user, dispatch] = useReducer(reducer, initialState)

  const {
    name,
    username,
    bio,
    email,
    walletAddress,
    profilePhoto,
    visibilityOptions,
  } = user

  const [loading, setLoading] = useState<Boolean>(false)
  const [previewImage, setPreviewImage] = useState(undefined)

  useEffect(() => {
    dispatch({ type: 'reset', payload: currentUser })
  }, [currentUser])

  const updateUser = async (requestBody) => {
    try {
      const response = await updateAccount({ requestBody, token: jwtToken })
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.log('Failed to update', error)
    } finally {
    }
  }

  const onSaveChanges = async () => {
    setLoading(true)
    let profilePhoto
    const requestBody = {
      name,
      username,
      email,
      bio,
      visibilityOptions,
      signedWalletAddress,
    }

    if (fileUploadState === '') {
      // removing profile photo
      requestBody['profilePhoto'] = ''
    } else if (fileUploadState) {
      profilePhoto = await uploadProfilePhoto(fileUploadState)
    }

    if (profilePhoto) {
      requestBody['profilePhoto'] = profilePhoto
    }
    await updateUser(requestBody)
    setLoading(false)
  }

  const toggleVisibility = (key: string) => {
    dispatch({ type: `set-${key}Visibility`, payload: !visibilityOptions[key] })
  }

  const inputRef = useRef(null)
  const [fileUploadState, setFileUploadState] = useState(undefined)

  const fileUploadAction = () => inputRef.current.click()
  const fileRemoveAction = () => {
    setFileUploadState('')
    dispatch({
      type: 'set-profilePhoto',
      payload: '',
    })
    setPreviewImage('')
  }
  const fileUploadInputChange = (e) => {
    setFileUploadState(e.target.files[0])
    setPreviewImage(URL.createObjectURL(e.target.files[0]))
  }
  const uploadProfilePhoto = async (fileUploadState) => {
    const formData = new FormData()
    // Update the formData object
    formData.append('profilePhoto', fileUploadState)
    try {
      const response = await uploadAccountPhoto({ formData, token: jwtToken })
      if (response.data?.success && response.data?.data) {
        return response.data.data.profilePhotoUrl.replace(
          `${process.env.NEXT_PUBLIC_USER_ACCOUNTS_CLOUDFRONT_DOMAIN}/`,
          ''
        )
      }
      throw new Error('Failed to Upload')
    } catch (error) {
      console.log('Failed to Upload', error)
      return null
    }
  }

  const verifyEmail = async () => {
    try {
      const response = await sendAccountEmailVerificationCode({
        token: jwtToken,
      })
      if (response.data?.success && response.data?.data) {
        console.log('sent a message')
      } else {
        throw new Error('Failed to send an email')
      }
    } catch (error) {
      console.log('Failed to send an email', error)
      return null
    }
  }

  return (
    <Modal close={close}>
      <div className="p-6 bg-white w-full md:w-[28rem]">
        <div className="flex justify-between items-center">
          <span className="text-2xl text-center text-black text-opacity-90 md:text-3xl font-gilroy-bold">
            Settings
          </span>
          <button
            className="text-base text-white font-medium p-3 bg-brand-blue border-brand-blue rounded-xl flex items-center"
            onClick={onSaveChanges}
          >
            {loading && <CircleSpinner color="#0857e0" />}
            <span className="ml-1">
              {loading ? 'Processing' : 'Save Changes'}
            </span>
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="relative w-32 h-32 rounded-full bg-gray-400 ">
            {Boolean((previewImage && previewImage !== '') || profilePhoto) && (
              <Image
                src={previewImage || profilePhoto}
                alt="Profile image"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            )}
            <input
              type="file"
              hidden
              ref={inputRef}
              onChange={fileUploadInputChange}
            />
            <div
              className="cursor-pointer absolute w-8 h-8 rounded-full shadow-shadow-1 bottom-0 bg-white p-1"
              onClick={fileUploadAction}
            >
              <MdOutlineAddPhotoAlternate className="w-6 h-6" />
            </div>
            <div
              className="cursor-pointer absolute w-8 h-8 rounded-full shadow-shadow-1 bottom-0 right-0 bg-white p-1"
              onClick={fileRemoveAction}
            >
              <FaRegTrashAlt className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="flex flex-col grow ml-5" style={{ flexGrow: 1 }}>
            <div className="flex flex-col w-full">
              <p className="ml-2 text-sm text-black text-opacity-50">
                Username
              </p>
              <input
                className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white"
                value={username}
                onChange={(event) =>
                  dispatch({
                    type: 'set-username',
                    payload: event.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col w-full mt-2">
              <p className="ml-2 text-sm text-black text-opacity-50">Name</p>
              <input
                className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white"
                value={name}
                onChange={(event) =>
                  dispatch({ type: 'set-name', payload: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center my-4">
          <span className="text-sm text-black text-opacity-50">Bio</span>
          <div
            className="ml-auto cursor-pointer flex items-center"
            onClick={() => toggleVisibility('bio')}
          >
            {renderVisibilityToggle(visibilityOptions.bio)}
          </div>
        </div>
        <textarea
          className="pl-2 w-full h-20 leading-tight border rounded appearance-none focus:outline-none focus:bg-white"
          value={bio}
          onChange={(event) =>
            dispatch({ type: 'set-bio', payload: event.target.value })
          }
        />

        <div className="flex items-center my-4">
          <span className="text-sm text-black text-opacity-50">
            Email Address
          </span>
          <div
            className="ml-auto cursor-pointer flex items-center"
            onClick={() => toggleVisibility('email')}
          >
            {renderVisibilityToggle(visibilityOptions.email)}
          </div>
        </div>
        <input
          className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white"
          value={email}
          onChange={(event) =>
            dispatch({ type: 'set-email', payload: event.target.value })
          }
        />
        <button
          className="w-full text-base text-white font-medium p-3 bg-brand-blue border-brand-blue rounded-xl mt-2"
          onClick={verifyEmail}
        >
          Verify Email
        </button>

        <div className="flex items-center my-4">
          <span className="text-sm text-black text-opacity-50">
            ETH Address
          </span>
          <div
            className="ml-auto cursor-pointer flex items-center"
            onClick={() => toggleVisibility('ethAddress')}
          >
            {renderVisibilityToggle(visibilityOptions.ethAddress)}
          </div>
        </div>
        <input
          className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white"
          value={walletAddress}
          onChange={(event) =>
            dispatch({ type: 'set-walletAddress', payload: event.target.value })
          }
          disabled
        />
        <button className="w-full text-base text-white font-medium p-3 bg-brand-blue border-brand-blue rounded-xl mt-2">
          Verify Wallet
        </button>
      </div>
    </Modal>
  )
}

const renderVisibilityToggle = (isVisible: Boolean) => {
  if (isVisible)
    return (
      <>
        <AiOutlineEye className="w-4 h-4 opacity-50" />
        <span className="ml-1 text-sm text-black text-opacity-50 w-8">
          Show
        </span>
      </>
    )
  return (
    <>
      <AiOutlineEyeInvisible className="w-4 h-4 opacity-50" />
      <span className="ml-1 text-sm text-black text-opacity-50 w-8">Hide</span>
    </>
  )
}
